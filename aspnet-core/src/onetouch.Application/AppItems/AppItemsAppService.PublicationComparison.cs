using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using onetouch.AppEntities;
using onetouch.AppMarketplaceItems;
using onetouch.EntityFrameworkCore;

namespace onetouch.AppItems
{
    public partial class AppItemsAppService
    {
        private bool PublicationMatches(onetouchDbContext context, AppItem source,
            AppMarketplaceItems.AppMarketplaceItems published, AppItem parentSource = null,
            AppMarketplaceItems.AppMarketplaceItems publishedParent = null)
        {
            var desired = ObjectMapper.Map<AppMarketplaceItems.AppMarketplaceItems>(source);
            PreparePublicationComparison(desired, source, published, parentSource, publishedParent);
            return SamePublicationPayload(context, desired, published, parentSource == null);
        }

        private static void PreparePublicationComparison(AppMarketplaceItems.AppMarketplaceItems desired, AppItem source,
            AppMarketplaceItems.AppMarketplaceItems published, AppItem parentSource,
            AppMarketplaceItems.AppMarketplaceItems publishedParent)
        {
            desired.Code = parentSource == null ? published.Code : source.SSIN;
            desired.Name = parentSource == null ? source.Name : parentSource.Name;
            desired.Notes = (parentSource ?? source).EntityFk.Notes;
            desired.TenantId = null;
            desired.TenantOwner = source.TenantId ?? published.TenantOwner;
            desired.ObjectId = published.ObjectId;
            desired.ObjectCode = published.ObjectCode;
            desired.IsDefault = published.IsDefault;
            desired.ParentId = publishedParent != null ? publishedParent.Id : source.ParentId == null ? null : published.ParentId;
            desired.SharingLevel = publishedParent?.SharingLevel ?? published.SharingLevel;
        }

        private static bool SamePublicationPayload(onetouchDbContext context,
            AppMarketplaceItems.AppMarketplaceItems desired, AppMarketplaceItems.AppMarketplaceItems published,
            bool compareSizeScales)
        {
            if (!SamePublicationRows(context, new[] { desired }, new[] { published }) ||
                !SamePublicationRows(context, desired.ItemPricesFkList, published.ItemPricesFkList) ||
                !SamePublicationRows(context, desired.EntityExtraData, published.EntityExtraData) ||
                !SamePublicationRows(context, desired.EntityCategories, published.EntityCategories) ||
                !SamePublicationRows(context, desired.EntityClassifications, published.EntityClassifications) ||
                !SamePublicationRows(context, desired.EntitiesRelationships, published.EntitiesRelationships) ||
                !SamePublicationRows(context, desired.EntityAddresses, published.EntityAddresses))
                return false;

            if (desired.EntityAttachments != null)
            {
                string AttachmentKey(AppEntityAttachment attachment) =>
                    PublicationRowKey(context, attachment, "AttachmentId") + ":" +
                    (attachment.AttachmentFk == null ? "null" : PublicationRowKey(context, attachment.AttachmentFk, "TenantId"));
                if (!desired.EntityAttachments.Select(AttachmentKey).OrderBy(key => key, StringComparer.Ordinal)
                    .SequenceEqual((published.EntityAttachments ?? new List<AppEntityAttachment>())
                        .Select(AttachmentKey).OrderBy(key => key, StringComparer.Ordinal)))
                    return false;
            }

            if (compareSizeScales && desired.ItemSizeScaleHeadersFkList != null)
            {
                string ScaleKey(AppMarketplaceItemSizeScaleHeaders header) =>
                    (header.ParentId == null ? "base:" : "ratio:") + PublicationRowKey(context, header, "ParentId") + ":" +
                    JsonConvert.SerializeObject((header.AppItemSizeScalesDetails ?? new List<AppMarketplaceItemSizeScaleDetails>())
                        .Select(detail => PublicationRowKey(context, detail, "SizeScaleId")).OrderBy(key => key, StringComparer.Ordinal));
                if (!desired.ItemSizeScaleHeadersFkList.Select(ScaleKey).OrderBy(key => key, StringComparer.Ordinal)
                    .SequenceEqual((published.ItemSizeScaleHeadersFkList ?? new List<AppMarketplaceItemSizeScaleHeaders>())
                        .Select(ScaleKey).OrderBy(key => key, StringComparer.Ordinal)))
                    return false;
            }
            return true;
        }

        private static bool SamePublicationRows<T>(onetouchDbContext context, IEnumerable<T> desired, IEnumerable<T> published)
            where T : class
        {
            // A null source collection was not loaded and must not erase published data.
            if (desired == null)
                return true;
            return desired.Select(row => PublicationRowKey(context, row)).OrderBy(key => key, StringComparer.Ordinal)
                .SequenceEqual((published ?? Enumerable.Empty<T>()).Select(row => PublicationRowKey(context, row))
                    .OrderBy(key => key, StringComparer.Ordinal));
        }

        private static readonly HashSet<string> PublicationBookkeepingProperties = new HashSet<string>
        {
            "Id", "CreationTime", "CreatorUserId", "LastModificationTime", "LastModifierUserId",
            "DeletionTime", "DeleterUserId", "TimeStamp", "EntityId", "EntityCode",
            "AppMarketplaceItemId", "AppMarketplaceItemCode"
        };

        private static string PublicationRowKey<T>(onetouchDbContext context, T row, params string[] ignored) where T : class
        {
            var values = context.Model.FindEntityType(typeof(T)).GetProperties()
                .Where(property => property.PropertyInfo != null && !PublicationBookkeepingProperties.Contains(property.Name) &&
                    !ignored.Contains(property.Name))
                .OrderBy(property => property.Name, StringComparer.Ordinal)
                .Select(property =>
                {
                    var value = property.PropertyInfo.GetValue(row);
                    // SQL Server's decimal(18,2) publication columns round source prices.
                    // Compare stored precision so a third decimal never causes endless rewrites.
                    return value is decimal number
                        ? (object)decimal.Round(number, property.GetScale() ?? 2, MidpointRounding.AwayFromZero)
                            .ToString("G29", System.Globalization.CultureInfo.InvariantCulture)
                        : value;
                }).ToArray();
            return JsonConvert.SerializeObject(values);
        }
    }
}
