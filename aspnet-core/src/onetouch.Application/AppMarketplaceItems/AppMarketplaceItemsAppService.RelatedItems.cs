using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Microsoft.EntityFrameworkCore;
using onetouch.AppItems.Dtos;
using onetouch.AppMarketplaceItems.Dtos;
using onetouch.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceItems
{
    public partial class AppMarketplaceItemsAppService
    {
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<GetAppMarketItemForViewDto>> GetAppItemRelatedItems(GetAllAppMarketItemsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var parentId = await _appMarketplaceItem.GetAll().AsNoTracking()
                    .Where(item => item.SSIN == input.ItemSSIN)
                    .Select(item => item.Id).FirstOrDefaultAsync();
                if (parentId == 0)
                    return new PagedResultDto<GetAppMarketItemForViewDto>(0, new List<GetAppMarketItemForViewDto>());

                var visible = _appMarketplaceItem.GetAll().AsNoTracking()
                    .Where(item => item.SharingLevel == 1 ||
                        (item.SharingLevel == 2 && item.ItemSharingFkList.Any(sharing => sharing.SharedUserId == AbpSession.UserId)));
                var selected = _appEntitiesRelationship.GetAll().AsNoTracking()
                    .Where(relation => relation.EntityId == parentId)
                    .Join(visible, relation => relation.RelatedEntityId, item => item.Id,
                        (relation, item) => new { relation.Id, ItemId = item.Id })
                    .GroupBy(relation => relation.ItemId)
                    .Select(group => new { ItemId = group.Key, FirstRelationshipId = group.Min(relation => relation.Id) });
                var totalCount = await selected.CountAsync();
                var ids = await selected.OrderBy(item => item.FirstRelationshipId)
                    .Skip(input.SkipCount).Take(input.MaxResultCount)
                    .Select(item => item.ItemId).ToListAsync();
                if (ids.Count == 0)
                    return new PagedResultDto<GetAppMarketItemForViewDto>(totalCount, new List<GetAppMarketItemForViewDto>());

                var products = await visible.Where(item => ids.Contains(item.Id))
                    .Include(item => item.ItemPricesFkList)
                    .Include(item => item.EntityAttachments).ThenInclude(attachment => attachment.AttachmentFk)
                    .AsSplitQuery().ToListAsync();
                var byId = products.ToDictionary(item => item.Id);
                var context = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);

                var ratings = await context.AppEntityRatings.AsNoTracking()
                    .Where(rating => ids.Contains(rating.EntityId))
                    .GroupBy(rating => rating.EntityId)
                    .Select(group => new { Id = group.Key, Average = group.Average(rating => rating.Rating) })
                    .ToDictionaryAsync(rating => rating.Id, rating => rating.Average);

                var reviewTypeId = await _helper.SystemTables.GetEntityObjectTypeReview();
                var relatedMessageEntities = await context.AppEntitiesRelationships.AsNoTracking()
                    .Where(relation => ids.Contains(relation.EntityId) || ids.Contains(relation.RelatedEntityId))
                    .Select(relation => new { relation.EntityId, relation.RelatedEntityId }).Distinct().ToListAsync();
                var messageEntityIds = relatedMessageEntities
                    .SelectMany(relation => new[] { relation.EntityId, relation.RelatedEntityId })
                    .Where(id => !ids.Contains(id)).Distinct().ToList();
                var reviewMessages = await context.AppMarketplaceMessage.AsNoTracking()
                    .Where(message => messageEntityIds.Contains(message.EntityId) && message.ParentId == null &&
                        message.OriginalMessageId == message.Id && message.EntityFk.EntityObjectTypeId == reviewTypeId)
                    .Select(message => message.EntityId).ToListAsync();
                var reviewsByMessageEntity = reviewMessages.GroupBy(id => id).ToDictionary(group => group.Key, group => group.Count());
                var reviewCounts = ids.ToDictionary(id => id, id => relatedMessageEntities
                    .Where(relation => relation.EntityId == id || relation.RelatedEntityId == id)
                    .Select(relation => relation.EntityId == id ? relation.RelatedEntityId : relation.EntityId)
                    .Distinct().Sum(messageId => reviewsByMessageEntity.GetValueOrDefault(messageId)));

                var ownerIds = products.Select(item => item.TenantOwner).Distinct().ToList();
                var personTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var sellerContacts = await _appContactRepository.GetAll().AsNoTracking()
                    .Where(contact => contact.TenantId.HasValue && ownerIds.Contains(contact.TenantId.Value) &&
                        contact.ParentId == null && contact.PartnerId == null && contact.IsProfileData &&
                        contact.EntityFk.EntityObjectTypeId != personTypeId)
                    .Select(contact => new { OwnerId = contact.TenantId.Value, contact.Name }).ToListAsync();
                var sellers = sellerContacts.GroupBy(contact => contact.OwnerId)
                    .ToDictionary(group => group.Key, group => group.First().Name);

                var defaultCurrencies = products.Select(item => item.ItemPricesFkList?
                    .FirstOrDefault(price => price.Code == "MSRP" && price.IsDefault)?.CurrencyCode)
                    .Where(code => !string.IsNullOrEmpty(code)).Distinct().ToList();
                var currencyRates = await _sycCurrencyExchangeRateRepository.GetAll().AsNoTracking()
                    .Where(rate => defaultCurrencies.Contains(rate.CurrencyCode))
                    .Select(rate => new { rate.CurrencyCode, rate.ExchangeRate }).ToListAsync();
                var rates = currencyRates.GroupBy(rate => rate.CurrencyCode)
                    .ToDictionary(group => group.Key, group => group.First().ExchangeRate);
                var requestedRate = input.CurrencyCode == null ? 1 : _helper.SystemTables.GetExchangeRate("USD", input.CurrencyCode);

                var cards = new List<GetAppMarketItemForViewDto>();
                foreach (var id in ids)
                {
                    if (!byId.TryGetValue(id, out var product))
                        continue;
                    var prices = product.ItemPricesFkList?.Where(value => value.Code == "MSRP").ToList()
                        ?? new List<AppMarketplaceItemPrices>();
                    var price = prices.FirstOrDefault(value => value.CurrencyCode == (input.CurrencyCode ?? "USD"));
                    if (price == null)
                    {
                        var defaultPrice = prices.FirstOrDefault(value => value.IsDefault);
                        if (defaultPrice != null)
                        {
                            var defaultRate = string.IsNullOrEmpty(defaultPrice.CurrencyCode)
                                ? 1 : rates.GetValueOrDefault(defaultPrice.CurrencyCode, 1);
                            var converted = defaultRate == 0 ? 1 : defaultRate;
                            var fallbackPrice = defaultPrice.Price * (input.CurrencyCode == "USD" ? converted : requestedRate / converted);
                            cards.Add(CreateRelatedCard(product, fallbackPrice, sellers.GetValueOrDefault(product.TenantOwner),
                                reviewCounts.GetValueOrDefault(id), ratings.GetValueOrDefault(id)));
                            continue;
                        }
                        var usdPrice = prices.FirstOrDefault(value => value.CurrencyCode == "USD");
                        if (usdPrice != null)
                        {
                            cards.Add(CreateRelatedCard(product, usdPrice.Price * requestedRate,
                                sellers.GetValueOrDefault(product.TenantOwner), reviewCounts.GetValueOrDefault(id),
                                ratings.GetValueOrDefault(id)));
                            continue;
                        }
                    }
                    cards.Add(CreateRelatedCard(product, price?.Price ?? 0, sellers.GetValueOrDefault(product.TenantOwner),
                        reviewCounts.GetValueOrDefault(id), ratings.GetValueOrDefault(id)));
                }
                return new PagedResultDto<GetAppMarketItemForViewDto>(totalCount, cards);
            }
        }

        private static GetAppMarketItemForViewDto CreateRelatedCard(AppMarketplaceItems product, decimal price,
            string sellerName, double reviewCount, double averageRating)
        {
            var attachment = product.EntityAttachments?.FirstOrDefault(item => item.IsDefault && item.AttachmentFk != null)
                ?? product.EntityAttachments?.FirstOrDefault(item => item.AttachmentFk != null);
            return new GetAppMarketItemForViewDto
            {
                AppItem = new AppItemDto
                {
                    Id = product.Id,
                    SSIN = product.Code,
                    Code = product.Code,
                    Name = product.Name,
                    Description = product.Notes,
                    Price = price,
                    SellerName = sellerName,
                    ImageUrl = attachment == null ? "" : $"attachments/{(product.TenantId.HasValue ? product.TenantId.Value : -1)}/{attachment.AttachmentFk.Attachment}"
                },
                NumberOfReviews = reviewCount,
                AverageRating = Convert.ToDecimal(averageRating)
            };
        }
    }
}
