using onetouch.Globals.Dtos;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Collections.Extensions;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Abp.Linq.Extensions;
using Abp.UI;
using AutoMapper;
using Bytescout.Spreadsheet;
using Humanizer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NPOI.OpenXmlFormats.Wordprocessing;
using NPOI.SS.Formula.Functions;
using NUglify.Helpers;
using onetouch.AccountInfos.Dtos;
using onetouch.AppContacts;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.AppItems.Dtos;
using onetouch.AppItems.Exporting;
using onetouch.AppItemSelectors;
using onetouch.AppItemsLists;
using onetouch.AppSizeScales;
using onetouch.AppSizeScales.Dtos;
using onetouch.Authorization;
using onetouch.Common;
using onetouch.Configuration;
using onetouch.Dto;
using onetouch.EntityFrameworkCore;
using onetouch.Globals;
using onetouch.Globals.Dtos;
using onetouch.Helpers;
using onetouch.Notifications;
using onetouch.Sessions;
using onetouch.Sessions.Dto;
using onetouch.SycCounters;
using onetouch.SycIdentifierDefinitions;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using onetouch.SystemObjects;
using onetouch.SystemObjects.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using System.Timers;
using System.Xml.Serialization;
//using Z.EntityFramework.Plus;
using ExtraAttribute = onetouch.AppItems.Dtos.ExtraAttribute;
using onetouch.AppMarketplaceItems;
using Z.EntityFramework.Plus;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using onetouch.AppMarketplaceItemLists;
using Abp.Extensions;
using onetouch.Attachments;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Org.BouncyCastle.Utilities.Encoders;
using onetouch.AppSiiwiiTransaction;
using NPOI.HPSF;
using NPOI.POIFS.NIO;
using System.Dynamic;
using NPOI.OpenXmlFormats.Vml;
using onetouch.AppSubScriptionPlan;
using onetouch.Accounts.Dtos;
using System.Management.Automation.Language;
using Microsoft.AspNetCore.Http;
using PayPalCheckoutSdk.Orders;
using NPOI.HSSF.Util;
using Abp.AspNetZeroCore.Timing;
using onetouch.Migrations;

namespace onetouch.AppItems
{
    [AbpAuthorize(AppPermissions.Pages_AppItems)]
    public partial class AppItemsAppService : onetouchAppServiceBase, IAppItemsAppService, IAppItemsAppImportService, IExcelImporter<AppItemExcelResultsDTO>
    {

