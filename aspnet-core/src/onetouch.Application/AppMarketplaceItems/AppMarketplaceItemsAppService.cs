using Abp.Application.Services.Dto;
using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.Formula.Atp;
using NUglify.JavaScript.Syntax;
using onetouch.AppItems.Dtos;
using onetouch.AppMarketplaceItemLists;
using onetouch.AppMarketplaceItems.Dtos;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using onetouch.Helpers;
using Org.BouncyCastle.Crypto.Tls;
using onetouch.SystemObjects;
using System.Globalization;
using onetouch.AppContacts;
using onetouch.AppEntities.Dtos;
using onetouch.Configuration;
using Microsoft.Extensions.Configuration;
using onetouch.AppEntities;
using onetouch.AppSiiwiiTransaction;
using onetouch.Migrations;
using NUglify.Helpers;
using onetouch.Sessions.Dto;

namespace onetouch.AppMarketplaceItems
{
    public class AppMarketplaceItemsAppService : onetouchAppServiceBase, IAppMarketplaceItemsAppService
    {
        private readonly IRepository<onetouch.AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> _appMarketplaceAccountsPriceLevels;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategory;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppTransactionHeaders, long> _appTransactionHeadersRepository;
        private readonly IRepository<AppTransactionDetails, long> _appTransactionDetailsRepository;
        private readonly IRepository<AppMarketplaceItemSelectors, long> _appMarketplaceItemsSelector;
        private readonly IRepository<AppMarketplaceItemsListDetails, long> _appMarketplaceItemsListDetail;
        private readonly IRepository<AppMarketplaceItemLists.AppMarketplaceItemLists, long> _appMarketplaceItemList;
        private readonly IRepository<AppMarketplaceItems, long> _appMarketplaceItem;
        private readonly Helper _helper;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectTypeRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates, long> _sycCurrencyExchangeRateRepository;
        private readonly IConfigurationRoot _appConfiguration;
        public AppMarketplaceItemsAppService(IRepository<AppMarketplaceItemLists.AppMarketplaceItemLists, long> appMarketplaceItemList,
            IRepository<AppMarketplaceItemsListDetails, long> appMarketplaceItemsListDetail, IRepository<AppMarketplaceItemSelectors, long> appMarketplaceItemsSelector,
            IRepository<AppMarketplaceItems, long> appMarketplaceItem, Helper helper, IRepository<SycEntityObjectType, long> sycEntityObjectTypeRepository,
            IRepository<AppContact, long> appContactRepository, IAppConfigurationAccessor appConfigurationAccessor, IRepository<AppEntity, long> appEntityRepository,
            IRepository<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates, long> sycCurrencyExchangeRateRepository,
            IRepository<onetouch.AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> appMarketplaceAccountsPriceLevels,
            IRepository<SycEntityObjectCategory, long> sycEntityObjectCategory, IRepository<AppTransactionDetails, long> appTransactionDetailsRepository,
            IRepository<AppTransactionHeaders, long> appTransactionHeadersRepository,
        IAppEntitiesAppService appEntitiesAppService)
        {
            
            _appTransactionHeadersRepository = appTransactionHeadersRepository;
            _appTransactionDetailsRepository = appTransactionDetailsRepository;
            _sycEntityObjectCategory = sycEntityObjectCategory;
            _appEntityRepository = appEntityRepository;
            _appMarketplaceItem = appMarketplaceItem;
            _appMarketplaceItemList = appMarketplaceItemList;
            _appMarketplaceItemsListDetail = appMarketplaceItemsListDetail;
            _appMarketplaceItemsSelector = appMarketplaceItemsSelector;
            _helper= helper;
            _sycEntityObjectTypeRepository = sycEntityObjectTypeRepository;
            _appContactRepository = appContactRepository;
            _sycCurrencyExchangeRateRepository = sycCurrencyExchangeRateRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appEntitiesAppService = appEntitiesAppService;
            _appMarketplaceAccountsPriceLevels = appMarketplaceAccountsPriceLevels;
        }
        public async Task<PagedResultDto<GetAppMarketItemForViewDto>> GetAll(GetAllAppMarketItemsInput input)
       {

            var stopwatch = new System.Diagnostics.Stopwatch();
            stopwatch.Start();
           
            #region prepare parameters
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                input.TenantId = null;
                if (input.AccountSSIN != null)
                {
                    input.AccountSSIN = input.AccountSSIN.StartsWith("\"") ? input.AccountSSIN.Substring (1) : input.AccountSSIN;
                    input.AccountSSIN = input.AccountSSIN.EndsWith("\"") ? input.AccountSSIN.Substring(0, input.AccountSSIN.Length-1) : input.AccountSSIN;
                    var account = await _appContactRepository.GetAll().AsNoTracking().Where(a => a.SSIN == input.AccountSSIN.TrimEnd() && a.IsProfileData == true &&
                    a.TenantId != null && a.PartnerId == null && a.ParentId == null).FirstOrDefaultAsync();
                    if (account != null) { input.TenantId = account.TenantId; }
                }
                long? userId = null;
                if (input.ContactSSIN != null && input.TenantId != null)
                {
                    input.ContactSSIN = input.ContactSSIN.StartsWith("\"") ? input.ContactSSIN.Substring(1) : input.ContactSSIN;
                    input.ContactSSIN = input.ContactSSIN.EndsWith("\"") ? input.ContactSSIN.Substring(0, input.ContactSSIN.Length - 1) : input.ContactSSIN;
                    var accountContact = await _appContactRepository.GetAll().AsNoTracking().Include(x=>x.EntityFk).ThenInclude(s=>s.EntityExtraData).
                        Where(a => a.SSIN == input.ContactSSIN.TrimEnd() && a.IsProfileData == false &&
                   a.TenantId == input.TenantId).FirstOrDefaultAsync();
                    if (accountContact != null)
                    {
                        var userObj = accountContact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715);
                        if (userObj!=null)
                        userId = long.Parse(userObj.AttributeValue.ToString());
                           
                    }
                }

                input.Sorting = input.Sorting ?? "id";
                List<long> AppItemListDetails = new List<long>();
                if (input.AppItemListId != null && input.AppItemListId > 0)
                {
                    AppItemListDetails = _appMarketplaceItemsListDetail.GetAll().Where(x => x.AppMarketplaceItemsListId == input.AppItemListId).Select(x => x.AppMarketplaceItemId).ToList();
                }
               
                #region merge categories and departments
                //if (input.CategoryFilters == null)
                //    input.CategoryFilters = new long[] { };
                if (input.departmentFilters == null)
                    input.departmentFilters = new long[] { };
                var allCategories = input.departmentFilters.ToList();
                if (input.Brands == null)
                    input.Brands = new long[] { };

                var allBrands = input.Brands.ToList();
              //  allCategories.AddRange(input.departmentFilters.ToList());
             //   input.CategoryFilters = allCategories.ToArray();
                #endregion merge categories and departments
                List<long> SelectedItems = new List<long>();
                if (input.SelectorKey != null)
                {
                    SelectedItems = _appMarketplaceItemsSelector.GetAll().Where(e => e.Key == input.SelectorKey).Select(e => e.SelectedId).ToList();
                }
                if (input.SelectorOnly == true)
                {
                    input.SkipCount = 0;
                    input.MaxResultCount = SelectedItems.Count;
                }
                //get curr tenant id to pass to the sp
                
                decimal exchangeRate = 1;
                //MMT12-20
                if (!string.IsNullOrWhiteSpace(input.Filter))
                    input.Filter = input.Filter.TrimEnd().TrimStart();
                //MMT12-20
                //if (input.TenantId != null)
                // if (!string.IsNullOrEmpty(input.SoldOutFromDate.ToString()))
                //   _sycEntityObjectTypeRepository.GetAll().Include(a => a.ExtraAttributes.);
                //var currencyTenant = TenantManager.GetTenantCurrency();
                //var account = await _appContactRepository.GetAll().Include(x => x.CurrencyFk).ThenInclude(x => x.EntityExtraData).FirstOrDefaultAsync(x => x.TenantId ==null && x.IsProfileData==false && x.ParentId == null && x.PartnerId == null && x.AccountId == null);
                 if (input.CurrencyCode != null)
                 exchangeRate = _helper.SystemTables.GetExchangeRate("USD",input.CurrencyCode);

                if (input.CurrencyCode=="USD")
                    exchangeRate = 1;

                if (input.ArrtibuteFilters == null)
                    input.ArrtibuteFilters = new List<ArrtibuteFilter>();
                var attrs = input.ArrtibuteFilters.Select(r => r.ArrtibuteValueId).ToList();
                #endregion
                var filteredAppItems = _appMarketplaceItem.GetAll().AsNoTracking().Include(a => a.ItemPricesFkList.Where(a => a.Code == "MSRP" &&
                       (a.CurrencyCode == input.CurrencyCode || a.CurrencyCode == "USD" || a.IsDefault == true)))
                    //  .Join(_sycCurrencyExchangeRateRepository.GetAll(), price => price.CurrencyCode, exch => exch.CurrencyCode, (_price, _exch) => new
                    //   { currExchObj = _exch, priceObj = _price }))

