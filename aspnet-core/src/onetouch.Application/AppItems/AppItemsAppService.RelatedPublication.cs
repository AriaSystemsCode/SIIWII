using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using onetouch.AppEntities;

namespace onetouch.AppItems
{
    public partial class AppItemsAppService
    {
        private async Task<IReadOnlyDictionary<long, (long Id, string Code)>> ResolvePublishedRelatedItems(AppItem source)
        {
            var relatedEntityIds = (source.EntityFk?.EntitiesRelationships ?? new List<AppEntitiesRelationship>())
                .Select(relation => relation.RelatedEntityId).Distinct().ToList();
            if (relatedEntityIds.Count == 0)
                return new Dictionary<long, (long Id, string Code)>();

            var sourceItems = await _appItemRepository.GetAll().AsNoTracking()
                .Where(item => relatedEntityIds.Contains(item.EntityId))
                .Select(item => new { item.EntityId, item.SSIN, item.Code, item.TenantId, item.TenantOwner })
                .ToListAsync();
            var ssins = sourceItems.Where(item => !string.IsNullOrWhiteSpace(item.SSIN))
                .Select(item => item.SSIN).Distinct().ToList();
            var codes = sourceItems.Where(item => !string.IsNullOrWhiteSpace(item.Code))
                .Select(item => item.Code).Distinct().ToList();
            var publishedItems = await _appMarketplaceItem.GetAll().AsNoTracking()
                .Where(item => ssins.Contains(item.SSIN) || ssins.Contains(item.Code) || codes.Contains(item.ManufacturerCode))
                .Select(item => new { item.Id, item.SSIN, item.Code, item.ManufacturerCode, item.TenantOwner })
                .ToListAsync();

            var result = new Dictionary<long, (long Id, string Code)>();
            foreach (var sourceItem in sourceItems)
            {
                var owner = sourceItem.TenantOwner > 0 ? sourceItem.TenantOwner : sourceItem.TenantId;
                var published = publishedItems
                    .Where(item => (!string.IsNullOrWhiteSpace(sourceItem.SSIN) &&
                        (string.Equals(item.SSIN, sourceItem.SSIN, StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(item.Code, sourceItem.SSIN, StringComparison.OrdinalIgnoreCase))) ||
                        (item.TenantOwner == owner && string.Equals(item.ManufacturerCode, sourceItem.Code, StringComparison.OrdinalIgnoreCase)))
                    .OrderByDescending(item => string.Equals(item.SSIN, sourceItem.SSIN, StringComparison.OrdinalIgnoreCase))
                    .ThenByDescending(item => item.TenantOwner == owner)
                    .ThenBy(item => item.Id)
                    .FirstOrDefault();
                if (published != null)
                    result[sourceItem.EntityId] = (published.Id, published.Code);
            }
            return result;
        }

        private static IList<AppEntitiesRelationship> MapPublishedRelationships(
            IEnumerable<AppEntitiesRelationship> source,
            IReadOnlyDictionary<long, (long Id, string Code)> publishedItems,
            string publishedParentCode)
        {
            var result = new List<AppEntitiesRelationship>();
            foreach (var relation in source ?? Enumerable.Empty<AppEntitiesRelationship>())
            {
                if (!publishedItems.TryGetValue(relation.RelatedEntityId, out var published))
                    continue;

                result.Add(new AppEntitiesRelationship
                {
                    EntityCode = publishedParentCode,
                    EntityTypeCode = relation.EntityTypeCode,
                    EntityTable = relation.EntityTable,
                    TenantId = relation.TenantId,
                    ContactId = relation.ContactId,
                    RelatedEntityId = published.Id,
                    RelatedEntityCode = published.Code,
                    RelatedEntityTypeCode = relation.RelatedEntityTypeCode,
                    RelatedEntityTable = relation.RelatedEntityTable,
                    RelatedTenantId = relation.RelatedTenantId,
                    RelatedContactId = relation.RelatedContactId
                });
            }
            return result;
        }
    }
}