        public async Task<ExcelTemplateDto> GetImportVideo()
        {
            ExcelTemplateDto itemExcelTemplateDto = new ExcelTemplateDto();
            itemExcelTemplateDto.ExcelTemplatePath = "";
            try
            {

                string directory = _appConfiguration[$"Templates:ImportVideo"];
                if (!System.IO.Directory.Exists(directory))
                { System.IO.Directory.CreateDirectory(directory); }

                #region get new file name
                string templateFileName = _appConfiguration[$"Templates:ImportVideoAssets"];
                string newFileName = Path.GetFileName(templateFileName);
                #endregion get new file name

                string newFilePath = directory + @"\" + newFileName;
                if (!System.IO.File.Exists(newFilePath))
                {
                    System.IO.File.Copy(System.IO.Directory.GetCurrentDirectory() + _appConfiguration[$"Templates:ImportVideoAssets"], newFilePath);
                }

                itemExcelTemplateDto.ExcelTemplatePath = directory.Replace(_appConfiguration[$"ItemTemplates:ExcelTemplateOmitt"], "").Replace(@"\", "/");
                itemExcelTemplateDto.ExcelTemplateFile = newFileName;
                itemExcelTemplateDto.ExcelTemplateFullPath = itemExcelTemplateDto.ExcelTemplatePath + @"/" + itemExcelTemplateDto.ExcelTemplateFile;


            }
            catch (Exception ex)
            {
                string xx = ex.Message;
            }

            return itemExcelTemplateDto;
        }
        public async Task<PagedResultDto<LookupItems>> GetAllLookUp(GetAllAppItemsInput input)
        {
            //var GetAllRet = await GetAll(input);
            //List<LookupAccountOrTenantDto> lookupAccountOrTenantDtoList = new List<LookupAccountOrTenantDto>();
            ////foreach (var x in GetAllRet.Items)
            ////{
            ////    lookupAccountOrTenantDtoList.Add(new LookupAccountOrTenantDto { DisplayName = x.AppItem.Code, Id = x.AppItem.Id });

            ////}
            //lookupAccountOrTenantDtoList = (from d in GetAllRet.Items
            //        join m in _appItemRepository.GetAll().Where(a => a.TenantOwner == AbpSession.TenantId)
            //                              on d.AppItem.Id equals m.Id into j1
            //        from j2 in j1
            //        select new LookupAccountOrTenantDto { DisplayName = j2.Code, Id = j2.EntityId }).ToList();


            //return new PagedResultDto<LookupAccountOrTenantDto>(
            //       GetAllRet.TotalCount,
            //       lookupAccountOrTenantDtoList
            //   );
            var GetAllRet = _appItemRepository.GetAll()
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter))
                .Where(a => a.TenantId == AbpSession.TenantId && a.ParentId == null);
            var GetAllRetItems = GetAllRet.OrderBy(input.Sorting ?? "id asc").PageBy(input);
            var totalCount = await GetAllRet.CountAsync();
            List<LookupItems> lookupAccountOrTenantDtoList = new List<LookupItems>();
            lookupAccountOrTenantDtoList = GetAllRetItems.Select(e => new LookupItems() { DisplayName = e.Code, Id = e.EntityId.ToString() }).ToList();

            return new PagedResultDto<LookupItems>(
                   totalCount,
                   lookupAccountOrTenantDtoList
               );

        }
        public async Task<PagedResultDto<LookupItems>> GetAllLookUpWithColors(GetAllAppItemsInput input)
        {
            var tenantId = AbpSession.TenantId ?? -1;

            // Base query with minimal joins and only required fields
            var query =
                from item in _appItemRepository.GetAll()
                where item.ParentId != null
                      && item.TenantId == tenantId
                      && !item.IsDeleted
                      && (string.IsNullOrEmpty(input.Filter) ||
                          item.Name.Contains(input.Filter) ||
                          item.Code.Contains(input.Filter))
                join parent in _appItemRepository.GetAll() on item.ParentId equals parent.Id
                join extra in _appEntityExtraDataRepository.GetAll()
                     on item.EntityId equals extra.EntityId
                where extra.EntityObjectTypeId == 16
                select new
                {
                    item.EntityId,
                    Code = parent.Code + "-" + extra.AttributeValue
                };

            // Group in DB
            var groupedQuery =
                from x in query
                group x by x.Code into g
                select new
                {
                    Code = g.Key,
                    IdList = string.Join(",", g.Select(x => x.EntityId))
                };

            // Total count before paging
            var totalCount = await groupedQuery.CountAsync();

            // Paging in DB
            var pagedData = await groupedQuery
                .OrderBy(input.Sorting ?? "Code asc") // dynamic sorting
                .PageBy(input) // ABP's paging extension
                .ToListAsync();

            // Map to DTO
            var result = pagedData
                .Select(e => new LookupItems
                {
                    DisplayName = e.Code,
                    Id = e.IdList
                })
                .ToList();

            return new PagedResultDto<LookupItems>(totalCount, result);
        }

