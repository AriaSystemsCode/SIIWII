using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using onetouch.AppEntities;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppItems
{
    public partial class AppItemsAppService
    {
        private static readonly string[] ProductExportColumns =
        {
            "Product Type", "Record Type", "Parent Code", "Code", "Name", "Product Description",
            "Product Classification Code", "Product Classification Description", "Product Category Code",
            "Product Category Description", "Price", "Price Currency Code", "Image Type", "Image Folder Name",
            "COLOR Code", "COLOR Name", "SIZE Code", "SIZE Name", "Size Scale Name", "Scale Sizes Order",
            "Size Ratio Name", "Size Ratio Value", "Material Content", "Sold Out Date", "BrandCode",
            "BrandName", "Start Ship Date", "Dimension 1 sizes", "Dimension 2 sizes", "Dimension 3 sizes",
            "Dimension 1 Name", "Dimension 2 Name", "Dimension 3 Name", "No of Dimensions", "COLOR-HEX",
            "COLOR-IMAGE", "COLOR-SCHEME", "COLOR-NRF", "SIZE MARKET PLACE CODE", "SIZE-NRF",
            "Dimension1Position", "Dimension2Position", "Dimension3Position", "Price A", "Price B", "Price C", "Price D"
        };

        private readonly ITempFileCacheManager _productExportFileCache;

        public async Task<FileDto> ExportItems(long[] selectedItemIds, Guid? sessionSelectionKey = null)
        {
            var tenantId = AbpSession.TenantId;
            var userId = AbpSession.UserId;
            var selectedIds = (selectedItemIds ?? Array.Empty<long>()).Distinct().ToList();
            if (sessionSelectionKey.HasValue)
            {
                selectedIds = await _appItemSelectorRepository.GetAll()
                    .Where(x => x.Key == sessionSelectionKey.Value && x.TenantId == tenantId && x.CreatorUserId == userId)
                    .Select(x => x.SelectedId)
                    .Distinct()
                    .ToListAsync();
            }

            if (selectedIds.Count == 0)
                throw new UserFriendlyException("Select at least one product to export.");

            var tenantItems = _appItemRepository.GetAll().Where(x => x.TenantId == tenantId);
            var selected = tenantItems.Where(x => selectedIds.Contains(x.Id));
            var parentIds = selected.Select(x => x.ParentId ?? x.Id);
            var products = await tenantItems
                .Where(x => parentIds.Contains(x.Id) || (x.ParentId.HasValue && parentIds.Contains(x.ParentId.Value)))
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories).ThenInclude(x => x.EntityObjectCategoryFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications).ThenInclude(x => x.EntityObjectClassificationFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                    .ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.ItemPricesFkList)
                .Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(x => x.AppItemSizeScalesDetails)
                .AsSplitQuery()
                .AsNoTracking()
                .ToListAsync();
            var parents = products.Where(x => !x.ParentId.HasValue).OrderBy(x => x.Code).ThenBy(x => x.Id).ToList();
            if (parents.Count == 0)
                throw new UserFriendlyException("No selected products are available for export.");

            var variants = products.Where(x => x.ParentId.HasValue).ToLookup(x => x.ParentId.Value);
            var currency = (await TenantManager.GetTenantCurrency())?.Code;
            var file = new FileDto("products-export.zip", "application/zip");
            using var output = new MemoryStream();
            using (var archive = new ZipArchive(output, ZipArchiveMode.Create, leaveOpen: true))
            using (var workbook = new XSSFWorkbook())
            {
                archive.CreateEntry("images/");
                var sheet = workbook.CreateSheet("Products");
                WriteProductExportRow(sheet.CreateRow(0), ProductExportColumns);
                var validation = workbook.CreateSheet("Validation Rules");
                WriteProductExportRow(validation.CreateRow(0), "Template columns and validation rules and entries", "Validation Rules", "Valid Entries");
                WriteProductExportRow(validation.CreateRow(1), "Template Version", "Mandatory", "01.00.00");
                workbook.CreateSheet("Valid Entries");
                var imageNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var product in parents)
                {
                    WriteProductExportItem(sheet, archive, imageNames, product, null, currency);
                    foreach (var variant in variants[product.Id].OrderBy(x => x.Code).ThenBy(x => x.Id))
                        WriteProductExportItem(sheet, archive, imageNames, variant, product, currency);
                }

                var colors = products.SelectMany(x => x.EntityFk.EntityExtraData)
                    .Where(x => x.EntityObjectTypeCode == "COLOR" && x.AttributeValueFk != null)
                    .Select(x => x.AttributeValueFk)
                    .DistinctBy(x => x.Id)
                    .OrderBy(x => x.Code)
                    .ThenBy(x => x.Id);
                foreach (var color in colors)
                {
                    var names = AddProductExportImages(archive, imageNames, color, "C-", color.Code);
                    if (names.Count == 0)
                        continue;

                    var values = new object[ProductExportColumns.Length];
                    values[1] = "Color";
                    values[3] = color.Code;
                    values[4] = color.Name;
                    values[12] = "Image";
                    values[13] = "images";
                    values[14] = color.Code;
                    values[15] = color.Name;
                    values[35] = string.Join("|", names);
                    WriteProductExportRow(sheet.CreateRow(sheet.LastRowNum + 1), values);
                }

                using var workbookStream = new MemoryStream();
                workbook.Write(workbookStream);
                using var workbookEntry = archive.CreateEntry("Products.xlsx").Open();
                var workbookBytes = workbookStream.ToArray();
                workbookEntry.Write(workbookBytes, 0, workbookBytes.Length);
            }

            _productExportFileCache.SetFile(file.FileToken, output.ToArray());
            return file;
        }

        private void WriteProductExportItem(ISheet sheet, ZipArchive archive, HashSet<string> usedNames,
            AppItem item, AppItem parent, string currency)
        {
            var entity = item.EntityFk;
            var attributes = entity.EntityExtraData.OrderBy(x => x.Id).ToLookup(
                x => x.EntityObjectTypeCode ?? x.AttributeCode ?? "", StringComparer.OrdinalIgnoreCase);
            string AttributeCode(string code) => string.Join("|", attributes[code]
                .Select(x => x.AttributeValueFk?.Code ?? x.AttributeCode ?? x.AttributeValue).Where(x => !string.IsNullOrEmpty(x)));
            string AttributeName(string code) => string.Join("|", attributes[code]
                .Select(x => x.AttributeValueFk?.Name ?? x.AttributeValue).Where(x => !string.IsNullOrEmpty(x)));
            var category = entity.EntityCategories.OrderBy(x => x.Id).FirstOrDefault()?.EntityObjectCategoryFk;
            var classification = entity.EntityClassifications.OrderBy(x => x.Id).FirstOrDefault()?.EntityObjectClassificationFk;
            var prices = item.ItemPricesFkList.OrderBy(x => x.Id).ToLookup(x => x.Code, StringComparer.OrdinalIgnoreCase);
            var scale = (parent ?? item).ItemSizeScaleHeadersFkList.Where(x => x.ParentId == null).OrderBy(x => x.Id).FirstOrDefault();
            var sizes = scale?.AppItemSizeScalesDetails.OrderBy(x => x.Id).ToList();
            var size = sizes?.FirstOrDefault(x => x.SizeCode == AttributeCode("SIZE"));
            string DimensionSizes(string name) => name == null || sizes == null ? null :
                string.Join("|", sizes.Where(x => x.DimensionName == name).Select(x => x.SizeCode));
            var imageNames = AddProductExportImages(archive, usedNames, entity, parent == null ? "I-" : "V-", item.Code);

            WriteProductExportRow(sheet.CreateRow(sheet.LastRowNum + 1),
                entity.EntityObjectTypeFk?.Code ?? entity.EntityObjectTypeCode, parent == null ? "Item" : "Item Variant",
                parent?.Code, item.Code, item.Name, item.Description,
                classification?.Code, classification?.Name, category?.Code, category?.Name,
                item.Price, prices["MSRP"].FirstOrDefault()?.CurrencyCode ?? currency,
                imageNames.Count == 0 ? null : "Image", imageNames.Count == 0 ? null : "images",
                AttributeCode("COLOR"), AttributeName("COLOR"), AttributeCode("SIZE"), AttributeName("SIZE"),
                parent == null ? scale?.SizeScaleName : null,
                parent == null && sizes != null ? string.Join("|", sizes.Select(x => x.SizeCode)) : null,
                AttributeName("SIZE-RATIO"), parent == null && sizes != null ? string.Join("|", sizes.Select(x => x.SizeRatio)) : null,
                AttributeName("MATERIAL-CONTENT"), AttributeName("SOLD-OUT-DATE"), AttributeCode("BRAND"),
                AttributeName("BRAND"), AttributeName("START-SHIP-DATE"),
                parent == null ? DimensionSizes(scale?.Dimesion1Name) : null,
                parent == null ? DimensionSizes(scale?.Dimesion2Name) : null,
                parent == null ? DimensionSizes(scale?.Dimesion3Name) : null,
                parent == null ? scale?.Dimesion1Name : null, parent == null ? scale?.Dimesion2Name : null,
                parent == null ? scale?.Dimesion3Name : null, parent == null ? scale?.NoOfDimensions : null,
                AttributeName("COLOR-HEX"), string.Join("|", imageNames), AttributeName("COLOR-SCHEME"),
                AttributeName("COLOR-NRF"), AttributeName("SIZEMARKETPLACECODE"), AttributeName("SIZE-NRF"),
                parent == null ? null : size?.D1Position, parent == null ? null : size?.D2Position,
                parent == null ? null : size?.D3Position, prices["A"].FirstOrDefault()?.Price,
                prices["B"].FirstOrDefault()?.Price, prices["C"].FirstOrDefault()?.Price, prices["D"].FirstOrDefault()?.Price);
        }

        private List<string> AddProductExportImages(ZipArchive archive, HashSet<string> usedNames, AppEntity entity,
            string prefix, string code)
        {
            var names = new List<string>();
            if (entity.EntityAttachments == null)
                return names;

            foreach (var attachment in entity.EntityAttachments.OrderByDescending(x => x.IsDefault).ThenBy(x => x.Id))
            {
                var storedName = attachment.AttachmentFk?.Attachment;
                if (string.IsNullOrWhiteSpace(storedName) || storedName != Path.GetFileName(storedName))
                    continue;
                var extension = Path.GetExtension(storedName).ToLowerInvariant();
                // JFIF is JPEG data. Use the standard JPEG extension for import.
                if (extension == ".jfif")
                    extension = ".jpg";
                if (extension != ".jpg" && extension != ".jpeg" && extension != ".png" &&
                    extension != ".gif" && extension != ".webp" && extension != ".bmp" &&
                    extension != ".tif" && extension != ".tiff" && extension != ".svg")
                    continue;

                using var source = OpenProductExportImage(storedName, attachment.AttachmentFk.TenantId, entity.TenantId);
                if (source == null)
                {
                    Logger.Warn($"Skipping missing export image for code {code}, attachment {attachment.AttachmentId}.");
                    continue;
                }

                var stem = prefix + code.TrimEnd();
                if (stem.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0 || stem.Contains("/") || stem.Contains("\\"))
                    throw new UserFriendlyException($"Code {code} cannot be used in an image filename.");
                var name = stem + extension;
                for (var suffix = 2; !usedNames.Add(name); suffix++)
                    name = $"{stem}-{suffix}{extension}";

                using var destination = archive.CreateEntry("images/" + name).Open();
                source.CopyTo(destination);
                names.Add(name);
            }
            return names;
        }

        private FileStream OpenProductExportImage(string storedName, int? attachmentTenantId, int? entityTenantId)
        {
            var root = _appConfiguration["Attachment:Path"];
            var tenantFolders = new[] { attachmentTenantId ?? entityTenantId, attachmentTenantId, entityTenantId }.Distinct();
            foreach (var tenantId in tenantFolders)
            {
                var path = Path.Combine(root, tenantId?.ToString() ?? "-1", storedName);
                try
                {
                    return File.OpenRead(path);
                }
                catch (FileNotFoundException)
                {
                    // The attachment may be stored under the entity's tenant.
                }
                catch (DirectoryNotFoundException)
                {
                    // Try the next configured tenant folder.
                }
            }

            return null;
        }

        private static void WriteProductExportRow(IRow row, params object[] values)
        {
            for (var i = 0; i < values.Length; i++)
            {
                switch (values[i])
                {
                    case decimal amount:
                        row.CreateCell(i).SetCellValue((double)amount);
                        break;
                    case int number:
                        row.CreateCell(i).SetCellValue(number);
                        break;
                    case string text when text.Length > 0:
                        row.CreateCell(i).SetCellValue(text);
                        break;
                }
            }
        }
    }
}