                    //.Include(a=>a.EntityObjectTypeFk).ThenInclude(x=>x.ExtraAttributes.Where)
                    .Select(x => new
                    {
                        x.TenantId,
                        x.Code,
                        x.Price,
                        x.Name,
                        x.Notes,
                        x.Id,
                        x.ParentFkList,
                        x.Description,
                        x.ParentId,
                        x.SharingLevel,
                        x.StockAvailability,
                        x.EntityExtraData,
                        x.EntityCategories,
                        x.ItemSharingFkList,
                        x.EntityAttachments,
                        x.ItemPricesFkList,
                        x.TenantOwner,
                        x.ManufacturerCode,
                        defaultMsrp = x.ItemPricesFkList.FirstOrDefault(a => a.Code == "MSRP" && a.IsDefault == true)
                    })
                .WhereIf(!string.IsNullOrEmpty(input.TenantId.ToString()), x => x.TenantOwner == input.TenantId)
                .WhereIf(!string.IsNullOrEmpty(input.SoldOutFromDate.ToString()) && input.SoldOutFromDate != new DateTime(1, 1, 1),
                 // x => x.EntityExtraData.Count(s => s.AttributeId == 661 && s.AttributeValue.ToString() >= input.SoldOutFromDate.ToString()) > 0)
                 x => x.EntityExtraData.Count(s => s.AttributeId == 661 && (DateTime)(object)s.AttributeValue >= input.SoldOutFromDate) > 0)
                .WhereIf(!string.IsNullOrEmpty(input.SoldOutToDate.ToString()) && input.SoldOutToDate != new DateTime(1, 1, 1),
                 x => x.EntityExtraData.Count(s => s.AttributeId == 661 && (DateTime)(object)s.AttributeValue <= input.SoldOutToDate) > 0)
                 .WhereIf(!string.IsNullOrEmpty(input.StartShipFromDate.ToString()) && input.StartShipFromDate != new DateTime(1, 1, 1),
                 x => x.EntityExtraData.Count(s => s.AttributeId == 660 && (DateTime)(object)s.AttributeValue >= input.StartShipFromDate) > 0)
                .WhereIf(!string.IsNullOrEmpty(input.StartShipToDate.ToString()) && input.StartShipToDate != new DateTime(1, 1, 1),
                 x => x.EntityExtraData.Count(s => s.AttributeId == 660 && (DateTime)(object)s.AttributeValue <= input.StartShipToDate) > 0)
                .WhereIf(input.Brands != null && input.Brands.Count() > 0,
                x => x.EntityExtraData.Count(s => s.AttributeId == 108 && allBrands.Contains((long)s.AttributeValueId)) > 0)
                .WhereIf(input.ArrtibuteFilters != null && input.ArrtibuteFilters.Count() > 0,
                e =>
                (e.EntityExtraData != null && e.EntityExtraData.Where(r => attrs.Contains(((long)r.AttributeValueId))).Count() > 0)
                ||
                (e.ParentFkList != null &&
                e.ParentFkList.Where(x1 => x1.EntityExtraData.Where(x2 => attrs.Contains((long)x2.AttributeValueId)).Count() > 0).Count() > 0)
                )
                .WhereIf(input.AppItemListId != null && input.AppItemListId > 0, e => AppItemListDetails.Contains(e.Id))
                .WhereIf(input.SelectorOnly == true && SelectedItems != null && SelectedItems.Count() > 0, e => SelectedItems.Contains(e.Id))
                .WhereIf(input.OnlyAvialbleStock , z=> z.StockAvailability > 0)
                //.WhereIf(input.VisibilityStatus > 0, e => e.PublishedListingItemFkList.Where(r => r.SharingLevel == input.VisibilityStatus).Count() > 0)
                //.WhereIf(!string.IsNullOrEmpty(input.SharingLevel) , 
                //e => (e.PublishedListingItemFkList != null && e.PublishedListingItemFkList.Count > 0 && input.PublishStatus == 1) || ((e.PublishedListingItemFkList == null || (e.PublishedListingItemFkList != null && e.PublishedListingItemFkList.Count == 0)) && input.PublishStatus == 2))
                // .WhereIf(input.ListingStatus > 0, e => (e.ListingItemFkList != null && e.ListingItemFkList.Count > 0 && input.ListingStatus == 2) || ((e.ListingItemFkList == null || (e.ListingItemFkList != null && e.ListingItemFkList.Count == 0)) && input.ListingStatus == 1))
                //  .WhereIf(input.EntityObjectTypeId > 0, e => e.EntityFk.EntityObjectTypeId == input.EntityObjectTypeId)
                .WhereIf(input.departmentFilters != null && input.departmentFilters.Count() > 0, e => e.EntityCategories.Where(r => allCategories.Contains(r.EntityObjectCategoryId)).Count() > 0)
                // .WhereIf(input.ClassificationFilters != null && input.ClassificationFilters.Count() > 0, e => e.EntityFk.EntityClassifications.Where(r => input.ClassificationFilters.Contains(r.EntityObjectClassificationId)).Count() > 0)
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter),
                e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.ManufacturerCode.Contains(input.Filter) || e.Description.Contains(input.Filter) ||
                e.EntityExtraData.Where(a => a.AttributeValue.Contains(input.Filter)).Count() > 0 || e.ParentFkList.Where(z=>z.Code.Contains(input.Filter)).Count()>0)
                .Where(x => x.ParentId == null &&
                ((input.SharingLevel == SharingLevels.Public && x.SharingLevel == 1) ||
                 (input.SharingLevel == SharingLevels.SharedWithMe && x.SharingLevel == 2 && x.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0) ||
                (input.SharingLevel == SharingLevels.PublicAndSharedWithMe && (x.SharingLevel == 1 ||
                (x.SharingLevel == 2 && x.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0))) ||
                (userId != null && x.ItemSharingFkList.Count(c => c.SharedUserId == userId) > 0) || (input.AccountSSIN == null ? x.TenantOwner == AbpSession.TenantId : false)));
                /*     )
               || ((input.FilterType == ItemsFilterTypesEnum.SharedWithMe)
                     && (x.SharingLevel == 2 || x.SharingLevel == 1)  
                     && x.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0)
               || ((input.FilterType == ItemsFilterTypesEnum.SharedWithMeAndPublic)
                       && (((x.SharingLevel == 2 || x.SharingLevel == 1) && x.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0 )
                           ||(x.SharingLevel == 1)))));*/
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                input.Sorting ="AppItem." +input.Sorting;
               var filteredOrderedAppItems = filteredAppItems;//.OrderBy(input.Sorting ?? "id asc")
                  //.PageBy(input);
                var appItems = from o in filteredOrderedAppItems
                               join  s in   _sycCurrencyExchangeRateRepository.GetAll()
                               on o.defaultMsrp.CurrencyCode equals s.CurrencyCode into j
                               join c in  _appContactRepository.GetAll().Where(a=>a.TenantId!= null && a.ParentId == null 
                               && a.PartnerId == null && a.IsProfileData == true && a.EntityFk.EntityObjectTypeId!= presonEntityObjectTypeId)
                               on o.TenantOwner equals c.TenantId 
                               from u in j.DefaultIfEmpty() 
                               select new GetAppMarketItemForViewDto()
                               {
                                   AppItem = new AppItemDto
                                   {
                                       ManufacturerCode = o.ManufacturerCode,
                                       SellerName = c.Name ,
                                       SSIN = o.Code,
                                       Code = o.Code,
                                       Name = o.Name,
                                       Description = o.Notes,
                                       Price = (decimal)(input.CurrencyCode == null && o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() !=null ? o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").Select(a => a.Price).FirstOrDefault() :
                                               (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == input.CurrencyCode).FirstOrDefault() != null ?
                                               o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == input.CurrencyCode).Select(a => a.Price).FirstOrDefault() :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() == null ? //0 :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.IsDefault == true && q.CurrencyCode != input.CurrencyCode).FirstOrDefault() != null ?
                                              ((o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.IsDefault && q.CurrencyCode != input.CurrencyCode).FirstOrDefault().Price) * (1 / u.ExchangeRate) * exchangeRate) : 0) :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() != null?
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").Select(a => a.Price).FirstOrDefault() * exchangeRate):0)))),
                                       Id = o.Id,
                                       ShowItem = (input.MinimumPrice != null ? ((decimal)(input.CurrencyCode == null &&
                                                   o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() != null ? o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").Select(a => a.Price).FirstOrDefault() :
                                               (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == input.CurrencyCode).FirstOrDefault() != null ?
                                               o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == input.CurrencyCode).Select(a => a.Price).FirstOrDefault() :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() == null ? //0 :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.IsDefault == true && q.CurrencyCode != input.CurrencyCode).FirstOrDefault() != null ?
                                              ((o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.IsDefault && q.CurrencyCode != input.CurrencyCode).FirstOrDefault().Price) * (1 / u.ExchangeRate) * exchangeRate) : 0) :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() !=null? (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").Select(a => a.Price).FirstOrDefault() * exchangeRate) : 0)))) >= (decimal)input.MinimumPrice) : true) &&
                                              (input.MaximumPrice != null ? ((decimal)(input.CurrencyCode == null ? o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").Select(a => a.Price).FirstOrDefault() :
                                               (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == input.CurrencyCode).FirstOrDefault() != null ?
                                               o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == input.CurrencyCode).Select(a => a.Price).FirstOrDefault() :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() == null ? //0 :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.IsDefault == true && q.CurrencyCode != input.CurrencyCode).FirstOrDefault() != null ?
                                              ((o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.IsDefault && q.CurrencyCode != input.CurrencyCode).FirstOrDefault().Price) * (1 / u.ExchangeRate) * exchangeRate) : 0) :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault()!=null? (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").Select(a => a.Price).FirstOrDefault() * exchangeRate):0)))) <= (decimal)input.MaximumPrice) : true),

                                       ImageUrl = (o.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                        (o.EntityAttachments.FirstOrDefault() == null ? "attachments/" + o.TenantId + "/" + o.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                        : "attachments/" + (o.TenantId.HasValue ? o.TenantId : -1) + "/" + o.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                   },
                                   Selected = (input.SelectorKey != null && SelectedItems != null && SelectedItems.Count > 0 && SelectedItems.Contains(o.Id)) ? true : false

                               };
                var orderedItemsFilter = appItems.Where(x => x.AppItem.ShowItem && x.AppItem.Price != null).OrderBy(input.Sorting ?? "AppItem.id asc");
                var orderedItems = orderedItemsFilter.PageBy(input);

                //var appItemsList = await appItems.ToListAs ync();
                var appItemsList = await orderedItems.ToListAsync();

                if (input.SelectorOnly != null && input.SelectorOnly == true)
                {
                    appItemsList = appItemsList.Where(e => e.Selected).ToList();
                }
                var totalCount = await orderedItemsFilter.CountAsync(x => x.AppItem.ShowItem);

                stopwatch.Stop();
                var elapsed_time = stopwatch.ElapsedMilliseconds;

                return new PagedResultDto<GetAppMarketItemForViewDto>(
                    totalCount,
                    appItemsList
                );
            }
        }
        public async Task<GetAccountImagesOutputDto> GetAccountImages(string accountSSIN)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("LOGO");
                var attBannerId = await _helper.SystemTables.GetAttachmentCategoryId("BANNER");
                accountSSIN = accountSSIN.StartsWith("\"") ? accountSSIN.Substring(1) : accountSSIN;
                accountSSIN = accountSSIN.EndsWith("\"") ? accountSSIN.Substring(0, accountSSIN.Length - 1) : accountSSIN;
                var account = await _appContactRepository.GetAll().Include(a => a.EntityFk)
                    .ThenInclude(a => a.EntityAttachments.Where(a => a.AttachmentCategoryId == attPhotoId || a.AttachmentCategoryId == attBannerId))
                    .ThenInclude(a=>a.AttachmentFk)
                    .FirstOrDefaultAsync(a => a.SSIN == accountSSIN && a.TenantId==null);
                GetAccountImagesOutputDto returnDto = new GetAccountImagesOutputDto();
                if (account != null)
                {
                    returnDto.Name = account.Name;
                    if (account.EntityFk.EntityAttachments.FirstOrDefault(a => a.AttachmentCategoryId == attPhotoId) != null)
                    {
                        returnDto.LogoImage = string.IsNullOrEmpty(account.EntityFk.EntityAttachments.FirstOrDefault(a => a.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment) ?
                                                        ""
                                                        : "attachments/" + (account.EntityFk.TenantId == null ? "-1" : account.EntityFk.TenantId.ToString()) + "/" + account.EntityFk.EntityAttachments.FirstOrDefault(a => a.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment;
                    }
                    if (account.EntityFk.EntityAttachments.FirstOrDefault(a => a.AttachmentCategoryId == attBannerId) != null)
                    {
                        returnDto.BannerImage = string.IsNullOrEmpty(account.EntityFk.EntityAttachments.FirstOrDefault(a => a.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment) ?
                                                        ""
                                                        : "attachments/" + (account.EntityFk.TenantId == null ? "-1" : account.EntityFk.TenantId.ToString()) + "/" + account.EntityFk.EntityAttachments.FirstOrDefault(a => a.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment;
                    }
                }
                return returnDto;
            }
        }
        //xx
        public async Task<PagedResultDto<LookupLabelDto>> GetAllBrandsWithPaging(GetAllAppEntitiesInput input, string accountSSIN)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //var languageId = await _helper.SystemTables.GetEntityObjectTypeLanguageId(); *Abdo : Not used variable 
                if (!string.IsNullOrEmpty(accountSSIN))
                {
                    long? tenantId = null;
                    if (!string.IsNullOrEmpty(accountSSIN))
                    {
                        accountSSIN = accountSSIN.StartsWith("\"") ? accountSSIN.Substring(1) : accountSSIN;
                        accountSSIN = accountSSIN.EndsWith("\"") ? accountSSIN.Substring(0, accountSSIN.Length - 1) : accountSSIN;
                        var account = await _appContactRepository.GetAll().AsNoTracking().Where(a => a.SSIN == accountSSIN.TrimEnd() && a.IsProfileData == true &&
                        a.TenantId != null && a.PartnerId == null && a.ParentId == null).FirstOrDefaultAsync();
                        if (account != null) { tenantId = account.TenantId; }
                    }

                    var filteredAppEntities = _appEntityRepository.GetAll()
                        .Where(x => x.EntityObjectTypeCode == input.SycEntityObjectTypeNameFilter)
                        .WhereIf(tenantId != null, x => x.TenantId == tenantId)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), x => false || x.Name.Contains(input.NameFilter));// *Abdo : is added to filter by name "Red" as  example

                    var pagedAndFilteredAppEntities = filteredAppEntities
                      .OrderBy(input.Sorting ?? "Name asc")
                      .PageBy(input);

                    var appEntities = from o in pagedAndFilteredAppEntities
                                      select new LookupLabelDto()
                                      {
                                          Value = o.Id,
                                          Label = o.Name.ToString(),
                                          Code = o.Code,
                                          IsHostRecord = o.TenantId == null
                                      };


                    var totalCount = await filteredAppEntities.CountAsync();

                    return new PagedResultDto<LookupLabelDto>(
                        totalCount,
                        await appEntities.ToListAsync()
                    );
                }
                else
                {
                    return await _appEntitiesAppService.GetAllEntitiesByTypeCodeWithPaging(input);
                }
            }
        }
        //xx
        public async Task<PagedResultDto<GetAllMarketplaceItemListsOutputDto>> GetSharedItemLists(GetAllInputItemList input,string accountSSIN)
        {

            List<GetAllMarketplaceItemListsOutputDto> returnList = new List<GetAllMarketplaceItemListsOutputDto>();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                
                if (!string.IsNullOrEmpty(accountSSIN))
                {
                    accountSSIN = accountSSIN.StartsWith("\"") ? accountSSIN.Substring(1) : accountSSIN;
                    accountSSIN = accountSSIN.EndsWith("\"") ? accountSSIN.Substring(0, accountSSIN.Length - 1) : accountSSIN;
                    var account = await _appContactRepository.GetAll().AsNoTracking().Where(a => a.SSIN == accountSSIN.TrimEnd() && a.IsProfileData == true &&
                    a.TenantId != null && a.PartnerId == null && a.ParentId == null).FirstOrDefaultAsync();
                    if (account != null) { input.TenantId = account.TenantId; }
                }

                var lists = _appMarketplaceItemList.GetAll().AsNoTracking().Include(a => a.ItemSharingFkList).Where(a => a.SharingLevel == 1 ||
            (a.SharingLevel == 2 && a.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0)).WhereIf(input.TenantId!=null, x=> x.TenantOwner== input.TenantId);
                var appItems = from o in lists
                               select new GetAllMarketplaceItemListsOutputDto()
                               {
                                   Id = o.Id,
                                   Code = o.Code,
                                   Name = o.Name,
                                   SSIN = o.SSIN
                               };

                var orderedItems = appItems.OrderBy("name asc")
                                  .PageBy(input);

                //var appItemsList = await appItems.ToListAs ync();
                var appItemsList = await orderedItems.ToListAsync();

                
                var totalCount = await appItems.CountAsync();

                return new PagedResultDto<GetAllMarketplaceItemListsOutputDto>(
                    totalCount,
                    appItemsList
                );

            }
            
        }
        public async Task<GetAppMarketplaceItemDetailForViewDto> GetMarketplaceAppItemForView(GetAppMarketplaceItemWithPagedAttributesForViewInput input)
        {
            //MMT
            var stopwatch = new System.Diagnostics.Stopwatch();
            stopwatch.Start();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                string level = "MSRP";
                if (input.BuyerAccountSSIN != null && input.SellerAccountSSIN != null)
                {
                    var priceLevel = await _appMarketplaceAccountsPriceLevels.GetAll().AsNoTracking().Where(a => a.AccountSSIN == input.SellerAccountSSIN.TrimEnd()
                    && a.ConnectedAccountSSIN == input.BuyerAccountSSIN).FirstOrDefaultAsync();
                    if (priceLevel != null) { level = priceLevel.PriceLevel; }
                }
                if (!string.IsNullOrEmpty(input.BuyerAccountSSIN))
                {
                    var buyerAccount = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.SSIN == input.BuyerAccountSSIN);
                    if (buyerAccount != null)
                    {
                        level = (buyerAccount.PartnerId == null && !string.IsNullOrEmpty(buyerAccount.PriceLevel) ? buyerAccount.PriceLevel : level);
                      
                    }
                }

                string currencyCode = "";
                if (!string.IsNullOrEmpty(input.CurrencyCode))
                {
                    currencyCode = input.CurrencyCode;
                }
                else
                {

                    var tenantCurrencyInfoDto = await TenantManager.GetTenantCurrency();

                    if (tenantCurrencyInfoDto != null && !string.IsNullOrEmpty(tenantCurrencyInfoDto.Code))
                        currencyCode = tenantCurrencyInfoDto.Code;

                }
                if (string.IsNullOrEmpty(currencyCode))
                    currencyCode = "USD";
                //MMY
                decimal exchangeRate = 1;
                if (input.CurrencyCode != null)
                    exchangeRate = _helper.SystemTables.GetExchangeRate("USD", currencyCode);

                //using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var appItem = await _appMarketplaceItem.GetAll()
                   .Include(x => x.ItemPricesFkList.Where(x => (x.Code == level || x.Code == "MSRP") && (x.CurrencyCode == currencyCode || x.CurrencyCode == "USD" || x.IsDefault)))
                   .ThenInclude(x => x.CurrencyFk).ThenInclude(x => x.EntityExtraData)
                   .Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(x => x.AppItemSizeScalesDetails)
                   .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                   .Include(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                   .Include(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                   .Include(x => x.EntityObjectTypeFk)
                   //.Include(x => x.ListingItemFkList)
                   // .Include(x => x.PublishedListingItemFkList)
                   //.Include(x => x.ItemPricesFkList).ThenInclude(y => y.CurrencyFk)
                   .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.ItemId);

                    var varAppItems = await _appMarketplaceItem.GetAll()
                        .Include(x => x.ItemPricesFkList.Where(x => (x.Code == level || x.Code =="MSRP") && (x.CurrencyCode == currencyCode || x.CurrencyCode == "USD" || x.IsDefault)))
                    .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    .Include(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                    .Include(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                    .Include(x => x.EntityObjectTypeFk)
                    //.Include(x => x.ListingItemFkList)
                    //.Include(x => x.PublishedListingItemFkList)
                    .Include(x => x.ItemPricesFkList).ThenInclude(y => y.CurrencyFk).ThenInclude(x => x.EntityExtraData)
                    .AsNoTracking().Where(x => x.ParentId == input.ItemId).ToListAsync();

                    var output = new GetAppMarketplaceItemDetailForViewDto { AppItem = ObjectMapper.Map<AppMarketplaceItemForViewDto>(appItem) };
                    //
                    output.AppItem.HasPriceLevel = (!string.IsNullOrEmpty(level) && level != "MSRP") ? true : false;
                    var brandId = appItem.EntityExtraData != null && appItem.EntityExtraData.Count > 0 && appItem.EntityExtraData.FirstOrDefault(s => s.AttributeId == 108) != null ?
                        appItem.EntityExtraData.FirstOrDefault(s => s.AttributeId == 108).AttributeValueId : 0;
                    if (brandId != 0)
                    {
                        var brandObj = await _appEntityRepository.GetAll().FirstOrDefaultAsync(a => a.Id == brandId);
                        if (brandObj!=null)
                            output.AppItem.Brand = brandObj.Name;
                    }
                    output.AppItem.MaterialContent = appItem.EntityExtraData != null && appItem.EntityExtraData.Count > 0 && appItem.EntityExtraData.FirstOrDefault(s => s.AttributeId == 662) != null ?
                        appItem.EntityExtraData.FirstOrDefault(s => s.AttributeId == 662).AttributeValue : "";

                    output.AppItem.StartShipDate = appItem.EntityExtraData != null && appItem.EntityExtraData.Count > 0 && appItem.EntityExtraData.FirstOrDefault(s => s.AttributeId == 660) != null ?
                        DateOnly.Parse(DateTime.Parse(appItem.EntityExtraData.FirstOrDefault(s => s.AttributeId == 660).AttributeValue).ToShortDateString()) : null;

                    output.AppItem.SoldOutDate = appItem.EntityExtraData != null && appItem.EntityExtraData.Count > 0 && appItem.EntityExtraData.FirstOrDefault(s => s.AttributeId == 661) != null ?
                                         DateOnly.Parse(DateTime.Parse(appItem.EntityExtraData.FirstOrDefault(s => s.AttributeId == 661).AttributeValue).ToShortDateString()) : null;

                    //
                    output.AppItem.AppItemSizesScaleInfo
                        .ForEach(a => a.AppSizeScalesDetails = a.AppSizeScalesDetails.OrderBy(d => d.D1Position).OrderBy(d => d.D2Position).OrderBy(d => d.D3Position).ToList());

                    if (appItem != null)
                    {
                        string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";


                        if (output.AppItem != null && output.AppItem.EntityAttachments != null && output.AppItem.EntityAttachments.Count > 0)
                        { output.AppItem.EntityAttachments = output.AppItem.EntityAttachments.OrderByDescending(r => r.IsDefault).ToList(); }
                        foreach (var item in output.AppItem.EntityAttachments)
                        { item.Url = imagesUrl + "-1" + @"/" + item.FileName; }

                        decimal mainItemMSRP = 0;
                        decimal? mainItemLevelPrice = null;
                        if (appItem.ItemPricesFkList.Count != 0)
                        {
                            var msrpObj = appItem.ItemPricesFkList.Where(x => x.Code == "MSRP" && x.CurrencyCode == currencyCode).FirstOrDefault();
                            if (msrpObj != null)
                            {
                                output.AppItem.MinMSRP = msrpObj.Price;
                                output.AppItem.MaxMSRP = msrpObj.Price;
                            }
                            else
                            {
                                var msrpObjUsd = appItem.ItemPricesFkList.Where(x => x.Code == "MSRP" && x.CurrencyCode == "USD").FirstOrDefault();
                                if (msrpObjUsd != null)
                                {
                                    output.AppItem.MinMSRP = msrpObjUsd.Price * exchangeRate;
                                    output.AppItem.MaxMSRP = msrpObjUsd.Price * exchangeRate;
                                }
                                else
                                {
                                    var msrpObjDef = appItem.ItemPricesFkList.Where(x => x.Code == "MSRP" && x.IsDefault).FirstOrDefault();
                                    if (msrpObjDef != null)
                                    {
                                        decimal exchangeRateDef = 1;
                                        if (msrpObjDef.CurrencyCode != null)
                                        {
                                            exchangeRateDef = _helper.SystemTables.GetExchangeRate("USD", msrpObjDef.CurrencyCode);
                                            output.AppItem.MinMSRP = msrpObjDef.Price * exchangeRateDef;
                                            output.AppItem.MaxMSRP = msrpObjDef.Price * exchangeRateDef;
                                        }
                                    }
                                }

                            }
                            mainItemMSRP = output.AppItem.MinMSRP;
                            if (!string.IsNullOrEmpty(level) && level != "MSRP")
                            {
                                var levelObj = appItem.ItemPricesFkList.Where(x => x.Code == level && x.CurrencyCode == currencyCode).FirstOrDefault();
                                if (levelObj != null)
                                {
                                    output.AppItem.MinSpecialPrice = levelObj.Price;
                                    output.AppItem.MaxSpecialPrice = levelObj.Price;
                                }
                                else
                                {
                                    var msrpObjUsd = appItem.ItemPricesFkList.Where(x => x.Code == level && x.CurrencyCode == "USD").FirstOrDefault();
                                    if (msrpObjUsd != null)
                                    {
                                        output.AppItem.MinSpecialPrice = msrpObjUsd.Price * exchangeRate;
                                        output.AppItem.MaxSpecialPrice = msrpObjUsd.Price * exchangeRate;
                                    }
                                    else
                                    {
                                        var msrpObjDef = appItem.ItemPricesFkList.Where(x => x.Code == level && x.IsDefault).FirstOrDefault();
                                        if (msrpObjDef != null)
                                        {
                                            decimal exchangeRateDef = 1;
                                            if (msrpObjDef.CurrencyCode != null)
                                            {
                                                exchangeRateDef = _helper.SystemTables.GetExchangeRate("USD", msrpObjDef.CurrencyCode);
                                                output.AppItem.MinSpecialPrice = msrpObjDef.Price * exchangeRateDef;
                                                output.AppItem.MaxSpecialPrice = msrpObjDef.Price * exchangeRateDef;
                                            }
                                        }
                                    }

                                }
                            }
                        }
                        if(output.AppItem.MinMSRP !=null)
                            mainItemLevelPrice = decimal.Parse(output.AppItem.MinMSRP.ToString());

                        if (output.AppItem.MinSpecialPrice !=null)
                        mainItemLevelPrice =decimal.Parse( output.AppItem.MinSpecialPrice.ToString());
                        //MMT
                        foreach (var prObj in varAppItems)
                        {
                            if (prObj.ItemPricesFkList.Count > 0)
                            {
                                var itemPrice = prObj.ItemPricesFkList.Where(x => x.Code.ToUpper() == "MSRP" && x.CurrencyCode == currencyCode).Select(x => x.Price).FirstOrDefault();
                                if (itemPrice != 0)
                                {
                                    output.AppItem.MaxMSRP = output.AppItem.MaxMSRP > itemPrice ? output.AppItem.MaxMSRP : itemPrice;
                                    output.AppItem.MinMSRP = output.AppItem.MinMSRP > itemPrice ? itemPrice : output.AppItem.MinMSRP;
                                }
                                else
                                {
                                    var msrpObjUsd = prObj.ItemPricesFkList.Where(x => x.Code == "MSRP" && x.CurrencyCode == "USD").FirstOrDefault();
                                    if (msrpObjUsd != null)
                                    {
                                        itemPrice = msrpObjUsd.Price * exchangeRate;
                                        output.AppItem.MaxMSRP = output.AppItem.MaxMSRP > itemPrice ? output.AppItem.MaxMSRP : itemPrice;
                                        output.AppItem.MinMSRP = output.AppItem.MinMSRP > itemPrice ? itemPrice : output.AppItem.MinMSRP;
                                    }
                                    else
                                    {
                                        var msrpObjDef = prObj.ItemPricesFkList.Where(x => x.Code == "MSRP" && x.IsDefault).FirstOrDefault();
                                        if (msrpObjDef != null)
                                        {
                                            decimal exchangeRateDef = 1;
                                            if (msrpObjDef.CurrencyCode != null)
                                            {
                                                exchangeRateDef = _helper.SystemTables.GetExchangeRate("USD", msrpObjDef.CurrencyCode);
                                                itemPrice = msrpObjDef.Price * exchangeRateDef;
                                                output.AppItem.MaxMSRP = output.AppItem.MaxMSRP > itemPrice ? output.AppItem.MaxMSRP : itemPrice;
                                                output.AppItem.MinMSRP = output.AppItem.MinMSRP > itemPrice ? itemPrice : output.AppItem.MinMSRP;
                                            }
                                        }
                                    }

                                }
                                if (level != "MSRP")
                                {
                                    var itemLevelPrice = prObj.ItemPricesFkList.Where(x => x.Code.ToUpper() == level && x.CurrencyCode == currencyCode).Select(x => x.Price).FirstOrDefault();
                                    if (itemLevelPrice != 0)
                                    {
                                        output.AppItem.MaxSpecialPrice = output.AppItem.MaxSpecialPrice > itemLevelPrice ? output.AppItem.MaxSpecialPrice : itemLevelPrice;
                                        output.AppItem.MinSpecialPrice = output.AppItem.MinSpecialPrice > itemLevelPrice ? itemLevelPrice : output.AppItem.MinSpecialPrice;
                                    }
                                    else
                                    {
                                        var msrpObjUsd = prObj.ItemPricesFkList.Where(x => x.Code == level && x.CurrencyCode == "USD").FirstOrDefault();
                                        if (msrpObjUsd != null)
                                        {
                                            itemPrice = msrpObjUsd.Price * exchangeRate;
                                            output.AppItem.MaxSpecialPrice = output.AppItem.MaxSpecialPrice > itemPrice ? output.AppItem.MaxSpecialPrice : itemPrice;
                                            output.AppItem.MinSpecialPrice = output.AppItem.MinSpecialPrice > itemPrice ? itemPrice : output.AppItem.MinSpecialPrice;
                                        }
                                        else
                                        {
                                            var msrpObjDef = prObj.ItemPricesFkList.Where(x => x.Code == level && x.IsDefault).FirstOrDefault();
                                            if (msrpObjDef != null)
                                            {
                                                decimal exchangeRateDef = 1;
                                                if (msrpObjDef.CurrencyCode != null)
                                                {
                                                    exchangeRateDef = _helper.SystemTables.GetExchangeRate("USD", msrpObjDef.CurrencyCode);
                                                    itemPrice = msrpObjDef.Price * exchangeRateDef;
                                                    output.AppItem.MaxSpecialPrice = output.AppItem.MaxSpecialPrice > itemPrice ? output.AppItem.MaxSpecialPrice : itemPrice;
                                                    output.AppItem.MinSpecialPrice = output.AppItem.MinSpecialPrice > itemPrice ? itemPrice : output.AppItem.MinSpecialPrice;
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        }
                        //MMT
                        //foreach (var prObj in varAppItems)
                        //{
                        //    if (prObj.ItemPricesFkList.Count > 0)
                        //    {
                        //        var itemPrice = prObj.ItemPricesFkList.Where(x => x.Code.ToUpper() == "MSRP" & x.CurrencyCode == currencyCode).Select(x => x.Price).FirstOrDefault();
                        //        if (itemPrice != 0)
                        //        {
                        //            output.AppItem.MaxPrice = output.AppItem.MaxPrice > itemPrice ? output.AppItem.MaxPrice : itemPrice;
                        //            output.AppItem.MinPrice = output.AppItem.MinPrice > itemPrice ? itemPrice : output.AppItem.MinPrice;
                        //        }
                        //    }
                        //}
                        output.AppItem.OrderByPrePack = false;
                        var prepack = appItem.ItemSizeScaleHeadersFkList != null && appItem.ItemSizeScaleHeadersFkList.Count(x => x.ParentId != null) > 0 &&
                            appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(x => x.ParentId != null).AppItemSizeScalesDetails.Count(a => a.SizeRatio > 0) > 0 ?
                            appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(x => x.ParentId != null).AppItemSizeScalesDetails.ToList() : null;

                        if (prepack != null)
                        {
                            output.AppItem.OrderByPrePack = true;
                        }

                        if (!output.AppItem.OrderByPrePack)
                        {

                            if (varAppItems.Select(r => r.StockAvailability).Sum() >= 0)
                            {
                                output.AppItem.StockAvailability = varAppItems.Select(r => r.StockAvailability).Sum();
                            }
                        }
                        //else
                        // {

                        /// }

                        var EntityExtraDataList = output.AppItem.EntityExtraData;
                        output.AppItem.Recommended = new List<MarketplaceExtraDataAttrDto>();
                        output.AppItem.Additional = new List<MarketplaceExtraDataAttrDto>();

                        if (input.GetAppItemAttributesInputForExtraData == null)
                            input.GetAppItemAttributesInputForExtraData = new GetAppItemExtraAttributesInput();

                        input.GetAppItemAttributesInputForExtraData.recommandedOrAdditional = RecommandedOrAdditional.RECOMMENDED;
                        input.GetAppItemAttributesInputForExtraData.ItemEntityId = output.AppItem.EntityId;
                        input.GetAppItemAttributesInputForExtraData.EntityObjectTypeId = appItem.EntityObjectTypeId;
                        // output.AppItem.Recommended = GetAppItemExtraDataWithPaging(input.GetAppItemAttributesInputForExtraData).Result.Items.ToList();

                        //  input.GetAppItemAttributesInputForExtraData.recommandedOrAdditional = RecommandedOrAdditional.ADDITIONAL;
                        //  output.AppItem.Additional = GetAppItemExtraDataWithPaging(input.GetAppItemAttributesInputForExtraData).Result.Items.ToList();

                        //read first attribute values and default images, and second attribute values
                        //string variations = "COLOR|SZIE;101|105;RED|WHITE|BLACK;2688e3fa-df0e-0e4f-d2d4-a8d5b8959c08.jpg||2688e3fa-df0e-0e4f-d2d4-a8d5b8959c08.jpg;3X|4X";
                        string variations = appItem.Variations;
                        output.AppItem.variations = new List<MarketplaceExtraDataAttrDto>();
                        if (!string.IsNullOrEmpty(variations))
                        {
                            //MMT
                            string firstAttributeId = "";
                            var frstAttId = varAppItems.Select(x => x.EntityAttachments.Where(z => z.Attributes.Contains("=")).Select(a => a.Attributes)).FirstOrDefault();
                            if (frstAttId != null & frstAttId.Count() > 0)
                                firstAttributeId = frstAttId.FirstOrDefault().ToString().Split("=")[0];

                            var firstItem = varAppItems.FirstOrDefault();
                            List<string> attributeValues = firstItem.EntityExtraData.OrderBy(z=>z.AttributeId).Select(x => x.EntityObjectTypeCode).Distinct().ToList();
                            List<string> attributeIDs = firstItem.EntityExtraData.OrderBy(z => z.AttributeId).Select(x => x.AttributeId.ToString()).Distinct().ToList();
                            var firstAttributeID = firstItem.EntityExtraData.WhereIf(!string.IsNullOrEmpty(firstAttributeId),
                                a => a.AttributeId == long.Parse(firstAttributeId)).Select(x => x.AttributeId)
                                .FirstOrDefault().ToString();
                            var secondAttId = attributeIDs.FirstOrDefault(a => a != firstAttributeID.ToString());
                            var firstAttributeValue = firstItem.EntityExtraData.WhereIf(!string.IsNullOrEmpty(firstAttributeId), a => a.AttributeId == long.Parse(firstAttributeId)).Select(x => x.EntityObjectTypeCode.ToString()).FirstOrDefault();
                            //var firstattributeValues1 = varAppItems.Select(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID1)).Select (z=> z.AttributeValue)).Distinct().ToList ();
                            var firstattributeValues = varAppItems.Select(x => x.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID))
                                                       .Select(z => z.AttributeValue)).Distinct().Select(a => a.FirstOrDefault()).Distinct().ToList();//.ToList().FirstOrDefault().Distinct().ToList();
                            int firstattributeValuesCount = firstattributeValues.Count();
                            var firstattributeDefaultImages1 = varAppItems.Select(x => x.EntityAttachments.Where(z => z.Attributes.Contains(firstAttributeID) & z.IsDefault).Select(z => new { z.AttachmentFk.Attachment, z.Attributes })).ToList().Distinct().ToList().Distinct().ToList();
                            var firstattributeDefaultImages = firstattributeDefaultImages1.Select(x => x.FirstOrDefault()).Distinct().ToList();
                            var secondAttributeValuesFor1st = new List<string>();
                            //xx
                            var firstattributeCodes = varAppItems.Select(x => x.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID)).Select(z => new { z.AttributeCode, z.AttributeValue, z.AttributeValueId })).Distinct().Select(a => a.FirstOrDefault()).Distinct().ToList();
                            //xx
                            //var secondAttributeValuesFor1st11 = varAppItems.Select(x => 
                            //    x.EntityFk.EntityExtraData.Where(z=> z.AttributeId != long.Parse(firstAttributeID)).Select(z=>z.EntityFk.EntityExtraData)).ToList();
                            var firstAttributeIdLong = long.Parse(firstAttributeID);
                            List<AppEntityExtraData> secondAttributeValuesFor1st11 = null;
                            if (secondAttId != null) secondAttributeValuesFor1st11 = varAppItems.Select(z => z.EntityExtraData.FirstOrDefault(z => z.AttributeId == long.Parse(secondAttId))).ToList();
                            if (secondAttributeValuesFor1st11 != null)
                            {
                                //var secondAttributeValuesFor1st1 =
                                //    secondAttributeValuesFor1st11.Select(a => a..FirstOrDefault ().AttributeValue.ToString() + "," + 
                                //    (a.FirstOrDefault().AttributeCode.ToString() == null ? a.FirstOrDefault().AttributeValueId.ToString() : a.FirstOrDefault().AttributeCode.ToString()))
                                //    .ToList().Distinct().ToList().Distinct().ToList();
                                //MMT202402
                                //var secondAttributeValuesFor1st1 =
                                //secondAttributeValuesFor1st11.Where(z=>z.AttributeValue!=null).Select(a => a.AttributeValue.ToString() + "," + (a.AttributeValueId != null ? a.AttributeValueId.ToString():"")).ToList();
                                var secondAttributeValuesFor1st1 =
                                                 secondAttributeValuesFor1st11.Where(z => z.AttributeCode != null).Select(a => a.AttributeCode.ToString()).ToList();
                                //MMT202402
                                //(a.AttributeCode.ToString() == null ? a.AttributeValueId.ToString() : a.AttributeCode.ToString()))
                                //.ToList();
                                if (secondAttributeValuesFor1st1 != null && secondAttributeValuesFor1st1.Count > 0)
                                {
                                    var attribName = firstItem.EntityExtraData.FirstOrDefault(a => a.AttributeId == long.Parse(secondAttId)).EntityObjectTypeCode;
                                    if (attribName == "SIZE" && appItem.ItemSizeScaleHeadersFkList != null && appItem.ItemSizeScaleHeadersFkList.Count() > 0)
                                    {
                                        var xx = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                                        var zz = xx.AppItemSizeScalesDetails.OrderBy(s => s.D1Position).OrderBy(s => s.D2Position).OrderBy(s => s.D3Position).Select(a => a.SizeCode.TrimEnd()).ToList();
                                        var ss = secondAttributeValuesFor1st1.Distinct().ToList();
                                        secondAttributeValuesFor1st = xx.AppItemSizeScalesDetails.OrderBy(s => s.D1Position).OrderBy(s => s.D2Position).OrderBy(s => s.D3Position).Select(a => a.SizeCode + "," + a.SizeId.ToString()).ToList();
                                        foreach (var t in zz)
                                        {
                                            // if (!ss.Contains(t.ToString()) && (!ss.Contains(t.Substring(0,t.IndexOf(',')+1).ToString())))
                                            if (!ss.Contains(t.ToString()))
                                                secondAttributeValuesFor1st.Remove(t.ToString());
                                        }
                                        //secondAttributeValuesFor1st = zz;

                                    }
                                    else
                                        secondAttributeValuesFor1st = secondAttributeValuesFor1st1.Distinct().ToList();
                                }

                            }


                            List<string> variationsLists = variations.Split(';').ToList();

                            if (variationsLists != null)
                            {

                                var extraDataAttrDto = new MarketplaceExtraDataAttrDto();
                                extraDataAttrDto.extraAttrName = firstAttributeValue;
                                extraDataAttrDto.selectedValuesTotalCount = firstattributeValuesCount;
                                extraDataAttrDto.extraAttributeId = long.Parse(firstAttributeID);
                                extraDataAttrDto.selectedValues = new List<MarketplaceExtraDataSelectedValues>();
                                int imageLoopCounter = 0;
                                bool firstAttributeRelatedAdded = false;
                                foreach (string varItem in firstattributeValues)
                                {
                                    MarketplaceExtraDataSelectedValues extraDataSelectedValues = new MarketplaceExtraDataSelectedValues();
                                    extraDataSelectedValues.value = varItem;

                                    //Iteration#42,1 MMT 08/20/2024 Add new property for the code[Start]
                                    var extraAttrObj = firstattributeCodes.Where(z => z.AttributeValue == varItem).FirstOrDefault();
                                    if (extraAttrObj != null)
                                        extraDataSelectedValues.Code = extraAttrObj.AttributeCode;
                                    //Iteration#42,1 MMT 08/20/2024 Add new property for the code[End]

                                    extraDataSelectedValues.DefaultEntityAttachment = new AppEntityAttachmentDto();
                                    //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[Start]
                                    var codeItemVar = varAppItems.Where(x => x.EntityExtraData
                                                                                     .Where(a => a.AttributeValue == varItem.ToString() &&
                                                                                     a.AttributeId == firstAttributeIdLong
                                                                                     ).Any()).FirstOrDefault ();
                                    if (codeItemVar != null) 
                                    {
                                        var varColor = codeItemVar.EntityExtraData.Where(x=>x.AttributeId ==201).FirstOrDefault();
                                        if (varColor != null && !string.IsNullOrEmpty(varColor.AttributeValue))
                                        {
                                            extraDataSelectedValues.ColorHexaCode = varColor.AttributeValue;
                                        }
                                        else
                                        {
                                            extraDataSelectedValues.ColorHexaCode = "";
                                        }
                                        var varColorImage = codeItemVar.EntityExtraData.Where(x => x.AttributeId == 202).FirstOrDefault();
                                        if (varColorImage != null && !string.IsNullOrEmpty(varColorImage.AttributeValue))
                                        {
                                            string tenantId = null;
                                            extraDataSelectedValues.ColorImage = imagesUrl + (tenantId == null ? "-1" : tenantId.ToString()) + @"/" + varColorImage.AttributeValue;
                                        }
                                        else
                                        {
                                            extraDataSelectedValues.ColorImage = "";
                                        }
                                        if (codeItemVar.EntityAttachments != null && codeItemVar.EntityAttachments.Count() > 0)
                                        {
                                            extraDataSelectedValues.EntityAttachments = new List<AppEntityAttachmentDto>();
                                            foreach (var attach in codeItemVar.EntityAttachments)
                                            {
                                                var attDto = ObjectMapper.Map<AppEntityAttachmentDto>(attach);
                                                string tenantId = null;
                                                attDto.FileName = imagesUrl + (tenantId == null ? "-1" : tenantId.ToString()) + @"/" + attDto.FileName;
                                              //  extraDataSelectedValues.EntityAttachments.Add(attDto);
                                                // attDto.Url = imagesUrl + (tenantId == null ? "-1" : tenantId.ToString()) + @"/" + attDto.FileName;
                                                 attDto.Url =  attDto.FileName;
                                                extraDataSelectedValues.EntityAttachments.Add(attDto);
                                            }
                                        }
                                    }
                                   
                                   // extraDataSelectedValues.EntityAttachments = codeItemVar.EntityAttachments;
                                    //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[End]
                                    var tenantIdvar = AbpSession.TenantId;
                                    if (appItem.TenantId != AbpSession.TenantId)
                                    {
                                        var orgItems = _appMarketplaceItem.GetAll()
                                       .AsNoTracking().FirstOrDefault(x => x.ParentId == appItem.Id);
                                        if (orgItems != null)
                                            tenantIdvar = orgItems.TenantId;
                                    }
                                    //YYY
                                    //extraDataSelectedValues.DefaultEntityAttachment.Url = imagesUrl + (AbpSession.TenantId == null ? "-1" : AbpSession.TenantId.ToString()) + @"/" + firstattributeDefaultImages[imageLoopCounter];
                                    if (firstattributeDefaultImages.Count > imageLoopCounter && firstattributeDefaultImages[imageLoopCounter] != null)
                                        extraDataSelectedValues.DefaultEntityAttachment.Url = imagesUrl + (tenantIdvar == null ? "-1" : tenantIdvar.ToString()) + @"/" + firstattributeDefaultImages[imageLoopCounter].ToString();
                                    //extraDataSelectedValues.DefaultEntityAttachment.Url = imagesUrl + (AbpSession.TenantId == null ? "-1" : AbpSession.TenantId.ToString()) + @"/" + firstattributeDefaultImages[imageLoopCounter].ToString();

                                    var attribut = firstattributeCodes.FirstOrDefault(a => a.AttributeValue == varItem);
                                    if (attribut != null)
                                    {
                                        var imgObj = firstattributeDefaultImages.FirstOrDefault(z => z != null &&
                                        (z.Attributes == firstAttributeID.Trim() + "=" + attribut.AttributeCode ||
                                        z.Attributes == firstAttributeID.Trim() + "=" + attribut.AttributeValueId.ToString()));
                                        if (imgObj != null && imgObj.Attachment != null)
                                        {
                                            //extraDataSelectedValues.DefaultEntityAttachment.Url = imagesUrl + (AbpSession.TenantId == null ? "-1" : AbpSession.TenantId.ToString()) + @"/" + imgObj.Attachment.ToString();
                                            extraDataSelectedValues.DefaultEntityAttachment.Url = imagesUrl + (tenantIdvar == null ? "-1" : tenantIdvar.ToString()) + @"/" + imgObj.Attachment.ToString();
                                        }
                                    }
                                    if (codeItemVar.EntityAttachments != null && codeItemVar.EntityAttachments.Count() > 0)
                                    {
                                        extraDataSelectedValues.EntityAttachments = new List<AppEntityAttachmentDto>();
                                        foreach (var attach in codeItemVar.EntityAttachments)
                                        {
                                            var attDto = ObjectMapper.Map<AppEntityAttachmentDto>(attach);
                                            string tenantId = null;
                                            attDto.FileName = imagesUrl + (tenantId == null ? "-1" : tenantId.ToString()) + @"/" + attDto.FileName;
                                           // extraDataSelectedValues.EntityAttachments.Add(attDto);
                                            //   attDto.Url = imagesUrl + (tenantId == null ? "-1" : tenantId.ToString()) + @"/" + attDto.FileName;
                                                 attDto.Url =  attDto.FileName;
                                            extraDataSelectedValues.EntityAttachments.Add(attDto);
                                        }
                                    }
                                    imageLoopCounter = imageLoopCounter + 1;
                                    // if (firstAttributeRelatedAdded == false)
                                    if (true)
                                    {
                                        extraDataSelectedValues.EDRestAttributes = new List<MarketplaceEDRestAttributes>();
                                        //MMT
                                        if (attributeIDs.Count == 1)
                                        {
                                            string attVal = attributeValues[0].Split(',')[0];
                                            string attCode = attributeIDs[0].Split(',')[0];
                                            MarketplaceEDRestAttributes eDRestAttributes = new MarketplaceEDRestAttributes();
                                            eDRestAttributes.ExtraAttributeId = long.Parse(attributeIDs[0].Split(',')[0].ToString());
                                            var lookupLabelDtoList = firstattributeValues.Where(a => a == varItem).ToList();
                                            if (lookupLabelDtoList != null && lookupLabelDtoList.Count > 0)
                                                eDRestAttributes.Values = lookupLabelDtoList.Select(r => new MarketplaceLookupLabelDto()
                                                {
                                                    Label = r,
                                                    Code = r
                                                }
                                                    ).ToList();

                                            foreach (var attlook in eDRestAttributes.Values)
                                            {

                                                var codeItems = varAppItems.Where(x => x.EntityExtraData
                                                                                       .Where(a => (a.AttributeValue == attlook.Label.ToString() || a.AttributeCode == attlook.Label.ToString()) &&
                                                                                       a.AttributeId == firstAttributeIdLong
                                                                                       ).Any()).ToList();
                                                var itemVarSum = codeItems.Where(x =>
                                                x.EntityExtraData.Where(a => a.AttributeId == firstAttributeIdLong &
                                                (a.AttributeValue == varItem || a.AttributeCode == varItem)).Any()).Sum(a => a.StockAvailability);
                                                attlook.StockAvailability = itemVarSum;
                                                //SSIN
                                                var itemSsin = varAppItems.Where(x => x.EntityExtraData
                                                                                       .Where(a => (a.AttributeValue == attlook.Label.ToString() || a.AttributeCode == attlook.Label.ToString())) 
                                                                                       .WhereIf(secondAttId!=null,a=>a.AttributeId == long.Parse(secondAttId))
                                                                                       .Any()).ToList()
                                                                                       .Where(a => a.EntityExtraData.Where(w => w.AttributeId == firstAttributeIdLong && (w.AttributeValue == varItem || w.AttributeCode == varItem)).Any()).FirstOrDefault();


                                                if (!string.IsNullOrEmpty(level))
                                                {
                                                    attlook.Price = mainItemLevelPrice==null?0 :decimal.Parse(mainItemLevelPrice.ToString());
                                                    var priceObnj = itemSsin.ItemPricesFkList.FirstOrDefault(x => x.CurrencyCode == currencyCode && x.Code == level);
                                                    if (priceObnj != null)
                                                        attlook.Price = priceObnj.Price;
                                                    else
                                                    {
                                                        var msrpObjUsd = itemSsin.ItemPricesFkList.Where(x => x.Code == level && x.CurrencyCode == "USD").FirstOrDefault();
                                                        if (msrpObjUsd != null)
                                                        {
                                                            attlook.Price = msrpObjUsd.Price * exchangeRate;
                                                        }
                                                        else
                                                        {
                                                            var msrpObjDef = itemSsin.ItemPricesFkList.Where(x => x.Code == level && x.IsDefault).FirstOrDefault();
                                                            if (msrpObjDef != null)
                                                            {
                                                                decimal exchangeRateDef = 1;
                                                                if (msrpObjDef.CurrencyCode != null)
                                                                {
                                                                    exchangeRateDef = _helper.SystemTables.GetExchangeRate("USD", msrpObjDef.CurrencyCode);
                                                                    attlook.Price = msrpObjDef.Price * exchangeRateDef;
                                                                }
                                                            }
                                                            //else {
                                                            //    priceObnj = appItem.ItemPricesFkList.Where(x => x.Code == level & x.CurrencyCode == currencyCode).FirstOrDefault();
                                                            //    if (priceObnj != null)
                                                            //        attlook.Price = priceObnj.Price;
                                                            //}
                                                        }

                                                    }

                                                }
                                                else
                                                {
                                                    attlook.Price = mainItemMSRP;
                                                    var priceObnj = itemSsin.ItemPricesFkList.FirstOrDefault(x => x.CurrencyCode == currencyCode && x.Code == "MSRP");
                                                    if (priceObnj != null)
                                                        attlook.Price = priceObnj.Price;
                                                    else
                                                    {
                                                        var msrpObjUsd = itemSsin.ItemPricesFkList.Where(x => x.Code == "MSRP" && x.CurrencyCode == "USD").FirstOrDefault();
                                                        if (msrpObjUsd != null)
                                                        {
                                                            attlook.Price = msrpObjUsd.Price * exchangeRate;
                                                        }
                                                        else
                                                        {
                                                            var msrpObjDef = itemSsin.ItemPricesFkList.Where(x => x.Code == "MSRP" && x.IsDefault).FirstOrDefault();
                                                            if (msrpObjDef != null)
                                                            {
                                                                decimal exchangeRateDef = 1;
                                                                if (msrpObjDef.CurrencyCode != null)
                                                                {
                                                                    exchangeRateDef = _helper.SystemTables.GetExchangeRate("USD", msrpObjDef.CurrencyCode);
                                                                    attlook.Price = msrpObjDef.Price * exchangeRateDef;
                                                                }
                                                            }
                                                        }

                                                    }
                                                    //else
                                                    //{
                                                    //    priceObnj = appItem.ItemPricesFkList.Where(x => x.Code == "MSRP" & x.CurrencyCode == currencyCode).FirstOrDefault();
                                                    //    if (priceObnj != null)
                                                    //        attlook.Price = priceObnj.Price;
                                                    //}
                                                }
                                                attlook.SSIN = itemSsin.SSIN;
                                                if (prepack != null)
                                                {
                                                    var ratioSize = prepack.FirstOrDefault(z => z.SizeCode == attlook.Label.ToString());
                                                    if (ratioSize != null && ratioSize.SizeRatio > 0)
                                                    {
                                                        attlook.NoOfAvailablePrepacks = long.Parse((itemVarSum / ratioSize.SizeRatio).ToString());
                                                        attlook.SizeRatio = ratioSize.SizeRatio;
                                                    }
                                                }
                                                //SSIN

                                            }
                                            long minPrepack = 0;
                                            if (eDRestAttributes.Values.Count(z => z.NoOfAvailablePrepacks != null) > 0)
                                                minPrepack = eDRestAttributes.Values.Min(z => z.NoOfAvailablePrepacks).Value;

                                            eDRestAttributes.Values.ForEach(a => a.NoOfAvailablePrepacks = minPrepack);
                                            // eDRestAttributes.Values = lookupLabelDtoList.Select(r => new LookupLabelDto() { Label = r.Split(',')[0], Value = long.Parse(r.Split(',')[1]) }).ToList();
                                            eDRestAttributes.TotalCount = secondAttributeValuesFor1st.Count;//variationsLists[loop_counter + 3].Split('|').ToList().Count;
                                            extraDataSelectedValues.EDRestAttributes.Add(eDRestAttributes);
                                        }
                                        //MMT
                                        //loop_counter = loop_counter + 1;
                                        for (int loop_counter = 1; loop_counter < attributeIDs.Count; loop_counter++)
                                        {
                                            if (attributeValues.Count <= loop_counter || attributeValues[loop_counter] == null)
                                                continue;

                                            string attVal = attributeValues[loop_counter].Split(',')[0];
                                            string attCode = attributeIDs[loop_counter].Split(',')[0];




                                            MarketplaceEDRestAttributes eDRestAttributes = new MarketplaceEDRestAttributes();
                                            eDRestAttributes.ExtraAttributeId = long.Parse(attributeIDs[loop_counter].Split(',')[0].ToString());
                                            eDRestAttributes.ExtraAttrName = attributeValues[loop_counter].Split(',')[0].ToString();
                                            var lookupLabelDtoList = secondAttributeValuesFor1st; //variationsLists[loop_counter + 3].Split('|').ToList().GetRange(0, Math.Min(10, variationsLists[loop_counter + 3].Split('|').ToList().Count)).ToList();
                                            if (lookupLabelDtoList != null && lookupLabelDtoList.Count > 0 && eDRestAttributes.ExtraAttributeId == 105)
                                                eDRestAttributes.Values = lookupLabelDtoList.Select(r => new MarketplaceLookupLabelDto()
                                                {
                                                    Label = r.Split(',')[0],
                                                    Code = r.Split(',')[1]
                                                }
                                                    ).ToList();
                                            else
                                            {
                                                eDRestAttributes.Values = new List<MarketplaceLookupLabelDto>();
                                            }

                                            // if (eDRestAttributes.Values == null) continue;
                                            foreach (var attlook in eDRestAttributes.Values)
                                            {
                                                var codeItems = varAppItems.Where(x => x.EntityExtraData
                                                                                       .Where(a => (a.AttributeValue == attlook.Label.ToString() || a.AttributeCode == attlook.Label.ToString()) &&
                                                                                       a.AttributeId == long.Parse(secondAttId)
                                                                                       ).Any()).ToList();
                                                var itemVarSum = codeItems.Where(x =>
                                                x.EntityExtraData.Where(a => a.AttributeId == firstAttributeIdLong &
                                                (a.AttributeValue == varItem || a.AttributeCode == varItem)).Any()).Sum(a => a.StockAvailability);
                                                attlook.StockAvailability = itemVarSum;
                                                //SSIN
                                                var itemSsin = varAppItems.Where(x => x.EntityExtraData
                                                                                       .Where(a => (a.AttributeValue == attlook.Label.ToString() || a.AttributeCode == attlook.Label.ToString()) &&
                                                                                       a.AttributeId == long.Parse(secondAttId)
                                                                                       ).Any()).ToList()
                                                                                       .Where(a => a.EntityExtraData.Where(w => w.AttributeId == firstAttributeIdLong && (w.AttributeValue == varItem || w.AttributeCode == varItem)).Any()).FirstOrDefault();
                                                if(itemSsin!=null)
                                                attlook.SSIN = itemSsin.SSIN;

                                                if (!string.IsNullOrEmpty(level))
                                                {
                                                    attlook.Price = mainItemLevelPrice == null ? 0 : decimal.Parse(mainItemLevelPrice.ToString());
                                                    AppMarketplaceItemPrices?  priceObnj = null;
                                                    if (itemSsin!=null)
                                                       priceObnj = itemSsin.ItemPricesFkList.FirstOrDefault(x => x.CurrencyCode == currencyCode && x.Code == level);

                                                    if (priceObnj != null)
                                                        attlook.Price = priceObnj.Price;
                                                    else
                                                    {
                                                        AppMarketplaceItemPrices? msrpObjUsd = null;
                                                        if (itemSsin != null)
                                                            msrpObjUsd = itemSsin.ItemPricesFkList.Where(x => x.Code == level && x.CurrencyCode == "USD").FirstOrDefault();
                                                        
                                                        if (msrpObjUsd != null)
                                                        {
                                                            attlook.Price = msrpObjUsd.Price * exchangeRate;
                                                        }
                                                        else
                                                        {
                                                            AppMarketplaceItemPrices? msrpObjDef = null;
                                                            if (itemSsin != null)
                                                                 msrpObjDef = itemSsin.ItemPricesFkList.Where(x => x.Code == level && x.IsDefault).FirstOrDefault();

                                                            if (msrpObjDef != null)
                                                            {
                                                                decimal exchangeRateDef = 1;
                                                                if (msrpObjDef.CurrencyCode != null)
                                                                {
                                                                    exchangeRateDef = _helper.SystemTables.GetExchangeRate("USD", msrpObjDef.CurrencyCode);
                                                                    attlook.Price = msrpObjDef.Price * exchangeRateDef;
                                                                }
                                                            }
                                                        }

                                                    }
                                                    //else
                                                    //{
                                                    //    priceObnj = appItem.ItemPricesFkList.Where(x => x.Code == level & x.CurrencyCode == currencyCode).FirstOrDefault();
                                                    //    if (priceObnj != null)
                                                    //        attlook.Price = priceObnj.Price;
                                                    //}
                                                }
                                                else
                                                {
                                                    attlook.Price = mainItemMSRP;
                                                    AppMarketplaceItemPrices? priceObnj = null;
                                                    if (itemSsin != null)
                                                         priceObnj = itemSsin.ItemPricesFkList.FirstOrDefault(x => x.CurrencyCode == currencyCode && x.Code == "MSRP");
                                                    if (priceObnj != null)
                                                        attlook.Price = priceObnj.Price;
                                                    else
                                                    {
                                                        AppMarketplaceItemPrices? msrpObjUsd = null;
                                                        if (itemSsin != null)
                                                             msrpObjUsd = itemSsin.ItemPricesFkList.Where(x => x.Code == "MSRP" & x.CurrencyCode == "USD").FirstOrDefault();
                                                        if (msrpObjUsd != null)
                                                        {
                                                            attlook.Price = msrpObjUsd.Price * exchangeRate;
                                                        }
                                                        else
                                                        {
                                                            AppMarketplaceItemPrices? msrpObjDef = null;
                                                            if (itemSsin != null)
                                                                 msrpObjDef = itemSsin.ItemPricesFkList.Where(x => x.Code == "MSRP" & x.IsDefault).FirstOrDefault();
                                                            if (msrpObjDef != null)
                                                            {
                                                                decimal exchangeRateDef = 1;
                                                                if (msrpObjDef.CurrencyCode != null)
                                                                {
                                                                    exchangeRateDef = _helper.SystemTables.GetExchangeRate("USD", msrpObjDef.CurrencyCode);
                                                                    attlook.Price = msrpObjDef.Price * exchangeRateDef;
                                                                }
                                                            }
                                                        }

                                                    }
                                                    //else
                                                    //{
                                                    //    priceObnj = appItem.ItemPricesFkList.Where(x => x.Code == "MSRP" & x.CurrencyCode == currencyCode).FirstOrDefault();
                                                    //    if (priceObnj != null)
                                                    //        attlook.Price = priceObnj.Price;
                                                    //}
                                                }
                                                //SSIN
                                                if (prepack != null)
                                                {
                                                    var ratioSize = prepack.FirstOrDefault(z => z.SizeCode == attlook.Label.ToString());
                                                    if (ratioSize != null && ratioSize.SizeRatio > 0)
                                                    {
                                                        attlook.NoOfAvailablePrepacks = long.Parse((itemVarSum / ratioSize.SizeRatio).ToString());
                                                        attlook.SizeRatio = ratioSize.SizeRatio;
                                                    }
                                                }
                                            }
                                            long minPrepack = 0;
                                            if (eDRestAttributes.Values.Count(z => z.NoOfAvailablePrepacks != null) > 0)
                                                minPrepack = eDRestAttributes.Values.Where(z => z.NoOfAvailablePrepacks != null).Min(z => z.NoOfAvailablePrepacks).Value;


                                            eDRestAttributes.Values.ForEach(a => a.NoOfAvailablePrepacks = minPrepack);
                                            // eDRestAttributes.Values = lookupLabelDtoList.Select(r => new LookupLabelDto() { Label = r.Split(',')[0], Value = long.Parse(r.Split(',')[1]) }).ToList();
                                            eDRestAttributes.TotalCount = secondAttributeValuesFor1st.Count;//variationsLists[loop_counter + 3].Split('|').ToList().Count;
                                            extraDataSelectedValues.EDRestAttributes.Add(eDRestAttributes);
                                        }
                                        firstAttributeRelatedAdded = true;
                                    }
                                    //else
                                    // {
                                    //extraDataSelectedValues.EDRestAttributes = new List<MarketplaceEDRestAttributes>();
                                    //for (int loop_counter = 1; loop_counter < attributeIDs.Count; loop_counter++)
                                    //{
                                    //    EDRestAttributes eDRestAttributes = new EDRestAttributes();
                                    //    eDRestAttributes.ExtraAttributeId = long.Parse(attributeIDs[loop_counter].Split(',')[0].ToString());
                                    //    eDRestAttributes.ExtraAttrName = attributeValues[loop_counter].Split(',')[0].ToString();
                                    //    eDRestAttributes.Values = new List<LookupLabelDto>();
                                    //    eDRestAttributes.TotalCount = 0;
                                    //    extraDataSelectedValues.EDRestAttributes.Add(eDRestAttributes);
                                    //}

                                    //}
                                    extraDataAttrDto.selectedValues.Add(extraDataSelectedValues);
                                }

                                output.AppItem.variations.Add(extraDataAttrDto);
                            }
                        }
                        //var ExecutionTime38 = DateTime.Now - start;


                        output.AppItem.EntityCategories = null;
                        output.AppItem.EntityClassifications = null;
                        output.AppItem.EntityDepartments = null;

                        output.AppItem.EntityObjectTypeName = appItem.EntityObjectTypeFk.Name;
                        //mmt
                        //output.AppItem.Description = _helper.HtmlToPlainText(output.AppItem.Description);
                        //mmt
                        if (input.GetAppItemAttributesInputForCategories == null)
                            input.GetAppItemAttributesInputForCategories = new GetAppItemAttributesInput();
                        output.AppItem.EntityCategoriesNames = await GetAppItemCategoriesNamesWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.Id, MaxResultCount = input.GetAppItemAttributesInputForCategories.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForCategories.SkipCount, Sorting = input.GetAppItemAttributesInputForCategories.Sorting });

                        if (input.GetAppItemAttributesInputForClassifications == null)
                            input.GetAppItemAttributesInputForClassifications = new GetAppItemAttributesInput();
                        output.AppItem.EntityClassificationsNames = await GetAppItemClassificationsNamesWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.Id, MaxResultCount = input.GetAppItemAttributesInputForClassifications.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForClassifications.SkipCount, Sorting = input.GetAppItemAttributesInputForClassifications.Sorting });


                        if (input.GetAppItemAttributesInputForDepartments == null)
                            input.GetAppItemAttributesInputForDepartments = new GetAppItemAttributesInput();
                        //MMT30
                        //output.AppItem.EntityDepartmentsNames = await GetAppItemDepartmentsNamesWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForDepartments.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForDepartments.SkipCount, Sorting = input.GetAppItemAttributesInputForDepartments.Sorting });
                        output.AppItem.EntityDepartmentsNames = new PagedResultDto<string> { Items = (await GetAppItemDepartmentsWithFullNameWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.Id, MaxResultCount = input.GetAppItemAttributesInputForDepartments.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForDepartments.SkipCount, Sorting = input.GetAppItemAttributesInputForDepartments.Sorting })).Items.Select(a => a.EntityObjectCategoryName).ToList() };
                        //MMT30
                    }
                    //MMT
                    stopwatch.Stop();
                    var elapsed_time = stopwatch.ElapsedMilliseconds;
                    //MMT
                    return output;
                }
            }
        }
        public async Task<PagedResultDto<AppEntityCategoryDto>> GetAppItemDepartmentsWithFullNameWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appMarketplaceItem.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.Id;
                }
                if (input.ItemEntityId != 0)
                {
                    var returnRes = await _appEntitiesAppService.GetAppEntityDepartmentsWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                    if (returnRes != null && returnRes.Items.Count > 0)
                    {
                        foreach (var cat in returnRes.Items)
                        {
                            cat.EntityObjectCategoryName = GetDepartmentName(cat.EntityObjectCategoryId);
                        }
                    }
                    return returnRes;
                }
                return new PagedResultDto<AppEntityCategoryDto>(0, new List<AppEntityCategoryDto>());
            }
        }
        public async Task<PagedResultDto<string>> GetAppItemCategoriesNamesWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appMarketplaceItem.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.Id;
                }
                if (input.ItemEntityId != 0)
                {
                    return await _appEntitiesAppService.GetAppEntityCategoriesNamesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                }
                return new PagedResultDto<string>(0, new List<string>());
            }
        }

        public async Task<PagedResultDto<string>> GetAppItemClassificationsNamesWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appMarketplaceItem.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.Id;
                }
                if (input.ItemEntityId != 0)
                {
                    return await _appEntitiesAppService.GetAppEntityClassificationsNamesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                }
                return new PagedResultDto<string>(0, new List<string>());
            }
        }

        public async Task<PagedResultDto<string>> GetAppItemDepartmentsNamesWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appMarketplaceItem.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.Id;
                }
                if (input.ItemEntityId != 0)
                {
                    return await _appEntitiesAppService.GetAppEntityDepartmentsNamesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                }
                return new PagedResultDto<string>(0, new List<string>());
            }
        }
        private string GetDepartmentName(long departmentId)
        {
            string returnName = "";
            var categoriesFiltered = _sycEntityObjectCategory.GetAll().Include(a => a.ParentFk).FirstOrDefault(a => a.Id == departmentId);
            if (categoriesFiltered != null)
            {
                if (categoriesFiltered.ParentId != null)
                {
                    returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + GetDepartmentName(long.Parse(categoriesFiltered.ParentId.ToString()));
                }
                //else
                returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + categoriesFiltered.Name;
            }
            return returnName;

        }
        //public async Task AddTransactionDetails(GetAppMarketplaceItemDetailForViewDto input, long transactionId)
        //{
        //    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
        //    {
        //        var header = await _appTransactionHeadersRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(a => a.Id == transactionId);
        //        double colorQty = 0;
        //        decimal colorAmt = 0;
        //        AppTransactionDetails detParent =null;
        //        var lastLine = await _appTransactionDetailsRepository.GetAll().AsNoTracking().Where(s => s.TransactionId == transactionId).Select(a => a.LineNo).DefaultIfEmpty().MaxAsync();
        //        lastLine = lastLine == 0 ? 0 : lastLine;
        //        List<AppTransactionDetails> details = new List<AppTransactionDetails>();
        //        if (input.AppItem.variations != null && input.AppItem.variations.Count() > 0)
        //        {
        //            var orderQty = input.AppItem.variations.Sum(x => x.selectedValues.Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE").Sum(a => a.Values.Where(f => f.OrderedQty != null).Select(f => f.OrderedQty).Sum())));
        //            var orderPrepacks = input.AppItem.variations.Sum(x => x.selectedValues
        //            .Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE")
        //            .Sum(a => a.Values.FirstOrDefault(f => f.OrderedPrePacks != null && f.OrderedPrePacks > 0) != null ? a.Values.FirstOrDefault(f => f.OrderedPrePacks != null && f.OrderedPrePacks > 0).OrderedPrePacks : 0)));
        //            var orderAmt = input.AppItem.variations.Sum(x => x.selectedValues
        //            .Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE")
        //            .Sum(a => a.Values.Where(f => f.OrderedQty != null).Select(f => f.OrderedQty * f.Price).Sum())));

        //            if (orderPrepacks > 0) 
        //            { 

        //              orderQty = input.AppItem.variations.Sum(x => x.selectedValues.Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE").Sum(a => a.Values.Where(f => f.OrderedPrePacks != null && f.OrderedPrePacks > 0).Select(f => f.SizeRatio * f.OrderedPrePacks).Sum())));
        //              orderAmt = input.AppItem.variations.Sum(x => x.selectedValues
        //                .Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE")
        //                .Sum(a => a.Values.Where(f => f.OrderedPrePacks != null && f.OrderedPrePacks > 0)
        //                .Select(f => f.SizeRatio * f.OrderedPrePacks * f.Price).Sum())));
        //            }
        //            if (orderQty > 0 || orderPrepacks > 0)
        //            {
        //                var marketplaceItemMain = await _appMarketplaceItem.GetAll().AsNoTracking().Include(x => x.EntityCategories).Include(x => x.EntityAttachments).ThenInclude(x=>x.AttachmentFk)
        //                    .Include(a => a.EntityClassifications)
        //                                .Include(a => a.EntityExtraData).FirstOrDefaultAsync(a => a.SSIN == input.AppItem.Code);
        //                if (marketplaceItemMain != null)
        //                {

        //                    detParent = new AppTransactionDetails();
        //                    detParent = ObjectMapper.Map<AppTransactionDetails>(marketplaceItemMain);
        //                    detParent.Amount = decimal.Parse(orderAmt.ToString());
        //                    detParent.Quantity = double.Parse(orderQty.ToString());
        //                    detParent.NetPrice = decimal.Parse((orderAmt / orderQty).ToString());
        //                    detParent.GrossPrice  = decimal.Parse((orderAmt / orderQty).ToString());
        //                    detParent.Discount = 0;
        //                    detParent.NoOfPrePacks = orderPrepacks;
        //                    detParent.SSIN = marketplaceItemMain.SSIN;
        //                    detParent.ItemSSIN= marketplaceItemMain.SSIN;
        //                    detParent.ItemDescription = marketplaceItemMain.Description;
        //                    detParent.Name = marketplaceItemMain.Name;
        //                    detParent.Id = 0;
        //                    detParent.TransactionId = transactionId;
        //                    lastLine++;
        //                    detParent.LineNo = lastLine;
        //                    detParent.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
        //                    detParent.TenantId = int.Parse(AbpSession.TenantId.ToString());
        //                    detParent.TransactionCode = header.Code;
        //                    detParent.EntityObjectTypeId = header.EntityObjectTypeId;
        //                    detParent.EntityObjectTypeCode = header.EntityObjectTypeCode;
        //                    detParent.Note = "";
        //                    detParent.ItemCode = marketplaceItemMain.Code;
        //                    detParent.Code = header.Code.TrimEnd() + "-" + detParent.LineNo .ToString()+ "-" + detParent.Code.TrimEnd();
        //                    detParent.Notes = string.IsNullOrEmpty(marketplaceItemMain.Notes) ? "" : marketplaceItemMain.Notes;
        //                    detParent.ParentId = null;
        //                    detParent.EntityExtraData.ForEach(d => d.Id = 0);
        //                    detParent.EntityExtraData.ForEach(d => d.EntityFk = null);
        //                    detParent.EntityExtraData.ForEach(d => d.EntityCode = detParent.Code);
        //                    detParent.EntityExtraData.ForEach(d => d.EntityId = 0);
        //                    detParent.EntityAttachments.ForEach(d => d.Id = 0);
        //                    detParent.EntityAttachments.ForEach(d => d.EntityId = 0);
        //                    detParent.EntityAttachments.ForEach(d => d.EntityCode = detParent.Code);
        //                    detParent.EntityAttachments.ForEach(d => d.EntityFk = null);
        //                    detParent.EntityCategories.ForEach(d => d.Id = 0);
        //                    detParent.EntityCategories.ForEach(d => d.EntityFk = null);
        //                    detParent.EntityCategories.ForEach(d => d.EntityCode = detParent.Code);
        //                    detParent.EntityCategories.ForEach(d => d.EntityId = 0);
        //                    detParent.EntityClassifications.ForEach(d => d.EntityId = 0);
        //                    detParent.EntityClassifications.ForEach(d => d.EntityFk = null);
        //                    detParent.EntityClassifications.ForEach(d => d.EntityCode = detParent.Code);
        //                    detParent.EntityClassifications.ForEach(d => d.Id = 0);
        //                    if (detParent.EntityAttachments != null)
        //                    {
        //                        foreach (var parentAttach in detParent.EntityAttachments)
        //                        {
        //                            parentAttach.Id = 0;

        //                            parentAttach.EntityId = 0;
        //                            parentAttach.EntityFk = null;
        //                            parentAttach.AttachmentFk.TenantId = AbpSession.TenantId;
        //                            MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId);
        //                            parentAttach.AttachmentId = 0;
        //                            parentAttach.AttachmentFk.Id = 0;
        //                        }
        //                    }
        //                    detParent = await _appTransactionDetailsRepository.InsertAsync(detParent);
        //                }

        //            }
        //            if (detParent == null) return;
        //            foreach (var item in input.AppItem.variations)
        //            {
        //                foreach (var child in item.selectedValues)
        //                {

        //                    foreach (var ch in child.EDRestAttributes)
        //                    {
        //                        if (ch.ExtraAttrName != "SIZE")
        //                            continue;

        //                        foreach (var v in ch.Values)
        //                        {
        //                            if ( v.OrderedPrePacks != null && v.OrderedPrePacks > 0 ? ((v.OrderedPrePacks * v.SizeRatio)==0) : (v.OrderedQty == 0 || v.OrderedQty == null)) continue;
        //                            var ssin = v.SSIN;
        //                            var marketplaceItem = await _appMarketplaceItem.GetAll().AsNoTracking().Include(x => x.EntityCategories)
        //                                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk).Include(a => a.EntityClassifications)
        //                                .Include(a => a.EntityExtraData).FirstOrDefaultAsync(a => a.SSIN == ssin);
        //                            if (marketplaceItem != null)
        //                            {

        //                                AppTransactionDetails det = new AppTransactionDetails();
        //                                det = ObjectMapper.Map<AppTransactionDetails>(marketplaceItem);
        //                                det.Quantity = v.OrderedPrePacks !=null && v.OrderedPrePacks >0? double.Parse((v.OrderedPrePacks * v.SizeRatio).ToString()) : double.Parse(v.OrderedQty.ToString());
        //                                det.NetPrice = v.Price; //input.AppItem.MaxSpecialPrice != 0 ? input.AppItem.MaxSpecialPrice : input.AppItem.MaxMSRP;
        //                                det.GrossPrice = v.Price; //input.AppItem.MaxSpecialPrice != 0 ? input.AppItem.MaxSpecialPrice : input.AppItem.MaxMSRP;
        //                                det.Discount = 0;
        //                                det.Amount = decimal.Parse((decimal.Parse(det.Quantity.ToString()) * det.NetPrice).ToString());
        //                                det.Id = 0;
        //                                det.TransactionId = transactionId;
        //                                lastLine++;
        //                                det.LineNo = lastLine;
        //                                det.NoOfPrePacks =v.OrderedPrePacks;
        //                                det.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
        //                                det.TenantId = int.Parse(AbpSession.TenantId.ToString());
        //                                det.TransactionCode = header.Code;
        //                                det.ItemCode = marketplaceItem.Code;
        //                                det.ItemDescription = marketplaceItem.Description;
        //                                det.ItemSSIN = marketplaceItem.SSIN;
        //                                det.EntityObjectTypeId = header.EntityObjectTypeId;
        //                                det.EntityObjectTypeCode = header.EntityObjectTypeCode;
        //                                det.Note = "";
        //                                det.Code = header.Code.TrimEnd() + "-" + det.LineNo.ToString() + "-" + det.Code.TrimEnd();
        //                                det.Notes = string.IsNullOrEmpty(marketplaceItem.Notes) ? "" : marketplaceItem.Notes;
        //                                // det.EntityExtraData.ForEach(d => d.Id = 0);
        //                                // det.EntityExtraData.ForEach(d=> d.EntityId = 0);
        //                                //det.EntityExtraData.ForEach(d => d.EntityFk  = null);
        //                                det.EntityExtraData.ForEach(d => d.EntityCode = marketplaceItem.Code);
        //                                det.EntityExtraData.ForEach(d => d.Id = 0);
        //                                det.EntityExtraData.ForEach(d => d.EntityFk = null);
        //                                det.EntityExtraData.ForEach(d => d.EntityCode = det.Code);
        //                                det.EntityExtraData.ForEach(d => d.EntityId = 0);
        //                                det.EntityAttachments.ForEach(d => d.Id = 0);
        //                                det.EntityAttachments.ForEach(d => d.EntityId = 0);
        //                                det.EntityAttachments.ForEach(d => d.EntityCode = det.Code);
        //                                det.EntityAttachments.ForEach(d => d.EntityFk = null);
        //                                det.EntityCategories.ForEach(d => d.Id = 0);
        //                                det.EntityCategories.ForEach(d => d.EntityFk = null);
        //                                det.EntityCategories.ForEach(d => d.EntityCode = detParent.Code);
        //                                det.EntityCategories.ForEach(d => d.EntityId = 0);
        //                                det.EntityClassifications.ForEach(d => d.EntityId = 0);
        //                                det.EntityClassifications.ForEach(d => d.EntityFk = null);
        //                                det.EntityClassifications.ForEach(d => d.EntityCode = detParent.Code);
        //                                det.EntityClassifications.ForEach(d => d.Id = 0);
        //                                if (det.EntityAttachments != null)
        //                                {
        //                                    foreach (var parentAttach in det.EntityAttachments)
        //                                    {
        //                                        parentAttach.Id = 0;

        //                                        parentAttach.EntityId = 0;
        //                                        parentAttach.EntityFk = null;
        //                                        parentAttach.AttachmentFk.TenantId = AbpSession.TenantId;
        //                                        MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId);
        //                                        parentAttach.AttachmentId = 0;
        //                                        parentAttach.AttachmentFk.Id = 0;
        //                                    }
        //                                }
        //                                //colorQty += det.Quantity;
        //                                //colorAmt += det.Amount;
        //                                det.ParentId = detParent.Id;
        //                                detParent.ParentFkList.Add(det);
        //                                //det = await _appTransactionDetailsRepository.InsertAsync(det);

        //                            }

        //                        }
        //                    }
        //                }
        //            }

        //            await CurrentUnitOfWork.SaveChangesAsync();
        //        }
        //    }
        //}
        //private void MoveFile(string fileName, int? sourceTenantId, int? distinationTenantId)
        //{
        //    if (sourceTenantId == null) sourceTenantId = -1;
        //    if (distinationTenantId == null) distinationTenantId = -1;

        //    var tmpPath = _appConfiguration[$"Attachment:PathTemp"] + @"\" + sourceTenantId + @"\" + fileName;
        //    var pathSource = _appConfiguration[$"Attachment:Path"] + @"\" + sourceTenantId + @"\" + fileName;
        //    var path = _appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId + @"\" + fileName;

        //    if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId))
        //    {
        //        System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId);
        //    }

        //    try
        //    {
        //        System.IO.File.Copy(tmpPath.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
        //    }
        //    catch (Exception ex)
        //    {
        //        try
        //        {
        //            System.IO.File.Copy(pathSource.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
        //        }
        //        catch (Exception ex1)
        //        {

        //        }
        //    }
        //}
        //T-SII-20240628.0002 ,1 MMT 07/10/2024 Check if the currency has exchange rate[Start]
        public async Task<bool> CheckCurrencyExchangeRate(CurrencyInfoDto inpurCurrencyCode)
        {
            //MMT1
            //var currencyTenant = await TenantManager.GetTenantCurrency();
            if (inpurCurrencyCode!=null && !string.IsNullOrEmpty(inpurCurrencyCode.Code)) // != null && currencyTenant != null && currencyTenant.Code != null && inpurCurrencyCode != currencyTenant.Code)
            {
                if (inpurCurrencyCode.Code != "USD")
                {
                    var TenantCurrency = await _sycCurrencyExchangeRateRepository.GetAll().FirstOrDefaultAsync(x => x.CurrencyCode == inpurCurrencyCode.Code);
                    if (TenantCurrency == null)
                    {
                        return false;
                    }
                    else
                        return true;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                return false;
            }

        }
        //T-SII-20240628.0002 ,1 MMT 07/10/2024 Check if the currency has exchange rate[End]
    }
}