        public async Task<PagedResultDto<LookupItems>> GetAllColorsLookUp(GetAllAppEntitiesInput input)
        {
            input.EntityObjectTypeId = 16;
            //var itemObjectId = await _helper.SystemTables.GetObjectItemId();

            var GetAllRet = await _appEntitiesAppService.GetAll(input);

            List<LookupItems> lookupAccountOrTenantDtoList = new List<LookupItems>();
            foreach (var x in GetAllRet.Items)
            {
                lookupAccountOrTenantDtoList.Add(new LookupItems { DisplayName = x.AppEntity.Code, Id = x.AppEntity.Id.ToString() });

            }
            return new PagedResultDto<LookupItems>(
                   GetAllRet.TotalCount,
                   lookupAccountOrTenantDtoList
               );

        }

        public async Task<PagedResultDto<LookupItems>> GetAllLookUpWithColors2(GetAllAppItemsInput input)
        {
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            var GetAllRet = _appItemRepository
                            .GetAll()
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter))
                            .Where(item => item.ParentId != null && item.TenantId == tenantId && item.IsDeleted == false)
                            .Include(item => item.ParentFk)
                            .Include(item => item.EntityFk.EntityExtraData)
                            .Select(item => new
                            {
                                item.EntityId,
                                Code = item.ParentFk.Code + "-" + item.EntityFk.EntityExtraData
                                    .Where(extra => extra.EntityObjectTypeId == 16)
                                    .Select(extra => extra.AttributeValue)
                                    .FirstOrDefault() // assuming only one per item
                            })
                            .Where(x => x.Code != null) // only those with matching extra data
                            .GroupBy(x => x.Code)
                            .Select(g => new
                            {
                                Code = g.Key,
                                IdList = string.Join(",", g.Select(x => x.EntityId))
                            });


            var GetAllRetItems = GetAllRet.OrderBy(input.Sorting ?? "Code asc").PageBy(input);

            List<LookupItems> lookupAccountOrTenantDtoList = new List<LookupItems>();
            lookupAccountOrTenantDtoList = GetAllRetItems.Select(e => new LookupItems() { DisplayName = e.Code, Id = e.IdList }).ToList();
            var totalCount = await GetAllRet.CountAsync();
            return new PagedResultDto<LookupItems>(
                   totalCount,
                   lookupAccountOrTenantDtoList
               );

        }

        public async Task<AppItemtExcelRecordDTO> GetAppItemForEditData(string input, AppItemtExcelRecordDTO appItemtExcelRecordDTO)
        {
            var appItemId = _appItemRepository.GetAll().Where(e => e.EntityId == Int32.Parse(input)).FirstOrDefault();
            var xInput = new GetAppItemWithPagedAttributesForEditInput() { ItemId = appItemId.Id };
            var y = await GetAppItemForEdit(xInput);
            appItemtExcelRecordDTO.Name = y.AppItem.Name;
            appItemtExcelRecordDTO.ExcelDto.Price = y.AppItem.Price.ToString();
            appItemtExcelRecordDTO.ExcelDto.ProductDescription = y.AppItem.Description;

            if (y.AppItem.AppItemPriceInfos.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.Currency = y.AppItem.AppItemPriceInfos[0].CurrencyCode;
            }
            if (y.AppItem.AppItemSizesScaleInfo.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.SizeScaleName = y.AppItem.AppItemSizesScaleInfo[0].Code;

            }
            if (y.AppItem.VariationItems.Count > 0)
            {
                var attributeValuesString = string.Join("|",
                    y.AppItem.VariationItems
                        .SelectMany(item => item.EntityExtraData)
                        .Where(data => data.EntityObjectTypeId == 16 && data.EntityObjectTypeCode == "COLOR")
                        .Select(data => data.AttributeValue)
                        .Where(value => !string.IsNullOrWhiteSpace(value)).Distinct()
                    );

                appItemtExcelRecordDTO.ExcelDto.ColorCode = attributeValuesString;
            }
            if (y.AppItem.VariationItems.Count > 0)
            {
                var attributeValuesString = string.Join(",",
                    y.AppItem.VariationItems
                        .SelectMany(item => item.EntityExtraData)
                        .Where(data => data.EntityObjectTypeId == 18 && data.EntityObjectTypeCode == "SIZE")
                        .Select(data => data.AttributeValue)
                        .Where(value => !string.IsNullOrWhiteSpace(value)).Distinct()
                    );

                appItemtExcelRecordDTO.ExcelDto.SizeScaleOrder = attributeValuesString;
            }
            if (y.AppItem.EntityExtraData.Count > 0)
            {
                var result = y.AppItem.EntityExtraData
                    .Where(x => x.AttributeId == 662 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                    .Select(x => x.AttributeValue)
                    .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.MaterialContent = result;

                var BrandName = y.AppItem.EntityExtraData
                   .Where(x => x.EntityId == 86 && x.EntityObjectTypeId == 108 && !string.IsNullOrWhiteSpace(x.AttributeValueFkName))
                   .Select(x => x.AttributeValueFkName)
                   .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.BrandName = BrandName;

                var BrandCode = y.AppItem.EntityExtraData
                 .Where(x => x.EntityId == 86 && x.EntityObjectTypeId == 108 && !string.IsNullOrWhiteSpace(x.AttributeValueFkName))
                 .Select(x => x.AttributeValueFkName)
                 .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.BrancdCode = BrandCode;

                var SoldOut = y.AppItem.EntityExtraData
                 .Where(x => x.AttributeId == 661 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                 .Select(x => x.AttributeValue)
                 .FirstOrDefault();
                if (DateOnly.TryParse(SoldOut, out DateOnly date))
                {
                    appItemtExcelRecordDTO.ExcelDto.SoldOutDate = date;
                }

                var StartShipDate = y.AppItem.EntityExtraData
                 .Where(x => x.AttributeId == 660 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                 .Select(x => x.AttributeValue)
                 .FirstOrDefault();
                if (DateOnly.TryParse(StartShipDate, out DateOnly StartShipDateOut))
                {
                    appItemtExcelRecordDTO.ExcelDto.SoldOutDate = StartShipDateOut;
                }


            }
            if (y.AppItem.EntityClassifications.Items.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.ProductClassificationCode = y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationCode;
                appItemtExcelRecordDTO.ExcelDto.EntityObjectClassificaionID = y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationId;
                appItemtExcelRecordDTO.ExcelDto.ProductClassificationDescription = y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationName;
            }

            if (y.AppItem.EntityCategories.Items.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.EntityObjectCategoryID = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryId;
                appItemtExcelRecordDTO.ExcelDto.ProductCategoryCode = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryCode;
                appItemtExcelRecordDTO.ExcelDto.ProductCategoryDescription = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryName;
            }


            appItemtExcelRecordDTO.ExcelDto.PriceA = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                        ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "A")?.Price.ToString()
                        : null;
            appItemtExcelRecordDTO.ExcelDto.PriceB = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "B")?.Price.ToString()
                      : null;
            appItemtExcelRecordDTO.ExcelDto.PriceC = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "C")?.Price.ToString()
                      : null;
            appItemtExcelRecordDTO.ExcelDto.PriceD = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "D")?.Price.ToString()
                      : null;

            return appItemtExcelRecordDTO;
        }

        public async Task<List<LookupAccountOrTenantDto>> GetWithColors(long input)
        {
            var xInput = new GetAppItemWithPagedAttributesForEditInput() { ItemId = input };
            var y = await GetAppItemForEdit(xInput);
            var result = y.AppItem.VariationItems
                    .SelectMany(variationItem =>
                        variationItem.EntityExtraData
                        .Where(data =>
                                data.EntityObjectTypeId == 16 &&
                                data.EntityObjectTypeCode == "COLOR" &&
                                data.AttributeId == 101 // <-- Add your target AttributeId here
                        )
                        .Select(data => new LookupAccountOrTenantDto
                        {
                            Id = variationItem.Id,
                            DisplayName = data.AttributeCode
                        })
                        ).ToList();


            return result;
        }

        public async Task<AppItemtExcelRecordDTO> GetAppItemColorForEditData(string input, AppItemtExcelRecordDTO appItemtExcelRecordDTO)
        {
            var longinput = input.Split(',');
            var appItemId = _appItemRepository.GetAll().Where(e => e.EntityId == Int32.Parse(longinput[0])).FirstOrDefault();
            var xInput = new GetAppItemWithPagedAttributesForEditInput() { ItemId = ((long)appItemId.ParentId) };
            var y = await GetAppItemForEdit(xInput);
            appItemtExcelRecordDTO.Name = y.AppItem.Name;
            appItemtExcelRecordDTO.ExcelDto.Price = y.AppItem.Price.ToString();
            appItemtExcelRecordDTO.ExcelDto.ProductDescription = y.AppItem.Description;

            if (y.AppItem.AppItemPriceInfos.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.Currency = y.AppItem.AppItemPriceInfos[0].CurrencyCode;
            }
            if (y.AppItem.AppItemSizesScaleInfo.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.SizeScaleName = y.AppItem.AppItemSizesScaleInfo[0].Code;

            }
            if (y.AppItem.VariationItems.Count > 0)
            {
                var attributeValuesString = string.Join(",",
                    y.AppItem.VariationItems
                        .SelectMany(item => item.EntityExtraData)
                        .Where(data => data.EntityObjectTypeId == 18 && data.EntityObjectTypeCode == "SIZE")
                        .Select(data => data.AttributeValue)
                        .Where(value => !string.IsNullOrWhiteSpace(value))
                    );

                appItemtExcelRecordDTO.ExcelDto.SizeScaleOrder = attributeValuesString;
            }
            if (y.AppItem.EntityExtraData.Count > 0)
            {
                var result = y.AppItem.EntityExtraData
                    .Where(x => x.AttributeId == 662 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                    .Select(x => x.AttributeValue)
                    .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.MaterialContent = result;

                var BrandName = y.AppItem.EntityExtraData
                   .Where(x => x.EntityId == 86 && x.EntityObjectTypeId == 108 && !string.IsNullOrWhiteSpace(x.AttributeValueFkName))
                   .Select(x => x.AttributeValueFkName)
                   .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.BrandName = BrandName;

                var BrandCode = y.AppItem.EntityExtraData
                 .Where(x => x.EntityId == 86 && x.EntityObjectTypeId == 108 && !string.IsNullOrWhiteSpace(x.AttributeValueFkName))
                 .Select(x => x.AttributeValueFkName)
                 .FirstOrDefault();
                appItemtExcelRecordDTO.ExcelDto.BrancdCode = BrandCode;

                var SoldOut = y.AppItem.EntityExtraData
                 .Where(x => x.AttributeId == 661 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                 .Select(x => x.AttributeValue)
                 .FirstOrDefault();
                if (DateOnly.TryParse(SoldOut, out DateOnly date))
                {
                    appItemtExcelRecordDTO.ExcelDto.SoldOutDate = date;
                }

                var StartShipDate = y.AppItem.EntityExtraData
                 .Where(x => x.AttributeId == 660 && !string.IsNullOrWhiteSpace(x.AttributeValue))
                 .Select(x => x.AttributeValue)
                 .FirstOrDefault();
                if (DateOnly.TryParse(StartShipDate, out DateOnly StartShipDateOut))
                {
                    appItemtExcelRecordDTO.ExcelDto.SoldOutDate = StartShipDateOut;
                }


            }
            if (y.AppItem.EntityClassifications.Items.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.ProductClassificationCode = y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationCode;
                appItemtExcelRecordDTO.ExcelDto.EntityObjectClassificaionID = y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationId;
                appItemtExcelRecordDTO.ExcelDto.ProductClassificationDescription = y.AppItem.EntityClassifications.Items[0].EntityObjectClassificationName;
            }

            if (y.AppItem.EntityCategories.Items.Count > 0)
            {
                appItemtExcelRecordDTO.ExcelDto.EntityObjectCategoryID = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryId;
                appItemtExcelRecordDTO.ExcelDto.ProductCategoryCode = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryCode;
                appItemtExcelRecordDTO.ExcelDto.ProductCategoryDescription = y.AppItem.EntityCategories.Items[0].EntityObjectCategoryName;
            }


            appItemtExcelRecordDTO.ExcelDto.PriceA = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                        ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "A")?.Price.ToString()
                        : null;
            appItemtExcelRecordDTO.ExcelDto.PriceB = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "B")?.Price.ToString()
                      : null;
            appItemtExcelRecordDTO.ExcelDto.PriceC = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "C")?.Price.ToString()
                      : null;
            appItemtExcelRecordDTO.ExcelDto.PriceD = y.AppItem.AppItemPriceInfos != null && y.AppItem.AppItemPriceInfos.Any()
                      ? y.AppItem.AppItemPriceInfos.FirstOrDefault(p => p.Code == "D")?.Price.ToString()
                      : null;
            appItemtExcelRecordDTO.ParentCode = y.AppItem.Code;
            appItemtExcelRecordDTO.ExcelDto.ParentCode = y.AppItem.Code;
            return appItemtExcelRecordDTO;
        }

        /* 
         7- when click final import >> create new API saveFromExcelImages, to [4H] 

         7.2 update exisitng item with new added imge 

         >> create new function save only rows of type images to parent items ( input id) 

         call getItemforEdit(id) >> GetAppItemForEditOutput 

         convert from GetAppItemForEditOutput.AppItemForEditDto to AppItem 

         convert from AppItem to CreateOrEditAppItemDto 

         update attachments array with the new linked image 

         Call CreateOrEditAppItemDto  
         
         */

        public async Task<long> SaveImageToItem(long input, AppItemtExcelRecordDTO appItemtExcelRecordDTO)
        {
            var xInput = new GetAppItemWithPagedAttributesForEditInput() { ItemId = input };
            var y = await GetAppItemForEdit(xInput);
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\";
            // add the image to the parent
            foreach (var item1 in y.AppItem.EntityAttachments)
            {
                item1.IsDefault = false;

            }
            if (string.IsNullOrEmpty(appItemtExcelRecordDTO.ExcelDto.Images[0].ImageGuid))
            {
                appItemtExcelRecordDTO.ExcelDto.Images[0].ImageGuid = Guid.NewGuid().ToString();
            }
            if (y.AppItem.EntityAttachments.Count == 0) { y.AppItem.EntityAttachments = new List<AppEntityAttachmentDto>(); }
            var z = new AppEntityAttachmentDto
            {
                IsDefault = appItemtExcelRecordDTO.ExcelDto.ImageIsDefault,
                AttachmentCategoryEnum = 0,
                AttachmentCategoryId = 3,
                FileName = appItemtExcelRecordDTO.ExcelDto.Images[0].ImageFileName,
                guid = appItemtExcelRecordDTO.ExcelDto.Images[0].ImageGuid,
                Index = y.AppItem.EntityAttachments.Count
            };



            // rename image at temp attachment folder with guid and keep image name in variable
            // copy it to attachment folder
            // add record attachments tables
            // add record to appitem entity attachements




            if (!System.IO.Directory.Exists(path))
            {
                System.IO.Directory.CreateDirectory(path);
            }

            try
            {
                System.IO.File.Copy(path + @"\" + appItemtExcelRecordDTO.ExcelDto.Images[0].ImageFileName, path + @"\" + z.guid + "." + appItemtExcelRecordDTO.ExcelDto.Images[0].ImageFileName.Split('.')[1], true);

            }
            catch { }



            y.AppItem.EntityAttachments.Add(z);



            var item = new GetAppItemForEditOutput { AppItem = ObjectMapper.Map<AppItemForEditDto>(y.AppItem) };
            CreateOrEditAppItemDto itemUpdate = ObjectMapper.Map<CreateOrEditAppItemDto>(item);

            var x = await DoCreateOrEdit(itemUpdate);


            return x;
        }
        public bool RenameFileToGuid(string fileName, string guid)
        {
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;

            var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId.ToString();

            if (!System.IO.Directory.Exists(path))
            {
                System.IO.Directory.CreateDirectory(path);
            }

            try
            {
                System.IO.File.Copy(path + @"\" + fileName, path + @"\" + guid + "." + fileName.Split('.')[1], true);

            }
            catch { }
            return true;
        }
        public async Task<long> SaveImageToColor(string colorEntityId, AppItemtExcelRecordDTO appItemtExcelRecordDTO)
        {
            string tempId = colorEntityId;
            long saveEntity = 0;
            
            #region create color lookup
            if ((string.IsNullOrEmpty(colorEntityId) || colorEntityId == "0" || colorEntityId == "-") &&
                (string.IsNullOrEmpty(appItemtExcelRecordDTO.ExcelDto.Actions) || appItemtExcelRecordDTO.ExcelDto.Actions == "7" || appItemtExcelRecordDTO.ExcelDto.Actions == "10"))
            {
                var codeExist = _appEntityRepository.GetAll().FirstOrDefaultAsync(x =>
                x.Code == appItemtExcelRecordDTO.ExcelDto.ColorCode && x.EntityObjectTypeId == 16
                && (x.TenantId == null || x.TenantId == AbpSession.TenantId)).Result;

                if (codeExist == null)
                {
                    var colorEntity = new AppEntityDto();
                    colorEntity.Name = appItemtExcelRecordDTO.ExcelDto.ColorName;
                    colorEntity.Code = appItemtExcelRecordDTO.ExcelDto.ColorCode;
                    colorEntity.EntityObjectTypeId = 16;
                    var itemObjectId = _helper.SystemTables.GetObjectLookupId().Result;
                    colorEntity.ObjectId = itemObjectId;

                    var returnColorEntityCreation = _appEntitiesAppService.SaveEntity(colorEntity).Result;
                    tempId = returnColorEntityCreation.ToString();
                }
                else { tempId = codeExist.Id.ToString(); 
                   
                }

            }
            #endregion create color lookup
            if (!string.IsNullOrEmpty(appItemtExcelRecordDTO.image))
            {
                var entityDto = new EntityDto<long>() { Id = Int32.Parse(tempId) };
                var color = _appEntitiesAppService.GetAppEntityForEdit(entityDto).Result;

                var appEntity = ObjectMapper.Map<AppEntity>(color.AppEntity);
                appEntity.Code = color.AppEntity.Code;
                var appEntityDto = ObjectMapper.Map<AppEntityDto>(appEntity);

                var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
                var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId.ToString();

                if (appEntityDto.EntityAttachments.Count == 0) { appEntityDto.EntityAttachments = new List<AppEntityAttachmentDto>(); }
                var appEntityAttachmentDto = new AppEntityAttachmentDto
                {
                    IsDefault = appItemtExcelRecordDTO.ExcelDto.ImageIsDefault,
                    AttachmentCategoryEnum = 0,
                    AttachmentCategoryId = 3,
                    FileName = Path.GetFileName(appItemtExcelRecordDTO.ExcelDto.ImagePreview),
                    guid = Path.GetFileNameWithoutExtension(appItemtExcelRecordDTO.image),
                    Index = appEntityDto.EntityAttachments.Count
                };
                if (appItemtExcelRecordDTO.ExcelDto.Actions == "3")
                {
                    appEntityAttachmentDto.Attributes = "101=" + appEntity.Code.Split('-')[1];
                }
                if (appItemtExcelRecordDTO.ExcelDto.Actions == "9" || appItemtExcelRecordDTO.ExcelDto.Actions == "6")
                {
                    appEntityAttachmentDto.Attributes = "101=" + appItemtExcelRecordDTO.ExcelDto.Code.Split('-')[1];
                }

                // rename image at temp attachment folder with guid and keep image name in variable
                // copy it to attachment folder
                // add record attachments tables
                // add record to appitem entity attachements

                //if (!System.IO.Directory.Exists(path))
                //{
                //    System.IO.Directory.CreateDirectory(path);
                //}

                //try
                //{
                //     System.IO.File.Copy(path + @"\" + appEntityAttachmentDto.FileName, path + @"\" + appEntityAttachmentDto.guid + "." + appEntityAttachmentDto.FileName.Split('.')[1], true);

                //}
                //catch { }


                appEntityDto.EntityAttachments = color.AppEntity.EntityAttachments;

                if (appItemtExcelRecordDTO.ExcelDto.Actions == "4")
                {
                    await _appEntityAttachmentRepository.DeleteAsync(
                    x => x.EntityId == appEntityDto.Id
                    );
                    appEntityDto.EntityAttachments = new List<AppEntityAttachmentDto>();
                }

                if (appEntityAttachmentDto.IsDefault)
                {
                    foreach (var item1 in appEntityDto.EntityAttachments)
                    {
                        item1.IsDefault = false;

                    }
                }
                appEntityDto.TenantId = tenantId;
                appEntityDto.EntityAttachments.Add(appEntityAttachmentDto);
                appEntityDto.TimeStamp = DateTime.Now;

                saveEntity = _appEntitiesAppService.SaveEntity(appEntityDto).Result;
            }
            return saveEntity;
        }

        public async Task<long> SaveImageToItemColor(long input, AppItemtExcelRecordDTO appItemtExcelRecordDTO)
        {
            var xInput = new GetAppItemWithPagedAttributesForEditInput() { ItemId = input };
            var y = await GetAppItemForEdit(xInput);
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\";
            // add the image to the parent
            foreach (var item1 in y.AppItem.EntityAttachments)
            {
                item1.IsDefault = false;

            }
            if (y.AppItem.EntityAttachments.Count == 0) { y.AppItem.EntityAttachments = new List<AppEntityAttachmentDto>(); }
            var z = new AppEntityAttachmentDto { IsDefault = appItemtExcelRecordDTO.ExcelDto.ImageIsDefault, AttachmentCategoryEnum = 0, AttachmentCategoryId = 3, FileName = appItemtExcelRecordDTO.ExcelDto.Images[0].ImageFileName, guid = appItemtExcelRecordDTO.ExcelDto.Images[0].ImageGuid, Index = y.AppItem.EntityAttachments.Count };



            // rename image at temp attachment folder with guid and keep image name in variable
            // copy it to attachment folder
            // add record attachments tables
            // add record to appitem entity attachements



            if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:TempPath"] + @"\" + tenantId.ToString()))
            {
                System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:TempPath"] + @"\" + tenantId.ToString());
            }

            try
            {
                System.IO.File.Copy(path + @"\" + appItemtExcelRecordDTO.ExcelDto.Images[0].ImageFileName, _appConfiguration[$"Attachment:TempPath"] + @"\" + tenantId.ToString() + @"\" + z.guid + "." + appItemtExcelRecordDTO.ExcelDto.Images[0].ImageFileName.Split('.')[1], true);

            }
            catch { }



            y.AppItem.EntityAttachments.Add(z);



            var item = new GetAppItemForEditOutput { AppItem = ObjectMapper.Map<AppItemForEditDto>(y.AppItem) };
            CreateOrEditAppItemDto itemUpdate = ObjectMapper.Map<CreateOrEditAppItemDto>(item);

            var x = await DoCreateOrEdit(itemUpdate);


            return x;
        }



    }

}
