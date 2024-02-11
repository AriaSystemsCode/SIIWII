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

namespace onetouch.AppItems
{
    [AbpAuthorize(AppPermissions.Pages_AppItems)]
    public class AppItemsAppService : onetouchAppServiceBase, IAppItemsAppService, IExcelImporter<AppItemExcelResultsDTO>
    {
        private readonly IRepository<AppItemsListDetail, long> _appItemsListDetailRepository;
        private readonly IRepository<AppItem, long> _appItemRepository;
        private readonly IAppItemsExcelExporter _appItemsExcelExporter;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategoryRepository;
        private readonly IRepository<SycEntityObjectClassification, long> _sycEntityObjectClassificationRepository;
        private readonly IRepository<AppEntityCategory, long> _appEntityCategoryRepository;
        private readonly IRepository<AppEntityClassification, long> _appEntityClassificationRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppItemSharing, long> _appItemSharingRepository;
        private readonly IAppNotifier _appNotifier;
        private readonly IConfigurationRoot _appConfiguration;
        //MMT
        private readonly IRepository<AppAttachment, long> _appAttachmentRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectTypeRepository;
        private readonly IRepository<AppEntityAttachment, long> _appEntityAttachmentRepository;
        private readonly ISycEntityObjectClassificationsAppService _sycEntityObjectClassificationsAppService;
        private readonly SycEntityObjectCategoriesAppService _sycEntityObjectCategoriesAppService;
        private readonly ISycAttachmentCategoriesAppService _sSycAttachmentCategoriesAppService;
        private readonly IRepository<AppItemPrices, long> _appItemPricesRepository;
        private readonly IRepository<AppItemSizeScalesHeader, long> _appItemSizeScalesHeaderRepository;
        private readonly IRepository<AppItemSizeScalesDetails, long> _appItemSizeScalesDetailRepository;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        private readonly AppSizeScaleAppService _appSizeScaleAppService;
        private readonly IRepository<AppSizeScalesHeader, long> _appSizeScalesHeaderRepository;
        //MMT33
        private readonly IRepository<AppMarketplaceItemSharings, long> _appMarketplaceItemSharing;
        private readonly IRepository<AppMarketplaceItems.AppMarketplaceItems, long> _appMarketplaceItem;
        private readonly IRepository<AppMarketplaceItemPrices, long> _appMarketplaceItemPricesRepository;
        //MMT33
        TimeZoneInfoAppService _timeZoneInfoAppService;
        //MMT
        private readonly IRepository<AppItemSelector, long> _appItemSelectorRepository;
        private readonly Helper _helper;
        SycEntityObjectTypesAppService _SycEntityObjectTypesAppService;
        private readonly IRepository<SydObject, long> _syObjectRepository;
        private readonly IRepository<SycSegmentIdentifierDefinition, long> _sycSegmentIdentifierDefinition;
        private readonly IRepository<SycCounter, long> _sycCounter;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategory;
        public AppItemsAppService(
            IRepository<AppItem, long> appItemRepository,
            IAppItemsExcelExporter appItemsExcelExporter, IAppEntitiesAppService appEntitiesAppService, Helper helper, IRepository<AppEntity, long> appEntityRepository, SycEntityObjectTypesAppService sycEntityObjectTypesAppService
            , IRepository<AppEntityCategory, long> appEntityCategoryRepository
            , IRepository<AppEntityClassification, long> appEntityClassificationRepository
            , IRepository<AppEntityExtraData, long> appEntityExtraDataRepository
            , IRepository<AppItemSharing, long> appItemSharingRepository
            , IAppNotifier appNotifier
            , IRepository<SycEntityObjectCategory, long> sycEntityObjectCategoryRepository
            , IRepository<SycEntityObjectClassification, long> sycEntityObjectClassificationRepository,
            IAppConfigurationAccessor appConfigurationAccessor, ISycEntityObjectClassificationsAppService sycEntityObjectClassificationsAppService
            , SycEntityObjectCategoriesAppService sycEntityObjectCategoriesAppService, ISycAttachmentCategoriesAppService sSycAttachmentCategoriesAppService,
            IRepository<AppItemSelector, long> appItemSelectorRepository,
            SycIdentifierDefinitionsAppService sycIdentifierDefinitionsAppService,
            IRepository<AppItemPrices, long> appItemPricesRepository,
            IRepository<AppItemSizeScalesDetails, long> appItemSizeScalesDetailRepository,
            IRepository<AppItemSizeScalesHeader, long> appItemSizeScalesHeaderRepository,
            IRepository<AppSizeScalesHeader, long> appSizeScalesHeaderRepository,
            AppSizeScaleAppService appSizeScaleAppService,
            IRepository<AppItemsListDetail, long> appItemsListDetailRepository, IRepository<SycCounter, long> SycCounter, IRepository<SydObject, long> syObjectRepository,
            IRepository<SycSegmentIdentifierDefinition, long> sycSegmentIdentifierDefinition, IRepository<SycEntityObjectCategory, long> sycEntityObjectCategory,
            IRepository<AppMarketplaceItems.AppMarketplaceItems, long> appMarketplaceItem, IRepository<AppMarketplaceItemSharings, long> appMarketplaceItemSharing,
            IRepository<AppMarketplaceItemPrices, long> appMarketplaceItemPricesRepository, IRepository<AppEntityAttachment, long> appEntityAttachment,
            IRepository<SycEntityObjectType, long> sycEntityObjectTypeRepository, IRepository<AppAttachment, long> appAttachmentRepository, TimeZoneInfoAppService timeZoneInfoAppService
            )
        {
            //MMT33-2
            _timeZoneInfoAppService = timeZoneInfoAppService;
            _appAttachmentRepository = appAttachmentRepository;
            _sycEntityObjectTypeRepository = sycEntityObjectTypeRepository;
            _appEntityAttachmentRepository = appEntityAttachment;
            _appMarketplaceItem = appMarketplaceItem;
            _appMarketplaceItemSharing = appMarketplaceItemSharing;
            _appMarketplaceItemPricesRepository = appMarketplaceItemPricesRepository;
            //MMT33-2
            _syObjectRepository = syObjectRepository;
            _sycCounter = SycCounter;
            _appItemsListDetailRepository = appItemsListDetailRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appItemRepository = appItemRepository;
            _appItemsExcelExporter = appItemsExcelExporter;
            _helper = helper;
            _appEntitiesAppService = appEntitiesAppService;
            _appEntityRepository = appEntityRepository;
            _SycEntityObjectTypesAppService = sycEntityObjectTypesAppService;
            _appEntityCategoryRepository = appEntityCategoryRepository;
            _appEntityClassificationRepository = appEntityClassificationRepository;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            _appItemSharingRepository = appItemSharingRepository;
            _appNotifier = appNotifier;
            _sycEntityObjectCategoryRepository = sycEntityObjectCategoryRepository;
            _sycEntityObjectClassificationRepository = sycEntityObjectClassificationRepository;
            //MMT
            _appSizeScalesHeaderRepository = appSizeScalesHeaderRepository;
            _appSizeScaleAppService = appSizeScaleAppService;
            _appItemPricesRepository = appItemPricesRepository;
            _sycEntityObjectClassificationsAppService = sycEntityObjectClassificationsAppService;
            _sycEntityObjectCategoriesAppService = sycEntityObjectCategoriesAppService;
            _sSycAttachmentCategoriesAppService = sSycAttachmentCategoriesAppService;
            _iAppSycIdentifierDefinitionsService = sycIdentifierDefinitionsAppService;
            _appItemSizeScalesHeaderRepository = appItemSizeScalesHeaderRepository;
            _appItemSizeScalesDetailRepository = appItemSizeScalesDetailRepository;
            _sycSegmentIdentifierDefinition = sycSegmentIdentifierDefinition;
            //MMT
            _appItemSelectorRepository = appItemSelectorRepository;
            _sycEntityObjectCategory = sycEntityObjectCategory;

        }
        //mmt
        //MMT2024
        private async Task<List<long>> LoadDepartmentChildern(long deptId)
        {
            //MMT

            //if (input.departmentFilters != null && input.departmentFilters.Count() > 0)
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                
                List<long> listDept = new List<long>();
                //foreach (var dept in input.departmentFilters)
                //{
                    var depts = await _sycEntityObjectCategoryRepository.GetAll().Where(z => z.ParentId == deptId && (z.TenantId==null || z.TenantId==AbpSession.TenantId)).Select(z => z.Id).ToListAsync();
                    if (depts != null && depts.Count() > 0)
                    {
                        listDept.AddRange(depts);
                        foreach (var d in depts)
                        {
                           var children =await LoadDepartmentChildern(d);
                    if (children != null && children.Count() > 0)
                    {
                        listDept.AddRange(children);

                    }
                        }
                    }
               
            return listDept;
            }
            //MMT
        }
        //MMT2024
        public async Task<PagedResultDto<GetAppItemForViewDto>> GetAll(GetAllAppItemsInput input)
        {
            var stopwatch = new System.Diagnostics.Stopwatch();
            stopwatch.Start();
            #region prepare parameters
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.FilterType == ItemsFilterTypesEnum.MyItems)
                { input.ItemType = 0; }
                if (input.FilterType == ItemsFilterTypesEnum.MyListing)
                { input.ItemType = 1; }
                if (input.FilterType == ItemsFilterTypesEnum.Public ||
                    input.FilterType == ItemsFilterTypesEnum.SharedWithMe ||
                    input.FilterType == ItemsFilterTypesEnum.SharedWithMeAndPublic)
                { input.ItemType = 2; }
                input.Sorting = input.Sorting ?? "id";
                List<long> AppItemListDetails = new List<long>();
                if (input.AppItemListId != null && input.AppItemListId > 0)
                {
                    AppItemListDetails = _appItemsListDetailRepository.GetAll().Where(x => x.ItemsListId == input.AppItemListId).Select(x => x.ItemId).ToList();
                }
                #region merge categories and departments
                if (input.CategoryFilters == null)
                    input.CategoryFilters = new long[] { };
                if (input.departmentFilters == null)
                    input.departmentFilters = new long[] { };
                //xx
                if (input.ScalesFilters == null)
                    input.ScalesFilters = new string[] { };

                var allScales = input.ScalesFilters.ToList();
                //xx
                //MMT
                var depts = input.departmentFilters.ToList();
                if (input.departmentFilters != null && input.departmentFilters.Count() > 0)
                {
                    List<long> listDept = new List<long>();
                    foreach (var dept in input.departmentFilters)
                    {
                        var children = await LoadDepartmentChildern(dept);
                        if (children != null && children.Count>0)
                        {
                            listDept.AddRange(children);
                        }            
                     }
                    foreach(var d in listDept)
                        depts.AddIfNotContains(d);
                }
                //MMT
                var allCategories = input.CategoryFilters.ToList();
                allCategories.AddRange(depts.ToList());
                input.CategoryFilters = allCategories.ToArray();
                #endregion merge categories and departments
                List<long> SelectedItems = new List<long>();
                if (input.SelectorKey != null)
                {
                    SelectedItems = _appItemSelectorRepository.GetAll().Where(e => e.Key == input.SelectorKey).Select(e => e.SelectedId).ToList();
                }
                if (input.SelectorOnly == true)
                {
                    input.SkipCount = 0;
                    input.MaxResultCount = SelectedItems.Count;
                }
                //get curr tenant id to pass to the sp
                input.TenantId = AbpSession.TenantId;
                if (input.ArrtibuteFilters == null)
                    input.ArrtibuteFilters = new List<ArrtibuteFilter>();
                var attrs = input.ArrtibuteFilters.Select(r => r.ArrtibuteValueId).ToList();
                #endregion
                var filteredAppItems = _appItemRepository.GetAll().AsNoTracking().Include(x => x.ItemSizeScaleHeadersFkList).Select(x => new
                {
                    x.PublishedListingItemFkList,
                    x.TenantId,
                    x.Code,
                    x.Price,
                    x.Name,
                    x.EntityFk.Notes,
                    x.Id,
                    x.EntityFk,
                    x.ParentFkList,
                    x.ListingItemFkList,
                    x.Description,
                    x.ParentId,
                    x.SharingLevel,
                    x.ItemType,
                    x.PublishedListingItemFk,
                    x.TenantOwner,
                    x.SSIN,
                    x.ItemSizeScaleHeadersFkList

                })
                .WhereIf(input.ArrtibuteFilters != null && input.ArrtibuteFilters.Count() > 0,
                e =>
                (e.EntityFk.EntityExtraData != null && e.EntityFk.EntityExtraData.Where(r => attrs.Contains(((long)r.AttributeValueId))).Count() > 0)
                ||
                (e.ParentFkList != null &&
                e.ParentFkList.Where(x1 => x1.EntityFk.EntityExtraData.Where(x2 => attrs.Contains((long)x2.AttributeValueId)).Count() > 0).Count() > 0)
                )
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                .WhereIf(input.FilterType == ItemsFilterTypesEnum.MyItems || input.FilterType == ItemsFilterTypesEnum.MyListing, a => a.TenantId == AbpSession.TenantId)
                .WhereIf(input.FilterType == ItemsFilterTypesEnum.MyOwnedItems, a => a.TenantId == AbpSession.TenantId && a.TenantOwner == AbpSession.TenantId)
                .WhereIf(input.FilterType == ItemsFilterTypesEnum.MyPatrnersItems, a => a.TenantId == AbpSession.TenantId && a.TenantOwner != AbpSession.TenantId)
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                //xx
                .WhereIf(input.ScalesFilters != null && input.ScalesFilters.Count() > 0, a => a.ItemSizeScaleHeadersFkList.Where(r => allScales.Contains(r.Name.TrimEnd())).Count() > 0)
                //xx
                .WhereIf(input.AppItemListId != null && input.AppItemListId > 0, e => AppItemListDetails.Contains(e.Id))
                .WhereIf(input.SelectorOnly == true && SelectedItems != null && SelectedItems.Count() > 0, e => SelectedItems.Contains(e.Id))
                //.WhereIf(input.VisibilityStatus > 0, e => e.PublishedListingItemFkList.Where(r => r.SharingLevel == input.VisibilityStatus).Count() > 0)
                //.WhereIf(input.PublishStatus > 0, e => (e.PublishedListingItemFkList != null && e.PublishedListingItemFkList.Count > 0 && input.PublishStatus == 1) || ((e.PublishedListingItemFkList == null || (e.PublishedListingItemFkList != null && e.PublishedListingItemFkList.Count == 0)) && input.PublishStatus == 2))
                // .WhereIf(input.ListingStatus > 0, e => (e.ListingItemFkList != null && e.ListingItemFkList.Count > 0 && input.ListingStatus == 2) || ((e.ListingItemFkList == null || (e.ListingItemFkList != null && e.ListingItemFkList.Count == 0)) && input.ListingStatus == 1))
                .WhereIf(input.EntityObjectTypeId > 0, e => e.EntityFk.EntityObjectTypeId == input.EntityObjectTypeId)
                .WhereIf(input.CategoryFilters != null && input.CategoryFilters.Count() > 0, e => e.EntityFk.EntityCategories.Where(r => allCategories.Contains(r.EntityObjectCategoryId)).Count() > 0)
                .WhereIf(input.ClassificationFilters != null && input.ClassificationFilters.Count() > 0, e => e.EntityFk.EntityClassifications.Where(r => input.ClassificationFilters.Contains(r.EntityObjectClassificationId)).Count() > 0)
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter))
                    //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                    //.Where(x => x.ParentId == null &&
                    //(
                    //(input.FilterType == ItemsFilterTypesEnum.MyItems && x.ItemType == input.ItemType && x.TenantId == AbpSession.TenantId && x.SharingLevel == 0)
                    //|| (input.FilterType == ItemsFilterTypesEnum.MyListing && x.ItemType == input.ItemType && x.TenantId == AbpSession.TenantId && x.SharingLevel == 0)
                    //|| ((input.FilterType == ItemsFilterTypesEnum.Public)
                    //     && x.SharingLevel == 1 && x.ItemType == input.ItemType)
                    //|| ((input.FilterType == ItemsFilterTypesEnum.SharedWithMe)
                    //    && x.TenantId != AbpSession.TenantId && (x.SharingLevel == 2 || x.SharingLevel == 1) && x.ItemType == input.ItemType
                    // && x.PublishedListingItemFk.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0)
                    //|| (
                    //      (input.FilterType == ItemsFilterTypesEnum.SharedWithMeAndPublic && x.ItemType == input.ItemType)
                    //    &&
                    //  (
                    //    (
                    //    (x.SharingLevel == 2 || x.SharingLevel == 1) && x.PublishedListingItemFk.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0
                    // )
                    //   ||
                    // (
                    //            x.SharingLevel == 1
                    //        )
                    //    )
                    //)
                    //    )
                    //    );
                    //D-SII-20230918.0001,1 MMT 09/19/2023 Display Items only and exclude listing[T-SII-20230829.0001][Start]
                    //.Where(x => x.ParentId == null);
                    .Where(x => x.ParentId == null && x.TenantId == AbpSession.TenantId && x.ItemType == 0);
                //D-SII-20230918.0001,1 MMT 09/19/2023 Display Items only and exclude listing[T-SII-20230829.0001][End]
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[END]


                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                //var filteredOrderedAppItems = filteredAppItems.OrderBy(input.Sorting ?? "id asc");
                //  .PageBy(input);
                var filteredOrderedAppItems = filteredAppItems.OrderBy(input.Sorting ?? "id asc");

                IQueryable<GetAppItemForViewDto> appItems = null;

                if (input.PublishStatus == 0)
                {
                    appItems = from d in filteredOrderedAppItems
                               join
                                          m in _appMarketplaceItem.GetAll().Where(a => a.TenantOwner == AbpSession.TenantId)
                                          on d.SSIN equals m.Code into j1
                               from j2 in j1.DefaultIfEmpty()
                               select new GetAppItemForViewDto()
                               {
                                   AppItem = new AppItemDto
                                   {

                                       Code = d.Code,
                                       Name = d.Name,
                                       Description = d.EntityFk.Notes,
                                       Price = d.Price,
                                       Id = d.Id,

                                       SSIN = d.SSIN,
                                       SharingLevel = j2.SharingLevel != null ? j2.SharingLevel.ToString() : null,

                                       Listed = d.ListingItemFkList.Count() > 0,
                                       // Published = d.PublishedListingItemFkList.Count() > 0,
                                       ImageUrl = (d.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                   (d.EntityFk.EntityAttachments.FirstOrDefault() == null ? "attachments/" + d.TenantId + "/" + d.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                   : "attachments/" + (d.TenantId.HasValue ? d.TenantId : -1) + "/" + d.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                   },
                                   Selected = (input.SelectorKey != null && SelectedItems != null && SelectedItems.Count > 0 && SelectedItems.Contains(d.Id)) ? true : false

                               };
                }
                else
                {
                    if (input.PublishStatus != 3) //(input.SharingLevel != "N")
                    {
                        var joined = filteredOrderedAppItems.Join(_appMarketplaceItem.GetAll().Where(a => a.TenantOwner == AbpSession.TenantId)
                                                  .WhereIf(input.PublishStatus == 1, a => a.SharingLevel == 1)
                                               .WhereIf(input.PublishStatus == 2, a => a.SharingLevel == 2)
                                               .WhereIf(input.PublishStatus == 4, a => a.SharingLevel == 4),
                       //  .WhereIf(input.SharingLevel == "N", a => a == null || a.SharingLevel == 3),
                       x => x.SSIN.Trim(), sa => sa.Code.Trim(), (s, sa) => new { item = s, marketplaceItem = sa });
                        appItems = from o in joined
                                   select new GetAppItemForViewDto()
                                   {
                                       AppItem = new AppItemDto
                                       {
                                           Code = o.item.Code,
                                           Name = o.item.Name,
                                           Description = o.item.EntityFk.Notes,
                                           Price = o.item.Price,
                                           Id = o.item.Id,

                                           SSIN = o.item.SSIN,
                                           SharingLevel = o.marketplaceItem != null ? o.marketplaceItem.SharingLevel.ToString() : null,
                                           //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                                           Listed = o.item.ListingItemFkList.Count() > 0,
                                           Published = o.item.PublishedListingItemFkList.Count() > 0,
                                           ImageUrl = (o.item.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                            (o.item.EntityFk.EntityAttachments.FirstOrDefault() == null ? "attachments/" + o.item.TenantId + "/" + o.item.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                            : "attachments/" + (o.item.TenantId.HasValue ? o.item.TenantId : -1) + "/" + o.item.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                       },
                                       Selected = (input.SelectorKey != null && SelectedItems != null && SelectedItems.Count > 0 && SelectedItems.Contains(o.item.Id)) ? true : false

                                   };
                    }
                    else
                    {
                        // var appItemsJoin 
                        //var appItemsJoin
                        appItems = from d in filteredOrderedAppItems.Where(z => (!_appMarketplaceItem.GetAll().Any(f => f.SSIN == z.SSIN && f.TenantOwner == AbpSession.TenantId)) || (_appMarketplaceItem.GetAll().Any(f => f.SSIN == z.SSIN && f.TenantOwner == AbpSession.TenantId && f.SharingLevel == 3)))
                                   join
                                         m in _appMarketplaceItem.GetAll().Where(a => a.TenantOwner == AbpSession.TenantId && a.SharingLevel == 3)
                                         on d.SSIN equals m.Code into j1
                                   from j2 in j1.DefaultIfEmpty()
                                   select new GetAppItemForViewDto()
                                   {
                                       AppItem = new AppItemDto
                                       {

                                           Code = d.Code,
                                           Name = d.Name,
                                           Description = d.EntityFk.Notes,
                                           Price = d.Price,
                                           Id = d.Id,
                                           //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                                           SSIN = d.SSIN,
                                           SharingLevel = j2.SharingLevel != null ? j2.SharingLevel.ToString() : null,
                                           //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                                           Listed = d.ListingItemFkList.Count() > 0,
                                           // Published = d.PublishedListingItemFkList.Count() > 0,
                                           ImageUrl = (d.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                       (d.EntityFk.EntityAttachments.FirstOrDefault() == null ? "attachments/" + d.TenantId + "/" + d.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                       : "attachments/" + (d.TenantId.HasValue ? d.TenantId : -1) + "/" + d.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                       },
                                       Selected = (input.SelectorKey != null && SelectedItems != null && SelectedItems.Count > 0 && SelectedItems.Contains(d.Id)) ? true : false

                                   };


                    }
                }



                var appItemsPage = appItems.PageBy(input);

                var appItemsList = await appItemsPage.ToListAsync();
                if (input.SelectorOnly != null && input.SelectorOnly == true)
                {
                    appItemsList = appItemsList.Where(e => e.Selected).ToList();
                }
                var totalCount = await appItems.CountAsync();

                stopwatch.Stop();
                var elapsed_time = stopwatch.ElapsedMilliseconds;

                return new PagedResultDto<GetAppItemForViewDto>(
                    totalCount,
                    appItemsList
                );
            }
        }
        //public async Task<PagedResultDto<GetAppItemForViewDto>> old_GetAll(GetAllAppItemsInput input)
        //{
        //    var stopwatch = new System.Diagnostics.Stopwatch();
        //    stopwatch.Start();
        //    #region prepare parameters
        //    if (input.FilterType == ItemsFilterTypesEnum.MyItems)
        //    { input.ItemType = 0; }
        //    if (input.FilterType == ItemsFilterTypesEnum.MyListing)
        //    { input.ItemType = 1; }
        //    if (input.FilterType == ItemsFilterTypesEnum.Public ||
        //        input.FilterType == ItemsFilterTypesEnum.SharedWithMe ||
        //        input.FilterType == ItemsFilterTypesEnum.SharedWithMeAndPublic)
        //    { input.ItemType = 2; }
        //    input.Sorting = input.Sorting ?? "id";
        //    List<long> AppItemListDetails = new List<long>();
        //    if (input.AppItemListId != null && input.AppItemListId > 0)
        //    {
        //        AppItemListDetails = _appItemsListDetailRepository.GetAll().Where(x => x.ItemsListId == input.AppItemListId).Select(x => x.ItemId).ToList();
        //    }
        //    //if (input.SelectorOption == null)
        //    //{ input.SelectorOption = SelectorOptionsEnum.NONE; }
        //    #endregion prepare parameters
        //    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
        //    {
        //        #region merge categories and departments
        //        if (input.CategoryFilters == null)
        //            input.CategoryFilters = new long[] { };
        //        if (input.departmentFilters == null)
        //            input.departmentFilters = new long[] { };
        //        var allCategories = input.CategoryFilters.ToList();
        //        allCategories.AddRange(input.departmentFilters.ToList());
        //        input.CategoryFilters = allCategories.ToArray();
        //        #endregion merge categories and departments
        //        List<long> SelectedItems = new List<long>();
        //        if (input.SelectorKey != null)
        //        {
        //            SelectedItems = _appItemSelectorRepository.GetAll().Where(e => e.Key == input.SelectorKey).Select(e => e.SelectedId).ToList();
        //        }
        //        //get curr tenant id to pass to the sp
        //        input.TenantId = AbpSession.TenantId;
        //        if (input.ArrtibuteFilters == null)
        //            input.ArrtibuteFilters = new List<ArrtibuteFilter>();
        //        var attrs = input.ArrtibuteFilters.Select(r => r.ArrtibuteValueId).ToList();
        //        var filteredAppItems = _appItemRepository.GetAll()
        //        .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
        //        //  .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
        //        //.Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories).OrderBy("id")
        //        .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
        //        .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
        //        .Include(x => x.ParentFkList)
        //       // .Include(x => x.ListingItemFkList)
        //       // .Include(x => x.PublishedListingItemFkList)
        //        .WhereIf(input.AppItemListId != null && input.AppItemListId > 0, e => AppItemListDetails.Contains(e.Id))
        //        .WhereIf(input.ArrtibuteFilters != null && input.ArrtibuteFilters.Count() > 0,
        //        e =>
        //        (e.EntityFk.EntityExtraData != null && e.EntityFk.EntityExtraData.Where(r => attrs.Contains(((long)r.AttributeValueId))).Count() > 0)
        //        ||
        //        (e.ParentFkList != null &&
        //        e.ParentFkList.Where(x1 => x1.EntityFk.EntityExtraData.Where(x2 => attrs.Contains((long)x2.AttributeValueId)).Count() > 0).Count() > 0)
        //        )
        //        //.WhereIf(input.VisibilityStatus > 0, e => e.PublishedListingItemFkList.Where(r => r.SharingLevel == input.VisibilityStatus).Count() > 0)
        //        //.WhereIf(input.PublishStatus > 0, e => (e.PublishedListingItemFkList != null && e.PublishedListingItemFkList.Count > 0 && input.PublishStatus == 1) || ((e.PublishedListingItemFkList == null || (e.PublishedListingItemFkList != null && e.PublishedListingItemFkList.Count == 0)) && input.PublishStatus == 2))
        //        //.WhereIf(input.ListingStatus > 0, e => (e.ListingItemFkList != null && e.ListingItemFkList.Count > 0 && input.ListingStatus == 2) || ((e.ListingItemFkList == null || (e.ListingItemFkList != null && e.ListingItemFkList.Count == 0)) && input.ListingStatus == 1))
        //        .WhereIf(input.EntityObjectTypeId > 0, e => e.EntityFk.EntityObjectTypeId == input.EntityObjectTypeId)
        //        .WhereIf(input.CategoryFilters != null && input.CategoryFilters.Count() > 0, e => e.EntityFk.EntityCategories.Where(r => allCategories.Contains(r.EntityObjectCategoryId)).Count() > 0)
        //        .WhereIf(input.ClassificationFilters != null && input.ClassificationFilters.Count() > 0, e => e.EntityFk.EntityClassifications.Where(r => input.ClassificationFilters.Contains(r.EntityObjectClassificationId)).Count() > 0)
        //        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter))
        //        //.Where(x => ((xx.Contains(x.Id) || true) &&
        //       // .Where(x => x.ParentId == null &&
        //        (
        //        (input.FilterType == ItemsFilterTypesEnum.MyItems && x.ItemType == input.ItemType && x.TenantId == AbpSession.TenantId && x.SharingLevel == 0)
        //        || (input.FilterType == ItemsFilterTypesEnum.MyListing && x.ItemType == input.ItemType && x.TenantId == AbpSession.TenantId && x.SharingLevel == 0)
        //        || ((input.FilterType == ItemsFilterTypesEnum.Public)
        //              && x.SharingLevel == 1 && x.ItemType == input.ItemType)
        //        || ((input.FilterType == ItemsFilterTypesEnum.SharedWithMe)
        //              && x.TenantId != AbpSession.TenantId && (x.SharingLevel == 2 || x.SharingLevel == 1) && x.ItemType == input.ItemType
        //              && x.PublishedListingItemFk.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0)
        //        || (
        //                (input.FilterType == ItemsFilterTypesEnum.SharedWithMeAndPublic && x.ItemType == input.ItemType)
        //                &&
        //                (
        //                    (
        //                      (x.SharingLevel == 2 || x.SharingLevel == 1) && x.PublishedListingItemFk.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0
        //                    )
        //                    ||
        //                    (
        //                        x.SharingLevel == 1
        //                    )
        //                )
        //            )
        //                ));
        //        var filteredOrderedAppItems = filteredAppItems.OrderBy(input.Sorting ?? "id asc")
        //           .PageBy(input);
        //        var appItems = from o in filteredOrderedAppItems
        //                       select new GetAppItemForViewDto()
        //                       {
        //                           AppItem = new AppItemDto
        //                           {
        //                               Code = o.Code,
        //                               Name = o.Name,
        //                               Description = o.EntityFk.Notes,
        //                               Price = o.Price,
        //                               Id = o.Id,
        //                               Listed = o.ListingItemFkList.Count() > 0,
        //                               Published = o.PublishedListingItemFkList.Count() > 0,
        //                               ImageUrl = (o.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
        //                                (o.EntityFk.EntityAttachments.FirstOrDefault() == null ? "attachments/" + o.TenantId + "/" + o.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
        //                                : "attachments/" + (o.TenantId.HasValue ? o.TenantId : -1) + "/" + o.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
        //                           },
        //                           Selected = (input.SelectorKey != null && SelectedItems != null && SelectedItems.Count > 0 && SelectedItems.Contains(o.Id)) ? true : false

        //                       };
        //        var appItemsList = await appItems.ToListAsync();
        //        if (input.SelectorOnly != null && input.SelectorOnly == true)
        //        {
        //            appItemsList = appItemsList.Where(e => e.Selected).ToList();
        //        }
        //        var totalCount = await filteredAppItems.CountAsync();
        //        stopwatch.Stop();
        //        var elapsed_time = stopwatch.ElapsedMilliseconds;
        //        return new PagedResultDto<GetAppItemForViewDto>(
        //            totalCount,
        //            appItemsList
        //        );
        //    }

        //}

        public async Task<PagedResultDto<LookupLabelDto>> GetSecondAttributeValues(ExtraDataSecondAttributeValuesInput input)
        {
            //get all child items
            // get all entity ids for that first attribute id, value
            // get all values for entity ids for second attribute
            // return paged
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var entityIds = _appItemRepository.GetAll()
            .AsNoTracking().Where(x => x.ParentId == input.ItemId).Select(r => r.EntityId).ToList();

                if (entityIds != null && entityIds.Count > 0)
                {
                    var firstAttributeEntityIds = _appEntityExtraDataRepository.GetAll().Where(r => entityIds.Contains(r.EntityId) && r.AttributeId == input.FirstAttributeId && r.AttributeValue == input.Value).Select(r => r.EntityId).ToList();
                    if (firstAttributeEntityIds != null && firstAttributeEntityIds.Count > 0)
                    {
                        var secondAttributeValues = _appEntityExtraDataRepository.GetAll().Where(r => firstAttributeEntityIds.Contains(r.EntityId) && r.AttributeId == input.SecondAttributeId).Select(r => new LookupLabelDto { Label = r.AttributeValue, Value = (long)r.AttributeValueId }).Distinct();
                        var secondAttributeValuesPaged = secondAttributeValues.OrderBy(input.Sorting ?? "Value asc").PageBy(input);
                        var ret = secondAttributeValuesPaged.ToList();

                        return new PagedResultDto<LookupLabelDto>(secondAttributeValues.ToList().Count, ret);
                    }
                }
                return new PagedResultDto<LookupLabelDto>(0, new List<LookupLabelDto>());
            }
        }
        public async Task<List<AppEntityAttachmentDto>> GetFirstAttributeAttachments(ExtraDataFirstAttributeAttachmentsInput input)
        {
            // get all child items
            // get all entity ids for that first attribute id, value
            // get all values for entity ids for second attribute
            // return paged
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var entities = _appItemRepository.GetAll()
                              .AsNoTracking().Where(x => x.ParentId == input.ItemId).ToList();
                var entityIds = entities.Select(r => r.EntityId).ToList();

                if (entityIds != null && entityIds.Count > 0)
                {
                    var firstAttributeEntityIds = _appEntityExtraDataRepository.GetAll().Where(r => entityIds.Contains(r.EntityId) && r.AttributeId == input.FirstAttributeId && r.AttributeValue == input.Value).Select(r => r.EntityId).ToList();
                    if (firstAttributeEntityIds != null && firstAttributeEntityIds.Count > 0)
                    {
                        List<long> EntityIds = new List<long>();
                        EntityIds.Add(firstAttributeEntityIds[0]);
                        //var listOfAppEntityAttachmentDto = await _appEntitiesAppService.GetAppEntitysAttachmentsWithPaging(new GetAppEntitysAttributesInput() { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityIds = EntityIds });
                        var listOfAppEntityAttachmentDto = await _appEntitiesAppService.GetAppEntitysAttachmentsWithPaging(new GetAppEntitysAttributesInput() { TenantId = entities.FirstOrDefault().TenantId, EntityIds = EntityIds });

                        return listOfAppEntityAttachmentDto.Items.ToList();
                    }
                }
                return new List<AppEntityAttachmentDto>(new List<AppEntityAttachmentDto>());
            }
        }

        public async Task<PagedResultDto<ExtraDataSelectedValues>> GetFirstAttributeValues(ExtraDataFirstAttributeValuesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItem = await _appItemRepository.GetAll()
               .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.ItemId);
                string variations = appItem.Variations;
                var variationsDto = new List<ExtraDataAttrDto>();
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                if (!string.IsNullOrEmpty(variations))
                {
                    List<string> variationsLists = variations.Split(';').ToList();
                    if (variationsLists != null && variationsLists.Count > 5)
                    {
                        List<string> attributeValues = variationsLists[0].Split('|').ToList();
                        List<string> attributeIDs = variationsLists[1].Split('|').ToList();
                        attributeIDs = attributeIDs.Select(r => r.Split(',')[0]).ToList();
                        List<string> firstattributeValuesMain = variationsLists[2].Split('|').ToList();
                        int firstattributeValuesMainCount = variationsLists[2].Split('|').ToList().Count;
                        List<string> firstattributeValues = firstattributeValuesMain.GetRange(Math.Max(0, input.SkipCount), Math.Min(input.MaxResultCount, variationsLists[2].Split('|').ToList().Count - Math.Max(0, input.SkipCount))).ToList();
                        List<string> firstattributeDefaultImages = variationsLists[3].Split('|').ToList();
                        int loop = input.SkipCount;
                        var ret = new List<ExtraDataSelectedValues>();
                        foreach (var firstattributeValue in firstattributeValues)
                        {
                            ret.Add(new ExtraDataSelectedValues() { value = firstattributeValue, TotalCount = firstattributeValuesMainCount, DefaultEntityAttachment = new AppEntityAttachmentDto() { Url = firstattributeDefaultImages[loop] } });
                            loop = loop + 1;
                        }
                        return new PagedResultDto<ExtraDataSelectedValues>(firstattributeValuesMain.Count, ret);
                    }
                }
                return new PagedResultDto<ExtraDataSelectedValues>(0, new List<ExtraDataSelectedValues>());
            }
        }
        public async Task<List<AppItemVariationsDto>> GetItemVariationDataForView(long appItemId, long extraAttributeId, string extraAttributeCode)
        {
            var appItems = await _appItemRepository.GetAll().Include(x => x.ItemPricesFkList)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
               .Where(a => a.ParentId == appItemId & a.EntityFk.EntityExtraData.Where(b => b.AttributeId == extraAttributeId & b.AttributeValue == extraAttributeCode).Count() > 0).ToListAsync();
            var returnVariationObj = new List<AppItemVariationsDto>();
            //foreach (var )
            //{
            //    returnVariationObj = ObjectMapper.Map<List<AppItemVariationsDto>>(appItems);
            //}
            //returnVariationObj.ForEach(x => x.appItemPriceInfos = ObjectMapper.Map<List<AppItemPriceInfo>>(x.pri);
            return returnVariationObj;
        }
        public async Task<List<AppItemAttributePriceDto>> GetAppItemPrice(long appItemId, string priceLevel, string currencyCode, long? attributeId, string attributeCode)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                List<AppItemAttributePriceDto> appItemAttributePriceDto = new List<AppItemAttributePriceDto>();
                var appItems = await _appItemRepository.GetAll().Include(x => x.ItemPricesFkList.Where(s => s.Code == priceLevel && s.CurrencyCode == currencyCode))
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)

                    .Where(x => x.ParentId == appItemId).ToListAsync();
                if (appItems != null && appItems.Count > 0)
                {
                    var filteredItems = appItems.Where(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == attributeId && z.AttributeValue == attributeCode).Count() > 0).ToList();
                    foreach (var item in filteredItems)
                    {
                        // item.ItemPricesFkList = await  _appItemPricesRepository.GetAll()
                        //   .Where(s=> s.AppItemId == item.Id && s.Code== priceLevel && s.CurrencyCode==currencyCode).ToListAsync();
                        var extraAttributes = item.EntityFk.EntityExtraData.Where(z => (item.EntityFk.EntityExtraData.Count() > 1 ? z.AttributeId != attributeId : z.AttributeId == attributeId) && z.AttributeValue != null).ToList();
                        if (extraAttributes != null && extraAttributes.Count > 0)
                        {
                            foreach (var extr in extraAttributes)
                            {
                                if (extr.AttributeValue == null)
                                    continue;
                                appItemAttributePriceDto.Add(new AppItemAttributePriceDto
                                {
                                    AppItemId = item.Id,
                                    AppItemCode = item.Code,
                                    AttibuteCode = extr.AttributeCode,
                                    AttributeValue = extr.AttributeValue,
                                    Price = item.ItemPricesFkList != null && item.ItemPricesFkList.Count > 0 &&
                                          item.ItemPricesFkList.FirstOrDefault(x => x.CurrencyCode == currencyCode & x.Code == priceLevel) != null ? item.ItemPricesFkList.FirstOrDefault(x => x.CurrencyCode == currencyCode & x.Code == priceLevel).Price : 0
                                });
                            }
                        }
                    }
                }
                //Sort by Size Id
                var appItem = await _appItemRepository.GetAll().Include(z => z.ItemSizeScaleHeadersFkList).ThenInclude(z => z.AppItemSizeScalesDetails).
                     FirstOrDefaultAsync(z => z.Id == appItemId);

                string attribName = "";
                if (appItems.FirstOrDefault().EntityFk.EntityExtraData.FirstOrDefault(a => a.AttributeId != attributeId) != null)
                    attribName = appItems.FirstOrDefault().EntityFk.EntityExtraData.FirstOrDefault(a => a.AttributeId != attributeId).EntityObjectTypeCode;

                if (attribName == "SIZE" && appItem.ItemSizeScaleHeadersFkList != null && appItem.ItemSizeScaleHeadersFkList.Count() > 0)
                {
                    List<AppItemAttributePriceDto> appRetItemAttributePriceDto = new List<AppItemAttributePriceDto>();
                    var xx = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                    var zz = xx.AppItemSizeScalesDetails.OrderBy(s => s.D1Position).OrderBy(s => s.D2Position).OrderBy(s => s.D3Position).Select(a => a.SizeCode).ToList();
                    var ss = appItemAttributePriceDto;
                    //secondAttributeValuesFor1st = xx.AppItemSizeScalesDetails.OrderBy(s => s.D1Position).OrderBy(s => s.D2Position).OrderBy(s => s.D3Position).Select(a => a.SizeCode).ToList();
                    foreach (var t in zz)
                    {
                        if (ss.FirstOrDefault(z => z.AttributeValue == t) != null)
                            appRetItemAttributePriceDto.Add(ss.FirstOrDefault(z => z.AttributeValue == t));
                    }
                    return appRetItemAttributePriceDto;

                }
                //End
                return appItemAttributePriceDto;
            }
        }
        //MMT
        public async Task<GetAppItemDetailForViewDto> GetAppItemForView(GetAppItemWithPagedAttributesForViewInput input)
        {
            //MMT
            var stopwatch = new System.Diagnostics.Stopwatch();
            stopwatch.Start();
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
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItem = await _appItemRepository.GetAll()
               .Include(x => x.ItemPricesFkList).ThenInclude(x => x.CurrencyFk).ThenInclude(x => x.EntityExtraData)
               .Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(x => x.AppItemSizeScalesDetails)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectTypeFk)
               .Include(x => x.ListingItemFkList)
               .Include(x => x.PublishedListingItemFkList)
               //.Include(x => x.ItemPricesFkList).ThenInclude(y => y.CurrencyFk)
               .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.ItemId);

                var varAppItems = await _appItemRepository.GetAll().Include(x => x.ItemPricesFkList)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.ListingItemFkList)
                .Include(x => x.PublishedListingItemFkList)
                .Include(x => x.ItemPricesFkList).ThenInclude(y => y.CurrencyFk).ThenInclude(x => x.EntityExtraData)
                .AsNoTracking().Where(x => x.ParentId == input.ItemId).ToListAsync();



                var output = new GetAppItemDetailForViewDto { AppItem = ObjectMapper.Map<AppItemForViewDto>(appItem) };
                //
                output.AppItem.AppItemSizesScaleInfo
                    .ForEach(a => a.AppSizeScalesDetails = a.AppSizeScalesDetails.OrderBy(d => d.D1Position).OrderBy(d => d.D2Position).OrderBy(d => d.D3Position).ToList());
                //
                if (appItem != null)
                {
                    string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";


                    if (output.AppItem != null && output.AppItem.EntityAttachments != null && output.AppItem.EntityAttachments.Count > 0)
                    { output.AppItem.EntityAttachments = output.AppItem.EntityAttachments.OrderByDescending(r => r.IsDefault).ToList(); }
                    foreach (var item in output.AppItem.EntityAttachments)
                    { item.Url = imagesUrl + (appItem.TenantId.HasValue ? appItem.TenantId.ToString() : "-1") + @"/" + item.FileName; }

                    if (appItem.ItemPricesFkList.Count != 0)
                    {
                        var msrpObj = appItem.ItemPricesFkList.Where(x => x.Code == "MSRP" & x.CurrencyCode == currencyCode).FirstOrDefault();
                        if (msrpObj != null)
                        {
                            output.AppItem.MaxPrice = msrpObj.Price;  //output.AppItem.Price;
                            output.AppItem.MinPrice = msrpObj.Price;
                        }
                    }
                    //MMT
                    foreach (var prObj in varAppItems)
                    {
                        if (prObj.ItemPricesFkList.Count > 0)
                        {
                            var itemPrice = prObj.ItemPricesFkList.Where(x => x.Code.ToUpper() == "MSRP" & x.CurrencyCode == currencyCode).Select(x => x.Price).FirstOrDefault();
                            if (itemPrice != 0)
                            {
                                output.AppItem.MaxPrice = output.AppItem.MaxPrice > itemPrice ? output.AppItem.MaxPrice : itemPrice;
                                output.AppItem.MinPrice = output.AppItem.MinPrice > itemPrice ? itemPrice : output.AppItem.MinPrice;
                            }
                        }
                    }
                    //MMT
                    //MMT33-2
                    output.AppItem.ShowSync = false;
                    var marketplaceItem = await _appMarketplaceItem.GetAll().Where(a => a.Code == appItem.SSIN).FirstOrDefaultAsync();
                    if (marketplaceItem != null)
                    {
                        output.AppItem.SharingLevel = marketplaceItem.SharingLevel;

                        if (marketplaceItem.TimeStamp < appItem.TimeStamp)
                            output.AppItem.ShowSync = true;


                    }
                    else
                    {
                        output.AppItem.ShowSync = false;
                        output.AppItem.SharingLevel = 0;
                    }
                    if (output.AppItem.SharingLevel == 0)
                    {
                        output.AppItem.NumberOfSubscribers = 0;
                    }
                    else
                    {
                        var subscribersCnt = await _appEntityRepository.CountAsync(a => a.Code == appItem.SSIN & a.TenantId != null & a.TenantId != a.TenantOwner);
                        output.AppItem.NumberOfSubscribers = subscribersCnt;
                    }
                    //T-SII-20230917.0004,1 MMT 11/30/2023 Get the Item shared with users[Start]
                    if (output.AppItem.SharingLevel == 2)
                    {
                        output.AppItem.ItemSharing = new List<ItemSharingDto>();
                        var sharedUsers = await _appMarketplaceItemSharing.GetAll().Where(a => a.AppMarketplaceItemId == marketplaceItem.Id).ToListAsync();
                        if (sharedUsers != null && sharedUsers.Count > 0)
                        {
                            output.AppItem.ItemSharing = ObjectMapper.Map<List<ItemSharingDto>>(sharedUsers);
                            if (output.AppItem.ItemSharing != null && output.AppItem.ItemSharing.Count > 0)
                            {
                                foreach (var user in output.AppItem.ItemSharing)
                                {
                                    var userObj = UserManager.GetUserById(long.Parse(user.SharedUserId.ToString()));
                                    if (userObj != null)
                                    {
                                        user.SharedUserSureName = userObj.Surname;
                                        user.SharedUserName = userObj.Name;
                                        user.SharedUserEMail = userObj.EmailAddress;
                                        user.SharedTenantId = userObj.TenantId;
                                        string tenantName = "";
                                        if (userObj.TenantId != null)
                                        {
                                            var tenant = TenantManager.GetById(int.Parse(userObj.TenantId.ToString()));
                                            if (tenant != null)
                                                tenantName = tenant.TenancyName;
                                        }
                                        else
                                        {
                                            tenantName = "SIIWII";
                                        }
                                        user.SharedUserTenantName = tenantName;
                                    }
                                }
                            }
                        }
                    }
                    //T-SII-20230917.0004,1 MMT 11/30/2023 Get the Item shared with users[End]


                    if (!string.IsNullOrEmpty(appItem.LastModificationTime.ToString()))
                        output.AppItem.LastModifiedDate = DateTime.Parse(appItem.LastModificationTime.ToString());
                    else
                    {
                        if (!string.IsNullOrEmpty(appItem.CreationTime.ToString()))
                            output.AppItem.LastModifiedDate = DateTime.Parse(appItem.CreationTime.ToString());
                    }

                    if (output.AppItem.LastModifiedDate != null && !string.IsNullOrEmpty(input.TimeZoneValue))
                    {
                        var currentTimeZone = TimeZone.CurrentTimeZone.StandardName.ToString();
                        var utcValue = _timeZoneInfoAppService.GetUTCDatetimeValue(output.AppItem.LastModifiedDate, currentTimeZone);
                        output.AppItem.LastModifiedDate = _timeZoneInfoAppService.GetDatetimeValueFromUTC(utcValue, input.TimeZoneValue);
                    }
                    //MMT33-2
                    //if (varAppItems.Select(r => r.Price).Count() > 0)
                    //{
                    //    output.AppItem.MaxPrice = varAppItems.Select(r => r.Price).Max();
                    //    output.AppItem.MinPrice = varAppItems.Select(r => r.Price).Min();
                    //}
                    //MMT
                    // T-SII-20230511.0001,1 MMT 05/14/2023-Wrong total product available quantities in product view mode[Start]
                    //if (varAppItems.Select(r => r.StockAvailability).Sum() > 0)
                    if (varAppItems.Select(r => r.StockAvailability).Sum() >= 0)
                    // T-SII-20230511.0001,1 MMT 05/14/2023-Wrong total product available quantities in product view mode[End]
                    {
                        output.AppItem.StockAvailability = varAppItems.Select(r => r.StockAvailability).Sum();
                    }
                    //MMT

                    var EntityExtraDataList = output.AppItem.EntityExtraData;
                    output.AppItem.Recommended = new List<ExtraDataAttrDto>();
                    output.AppItem.Additional = new List<ExtraDataAttrDto>();

                    if (input.GetAppItemAttributesInputForExtraData == null)
                        input.GetAppItemAttributesInputForExtraData = new GetAppItemExtraAttributesInput();

                    input.GetAppItemAttributesInputForExtraData.recommandedOrAdditional = RecommandedOrAdditional.RECOMMENDED;
                    input.GetAppItemAttributesInputForExtraData.ItemEntityId = output.AppItem.EntityId;
                    input.GetAppItemAttributesInputForExtraData.EntityObjectTypeId = appItem.EntityFk.EntityObjectTypeId;
                    output.AppItem.Recommended = GetAppItemExtraDataWithPaging(input.GetAppItemAttributesInputForExtraData).Result.Items.ToList();

                    input.GetAppItemAttributesInputForExtraData.recommandedOrAdditional = RecommandedOrAdditional.ADDITIONAL;
                    output.AppItem.Additional = GetAppItemExtraDataWithPaging(input.GetAppItemAttributesInputForExtraData).Result.Items.ToList();

                    //read first attribute values and default images, and second attribute values
                    //string variations = "COLOR|SZIE;101|105;RED|WHITE|BLACK;2688e3fa-df0e-0e4f-d2d4-a8d5b8959c08.jpg||2688e3fa-df0e-0e4f-d2d4-a8d5b8959c08.jpg;3X|4X";
                    string variations = appItem.Variations;
                    output.AppItem.variations = new List<ExtraDataAttrDto>();
                    if (!string.IsNullOrEmpty(variations))
                    {
                        //MMT
                        string firstAttributeId = "";
                        var frstAttId = varAppItems.Select(x => x.EntityFk.EntityAttachments.Where(z => z.Attributes.Contains("=")).Select(a => a.Attributes)).FirstOrDefault();
                        if (frstAttId != null & frstAttId.Count() > 0)
                            firstAttributeId = frstAttId.FirstOrDefault().ToString().Split("=")[0];

                        var firstItem = varAppItems.FirstOrDefault();
                        List<string> attributeValues = firstItem.EntityFk.EntityExtraData.Select(x => x.EntityObjectTypeCode).Distinct().ToList();
                        List<string> attributeIDs = firstItem.EntityFk.EntityExtraData.Select(x => x.AttributeId.ToString()).Distinct().ToList();
                        var firstAttributeID = firstItem.EntityFk.EntityExtraData.WhereIf(!string.IsNullOrEmpty(firstAttributeId), a => a.AttributeId == long.Parse(firstAttributeId)).Select(x => x.AttributeId)
                            .FirstOrDefault().ToString();
                        var secondAttId = attributeIDs.FirstOrDefault(a => a != firstAttributeID.ToString());
                        var firstAttributeValue = firstItem.EntityFk.EntityExtraData.WhereIf(!string.IsNullOrEmpty(firstAttributeId), a => a.AttributeId == long.Parse(firstAttributeId)).Select(x => x.EntityObjectTypeCode.ToString()).FirstOrDefault();
                        //var firstattributeValues1 = varAppItems.Select(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID1)).Select (z=> z.AttributeValue)).Distinct().ToList ();
                        var firstattributeValues = varAppItems.Select(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID))
                                                   .Select(z => z.AttributeValue)).Distinct().Select(a => a.FirstOrDefault()).Distinct().ToList();//.ToList().FirstOrDefault().Distinct().ToList();
                        int firstattributeValuesCount = firstattributeValues.Count();
                        var firstattributeDefaultImages1 = varAppItems.Select(x => x.EntityFk.EntityAttachments.Where(z => z.Attributes.Contains(firstAttributeID) & z.IsDefault).Select(z => new { z.AttachmentFk.Attachment, z.Attributes })).ToList().Distinct().ToList().Distinct().ToList();
                        var firstattributeDefaultImages = firstattributeDefaultImages1.Select(x => x.FirstOrDefault()).Distinct().ToList();
                        var secondAttributeValuesFor1st = new List<string>();
                        //xx
                        var firstattributeCodes = varAppItems.Select(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID)).Select(z => new { z.AttributeCode, z.AttributeValue, z.AttributeValueId })).Distinct().Select(a => a.FirstOrDefault()).Distinct().ToList();
                        //xx
                        //var secondAttributeValuesFor1st11 = varAppItems.Select(x => 
                        //    x.EntityFk.EntityExtraData.Where(z=> z.AttributeId != long.Parse(firstAttributeID)).Select(z=>z.EntityFk.EntityExtraData)).ToList();
                        var firstAttributeIdLong = long.Parse(firstAttributeID);
                        List<AppEntityExtraData> secondAttributeValuesFor1st11 = null;
                        if (secondAttId != null) secondAttributeValuesFor1st11 = varAppItems.Select(z => z.EntityFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == long.Parse(secondAttId))).ToList();
                        if (secondAttributeValuesFor1st11 != null)
                        {
                            //var secondAttributeValuesFor1st1 =
                            //    secondAttributeValuesFor1st11.Select(a => a..FirstOrDefault ().AttributeValue.ToString() + "," + 
                            //    (a.FirstOrDefault().AttributeCode.ToString() == null ? a.FirstOrDefault().AttributeValueId.ToString() : a.FirstOrDefault().AttributeCode.ToString()))
                            //    .ToList().Distinct().ToList().Distinct().ToList();
                            var secondAttributeValuesFor1st1 =
                            secondAttributeValuesFor1st11.Select(a => a.AttributeValue.ToString() + "," + a.AttributeValueId.ToString()).ToList();
                            //(a.AttributeCode.ToString() == null ? a.AttributeValueId.ToString() : a.AttributeCode.ToString()))
                            //.ToList();
                            if (secondAttributeValuesFor1st1 != null && secondAttributeValuesFor1st1.Count > 0)
                            {
                                var attribName = firstItem.EntityFk.EntityExtraData.FirstOrDefault(a => a.AttributeId == long.Parse(secondAttId)).EntityObjectTypeCode;
                                if (attribName == "SIZE" && appItem.ItemSizeScaleHeadersFkList != null && appItem.ItemSizeScaleHeadersFkList.Count() > 0)
                                {
                                    var xx = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                                    var zz = xx.AppItemSizeScalesDetails.OrderBy(s => Convert.ToInt32(s.D1Position)).OrderBy(s => Convert.ToInt32(s.D2Position)).OrderBy(s => Convert.ToInt32(s.D3Position)).Select(a => a.SizeCode.TrimEnd() + "," + a.SizeId.ToString()).ToList();
                                    var ss = secondAttributeValuesFor1st1.Distinct().ToList();
                                    secondAttributeValuesFor1st = xx.AppItemSizeScalesDetails.OrderBy(s => Convert.ToInt32(s.D1Position))
                                        .OrderBy(s => Convert.ToInt32(s.D2Position)).OrderBy(s => Convert.ToInt32(s.D3Position)).Select(a => a.SizeCode.TrimEnd() + "," + a.SizeId.ToString()).ToList();
                                    foreach (var t in zz)
                                    {
                                        if (!ss.Contains(t.Split(',')[0].ToString()+','))
                                            secondAttributeValuesFor1st.Remove(t.ToString());
                                    }
                                    //secondAttributeValuesFor1st = zz;

                                }
                                else
                                    secondAttributeValuesFor1st = secondAttributeValuesFor1st1.Distinct().ToList();
                            }
                            // if (secondAttributeValuesFor1st1.FirstOrDefault() != null)
                            //  {
                            //      secondAttributeValuesFor1st = secondAttributeValuesFor1st1.FirstOrDefault().Distinct().ToList();
                            //  }
                        }




                        //MMT

                        List<string> variationsLists = variations.Split(';').ToList();
                        // if (variationsLists != null && variationsLists.Count > 5)
                        if (variationsLists != null)
                        {
                            //List<string> attributeValues = variationsLists[0].Split('|').ToList();
                            //List<string> attributeIDs = variationsLists[1].Split('|').ToList();
                            //attributeIDs = attributeIDs.Select(r => r.Split(',')[0]).ToList();

                            //var firstAttributeID = variationsLists[1].Split('|').ToList().Where(r => r.Split(',')[1] == "1").FirstOrDefault();
                            //firstAttributeID = firstAttributeID.Split(',')[0];

                            //var firstAttributeValue = variationsLists[0].Split('|').ToList().Where(r => r.Split(',')[1] == "1").FirstOrDefault();
                            //firstAttributeValue = firstAttributeValue.Split(',')[0];

                            //int firstattributeValuesCount = variationsLists[2].Split('|').ToList().Count;
                            //List<string> firstattributeValues = variationsLists[2].Split('|').ToList().GetRange(0, Math.Min(10, variationsLists[2].Split('|').ToList().Count)).ToList();
                            //List<string> firstattributeDefaultImages = variationsLists[3].Split('|').ToList();
                            //List<string> secondAttributeValuesFor1st = variationsLists[4].Split('|').ToList();

                            //if (attributeIDs.Count > 0)
                            //{ 
                            var extraDataAttrDto = new ExtraDataAttrDto();
                            extraDataAttrDto.extraAttrName = firstAttributeValue;
                            extraDataAttrDto.selectedValuesTotalCount = firstattributeValuesCount;
                            extraDataAttrDto.extraAttributeId = long.Parse(firstAttributeID);
                            extraDataAttrDto.selectedValues = new List<ExtraDataSelectedValues>();
                            int imageLoopCounter = 0;
                            bool firstAttributeRelatedAdded = false;
                            foreach (string varItem in firstattributeValues)
                            {
                                ExtraDataSelectedValues extraDataSelectedValues = new ExtraDataSelectedValues();
                                extraDataSelectedValues.value = varItem;
                                extraDataSelectedValues.DefaultEntityAttachment = new AppEntityAttachmentDto();
                                //YYY
                                var tenantIdvar = AbpSession.TenantId;
                                if (appItem.TenantId != AbpSession.TenantId)
                                {
                                    var orgItems = _appItemRepository.GetAll()
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

                                imageLoopCounter = imageLoopCounter + 1;
                                // if (firstAttributeRelatedAdded == false)
                                if (true)
                                {
                                    extraDataSelectedValues.EDRestAttributes = new List<EDRestAttributes>();
                                    //MMT
                                    if (attributeIDs.Count == 1)
                                    {
                                        string attVal = attributeValues[0].Split(',')[0];
                                        string attCode = attributeIDs[0].Split(',')[0];
                                        EDRestAttributes eDRestAttributes = new EDRestAttributes();
                                        eDRestAttributes.ExtraAttributeId = long.Parse(attributeIDs[0].Split(',')[0].ToString());
                                        var lookupLabelDtoList = firstattributeValues.Where(a => a == varItem).ToList();
                                        if (lookupLabelDtoList != null && lookupLabelDtoList.Count > 0)
                                            eDRestAttributes.Values = lookupLabelDtoList.Select(r => new LookupLabelDto()
                                            {
                                                Label = r,
                                                Code = r
                                            }
                                                ).ToList();

                                        foreach (var attlook in eDRestAttributes.Values)
                                        {
                                            var codeItems = varAppItems.Where(x => x.EntityFk.EntityExtraData
                                                                                   .Where(a => a.AttributeValue == attlook.Label.ToString() &&
                                                                                   a.AttributeId == firstAttributeIdLong
                                                                                   ).Any()).ToList();
                                            var itemVarSum = codeItems.Where(x =>
                                            x.EntityFk.EntityExtraData.Where(a => a.AttributeId == firstAttributeIdLong &
                                            a.AttributeValue == varItem).Any()).Sum(a => a.StockAvailability);
                                            attlook.StockAvailability = itemVarSum;
                                        }
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




                                        EDRestAttributes eDRestAttributes = new EDRestAttributes();
                                        eDRestAttributes.ExtraAttributeId = long.Parse(attributeIDs[loop_counter].Split(',')[0].ToString());
                                        eDRestAttributes.ExtraAttrName = attributeValues[loop_counter].Split(',')[0].ToString();
                                        var lookupLabelDtoList = secondAttributeValuesFor1st; //variationsLists[loop_counter + 3].Split('|').ToList().GetRange(0, Math.Min(10, variationsLists[loop_counter + 3].Split('|').ToList().Count)).ToList();
                                        if (lookupLabelDtoList != null && lookupLabelDtoList.Count > 0 && eDRestAttributes.ExtraAttributeId == 105)
                                            eDRestAttributes.Values = lookupLabelDtoList.Select(r => new LookupLabelDto()
                                            {
                                                Label = r.Split(',')[0],
                                                Code = r.Split(',')[1]
                                            }
                                                ).ToList();

                                        else
                                        {
                                            eDRestAttributes.Values = new List<LookupLabelDto>();
                                        }

                                        foreach (var attlook in eDRestAttributes.Values)
                                        {
                                            var codeItems = varAppItems.Where(x => x.EntityFk.EntityExtraData
                                                                                   .Where(a => a.AttributeValue == attlook.Label.ToString() &&
                                                                                   a.AttributeId == long.Parse(secondAttId)
                                                                                   ).Any()).ToList();
                                            var itemVarSum = codeItems.Where(x =>
                                            x.EntityFk.EntityExtraData.Where(a => a.AttributeId == firstAttributeIdLong &
                                            a.AttributeValue == varItem).Any()).Sum(a => a.StockAvailability);
                                            attlook.StockAvailability = itemVarSum;
                                        }
                                        // eDRestAttributes.Values = lookupLabelDtoList.Select(r => new LookupLabelDto() { Label = r.Split(',')[0], Value = long.Parse(r.Split(',')[1]) }).ToList();
                                        eDRestAttributes.TotalCount = secondAttributeValuesFor1st.Count;//variationsLists[loop_counter + 3].Split('|').ToList().Count;
                                        extraDataSelectedValues.EDRestAttributes.Add(eDRestAttributes);
                                    }
                                    firstAttributeRelatedAdded = true;
                                }
                                else
                                {
                                    extraDataSelectedValues.EDRestAttributes = new List<EDRestAttributes>();
                                    for (int loop_counter = 1; loop_counter < attributeIDs.Count; loop_counter++)
                                    {
                                        EDRestAttributes eDRestAttributes = new EDRestAttributes();
                                        eDRestAttributes.ExtraAttributeId = long.Parse(attributeIDs[loop_counter].Split(',')[0].ToString());
                                        eDRestAttributes.ExtraAttrName = attributeValues[loop_counter].Split(',')[0].ToString();
                                        eDRestAttributes.Values = new List<LookupLabelDto>();
                                        eDRestAttributes.TotalCount = 0;
                                        extraDataSelectedValues.EDRestAttributes.Add(eDRestAttributes);
                                    }

                                }
                                extraDataAttrDto.selectedValues.Add(extraDataSelectedValues);
                            }

                            output.AppItem.variations.Add(extraDataAttrDto);
                        }
                    }
                    //var ExecutionTime38 = DateTime.Now - start;


                    output.AppItem.EntityCategories = null;
                    output.AppItem.EntityClassifications = null;
                    output.AppItem.EntityDepartments = null;

                    output.AppItem.EntityObjectTypeName = appItem.EntityFk.EntityObjectTypeFk.Name;
                    //mmt
                    //output.AppItem.Description = _helper.HtmlToPlainText(output.AppItem.Description);
                    //mmt/7
                    if (input.GetAppItemAttributesInputForCategories == null)
                        input.GetAppItemAttributesInputForCategories = new GetAppItemAttributesInput();
                    //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[Start]
                    //output.AppItem.EntityCategoriesNames = await GetAppItemCategoriesNamesWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForCategories.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForCategories.SkipCount, Sorting = input.GetAppItemAttributesInputForCategories.Sorting });
                    output.AppItem.EntityCategoriesNames = new PagedResultDto<string>
                    {
                        Items = (await GetAppItemCategoriesFullNamesWithPaging(new GetAppItemAttributesWithPagingInput
                        {
                            ItemEntityId = appItem.EntityId,
                            MaxResultCount = input.GetAppItemAttributesInputForCategories.MaxResultCount,
                            SkipCount = input.GetAppItemAttributesInputForCategories.SkipCount,
                            Sorting = input.GetAppItemAttributesInputForCategories.Sorting
                        })).Items.Select(z => z.EntityObjectCategoryName).ToList()
                    };
                    //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[End]
                    if (input.GetAppItemAttributesInputForClassifications == null)
                        input.GetAppItemAttributesInputForClassifications = new GetAppItemAttributesInput();
                    //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[Start]
                    //output.AppItem.EntityClassificationsNames = await GetAppItemClassificationsNamesWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForClassifications.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForClassifications.SkipCount, Sorting = input.GetAppItemAttributesInputForClassifications.Sorting });
                    output.AppItem.EntityClassificationsNames = new PagedResultDto<string>
                    {
                        Items = (await GetAppItemClassificationsFullNamesWithPaging(new GetAppItemAttributesWithPagingInput
                        {
                            ItemEntityId = appItem.EntityId,
                            MaxResultCount = input.GetAppItemAttributesInputForClassifications.MaxResultCount,
                            SkipCount = input.GetAppItemAttributesInputForClassifications.SkipCount,
                            Sorting = input.GetAppItemAttributesInputForClassifications.Sorting
                        })).Items.Select(z => z.EntityObjectClassificationName).ToList()
                    };
                    //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[End]
                    if (input.GetAppItemAttributesInputForDepartments == null)
                        input.GetAppItemAttributesInputForDepartments = new GetAppItemAttributesInput();
                    //MMT30
                    //output.AppItem.EntityDepartmentsNames = await GetAppItemDepartmentsNamesWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForDepartments.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForDepartments.SkipCount, Sorting = input.GetAppItemAttributesInputForDepartments.Sorting });
                    output.AppItem.EntityDepartmentsNames = new PagedResultDto<string> { Items = (await GetAppItemDepartmentsWithFullNameWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForDepartments.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForDepartments.SkipCount, Sorting = input.GetAppItemAttributesInputForDepartments.Sorting })).Items.Select(a => a.EntityObjectCategoryName).ToList() };
                    //MMT30
                }
                //MMT
                stopwatch.Stop();
                var elapsed_time = stopwatch.ElapsedMilliseconds;
                //MMT
                return output;
            }
        }
        #region get class/category/depts by page objects/names
        public async Task<PagedResultDto<AppEntityCategoryDto>> GetAppItemCategoriesWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
                }
                if (input.ItemEntityId != 0)
                {
                    return await _appEntitiesAppService.GetAppEntityCategoriesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                }
                return new PagedResultDto<AppEntityCategoryDto>(0, new List<AppEntityCategoryDto>());
            }
        }

        public async Task<PagedResultDto<AppEntityClassificationDto>> GetAppItemClassificationsWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
                }
                if (input.ItemEntityId != 0)
                {
                    return await _appEntitiesAppService.GetAppEntityClassificationsWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                }
                return new PagedResultDto<AppEntityClassificationDto>(0, new List<AppEntityClassificationDto>());
            }
        }

        public async Task<PagedResultDto<AppEntityCategoryDto>> GetAppItemDepartmentsWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
                }
                if (input.ItemEntityId != 0)
                {
                    return await _appEntitiesAppService.GetAppEntityDepartmentsWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                }
                return new PagedResultDto<AppEntityCategoryDto>(0, new List<AppEntityCategoryDto>());
            }
        }
        //MMT30
        public async Task<PagedResultDto<AppEntityCategoryDto>> GetAppItemDepartmentsWithFullNameWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
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
        //MMT30
        //MMT30

        public async Task<PagedResultDto<string>> GetAppItemCategoriesNamesWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
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
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
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
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
                }
                if (input.ItemEntityId != 0)
                {
                    return await _appEntitiesAppService.GetAppEntityDepartmentsNamesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                }
                return new PagedResultDto<string>(0, new List<string>());
            }
        }
        public async Task<PagedResultDto<AppEntityAttachmentDto>> GetAppItemAttachmentsWithPaging(GetAppItemExtraAttributesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
                }
                if (input.ItemEntityId != 0)
                {
                    return await _appEntitiesAppService.GetAppEntityAttachmentsWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                }
                return new PagedResultDto<AppEntityAttachmentDto>(0, new List<AppEntityAttachmentDto>());
            }
        }
        public async Task<PagedResultDto<ExtraDataAttrDto>> GetAppItemExtraDataWithPaging(GetAppItemExtraAttributesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
                }
                // *Abdo start
                var entityObjectExtraAttribute = _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(input.EntityObjectTypeId).Result.ToList().FirstOrDefault();


                if (input.ItemEntityId != 0 && entityObjectExtraAttribute != null && entityObjectExtraAttribute.ExtraAttributes != null && entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes != null)
                {
                    var extraAttributedefintion = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes;
                    // *Abdo End
                    //get all extra data type, AttributeId
                    var attributesIds = extraAttributedefintion.Where(r => r.Usage.ToUpper().Trim() == input.recommandedOrAdditional.ToString().ToUpper()).Select(r => r.AttributeId).ToList();
                    var usedExtraDataPagedPerAttribute = _appEntitiesAppService.GetAppEntityAttrDistinctWithPaging(new GetAppEntityAttributesWithAttributeIdsInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, AttributeIds = attributesIds, EntityId = input.ItemEntityId }).Result.Items.ToList();

                    List<ExtraDataAttrDto> returnedList = new List<ExtraDataAttrDto>();

                    foreach (var EntityExtraData in extraAttributedefintion)
                    {
                        if (usedExtraDataPagedPerAttribute.Contains(EntityExtraData.AttributeId))
                        {
                            var extraDataAttrDtoPagedlocal = _appEntitiesAppService.GetAppEntityExtraWithPaging(new GetAppEntityAttributesWithAttributeIdsInput { AttributeIds = new List<long>() { EntityExtraData.AttributeId }, EntityId = input.ItemEntityId }).Result.Items.ToList();
                            var extraDataSelectedValues = extraDataAttrDtoPagedlocal.Select(r => new ExtraDataSelectedValues { value = (r.AttributeValueFkName != null ? r.AttributeValueFkName : r.AttributeValue) });

                            if (extraDataSelectedValues.ToList().Count > 0)
                            {
                                var extraDataAttrDto = new ExtraDataAttrDto();
                                extraDataAttrDto.extraAttrUsage = EntityExtraData.Usage;
                                extraDataAttrDto.extraAttrName = EntityExtraData.Name;
                                extraDataAttrDto.extraAttrDataType = EntityExtraData.DataType; // Abdo added this 
                                extraDataAttrDto.selectedValues = extraDataSelectedValues.ToList();

                                if (!string.IsNullOrEmpty(EntityExtraData.Usage) && EntityExtraData.Usage.ToUpper().Trim() == input.recommandedOrAdditional.ToString().ToUpper())
                                { returnedList.Add(extraDataAttrDto); }
                            }
                        }

                    }
                    return new PagedResultDto<ExtraDataAttrDto>(usedExtraDataPagedPerAttribute.Count, returnedList);
                }
                return new PagedResultDto<ExtraDataAttrDto>(0, new List<ExtraDataAttrDto>());
            }
        }

        #endregion get class/category/depts by page objects/names

        [AbpAuthorize(AppPermissions.Pages_AppItems_Edit)]
        public async Task<GetAppItemForEditOutput> GetAppItemForEdit(GetAppItemWithPagedAttributesForEditInput input)
        {

            var appItem = await _appItemRepository.GetAll()
                //   .Include(x => x.ItemPricesFkList).ThenInclude(x => x.CurrencyFk)
                // .Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(x => x.AppItemSizeScalesDetails)
                //.Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories).ThenInclude(x => x.EntityObjectCategoryFk)
                //.Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications).ThenInclude(x => x.EntityObjectClassificationFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                //.Include(x => x.ParentFkList).ThenInclude(a => a.ItemPricesFkList).ThenInclude(x => x.CurrencyFk)
                .Include(x => x.ListingItemFkList)
                .Include(x => x.PublishedListingItemFkList)
                .FirstOrDefaultAsync(x => x.Id == input.ItemId);

            var output = new GetAppItemForEditOutput { AppItem = ObjectMapper.Map<AppItemForEditDto>(appItem) };
            //mmt
            var ab = await _appItemSizeScalesHeaderRepository.GetAll()
                                                  .Include(b => b.AppItemSizeScalesDetails).Where(a => a.AppItemId == appItem.Id).ToListAsync();
            output.AppItem.AppItemSizesScaleInfo = ObjectMapper.Map<List<AppItemSizesScaleInfo>>(ab);

            var prcItem = await _appItemPricesRepository.GetAll().Include(a => a.CurrencyFk).Where(a => a.AppItemId == appItem.Id).ToListAsync();
            output.AppItem.AppItemPriceInfos = ObjectMapper.Map<List<AppItemPriceInfo>>(prcItem);
            //MMT

            var varAppItems = appItem.ParentFkList;
            if (varAppItems.Select(r => r.StockAvailability).Sum() > 0)
            {
                output.AppItem.StockAvailability = varAppItems.Select(r => r.StockAvailability).Sum();
            }
            //xx
            output.AppItem.EntityAttachments.ForEach(a => a.Url = @"attachments/" + AbpSession.TenantId + @"/" + a.FileName);

            //foreach (var item in output.AppItem.EntityAttachments)
            //{
            //    item.Url = @"attachments/" + AbpSession.TenantId + @"/" + item.FileName;
            //}
            //xxx
            foreach (var item in output.AppItem.VariationItems)
            {
                //MMT30
                var marketplacesize = item.EntityExtraData.Where(s => s.AttributeId == 205).FirstOrDefault();
                if (marketplacesize != null)
                    marketplacesize.EntityObjectTypeCode = "SIZEMARKETPLACECODE";
                //MMT30
                item.EntityAttachments.ForEach(a => a.Url = @"attachments/" + AbpSession.TenantId + @"/" + a.FileName);
                var prcItemVar = await _appItemPricesRepository.GetAll().Include(a => a.CurrencyFk).Where(a => a.AppItemId == item.Id).ToListAsync();
                item.AppItemPriceInfos = ObjectMapper.Map<List<AppItemPriceInfo>>(prcItemVar);
                //foreach (var vitem in item.EntityAttachments)
                //{
                //    vitem.Url = @"attachments/" + AbpSession.TenantId + @"/" + vitem.FileName;
                //}
            }

            output.AppItem.EntityObjectTypeName = appItem.EntityFk.EntityObjectTypeFk.Name;//.EntityFk.EntityObjectTypeFk.Name;
            //mmt
            //output.AppItem.Description = _helper.HtmlToPlainText(output.AppItem.Description);
            //mmt
            if (input.GetAppItemAttributesInputForCategories == null)
                input.GetAppItemAttributesInputForCategories = new GetAppItemAttributesInput();
            //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[Start]
            //output.AppItem.EntityCategories = await GetAppItemCategoriesWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForCategories.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForCategories.SkipCount, Sorting = input.GetAppItemAttributesInputForCategories.Sorting });
            output.AppItem.EntityCategories = await GetAppItemCategoriesFullNamesWithPaging(new GetAppItemAttributesWithPagingInput
            {
                ItemEntityId = appItem.EntityId,
                MaxResultCount = input.GetAppItemAttributesInputForCategories.MaxResultCount,
                SkipCount = input.GetAppItemAttributesInputForCategories.SkipCount,
                Sorting = input.GetAppItemAttributesInputForCategories.Sorting
            });
            //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[End]
            if (input.GetAppItemAttributesInputForClassifications == null)
                input.GetAppItemAttributesInputForClassifications = new GetAppItemAttributesInput();
            //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[Start]
            //output.AppItem.EntityClassifications = await GetAppItemClassificationsWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForClassifications.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForClassifications.SkipCount, Sorting = input.GetAppItemAttributesInputForClassifications.Sorting });
            output.AppItem.EntityClassifications = await GetAppItemClassificationsFullNamesWithPaging(new GetAppItemAttributesWithPagingInput
            {
                ItemEntityId = appItem.EntityId,
                MaxResultCount = input.GetAppItemAttributesInputForClassifications.MaxResultCount,
                SkipCount = input.GetAppItemAttributesInputForClassifications.SkipCount,
                Sorting = input.GetAppItemAttributesInputForClassifications.Sorting
            });
            //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[End]

            if (input.GetAppItemAttributesInputForDepartments == null)
                input.GetAppItemAttributesInputForDepartments = new GetAppItemAttributesInput();
            //MMT30
            //output.AppItem.EntityDepartments = await GetAppItemDepartmentsWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForDepartments.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForDepartments.SkipCount, Sorting = input.GetAppItemAttributesInputForDepartments.Sorting });
            output.AppItem.EntityDepartments = await GetAppItemDepartmentsWithFullNameWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForDepartments.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForDepartments.SkipCount, Sorting = input.GetAppItemAttributesInputForDepartments.Sorting });
            //MMT30
            return output;
        }
        public async Task<long> CreateOrEdit(CreateOrEditAppItemDto input)
        {
            if (input.Id == 0)
            {
                //MMT30[Start]
                //input.VariationItems = await GetVariationsCodes(1241, input.Code, input.VariationItems, input.EntityObjectTypeId);
                // if (input.Id == 0)
                // {
                if (!string.IsNullOrEmpty(input.OriginalCode) && input.OriginalCode == input.Code)
                {

                    bool llNewCodeFound = false;
                    while (!llNewCodeFound)
                    {
                        var nextCode = await GenerateProductCode(int.Parse(input.EntityObjectTypeId.ToString()), true);
                        if (!string.IsNullOrEmpty(nextCode))
                        {
                            var appItemExist = await _appItemRepository.GetAll().Where(r => r.Code == nextCode && r.ItemType == input.ItemType).FirstOrDefaultAsync();
                            if (appItemExist != null)
                            {
                                continue;
                            }
                            else
                            {
                                llNewCodeFound = true;
                                if (nextCode != input.Code)
                                {
                                    input.VariationItems.ForEach(z => z.Code = z.Code.Replace(input.Code, nextCode));
                                    input.Code = nextCode;
                                }
                            }
                        }
                        else
                        {
                            llNewCodeFound = true;
                        }

                    }


                }
                //}
                // else
                // {
                var appItemExisting = await _appItemRepository.GetAll().Where(r => r.Code == input.Code && r.ItemType == input.ItemType).FirstOrDefaultAsync();
                if (appItemExisting != null)
                {
                    //throw new Exception("This product code already existing. Please use different code.");
                    throw new UserFriendlyException("This product code already existing. Please use different code.");
                }
                // }

                return await Create(input);
            }
            else
            {
                return await Update(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppItems_Create)]
        protected virtual async Task<long> Create(CreateOrEditAppItemDto input)
        {
            //var appItem = ObjectMapper.Map<AppItem>(input);

            //if (AbpSession.TenantId != null)
            //{
            //    appItem.TenantId = (int)AbpSession.TenantId;
            //}

            //await _appItemRepository.InsertAsync(appItem);
            return await DoCreateOrEdit(input);
        }

        [AbpAuthorize(AppPermissions.Pages_AppItems_Edit)]
        protected virtual async Task<long> Update(CreateOrEditAppItemDto input)
        {
            //var appItem = await _appItemRepository.FirstOrDefaultAsync((long)input.Id);
            //ObjectMapper.Map(input, appItem);
            return await DoCreateOrEdit(input);
        }
        //MMT30[Start]
        private async Task<IList<AppEntityExtraDataDto>> GetExtraAttributeData(long attributeId, int prdouctTypeId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appEntity = await _appEntityRepository.GetAll().AsNoTracking()
                .Include(x => x.EntityExtraData).AsNoTracking()
                .Include(x => x.EntityAttachments)
                .ThenInclude(x => x.AttachmentFk)
                .FirstOrDefaultAsync(x => x.Id == attributeId && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

                var entity = new GetAppEntityForEditOutput { AppEntity = ObjectMapper.Map<CreateOrEditAppEntityDto>(appEntity) };


                // var entity = await _appEntitiesAppService.GetAppEntityForEdit(new EntityDto<long> { Id = attributeId });
                if (entity != null)
                {
                    var EntityObjectType = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(int.Parse(entity.AppEntity.EntityObjectTypeId.ToString()));
                    if (EntityObjectType != null)
                    {
                        var serializer = new XmlSerializer(typeof(ItemExtraAttributes));
                        ItemExtraAttributes extraAttributes = null;
                        using (TextReader reader = new StringReader(EntityObjectType.SycEntityObjectType.ExtraAttributes))
                        {
                            extraAttributes = (ItemExtraAttributes)serializer.Deserialize(reader);
                            foreach (var extr in entity.AppEntity.EntityExtraData)
                            {
                                extr.Id = 0;
                                extr.EntityId = 0;
                                var extraAttObj = extraAttributes.ExtraAttributes.FirstOrDefault(z => z.AttributeId == extr.AttributeId);
                                if (extraAttObj != null)
                                {
                                    extr.EntityObjectTypeCode = extraAttObj.Code;
                                    //extr.AttributeId = extraAttObj.AttributeId;
                                }
                            }
                        }
                        var productEntityObjectType = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(int.Parse(prdouctTypeId.ToString()));
                        if (productEntityObjectType != null)
                        {
                            var serializerProduct = new XmlSerializer(typeof(ItemExtraAttributes));

                            ItemExtraAttributes productExtraAttributes = null;
                            using (TextReader reader = new StringReader(productEntityObjectType.SycEntityObjectType.ExtraAttributes))
                            {
                                productExtraAttributes = (ItemExtraAttributes)serializer.Deserialize(reader);
                                if (entity.AppEntity.EntityAttachments.Count > 0)
                                {
                                    var extraAttObj = productExtraAttributes.ExtraAttributes.FirstOrDefault(z => z.Name == "COLOR-IMAGE");
                                    if (extraAttObj != null)
                                    {
                                        entity.AppEntity.EntityExtraData.Add(new AppEntityExtraDataDto
                                        {
                                            EntityObjectTypeCode = extraAttObj.Name,
                                            AttributeValue = entity.AppEntity.EntityAttachments[0].FileName,
                                            AttributeId = extraAttObj.AttributeId
                                        });

                                    }
                                }

                                for (int extr = 0; extr < entity.AppEntity.EntityExtraData.Count; extr++)
                                {
                                    entity.AppEntity.EntityExtraData[extr].Id = 0;
                                    entity.AppEntity.EntityExtraData[extr].EntityId = 0;
                                    if (entity.AppEntity.EntityExtraData[extr].EntityObjectTypeCode == "SIZE")
                                    {
                                        var extraAttObj = productExtraAttributes.ExtraAttributes.FirstOrDefault(z => z.Name == "SIZEMARKETPLACECODE");
                                        if (extraAttObj != null)
                                        {
                                            entity.AppEntity.EntityExtraData[extr].EntityObjectTypeCode = extraAttObj.Name;
                                            entity.AppEntity.EntityExtraData[extr].AttributeId = extraAttObj.AttributeId;
                                            // entity.AppEntity.EntityExtraData[extr].EntityObjectTypeId = null;
                                        }
                                    }
                                    else
                                    {
                                        {
                                            var extraAttObj = productExtraAttributes.ExtraAttributes.FirstOrDefault(z => z.Name == entity.AppEntity.EntityExtraData[extr].EntityObjectTypeCode);
                                            if (extraAttObj != null)
                                            {
                                                entity.AppEntity.EntityExtraData[extr].EntityObjectTypeCode = extraAttObj.Name;
                                                entity.AppEntity.EntityExtraData[extr].AttributeId = extraAttObj.AttributeId;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return entity.AppEntity.EntityExtraData;
                }
                else
                    return new List<AppEntityExtraDataDto>();
            }
        }
        //MMT30[End]
        private async Task<long> DoCreateOrEdit(CreateOrEditAppItemDto input)

        {

            ////MMT30[Start]
            //foreach (var item in input.VariationItems )
            //{
            //    //MMT30
            //    var marketplacesize = item.EntityExtraData.Where(s => s.AttributeId == 205).FirstOrDefault();
            //    if (marketplacesize != null)
            //        marketplacesize.EntityObjectTypeCode = "";
            //}
            //MMT30
            //input.VariationItems = await GetVariationsCodes(1241, input.Code, input.VariationItems,input.EntityObjectTypeId);
            //if (input.Id == 0)
            //{
            //    if (!string.IsNullOrEmpty(input.OriginalCode) && input.OriginalCode == input.Code)
            //    {

            //        bool llNewCodeFound = false;
            //        while (!llNewCodeFound)
            //        {
            //            var nextCode = await GenerateProductCode(int.Parse(input.EntityObjectTypeId.ToString()), true);
            //            if (!string.IsNullOrEmpty(nextCode))
            //            {
            //                var appItemExist = await _appItemRepository.GetAll().Where(r => r.Code == nextCode && r.ItemType == input.ItemType).FirstOrDefaultAsync();
            //                if (appItemExist != null)
            //                {
            //                    continue;
            //                }
            //                else
            //                {
            //                    llNewCodeFound = true;
            //                    if (nextCode != input.Code)
            //                    {
            //                        input.VariationItems.ForEach(z => z.Code = z.Code.Replace(input.Code, nextCode));
            //                        input.Code = nextCode;
            //                    }
            //                }
            //            }
            //            else
            //            {
            //                llNewCodeFound = true;
            //            }

            //        }


            //    }
            //}
            //else
            //{
            //    var appItemExist = await _appItemRepository.GetAll().Where(r => r.Code == input.Code && r.ItemType == input.ItemType).FirstOrDefaultAsync();
            //    if (appItemExist != null)
            //    {
            //        throw new Exception("This product code already existing. Please use different code.");
            //    }
            //}

            var timeStamp = DateTime.Now;
            //MMT30[End]
            /*if(input.ItemType == 0)
            {
                var codeIsDublicated = await _appItemRepository.FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && input.Code == x.Code && x.Id != input.Id && x.ItemType == input.ItemType );
                if(codeIsDublicated != null) throw new UserFriendlyException("Code is Dublicated, Please choose another code");
            }*/
            //MMT33-3
            var currencyVar = await TenantManager.GetTenantCurrency();
            string currency = currencyVar.Code;
            //MMT33-3
            DateTime start = DateTime.Now;
            var itemObjectId = await _helper.SystemTables.GetObjectItemId();
            if (input.ItemType == 1)
            { itemObjectId = await _helper.SystemTables.GetObjectListingId(); }

            //var itemEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeItemIds();
            var itemStatusId = input.Status == "ACTIVE" ? await _helper.SystemTables.GetEntityObjectStatusItemActive() : await _helper.SystemTables.GetEntityObjectStatusItemDraft();

            //add the department list into the categories list, because they are all save as a categories list
            if (input.EntityDepartments != null)
            {
                if (input.EntityCategories == null)
                    input.EntityCategories = new List<AppEntityCategoryDto>();

                foreach (var d in input.EntityDepartments)
                {
                    input.EntityCategories.Add(d);
                }
            }
            AppItem appItem;

            if (input.Id == 0)
            {
                appItem = ObjectMapper.Map<AppItem>(input);
                appItem.ListingItemId = input.ParentId == 0 ? null : input.ParentId;
                appItem.ParentId = null;

            }
            else
            {
                appItem = await _appItemRepository.GetAll()//.Include(x => x.ItemPricesFkList).AsNoTracking()
                                                           //.Include(x => x.ItemSizeScaleHeadersFkList).AsNoTracking().ThenInclude(x => x.AppItemSizeScalesDetails).AsNoTracking()
                                                           //.Include(x => x.EntityFk).AsNoTracking()
                                                           // .Include(x => x.EntityFk).AsNoTracking ().t.ThenInclude(x => x.EntityCategories).ThenInclude(x => x.EntityObjectCategoryFk).AsNoTracking()
                                                           // .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications).ThenInclude(x => x.EntityObjectClassificationFk).AsNoTracking()
                .Where(r => r.Id == input.Id)
                .FirstOrDefaultAsync();

                ObjectMapper.Map(input, appItem);
            }
            AppEntityDto entity = new AppEntityDto();
            ObjectMapper.Map(input, entity);
            entity.Id = 0;
            entity.Code = input.Code;
            entity.ObjectId = itemObjectId;
            entity.TenantId = AbpSession.TenantId;
            entity.EntityObjectStatusId = itemStatusId;
            entity.Id = appItem.EntityId;
            try
            {
                if (appItem.ListingItemId != null && appItem.ListingItemId > 0 && input.Id == 0)
                {
                    entity.EntityCategories = new List<AppEntityCategoryDto>();

                    entity.EntityCategories = GetAppItemCategoriesWithPaging(new GetAppItemAttributesWithPagingInput { MaxResultCount = 1000, SkipCount = 0, ItemId = (long)appItem.ListingItemId }).Result.Items.ToList();
                    var deps = GetAppItemDepartmentsWithPaging(new GetAppItemAttributesWithPagingInput { MaxResultCount = 1000, SkipCount = 0, ItemId = (long)appItem.ListingItemId }).Result.Items.ToList();
                    foreach (var dep in deps) { entity.EntityCategories.Add(dep); }
                    entity.EntityClassifications = GetAppItemClassificationsWithPaging(new GetAppItemAttributesWithPagingInput { MaxResultCount = 1000, SkipCount = 0, ItemId = (long)appItem.ListingItemId }).Result.Items.ToList();

                }
            }
            catch (Exception ex) { }
            if (appItem.EntityId != 0)
            {
                var entityObj = await _appEntityRepository.GetAll().AsNoTracking().Include(x => x.EntityCategories).ThenInclude(x => x.EntityObjectCategoryFk)
                     .Include(x => x.EntityClassifications).ThenInclude(x => x.EntityObjectClassificationFk)
                     .FirstOrDefaultAsync(x => x.Id == appItem.EntityId);
                if (entityObj != null)
                    appItem.EntityFk = entityObj;
            }
            if (appItem.EntityFk != null)
            { entity.EntityCategories = ObjectMapper.Map<List<AppEntityCategoryDto>>(appItem.EntityFk.EntityCategories); }
            if (appItem.EntityFk != null)
            { entity.EntityClassifications = ObjectMapper.Map<List<AppEntityClassificationDto>>(appItem.EntityFk.EntityClassifications); }

            entity.Notes = _helper.HtmlToPlainText(input.Description);

            #region add and remove classifications/categories/department

            if (input.EntityCategoriesRemoved != null && input.EntityCategoriesRemoved.Count > 0)
            {
                List<long> tempIds = input.EntityCategoriesRemoved.Select(r => r.EntityObjectCategoryId).ToList();
                entity.EntityCategories = entity.EntityCategories.Where(r => tempIds.Contains(r.EntityObjectCategoryId) == false).ToList();
            }
            if (input.EntityDepartmentsRemoved != null && input.EntityDepartmentsRemoved.Count > 0)
            {
                List<long> tempIds = input.EntityDepartmentsRemoved.Select(r => r.EntityObjectCategoryId).ToList();
                entity.EntityCategories = entity.EntityCategories.Where(r => tempIds.Contains(r.EntityObjectCategoryId) == false).ToList();
            }

            if (input.EntityCategoriesAdded != null && input.EntityCategoriesAdded.Count > 0)
            { ((List<AppEntityCategoryDto>)entity.EntityCategories).AddRange(input.EntityCategoriesAdded); }

            if (input.EntityDepartmentsAdded != null && input.EntityDepartmentsAdded.Count > 0)
            { ((List<AppEntityCategoryDto>)entity.EntityCategories).AddRange(input.EntityDepartmentsAdded); }

            if (input.EntityClassificationsRemoved != null && input.EntityClassificationsRemoved.Count > 0)
            {
                List<long> tempIds = input.EntityClassificationsRemoved.Select(r => r.EntityObjectClassificationId).ToList();
                entity.EntityClassifications = entity.EntityClassifications.Where(r => tempIds.Contains(r.EntityObjectClassificationId) == false).ToList();
            }
            if (input.EntityClassificationsAdded != null && input.EntityClassificationsAdded.Count > 0)
            { ((List<AppEntityClassificationDto>)entity.EntityClassifications).AddRange(input.EntityClassificationsAdded); }

            #endregion add and remove classifications/categories/department
            //MMT30[Start]
            appItem.TimeStamp = timeStamp;
            appItem.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
            if (string.IsNullOrEmpty(appItem.SSIN))
            {
                appItem.SSIN = await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                entity.SSIN = appItem.SSIN;
            }
            entity.TenantOwner = appItem.TenantOwner;
            //MMT30[End]

            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
            //MMT
            appItem.TenantId = AbpSession.TenantId;
            //MMT

            appItem.EntityId = savedEntity;

            if (appItem.Id == 0)
                appItem = await _appItemRepository.InsertAsync(appItem);
            //MMT
            else
            {
                //await CurrentUnitOfWork.SaveChangesAsync();
                appItem = await _appItemRepository.UpdateAsync(appItem);
            }
            //MMT

            var appItemChildrenTmp = new List<AppItem>();
            if (input.Id != 0)
            {
                appItemChildrenTmp = await _appItemRepository.GetAll().AsNoTracking().Where(a => a.ParentId == input.Id).AsNoTracking().ToListAsync();

            }


            if (input.VariationItems != null && input.VariationItems.Count > 0)
            {
                //delete removed variations
                foreach (var child in input.VariationItems)
                {
                    if (child.Id == 0 && input.Id != 0 && appItemChildrenTmp != null && appItemChildrenTmp.Count > 0)
                    {
                        var appItemChildTmp = appItemChildrenTmp.FirstOrDefault(a => a.Code == child.Code);
                        if (appItemChildTmp != null)
                        {
                            child.Id = appItemChildTmp.Id;
                        }
                    }
                }
                var variationIds = input.VariationItems.Select(x => x.Id).ToArray();
                //XX
                var EntityIds = _appItemRepository.GetAll().Where(x => x.ParentId == input.Id && !variationIds.Contains(x.Id)).Select(a => a.EntityId).ToArray();
                //XX
                await _appItemRepository.DeleteAsync(x => x.ParentId == input.Id && !variationIds.Contains(x.Id));
                //XX
                await _appEntityRepository.DeleteAsync(x => EntityIds.Contains(x.Id));
                //XX
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";

                #region set variations field lists
                List<string> attributteNames = new List<string>();
                List<string> attributteIDs = new List<string>();
                List<string> firstAttributteValues = new List<string>();
                List<string> firstAttributteImageDefaults = new List<string>();
                List<ExtraDto> secondAttributteValues = new List<ExtraDto>();
                List<List<ExtraDto>> restAttributteValues = new List<List<ExtraDto>>();
                string firstColor = "";
                #endregion set tvariations field lists

                #region get AttributeId for default attachments
                string AttributeId = input.VariationItems[0].EntityExtraData.FirstOrDefault().AttributeId.ToString();
                var foundedAttachments = input.VariationItems.Where(r => r.EntityAttachments != null && r.EntityAttachments.Count > 0).Select(r => r.EntityAttachments).FirstOrDefault();
                if (foundedAttachments != null && foundedAttachments.Count > 0)
                {
                    AttributeId = foundedAttachments.Select(r => r.Attributes).FirstOrDefault();
                    if (string.IsNullOrEmpty(AttributeId) == false && AttributeId.Contains('='))
                        AttributeId = AttributeId.Split('=')[0].ToString();
                }
                #endregion get AttributeId for default attachments




                foreach (var child in input.VariationItems)
                {
                    AppItem appItemChild = new AppItem();
                    //if (child.Id == 0 && input.Id !=0 && appItemChildrenTmp != null && appItemChildrenTmp.Count > 0)
                    //{
                    //  var appItemChildTmp = appItemChildrenTmp.FirstOrDefault(a=> a.Code == child.Code);
                    //    if (appItemChildTmp != null)
                    //    {
                    //        child.Id = appItemChildTmp.Id ;
                    //        appItemChild = appItemChildTmp;
                    //    }
                    //}
                    if (child.Id == 0)
                    {
                        ObjectMapper.Map(appItem, appItemChild);
                        ObjectMapper.Map(child, appItemChild);
                        //MMT30[Start]
                        appItemChild.SSIN = "";
                        //MMT30[End]
                        appItemChild.Id = 0;
                        appItemChild.EntityId = 0;
                        appItemChild.ParentEntityId = 0;
                        appItemChild.ListingItemId = child.ParentId == 0 ? null : child.ParentId;
                    }
                    else
                    {
                        // var id = appItemChild.Id;
                        appItemChild = await _appItemRepository.FirstOrDefaultAsync((long)child.Id);
                        ObjectMapper.Map(child, appItemChild);
                        //appItemChild.Id = id;
                    }

                    AppEntityDto childEntity = new AppEntityDto();
                    ObjectMapper.Map(child, childEntity);
                    childEntity.Id = 0;
                    childEntity.Code = child.Code;
                    childEntity.ObjectId = itemObjectId;
                    childEntity.EntityObjectTypeId = entity.EntityObjectTypeId;
                    childEntity.TenantId = AbpSession.TenantId;
                    childEntity.EntityObjectStatusId = itemStatusId;
                    childEntity.Id = appItemChild.EntityId;
                    childEntity.Name = appItem.Name;
                    childEntity.Notes = appItem.Description;

                    //MMT30[Start]
                    //List<AppEntityExtraDataDto> extrData = new List<AppEntityExtraDataDto>();
                    //extrData.AddRange(childEntity.EntityExtraData);
                    //foreach (var attr in childEntity.EntityExtraData)
                    //{
                    //    if (attr.AttributeValueId !=null && attr.AttributeValueId != 0)
                    //    {
                    //        var attRelated = await GetExtraAttributeData(long.Parse(attr.AttributeValueId.ToString()),int.Parse (entity.EntityObjectTypeId.ToString()));
                    //        extrData.AddRange(attRelated);
                    //    }
                    //}
                    //childEntity.EntityExtraData = extrData;

                    appItemChild.TimeStamp = timeStamp;
                    appItemChild.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                    if (string.IsNullOrEmpty(appItemChild.SSIN))
                    {
                        appItemChild.SSIN = await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                        childEntity.SSIN = appItemChild.SSIN;
                    }
                    childEntity.TenantOwner = appItemChild.TenantOwner;
                    //MMT30[End]

                    var savedChildEntity = await _appEntitiesAppService.SaveEntity(childEntity);

                    appItemChild.EntityId = savedChildEntity;
                    appItemChild.ParentId = appItem.Id;
                    appItemChild.ParentEntityId = appItem.EntityId;



                    if (appItemChild.Id == 0)
                    {
                        appItemChild.ItemPricesFkList = new List<AppItemPrices>();
                        appItemChild = await _appItemRepository.InsertAsync(appItemChild);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    //MMT
                    if (child.AppItemPriceInfos != null && child.AppItemPriceInfos.Count() > 0)
                    {
                        var idList = child.AppItemPriceInfos.Select(a => a.Id).ToList().Distinct();
                        string ids = string.Join(",", idList);
                        await _appItemPricesRepository.DeleteAsync(z => z.AppItemId == child.Id && !ids.Contains(z.Id.ToString()));
                    }
                    else
                    {
                        await _appItemPricesRepository.DeleteAsync(z => z.AppItemId == child.Id);
                    }
                    if (child.AppItemPriceInfos != null)
                    {


                        foreach (var itemPrice in child.AppItemPriceInfos)
                        {

                            //if (itemPrice.Id == 0)
                            //{
                            var itemPriceObj = ObjectMapper.Map<AppItemPrices>(itemPrice);
                            itemPriceObj.AppItemCode = appItemChild.Code;
                            itemPriceObj.AppItemId = appItemChild.Id;
                            itemPriceObj.TenantId = AbpSession.TenantId;
                            //MMT33-3
                            if (itemPriceObj.CurrencyCode == currency)//itemPriceObj.Code == "MSRP" &&
                                itemPriceObj.IsDefault = true;
                            //MMT33-3
                            // appItem.ItemPricesFkList.Add(itemPriceObj);
                            if (itemPriceObj.Id == 0)
                                await _appItemPricesRepository.InsertAsync(itemPriceObj);
                            else
                                await _appItemPricesRepository.UpdateAsync(itemPriceObj);
                            //}
                            //else
                            //{
                            //    var existingItemPrice = appItem.ItemPricesFkList.FirstOrDefault(x => x.Id == itemPrice.Id);
                            //    if (existingItemPrice != null)
                            //    {
                            //        existingItemPrice.Price = itemPrice.Price;
                            //    }
                            //    appItem.ItemPricesFkList.Add(existingItemPrice);
                            //}
                        }
                    }
                    //if (child.AppItemPriceInfos != null)
                    //{
                    //    foreach (var itemPrice in child.AppItemPriceInfos)
                    //    {
                    //        if (itemPrice.Id == 0)
                    //        {
                    //            var itemPriceObj = ObjectMapper.Map<AppItemPrices>(itemPrice);
                    //            itemPriceObj.AppItemCode = appItemChild.Code;
                    //            itemPriceObj.AppItemId = appItemChild.Id;
                    //            itemPriceObj.TenantId = AbpSession.TenantId; 
                    //            appItemChild.ItemPricesFkList.Add(itemPriceObj);
                    //        }
                    //        else
                    //        {
                    //            var existingItemPrice = appItemChild.ItemPricesFkList.FirstOrDefault(x => x.Id == itemPrice.Id);
                    //            if (existingItemPrice != null)
                    //            {
                    //                existingItemPrice.Price = itemPrice.Price;
                    //            }
                    //            appItemChild.ItemPricesFkList.Add(existingItemPrice);
                    //        }
                    //    }
                    //}
                    //MMT

                    #region fill variation field lists
                    string currentColor = "";

                    foreach (var variationitem in child.EntityExtraData.OrderBy(r => r.AttributeId))
                    {
                        string isDefault = (AttributeId == variationitem.AttributeId.ToString()) ? "1" : "0";

                        if (!attributteNames.Contains(variationitem.EntityObjectTypeCode + "," + isDefault))
                            attributteNames.Add(variationitem.EntityObjectTypeCode + "," + isDefault);

                        if (!attributteIDs.Contains(variationitem.AttributeId.ToString() + "," + isDefault))
                            attributteIDs.Add(variationitem.AttributeId.ToString() + "," + isDefault);

                        if (AttributeId == variationitem.AttributeId.ToString())
                        {
                            currentColor = variationitem.AttributeValue;
                            if (!firstAttributteValues.Contains(variationitem.AttributeValue))
                            {
                                firstAttributteValues.Add(variationitem.AttributeValue.ToString());
                                var defaultImageObject = child.EntityAttachments.Where(r => r.IsDefault).FirstOrDefault();
                                if (defaultImageObject != null)
                                {
                                    if (!string.IsNullOrEmpty(defaultImageObject.Url))
                                    {
                                        firstAttributteImageDefaults.Add(defaultImageObject.Url);
                                    }
                                    else
                                    {
                                        if (defaultImageObject.guid != null)
                                        {
                                            string extension = "";
                                            string filename = "";
                                            if (defaultImageObject.FileName.Split(".").Length > 1)
                                            {
                                                extension = defaultImageObject.FileName.Split(".")[defaultImageObject.FileName.Split(".").Length - 1];
                                            }
                                            if (defaultImageObject.guid != null && !defaultImageObject.guid.EndsWith("." + extension))
                                            {
                                                filename = defaultImageObject.guid + (extension == "" ? "" : "." + extension);
                                            }
                                            firstAttributteImageDefaults.Add(imagesUrl + (appItem.TenantId.HasValue ? appItem.TenantId.ToString() : "-1") + @"/" + filename);
                                        }

                                    }
                                }
                                else
                                {
                                    firstAttributteImageDefaults.Add("");
                                }
                                if (string.IsNullOrEmpty(firstColor))
                                { firstColor = variationitem.AttributeValue; }

                            }
                        }
                        else
                        {
                            secondAttributteValues.Add(new ExtraDto() { ParentId = (long)(variationitem.AttributeValueId == null ? 0 : variationitem.AttributeValueId), Id = variationitem.AttributeId, Value = variationitem.AttributeValue });

                        }
                    }

                    if (string.IsNullOrEmpty(firstColor) == false && currentColor == firstColor)
                    {
                        restAttributteValues.Add(secondAttributteValues);

                        secondAttributteValues = new List<ExtraDto>();

                    }


                    #endregion fill variation field lists
                }

                #region concatenate variation lists
                string variation = "";
                if (attributteNames != null && attributteNames.Count > 0)
                {
                    string firstValue = attributteNames.Where(r => r.Contains(",1")).ToList().FirstOrDefault();
                    attributteNames.Remove(firstValue);
                    attributteNames.Insert(0, firstValue);

                    string firstId = attributteIDs.Where(r => r.Contains(",1")).ToList().FirstOrDefault();
                    attributteIDs.Remove(firstId);
                    attributteIDs.Insert(0, firstId);

                    variation = string.Join("|", attributteNames) + ";" + string.Join("|", attributteIDs) + ";" + string.Join("|", firstAttributteValues) + ";" + string.Join("|", firstAttributteImageDefaults) + ";";
                }

                if (restAttributteValues != null && restAttributteValues.Count > 0)
                {
                    var restLists = restAttributteValues.SelectMany(r => r).ToList();
                    string restValues = "";
                    foreach (var attributteIDloop in attributteIDs)
                    {
                        string attributteID = attributteIDloop.Split(',')[0];
                        var attributeList = restLists.Where(r => r.Id.ToString() == attributteID).Select(r => r.Value + "," + r.ParentId.ToString()).ToList();
                        if (attributeList != null && attributeList.Count > 0)
                        { restValues = restValues + string.Join("|", attributeList.Distinct()) + ";"; }
                    }
                    variation = variation + restValues;
                }

                appItem.Variations = variation;
                #endregion concatenate variation lists

            }
            //MMT
            // if (appItem.ItemPricesFkList == null)
            //      appItem.ItemPricesFkList = new List<AppItemPrices>();
            //   else
            //  {
            // foreach (var itemPrice in appItem.ItemPricesFkList)
            // {
            //appItem.ItemPricesFkList.Clear();
            if (input.AppItemPriceInfos != null && input.AppItemPriceInfos.Count() > 0)
            {
                var idList = input.AppItemPriceInfos.Select(a => a.Id).ToList().Distinct();
                string ids = string.Join(",", idList);
                await _appItemPricesRepository.DeleteAsync(z => z.AppItemId == appItem.Id && !ids.Contains(z.Id.ToString()));
            }
            else
            {
                await _appItemPricesRepository.DeleteAsync(z => z.AppItemId == appItem.Id);
            }

            //}
            await CurrentUnitOfWork.SaveChangesAsync();

            if (input.AppItemPriceInfos != null)
            {


                foreach (var itemPrice in input.AppItemPriceInfos)
                {
                    if (itemPrice.CurrencyCode == currency) //itemPrice.Code == "MSRP" &&
                    {
                        itemPrice.IsDefault = true;
                    }
                    //if (itemPrice.Id == 0)
                    //{
                    var itemPriceObj = ObjectMapper.Map<AppItemPrices>(itemPrice);
                    itemPriceObj.AppItemCode = input.Code;
                    itemPriceObj.AppItemId = appItem.Id;
                    itemPriceObj.TenantId = AbpSession.TenantId;
                    // appItem.ItemPricesFkList.Add(itemPriceObj);
                    if (itemPriceObj.Id == 0)
                        await _appItemPricesRepository.InsertAsync(itemPriceObj);
                    else
                        await _appItemPricesRepository.UpdateAsync(itemPriceObj);
                    //}
                    //else
                    //{
                    //    var existingItemPrice = appItem.ItemPricesFkList.FirstOrDefault(x => x.Id == itemPrice.Id);
                    //    if (existingItemPrice != null)
                    //    {
                    //        existingItemPrice.Price = itemPrice.Price;
                    //    }
                    //    appItem.ItemPricesFkList.Add(existingItemPrice);
                    //}
                }
                //await _appItemRepository.UpdateAsync(appItem);
            }
            if (input.AppItemSizesScaleInfo != null && input.AppItemSizesScaleInfo.Count() > 0)
            {

                var idList = input.AppItemSizesScaleInfo.Select(a => a.Id).ToList().Distinct();
                string ids = string.Join(",", idList);
                var sizeScales = await _appItemSizeScalesHeaderRepository.GetAll().Where(a => a.AppItemId == appItem.Id).AsNoTracking()
                                 .Include(a => a.AppItemSizeScalesDetails).AsNoTracking().ToListAsync();
                // var sizeScales = _appItemSizeScalesHeaderRepository.GetAll().Where(a => a.AppItemId == appItem.Id)
                //                .Include(a => a.AppItemSizeScalesDetails).ToList();
                foreach (var sizeScaleH in sizeScales)
                {
                    if (!ids.Contains(sizeScaleH.Id.ToString()))
                    {
                        await _appItemSizeScalesDetailRepository.DeleteAsync(z => z.SizeScaleId == sizeScaleH.Id);
                        await _appItemSizeScalesHeaderRepository.DeleteAsync(z => z.AppItemId == appItem.Id && z.Id == sizeScaleH.Id);
                    }
                }
                long sizeScaleSavedId = 0;
                foreach (var sizeHead in input.AppItemSizesScaleInfo)
                {
                    if (sizeHead.Id == null || sizeHead.Id == 0)
                    {

                        var scaleHeader = ObjectMapper.Map<AppItemSizeScalesHeader>(sizeHead);
                        scaleHeader.TenantId = AbpSession.TenantId;
                        scaleHeader.AppItemId = appItem.Id;
                        if (string.IsNullOrEmpty(scaleHeader.SizeScaleCode))
                        {
                            string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("SIZE-SCALE");
                            scaleHeader.SizeScaleCode = (scaleHeader.ParentId == null ? "SizeScale-" : "SizeRatio-") + seq;
                        }
                        scaleHeader.SizeScaleId = scaleHeader.ParentId == null ? scaleHeader.SizeScaleId : null;
                        scaleHeader.ParentId = scaleHeader.ParentId == null ? null : sizeScaleSavedId;
                        foreach (var size in scaleHeader.AppItemSizeScalesDetails)
                        {
                            size.TenantId = AbpSession.TenantId;
                            size.Id = 0;
                        }
                        scaleHeader = await _appItemSizeScalesHeaderRepository.InsertAsync(scaleHeader);
                        if (scaleHeader.ParentId == null)
                        {
                            await CurrentUnitOfWork.SaveChangesAsync();
                            sizeScaleSavedId = scaleHeader.Id;
                        }
                    }
                    else
                    {
                        var sizescaleObj = sizeScales.FirstOrDefault(a => a.Id == sizeHead.Id);
                        var scaleHeader = ObjectMapper.Map<AppItemSizeScalesHeader>(sizeHead);
                        scaleHeader.TenantId = AbpSession.TenantId;
                        scaleHeader.AppItemId = appItem.Id;
                        scaleHeader.SizeScaleCode = sizescaleObj.SizeScaleCode;
                        scaleHeader.SizeScaleId = sizescaleObj.SizeScaleId; //scaleHeader.ParentId !=0 ? scaleHeader.SizeScaleId : null;
                        scaleHeader.ParentId = sizescaleObj.ParentId;//scaleHeader.ParentId == null ? null : sizeScaleSavedId;
                        scaleHeader.AppItemSizeScalesDetails = new List<AppItemSizeScalesDetails>();
                        await _appItemSizeScalesHeaderRepository.UpdateAsync(scaleHeader);
                        if (scaleHeader.ParentId == null)
                        {
                            sizeScaleSavedId = scaleHeader.Id;
                        }
                        //await CurrentUnitOfWork.SaveChangesAsync();
                        var sizeScaleObj = _appItemSizeScalesHeaderRepository.GetAll()
                        .Where(a => a.AppItemId == appItem.Id & a.Id == sizeHead.Id).AsNoTracking()
                        .Include(a => a.AppItemSizeScalesDetails).AsNoTracking().FirstOrDefault();
                        //sizeScales.FirstOrDefault(a => a.Id == sizeHead.Id);

                        var sizeIdList = sizeHead.AppSizeScalesDetails.Select(a => a.SizeCode + "-" + (a.DimensionName == null ? "" : a.DimensionName)).ToList().Distinct();
                        string sizeids = string.Join(",", sizeIdList);

                        foreach (var size in sizeScaleObj.AppItemSizeScalesDetails)
                        {
                            if (!sizeids.Contains(size.SizeCode.ToString() + "-" + (size.DimensionName == null ? "" : size.DimensionName)))
                            {
                                var sz = ObjectMapper.Map<AppSizeScalesDetailDto>(size);
                                var sizeObject = ObjectMapper.Map<AppItemSizeScalesDetails>(sz);
                                sizeObject.IsDeleted = true;
                                sizeObject.TenantId = AbpSession.TenantId;
                                sizeObject.SizeScaleId = sizeScaleObj.Id;
                                await _appItemSizeScalesDetailRepository.UpdateAsync(sizeObject);
                            }
                        }
                        // await CurrentUnitOfWork.SaveChangesAsync();
                        //var scaleHeader = ObjectMapper.Map<AppItemSizeScalesHeader>(sizeHead);
                        //scaleHeader.TenantId = AbpSession.TenantId;
                        //scaleHeader.AppItemId = appItem.Id;
                        //scaleHeader.AppItemSizeScalesDetails = new List<AppItemSizeScalesDetails>();
                        //await _appItemSizeScalesHeaderRepository.UpdateAsync(scaleHeader);


                        foreach (var sizObj in sizeHead.AppSizeScalesDetails)
                        {
                            var sizeObject = ObjectMapper.Map<AppItemSizeScalesDetails>(sizObj);
                            sizeObject.TenantId = AbpSession.TenantId;
                            sizeObject.SizeScaleId = sizeScaleObj.Id;
                            var sizeObjectDet = await _appItemSizeScalesDetailRepository.GetAll()
                                .Where(a => a.SizeScaleId == sizeObject.SizeScaleId & a.SizeCode == sizObj.SizeCode & a.DimensionName == sizObj.DimensionName).AsNoTracking().FirstOrDefaultAsync();
                            if (sizeObjectDet == null)//(sizeObject.Id == 0)
                            {
                                sizeObject.Id = 0;
                                await _appItemSizeScalesDetailRepository.InsertAsync(sizeObject);
                            }
                            else
                            {
                                sizeObject.Id = sizeObjectDet.Id;
                                await _appItemSizeScalesDetailRepository.UpdateAsync(sizeObject);
                            }
                        }


                    }
                    //}
                }

            }
            else
            {
                await _appItemSizeScalesHeaderRepository.DeleteAsync(z => z.AppItemId == appItem.Id);
            }

            //if (input.AppItemSizesScaleInfo != null)
            //{
            //    foreach (var sizeScaleHeader in input.AppItemSizesScaleInfo)
            //    {
            //        var itemSizeScaleHeadereObj = ObjectMapper.Map<AppItemSizeScalesHeader>(sizeScaleHeader);
            //        itemSizeScaleHeadereObj.AppItemId = appItem.Id;
            //        itemSizeScaleHeadereObj.TenantId = AbpSession.TenantId;
            //        // appItem.ItemPricesFkList.Add(itemPriceObj);
            //        if (itemSizeScaleHeadereObj.Id == 0)
            //        {
            //            string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("SIZE-SCALE");
            //            input.Code = "SizeScale-" + seq;
            //            itemSizeScaleHeadereObj.SizeScaleCode = input.Code;
            //            await _appItemSizeScalesHeaderRepository.InsertAsync(itemSizeScaleHeadereObj);
            //        }
            //        else
            //            await _appItemSizeScalesHeaderRepository.UpdateAsync(itemSizeScaleHeadereObj);
            //    }

            //}
            //MMT
            await CurrentUnitOfWork.SaveChangesAsync();
            return appItem.Id;
        }

        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Publish)]
        public async Task PublishProduct(PublishItemOptions input)
        {
            SharingItemOptions aa = new SharingItemOptions();
            aa.AppItemId = long.Parse(input.ListingItemId.ToString());
            aa.SharingLevel = input.SharingLevel;
            aa.ItemSharing = input.ItemSharing;
            aa.Message = input.Message;
            await ShareProduct(aa);
            return;
            await SaveSharingOptions(input);
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var listingItem = await _appItemRepository.GetAll()
                //yy
                .Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails).AsNoTracking()
                //yy
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                //Mariam
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                //Mariam
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                //Mariam
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                .Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList).AsNoTracking()
                .Include(a => a.ItemPricesFkList).AsNoTracking()
                //Mariam
                .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.ListingItemId);
                //XX
                long publishedEntityId = 0;
                //XX
                AppItem publishItem = await _appItemRepository.GetAll().Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList)
                    .Include(a => a.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)//.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.PublishedListingItemId == listingItem.Id);
                if (publishItem == null || publishItem.Id == 0)
                {
                    publishItem = ObjectMapper.Map<AppItem>(listingItem);
                    publishItem.EntityId = 0;
                    //mmt
                    //XX
                    if (publishItem.Variations != null)
                        //XX
                        publishItem.Variations.Replace($"/{publishItem.TenantId.ToString()}/", "/-1/");
                    publishItem.TenantId = null;
                    //Mmt
                    //XX
                    publishItem.ItemPricesFkList = listingItem.ItemPricesFkList;
                    publishItem.ItemPricesFkList.ForEach(a => a.TenantId = null);
                    publishItem.ItemPricesFkList.ForEach(a => a.Id = 0);
                    publishItem.ItemPricesFkList.ForEach(a => a.AppItemId = publishItem.Id);
                    //XX

                    //yy
                    publishItem.ItemSizeScaleHeadersFkList = new List<AppItemSizeScalesHeader>(); //listingItem.ItemSizeScaleHeadersFkList;
                    var sizeScale = listingItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId == null);
                    if (sizeScale != null)
                    {
                        sizeScale.Id = 0;
                        sizeScale.AppItemId = publishItem.Id;
                        sizeScale.TenantId = null;
                        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                        publishItem.ItemSizeScaleHeadersFkList.Add(sizeScale);

                    }

                    //yy
                    //appItem.ListingItemId = input.ParentId == 0 ? null : input.ParentId;
                    //appItem.ParentId = null;
                }
                else
                {

                    //publishItem = await _appItemRepository.GetAll().Include(x => x.ParentFkList).AsNoTracking().FirstOrDefaultAsync(x => x.PublishedListingItemId == listingItem.Id);
                    //var id = publishItem.Id;
                    //xx
                    // await _appItemSizeScalesHeaderRepository.DeleteAsync(x => x.AppItemId == publishItem.Id);
                    await _appItemPricesRepository.DeleteAsync(x => x.AppItemId == publishItem.Id);
                    publishedEntityId = publishItem.EntityId;
                    //xx
                    //List<AppItemSizeScalesHeader> tmpSizeScale = new List<AppItemSizeScalesHeader>();
                    //foreach (var scl in publishItem.ItemSizeScaleHeadersFkList)
                    //{
                    //    tmpSizeScale.Add(scl);
                    //}
                    ObjectMapper.Map(listingItem, publishItem);

                    //XX
                    publishItem.ItemPricesFkList = listingItem.ItemPricesFkList;
                    publishItem.ItemPricesFkList.ForEach(a => a.TenantId = null);
                    publishItem.ItemPricesFkList.ForEach(a => a.Id = 0);
                    publishItem.ItemPricesFkList.ForEach(a => a.AppItemId = publishItem.Id);
                    //publishItem.ItemSizeScaleHeadersFkList = tmpSizeScale;
                    //var publishSizeScale = publishItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId == null);
                    //var sizeScale = listingItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId == null);
                    //if (sizeScale != null)
                    //{
                    //    if (publishSizeScale == null)
                    //    {
                    //        sizeScale.Id = 0;
                    //        sizeScale.AppItemId = publishItem.Id;
                    //        sizeScale.TenantId = null;
                    //        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                    //        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                    //        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                    //        publishItem.ItemSizeScaleHeadersFkList.Add(sizeScale);
                    //        if (publishItem.ItemSizeScaleHeadersFkList.Count > 1) 
                    //        {
                    //            if (listingItem.ItemSizeScaleHeadersFkList.Count > 1) 
                    //            {
                    //                var sizeRatio = listingItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                    //                if (sizeRatio != null)
                    //                {
                    //                    sizeRatio.Id =0;
                    //                    sizeRatio.ParentId = sizeScale.Id;
                    //                    sizeRatio.AppItemId = publishItem.Id;
                    //                    sizeRatio.TenantId = null;
                    //                    sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                    //                    sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                    //                    sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                    //                    publishItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                    //                }
                    //            }
                    //        }

                    //    }
                    //    else
                    //    {
                    //        sizeScale.Id = publishSizeScale.Id;
                    //        sizeScale.AppItemId = publishItem.Id;
                    //        sizeScale.TenantId = null;
                    //        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                    //        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                    //        sizeScale.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                    //        publishItem.ItemSizeScaleHeadersFkList.Remove(publishSizeScale);
                    //        publishItem.ItemSizeScaleHeadersFkList.Add(sizeScale);
                    //        if (listingItem.ItemSizeScaleHeadersFkList.Count > 1)
                    //        {
                    //            if (publishItem.ItemSizeScaleHeadersFkList.Count > 1)
                    //            {
                    //                var itemSizeRatio = publishItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId != null);
                    //                if (itemSizeRatio != null)
                    //                {
                    //                    var sizeRatio = listingItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                    //                    if (sizeRatio != null)
                    //                    {
                    //                        sizeRatio.Id = itemSizeRatio.Id;
                    //                        sizeRatio.ParentId = sizeScale.Id;
                    //                        sizeRatio.AppItemId = publishItem.Id;
                    //                        sizeRatio.TenantId = null;
                    //                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                    //                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                    //                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                    //                        publishItem.ItemSizeScaleHeadersFkList.Remove(itemSizeRatio);
                    //                        publishItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                    //                    }
                    //                }
                    //                else
                    //                {
                    //                    var sizeRatio = listingItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                    //                    if (sizeRatio != null)
                    //                    {
                    //                        sizeRatio.Id = 0;
                    //                        sizeRatio.ParentId = sizeScale.Id;
                    //                        sizeRatio.AppItemId = publishItem.Id;
                    //                        sizeRatio.TenantId = null;
                    //                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                    //                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                    //                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                    //                        //publishItem.ItemSizeScaleHeadersFkList.Remove(itemSizeRatio);
                    //                        publishItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                    //                    }
                    //                }
                    //            }
                    //        }
                    //  }
                    // }
                    //XX
                    //publishItem.Id = id;
                }

                //AppItem newitem = new AppItem();
                //ObjectMapper.Map(listingItem, newitem);
                //newitem.Id = 0;
                publishItem.ListingItemId = null;
                publishItem.ItemType = 2;

                publishItem.SharingLevel = input.SharingLevel;
                publishItem.PublishedListingItemId = input.ListingItemId;


                AppEntityDto entityDto = new AppEntityDto();
                ObjectMapper.Map(listingItem.EntityFk, entityDto);
                entityDto.Id = 0;
                //mmt
                entityDto.TenantId = null;
                //Mmt
                //Mariam
                if (entityDto.EntityExtraData != null)
                {
                    foreach (var parentExtrData in entityDto.EntityExtraData)
                    {
                        parentExtrData.Id = 0;
                    }
                }

                //Mariam

                if (publishItem != null)
                {
                    //newitem.Id = publishItem.Id;
                    //XX
                    //entityDto.Id = publishItem.EntityId;
                    entityDto.Id = publishedEntityId;
                    //XX
                    entityDto.Code = publishItem.Code;
                }

                var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                publishItem.EntityId = savedEntity;
                if (publishItem.Id == 0)
                {

                    publishItem = await _appItemRepository.InsertAsync(publishItem);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    //yy
                    if (listingItem.ItemSizeScaleHeadersFkList.Count > 1)
                    {
                        if (publishItem.ItemSizeScaleHeadersFkList.Count > 0)
                        {
                            var itemSizeScale = publishItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                            if (itemSizeScale != null)
                            {
                                var sizeRatio = listingItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                                if (sizeRatio != null)
                                {
                                    sizeRatio.Id = 0;
                                    sizeRatio.ParentId = itemSizeScale.Id;
                                    sizeRatio.AppItemId = publishItem.Id;
                                    sizeRatio.TenantId = null;
                                    sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                    sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                                    sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                                    publishItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                                }
                            }
                        }
                    }
                    //yy
                }

                //Delete removed child items
                if (publishItem != null && publishItem.ParentFkList != null)
                {
                    var itemIds = listingItem.ParentFkList.Select(x => x.Id).ToArray();
                    //var entityIds = listingItem.ParentFkList.Select(x => x.EntityId).ToArray();
                    //var existedEntityIds = publishItem.ParentFkList.Select(x => x.EntityId).ToArray();
                    var existedIds = publishItem.ParentFkList.Select(x => x.Id).ToArray();

                    var toBeDeletedIds = _appItemRepository.GetAll().Where(x => existedIds.Contains(x.Id) && (!itemIds.Contains((long)(x.PublishedListingItemId == null ? 0 : x.PublishedListingItemId)))).Select(x => x.Id).ToArray();
                    var toBeEntitiesDeletedIds = _appItemRepository.GetAll().Where(x => toBeDeletedIds.Contains(x.Id)).Select(x => x.EntityId).ToArray();

                    await _appItemRepository.DeleteAsync(x => toBeDeletedIds.Contains(x.Id));
                    await _appEntityRepository.DeleteAsync(x => toBeEntitiesDeletedIds.Contains(x.Id));
                    //XX

                    await _appItemPricesRepository.DeleteAsync(x => toBeDeletedIds.Contains(x.AppItemId));
                    //XX
                }

                //Save child items
                foreach (var child in listingItem.ParentFkList)
                {
                    //var publishChild = await _appItemRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.PublishedListingItemId == child.Id);
                    AppItem publishChild = new AppItem(); ;
                    if (publishItem != null && publishItem.ParentFkList != null)
                        publishChild = publishItem.ParentFkList.FirstOrDefault(x => x.PublishedListingItemId == child.Id);

                    if (publishChild == null)
                        publishChild = new AppItem();

                    AppEntityDto entityChildDto = new AppEntityDto();
                    ObjectMapper.Map(child.EntityFk, entityChildDto);
                    if (publishItem != null)
                    {
                        entityChildDto.Id = publishChild.EntityId;
                        entityChildDto.Code = publishChild.Code;
                    }
                    entityChildDto.TenantId = null;
                    //Mariam
                    if (entityChildDto.EntityExtraData != null)
                    {
                        foreach (var extrData in entityChildDto.EntityExtraData)
                        {
                            extrData.Id = 0;
                        }
                    }
                    //Mariam
                    //AppItem newitemChild = new AppItem();
                    ObjectMapper.Map(child, publishChild);
                    publishChild.ParentId = publishItem.Id;
                    publishChild.ParentEntityId = publishItem.EntityId;
                    publishChild.SharingLevel = input.SharingLevel;
                    publishChild.ListingItemId = null;
                    publishChild.PublishedListingItemId = child.Id;
                    publishChild.ItemType = 2;
                    publishChild.TenantId = null;
                    //publishChild.Id = 0;
                    //xxx
                    publishChild.ItemPricesFkList = child.ItemPricesFkList;
                    publishChild.ItemPricesFkList.ForEach(a => a.TenantId = null);
                    publishChild.ItemPricesFkList.ForEach(a => a.Id = 0);
                    publishChild.ItemPricesFkList.ForEach(a => a.AppItemId = publishChild.Id);
                    //xxx
                    //if (publishChild != null)
                    //{
                    //    newitemChild.Id = publishChild.Id;
                    //    entityChildDto.Id = publishChild.EntityId;
                    //}

                    var savedEntityChild = await _appEntitiesAppService.SaveEntity(entityChildDto);
                    publishChild.EntityId = savedEntityChild;

                    if (publishChild.Id == 0)
                    {
                        publishChild = await _appItemRepository.InsertAsync(publishChild);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }

                //send notification to the users

                //await _appNotifier.SharedProduct(tenant);
            }
        }
        //mmt33-2
        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Publish)]
        public async Task MakeProductPrivate(long appItemId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItem = await _appItemRepository.GetAll().Include(a => a.ParentFkList).AsNoTracking().FirstOrDefaultAsync(x => x.Id == appItemId);
                if (appItem != null)
                {
                    var appMarketplaceItem = await _appMarketplaceItem.GetAll().Where(x => x.Code == appItem.SSIN).FirstOrDefaultAsync();
                    if (appMarketplaceItem != null)
                    {
                        appMarketplaceItem.SharingLevel = 3;
                        await _appMarketplaceItem.UpdateAsync(appMarketplaceItem);
                    }
                    if (appItem.ParentFkList != null && appItem.ParentFkList.Count > 0)
                    {
                        foreach (var child in appItem.ParentFkList)
                        {
                            var appMarketplaceItemChild = await _appMarketplaceItem.GetAll().Where(x => x.Code == child.SSIN).FirstOrDefaultAsync();
                            if (appMarketplaceItemChild != null)
                            {
                                appMarketplaceItemChild.SharingLevel = 3;
                                await _appMarketplaceItem.UpdateAsync(appMarketplaceItemChild);
                            }
                        }
                    }
                }
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }
        [AbpAuthorize(AppPermissions.Pages_AppItems_Publish)]
        public async Task SyncProduct(long appItemId)
        {
            SharingItemOptions input = new SharingItemOptions();
            input.AppItemId = appItemId;
            input.SyncProduct = true;
            await ShareProduct(input);

        }
        [AbpAuthorize(AppPermissions.Pages_AppItems_Publish)]
        public async Task UnHideProduct(long appItemId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItem = await _appItemRepository.GetAll().Include(a => a.ParentFkList).AsNoTracking().FirstOrDefaultAsync(x => x.Id == appItemId);
                if (appItem != null)
                {
                    byte sharingLevel = 1;
                    var appMarketplaceItem = await _appMarketplaceItem.GetAll().Include(x => x.ItemSharingFkList).Where(x => x.Code == appItem.SSIN).FirstOrDefaultAsync();
                    if (appMarketplaceItem != null)
                    {
                        appMarketplaceItem.SharingLevel = (appMarketplaceItem.ItemSharingFkList != null && appMarketplaceItem.ItemSharingFkList.Count > 0) ? byte.Parse(2.ToString()) : byte.Parse(1.ToString());
                        sharingLevel = appMarketplaceItem.SharingLevel;
                        await _appMarketplaceItem.UpdateAsync(appMarketplaceItem);
                    }
                    if (appItem.ParentFkList != null && appItem.ParentFkList.Count > 0)
                    {
                        foreach (var child in appItem.ParentFkList)
                        {
                            var appMarketplaceItemChild = await _appMarketplaceItem.GetAll().Where(x => x.Code == child.SSIN).FirstOrDefaultAsync();
                            if (appMarketplaceItemChild != null)
                            {
                                appMarketplaceItemChild.SharingLevel = sharingLevel;
                                await _appMarketplaceItem.UpdateAsync(appMarketplaceItemChild);
                            }
                        }
                    }
                }
                await CurrentUnitOfWork.SaveChangesAsync();
            }

        }
        [AbpAuthorize(AppPermissions.Pages_AppItems_Publish)]
        public async Task HideProduct(long appItemId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItem = await _appItemRepository.GetAll().Include(a => a.ParentFkList).AsNoTracking().FirstOrDefaultAsync(x => x.Id == appItemId);
                if (appItem != null)
                {
                    var appMarketplaceItem = await _appMarketplaceItem.GetAll().Where(x => x.Code == appItem.SSIN).FirstOrDefaultAsync();
                    if (appMarketplaceItem != null)
                    {
                        appMarketplaceItem.SharingLevel = 4;
                        await _appMarketplaceItem.UpdateAsync(appMarketplaceItem);
                    }
                    if (appItem.ParentFkList != null && appItem.ParentFkList.Count > 0)
                    {
                        foreach (var child in appItem.ParentFkList)
                        {
                            var appMarketplaceItemChild = await _appMarketplaceItem.GetAll().Where(x => x.Code == child.SSIN).FirstOrDefaultAsync();
                            if (appMarketplaceItemChild != null)
                            {
                                appMarketplaceItemChild.SharingLevel = 4;
                                await _appMarketplaceItem.UpdateAsync(appMarketplaceItemChild);
                            }
                        }
                    }
                }
                await CurrentUnitOfWork.SaveChangesAsync();
            }

        }
        private void MoveFile(string fileName, int? sourceTenantId, int? distinationTenantId)
        {
            if (sourceTenantId == null) sourceTenantId = -1;
            if (distinationTenantId == null) distinationTenantId = -1;

            var tmpPath = _appConfiguration[$"Attachment:PathTemp"] + @"\" + sourceTenantId + @"\" + fileName;
            var pathSource = _appConfiguration[$"Attachment:Path"] + @"\" + sourceTenantId + @"\" + fileName;
            var path = _appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId + @"\" + fileName;

            if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId))
            {
                System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId);
            }

            try
            {
                System.IO.File.Copy(tmpPath.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
            }
            catch (Exception ex)
            {
                try
                {
                    System.IO.File.Copy(pathSource.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
                }
                catch (Exception ex1)
                {

                }
            }
        }
        [AbpAuthorize(AppPermissions.Pages_AppItems_Publish)]
        public async Task ShareProduct(SharingItemOptions input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);

                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var appItem = await _appItemRepository.GetAll().AsNoTracking()
                    //yy
                    //.Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails).AsNoTracking()
                    //yy
                    .Include(x => x.EntityFk).AsNoTracking()
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    //Mariam
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)//.ThenInclude(x => x.EntityObjectTypeFk)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                    //Mariam
                    .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    //Mariam
                    .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)//.ThenInclude(x => x.EntityObjectTypeFk)
                    .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                    //.Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList).AsNoTracking()
                    //.Include(a => a.ItemPricesFkList).AsNoTracking()
                    //Mariam
                    .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.AppItemId);
                    //XX
                    AppMarketplaceItems.AppMarketplaceItems marketplaceItemObject = null;
                    long publishedEntityId = 0;
                    byte sharingLevel = 0;

                    appItem.ItemSizeScaleHeadersFkList = await _appItemSizeScalesHeaderRepository.GetAll()
                        .Include(a => a.AppItemSizeScalesDetails).AsNoTracking().Where(a => a.AppItemId == input.AppItemId).ToListAsync();
                    appItem.ItemPricesFkList = await _appItemPricesRepository.GetAll().AsNoTracking().Where(a => a.AppItemId == input.AppItemId).ToListAsync();
                    var itemObjectId = await _helper.SystemTables.GetObjectListingId();
                    List<AppMarketplaceItems.AppMarketplaceItems> children = new List<AppMarketplaceItems.AppMarketplaceItems>();
                    //XX
                    AppMarketplaceItems.AppMarketplaceItems marketplaceItem = await _appMarketplaceItem.GetAll().Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList)
                        .Include(a => a.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)
                        .Where(x => x.Code == appItem.SSIN).FirstOrDefaultAsync();

                    if (marketplaceItem == null || marketplaceItem.Id == 0)
                    {

                        marketplaceItem = ObjectMapper.Map<onetouch.AppMarketplaceItems.AppMarketplaceItems>(appItem);
                        marketplaceItem.Id = 0;
                        marketplaceItem.ObjectId = itemObjectId;
                        //mmt
                        //XX
                        if (marketplaceItem.Variations != null)
                            //XX
                            marketplaceItem.Variations.Replace($"/{marketplaceItem.TenantId.ToString()}/", "/-1/");
                        marketplaceItem.TenantId = null;
                        marketplaceItem.SSIN = appItem.SSIN;  //await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                        x.ChangeTracker.Clear();
                        marketplaceItem.TenantOwner = int.Parse(appItem.TenantId.ToString());
                        //Mmt
                        //XX
                        marketplaceItem.ItemPricesFkList = ObjectMapper.Map<List<AppMarketplaceItemPrices>>(appItem.ItemPricesFkList);
                        //publishItem.ItemPricesFkList.ForEach(a => a.TenantId = null);
                        marketplaceItem.ItemPricesFkList.ForEach(a => a.Id = 0);
                        marketplaceItem.ItemPricesFkList.ForEach(a => a.AppMarketplaceItemId = marketplaceItem.Id);
                        //XX

                        //yy
                        marketplaceItem.ItemSizeScaleHeadersFkList = new List<AppMarketplaceItemSizeScaleHeaders>(); //listingItem.ItemSizeScaleHeadersFkList;
                        var sizeScale = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId == null);
                        if (sizeScale != null)
                        {
                            AppMarketplaceItemSizeScaleHeaders sizeScaleMarketplace = ObjectMapper.Map<AppMarketplaceItemSizeScaleHeaders>(sizeScale);
                            sizeScaleMarketplace.Id = 0;
                            sizeScaleMarketplace.AppMarketplaceItemId = 0;
                            //sizeScaleMarketplace.TenantId = null;
                            sizeScaleMarketplace.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                            //sizeScaleMarketplace.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                            sizeScaleMarketplace.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                            marketplaceItem.ItemSizeScaleHeadersFkList.Add(sizeScaleMarketplace);

                        }
                    }
                    else
                    {
                        if (marketplaceItem != null && marketplaceItem.ParentFkList != null && marketplaceItem.ParentFkList.Count > 0)
                        {
                            foreach (var item in marketplaceItem.ParentFkList)
                            {
                                children.Add(item);
                            }
                        }
                        marketplaceItemObject = await _appMarketplaceItem.GetAll().Include(x => x.ParentFkList).Include(x => x.EntityCategories)
                            .Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)
                    .Include(x => x.EntityClassifications)
                    .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    //Mariam
                    .Include(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                    .Include(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                    //Mariam
                    .Include(x => x.ParentFkList).Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                            .Where(x => x.Code == appItem.SSIN).FirstOrDefaultAsync();
                        if (marketplaceItem != null && marketplaceItem.Id != 0 && marketplaceItemObject != null)
                        {

                            if (marketplaceItemObject.EntityExtraData != null)
                            {
                                foreach (var parentExtrData in marketplaceItemObject.EntityExtraData)
                                {
                                    await _appEntityExtraDataRepository.DeleteAsync(parentExtrData);
                                }
                            }
                            if (marketplaceItemObject.EntityAttachments != null)
                            {
                                foreach (var parentAttach in marketplaceItemObject.EntityAttachments)
                                {
                                    await _appAttachmentRepository.DeleteAsync(parentAttach.AttachmentFk);
                                    await _appEntityAttachmentRepository.DeleteAsync(parentAttach);
                                }
                            }

                            if (marketplaceItemObject.EntityCategories != null)
                            {
                                foreach (var catg in marketplaceItemObject.EntityCategories)

                                {
                                    await _appEntityCategoryRepository.DeleteAsync(catg);

                                }
                            }
                            if (marketplaceItemObject.EntityClassifications != null)
                            {
                                foreach (var clas in marketplaceItemObject.EntityClassifications)
                                {
                                    await _appEntityClassificationRepository.DeleteAsync(clas);
                                }
                            }

                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                        publishedEntityId = marketplaceItem.Id;
                        sharingLevel = marketplaceItem.SharingLevel;
                        var ssin = marketplaceItem.SSIN;
                        var code = marketplaceItem.Code;
                        await _appMarketplaceItemPricesRepository.DeleteAsync(x => x.AppMarketplaceItemId == marketplaceItem.Id);
                        //SS
                        if (marketplaceItem.ItemSizeScaleHeadersFkList.Count > 0)
                        {
                            foreach (var sizeScale in marketplaceItem.ItemSizeScaleHeadersFkList.OrderByDescending(a => a.ParentId))
                            {
                                await _appItemSizeScalesDetailRepository.DeleteAsync(a => a.SizeScaleId == sizeScale.Id);
                                await _appItemSizeScalesHeaderRepository.DeleteAsync(a => a.Id == sizeScale.Id);
                            }
                        }
                        marketplaceItem.ItemSizeScaleHeadersFkList = null;
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //SS
                        ObjectMapper.Map(appItem, marketplaceItem);
                        marketplaceItem.ItemSizeScaleHeadersFkList = null;
                        marketplaceItem.ParentFkList = null;
                        marketplaceItem.Code = code;
                        marketplaceItem.Name = appItem.Name;
                        marketplaceItem.SSIN = ssin;
                        marketplaceItem.TenantId = null;
                        marketplaceItem.Notes = appItem.EntityFk.Notes;
                        marketplaceItem.Id = publishedEntityId;
                        marketplaceItem.ItemPricesFkList = ObjectMapper.Map<List<AppMarketplaceItemPrices>>(appItem.ItemPricesFkList);
                        marketplaceItem.ItemPricesFkList.ForEach(a => a.Id = 0);
                        marketplaceItem.ItemPricesFkList.ForEach(a => a.AppMarketplaceItemId = marketplaceItem.Id);
                        marketplaceItem.ItemPricesFkList.ForEach(a => a.AppItemFk = null);

                    }

                    if (!input.SyncProduct)
                        marketplaceItem.SharingLevel = input.SharingLevel;
                    else
                        marketplaceItem.SharingLevel = sharingLevel;

                    // if (marketplaceItem == null || marketplaceItem.Id == 0)
                    // {
                    marketplaceItem.EntityExtraData = null;
                    if (marketplaceItem.EntityExtraData != null)
                    {
                        foreach (var parentExtrData in marketplaceItem.EntityExtraData)
                        {
                            parentExtrData.Id = 0;
                            parentExtrData.EntityCode = marketplaceItem.Code;
                            parentExtrData.EntityId = 0;
                            parentExtrData.EntityFk = null;
                        }
                    }

                    if (marketplaceItem.EntityAttachments != null)
                    {
                        foreach (var parentAttach in marketplaceItem.EntityAttachments)
                        {
                            parentAttach.Id = 0;
                            parentAttach.AttachmentId = 0;
                            parentAttach.AttachmentFk.Id = 0;
                            parentAttach.EntityId = 0;
                            parentAttach.EntityFk = null;
                            parentAttach.AttachmentFk.TenantId = null;
                            MoveFile(parentAttach.AttachmentFk.Attachment, AbpSession.TenantId, -1);
                        }
                    }
                    if (marketplaceItem.EntityAddresses != null)
                    {
                        foreach (var address in marketplaceItem.EntityAddresses)
                        {
                            address.Id = 0;
                        }
                    }
                    if (marketplaceItem.EntityCategories != null)
                    {
                        foreach (var catg in marketplaceItem.EntityCategories)
                        {
                            catg.Id = 0;
                            catg.EntityCode = marketplaceItem.Code;
                        }
                    }
                    if (marketplaceItem.EntityClassifications != null)
                    {
                        foreach (var clas in marketplaceItem.EntityClassifications)
                        {
                            clas.EntityCode = marketplaceItem.Code;
                            clas.Id = 0;
                        }
                    }
                    if (marketplaceItem.EntitiesRelationships != null)
                    {
                        foreach (var rela in marketplaceItem.EntitiesRelationships)
                        {
                            rela.Id = 0;
                        }
                    }

                    // }
                    //else
                    //{
                    //if (marketplaceItem.EntityClassifications != null)
                    //{
                    //    foreach (var clas in marketplaceItem.EntityClassifications)
                    //    {
                    //        clas.Id = 0;
                    //    }
                    //}

                    //}
                    //Mariam

                    if (!input.SyncProduct && marketplaceItem != null && publishedEntityId != 0)
                    {
                        marketplaceItem.Id = publishedEntityId;
                        await _appMarketplaceItemSharing.DeleteAsync(x => x.AppMarketplaceItemId == publishedEntityId);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    if (!input.SyncProduct)
                    {
                        marketplaceItem.ItemSharingFkList = new List<AppMarketplaceItemSharings>();
                        foreach (var sharingDto in input.ItemSharing)
                        {
                            AppMarketplaceItemSharings sharing;
                            if (sharingDto.Id == 0)
                            {
                                sharing = ObjectMapper.Map<AppMarketplaceItemSharings>(sharingDto);
                            }
                            else
                            {
                                sharing = await _appMarketplaceItemSharing.FirstOrDefaultAsync((long)sharingDto.Id);
                                ObjectMapper.Map(sharingDto, sharing);
                            }
                            marketplaceItem.ItemSharingFkList.Add(sharing);
                            //sharing.AppMarketplaceItemId = input.AppItemId;
                            //await _appMarketplaceItemSharing.InsertAsync(sharing);
                            //updated = true;
                        }
                    }
                    //var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                    //publishItem.EntityId = savedEntity;
                    if (marketplaceItem.Id == 0)
                    {
                        marketplaceItem.ItemSizeScaleHeadersFkList = null;
                        var entityObjType = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == marketplaceItem.EntityObjectTypeId)
                               .AsNoTracking().FirstOrDefaultAsync();
                        // x.SycEntityObjectTypes.Attach(entityObjType);
                        x.Entry<SycEntityObjectType>(entityObjType).State = EntityState.Unchanged;
                        x.ChangeTracker.Clear();
                        marketplaceItem = await _appMarketplaceItem.InsertAsync(marketplaceItem);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //xx
                        if (appItem.EntityFk.EntityExtraData != null)
                        {
                            marketplaceItem.EntityExtraData = new List<AppEntityExtraData>();
                            foreach (var chEx in appItem.EntityFk.EntityExtraData)
                            {
                                chEx.Id = 0;
                                chEx.EntityCode = marketplaceItem.Code;
                                chEx.EntityId = marketplaceItem.Id;
                                marketplaceItem.EntityExtraData.Add(chEx);
                            }

                        }
                        //xx
                        // return;
                        //yy
                        if (appItem.ItemSizeScaleHeadersFkList.Count > 0)
                        {
                            marketplaceItem.ItemSizeScaleHeadersFkList = null;
                            //if (marketplaceItem.ItemSizeScaleHeadersFkList.Count > 0)
                            {
                                var itemSizeScale = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                                var marketplaceScale = ObjectMapper.Map<AppMarketplaceItemSizeScaleHeaders>(itemSizeScale);
                                marketplaceScale.Id = 0;
                                marketplaceScale.AppMarketplaceItemId = marketplaceItem.Id;
                                marketplaceScale.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                marketplaceItem.ItemSizeScaleHeadersFkList = new List<AppMarketplaceItemSizeScaleHeaders>();
                                marketplaceItem.ItemSizeScaleHeadersFkList.Add(marketplaceScale);
                                await _appMarketplaceItem.UpdateAsync(marketplaceItem);
                                await CurrentUnitOfWork.SaveChangesAsync();
                                if (itemSizeScale != null)
                                {
                                    var ItemsizeRatio = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                                    if (ItemsizeRatio != null)
                                    {
                                        var sizeRatio = ObjectMapper.Map<AppMarketplaceItemSizeScaleHeaders>(ItemsizeRatio);
                                        sizeRatio.Id = 0;
                                        sizeRatio.ParentId = marketplaceScale.Id;
                                        sizeRatio.AppMarketplaceItemId = marketplaceItem.Id;
                                        //sizeRatio.TenantId = null;
                                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                        //sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                                        marketplaceItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                                    }
                                }
                            }
                        }
                        await _appMarketplaceItem.UpdateAsync(marketplaceItem);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //yy
                    }
                    else
                    {

                        //await _appMarketplaceItem.UpdateAsync(marketplaceItem);
                        //await CurrentUnitOfWork.SaveChangesAsync();

                        x.AppMarketplaceItems.Update(marketplaceItem);
                        await x.SaveChangesAsync();
                        x.ChangeTracker.Clear();
                        if (appItem.EntityFk.EntityExtraData != null)
                        {
                            marketplaceItem.EntityExtraData = new List<AppEntityExtraData>();
                            foreach (var chEx in appItem.EntityFk.EntityExtraData)
                            {
                                chEx.Id = 0;
                                chEx.EntityCode = marketplaceItem.Code;
                                chEx.EntityId = marketplaceItem.Id;
                                marketplaceItem.EntityExtraData.Add(chEx);
                            }
                            x.AppMarketplaceItems.Update(marketplaceItem);
                            await x.SaveChangesAsync();
                        }
                        if (appItem.ItemSizeScaleHeadersFkList.Count > 1)
                        {
                            ////if (marketplaceItem.ItemSizeScaleHeadersFkList.Count > 0)
                            //{
                            //    //marketplaceItem.ItemSizeScaleHeadersFkList=  ObjectMapper.Map<List<AppMarketplaceItemSizeScaleHeaders>>(appItem.ItemSizeScaleHeadersFkList);  
                            //    marketplaceItem.ItemSizeScaleHeadersFkList = null;

                            //    var itemSizeScale = marketplaceItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                            //    if (itemSizeScale != null)
                            //    {
                            //        itemSizeScale.Id = 0;
                            //        itemSizeScale.AppMarketplaceItemId = marketplaceItem.Id;
                            //        itemSizeScale.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                            //        itemSizeScale.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                            //        //marketplaceItem.ItemSizeScaleHeadersFkList.Add(itemSizeScale);

                            //        var sizeRatio = marketplaceItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                            //        if (sizeRatio != null)
                            //        {
                            //            sizeRatio.Id = 0;
                            //            sizeRatio.ParentId = itemSizeScale.Id;
                            //            sizeRatio.AppMarketplaceItemId = marketplaceItem.Id;
                            //            //sizeRatio.TenantId = null;
                            //            sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                            //            //sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                            //            sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                            //           /// marketplaceItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                            //        }
                            //    }
                            //}
                            //x.ChangeTracker.Clear();
                            //await x.SaveChangesAsync();
                            if (appItem.ItemSizeScaleHeadersFkList.Count > 0)
                            {
                                marketplaceItem.ItemSizeScaleHeadersFkList = null;
                                //if (marketplaceItem.ItemSizeScaleHeadersFkList.Count > 0)
                                {
                                    var itemSizeScale = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                                    var marketplaceScale = ObjectMapper.Map<AppMarketplaceItemSizeScaleHeaders>(itemSizeScale);
                                    marketplaceScale.Id = 0;
                                    marketplaceScale.AppMarketplaceItemId = marketplaceItem.Id;
                                    marketplaceScale.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                    marketplaceItem.ItemSizeScaleHeadersFkList = new List<AppMarketplaceItemSizeScaleHeaders>();
                                    marketplaceItem.ItemSizeScaleHeadersFkList.Add(marketplaceScale);
                                    await _appMarketplaceItem.UpdateAsync(marketplaceItem);
                                    await CurrentUnitOfWork.SaveChangesAsync();
                                    if (itemSizeScale != null)
                                    {
                                        var ItemsizeRatio = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                                        if (ItemsizeRatio != null)
                                        {
                                            var sizeRatio = ObjectMapper.Map<AppMarketplaceItemSizeScaleHeaders>(ItemsizeRatio);
                                            sizeRatio.Id = 0;
                                            sizeRatio.ParentId = marketplaceScale.Id;
                                            sizeRatio.AppMarketplaceItemId = marketplaceItem.Id;
                                            //sizeRatio.TenantId = null;
                                            sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                            //sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = null);
                                            sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                                            marketplaceItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                                        }
                                    }
                                }
                            }
                            await _appMarketplaceItem.UpdateAsync(marketplaceItem);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                        //List<AppMarketplaceItem> modifyList = new List<AppMarketplaceItem>();
                        //modifyList.Add(marketplaceItem);
                        //x.AppMarketplaceItems.UpdateRange(modifyList);
                        //await x.SaveChangesAsync();
                    }

                    //Delete removed child items
                    if (marketplaceItem != null && publishedEntityId != 0 && children != null && children.Count > 0)  //&& marketplaceItem.ParentFkList != null
                    {
                        x.ChangeTracker.Clear();
                        //var marketplaceItemObj = await _appMarketplaceItem.GetAll().Include(x => x.ParentFkList)
                        //    .Where(x => x.Code == appItem.SSIN).FirstOrDefaultAsync();
                        var itemIds = appItem.ParentFkList.Select(x => x.SSIN).ToArray();
                        // using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                        // {
                        var existedIds = children.Select(z => z.Code).ToArray();
                        //var existedIds = await _appMarketplaceItem.GetAll().Where(z => z.ParentId == publishedEntityId && z.TenantId == null).ToListAsync();
                        //.Select(x => x.Code).ToListAsync();
                        //  }
                        var toBeDeletedIds = _appMarketplaceItem.GetAll().Where(x => existedIds.Contains(x.Code) && !itemIds.Contains(x.Code)).Select(x => x.Id).ToArray();
                        var toBeEntitiesDeletedIds = _appItemRepository.GetAll().Where(x => toBeDeletedIds.Contains(x.Id)).Select(x => x.EntityId).ToArray();

                        await _appMarketplaceItem.DeleteAsync(x => toBeDeletedIds.Contains(x.Id));
                        //await _appEntityRepository.DeleteAsync(x => toBeEntitiesDeletedIds.Contains(x.Id));
                        //XX

                        await _appMarketplaceItemPricesRepository.DeleteAsync(x => toBeDeletedIds.Contains(x.AppMarketplaceItemId));

                        await x.SaveChangesAsync();
                        //XX
                    }

                    //Save child items
                    ////List<long> entities = new List<long>();
                    ////var entityObj = appItem.ParentFkList.Select(x => x.EntityFk.EntityExtraData.Where(z => z.EntityObjectTypeId != null).Select(z=>z.EntityObjectTypeId).ToList()).Distinct().ToList();
                    ////if (entityObj != null)
                    ////{
                    ////    foreach (var ent in entityObj)
                    ////    {
                    ////        foreach (var en in ent)
                    ////        {
                    ////            //if (entities.FirstOrDefault(a => a == en) == null)
                    ////            {
                    ////                entities.AddIfNotContains<long>(long.Parse(en.ToString()));
                    ////            }
                    ////        }
                    ////       // var xx = ent.
                    ////    }
                    ////}
                    ////foreach (var xx in entities)
                    ////{
                    ////    var entityObjType = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == xx)
                    ////                                             .AsNoTracking().FirstOrDefaultAsync();
                    ////    if (entityObjType != null)
                    ////    {
                    ////       // x.ChangeTracker.Clear();
                    ////        // x.SycEntityObjectTypes.Attach(entityObjType);
                    ////        // x.Entry<SycEntityObjectType>(entityObjType)
                    ////        x.SycEntityObjectTypes.Attach(entityObjType);
                    ////        x.Entry<SycEntityObjectType>(entityObjType).State = EntityState.Unchanged;

                    //    }
                    //}
                    foreach (var child in appItem.ParentFkList)
                    {
                        child.ItemPricesFkList = await _appItemPricesRepository.GetAll().AsNoTracking().Where(a => a.AppItemId == child.Id).ToListAsync();
                        //var child = appItem.ParentFkList[a];
                        //var publishChild = await _appItemRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.PublishedListingItemId == child.Id);
                        AppMarketplaceItems.AppMarketplaceItems publishChild = new AppMarketplaceItems.AppMarketplaceItems(); ;
                        if (publishedEntityId != 0)
                            publishChild = await _appMarketplaceItem.GetAll().Include(x => x.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                                .Include(z => z.EntityExtraData)
                                .Where(x => x.Code == child.SSIN).FirstOrDefaultAsync();
                        //marketplaceItem.ParentFkList.FirstOrDefault(x => x.Code == child.SSIN);
                        long publishId = 0;
                        if (publishChild == null)
                            publishChild = new AppMarketplaceItems.AppMarketplaceItems();
                        else
                        {
                            publishId = publishChild.Id;

                        }
                        //AppEntityDto entityChildDto = new AppEntityDto();
                        //ObjectMapper.Map(child.EntityFk, entityChildDto);
                        //if (publishItem != null)
                        //{
                        //    //entityChildDto.Id = publishChild.EntityId;
                        //    entityChildDto.Code = publishChild.Code;
                        //}
                        //entityChildDto.TenantId = null;
                        //Mariam
                        string newSSIN = "";
                        if (publishId == 0)
                        {
                            // x.ChangeTracker.Clear();
                            newSSIN = child.SSIN;//await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                                                 // x.ChangeTracker.Clear();
                        }
                        else
                        {
                            newSSIN = publishChild.SSIN;
                            //SS
                            if (publishChild.EntityExtraData != null)
                            {
                                foreach (var parentExtrData in publishChild.EntityExtraData)
                                {
                                    await _appEntityExtraDataRepository.DeleteAsync(parentExtrData);
                                }
                            }
                            if (publishChild.EntityAttachments != null)
                            {
                                foreach (var parentAttach in publishChild.EntityAttachments)
                                {
                                    await _appAttachmentRepository.DeleteAsync(parentAttach.AttachmentFk);
                                    await _appEntityAttachmentRepository.DeleteAsync(parentAttach);
                                }
                            }
                            await x.SaveChangesAsync();
                            //SS
                        }
                        ObjectMapper.Map(child, publishChild);
                        if (publishChild.EntityExtraData != null)
                        {
                            publishChild.EntityExtraData = null;
                            if (publishChild.EntityExtraData != null)
                            {
                                foreach (var extrData in publishChild.EntityExtraData)
                                {
                                    extrData.Id = 0;

                                    extrData.EntityId = 0;
                                    //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[Start]
                                    if (extrData.AttributeId == 202 && !string.IsNullOrEmpty(extrData.AttributeValue))
                                        MoveFile(extrData.AttributeValue, AbpSession.TenantId, -1);
                                    //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[End]
                                    //if (extrData.EntityObjectTypeId != null && extrData.EntityObjectTypeId != 0)
                                    //{

                                    //    var entityObjTypeEx = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == extrData.EntityObjectTypeId)
                                    //    .AsNoTracking().FirstOrDefaultAsync();
                                    //    x.SycEntityObjectTypes.Attach(entityObjTypeEx);
                                    //    x.Entry<SycEntityObjectType>(entityObjTypeEx).State = EntityState.Unchanged;
                                    //   x.ChangeTracker.Clear();
                                    //    await x.SaveChangesAsync();

                                    //}
                                }
                            }
                        }
                        if (publishChild.EntityAttachments != null)
                        {
                            foreach (var parentAttach in publishChild.EntityAttachments)
                            {
                                parentAttach.Id = 0;
                                parentAttach.AttachmentId = 0;
                                parentAttach.AttachmentFk.Id = 0;
                                parentAttach.AttachmentFk.TenantId = null;
                                MoveFile(parentAttach.AttachmentFk.Attachment, AbpSession.TenantId, -1);
                            }
                        }
                        if (publishChild.EntityAddresses != null)
                        {
                            foreach (var address in publishChild.EntityAddresses)
                            {
                                address.Id = 0;
                            }
                        }
                        if (publishChild.EntityCategories != null)
                        {
                            foreach (var catg in publishChild.EntityCategories)
                            {
                                catg.Id = 0;
                            }
                        }
                        if (publishChild.EntityClassifications != null)
                        {
                            foreach (var clas in publishChild.EntityClassifications)
                            {
                                clas.Id = 0;
                            }
                        }
                        if (publishChild.EntitiesRelationships != null)
                        {
                            foreach (var rela in publishChild.EntitiesRelationships)
                            {
                                rela.Id = 0;
                            }
                        }
                        //Mariam
                        //AppItem newitemChild = new AppItem();


                        publishChild.Id = publishId;
                        publishChild.ObjectId = itemObjectId;
                        publishChild.ParentId = marketplaceItem.Id;
                        publishChild.Notes = child.EntityFk.Notes;
                        publishChild.Name = child.Name;
                        //publishChild.ParentEntityId = publishItem.EntityId;
                        if (!input.SyncProduct)
                            publishChild.SharingLevel = input.SharingLevel;
                        else
                            publishChild.SharingLevel = sharingLevel;
                        //publishChild.ListingItemId = null;
                        //publishChild.PublishedListingItemId = child.Id;
                        // publishChild.ItemType = 2;
                        publishChild.TenantId = null;
                        publishChild.SSIN = newSSIN; // await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                        publishChild.TenantOwner = int.Parse(child.TenantId.ToString());
                        //publishChild.Id = 0;
                        //xxx
                        publishChild.ItemPricesFkList = ObjectMapper.Map<List<AppMarketplaceItemPrices>>(child.ItemPricesFkList);
                        //publishChild.ItemPricesFkList.ForEach(a => a.TenantId = null);
                        publishChild.ItemPricesFkList.ForEach(a => a.Id = 0);
                        publishChild.ItemPricesFkList.ForEach(a => a.AppMarketplaceItemId = publishChild.Id);
                        publishChild.ParentFk = null;

                        //var savedEntityChild = await _appEntitiesAppService.SaveEntity(entityChildDto);
                        // publishChild.EntityId = savedEntityChild;

                        if (publishChild.Id == 0)
                        {


                            //var entityObjType = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == publishChild.EntityObjectTypeId)
                            //      .AsNoTracking().FirstOrDefaultAsync();
                            //  x.SycEntityObjectTypes.Attach(entityObjType);
                            // publishChild.EntityObjectTypeFk = entityObjType;
                            // publishChild.EntityObjectTypeId = -1;//entityObjType.Id;
                            //   x.Entry<SycEntityObjectType>(entityObjType).State = EntityState.Unchanged;
                            //x.SycEntityObjectTypes.Entry(publishChild.EntityObjectTypeId).State = EntityState.Unchanged;\
                            // x.ChangeTracker.Clear();
                            //publishChild.EntityObjectTypeId = 0;
                            //x.AppMarketplaceItems.Add(publishChild);
                            publishChild = await _appMarketplaceItem.InsertAsync(publishChild);
                            await x.SaveChangesAsync();
                            if (child.EntityFk.EntityExtraData != null)
                            {
                                publishChild.EntityExtraData = new List<AppEntityExtraData>();
                                x.ChangeTracker.Clear();
                                foreach (var chEx in child.EntityFk.EntityExtraData)
                                {
                                    chEx.Id = 0;
                                    chEx.EntityCode = publishChild.Code;
                                    chEx.EntityId = publishChild.Id;
                                    chEx.EntityObjectTypeFk = null;
                                    publishChild.EntityExtraData.Add(chEx);

                                    //if (chEx.EntityObjectTypeId != null)
                                    // {
                                    //     var entityObjType = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == chEx.EntityObjectTypeId)
                                    //      .AsNoTracking().FirstOrDefaultAsync();
                                    // ////   // if (x.Entry<SycEntityObjectType>(entityObjType).Attach().FirstOrDefault(x => x.Id == entityObjType.Id) == null)
                                    // ////    {
                                    //         // x.SycEntityObjectTypes.Attach(entityObjType);
                                    // ////       // x.Entry<SycEntityObjectType>(entityObjType)
                                    //       x.Entry<SycEntityObjectType>(entityObjType).State = EntityState.Unchanged;

                                    // ////    }
                                    // }
                                }
                                //x.ChangeTracker.Clear();
                                //publishChild = await _appMarketplaceItem.InsertAsync(publishChild);
                                //await x.SaveChangesAsync();
                                x.ChangeTracker.Clear();
                                publishChild = await _appMarketplaceItem.UpdateAsync(publishChild);
                                await CurrentUnitOfWork.SaveChangesAsync();
                                x.ChangeTracker.Clear();
                            }

                        }
                        else
                        {
                            x.ChangeTracker.Clear();
                            publishChild = await _appMarketplaceItem.UpdateAsync(publishChild);
                            await x.SaveChangesAsync();
                            if (child.EntityFk.EntityExtraData != null)
                            {
                                publishChild.EntityExtraData = new List<AppEntityExtraData>();
                                foreach (var chEx in child.EntityFk.EntityExtraData)
                                {
                                    chEx.Id = 0;
                                    chEx.EntityCode = publishChild.Code;
                                    chEx.EntityId = publishChild.Id;
                                    chEx.EntityObjectTypeFk = null;
                                    publishChild.EntityExtraData.Add(chEx);
                                }
                                x.ChangeTracker.Clear();
                                await _appMarketplaceItem.UpdateAsync(publishChild);
                                await CurrentUnitOfWork.SaveChangesAsync();
                                x.ChangeTracker.Clear();
                            }
                        }

                    }
                    await CurrentUnitOfWork.SaveChangesAsync();
                    //send notification to the users

                    //await _appNotifier.SharedProduct(tenant);
                }
                //    x.ChangeTracker.Clear();
                //SharingItemOptions sh = new SharingItemOptions();
                //sh.ItemSharing = input.ItemSharing;
                //sh.AppItemId = marketplaceItem.Id;
                //sh.Message = input.Message;
                //sh.SharingLevel = input.SharingLevel;
                //await SaveItemSharingOptions(input);
            }

        }
        private async Task SaveItemSharingOptions(SharingItemOptions input)
        {
            bool updated = false;
            ////save ItemSharing
            foreach (var sharingDto in input.ItemSharing)
            {
                AppMarketplaceItemSharings sharing;
                if (sharingDto.Id == 0)
                {
                    sharing = ObjectMapper.Map<AppMarketplaceItemSharings>(sharingDto);
                }
                else
                {
                    sharing = await _appMarketplaceItemSharing.FirstOrDefaultAsync((long)sharingDto.Id);
                    ObjectMapper.Map(sharingDto, sharing);
                }
                sharing.AppMarketplaceItemId = input.AppItemId;
                await _appMarketplaceItemSharing.InsertAsync(sharing);
                updated = true;
            }

            ////delete not existed item sharing
            if (input.ItemSharing != null && input.ItemSharing.Count > 0)
            {
                var sharingIds = input.ItemSharing.Select(x => x.Id).ToArray();
                await _appMarketplaceItemSharing.DeleteAsync(x => !sharingIds.Contains(x.Id));
                updated = true;
            }
            if (updated == true)
                await CurrentUnitOfWork.SaveChangesAsync();
        }
        //mmt33-2
        private async Task SaveSharingOptions(PublishItemOptions input)
        {
            //var item = await _appItemRepository.GetAll().Include(x=>x.ItemSharingFkList).FirstOrDefaultAsync(x=>x.Id==input.ListingItemId);

            //item.SharingLevel = input.SharingLevel;

            ////save ItemSharing
            foreach (var sharingDto in input.ItemSharing)
            {
                AppItemSharing sharing;
                if (sharingDto.Id == 0)
                {
                    sharing = ObjectMapper.Map<AppItemSharing>(sharingDto);
                }
                else
                {
                    sharing = await _appItemSharingRepository.FirstOrDefaultAsync((long)sharingDto.Id);
                    ObjectMapper.Map(sharingDto, sharing);
                }
                sharing.ItemId = input.ListingItemId;
                await _appItemSharingRepository.InsertAsync(sharing);
            }

            ////delete not existed item sharing
            var sharingIds = input.ItemSharing.Select(x => x.Id).ToArray();
            await _appItemSharingRepository.DeleteAsync(x => !sharingIds.Contains(x.Id));

        }

        public async Task<PublishItemOptions> GetPublishItemOptions(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var item = await _appItemRepository.GetAll().Include(x => x.ItemSharingFkList).ThenInclude(x => x.UserFk).FirstOrDefaultAsync(x => x.PublishedListingItemId == input.Id);

                if (item != null)
                {
                    PublishItemOptions options = new PublishItemOptions
                    {
                        ListingItemId = item.PublishedListingItemId,
                        SharingLevel = item.SharingLevel,
                        ItemSharing = ObjectMapper.Map<List<ItemSharingDto>>(item.ItemSharingFkList),
                    };

                    foreach (var itemSharing in options.ItemSharing)
                    {
                        var tenantId = item.ItemSharingFkList.FirstOrDefault(x => x.UserFk != null && x.SharedUserId == itemSharing.SharedUserId).UserFk.TenantId;
                        itemSharing.SharedUserTenantName = TenantManager.Tenants.FirstOrDefault(x => x.Id == tenantId).TenancyName;
                    }
                    return options;
                }
                else
                    return null;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppItems_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            var item = await _appItemRepository.GetAll()
                .Include(x => x.EntityFk)
                .Include(x => x.ParentFkList)
                .FirstOrDefaultAsync(x => x.Id == input.Id);
            if (item != null)
            {
                foreach (var child in item.ParentFkList)
                {
                    await _appEntityRepository.DeleteAsync(child.EntityId);
                    await _appItemRepository.DeleteAsync(child.Id);
                    //XX
                    await _appItemPricesRepository.DeleteAsync(a => a.AppItemId == child.Id);
                    //XX
                }

                await _appEntityRepository.DeleteAsync(item.EntityId);
                await _appItemRepository.DeleteAsync(item.Id);
                //XX
                await _appItemPricesRepository.DeleteAsync(a => a.AppItemId == item.Id);
                await _appItemSizeScalesHeaderRepository.DeleteAsync(a => a.AppItemId == item.Id);
                //XX
            }
        }

        public async Task<FileDto> GetAppItemsToExcel(GetAllAppItemsForExcelInput input)
        {

            var filteredAppItems = _appItemRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Description.Contains(input.Filter));

            var query = (from o in filteredAppItems
                         select new GetAppItemForViewDto()
                         {
                             AppItem = new AppItemDto
                             {
                                 Code = o.Code,
                                 Name = o.Name,
                                 Description = o.Description,
                                 Price = o.Price,
                                 Id = o.Id
                             }
                         });

            var appItemListDtos = await query.ToListAsync();

            return _appItemsExcelExporter.ExportToFile(appItemListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Publish)]
        public async Task UnPublishProduct(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //var listingItem = await _appItemRepository.FirstOrDefaultAsync(x => x.Id == input.Id);
                var publishItem = await _appItemRepository.FirstOrDefaultAsync(x => x.PublishedListingItemId == input.Id);

                await Delete(new EntityDto<long> { Id = (long)publishItem.Id });
            }
        }

        public async Task<List<AppItemVariationDto>> GetVariations(long ItemId)
        {
            var filteredAppItemsListItems = _appItemRepository.GetAll()
                        .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                        .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                        .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                        .Where(x => x.ParentId == ItemId);


            var appItemsLists = from o in filteredAppItemsListItems
                                select new AppItemVariationDto
                                {
                                    ItemId = o.Id,
                                    ItemName = o.Name,
                                    ItemCode = o.Code,
                                    Price = o.Price,
                                    ImgURL = (o.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                    (o.EntityFk.EntityAttachments.FirstOrDefault() == null ? "attachments/" + AbpSession.TenantId + "/" + o.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                    : "attachments/" + AbpSession.TenantId + "/" + o.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                    ,
                                    EntityExtraData = o.EntityFk.EntityExtraData.Select(x => new AppEntityExtraDataDto { AttributeId = x.AttributeId, AttributeValue = (!string.IsNullOrEmpty(x.AttributeValueFk.Name) ? x.AttributeValueFk.Name : x.AttributeValue), AttributeValueId = x.AttributeValueId, EntityId = x.EntityId, EntityObjectTypeCode = x.EntityObjectTypeFk.Code, EntityObjectTypeId = x.EntityObjectTypeId, EntityObjectTypeName = x.EntityObjectTypeFk.Name, Id = x.Id }).ToList()
                                    ,
                                    EntityAttachments = o.EntityFk.EntityAttachments.Select(x => new AppEntityAttachmentDto { AttachmentCategoryId = x.AttachmentCategoryId, Id = x.Id, Attributes = x.Attributes, DisplayName = x.AttachmentFk.Name, FileName = x.AttachmentFk.Attachment, IsDefault = x.IsDefault, Url = "attachments/" + AbpSession.TenantId + "/" + x.AttachmentFk.Attachment }).ToList()
                                };
            //var appItemsLists = await pagedAndFilteredAppItemsListItems.ToListAsync();  

            var x = await appItemsLists.ToListAsync();

            return x;

        }
        //Mariam[Start]
        public async Task<ExcelTemplateDto> GetExcelTemplate(long? productTypeId)
        {
            ExcelTemplateDto itemExcelTemplateDto = new ExcelTemplateDto();
            itemExcelTemplateDto.ExcelTemplatePath = "";
            try
            {
                #region get lookups
                //get currency types
                List<CurrencyInfoDto> currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();
                // get Product Departments
                PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();
                //get classifications for contacts
                PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());

                PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> categoriesIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });
                // get Product Categories
                List<SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto> productTypes = await _sycEntityObjectCategoriesAppService.GetAllSycEntityObjectCategoryForTableDropdown();
                var retProductsTypes = await _SycEntityObjectTypesAppService.GetAllWithChildsForProduct();

                List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();

                var entityObjectExtraAttribute = _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(long.Parse(productTypeId.ToString())).Result.ToList().FirstOrDefault();
                //var entityObjCode = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(int.Parse(productTypeId.ToString())) ;
                #endregion

                string directory = _appConfiguration[$"Templates:ExcelTemplate"];
                if (!System.IO.Directory.Exists(directory))
                { System.IO.Directory.CreateDirectory(directory); }

                #region delete old files
                string[] listFiles = System.IO.Directory.GetFiles(directory);

                foreach (string file in listFiles)
                {

                    try
                    {
                        TimeSpan createdSince = (DateTime.Now - System.IO.File.GetCreationTime(file));
                        if (createdSince.TotalHours >= 1)
                        {
                            System.IO.File.Delete(file);
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }

                #endregion delete old files

                #region get new file name
                string templateFileName = _appConfiguration[$"ItemTemplates:ItemExcelTemplate"];
                string newFileName = Path.GetFileNameWithoutExtension(templateFileName) + DateTime.Now.ToString("yyyyMMddhhmmss") + Path.GetExtension(templateFileName);
                #endregion get new file name

                string newFilePath = directory + @"\" + newFileName;
                if (!System.IO.File.Exists(newFilePath))
                {
                    System.IO.File.Copy(System.IO.Directory.GetCurrentDirectory() + _appConfiguration[$"ItemTemplates:ExcelTemplatesAssets"], newFilePath);
                }

                itemExcelTemplateDto.ExcelTemplatePath = directory.Replace(_appConfiguration[$"ItemTemplates:ExcelTemplateOmitt"], "").Replace(@"\", "/");
                itemExcelTemplateDto.ExcelTemplateFile = newFileName;
                itemExcelTemplateDto.ExcelTemplateFullPath = itemExcelTemplateDto.ExcelTemplatePath + @"/" + itemExcelTemplateDto.ExcelTemplateFile;
                itemExcelTemplateDto.ExcelTemplateVersion = _appConfiguration[$"ItemTemplates:ItemExcelTemplateVersion:CurrentVersion"];
                itemExcelTemplateDto.ExcelTemplateDate = _appConfiguration[$"ItemTemplates:ItemExcelTemplateDate"];


                #region update the excel sheet with errors
                // Create new Spreadsheet
                Spreadsheet document = new Spreadsheet();
                document.LoadFromFile(newFilePath);
                //Validation Rules
                Worksheet ValidRuleSheet = document.Workbook.Worksheets.ByName("Validation Rules");
                ValidRuleSheet.Cell("C2").Value = itemExcelTemplateDto.ExcelTemplateVersion;
                #region fill accounts valid entries
                // Get worksheet by name [Products]
                Worksheet Sheet = document.Workbook.Worksheets.ByName("Products");
                // Set currecy "A"
                if (entityObjectExtraAttribute != null && entityObjectExtraAttribute.ExtraAttributes != null &&
                    entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes != null && entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes.Count > 0)
                {
                    Sheet.Cell(1, 0).Value = entityObjectExtraAttribute.Code;
                    int start = 18;
                    for (int exAtr = 0; exAtr < entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes.Count; exAtr++)
                    {

                        if (!entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].IsLookup)
                        {
                            Sheet.Cell(0, start).Value = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].Name;
                            Sheet.Range(0, start, 0, start).FillPatternForeColor = System.Drawing.Color.FromArgb(146, 208, 80);
                            Sheet.Cell(0, start).SetFontProperties("Calibri", false, false, false, 11, 0, 0, 0);
                            start += 1;
                        }
                        else
                        {
                            //Sheet.Cell(0, start).Value = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].Name;
                            //Sheet.Range (0,start,0,start).FillPatternBackColor  = System.Drawing.Color.FromArgb(146, 208, 80);
                            //Sheet.Cell(0, start).SetFontProperties("Calibri", false, false, false, 11, 0, 0, 0);
                            ////Sheet.Cell(0, start).ShrinkToFit = true;
                            //start += 1;
                            Sheet.Cell(0, start).Value = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].Name + " " + "code";
                            // Sheet.Cell(0, start).FillPatternBackColor = System.Drawing.Color.FromArgb(146, 208, 80);
                            //Sheet.Cell(0, start).ShrinkToFit = true;
                            Sheet.Range(0, start, 0, start).FillPatternForeColor = System.Drawing.Color.FromArgb(146, 208, 80);
                            Sheet.Cell(0, start).SetFontProperties("Calibri", false, false, false, 11, 0, 0, 0);
                            start += 1;
                            Sheet.Cell(0, start).Value = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].Name + " " + "name";
                            //Sheet.Cell(0, start).ShrinkToFit = true ;
                            //Sheet.Cell(0, start).FillPatternBackColor = System.Drawing.Color.FromArgb(146, 208, 80);
                            Sheet.Range(0, start, 0, start).FillPatternBackColor = System.Drawing.Color.FromArgb(146, 208, 80);
                            Sheet.Cell(0, start).SetFontProperties("Calibri", false, false, false, 11, 0, 0, 0);
                            start += 1;
                        }
                    }

                }
                //GetAllEntitiesByTypeCode
                //string column = "Z";
                //int row = 2;
                //Sheet.Cell(column + row.ToString()).Value = "Product Type";
                //row = 3;
                //foreach (var obj in productTypes)
                //{
                //    row++;
                //    Sheet.Cell(column + row.ToString()).Value = obj.DisplayName;
                //}

                //column = "AA";
                //row = 2;
                //Sheet.Cell(column + row.ToString()).Value = "Currency";
                //row = 3;
                //foreach (var obj in currencyIds)
                //{
                //    row++;
                //    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                //}

                //// Image Type  
                //column = "AB";
                //row = 2;
                //Sheet.Cell(column + row.ToString()).Value = "Image Type";
                //row = 3;
                //foreach (var obj in attachmentsCategories)
                //{
                //    row++;
                //    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                //}

                //// Phone Type
                //column = "AC";
                //row = 2;
                //Sheet.Cell(column + row.ToString()).Value = "Department";
                //row = 3;
                //foreach (var obj in departmentIds.Items)
                //{
                //    row++;
                //    Sheet.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectCategory.Code;
                //}
                //// Language 
                //column = "AD";
                //row = 2;
                //Sheet.Cell(column + row.ToString()).Value = "Classification";
                //row = 3;
                //foreach (var obj in classIds.Items)
                //{
                //    row++;
                //    Sheet.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectClassification.Code;
                //}
                //// Country 
                //column = "AE";
                //row = 2;
                //Sheet.Cell(column + row.ToString()).Value = "Category";
                //row = 3;
                //foreach (var obj in categoriesIds.Items)
                //{
                //    row++;
                //    Sheet.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectCategory.Code;
                //}

                #endregion fill accounts valid entries

                #region fill valid entries sheet
                // Get worksheet by name [Accounts]
                Worksheet Sheetvalid = document.Workbook.Worksheets.ByName("Valid Entries");

                string column = "B";
                int row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Product Type";
                row = 3;
                foreach (var obj in productTypes)
                {
                    //foreach(var obj in retProductsTypes.Items)
                    //{
                    //    long? childcnt = obj.totalChildrenCount;

                    //        foreach (var objectchild in obj.Children)
                    //        {
                    //                if (objectchild.Leaf)
                    //                {
                    //                    row++;
                    //                    Sheetvalid.Cell(column + row.ToString()).Value = objectchild.label;
                    //                }
                    //                //if (obj.totalChildrenCount > 0)
                    //                //{
                    //                //    childcnt = obj.totalChildrenCount;
                    //                //    obj = objectchild;
                    //                //}
                    //        }

                    //    if (obj.Leaf)
                    //    {
                    //        row++;
                    //        Sheetvalid.Cell(column + row.ToString()).Value = obj.label;
                    //    }

                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.DisplayName;
                }

                column = "C";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Currency";
                row = 3;
                foreach (var obj in currencyIds)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }

                // Image Type  
                column = "D";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Image Type";
                row = 3;
                foreach (var obj in attachmentsCategories)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }

                // Phone Type
                column = "E";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Department";
                row = 3;
                foreach (var obj in departmentIds.Items)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectCategory.Code;
                }
                // Language 
                column = "F";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Classification";
                row = 3;
                foreach (var obj in classIds.Items)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectClassification.Code; //.SycEntityObjectClassification.Code;
                }
                // Country 
                column = "G";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Category";
                row = 3;
                foreach (var obj in categoriesIds.Items)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectCategory.Code;
                }
                int startCol = 7;
                if (entityObjectExtraAttribute != null && entityObjectExtraAttribute.ExtraAttributes != null &&
                   entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes != null && entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes.Count > 0)
                {
                    for (int exAtr = 0; exAtr < entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes.Count; exAtr++)
                    {
                        if (!entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].IsLookup)
                            continue;
                        row = 1;
                        var retrunValues = await _appEntitiesAppService.GetAllEntitiesByTypeCode(entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].EntityObjectTypeCode);
                        if (retrunValues != null && retrunValues.Count > 0)
                        {
                            Sheetvalid.Cell(row, startCol).Value = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].EntityObjectTypeCode + " Code";
                            Sheetvalid.Cell(row, startCol).SetFontProperties("Calibri", true, false, false, 11, 0, 0, 0);
                            Sheetvalid.Cell(row, startCol + 1).Value = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].EntityObjectTypeCode + " Description";
                            Sheetvalid.Cell(row, startCol + 1).SetFontProperties("Calibri", true, false, false, 11, 0, 0, 0);
                            row = 2;
                            foreach (var val in retrunValues)
                            {
                                row++;
                                Sheetvalid.Cell(row, startCol).Value = val.Code;
                                Sheetvalid.Cell(row, startCol + 1).Value = val.Label;

                            }
                            startCol += 2;

                        }
                    }
                }
                #endregion fill accounts valid entries

                // Save and Close document
                document.SaveAsXLSX(newFilePath);
                document.Close();

                #endregion update the excel sheet with errors
            }
            catch (Exception ex)
            {
                string xx = ex.Message;
            }

            return itemExcelTemplateDto;
        }
        public async Task<AppItemExcelResultsDTO> ValidateExcel(string guidFile, string[] imagesList)
        {

            string currentExcelTemplateVersion = _appConfiguration[$"ItemTemplates:ItemExcelTemplateVersion:CurrentVersion"];
            string validExcelTemplates = _appConfiguration[$"ItemTemplates:ItemExcelTemplateVersion:SupportedVersions"];

            AppItemExcelResultsDTO itemExcelResultsDTO = new AppItemExcelResultsDTO();
            itemExcelResultsDTO.TotalRecords = 0;
            itemExcelResultsDTO.TotalPassedRecords = 0;
            itemExcelResultsDTO.TotalFailedRecords = 0;
            itemExcelResultsDTO.FilePath = "";
            itemExcelResultsDTO.ExcelRecords = new List<AppItemtExcelRecordDTO>() { };
            try
            {

                #region open the excel
                var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
                var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\" + guidFile + ".xlsx";
                var ds = _helper.ExcelHelper.GetExcelDataSet(path);
                //Validation Rules
                try
                {
                    var validationRuleSheet = ds.Tables["Validation Rules"];
                    if (validationRuleSheet != null)
                    {
                        string version = ds.Tables["Validation Rules"].Rows[1].ItemArray[2].ToString();
                        if (version.ToString() != currentExcelTemplateVersion && !validExcelTemplates.Contains(version.ToString()))
                        {
                            throw new UserFriendlyException("This Excel version does not match any of the supported Excel versions");
                        }
                    }
                    else
                    {
                        throw new UserFriendlyException("This Excel file format is invalid");
                    }
                }
                catch (Exception exObj)
                {
                    throw new UserFriendlyException("This Excel file format is invalid");
                }


                //rename columns
                for (int icounter = 0; icounter < ds.Tables[0].Columns.Count; icounter++)
                {
                    string fieldName = ds.Tables[0].Rows[0][icounter].ToString().Trim().Replace(" ", "").Replace(".", "");
                    if (!string.IsNullOrEmpty(fieldName))
                        ds.Tables[0].Columns[icounter].ColumnName = fieldName;
                }
                List<CurrencyInfoDto> currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();
                // get Product Departments
                //PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();
                //get classifications for contacts
                PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());

                PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> categoriesIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });
                // get Product Categories
                List<SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto> productTypes = await _sycEntityObjectCategoriesAppService.GetAllSycEntityObjectCategoryForTableDropdown();

                List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();

                string productType = ds.Tables["Products"].Rows[1].ItemArray[0].ToString();
                var pdtyp = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(productType);
                var productTypeId = pdtyp.FirstOrDefault();
                //var productTypeId = productTypes.FirstOrDefault(x => x.DisplayName == productType);
                //MMT
                var productColumn = ds.Tables["Products"].Columns["ProductType"];
                if (productColumn == null)
                    throw new UserFriendlyException("Product Type columns is missing.");

                var colData = ds.Tables["Products"].DefaultView.ToTable(true, new string[] { "ProductType" });

                if (colData.Rows.Count > 2)
                    throw new UserFriendlyException("Product Type column must have the same value in all data rows.");

                if (productTypeId == null)
                    throw new UserFriendlyException("Invalid Product Type");
                //MMT
                // var entityObjectExtraAttribute = await  _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(long.Parse(productTypeId.Id.ToString()));//.Result.Select(X => X.Code).ToArray();
                var entityObjectExtraAttribute = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(long.Parse(productTypeId.Id.ToString()));
                var entityextr = entityObjectExtraAttribute.FirstOrDefault();
                List<ExtraAttribute> entityExtraAttributes = null;
                if (entityextr != null && entityextr.ExtraAttributes != null)
                    entityExtraAttributes = entityextr.ExtraAttributes.ExtraAttributes;

                //xx
                if (entityExtraAttributes != null)
                {
                    foreach (var extraAtt in entityExtraAttributes)
                    {
                        string attName = extraAtt.Name;
                        if (extraAtt.IsLookup)
                        {
                            var colCode = ds.Tables["Products"].Columns[attName.Replace(" ", "") + "Code"];
                            if (colCode == null)
                            {
                                throw new UserFriendlyException(attName + " Code column is missing.");
                            }
                            else
                            {
                                if (extraAtt.IsVariation)
                                {
                                    var codeRows = ds.Tables["Products"].DefaultView.ToTable(true, new string[] { "RecordType", attName.Replace(" ", "") + "Code" });
                                    if (codeRows.Rows != null)
                                    {
                                        foreach (DataRow rowValue in codeRows.Rows)
                                        {

                                            if (rowValue[0].ToString() == "Item Variant" & string.IsNullOrEmpty(rowValue[1].ToString()))
                                                throw new UserFriendlyException(attName + " Code column has empty value in some rows.");

                                        }
                                    }

                                }
                            }
                            var colName = ds.Tables["Products"].Columns[attName.Replace(" ", "") + "Name"];
                            if (colName == null)
                            {
                                throw new UserFriendlyException(attName + " Name column is missing.");
                            }
                            else
                            {
                                if (extraAtt.IsVariation)
                                {
                                    var codeRows = ds.Tables["Products"].DefaultView.ToTable(true, new string[] { "RecordType", attName.Replace(" ", "") + "Name" });
                                    if (codeRows.Rows != null)
                                    {
                                        foreach (DataRow rowValue in codeRows.Rows)
                                        {

                                            if (rowValue[0].ToString() == "Item Variant" & string.IsNullOrEmpty(rowValue[1].ToString()))
                                                throw new UserFriendlyException(attName + " Name column has empty value in some rows.");

                                        }
                                    }

                                }
                            }
                        }
                        else
                        {
                            //T-SII-20230223.0002,1 MMT 02/28/2023 -Import Items program : Product Type attributes[Start]
                            var colAtt = ds.Tables["Products"].Columns[attName.Replace(" ", "")];
                            //T-SII-20230223.0002,1 MMT 02/28/2023 -Import Items program : Product Type attributes[End]
                            if (!string.IsNullOrEmpty(attName) && colAtt == null)
                                //T-SII-20230223.0002,1 MMT 02/28/2023 -Import Items program : Product Type attributes[Start]
                                throw new UserFriendlyException(attName + " column is missing.");
                            //T-SII-20230223.0002,1 MMT 02/28/2023 -Import Items program : Product Type attributes[End]
                        }
                    }
                }
                //xx

                #endregion
                #region create mapper to middle layer AppItemExcelDto list of objects
                MapperConfiguration configuration;
                configuration = new MapperConfiguration(a => { a.AddProfile(new AppItemExcelDtoProfile(entityExtraAttributes)); });
                IMapper mapper;
                mapper = configuration.CreateMapper();
                List<AppItemExcelDto> result;
                try
                {
                    result = mapper.Map<List<DataRow>, List<AppItemExcelDto>>(new List<DataRow>(ds.Tables[0].Rows.OfType<DataRow>()));
                }
                catch (Exception exObj)
                {
                    throw new UserFriendlyException("This Excel file format is invalid");
                }
                #endregion create mapper to middle layer AccountExcelDto list of objects
                #region Excel validateion rules only.
                // 0.Record images array existance in the images array
                // 1.Record duplicated in excel
                // 2.Sheet.Code and Sheet.Name are not empty
                // 3.Sheet.Email Address is not empty, then it has a valid email address
                // 4.Sheet.Website is not empty, then it has a valid website
                // 5.Sheet.RecordType shuold be either 'Account', 'Branch' or 'Contact'
                // 6.Sheet.AccountType shuold be either 'Seller', 'Buyer' and 'Seller & Buyer'
                Int32 rowNumber = 1;
                //foreach (var rec in result)
                //{
                //    if (rec.ImageType != "Image Type")
                //    {
                //        rowNumber++;
                //        rec.rowNumber = rowNumber;
                //        var itemExists = _appItemRepository.GetAll().FirstOrDefault(x => x.Code == rec.Code);
                //        if (itemExists != null)
                //        {
                //            rec.Id = itemExists.Id;
                //        }

                //    }
                //}
                //Spreadsheet document = new Spreadsheet();
                //document.LoadFromFile(itemExcelResultsDTO.FilePath);
                //Worksheet Sheet = document.Workbook.Worksheets[0];
                //// Set current cell
                //Sheet.Cell("CA1").Value = "Processing Status";
                //Sheet.Cell("CB1").Value = "Processing Error Message";
                //Sheet.Cell("CC1").Value = "Processing Error Details";

                //itemExcelResultsDTO.CodesFromList = new List<string>();
                //itemExcelResultsDTO.FromList = new List<Int32>();
                //itemExcelResultsDTO.ToList = new List<Int32>();
                itemExcelResultsDTO.TotalRecords = result.Count();
                itemExcelResultsDTO.TotalPassedRecords = 0;
                itemExcelResultsDTO.TotalFailedRecords = 0;
                itemExcelResultsDTO.FilePath = path;
                itemExcelResultsDTO.ExcelRecords = new List<AppItemtExcelRecordDTO>() { };
                #region Excel validation rules only.
                List<string> RecordsCodes = result.Select(r => r.Code).ToList();
                List<string> RecordsParentCodes = result.Select(r => r.ParentCode).ToList();
                foreach (AppItemExcelDto itemExcelDto in result)
                {
                    if (itemExcelDto.ProductType == "Product Type")
                    {
                        continue;
                    }
                    ////if (rowNumber > 2)
                    ////{ itemExcelResultsDTO.ToList.Add(rowNumber - 1); }
                    ////itemExcelResultsDTO.FromList.Add(rowNumber);
                    ////itemExcelResultsDTO.CodesFromList.Add(Sheet.Cell("D" + rowNumber.ToString()).Value.ToString());

                    AppItemtExcelRecordDTO itemExcelRecordErrorDTO = new AppItemtExcelRecordDTO();
                    itemExcelRecordErrorDTO.RecordType = itemExcelDto.RecordType;
                    itemExcelRecordErrorDTO.ParentCode = itemExcelDto.ParentCode;
                    itemExcelRecordErrorDTO.Code = itemExcelDto.Code;
                    itemExcelRecordErrorDTO.Name = itemExcelDto.Name;
                    itemExcelRecordErrorDTO.Status = ExcelRecordStatus.Passed.ToString();
                    itemExcelRecordErrorDTO.ErrorMessage = "";
                    itemExcelRecordErrorDTO.FieldsErrors = new List<string>() { };

                    string recordErrorMEssage = "Wrong data in this " + itemExcelRecordErrorDTO.RecordType + ". check this record in the sheet and update";
                    bool hasWarning = false;

                    rowNumber++;
                    itemExcelDto.rowNumber = rowNumber;
                    //T-SII-20230330.0001,1 MMT 04/05/2023 -Delete an item , then import it again[Start]
                    //var itemExists = _appItemRepository.GetAll().FirstOrDefault(x => x.Code == itemExcelDto.Code);
                    var itemExists = _appItemRepository.GetAll().FirstOrDefault(x => x.Code == itemExcelDto.Code && x.ItemType == 0);
                    //T-SII-20230330.0001,1 MMT 04/05/2023 -Delete an item , then import it again[End]
                    if (itemExists != null)
                    {
                        itemExcelDto.Id = itemExists.Id;
                        //T-SII-20231127.0003,1 MMT 01/01/2024 -Import products program-Validation Step-need to adjust the text appear on the validation step of import program - ( Code is already existing ) to (Code already exists)[Start]
                        //itemExcelRecordErrorDTO.FieldsErrors.Add("Code :" + itemExcelDto.Code + " is already existing!");
                        //recordErrorMEssage = "Code :" + itemExcelDto.Code + " is already existing!";
                        itemExcelRecordErrorDTO.FieldsErrors.Add("Code :" + itemExcelDto.Code + " already exists!");
                        recordErrorMEssage = "Code :" + itemExcelDto.Code + " already exists!";
                        //T-SII-20231127.0003,1 MMT 01/01/2024 -Import products program-Validation Step-need to adjust the text appear on the validation step of import program - ( Code is already existing ) to (Code already exists)[End]
                        itemExcelResultsDTO.HasDuplication = true;
                        hasWarning = true;
                    }


                    itemExcelRecordErrorDTO.ExcelDto = itemExcelDto;
                    var ValidateResults = new List<ValidationResult>();

                    Validator.TryValidateObject(itemExcelDto, new System.ComponentModel.DataAnnotations.ValidationContext(itemExcelDto), ValidateResults, true);

                    if (ValidateResults.Count > 0)
                    {
                        foreach (var res in ValidateResults)
                        {
                            itemExcelRecordErrorDTO.FieldsErrors.Add(res.ErrorMessage);
                        }
                    }
                    //MMT
                    if (itemExcelDto.RecordType == "Item")
                    {
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
                        //if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) & string.IsNullOrEmpty(itemExcelDto.ScaleSizesOrder))
                        //    itemExcelRecordErrorDTO.FieldsErrors.Add("Size Scale order cannot be empty if size scale name is not empty");
                        if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) & int.Parse(itemExcelDto.NoOfDim) == 1 & string.IsNullOrEmpty(itemExcelDto.D1Name))
                            itemExcelRecordErrorDTO.FieldsErrors.Add("Dimension 1 name cannot be empty if size scale number of dimesions is 1");
                        if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) & int.Parse(itemExcelDto.NoOfDim) == 2 &
                            (string.IsNullOrEmpty(itemExcelDto.D1Name) | string.IsNullOrEmpty(itemExcelDto.D2Name)))
                            itemExcelRecordErrorDTO.FieldsErrors.Add("Dimension 1 name and Dimension 2 name cannot be empty if size scale number of dimesions is 2");
                        if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) & int.Parse(itemExcelDto.NoOfDim) == 3 &
                            (string.IsNullOrEmpty(itemExcelDto.D1Name) | string.IsNullOrEmpty(itemExcelDto.D2Name) | string.IsNullOrEmpty(itemExcelDto.D3Name)))
                            itemExcelRecordErrorDTO.FieldsErrors.Add("Dimension 1 name, Dimension 2 name, and Dimension 3 name cannot be empty if size scale number of dimesions is 3");
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
                        if (!string.IsNullOrEmpty(itemExcelDto.SizeRatioName) & string.IsNullOrEmpty(itemExcelDto.SizeRatioValue))
                            itemExcelRecordErrorDTO.FieldsErrors.Add("Size ratio value cannot be empty if size ratio name is not empty");

                    }
                    //MMT
                    #region check images
                    bool hasError = false;
                    if (itemExcelDto.RecordType != "Item" && string.IsNullOrEmpty(itemExcelDto.ParentCode))
                    {
                        itemExcelRecordErrorDTO.FieldsErrors.Add("Parent Code cannot be empty.");
                        hasError = true;

                    }
                    if (imagesList != null && imagesList.Count() > 0)
                    {
                        itemExcelDto.Images = new List<AppItemImage>();
                        //if (!string.IsNullOrEmpty(itemExcelDto.ImageFolderName) && !imagesList.Contains(itemExcelDto.ImageFolderName.ToUpper()))
                        //{
                        //    itemExcelRecordErrorDTO.FieldsErrors.Add("Image Folder Name: Not found.");
                        //    hasError = true;
                        //}
                        if (!string.IsNullOrEmpty(itemExcelDto.ImageType))
                        {
                            var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(itemExcelDto.ImageType.ToUpper().TrimEnd());
                            if (attCoverId == 0)
                            {
                                itemExcelRecordErrorDTO.FieldsErrors.Add("Invalid Image Type.");
                                hasError = true;
                            }
                        }
                        var productImage = imagesList.Where(x => x.ToUpper().StartsWith((itemExcelDto.RecordType == "Item" ? "I-" : "V-") + itemExcelDto.Code.ToUpper())).ToList();
                        if (productImage.Count == 0)
                        {
                            if (itemExcelDto.RecordType == "Item")
                            {
                                hasWarning = true;
                                itemExcelRecordErrorDTO.FieldsErrors.Add("Code :" + itemExcelDto.Code + " does not have an image in images folder.!");
                                recordErrorMEssage = "Code :" + itemExcelDto.Code + " does not have an image in images folder.!";
                                itemExcelDto.Images.Add(new AppItemImage { ImageFileName = "noimage_item.jpg" });//, ImageGuid = (new Guid("noimage_item.jpg")).ToString() 
                            }
                        }
                        else
                        {
                            foreach (var img in productImage)
                                itemExcelDto.Images.Add(new AppItemImage { ImageFileName = img });  //, ImageGuid = (new Guid(img)).ToString()

                        }
                    }
                    #endregion check images
                    #region code, name, email and website validation    
                    if (RecordsCodes.Where(r => r == itemExcelDto.Code).ToList().Count() > 1)
                    {
                        itemExcelRecordErrorDTO.FieldsErrors.Add("Code: must be used Once."); hasError = true;
                        recordErrorMEssage = "Duplicated " + itemExcelRecordErrorDTO.RecordType;
                    }
                    ItemType itemExcelRecordType;
                    //if (string.IsNullOrEmpty(itemExcelDto.Code)) { itemExcelRecordErrorDTO.FieldsErrors.Add("Code: Should Have a Value."); hasError = true; }
                    //if (string.IsNullOrEmpty(itemExcelDto.Name)) { itemExcelRecordErrorDTO.FieldsErrors.Add("Name: Should Have a Value."); hasError = true; }
                    //if (string.IsNullOrEmpty(itemExcelDto.ProductDescription)) { itemExcelRecordErrorDTO.FieldsErrors.Add("Product Description: Should Have a Value."); hasError = true; }
                    //if (string.IsNullOrEmpty(itemExcelDto.ProductCategoryCode)) { itemExcelRecordErrorDTO.FieldsErrors.Add("Category Code: Should Have a Value."); hasError = true; }
                    //if (string.IsNullOrEmpty(itemExcelDto.ProductClassificationCode)) { itemExcelRecordErrorDTO.FieldsErrors.Add("Classification Code: Should Have a Value."); hasError = true; }
                    //if (string.IsNullOrEmpty(itemExcelDto.RecordType) && Enum.TryParse<ItemType>(itemExcelDto.RecordType.Replace (" ",""), out itemExcelRecordType))
                    //{ itemExcelRecordErrorDTO.FieldsErrors.Add("Record Type: Item|Item Variant"); hasError = true; }

                    if (itemExcelDto.RecordType.Replace(" ", "") == ItemType.ItemVariant.ToString() && result.Where(r => r.Code == itemExcelDto.ParentCode && r.RecordType.Replace(" ", "") == ItemType.Item.ToString()).ToList().Count() == 0)
                    {
                        itemExcelRecordErrorDTO.FieldsErrors.Add("Parent Code: Item variant parent should be of Type Item."); hasError = true;
                    }

                    if (!string.IsNullOrEmpty(itemExcelDto.Currency) && GetTypeId(itemExcelDto.Currency, currencyIds) == 0)
                    { itemExcelRecordErrorDTO.FieldsErrors.Add("Currency: Should Have a Valid Currency Value."); hasError = true; }

                    if (!string.IsNullOrEmpty(itemExcelDto.ProductClassificationCode))
                    {
                        var returnResult = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput { NameFilter = itemExcelDto.ProductClassificationCode });
                        long classId = returnResult.Items.Count > 0 ? returnResult.Items.First().Data.SycEntityObjectClassification.Id : 0; //GetClassId(itemExcelDto.ProductClassificationDescription, classIds);
                        if (classId == 0)
                        {
                            itemExcelRecordErrorDTO.FieldsErrors.Add("Product Classification is not found.");
                            hasWarning = true;
                        }
                        else { itemExcelDto.EntityObjectClassificaionID = classId; }
                    }

                    if (!string.IsNullOrEmpty(itemExcelDto.ProductCategoryCode))
                    {
                        var returnResult = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name", NameFilter = itemExcelDto.ProductCategoryCode });
                        long categId = returnResult.Items.Count > 0 ? returnResult.Items.First().Data.SycEntityObjectCategory.Id : 0;
                        if (categId == 0)
                        {
                            itemExcelRecordErrorDTO.FieldsErrors.Add("Product Category is not found.");
                            hasWarning = true;
                        }
                        else
                        {
                            itemExcelDto.EntityObjectCategoryID = categId;
                        }
                    }


                    //xxxx
                    #endregion code, name validation 
                    if (hasError)
                    {
                        itemExcelRecordErrorDTO.Status = ExcelRecordStatus.Failed.ToString();
                        itemExcelRecordErrorDTO.ErrorMessage = recordErrorMEssage;
                    }
                    else
                    {
                        if (hasWarning)
                        {
                            itemExcelRecordErrorDTO.Status = ExcelRecordStatus.Warning.ToString();
                            itemExcelRecordErrorDTO.ErrorMessage = recordErrorMEssage;
                        }

                    }

                    itemExcelRecordErrorDTO.image = itemExcelDto.ImageFolderName;
                    itemExcelRecordErrorDTO.imageType = itemExcelDto.ImageType;
                    itemExcelResultsDTO.ExcelRecords.Add(itemExcelRecordErrorDTO);
                }
                #endregion
                #region if parent failed then children are failed
                List<AppItemtExcelRecordDTO> resultSorted = itemExcelResultsDTO.ExcelRecords.OrderBy(r => r.ParentCode).ThenBy(r => r.Code).ToList();
                foreach (AppItemtExcelRecordDTO itemExcelRecord in resultSorted)
                {
                    if (itemExcelRecord.Status == ExcelRecordStatus.Failed.ToString())
                    {
                        itemExcelResultsDTO.ExcelRecords.Where(r => r.ParentCode ==
                        itemExcelRecord.Code).ToList()
                        .ForEach(r => r.Status = ExcelRecordStatus.Failed.ToString());
                    }
                }
                #endregion if parent failed then children are failed

                itemExcelResultsDTO.TotalPassedRecords = itemExcelResultsDTO.ExcelRecords.Where(r => r.Status == ExcelRecordStatus.Passed.ToString() || r.Status == ExcelRecordStatus.Warning.ToString()).Count();
                itemExcelResultsDTO.TotalFailedRecords = itemExcelResultsDTO.ExcelRecords.Where(r => r.Status == ExcelRecordStatus.Failed.ToString()).Count();
                #endregion Excel validateion rules only.

                #region update the excel sheet with errors
                // Create new Spreadsheet
                itemExcelResultsDTO.CodesFromList = new List<string>();
                itemExcelResultsDTO.FromList = new List<Int32>();
                itemExcelResultsDTO.ToList = new List<Int32>();
                Spreadsheet document = new Spreadsheet();
                document.LoadFromFile(itemExcelResultsDTO.FilePath);

                // Get worksheet by name
                Worksheet Sheet = document.Workbook.Worksheets[0];
                // Set current cell
                //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[Start]
                //Sheet.Cell("AA1").Value = "Processing Status";
                //Sheet.Cell("AB1").Value = "Processing Error Message";
                //Sheet.Cell("AC1").Value = "Processing Error Details";
                Sheet.Cell("AB1").Value = "Processing Status";
                Sheet.Cell("AC1").Value = "Processing Error Message";
                Sheet.Cell("AD1").Value = "Processing Error Details";
                //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[End]
                rowNumber = 1;
                //accountExcelResultsDTO.FromList.Add(1);
                foreach (AppItemtExcelRecordDTO logRecord in itemExcelResultsDTO.ExcelRecords)
                {
                    rowNumber++;
                    if (Sheet.Cell("B" + rowNumber.ToString()).Value.ToString() == "Item")
                    {
                        if (rowNumber > 2)
                        { itemExcelResultsDTO.ToList.Add(rowNumber - 1); }
                        itemExcelResultsDTO.FromList.Add(rowNumber);

                        if (Sheet.Cell("D" + rowNumber.ToString()).Value != null)
                            itemExcelResultsDTO.CodesFromList.Add(Sheet.Cell("D" + rowNumber.ToString()).Value.ToString());
                    }
                    //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[Start]
                    //Sheet.Cell("AA" + rowNumber.ToString()).Value = logRecord.Status;
                    //Sheet.Cell("AB" + rowNumber.ToString()).Value = logRecord.ErrorMessage;
                    //Sheet.Cell("AC" + rowNumber.ToString()).Value = logRecord.FieldsErrors.ToList().JoinAsString(",");
                    Sheet.Cell("AB" + rowNumber.ToString()).Value = logRecord.Status;
                    Sheet.Cell("AC" + rowNumber.ToString()).Value = logRecord.ErrorMessage;
                    Sheet.Cell("AD" + rowNumber.ToString()).Value = logRecord.FieldsErrors.ToList().JoinAsString(",");
                    //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[Start]
                }
                itemExcelResultsDTO.ToList.Add(rowNumber);
                //move to attachment folder and save
                itemExcelResultsDTO.FilePath = itemExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:PathTemp"], _appConfiguration[$"Attachment:Path"]);
                //accountExcelResultsDTO.FilePath = accountExcelResultsDTO.FilePath.ToString().ToUpper().Replace("XLSX", "XLS");
                //MMT
                string attachmentFolder = _appConfiguration[$"Attachment:Path"] + @"\" + tenantId;
                System.IO.DirectoryInfo dire = new DirectoryInfo(attachmentFolder);
                if (!dire.Exists)
                    dire.Create();
                //MMT
                document.SaveAsXLSX(itemExcelResultsDTO.FilePath);

                // Close document
                document.Close();

                itemExcelResultsDTO.ExcelLogDTO = new ExcelLogDto();

                itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath = itemExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:Omitt"].ToString(), "");
                // accountExcelResultsDTO.AccountExcelLogDTO.AccountExcelLogPath = @"https://localhost:44301/" + accountExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:Omitt"].ToString().ToUpper(), "");
                itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath = itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath.ToLower();
                itemExcelResultsDTO.ExcelLogDTO.ExcelLogFileName = _appConfiguration[$"ItemTemplates:ItemExcelLogFileName"];
                #endregion
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(ex.Message);
            }

            // ExcelLogDto exceld =await SaveFromExcel(itemExcelResultsDTO);
            return itemExcelResultsDTO;
        }
        public async Task<long> GetCategoryId(string categoryName, PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> categoryIds)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(categoryName) == false)
                    value = categoryIds.Items.Where(r => r.Data.SycEntityObjectCategory.Name == categoryName).First().Data.SycEntityObjectCategory.Id;
            }
            catch (Exception ex) { }

            return value;
        }
        public long GetClassId(string className, PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(className) == false)
                    value = classIds.Items.Where(r => r.Data.SycEntityObjectClassification.Name == className).First().Data.SycEntityObjectClassification.Id;
            }
            catch (Exception ex) { }

            return value;
        }
        public long GetTypeId(string typeName, List<CurrencyInfoDto> lookupLabelDtos)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(typeName) == false)
                    value = lookupLabelDtos.Where(r => r.Code.ToUpper() == typeName.ToUpper()).First<LookupLabelDto>().Value;
            }
            catch (Exception ex) { }

            return value;
        }
        public string GetItemCopyCode(string code)
        {

            for (int i = 1; i < 1000; i++)
            {
                string newCode = code + i.ToString();
                AppItem item = _appItemRepository.GetAll().Where(r => r.Code == newCode).FirstOrDefault();
                if (item != null && item.Code == newCode)
                { }
                else { return newCode; }
            }
            return code;

        }
        //Marima
        public async Task AddClassifications(List<AppItemExcelDto> result)
        {
            long ObjectId = await _helper.SystemTables.GetObjectItemId();
            #region add classifications
            foreach (AppItemExcelDto src in result)
            {
                if (!string.IsNullOrEmpty(src.ProductClassificationDescription))
                {
                    PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput { NameFilter = src.ProductClassificationDescription });
                    //PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForContact();
                    List<GetSycEntityObjectClassificationForViewDto> getSycEntityObjectClassificationForViewDtos = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Name == src.ProductClassificationDescription).ToList();

                    if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                    {
                        CreateOrEditSycEntityObjectClassificationDto createOrEditSycEntityObjectClassificationDto = new CreateOrEditSycEntityObjectClassificationDto();
                        string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("CLASSIFICATION");
                        createOrEditSycEntityObjectClassificationDto.Code = seq;
                        createOrEditSycEntityObjectClassificationDto.Name = src.ProductClassificationDescription;
                        createOrEditSycEntityObjectClassificationDto.ObjectId = ((int)ObjectId);
                        await _sycEntityObjectClassificationsAppService.CreateOrEdit(createOrEditSycEntityObjectClassificationDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());
                        var classification = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Name == src.ProductClassificationDescription).FirstOrDefault();
                        if (classification != null)
                        {
                            src.ProductClassificationCode = classification.SycEntityObjectClassification.Code;
                            src.EntityObjectClassificaionID = classification.SycEntityObjectClassification.Id;
                        }
                    }
                    else
                    {
                        src.ProductClassificationCode = getSycEntityObjectClassificationForViewDtos.FirstOrDefault().SycEntityObjectClassification.Code;
                        src.EntityObjectClassificaionID = getSycEntityObjectClassificationForViewDtos.FirstOrDefault().SycEntityObjectClassification.Id;
                    }
                }

            }
            #endregion add classifications
        }


        public async Task AddCategories(List<AppItemExcelDto> result)
        {
            long ObjectId = await _helper.SystemTables.GetObjectItemId();
            #region add classifications
            foreach (AppItemExcelDto src in result)
            {
                if (!string.IsNullOrEmpty(src.ProductCategoryDescription))
                {
                    // PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();
                    PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name", NameFilter = src.ProductCategoryDescription });
                    List<GetSycEntityObjectCategoryForViewDto> getSycEntityObjectClassificationForViewDtos = departmentsIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Name == src.ProductCategoryDescription).ToList();
                    if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                    {
                        CreateOrEditSycEntityObjectCategoryDto createOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();
                        createOrEditSycEntityObjectCategoryDto.Name = src.ProductCategoryDescription;
                        createOrEditSycEntityObjectCategoryDto.ObjectId = ((int)ObjectId);
                        string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("CATEGORY");
                        createOrEditSycEntityObjectCategoryDto.Code = seq;
                        await _sycEntityObjectCategoriesAppService.CreateOrEdit(createOrEditSycEntityObjectCategoryDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });
                        var category = departmentsIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Name == src.ProductCategoryDescription).FirstOrDefault();
                        if (category != null)
                        {
                            src.ProductCategoryCode = category.SycEntityObjectCategory.Code;
                            src.EntityObjectCategoryID = category.SycEntityObjectCategory.Id;
                        }
                    }
                    else
                    {
                        src.ProductCategoryCode = getSycEntityObjectClassificationForViewDtos.FirstOrDefault().SycEntityObjectCategory.Code;
                        src.EntityObjectCategoryID = getSycEntityObjectClassificationForViewDtos.FirstOrDefault().SycEntityObjectCategory.Id;
                    }
                }
            }
            #endregion add classifications

        }
        //Mariama
        public async Task<ExcelLogDto> SaveFromExcel(AppItemExcelResultsDTO excelResultsDTO)
        {
            List<AppItemExcelDto> result = excelResultsDTO.ExcelRecords.Where(r => r.Status !=
            ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AppItemExcelDto>();

            //MARIAM
            await AddClassifications(result.ToList<AppItemExcelDto>());
            await AddCategories(result);
            //MARIAM
            //XX
            List<CurrencyInfoDto> currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();
            string currencyCode = "";
            long? currencyIDDef = null;
            var tenantCurrencyInfoDto = await TenantManager.GetTenantCurrency();

            if (tenantCurrencyInfoDto != null && !string.IsNullOrEmpty(tenantCurrencyInfoDto.Code))
            {
                currencyCode = tenantCurrencyInfoDto.Code;
                currencyIDDef = tenantCurrencyInfoDto.Value;
            }
            if (string.IsNullOrEmpty(currencyCode))
            {
                currencyCode = "USD";
                var defCurrObj = currencyIds.FirstOrDefault(a => a.Code.ToLower() == currencyCode.ToLower());
                if (defCurrObj != null)
                {
                    currencyIDDef = defCurrObj.Value;
                }
            }
            //XX


            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> categoriesIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });
            // get Product Categories
            List<SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto> productTypes = await _sycEntityObjectCategoriesAppService.GetAllSycEntityObjectCategoryForTableDropdown();

            List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();
            string productType = result.Select(x => x.ProductType).FirstOrDefault().ToString();
            //  var productTypeId = productTypes.FirstOrDefault(x => x.DisplayName.ToUpper() == productType.ToUpper());
            var pdtyp = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(productType);
            var productTypeId = pdtyp.FirstOrDefault();
            Dictionary<GetAllEntityObjectTypeOutput, List<LookupLabelDto>> extrattributesLists = new Dictionary<GetAllEntityObjectTypeOutput, List<LookupLabelDto>>();

            var entityObjectExtraAttribute = _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(long.Parse(productTypeId.Id.ToString())).Result.ToList().FirstOrDefault();
            if (entityObjectExtraAttribute != null && entityObjectExtraAttribute.ExtraAttributes != null &&
                entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes != null && entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes.Count > 0)
            {
                foreach (var extraAttribute in entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes)
                {
                    if (extraAttribute.IsLookup)
                    {
                        try
                        {
                            var retrunValues = await _appEntitiesAppService.GetAllEntitiesByTypeCode(extraAttribute.EntityObjectTypeCode);
                            var retvalues = (await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(extraAttribute.EntityObjectTypeCode));

                            if (retvalues != null)
                            {
                                var retValu = retvalues.FirstOrDefault();
                                extrattributesLists.Add(retValu, retrunValues);
                            }
                        }
                        catch
                        { }

                    }
                }
            }
            DateTime start = DateTime.Now;
            var itemObjectId = await _helper.SystemTables.GetObjectItemId();
            //var itemObj = await _SycEntityObjectTypesAppService.GetAll(new GetAllSycEntityObjectTypesInput { SydObjectIdFilter = itemObjectId });
            // string itemObjCode = itemObj.Items[0].Data.SycEntityObjectType.Code ;
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\";
            string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/" + tenantId + @"/";
            var itemEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeItemIds();
            var itemStatusId = await _helper.SystemTables.GetEntityObjectStatusItemActive();
            var itemEntityExtraData = new List<AppEntityExtraData>();
            List<AppItem> appItemList = new List<AppItem>();
            List<AppItem> appItemModifyList = new List<AppItem>();
            List<AppEntity> appEntityDeleteList = new List<AppEntity>();
            List<AppEntityAttachment> appEntityAttachmentDeleteList = new List<AppEntityAttachment>();
            List<AppEntityCategory> appEntityCategoryDeleteList = new List<AppEntityCategory>();
            List<AppEntityClassification> appEntityClassificationDeleteList = new List<AppEntityClassification>();
            List<AppEntityExtraData> appEntityExtraDataDeleteList = new List<AppEntityExtraData>();
            var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);

            foreach (var excelDto in result)
            {
                AppItem itemOrg = new AppItem();
                if (excelDto.Id != 0)
                {
                    //T-SII-20231127.0001,1 MMT 02/05/2024 Import product does not import new variations of an existing item[Start]
                    bool lNewVariation = false;
                    var xx = result.Where(x => x.ParentCode == excelDto.Code && x.Id == 0).Count();
                    if (xx > 0)
                        lNewVariation = true;
                    //T-SII-20231127.0001,1 MMT 02/05/2024 Import product does not import new variations of an existing item[End]
                    switch (excelResultsDTO.RepreateHandler)
                    {
                        case ExcelRecordRepeateHandler.IgnoreDuplicatedRecords: //ignore
                            //T-SII-20231127.0001,1 MMT 02/05/2024 Import product does not import new variations of an existing item[Start]
                            if (lNewVariation == true)
                            {
                                itemOrg = _appItemRepository.GetAll().Where(c => c.Id == excelDto.Id && c.ListingItemId == null)
                               .Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                               .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                               .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments)
                               .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                               .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                               .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                               .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                               .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                               .FirstOrDefault();
                                break;
                            }
                            else
                            //T-SII-20231127.0001,1 MMT 02/05/2024 Import product does not import new variations of an existing item[End]
                                continue;
                        case ExcelRecordRepeateHandler.ReplaceDuplicatedRecords: // replace
                                                                                 //createOrEditAccountInfoDto.Id = account.Id

                            itemOrg = _appItemRepository.GetAll().Where(c => c.Id == excelDto.Id && c.ListingItemId == null)
                               .Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                               .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                               .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments)
                               .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                               .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                               .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                               .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                               .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                               .FirstOrDefault();
                            //itemOrg.ParentFkList.Clear();
                            //appItemDeleteList.Add(itemOrg);
                            //if (itemOrg.EntityFk.EntityExtraData != null && itemOrg.EntityFk.EntityExtraData.Count > 0)
                            //{
                            //    appEntityExtraDataDeleteList.AddRange(itemOrg.EntityFk.EntityExtraData);
                            //    itemOrg.EntityFk.EntityExtraData.Clear();
                            //}
                            //if (itemOrg.EntityFk.EntityAttachments !=null && itemOrg.EntityFk.EntityAttachments.Count > 0)
                            //{
                            //    appEntityAttachmentDeleteList.AddRange(itemOrg.EntityFk.EntityAttachments);
                            //    itemOrg.EntityFk.EntityAttachments.Clear();
                            //}
                            //if (itemOrg.EntityFk.EntityCategories !=null && itemOrg.EntityFk.EntityCategories.Count > 0)
                            //{
                            //    appEntityCategoryDeleteList.AddRange(itemOrg.EntityFk.EntityCategories);
                            //    itemOrg.EntityFk.EntityCategories.Clear();
                            //}
                            //if (itemOrg.EntityFk.EntityClassifications!=null &&  itemOrg.EntityFk.EntityClassifications.Count >0)
                            //{
                            //    appEntityClassificationDeleteList.AddRange(itemOrg.EntityFk.EntityClassifications);
                            //    itemOrg.EntityFk.EntityClassifications.Clear();
                            //}
                            //appEntityDeleteList.Add(itemOrg.EntityFk);
                            //itemOrg.EntityFk = null;
                            //itemOrg.ParentFk = null;
                            //itemOrg.ParentEntityFk = null;
                            //itemOrg.ParentEntityId = null;
                            //itemOrg.ParentId = null;
                            //if (itemOrg != null)
                            //{
                            //    itemOrg.Name = excelDto.Name;
                            //    itemOrg.Description = excelDto.ProductDescription;
                            //    itemOrg.EntityFk.Name = excelDto.Name;
                            //    if (itemOrg.Variations != null && excelDto.RecordType =="Item")
                            //    {
                            //        itemOrg.EntityFk.EntityClassifications.Clear();
                            //        if (excelDto.EntityObjectClassificaionID.HasValue)
                            //        {
                            //            itemOrg.EntityFk.EntityClassifications.Add(new AppEntityClassification
                            //            {
                            //                EntityCode = excelDto.Code,
                            //                EntityObjectClassificationCode = excelDto.ProductClassificationCode,
                            //                EntityObjectClassificationId = long.Parse(excelDto.EntityObjectClassificaionID.ToString())
                            //            });
                            //        }
                            //        itemOrg.EntityFk.EntityCategories.Clear();
                            //        itemOrg.EntityFk.EntityCategories.Add(new AppEntityCategory
                            //        {
                            //            EntityCode = excelDto.Code,
                            //            EntityObjectCategoryId = productTypeId.Id,
                            //            EntityObjectCategoryCode = productTypeId.DisplayName

                            //        });
                            //        if (excelDto.EntityObjectCategoryID.HasValue)
                            //        {
                            //            itemOrg.EntityFk.EntityCategories.Add(new AppEntityCategory
                            //            {
                            //                EntityCode = excelDto.Code,
                            //                EntityObjectCategoryCode = excelDto.ProductClassificationCode,
                            //                EntityObjectCategoryId = long.Parse(excelDto.EntityObjectCategoryID.ToString())
                            //            });
                            //        }
                            //        var relatedItems = result.Where(x => x.ParentCode == excelDto.Code).ToList();
                            //        foreach (var chItem in relatedItems)
                            //        {
                            //            var childOrg = itemOrg.ParentFkList.FirstOrDefault(x => x.Code == chItem.Code);
                            //            if (childOrg != null)
                            //            {
                            //                childOrg.Name = chItem.Name;
                            //                childOrg.Description = chItem.ProductDescription;
                            //                childOrg.EntityFk.EntityExtraData.Clear();

                            //            }
                            //        }

                            //    }


                            //}
                            break;
                        case ExcelRecordRepeateHandler.CreateACopy: // override
                            string oldCode = excelDto.Code;
                            excelDto.Code = GetItemCopyCode(excelDto.Code);
                            excelDto.Id = 0;
                            var childItemsCopy = result.Where(x => x.ParentCode == oldCode && x.Id != 0);
                            if (childItemsCopy != null && childItemsCopy.Count<AppItemExcelDto>() > 0)
                            {
                                foreach (var itemCopy in childItemsCopy)
                                {
                                    itemCopy.Code = GetItemCopyCode(itemCopy.Code);
                                    itemCopy.Id = 0;
                                }
                            }

                            result.Where(x => x.ParentCode == oldCode).ToList().ForEach(x => x.ParentCode = excelDto.Code);
                            if (!string.IsNullOrEmpty(excelDto.ParentCode))
                            {
                                result.Where(x => x.ParentCode == oldCode).ToList().ForEach(x => x.Id = 0);
                            }
                            break;
                        default:
                            break;
                    }
                }
                if (!string.IsNullOrEmpty(excelDto.ParentCode))
                    continue;


                string isDefault = "1";
                List<string> attributteNames = new List<string>();
                List<string> attributteIDs = new List<string>();
                List<string> firstAttributteValues = new List<string>();
                List<string> firstAttributteImageDefaults = new List<string>();
                List<AppItemExtraDto> secondAttributteValues = new List<AppItemExtraDto>();
                List<List<AppItemExtraDto>> restAttributteValues = new List<List<AppItemExtraDto>>();

                AppItem appItem = new AppItem();

                if (excelDto.Id != 0)
                    appItem = itemOrg;
                else
                {
                    appItem = ObjectMapper.Map<AppItem>(excelDto);

                    appItem.Id = 0;
                    appItem.ListingItemId = null;
                    appItem.ParentId = null;
                    appItem.TenantId = AbpSession.TenantId;
                    appItem.CreatorUserId = AbpSession.UserId;
                }
                appItem.Description = excelDto.ProductDescription;
                appItem.Price = decimal.Parse(excelDto.Price);
                //XX
                appItem.ItemPricesFkList = new List<AppItemPrices>();
                if (appItem.Price > 0)
                {
                    long? currId = null;
                    if (!string.IsNullOrEmpty(excelDto.Currency))
                    {
                        var currObj = currencyIds.FirstOrDefault(x => x.Code.ToUpper() == excelDto.Currency.ToUpper());
                        if (currObj != null)
                            currId = currObj.Value;
                    }
                    appItem.ItemPricesFkList.Add(new AppItemPrices
                    {
                        AppItemCode = appItem.Code,
                        Code = "MSRP",
                        Price = appItem.Price,
                        CurrencyCode = string.IsNullOrEmpty(excelDto.Currency) ? currencyCode : excelDto.Currency,
                        TenantId = AbpSession.TenantId,
                        CurrencyId = !string.IsNullOrEmpty(excelDto.Currency) ? currId : currencyIDDef
                    });
                }
                //XX
                appItem.Name = excelDto.Name;

                if (excelDto.ExtraAttributesValues != null)
                {

                    for (int et = 0; et < excelDto.ExtraAttributesValues.Count; et++)
                    {
                        if (excelDto.ExtraAttributes[et].IsVariation) continue;

                        //long? AttributeValueId = null;
                        var AttributeInfoObj = extrattributesLists.FirstOrDefault(x => x.Key.Name.ToUpper() == excelDto.ExtraAttributes[et].Name.ToUpper());
                        if (AttributeInfoObj.Key == null) continue;
                        //var AttributeInfo = AttributeInfoObj.Value;
                        //if (AttributeInfo != null)
                        //{
                        //    AttributeValueId = AttributeInfo.FirstOrDefault(x => x.Code == excelDto.ExtraAttributesValues[et].Code) == null ? 0 : AttributeInfo.FirstOrDefault(x => x.Code == excelDto.ExtraAttributesValues[et].Code).Value;
                        //}
                        itemEntityExtraData.Add(new AppEntityExtraData
                        {
                            AttributeCode = excelDto.ExtraAttributesValues[et].Code,
                            AttributeValue = excelDto.ExtraAttributesValues[et].Value,
                            AttributeValueId = null,//AttributeValueId,
                            EntityObjectTypeName = excelDto.ExtraAttributes[et].Name,
                            AttributeId = excelDto.ExtraAttributes[et].AttributeId,
                            EntityObjectTypeId = AttributeInfoObj.Key.Id

                        });
                        // attributteNames.Add(excelDto.ExtraAttributes[et].EntityObjectTypeCode + "," + isDefault);
                        //  attributteIDs.Add(excelDto.ExtraAttributes[et].AttributeId.ToString() + "," + isDefault);
                    }
                }
                if (excelDto.Id == 0)
                {
                    appItem.EntityFk = new AppEntity
                    {
                        Id = 0,
                        Code = excelDto.Code,
                        ObjectId = itemObjectId,
                        TenantId = AbpSession.TenantId,
                        EntityObjectStatusId = itemStatusId,
                        Notes = _helper.HtmlToPlainText(excelDto.ProductDescription),
                        EntityExtraData = itemEntityExtraData,
                        Name = excelDto.Name,
                        EntityObjectTypeId = productTypeId.Id,
                        CreatorUserId = AbpSession.UserId

                    };
                }
                if (excelDto.EntityObjectClassificaionID.HasValue)
                {
                    if (excelDto.Id == 0 || (excelDto.Id != 0 && appItem.EntityFk.EntityClassifications == null))
                    {
                        appItem.EntityFk.EntityClassifications = new List<AppEntityClassification>();
                        appItem.EntityFk.EntityClassifications.Add(new AppEntityClassification
                        {
                            EntityCode = excelDto.Code,
                            EntityObjectClassificationCode = excelDto.ProductClassificationCode,
                            EntityObjectClassificationId = long.Parse(excelDto.EntityObjectClassificaionID.ToString())
                        });
                    }
                    else
                    {
                        if (appItem.EntityFk.EntityClassifications != null &&
                            appItem.EntityFk.EntityClassifications.FirstOrDefault(x => x.EntityObjectClassificationId == long.Parse(excelDto.EntityObjectClassificaionID.ToString())) == null)
                        {
                            appItem.EntityFk.EntityClassifications.Add(new AppEntityClassification
                            {
                                EntityCode = excelDto.Code,
                                EntityObjectClassificationCode = excelDto.ProductClassificationCode,
                                EntityObjectClassificationId = long.Parse(excelDto.EntityObjectClassificaionID.ToString())
                            });
                        }
                    }
                }
                if (excelDto.EntityObjectCategoryID.HasValue)
                {
                    if (excelDto.Id == 0 || (excelDto.Id != 0 && appItem.EntityFk.EntityCategories == null))
                    {
                        appItem.EntityFk.EntityCategories = new List<AppEntityCategory>();

                        appItem.EntityFk.EntityCategories.Add(new AppEntityCategory
                        {
                            EntityCode = excelDto.Code,
                            EntityObjectCategoryCode = excelDto.ProductCategoryCode,
                            EntityObjectCategoryId = long.Parse(excelDto.EntityObjectCategoryID.ToString())
                        });
                    }
                    else
                    {
                        if (appItem.EntityFk.EntityCategories != null &&
                            appItem.EntityFk.EntityCategories.FirstOrDefault(x => x.EntityObjectCategoryId == long.Parse(excelDto.EntityObjectCategoryID.ToString())) == null)
                        {
                            appItem.EntityFk.EntityCategories.Add(new AppEntityCategory
                            {
                                EntityCode = excelDto.Code,
                                EntityObjectCategoryCode = excelDto.ProductCategoryCode,
                                EntityObjectCategoryId = long.Parse(excelDto.EntityObjectCategoryID.ToString())
                            });
                        }
                    }
                }
                //if (excelDto.Id == 0 || !reserAtt)
                //{
                if (excelDto.Id == 0)
                appItem.EntityFk.EntityAttachments = new List<AppEntityAttachment>();

                //}
                if (!string.IsNullOrEmpty(excelDto.ImageType) && excelDto.Images != null && excelDto.Images.Count > 0)
                {
                    var attachCategory = attachmentsCategories.Where(r => r.Code.ToUpper() == excelDto.ImageType.ToUpper()).FirstOrDefault();
                    var defaultImage = excelDto.Images.Where(x => x.ImageFileName.ToLower().Contains("_default")).FirstOrDefault();
                    foreach (var img in excelDto.Images)
                    {
                        if (img.ImageFileName == "noimage_item.jpg")
                        {
                            img.ImageGuid = Guid.NewGuid().ToString();
                            if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString()))
                            {
                                System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString());
                            }

                            try
                            {
                                System.IO.File.Copy(System.IO.Directory.GetCurrentDirectory() + @"\Assets\noimage_item.jpg", _appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString() + @"\" + img.ImageGuid + ".jpg", true);
                            }
                            catch { }
                        }
                        else
                        {
                            if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString()))
                            {
                                System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString());
                            }

                            try
                            {
                                System.IO.File.Copy(path + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], _appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString() + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], true);
                            }
                            catch { }
                        }
                        AppEntityAttachment appEntityAttachment = new AppEntityAttachment();
                        appEntityAttachment.AttachmentFk = new Attachments.AppAttachment { Name = img.ImageFileName, Attachment = img.ImageGuid + "." + img.ImageFileName.Split('.')[1], TenantId = AbpSession.TenantId };
                        appEntityAttachment.AttachmentCategoryId = attachCategory.Id;
                        appEntityAttachment.AttachmentCategoryCode = attachCategory.Code;
                        appEntityAttachment.EntityCode = excelDto.Code;
                        if (img.ImageFileName.ToLower().Contains("_default"))
                        {
                            appEntityAttachment.IsDefault = true;

                        }
                        appItem.EntityFk.EntityAttachments.Add(appEntityAttachment);
                    }
                    if (defaultImage == null)
                        appItem.EntityFk.EntityAttachments[0].IsDefault = true;
                }
                if (excelDto.Id == 0)
                    appItem.CreatorUserId = AbpSession.UserId;

                if (excelDto.Id == 0)
                    appItem.ParentFkList = new List<AppItem>();

                //mmt
                if (!string.IsNullOrEmpty(excelDto.SizeScaleName))
                {
                    var ratioHeader = _appSizeScalesHeaderRepository.GetAll().Where(x => x.Name == excelDto.SizeRatioName & x.ParentId != null).AsNoTracking().FirstOrDefault();
                    var scaleHeader = _appSizeScalesHeaderRepository.GetAll().Where(x => x.Name == excelDto.SizeScaleName).AsNoTracking().FirstOrDefault();
                    if (scaleHeader == null || ratioHeader == null || (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.CreateACopy) ||
                        (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.ReplaceDuplicatedRecords))
                    {
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
                        //var sizesArray = excelDto.ScaleSizesOrder.Split('|');
                        var d1sizesArray = excelDto.D1Sizes.Split('|');
                        var d2sizesArray = excelDto.D2Sizes.Split('|');
                        var d3sizesArray = excelDto.D3Sizes.Split('|');
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
                        List<AppSizeScalesDetailDto> appSizeScalesDetailDtoList = new List<AppSizeScalesDetailDto>();
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
                        /*for (int pos = 0; pos < sizesArray.Length; pos++)
                        {
                            appSizeScalesDetailDtoList.Add(new AppSizeScalesDetailDto
                            {
                                SizeCode = sizesArray[pos],
                                D1Position = pos.ToString(),
                                SizeId = null,
                                D3Position = null,
                                D2Position = null,
                                SizeRatio = 0
                            });
                        }*/
                        for (int pos = 0; pos < d1sizesArray.Length; pos++)
                        {
                            appSizeScalesDetailDtoList.Add(new AppSizeScalesDetailDto
                            {
                                SizeCode = d1sizesArray[pos].TrimEnd(),
                                D1Position = pos.ToString(),
                                DimensionName = excelDto.D1Name,
                                SizeId = null,
                                D3Position = null,
                                D2Position = null,
                                SizeRatio = 0
                            });
                        }
                        if (d2sizesArray.Length > 0 && !string.IsNullOrEmpty(d2sizesArray[0]))
                        {
                            for (int pos = 0; pos < d2sizesArray.Length; pos++)
                            {
                                appSizeScalesDetailDtoList.Add(new AppSizeScalesDetailDto
                                {
                                    SizeCode = d2sizesArray[pos].TrimEnd(),
                                    D2Position = pos.ToString(),
                                    DimensionName = excelDto.D2Name,
                                    SizeId = null,
                                    D3Position = null,
                                    D1Position = null,
                                    SizeRatio = 0
                                });
                            }
                        }
                        if (d3sizesArray.Length > 0 && !string.IsNullOrEmpty(d3sizesArray[0]))
                        {
                            for (int pos = 0; pos < d3sizesArray.Length; pos++)
                            {
                                appSizeScalesDetailDtoList.Add(new AppSizeScalesDetailDto
                                {
                                    SizeCode = d3sizesArray[pos].TrimEnd(),
                                    D3Position = pos.ToString(),
                                    SizeId = null,
                                    D1Position = null,
                                    D2Position = null,
                                    SizeRatio = 0,
                                    DimensionName = excelDto.D3Name,
                                });
                            }
                        }
                        var sizes = result.Where(z => z.ParentCode == excelDto.Code).Select(a => new { a.SizeCode, a.D1Pos, a.D2Pos, a.D3Pos }).Distinct().ToList();
                        if (sizes != null)
                        {
                            foreach (var sz in sizes)
                            {
                                var exist = appSizeScalesDetailDtoList.FirstOrDefault(z => z.SizeCode == sz.SizeCode &&
                                   z.D1Position == (sz.D1Pos == "0" ? null : (int.Parse(sz.D1Pos.ToString()) - 1).ToString()) &&
                                   z.D2Position == (sz.D2Pos == "0" ? null : (int.Parse(sz.D2Pos.ToString()) - 1).ToString()) &&
                                   z.D3Position == (sz.D3Pos == "0" ? null : (int.Parse(sz.D3Pos.ToString()) - 1).ToString()));
                                if (exist ==null)
                                appSizeScalesDetailDtoList.Add(new AppSizeScalesDetailDto
                                {
                                    SizeCode = sz.SizeCode.TrimEnd(),
                                    D3Position = int.Parse(sz.D3Pos.ToString()) > 0 ? (int.Parse(sz.D3Pos.ToString()) - 1).ToString() : null,
                                    SizeId = null,
                                    D1Position = int.Parse(sz.D1Pos.ToString()) > 0 ? (int.Parse(sz.D1Pos.ToString()) - 1).ToString() : null,
                                    D2Position = int.Parse(sz.D2Pos.ToString()) > 0 ? (int.Parse(sz.D2Pos.ToString()) - 1).ToString() : null,
                                    SizeRatio = 0
                                });
                            }
                        }
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
                        //var sizeList = sizesArray.Select(array => new AppSizeScalesDetailDto { SizeCode = array[0].ToString (), SizeId = null,D1Position = sizesArray.  }).ToList()
                        AppSizeScaleForEditDto appSizeScaleForEditDto = new AppSizeScaleForEditDto();
                        appSizeScaleForEditDto.AppSizeScalesDetails = appSizeScalesDetailDtoList;
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
                        //appSizeScaleForEditDto.NoOfDimensions = 1;
                        appSizeScaleForEditDto.NoOfDimensions = int.Parse(excelDto.NoOfDim);
                        appSizeScaleForEditDto.Dimesion1Name = excelDto.D1Name;
                        appSizeScaleForEditDto.Dimesion2Name = excelDto.D2Name;
                        appSizeScaleForEditDto.Dimesion3Name = excelDto.D3Name;
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
                        appSizeScaleForEditDto.ParentId = null;

                        if (scaleHeader != null)
                        {
                            appSizeScaleForEditDto.Code = scaleHeader.Code;
                            appSizeScaleForEditDto.Id = scaleHeader.Id;
                        }
                        else
                            appSizeScaleForEditDto.Code = "";

                        appSizeScaleForEditDto.Dimesion1Name = excelDto.SizeScaleName;
                        appSizeScaleForEditDto.Name = excelDto.SizeScaleName;
                        var sizescale = _appSizeScaleAppService.CreateOrEditAppSizeScale(appSizeScaleForEditDto);
                        var sizeScaleSavedId = sizescale.Result.Id;
                        ////if (!string.IsNullOrEmpty(excelDto.SizeRatioName))
                        ////{
                        ////    AppSizeScaleForEditDto appSizeScaleRatioForEditDto = new AppSizeScaleForEditDto();
                        ////    appSizeScaleRatioForEditDto.AppSizeScalesDetails = appSizeScalesDetailDtoList;
                        ////    appSizeScaleRatioForEditDto.NoOfDimensions = 1;
                        ////    appSizeScaleRatioForEditDto.ParentId = sizescale.Result.Id;
                        ////    appSizeScaleRatioForEditDto.Code = "";
                        ////    appSizeScaleRatioForEditDto.Dimesion1Name = sizescale.Result.Dimesion1Name ;
                        ////    appSizeScaleRatioForEditDto.Name = excelDto.SizeRatioName ;

                        ////    var arrayRatio = excelDto.SizeRatioValue.Split('=')[0];
                        ////    var arraySizeRatio = arrayRatio.Split('-');
                        ////    List<AppSizeScalesDetailDto> appSizeScalesRatioDetailDtoList = new List<AppSizeScalesDetailDto>();
                        ////    for (int pos = 0; pos < sizesArray.Length; pos++)
                        ////    {
                        ////        appSizeScalesRatioDetailDtoList.Add(new AppSizeScalesDetailDto
                        ////        {
                        ////            SizeCode = sizesArray[pos],
                        ////            D1Position = pos.ToString(),
                        ////            SizeId = null,
                        ////            D3Position = "0",
                        ////            D2Position = "0",
                        ////            SizeRatio = int.Parse(arraySizeRatio[pos])
                        ////        });
                        ////    }
                        ////    var sizescaleRatio = _appSizeScaleAppService.CreateOrEditAppSizeScale(appSizeScaleRatioForEditDto);
                        ////}
                        long sizeRatioId = 0;
                        long sizeScaleId = 0;
                        List<AppItemSizeScalesHeader> itemScaleData = new List<AppItemSizeScalesHeader>();
                        if (appItem.Id != 0)
                        {
                            var sizeScaleList = await x.AppItemSizeScalesHeaders.Where(z => z.AppItemId == appItem.Id).AsNoTracking()
                                 .Include(x => x.AppItemSizeScalesDetails).AsNoTracking().ToListAsync();
                            itemScaleData = sizeScaleList;

                        }
                        if (itemScaleData != null && itemScaleData.Count > 0)
                        {
                            var scaleObject = itemScaleData.FirstOrDefault(a => a.ParentId == null);
                            if (scaleObject != null) { sizeScaleId = scaleObject.Id; }
                        }
                        if (itemScaleData != null && itemScaleData.Count > 0)
                        {
                            var scaleRatioObject = itemScaleData.FirstOrDefault(a => a.ParentId != null);
                            if (scaleRatioObject != null) { sizeRatioId = scaleRatioObject.Id; }
                        }
                        appItem.ItemSizeScaleHeadersFkList = new List<AppItemSizeScalesHeader>();

                        AppItemSizeScalesHeader appItemSizeScalesHeader = new AppItemSizeScalesHeader();
                        appItemSizeScalesHeader.SizeScaleId = sizeScaleSavedId;
                        appItemSizeScalesHeader.Id = sizeScaleId;
                        appItemSizeScalesHeader.TenantId = AbpSession.TenantId;
                        appItemSizeScalesHeader.Name = sizescale.Result.Name;
                        appItemSizeScalesHeader.SizeScaleCode = sizescale.Result.Code;
                        appItemSizeScalesHeader.NoOfDimensions = sizescale.Result.NoOfDimensions;
                        appItemSizeScalesHeader.Dimesion1Name = sizescale.Result.Dimesion1Name;
                        appItemSizeScalesHeader.ParentId = null;
                        appItemSizeScalesHeader.AppItemSizeScalesDetails = ObjectMapper.Map<List<AppItemSizeScalesDetails>>(sizescale.Result.AppSizeScalesDetails);
                        appItemSizeScalesHeader.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                        appItemSizeScalesHeader.AppItemSizeScalesDetails.ForEach(a => a.TenantId = AbpSession.TenantId);
                        //appItemSizeScalesHeader.AppItemSizeScalesDetails.ForEach(a => a.DimensionName = sizescale.Result.Dimesion1Name);
                        if (appItem.Id != 0 && itemScaleData != null && itemScaleData.Count > 0)
                        {
                            var sizeScaleH = itemScaleData.FirstOrDefault(x => x.ParentId == null);
                            if (sizeScaleH != null)
                            {
                                var cnt = itemScaleData.Count(x => x.ParentId == null);
                                if (cnt > 1)
                                {
                                    await _appItemSizeScalesHeaderRepository.DeleteAsync(x => x.AppItemId == appItem.Id && x.Id != sizeScaleH.Id && x.ParentId == null);
                                }

                                if (sizeScaleH.AppItemSizeScalesDetails != null && sizeScaleH.AppItemSizeScalesDetails.Count > 0)
                                {
                                    foreach (var size in sizeScaleH.AppItemSizeScalesDetails)
                                    {
                                        var existSize = appItemSizeScalesHeader.AppItemSizeScalesDetails.FirstOrDefault(a => a.SizeCode == size.SizeCode && a.DimensionName == size.DimensionName);
                                        if (existSize != null)
                                        {
                                            existSize.Id = size.Id;
                                        }
                                        else
                                        {
                                            size.IsDeleted = true;
                                            appItemSizeScalesHeader.AppItemSizeScalesDetails.Add(size);
                                        }
                                    }
                                }
                                else 
                                {
                                    foreach (var size in appItemSizeScalesHeader.AppItemSizeScalesDetails)
                                    {
                                        size.SizeScaleId = appItemSizeScalesHeader.Id;
                                        await _appItemSizeScalesDetailRepository.InsertAsync(size);
                                    }
                                }
                            }

                        }


                        //appItem.ItemSizeScaleHeadersFkList.Add(appItemSizeScalesHeader);
                        // appItem.ItemSizeScaleHeadersFkList = new List<AppItemSizeScalesHeader>();


                        //if (!string.IsNullOrEmpty(excelDto.SizeRatioName))
                        {
                            var scaleHeaderRatio = _appSizeScalesHeaderRepository.GetAll().Where(x => x.Name == (!string.IsNullOrEmpty(excelDto.SizeRatioName) ? excelDto.SizeRatioName : sizescale.Result.Name.TrimEnd() + " Ratio") & x.ParentId != null).AsNoTracking().FirstOrDefault();
                            if (scaleHeaderRatio == null || (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.CreateACopy) ||
                                (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.ReplaceDuplicatedRecords))
                            {
                                AppSizeScaleForEditDto appSizeScaleRatioForEditDto = new AppSizeScaleForEditDto();
                                appSizeScaleRatioForEditDto.AppSizeScalesDetails = appSizeScalesDetailDtoList;
                                appSizeScaleRatioForEditDto.NoOfDimensions = 1;
                                appSizeScaleRatioForEditDto.ParentId = sizescale.Result.Id;

                                if (scaleHeaderRatio != null & (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.ReplaceDuplicatedRecords))
                                {
                                    appSizeScaleRatioForEditDto.Id = scaleHeaderRatio.Id;
                                    appSizeScaleRatioForEditDto.Code = scaleHeaderRatio.Code;
                                }
                                else
                                    appSizeScaleRatioForEditDto.Code = "";

                                appSizeScaleRatioForEditDto.Dimesion1Name = sizescale.Result.Dimesion1Name;
                                appSizeScaleRatioForEditDto.Name = (!string.IsNullOrEmpty(excelDto.SizeRatioName) ? excelDto.SizeRatioName : sizescale.Result.Name.TrimEnd() + " Ratio");
                                string[] arraySizeRatio = new string[sizes.Count];
                                Array.Fill(arraySizeRatio, "0");
                                if (!string.IsNullOrEmpty(excelDto.SizeRatioName))
                                {
                                    var arrayRatio = excelDto.SizeRatioValue.Split('=')[0];
                                    arraySizeRatio = arrayRatio.Split('-');
                                }
                                List<AppSizeScalesDetailDto> appSizeScalesRatioDetailDtoList = new List<AppSizeScalesDetailDto>();
                                //for (int pos = 0; pos < sizesArray.Length; pos++)
                                //{
                                //    appSizeScalesRatioDetailDtoList.Add(new AppSizeScalesDetailDto
                                //    {
                                //        SizeCode = sizesArray[pos],
                                //        D1Position = pos.ToString(),
                                //        SizeId = null,
                                //        D3Position = null,
                                //        D2Position = null,
                                //        SizeRatio = int.Parse(arraySizeRatio[pos])
                                //    });
                                //}
                                var sizesList = excelDto.SizeRatioValue.Split('|')[0].Split('~').ToList();
                                var sizesRatios = excelDto.SizeRatioValue.Split('|')[1].Split('-').ToList();
                                var sizesRatio = result.Where(z => z.ParentCode == excelDto.Code).Select(a => new { a.SizeCode, a.D1Pos, a.D2Pos, a.D3Pos }).Distinct().ToList();
                                if (sizesRatio != null)
                                {
                                    foreach (var sz in sizesRatio)
                                    {
                                        var posinArr = sizesList.IndexOf(sz.SizeCode);
                                        if (posinArr >= 0)
                                        {
                                            appSizeScalesRatioDetailDtoList.Add(new AppSizeScalesDetailDto
                                            {
                                                SizeCode = sz.SizeCode.TrimEnd(),
                                                D3Position = int.Parse(sz.D3Pos.ToString()) > 0 ? (int.Parse(sz.D3Pos.ToString()) - 1).ToString() : "0",
                                                SizeId = null,
                                                D1Position = int.Parse(sz.D1Pos.ToString()) > 0 ? (int.Parse(sz.D1Pos.ToString()) - 1).ToString() : "0",
                                                D2Position = int.Parse(sz.D2Pos.ToString()) > 0 ? (int.Parse(sz.D2Pos.ToString()) - 1).ToString() : "0",
                                                SizeRatio = int.Parse(sizesRatios[posinArr])
                                            });
                                        }
                                    }
                                    appSizeScaleRatioForEditDto.AppSizeScalesDetails = appSizeScalesRatioDetailDtoList;
                                }

                                var sizescaleRatio = _appSizeScaleAppService.CreateOrEditAppSizeScale(appSizeScaleRatioForEditDto);

                                AppItemSizeScalesHeader appItemSizeScalesHeaderRatio = new AppItemSizeScalesHeader();
                                appItemSizeScalesHeaderRatio.SizeScaleId = sizescaleRatio.Result.Id;
                                appItemSizeScalesHeaderRatio.Id = sizeRatioId;
                                appItemSizeScalesHeaderRatio.Name = sizescaleRatio.Result.Name;
                                appItemSizeScalesHeaderRatio.SizeScaleCode = sizescaleRatio.Result.Code;
                                appItemSizeScalesHeaderRatio.NoOfDimensions = sizescaleRatio.Result.NoOfDimensions;
                                appItemSizeScalesHeaderRatio.Dimesion1Name = sizescaleRatio.Result.Dimesion1Name;
                                appItemSizeScalesHeaderRatio.ParentId = null;// appItemSizeScalesHeader.Id;
                                appItemSizeScalesHeaderRatio.TenantId = AbpSession.TenantId;
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails = ObjectMapper.Map<List<AppItemSizeScalesDetails>>(appSizeScalesRatioDetailDtoList);
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = AbpSession.TenantId);
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.ForEach(a => a.DimensionName = sizescale.Result.Dimesion1Name);
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = appItemSizeScalesHeaderRatio.Id);
                                if (appItem.Id != 0 && itemScaleData != null && itemScaleData.Count > 0)
                                {
                                    
                                    var sizeScaleH = itemScaleData.FirstOrDefault(x => x.ParentId != null);
                                    if (sizeScaleH != null)
                                    {
                                        var cnt = itemScaleData.Count(x => x.ParentId != null);
                                        if (cnt > 1)
                                        {
                                            await _appItemSizeScalesHeaderRepository.DeleteAsync(x=> x.AppItemId == appItem.Id && x.Id != sizeScaleH.Id && x.ParentId != null);
                                        }

                                        if (sizeScaleH.AppItemSizeScalesDetails != null && sizeScaleH.AppItemSizeScalesDetails.Count > 0)
                                        {
                                            foreach (var size in sizeScaleH.AppItemSizeScalesDetails)
                                            {
                                                var existSize = appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.FirstOrDefault(a => a.SizeCode == size.SizeCode && a.DimensionName == size.DimensionName);
                                                if (existSize != null)
                                                {
                                                    existSize.Id = size.Id;
                                                }
                                                else
                                                {
                                                    size.IsDeleted = true;
                                                    appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.Add(size);
                                                }
                                            }
                                        }
                                        else
                                        {
                                            foreach (var size in appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails)
                                            {
                                                size.SizeScaleId = appItemSizeScalesHeaderRatio.Id;
                                                await _appItemSizeScalesDetailRepository.InsertAsync(size);
                                            }
                                        }
                                    }

                                }

                                appItemSizeScalesHeaderRatio.AppItemId = appItem.Id;
                                appItemSizeScalesHeaderRatio.ItemSizeScaleFK = appItemSizeScalesHeader;
                                appItem.ItemSizeScaleHeadersFkList.Add(appItemSizeScalesHeaderRatio);
                            }
                           
                        }
                        appItemSizeScalesHeader.AppItemId = appItem.Id;

                        appItem.ItemSizeScaleHeadersFkList.Add(appItemSizeScalesHeader);
                        // string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("SIZE-SCALE");
                        // scaleHeader.SizeScaleCode = (scaleHeader.ParentId == null ? "SizeScale-" : "SizeRatio-") + seq;



                    }
                }
                else
                {
                    // long sizeRatioId = 0;
                    long sizeScaleId = 0;
                    string scaleName = appItem.Code + " Scale";
                    string scaleCode = null;
                    string scaleDim1Name = appItem.Code + " 1st Dimesion";


                    List<AppItemSizeScalesHeader> itemScaleData = new List<AppItemSizeScalesHeader>();
                    if (appItem.Id != 0)
                    {
                        var sizeScaleList = await x.AppItemSizeScalesHeaders.Where(z => z.AppItemId == appItem.Id).AsNoTracking()
                             .Include(x => x.AppItemSizeScalesDetails).AsNoTracking().ToListAsync();
                        itemScaleData = sizeScaleList;

                    }
                    if (itemScaleData != null && itemScaleData.Count > 0)
                    {
                        var scaleObject = itemScaleData.FirstOrDefault(a => a.ParentId == null);
                        if (scaleObject != null)
                        {
                            sizeScaleId = scaleObject.Id;
                            scaleName = scaleObject.Name;
                            scaleDim1Name = scaleObject.Dimesion1Name;
                            scaleCode = scaleObject.SizeScaleCode;
                        }
                    }
                    appItem.ItemSizeScaleHeadersFkList = new List<AppItemSizeScalesHeader>();
                    if (itemScaleData != null && itemScaleData.Count > 0)
                    {
                        var scaleRatioObject = itemScaleData.FirstOrDefault(a => a.ParentId != null);
                        if (scaleRatioObject != null)
                        {
                            scaleRatioObject.IsDeleted = true;
                            appItem.ItemSizeScaleHeadersFkList.Add(scaleRatioObject);
                        }
                    }


                    AppItemSizeScalesHeader appItemSizeScalesHeader = new AppItemSizeScalesHeader();
                    appItemSizeScalesHeader.SizeScaleId = null;
                    appItemSizeScalesHeader.Id = sizeScaleId;
                    appItemSizeScalesHeader.TenantId = AbpSession.TenantId;
                    appItemSizeScalesHeader.Name = scaleName;
                    appItemSizeScalesHeader.SizeScaleCode = scaleCode;
                    //
                    if (string.IsNullOrEmpty(appItemSizeScalesHeader.SizeScaleCode))
                    {
                        string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("SIZE-SCALE");
                        appItemSizeScalesHeader.SizeScaleCode = "SizeScale-" + seq;
                    }
                    //
                    appItemSizeScalesHeader.NoOfDimensions = 1;
                    appItemSizeScalesHeader.Dimesion1Name = scaleDim1Name;
                    appItemSizeScalesHeader.ParentId = null;
                    appItemSizeScalesHeader.AppItemSizeScalesDetails = new List<AppItemSizeScalesDetails>();
                    var childItemsExtraData = result.Where(x => x.ParentCode == excelDto.Code).Select(a => new { a.ExtraAttributes, a.ExtraAttributesValues });
                    List<string> sizeCodes = new List<string>();
                    foreach (var extrAt in childItemsExtraData)
                    {
                        var sizePos = extrAt.ExtraAttributes.FindIndex(ex => ex.Name.ToUpper() == "SIZE");
                        if (sizePos != -1)
                        {
                            if (sizeCodes.FirstOrDefault(a => a == extrAt.ExtraAttributesValues[sizePos].Code) == null)
                                sizeCodes.Add(extrAt.ExtraAttributesValues[sizePos].Code);
                        }
                    }
                    List<AppItemSizeScalesDetails> appSizeScaleDet = new List<AppItemSizeScalesDetails>();
                    for (int pos = 0; pos < sizeCodes.Count; pos++)
                    {
                        appSizeScaleDet.Add(new AppItemSizeScalesDetails
                        {
                            SizeCode = sizeCodes[pos],
                            D1Position = pos.ToString(),
                            SizeId = null,
                            D3Position = null,
                            D2Position = null,
                            SizeRatio = 0
                        });
                    }
                    appItemSizeScalesHeader.AppItemSizeScalesDetails = appSizeScaleDet;
                    appItemSizeScalesHeader.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                    appItemSizeScalesHeader.AppItemSizeScalesDetails.ForEach(a => a.TenantId = AbpSession.TenantId);
                    appItemSizeScalesHeader.AppItemSizeScalesDetails.ForEach(a => a.DimensionName = scaleDim1Name);
                    if (appItem.Id != 0 && itemScaleData != null && itemScaleData.Count > 0)
                    {
                        var sizeScaleH = itemScaleData.FirstOrDefault(x => x.ParentId == null);
                        if (sizeScaleH != null)
                        {
                            if (sizeScaleH.AppItemSizeScalesDetails != null && sizeScaleH.AppItemSizeScalesDetails.Count > 0)
                            {
                                foreach (var size in sizeScaleH.AppItemSizeScalesDetails)
                                {
                                    var existSize = appItemSizeScalesHeader.AppItemSizeScalesDetails.FirstOrDefault(a => a.SizeCode == size.SizeCode && a.DimensionName == size.DimensionName);
                                    if (existSize != null)
                                    {
                                        existSize.Id = size.Id;
                                    }
                                    else
                                    {
                                        size.IsDeleted = true;
                                        appItemSizeScalesHeader.AppItemSizeScalesDetails.Add(size);
                                    }
                                }
                            }
                        }

                    }
                    //

                    //
                    appItemSizeScalesHeader.AppItemId = appItem.Id;
                    appItem.ItemSizeScaleHeadersFkList.Add(appItemSizeScalesHeader);
                }
                //mmt

                var childItems = result.Where(x => x.ParentCode == excelDto.Code);
                bool firstItem = false;
                foreach (var item in childItems)
                {
                    var appChildItem = new AppItem();
                    if (excelDto.Id != 0)
                    {
                        var itemExist = appItem.ParentFkList.FirstOrDefault(x => x.Code == item.Code);
                        if (itemExist != null)
                        {
                            appChildItem = itemExist;
                            appChildItem.Description = excelDto.ProductDescription;
                            appChildItem.Price = decimal.Parse(excelDto.Price);
                            appChildItem.Name = excelDto.Name;
                            //appChildItem.EntityFk.EntityAttachments = new List<AppEntityAttachment>();
                        }
                        else
                        {

                            appChildItem = ObjectMapper.Map<AppItem>(item);
                            appChildItem.ListingItemId = null;
                            appChildItem.Id = 0;

                            appChildItem.EntityFk = new AppEntity
                            {
                                Id = 0,
                                Code = item.Code,
                                ObjectId = itemObjectId,
                                TenantId = AbpSession.TenantId,
                                EntityObjectStatusId = itemStatusId,
                                Notes = _helper.HtmlToPlainText(item.ProductDescription),

                                Name = item.Name,
                                EntityObjectTypeId = productTypeId.Id,
                                CreatorUserId = AbpSession.UserId,
                                EntityObjectStatusCode = "ACTIVE",
                                EntityObjectTypeCode = "",
                                ObjectCode = "ITEM"


                            };
                            appChildItem.EntityFk.EntityAttachments = new List<AppEntityAttachment>();
                        }

                    }
                    else
                    {
                        appChildItem = ObjectMapper.Map<AppItem>(item);
                        appChildItem.ListingItemId = null;
                        appChildItem.Id = 0;

                        appChildItem.EntityFk = new AppEntity
                        {
                            Id = 0,
                            Code = item.Code,
                            ObjectId = itemObjectId,
                            TenantId = AbpSession.TenantId,
                            EntityObjectStatusId = itemStatusId,
                            Notes = _helper.HtmlToPlainText(item.ProductDescription),

                            Name = item.Name,
                            EntityObjectTypeId = productTypeId.Id,
                            CreatorUserId = AbpSession.UserId,
                            EntityObjectStatusCode = "ACTIVE",
                            EntityObjectTypeCode = "",
                            ObjectCode = "ITEM"


                        };
                        appChildItem.EntityFk.EntityAttachments = new List<AppEntityAttachment>();

                    }
                    //XX
                    appChildItem.ItemPricesFkList = new List<AppItemPrices>();
                    if (appChildItem.Price > 0)
                    {
                        long? currId = null;
                        if (!string.IsNullOrEmpty(item.Currency))
                        {
                            var currObj = currencyIds.FirstOrDefault(x => x.Code.ToUpper() == item.Currency.ToUpper());
                            if (currObj != null)
                                currId = currObj.Value;
                        }
                        appChildItem.ItemPricesFkList.Add(new AppItemPrices
                        {
                            AppItemCode = appChildItem.Code,
                            Code = "MSRP",
                            CurrencyId = !string.IsNullOrEmpty(item.Currency) ? currId : currencyIDDef,
                            Price = appChildItem.Price,
                            CurrencyCode = string.IsNullOrEmpty(item.Currency) ? currencyCode : item.Currency,
                            TenantId = AbpSession.TenantId
                        });
                    }
                    //XX
                    appChildItem.EntityFk.EntityExtraData = new List<AppEntityExtraData>();
                    var entityExtraData = new List<AppEntityExtraData>();
                    if (item.ExtraAttributesValues != null)
                    {
                        for (int etx = 0; etx < item.ExtraAttributesValues.Count; etx++)
                        {
                            if (!item.ExtraAttributes[etx].IsVariation) continue;

                            //long? AttributeValueId = null;
                            var AttributeInfoObj = extrattributesLists.FirstOrDefault(x => x.Key.Name.ToUpper() == item.ExtraAttributes[etx].Name.ToUpper());
                            if (AttributeInfoObj.Key == null) continue;
                            var AttributeInfo = AttributeInfoObj.Value;
                            //if (AttributeInfo != null)
                            //{
                            //    AttributeValueId =  AttributeInfo.FirstOrDefault(x => x.Code == item.ExtraAttributesValues[etx].Code) == null ? 0: AttributeInfo.FirstOrDefault(x => x.Code == item.ExtraAttributesValues[etx].Code).Value ;
                            //}
                            entityExtraData.Add(new AppEntityExtraData
                            {
                                AttributeCode = item.ExtraAttributesValues[etx].Code,
                                AttributeValue = item.ExtraAttributesValues[etx].Value,
                                AttributeValueId = null, // AttributeValueId,
                                EntityObjectTypeName = item.ExtraAttributes[etx].Name,
                                AttributeId = item.ExtraAttributes[etx].AttributeId,
                                EntityObjectTypeId = AttributeInfoObj.Key.Id,
                                EntityObjectTypeCode = item.ExtraAttributes[etx].EntityObjectTypeCode,
                                EntityCode = appChildItem.Code

                            });
                            try
                            {
                                appChildItem.EntityFk.EntityExtraData.Add(entityExtraData[etx]);
                            }
                            catch
                            { }
                            if (etx == 0)
                                firstAttributteValues.Add(item.ExtraAttributesValues[etx].Value);

                            if (etx == 0 && !string.IsNullOrEmpty(item.ImageType) && item.Images != null && item.Images.Count > 0)
                            {
                                var attachCategory = attachmentsCategories.Where(r => r.Code.ToUpper() == item.ImageType.ToUpper()).FirstOrDefault();
                                var defaultImage = item.Images.Where(x => x.ImageFileName.ToLower().Contains("_default") && x.ImageGuid != null).FirstOrDefault();

                                foreach (var img in item.Images)
                                {
                                    if (img.ImageGuid == null) continue;


                                    AppEntityAttachment appEntityAttachment = new AppEntityAttachment();
                                    appEntityAttachment.AttachmentFk = new Attachments.AppAttachment { Name = img.ImageFileName, Attachment = img.ImageGuid + "." + img.ImageFileName.Split('.')[1], TenantId = AbpSession.TenantId };
                                    appEntityAttachment.AttachmentCategoryId = attachCategory.Id;
                                    appEntityAttachment.AttachmentCategoryCode = attachCategory.Code;
                                    appEntityAttachment.Attributes = item.ExtraAttributes[0].AttributeId.ToString() + "=" + appChildItem.EntityFk.EntityExtraData[0].AttributeCode;
                                    appEntityAttachment.EntityCode = excelDto.Code;

                                    if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString()))
                                    {
                                        System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString());
                                    }

                                    try
                                    {
                                        System.IO.File.Copy(path + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], _appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString() + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], true);
                                    }
                                    catch { }



                                    if (img.ImageFileName.ToLower().Contains("_default"))
                                    {
                                        appEntityAttachment.IsDefault = true;
                                        firstAttributteImageDefaults.Add(imagesUrl + img.ImageGuid + "." + img.ImageFileName.Split('.')[1]);
                                    }

                                    appChildItem.EntityFk.EntityAttachments.Add(appEntityAttachment);
                                }
                                if (defaultImage == null && appChildItem.EntityFk.EntityAttachments.Count > 0)
                                {
                                    appChildItem.EntityFk.EntityAttachments[0].IsDefault = true;
                                    firstAttributteImageDefaults.Add(string.IsNullOrEmpty(appChildItem.EntityFk.EntityAttachments[0].AttachmentFk.Attachment) ? "" : imagesUrl + appChildItem.EntityFk.EntityAttachments[0].AttachmentFk.Attachment);
                                }

                            }
                            if (etx == 0 && !string.IsNullOrEmpty(item.ImageType) && (item.Images == null || item.Images.Count == 0))
                            {
                                firstAttributteImageDefaults.Add("");
                            }
                            if (!firstItem)
                            {
                                attributteNames.Add(excelDto.ExtraAttributes[etx].EntityObjectTypeCode + "," + isDefault);
                                attributteIDs.Add(excelDto.ExtraAttributes[etx].AttributeId.ToString() + "," + isDefault);

                            }

                            isDefault = "0";
                            //appChildItem.EntityFk.EntityExtraData[0].Id -AttributeValueId
                            try
                            {
                                secondAttributteValues.Add(new AppItemExtraDto()
                                {
                                    ParentCode = appChildItem.EntityFk.EntityExtraData[etx].AttributeCode,
                                    Id = item.ExtraAttributes[etx].AttributeId,
                                    Value = item.ExtraAttributesValues[etx].Value
                                });
                            }
                            catch { }
                        }
                    }
                    if (appChildItem.Id == 0)
                    {
                        appChildItem.CreatorUserId = AbpSession.UserId;
                        appChildItem.TenantId = AbpSession.TenantId;
                    }
                    appChildItem.Description = item.ProductDescription;

                    firstItem = true;
                    //appChildItem.EntityFk.EntityAttachments = new List<AppEntityAttachment>();
                    //if (!string.IsNullOrEmpty(item.ImageType) && item.Images.Count > 0)
                    //{
                    //    var attachCategory = attachmentsCategories.Where(r => r.Code == item.ImageType).FirstOrDefault();
                    //    var defaultImage = item.Images.Where(x => x.ImageFileName.Contains("_default")).FirstOrDefault ();

                    //    foreach (var img in item.Images)
                    //    {
                    //        AppEntityAttachment appEntityAttachment = new AppEntityAttachment();
                    //        appEntityAttachment.AttachmentFk = new Attachments.AppAttachment { Name = img.ImageFileName, Attachment = img.ImageGuid, TenantId = AbpSession.TenantId };
                    //        appEntityAttachment.AttachmentCategoryId = attachCategory.Id;
                    //        appEntityAttachment.AttachmentCategoryCode = attachCategory.Code;
                    //        appEntityAttachment.Attributes = item.ExtraAttributes[0].AttributeId.ToString() + "=" + item.ExtraAttributesValues[0].Code ;
                    //        appEntityAttachment.EntityCode = excelDto.Code;
                    //        if (img.ImageFileName.ToUpper().Contains("_default"))
                    //        {
                    //            appEntityAttachment.IsDefault = true;
                    //        }

                    //        appChildItem.EntityFk.EntityAttachments.Add(appEntityAttachment);
                    //    }
                    //    if (defaultImage == null)
                    //        appChildItem.EntityFk.EntityAttachments[0].IsDefault = true;

                    //}
                    if (appChildItem.Id == 0)
                        appChildItem.ParentEntityFk = appItem.EntityFk;

                    restAttributteValues.Add(secondAttributteValues);

                    secondAttributteValues = new List<AppItemExtraDto>();

                    if (appChildItem.Id == 0)
                        appItem.ParentFkList.Add(appChildItem);

                }
                // appItem.Variations = "";
                #region concatenate variation lists
                string variation = "";


                if (excelDto.ExtraAttributes != null && excelDto.ExtraAttributes.Count > 0)
                {
                    variation = string.Join("|", attributteNames.Distinct()) + ";" + string.Join("|", attributteIDs.Distinct()) + ";" +
                        string.Join("|", firstAttributteValues.Distinct()) + ";" + string.Join("|", firstAttributteImageDefaults) + ";";
                }

                if (restAttributteValues != null && restAttributteValues.Count > 0)
                {
                    var restLists = restAttributteValues.Distinct().SelectMany(r => r).ToList();
                    string restValues = "";
                    int cntAtt = 0;
                    foreach (var attributteIDloop in attributteIDs)
                    {
                        if (cntAtt == 0)
                        {
                            cntAtt++;
                            continue;
                        }
                        string attributteID = attributteIDloop.Split(',')[0];
                        var attributeList = restLists.Where(r => r.Id.ToString() == attributteID).Select(r => r.Value + "," + r.ParentCode.ToString()).ToList();
                        if (attributeList != null && attributeList.Count > 0)
                        { restValues = restValues + string.Join("|", attributeList.Distinct()) + ";"; }
                        cntAtt++;
                    }
                    variation = variation + restValues;
                }

                appItem.Variations = variation;
                #endregion concatenate variation lists
                if (excelDto.Id == 0)
                    appItemList.Add(appItem);
                else
                    appItemModifyList.Add(appItem);

            }

            //var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            //if (appItemDeleteList.Count > 0)
            //{

            //    await x.AppEntityExtraData.BulkDeleteAsync(appEntityExtraDataDeleteList.ToList());
            //    // x.AppEntityExtraData.RemoveRange(appEntityExtraDataDeleteList.ToList());
            //    await x.AppEntityClassifications.BulkDeleteAsync(appEntityClassificationDeleteList.ToList());
            //    // x.AppEntityClassifications.RemoveRange(appEntityClassificationDeleteList.ToList());
            //    await x.AppEntityCategories.BulkDeleteAsync(appEntityCategoryDeleteList.ToList());
            //    // x.AppEntityCategories.RemoveRange(appEntityCategoryDeleteList.ToList());
            //    await  x.AppEntityAttachments.BulkDeleteAsync(appEntityAttachmentDeleteList.ToList());
            //    // x.AppEntityAttachments.RemoveRange(appEntityAttachmentDeleteList.ToList());
            //    await x.AppEntities.BulkDeleteAsync(appEntityDeleteList.ToList());
            //   // x.AppEntities.RemoveRange(appEntityDeleteList.ToList());
            //   await  x.AppItems.BulkDeleteAsync(appItemDeleteList.ToList());
            //   // x.AppItems.RemoveRange(appItemDeleteList.ToList ());
            //    // await x.BulkSaveChangesAsync();
            //}
            // await x.AppItems.BulkInsertAsync(appItemList);
            if (appItemModifyList.Count > 0)
                x.AppItems.UpdateRange(appItemModifyList);

            if (appItemList.Count > 0)
                x.AppItems.AddRange(appItemList);

            if (appItemModifyList.Count > 0 || appItemList.Count > 0)
                await x.SaveChangesAsync();

            return excelResultsDTO.ExcelLogDTO;
        }
        //public async Task<ExcelResultsDTO> ValidateExcel(string guidFile, string[] imagesList)
        //{
        //    ExcelResultsDTO itemExcelResultsDTO = new ExcelResultsDTO();
        //    itemExcelResultsDTO.TotalRecords = 0;
        //    itemExcelResultsDTO.TotalFailedRecords = 0;
        //    itemExcelResultsDTO.TotalPassedRecords = 0;
        //    itemExcelResultsDTO.FilePath = "";
        //    itemExcelResultsDTO.ExcelRecords = new List<ExcelRecordDTO>() { };

        //    try
        //    {

        //        #region open the excel
        //        var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
        //        var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\" + guidFile + ".xlsx";
        //        //var files = Directory.GetFiles(_appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\", "*.XLSX", SearchOption.AllDirectories);
        //        //if (files != null && files.Length > 0)
        //        {
        //            var ds = _helper.ExcelHelper.GetExcelDataSet(path);

        //            //rename columns
        //            for (int icounter = 0; icounter < ds.Tables[0].Columns.Count; icounter++)
        //            {
        //                string fieldName = ds.Tables[0].Rows[0][icounter].ToString().Trim().Replace(" ", "").Replace(".", "");
        //                ds.Tables[0].Columns[icounter].ColumnName = fieldName;
        //            }

        //            // remove first row, as it contains the headers
        //            ds.Tables[0].Rows.RemoveAt(0);
        //            #endregion open the excel

        //            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds = null;
        //            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds = null;
        //            List<LookupLabelDto> currencyIds = null;
        //            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> categoriesIds = null;
        //            List<SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto> productTypes = null;
        //            List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = null;


        //            try
        //            {
        //                #region get lists
        //                // get Currencies
        //                currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();
        //                // get Product Departments
        //                departmentIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();
        //                //get classifications for contacts
        //                classIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());
        //                // get Product Categories
        //                categoriesIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });
        //                //get Product Types
        //                productTypes = await _sycEntityObjectCategoriesAppService.GetAllSycEntityObjectCategoryForTableDropdown();
        //                // get attachment categories
        //                attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();

        //                #endregion get lists
        //            }
        //            catch (Exception ex) { }
        //            #region create mapper to middle layer AppItemExcelDto list of objects
        //            //create mapper to middle layer AccountExcelDto list of objects
        //            MapperConfiguration configuration;
        //            configuration = new MapperConfiguration(a => { a.AddProfile(new ItemExcelDtoProfile()); });
        //            IMapper mapper;
        //            mapper = configuration.CreateMapper();
        //            List<ExcelDto> result;
        //            result = mapper.Map<List<DataRow>, List<ExcelDto>>(new List<DataRow>(ds.Tables[0].Rows.OfType<DataRow>()));
        //            #endregion create mapper to middle layer AccountExcelDto list of objects

        //            #region Excel validateion rules only.
        //            // 0.Record images array existance in the images array
        //            // 1.Record duplicated in excel
        //            // 2.Sheet.Code and Sheet.Name are not empty
        //            // 3.Sheet.Email Address is not empty, then it has a valid email address
        //            // 4.Sheet.Website is not empty, then it has a valid website
        //            // 5.Sheet.RecordType shuold be either 'Account', 'Branch' or 'Contact'
        //            // 6.Sheet.AccountType shuold be either 'Seller', 'Buyer' and 'Seller & Buyer'
        //            Int32 rowNumber = 1;
        //            foreach (var rec in result)
        //            {
        //                rowNumber++;
        //                rec.rowNumber = rowNumber;
        //            }
        //            itemExcelResultsDTO.TotalRecords = result.Count();
        //            itemExcelResultsDTO.TotalFailedRecords = 0;
        //            itemExcelResultsDTO.TotalPassedRecords = 0;
        //            itemExcelResultsDTO.FilePath = path;
        //            itemExcelResultsDTO.ExcelRecords = new List<ExcelRecordDTO>() { };

        //            List<string> RecordsCodes = result.Select(r => r.Code).ToList();
        //            List<string> RecordsParentCodes = result.Select(r => r.ParentCode).ToList();
        //            foreach (ExcelDto excelDto in result)
        //            {
        //                ExcelRecordDTO itemExcelRecordErrorDTO = new ExcelRecordDTO();
        //                itemExcelRecordErrorDTO.RecordType = excelDto.RecordType;
        //                itemExcelRecordErrorDTO.ParentCode = excelDto.ParentCode;
        //                itemExcelRecordErrorDTO.Code = excelDto.Code;
        //                itemExcelRecordErrorDTO.Name = excelDto.Name;
        //                itemExcelRecordErrorDTO.Status = ExcelRecordStatus.Passed.ToString();
        //                itemExcelRecordErrorDTO.ErrorMessage = "";
        //                itemExcelRecordErrorDTO.FieldsErrors = new List<string>() { };
        //                itemExcelRecordErrorDTO.ExcelDto = excelDto;
        //                string recordErrorMEssage = "Wrong data in this " + itemExcelRecordErrorDTO.RecordType + ". check this record in the sheet and update";

        //                #region check images
        //                bool hasError = false;
        //                if (imagesList != null)
        //                {
        //                    if (!string.IsNullOrEmpty(excelDto.Image1FileName) && !imagesList.Contains(excelDto.Image1FileName.ToUpper()))
        //                    {
        //                        accountExcelRecordErrorDTO.FieldsErrors.Add("Image 1 File Name: Not found.");
        //                        hasError = true;
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image1Type))
        //                    {
        //                        var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image1Type.ToUpper().TrimEnd());
        //                        if (attCoverId == 0)
        //                        {
        //                            accountExcelRecordErrorDTO.FieldsErrors.Add("Image 1 Type: Not found.");
        //                            hasError = true;
        //                        }
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image2FileName) && !imagesList.Contains(accountExcelDto.Image2FileName.ToUpper()))
        //                    {
        //                        accountExcelRecordErrorDTO.FieldsErrors.Add("Image 2 File Name: Not found.");
        //                        hasError = true;
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image2Type))
        //                    {
        //                        var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image2Type.ToUpper().TrimEnd());
        //                        if (attCoverId == 0)
        //                        {
        //                            accountExcelRecordErrorDTO.FieldsErrors.Add("Image 2 Type: Not found.");
        //                            hasError = true;
        //                        }
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image3FileName) && !imagesList.Contains(accountExcelDto.Image3FileName.ToUpper()))
        //                    {
        //                        accountExcelRecordErrorDTO.FieldsErrors.Add("Image 3 File Name: Not found.");
        //                        hasError = true;
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image3Type))
        //                    {
        //                        var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image3Type.ToUpper().TrimEnd());
        //                        if (attCoverId == 0)
        //                        {
        //                            accountExcelRecordErrorDTO.FieldsErrors.Add("Image 3 Type: Not found.");
        //                            hasError = true;
        //                        }
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image4FileName) && !imagesList.Contains(accountExcelDto.Image4FileName.ToUpper()))
        //                    {
        //                        accountExcelRecordErrorDTO.FieldsErrors.Add("Image 4 File Name: Not found.");
        //                        hasError = true;
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image4Type))
        //                    {
        //                        var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image4Type.ToUpper().TrimEnd());
        //                        if (attCoverId == 0)
        //                        {
        //                            accountExcelRecordErrorDTO.FieldsErrors.Add("Image 4 Type: Not found.");
        //                            hasError = true;
        //                        }
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image5FileName) && !imagesList.Contains(accountExcelDto.Image5FileName.ToUpper()))
        //                    {

        //                        accountExcelRecordErrorDTO.FieldsErrors.Add("Image 5 File Name: Not found.");
        //                        hasError = true;
        //                    }

        //                    if (!string.IsNullOrEmpty(accountExcelDto.Image5Type))
        //                    {
        //                        var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image5Type.ToUpper().TrimEnd());
        //                        if (attCoverId == 0)
        //                        {
        //                            accountExcelRecordErrorDTO.FieldsErrors.Add("Image 5 Type: Not found.");
        //                            hasError = true;
        //                        }
        //                    }
        //                }
        //                #endregion check images

        //                #region code, name, email and website validation    
        //                if (RecordsCodes.Where(r => r == accountExcelDto.Code).ToList().Count() > 1)
        //                {
        //                    accountExcelRecordErrorDTO.FieldsErrors.Add("Code: Should Exists Once."); hasError = true;
        //                    recordErrorMEssage = "Duplicated " + accountExcelRecordErrorDTO.RecordType;
        //                }

        //                AccountExcelRecordType accountExcelRecordType;
        //                AccountExcelAccountType accountExcelAccountType;

        //                if (string.IsNullOrEmpty(accountExcelDto.Code)) { accountExcelRecordErrorDTO.FieldsErrors.Add("Code: Should Have a Value."); hasError = true; }
        //                if (string.IsNullOrEmpty(accountExcelDto.Name)) { accountExcelRecordErrorDTO.FieldsErrors.Add("Name: Should Have a Value."); hasError = true; }
        //                if (!string.IsNullOrEmpty(accountExcelDto.Website) && !_helper.ExcelHelper.IsValidWebsite(accountExcelDto.Website))
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Website: Not Valid Website Value."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.EmailAddress) && !_helper.ExcelHelper.IsValidEmail(accountExcelDto.EmailAddress))
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Email Address: Not Valid Email Value."); hasError = true; }

        //                #endregion code, name, email and website validation

        //                #region check record type
        //                if (string.IsNullOrEmpty(accountExcelDto.RecordType) && Enum.TryParse<AccountExcelRecordType>(accountExcelDto.RecordType, out accountExcelRecordType))
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Record Type: Should Be Account|Branch|Contact."); hasError = true; }

        //                if (string.IsNullOrEmpty(accountExcelDto.RecordType) && Enum.TryParse<AccountExcelAccountType>(accountExcelDto.AccountType, out accountExcelAccountType))
        //                {
        //                    accountExcelRecordErrorDTO.FieldsErrors.Add("Account Type: Should Be Seller|Buyer|Both."); hasError = true;
        //                }
        //                if (accountExcelDto.RecordType == AccountExcelRecordType.Branch.ToString() && result.Where(r => r.Code == accountExcelDto.ParentCode && r.RecordType == AccountExcelRecordType.Account.ToString()).ToList().Count() == 0)
        //                {
        //                    accountExcelRecordErrorDTO.FieldsErrors.Add("Parent Code: Branch Parent Should Be Of Account Type."); hasError = true;
        //                }

        //                if (accountExcelDto.RecordType == AccountExcelRecordType.Contact.ToString() && result.Where(r => r.Code == accountExcelDto.ParentCode && r.RecordType == AccountExcelRecordType.Branch.ToString()).ToList().Count() == 0)
        //                {
        //                    accountExcelRecordErrorDTO.FieldsErrors.Add("Parent Code: Contact Parent Should Be Of Branch Type."); hasError = true;
        //                }
        //                #endregion check record type

        //                #region phone validation
        //                if (!string.IsNullOrEmpty(accountExcelDto.Phone1Code) &&
        //                    !string.IsNullOrEmpty(accountExcelDto.Phone1Number) &&
        //                    !_helper.ExcelHelper.IsPhoneNumber(accountExcelDto.Phone1Code + accountExcelDto.Phone1Number))
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 1: Phone 1 Is Filled With a InValid Phone# and Code."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Phone1Type) && GetTypeId(accountExcelDto.Phone1Type, phoneTypes) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 1: Phone 1 Type is InValid."); hasError = true; }



        //                if (!string.IsNullOrEmpty(accountExcelDto.Phone2Code) &&
        //                   !string.IsNullOrEmpty(accountExcelDto.Phone2Number) &&
        //                   !_helper.ExcelHelper.IsPhoneNumber(accountExcelDto.Phone2Code + accountExcelDto.Phone2Number))
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 2: Phone 2 Is Filled With a InValid Phone# and Code."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Phone1Type) && GetTypeId(accountExcelDto.Phone1Type, phoneTypes) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 2: Phone 2 Type is InValid."); hasError = true; }



        //                if (!string.IsNullOrEmpty(accountExcelDto.Phone3Code) &&
        //                    !string.IsNullOrEmpty(accountExcelDto.Phone3Number) &&
        //                    !_helper.ExcelHelper.IsPhoneNumber(accountExcelDto.Phone3Code + accountExcelDto.Phone3Number))
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 3: Phone 3 Is Filled With a InValid Phone# and Code."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Phone3Type) && GetTypeId(accountExcelDto.Phone3Type, phoneTypes) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 3: Phone 3 Type is InValid."); hasError = true; }


        //                #endregion phone validation

        //                #region check address 
        //                bool AddressTypeFound = false;

        //                if (!string.IsNullOrEmpty(accountExcelDto.Address1Type) && GetTypeId(accountExcelDto.Address1Type, addressTypes) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 1 Type: Address Type is InValid."); hasError = true; }
        //                else
        //                { AddressTypeFound = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Address2Type) && GetTypeId(accountExcelDto.Address2Type, addressTypes) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 2 Type: Address Type is InValid."); hasError = true; }
        //                else
        //                { AddressTypeFound = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Address3Type) && GetTypeId(accountExcelDto.Address3Type, addressTypes) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 3 Type: Address Type is InValid."); hasError = true; }
        //                else
        //                { AddressTypeFound = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Address4Type) && GetTypeId(accountExcelDto.Address4Type, addressTypes) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 4 Type: Address Type is InValid."); hasError = true; }
        //                else
        //                { AddressTypeFound = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Address1Country) && GetTypeId(accountExcelDto.Address1Country, countries) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 1 Country: Country Code is InValid."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Address2Country) && GetTypeId(accountExcelDto.Address2Country, countries) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 2 Country: Country Code is InValid."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Address3Country) && GetTypeId(accountExcelDto.Address3Country, countries) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 3 Country: Country Code is InValid."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Address4Country) && GetTypeId(accountExcelDto.Address4Country, countries) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 4 Country: Country Code is InValid."); hasError = true; }

        //                if (!AddressTypeFound)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address Type: At Least One Address Type Should Be Valid."); hasError = true; }

        //                if ((!string.IsNullOrEmpty(accountExcelDto.Address1City) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address1Code) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address1Country) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address1Line1) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address1Line2) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address1Name) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address1PostalCode) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address1State) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address1Type)) &&
        //                    (string.IsNullOrEmpty(accountExcelDto.Address1City) ||
        //                    string.IsNullOrEmpty(accountExcelDto.Address1Code) ||
        //                    string.IsNullOrEmpty(accountExcelDto.Address1Country) ||
        //                    string.IsNullOrEmpty(accountExcelDto.Address1Line1) ||
        //                    string.IsNullOrEmpty(accountExcelDto.Address1Line2) ||
        //                    string.IsNullOrEmpty(accountExcelDto.Address1Name) ||
        //                    string.IsNullOrEmpty(accountExcelDto.Address1PostalCode) ||
        //                    string.IsNullOrEmpty(accountExcelDto.Address1State) ||
        //                    string.IsNullOrEmpty(accountExcelDto.Address1Type))
        //                    )
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 1 : Address 1 Field Should be All Filled or Removed."); hasError = true; }

        //                if ((!string.IsNullOrEmpty(accountExcelDto.Address2City) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Code) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Country) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Line1) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Line2) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Name) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2PostalCode) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2State) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Type)) &&
        //                    !(string.IsNullOrEmpty(accountExcelDto.Address2City) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Code) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Country) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Line1) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Line2) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Name) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2PostalCode) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2State) ||
        //                    !string.IsNullOrEmpty(accountExcelDto.Address2Type))
        //                    )
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 2 : Address 2 Field Should be All Filled or Removed."); hasError = true; }

        //                if ((!string.IsNullOrEmpty(accountExcelDto.Address3City) ||
        //                                    !string.IsNullOrEmpty(accountExcelDto.Address3Code) ||
        //                                    !string.IsNullOrEmpty(accountExcelDto.Address3Country) ||
        //                                    !string.IsNullOrEmpty(accountExcelDto.Address3Line1) ||
        //                                    !string.IsNullOrEmpty(accountExcelDto.Address3Line2) ||
        //                                    !string.IsNullOrEmpty(accountExcelDto.Address3Name) ||
        //                                    !string.IsNullOrEmpty(accountExcelDto.Address3PostalCode) ||
        //                                    !string.IsNullOrEmpty(accountExcelDto.Address3State) ||
        //                                    !string.IsNullOrEmpty(accountExcelDto.Address3Type)) &&
        //                                    (string.IsNullOrEmpty(accountExcelDto.Address3City) ||
        //                                    string.IsNullOrEmpty(accountExcelDto.Address3Code) ||
        //                                    string.IsNullOrEmpty(accountExcelDto.Address3Country) ||
        //                                    string.IsNullOrEmpty(accountExcelDto.Address3Line1) ||
        //                                    string.IsNullOrEmpty(accountExcelDto.Address3Line2) ||
        //                                    string.IsNullOrEmpty(accountExcelDto.Address3Name) ||
        //                                    string.IsNullOrEmpty(accountExcelDto.Address3PostalCode) ||
        //                                    string.IsNullOrEmpty(accountExcelDto.Address3State) ||
        //                                    string.IsNullOrEmpty(accountExcelDto.Address3Type))
        //                                    )
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 3 : Address 3 Field Should be All Filled or Removed."); hasError = true; }

        //                if ((!string.IsNullOrEmpty(accountExcelDto.Address4City) ||
        //                               !string.IsNullOrEmpty(accountExcelDto.Address4Code) ||
        //                               !string.IsNullOrEmpty(accountExcelDto.Address4Country) ||
        //                               !string.IsNullOrEmpty(accountExcelDto.Address4Line1) ||
        //                               !string.IsNullOrEmpty(accountExcelDto.Address4Line2) ||
        //                               !string.IsNullOrEmpty(accountExcelDto.Address4Name) ||
        //                               !string.IsNullOrEmpty(accountExcelDto.Address4PostalCode) ||
        //                               !string.IsNullOrEmpty(accountExcelDto.Address4State) ||
        //                               !string.IsNullOrEmpty(accountExcelDto.Address4Type)) &&
        //                               (string.IsNullOrEmpty(accountExcelDto.Address4City) ||
        //                               string.IsNullOrEmpty(accountExcelDto.Address4Code) ||
        //                               string.IsNullOrEmpty(accountExcelDto.Address4Country) ||
        //                               string.IsNullOrEmpty(accountExcelDto.Address4Line1) ||
        //                               string.IsNullOrEmpty(accountExcelDto.Address4Line2) ||
        //                               string.IsNullOrEmpty(accountExcelDto.Address4Name) ||
        //                               string.IsNullOrEmpty(accountExcelDto.Address4PostalCode) ||
        //                               string.IsNullOrEmpty(accountExcelDto.Address4State) ||
        //                               string.IsNullOrEmpty(accountExcelDto.Address4Type))
        //                               )
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 4 : Address 4 Field Should be All Filled or Removed."); hasError = true; }


        //                #endregion check address 

        //                #region currency && language validation
        //                if (!string.IsNullOrEmpty(accountExcelDto.Language) && GetTypeId(accountExcelDto.Language, languageIds) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Language: Should Have a Valid Language Value."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Currency) && GetTypeId(accountExcelDto.Currency, currencyIds) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Currency: Should Have a Valid Currency Value."); hasError = true; }
        //                #endregion currency && language validation

        //                #region Class && department validation
        //                if (!string.IsNullOrEmpty(accountExcelDto.BusinessClassification1) && GetClassId(accountExcelDto.BusinessClassification1, classIds) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Business Classification 1: Should Have a Valid Business Classification  Value."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.BusinessClassification2) && GetClassId(accountExcelDto.BusinessClassification2, classIds) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Business Classification 2: Should Have a Valid Business Classification  Value."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.BusinessClassification3) && GetClassId(accountExcelDto.BusinessClassification3, classIds) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Business Classification 3: Should Have a Valid Business Classification  Value."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Department1) && GetDepartmentId(accountExcelDto.Department1, departmentIds) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Department 1: Should Have a Valid Product Department  Value."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Department2) && GetDepartmentId(accountExcelDto.Department2, departmentIds) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Department 2: Should Have a Valid Product Department  Value."); hasError = true; }

        //                if (!string.IsNullOrEmpty(accountExcelDto.Department3) && GetDepartmentId(accountExcelDto.Department3, departmentIds) == 0)
        //                { accountExcelRecordErrorDTO.FieldsErrors.Add("Department 3: Should Have a Valid Product Department  Value."); hasError = true; }
        //                #endregion Class && department validation

        //                if (hasError)
        //                {
        //                    accountExcelRecordErrorDTO.Status = AccountExcelRecordStatus.Failed.ToString();
        //                    accountExcelRecordErrorDTO.ErrorMessage = recordErrorMEssage;
        //                }
        //                accountExcelRecordErrorDTO.image1 = accountExcelDto.Image1FileName;
        //                accountExcelRecordErrorDTO.image1Type = accountExcelDto.Image1Type;
        //                accountExcelRecordErrorDTO.image2 = accountExcelDto.Image2FileName;
        //                accountExcelRecordErrorDTO.image2Type = accountExcelDto.Image2Type;
        //                accountExcelRecordErrorDTO.image3 = accountExcelDto.Image3FileName;
        //                accountExcelRecordErrorDTO.image3Type = accountExcelDto.Image3Type;
        //                accountExcelRecordErrorDTO.image4 = accountExcelDto.Image4FileName;
        //                accountExcelRecordErrorDTO.image4Type = accountExcelDto.Image4Type;
        //                accountExcelRecordErrorDTO.image5 = accountExcelDto.Image5FileName;
        //                accountExcelRecordErrorDTO.image5Type = accountExcelDto.Image5Type;

        //                accountExcelResultsDTO.AccountExcelRecords.Add(accountExcelRecordErrorDTO);

        //            }

        //            #region if parent failed then children are failed
        //            List<AccountExcelRecordDTO> resultSorted = accountExcelResultsDTO.AccountExcelRecords.OrderBy(r => r.ParentCode).ThenBy(r => r.Code).ToList();
        //            foreach (AccountExcelRecordDTO accountExcelRecord in resultSorted)
        //            {
        //                if (accountExcelRecord.Status == AccountExcelRecordStatus.Failed.ToString())
        //                {
        //                    accountExcelResultsDTO.AccountExcelRecords.Where(r => r.ParentCode == accountExcelRecord.Code).ToList().ForEach(r => r.Status = AccountExcelRecordStatus.Failed.ToString());
        //                }
        //            }
        //            #endregion if parent failed then children are failed

        //            accountExcelResultsDTO.TotalPassedAccounts = accountExcelResultsDTO.AccountExcelRecords.Where(r => r.Status == AccountExcelRecordStatus.Passed.ToString() || r.Status == AccountExcelRecordStatus.Warning.ToString()).Count();
        //            accountExcelResultsDTO.TotalFailedAccounts = accountExcelResultsDTO.AccountExcelRecords.Where(r => r.Status == AccountExcelRecordStatus.Failed.ToString()).Count(); ;
        //            #endregion Excel validateion rules only.

        //            #region update the excel sheet with errors
        //            // Create new Spreadsheet
        //            accountExcelResultsDTO.CodesFromList = new List<string>();
        //            accountExcelResultsDTO.FromList = new List<Int32>();
        //            accountExcelResultsDTO.ToList = new List<Int32>();
        //            Spreadsheet document = new Spreadsheet();
        //            document.LoadFromFile(accountExcelResultsDTO.FilePath);

        //            // Get worksheet by name
        //            Worksheet Sheet = document.Workbook.Worksheets[0];
        //            // Set current cell
        //            Sheet.Cell("CA1").Value = "Processing Status";
        //            Sheet.Cell("CB1").Value = "Processing Error Message";
        //            Sheet.Cell("CC1").Value = "Processing Error Details";
        //            rowNumber = 1;
        //            //accountExcelResultsDTO.FromList.Add(1);
        //            foreach (AccountExcelRecordDTO logRecord in accountExcelResultsDTO.AccountExcelRecords)
        //            {
        //                rowNumber++;
        //                if (Sheet.Cell("A" + rowNumber.ToString()).Value.ToString() == "Account")
        //                {
        //                    if (rowNumber > 2)
        //                    { accountExcelResultsDTO.ToList.Add(rowNumber - 1); }
        //                    accountExcelResultsDTO.FromList.Add(rowNumber);
        //                    accountExcelResultsDTO.CodesFromList.Add(Sheet.Cell("D" + rowNumber.ToString()).Value.ToString());
        //                }
        //                Sheet.Cell("CA" + rowNumber.ToString()).Value = logRecord.Status;
        //                Sheet.Cell("CB" + rowNumber.ToString()).Value = logRecord.ErrorMessage;
        //                Sheet.Cell("CC" + rowNumber.ToString()).Value = logRecord.FieldsErrors.JoinAsString(",");
        //            }
        //            accountExcelResultsDTO.ToList.Add(rowNumber);
        //            //move to attachment folder and save
        //            accountExcelResultsDTO.FilePath = accountExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:PathTemp"], _appConfiguration[$"Attachment:Path"]);
        //            //accountExcelResultsDTO.FilePath = accountExcelResultsDTO.FilePath.ToString().ToUpper().Replace("XLSX", "XLS");

        //            document.SaveAsXLSX(accountExcelResultsDTO.FilePath);

        //            // Close document
        //            document.Close();

        //            itemExcelResultsDTO.ExcelLogDTO = new ExcelLogDto();

        //            itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath = itemExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:Omitt"].ToString(), "");
        //            itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath = itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath.ToLower();
        //            itemExcelResultsDTO.ExcelLogDTO.ExcelLogFileName = _appConfiguration[$"Templates:AccountExcelLogFileName"];

        //            #endregion update the excel sheet with errors

        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        itemExcelResultsDTO.ErrorMessage = ex.Message.ToString();
        //    }
        //    return itemExcelResultsDTO;
        //}
        //Mariam[End]
        //MMT30[Start]
        public async Task<string> GenerateProductCode(int productId, bool lUpdateSeq)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                bool entityIdentifierFound = false;
                string returnCode = "";
                if (productId > 0)
                {
                    var productType = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(productId);
                    if (productType != null)
                    {
                        var identifierId = productType.SycEntityObjectType.SycIdentifierDefinitionId;
                        if (identifierId != null)
                        {
                            var identifierDef = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionForView(long.Parse(identifierId.ToString()));
                            if (identifierDef != null)
                            {
                                var identifierDefDet = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionByTypeForView(identifierDef.SycIdentifierDefinition.Code);
                                if (identifierDefDet != null)
                                {
                                    var productCodeSegment = identifierDefDet.SycSegmentIdentifierDefinitions.FirstOrDefault(z => z.SegmentNumber == 1);
                                    returnCode = await GetProductCode(productCodeSegment, lUpdateSeq);
                                    entityIdentifierFound = true;
                                }
                            }
                        }
                    }
                    if (entityIdentifierFound == false)
                    {
                        //var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                        var sydobject = _syObjectRepository.FirstOrDefault(x => x.Code == "ITEM");
                        if (sydobject != null)
                        {
                            var identifierId = sydobject.SycDefaultIdentifierId;
                            if (identifierId != null)
                            {
                                var identifierDef = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionForView(long.Parse(identifierId.ToString()));
                                if (identifierDef != null)
                                {
                                    //var identifierDefDet = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionByTypeForView(identifierDef.SycIdentifierDefinition.Code);
                                    //if (identifierDefDet != null)
                                    //{
                                    var sycSegmentIdentifierDefinitions = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == identifierId).ToList();
                                    var sycSegmentIdentifierDefinitionList = ObjectMapper.Map<List<SycSegmentIdentifierDefinitionDto>>(sycSegmentIdentifierDefinitions);
                                    var productCodeSegment = sycSegmentIdentifierDefinitionList.FirstOrDefault(z => z.SegmentNumber == 1);
                                    returnCode = await GetProductCode(productCodeSegment, lUpdateSeq);
                                    entityIdentifierFound = true;
                                    //}
                                }
                            }
                        }
                    }
                }
                return returnCode;
            }
        }
        public async Task<string> GetProductCode(SycSegmentIdentifierDefinitionDto segment, bool lUpdateSequence)
        {
            string returnString = "";
            if (segment.IsAutoGenerated & segment.SegmentType == "Sequence")
            {
                var sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == AbpSession.TenantId).FirstOrDefault();
                if (sycCounter == null)
                {
                    if (lUpdateSequence)
                    {
                        sycCounter = new SycCounter();
                        sycCounter.SycSegmentIdentifierDefinitionId = segment.Id;
                        sycCounter.Counter = segment.CodeStartingValue + 1;
                        if (AbpSession.TenantId != null)
                        {
                            sycCounter.TenantId = (int?)AbpSession.TenantId;
                        }
                        await _sycCounter.InsertAsync(sycCounter);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    returnString = segment.CodeStartingValue.ToString().Trim().PadLeft(segment.SegmentLength, '0');
                }
                else
                {
                    returnString = sycCounter.Counter.ToString().Trim().PadLeft(segment.SegmentLength, '0');
                    if (lUpdateSequence)
                    {
                        sycCounter.Counter += 1;
                        await _sycCounter.UpdateAsync(sycCounter);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
            }
            return returnString;
        }
        public async Task<List<ProductVariationsType>> GetProductVariationsTypes(int productId)
        {
            List<ProductVariationsType> returnVariationTypeList = new List<ProductVariationsType>();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                bool entityIdentifierFound = false;

                if (productId > 0)
                {
                    var productType = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(productId);
                    if (productType != null)
                    {
                        var identifierId = productType.SycEntityObjectType.SycIdentifierDefinitionId;
                        if (identifierId != null)
                        {
                            var identifierDef = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionForView(long.Parse(identifierId.ToString()));
                            if (identifierDef != null)
                            {
                                var identifierDefDet = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionByTypeForView(identifierDef.SycIdentifierDefinition.Code);
                                if (identifierDefDet != null)
                                {

                                    //var sycSegmentIdentifierDefinitionList = ObjectMapper.Map<List<SycSegmentIdentifierDefinitionDto>>(sycSegmentIdentifierDefinitions);
                                    var serializer = new XmlSerializer(typeof(ItemExtraAttributes));
                                    ItemExtraAttributes extraAttributes = null;
                                    using (TextReader reader = new StringReader(productType.SycEntityObjectType.ExtraAttributes))
                                    {
                                        extraAttributes = (ItemExtraAttributes)serializer.Deserialize(reader);
                                    }

                                    var productCodeSegment = identifierDefDet.SycSegmentIdentifierDefinitions.Where(z => z.SegmentNumber > 1).ToList();
                                    if (productCodeSegment != null && productCodeSegment.Count > 0)
                                    {

                                        ProductVariationsType productVariationsType = new ProductVariationsType();
                                        productVariationsType.Name = identifierDef.SycIdentifierDefinition.Code;
                                        productVariationsType.Id = long.Parse(identifierId.ToString());
                                        productVariationsType.VariationAttributes = new List<VariationAttribute>();
                                        long attrId = 0;

                                        foreach (var attr in productCodeSegment)
                                        {

                                            if (extraAttributes != null && extraAttributes.ExtraAttributes.Count > 0)
                                            {
                                                var entityattibuteObj = extraAttributes.ExtraAttributes.FirstOrDefault(z => z.Name == attr.Code);
                                                if (entityattibuteObj != null)
                                                {
                                                    attrId = entityattibuteObj.AttributeId;
                                                }
                                            }

                                            productVariationsType.VariationAttributes.Add(new VariationAttribute { Name = attr.Code, AttributeId = attrId });
                                        }
                                        returnVariationTypeList.Add(productVariationsType);
                                        entityIdentifierFound = true;
                                    }
                                }
                            }
                        }
                    }
                    if (entityIdentifierFound == false)
                    {
                        //var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                        var sydobject = _syObjectRepository.FirstOrDefault(x => x.Code == "ITEM");
                        if (sydobject != null)
                        {
                            var identifierId = sydobject.SycDefaultIdentifierId;
                            if (identifierId != null)
                            {
                                var identifierDef = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionForView(long.Parse(identifierId.ToString()));
                                if (identifierDef != null)
                                {
                                    // var identifierDefDet = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionByTypeForView(identifierDef.SycIdentifierDefinition.Code);
                                    // if (identifierDefDet != null)
                                    {
                                        var serializer = new XmlSerializer(typeof(ItemExtraAttributes));
                                        ItemExtraAttributes extraAttributes = null;
                                        using (TextReader reader = new StringReader(productType.SycEntityObjectType.ExtraAttributes))
                                        {
                                            extraAttributes = (ItemExtraAttributes)serializer.Deserialize(reader);
                                        }
                                        // var productCodeSegment = identifierDefDet.SycSegmentIdentifierDefinitions.Where(z => z.SegmentNumber > 1).ToList();
                                        var productCodeSegment = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == identifierId && e.SegmentNumber > 1).ToList();
                                        var sycSegmentIdentifierDefinitionList = ObjectMapper.Map<List<SycSegmentIdentifierDefinitionDto>>(productCodeSegment);
                                        if (sycSegmentIdentifierDefinitionList != null && sycSegmentIdentifierDefinitionList.Count > 0)
                                        {
                                            ProductVariationsType productVariationsType = new ProductVariationsType();
                                            productVariationsType.Name = identifierDef.SycIdentifierDefinition.Code;
                                            productVariationsType.Id = long.Parse(identifierId.ToString());
                                            productVariationsType.VariationAttributes = new List<VariationAttribute>();

                                            for (int attr = 0; attr < sycSegmentIdentifierDefinitionList.Count; attr++)
                                            {
                                                var attrib = sycSegmentIdentifierDefinitionList[attr];
                                                long attrId = 0;
                                                if (extraAttributes != null && extraAttributes.ExtraAttributes.Count > 0)
                                                {
                                                    var entityattibuteObj = extraAttributes.ExtraAttributes.FirstOrDefault(z => z.Name == attrib.Code);
                                                    if (entityattibuteObj != null)
                                                    {
                                                        attrId = entityattibuteObj.AttributeId;
                                                    }
                                                }
                                                productVariationsType.VariationAttributes.Add(new VariationAttribute { Name = attrib.Code, AttributeId = attrId });
                                            }
                                            returnVariationTypeList.Add(productVariationsType);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }
            return returnVariationTypeList;
        }
        [Microsoft.AspNetCore.Mvc.HttpPost]
        public async Task<IList<VariationItemDto>> GetVariationsCodes(long identifierId, string productCode, IList<VariationItemDto> variationsList, long productTypeId)
        {
            string productCodeMask = "";
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var productCodeSegment = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == identifierId).OrderBy(z => z.SegmentNumber).ToList();

                var sycSegmentIdentifierDefinitionList = ObjectMapper.Map<List<SycSegmentIdentifierDefinitionDto>>(productCodeSegment);
                Dictionary<string, string> segments = new Dictionary<string, string>();
                if (sycSegmentIdentifierDefinitionList != null && sycSegmentIdentifierDefinitionList.Count > 0)
                {
                    for (int attr = 0; attr < sycSegmentIdentifierDefinitionList.Count; attr++)
                    {
                        if (sycSegmentIdentifierDefinitionList[attr].SegmentNumber == 1)
                        {
                            if (!string.IsNullOrEmpty(sycSegmentIdentifierDefinitionList[attr].SegmentMask))
                            {
                                productCodeMask = _helper.StringMask(sycSegmentIdentifierDefinitionList[attr].SegmentMask, productCode);// Mask(productCode,0,sycSegmentIdentifierDefinitionList[attr].SegmentMask);
                                continue;
                            }

                        }
                        segments.Add(sycSegmentIdentifierDefinitionList[attr].Code, sycSegmentIdentifierDefinitionList[attr].SegmentMask);
                    }
                }
                foreach (var variation in variationsList)
                {
                    //xx
                    if (variation.Id != 0)
                        continue;
                    List<AppEntityExtraDataDto> extrData = new List<AppEntityExtraDataDto>();
                    extrData.AddRange(variation.EntityExtraData);
                    foreach (var attr in variation.EntityExtraData)
                    {
                        if (attr.AttributeValueId != null && attr.AttributeValueId != 0)
                        {
                            var attRelated = await GetExtraAttributeData(long.Parse(attr.AttributeValueId.ToString()), int.Parse(productTypeId.ToString()));
                            if (attRelated != null & attRelated.Count > 0)
                            {
                                extrData.AddRange(attRelated);
                            }
                            //else
                            {
                                var productEntityObjectType = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(int.Parse(productTypeId.ToString()));
                                if (productEntityObjectType != null)
                                {
                                    var serializer = new XmlSerializer(typeof(ItemExtraAttributes));
                                    var serializerProduct = new XmlSerializer(typeof(ItemExtraAttributes));

                                    ItemExtraAttributes productExtraAttributes = null;
                                    using (TextReader reader = new StringReader(productEntityObjectType.SycEntityObjectType.ExtraAttributes))
                                    {
                                        productExtraAttributes = (ItemExtraAttributes)serializer.Deserialize(reader);
                                        if (productExtraAttributes.ExtraAttributes.Count > 0 && !string.IsNullOrEmpty(attr.EntityObjectTypeCode))
                                        {
                                            var attExtrData = productExtraAttributes.ExtraAttributes.Where(z => z.Name.ToLower().Contains(attr.EntityObjectTypeCode.ToLower())).ToList();
                                            if (attExtrData.Count > 0)
                                            {
                                                foreach (var a in attExtrData)
                                                {
                                                    AppEntityExtraDataDto ext = new AppEntityExtraDataDto();
                                                    ext.EntityObjectTypeCode = a.Name;
                                                    ext.AttributeId = a.AttributeId;
                                                    if (extrData.FirstOrDefault(v => v.AttributeId == a.AttributeId) == null)
                                                        extrData.Add(ext);

                                                }
                                            }
                                        }
                                    }
                                }

                            }
                        }
                        else
                        {
                            var productEntityObjectType = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(int.Parse(productTypeId.ToString()));
                            if (productEntityObjectType != null)
                            {
                                var serializer = new XmlSerializer(typeof(ItemExtraAttributes));
                                var serializerProduct = new XmlSerializer(typeof(ItemExtraAttributes));

                                ItemExtraAttributes productExtraAttributes = null;
                                using (TextReader reader = new StringReader(productEntityObjectType.SycEntityObjectType.ExtraAttributes))
                                {
                                    productExtraAttributes = (ItemExtraAttributes)serializer.Deserialize(reader);
                                    if (productExtraAttributes.ExtraAttributes.Count > 0 && !string.IsNullOrEmpty(attr.EntityObjectTypeCode))
                                    {
                                        var attExtrData = productExtraAttributes.ExtraAttributes.Where(z => z.Name.ToLower().Contains(attr.EntityObjectTypeCode.ToLower())).ToList();
                                        if (attExtrData.Count > 0)
                                        {
                                            foreach (var a in attExtrData)
                                            {
                                                AppEntityExtraDataDto ext = new AppEntityExtraDataDto();
                                                ext.EntityObjectTypeCode = a.Name;
                                                ext.AttributeId = a.AttributeId;
                                                if (extrData.FirstOrDefault(v => v.AttributeId == a.AttributeId) == null)
                                                    extrData.Add(ext);

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    variation.EntityExtraData = extrData;
                    //xx
                    variation.Code = productCodeMask;
                    foreach (var seg in segments)
                    {
                        string field = seg.Key;
                        var regFld = variation.GetType().GetProperty(field);
                        if (regFld != null)
                        {
                            var valFld = regFld.GetValue(variation).ToString();
                            if (valFld != null)
                            {
                                variation.Code += _helper.StringMask(seg.Value, valFld);  //"";//Mask(valFld, 0, seg.Value);
                            }
                        }
                        else
                        {
                            var ExtraFld = variation.EntityExtraData.FirstOrDefault(a => a.EntityObjectTypeCode == field);
                            if (ExtraFld != null)
                            {
                                var valFld = ExtraFld.AttributeCode.ToString();
                                if (valFld != null)
                                {
                                    variation.Code += _helper.StringMask(seg.Value, valFld);//  "";// Mask();
                                }
                            }
                        }
                    }
                }
            }

            return variationsList;
        }

        //MMT30[ENd]
        //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[Start]
        private string GetClassName(long classId)
        {
            string returnName = "";
            var classFiltered = _sycEntityObjectClassificationRepository.GetAll().Include(a => a.ParentFk).FirstOrDefault(a => a.Id == classId);
            if (classFiltered != null)
            {
                if (classFiltered.ParentId != null)
                {
                    returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + GetClassName(long.Parse(classFiltered.ParentId.ToString()));
                }
                //else
                returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + classFiltered.Name;
            }
            return returnName;

        }
        public async Task<PagedResultDto<AppEntityCategoryDto>> GetAppItemCategoriesFullNamesWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
                }
                if (input.ItemEntityId != 0)
                {
                    // List<string> returnName = new List<string>();
                    var returnRes = await _appEntitiesAppService.GetAppEntityCategoriesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                    {
                        foreach (var cat in returnRes.Items)
                        {
                            cat.EntityObjectCategoryName = GetDepartmentName(cat.EntityObjectCategoryId);
                        }
                    }
                    return returnRes;
                }
                return new PagedResultDto<AppEntityCategoryDto>();
            }
        }
        private async Task<PagedResultDto<AppEntityClassificationDto>> GetAppItemClassificationsFullNamesWithPaging(GetAppItemAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.ItemEntityId == 0 && input.ItemId != 0)
                {
                    var appItem = await _appItemRepository.GetAll().Where(r => r.Id == input.ItemId)
                    .AsNoTracking().FirstOrDefaultAsync();
                    input.ItemEntityId = appItem.EntityId;
                }
                if (input.ItemEntityId != 0)
                {
                    //return await _appEntitiesAppService.GetAppEntityClassificationsNamesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                    var returnRes = await _appEntitiesAppService.GetAppEntityClassificationsWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                    if (returnRes != null && returnRes.Items.Count > 0)
                    {
                        foreach (var clss in returnRes.Items)
                        {
                            clss.EntityObjectClassificationName = GetClassName(clss.EntityObjectClassificationId);
                        }
                    }
                    return returnRes;
                }
                return new PagedResultDto<AppEntityClassificationDto>();
            }
        }
        //T-SII-20231206.0003,1 MMT 02/05/2024 Product View and Edit does not display classification and categories correctly[End]
    }
    //MMT
    public sealed class AppItemExcelDtoProfile : Profile
    {

        public AppItemExcelDtoProfile(List<ExtraAttribute> extraAttributes)
        {
            IMappingExpression<DataRow, AppItemExcelDto> mappingExpression;

            mappingExpression = CreateMap<DataRow, AppItemExcelDto>();
            mappingExpression.ForMember(dest => dest.Id, act => act.MapFrom(src => 0));
            mappingExpression.ForMember(dest => dest.ProductType, act => act.MapFrom(src => src["ProductType"].ToString()));
            mappingExpression.ForMember(dest => dest.RecordType, act => act.MapFrom(src => src["RecordType"].ToString()));
            mappingExpression.ForMember(dest => dest.ParentCode, act => act.MapFrom(src => src["ParentCode"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.ParentId, act => act.MapFrom(src => 0));
            mappingExpression.ForMember(dest => dest.Code, act => act.MapFrom(src => src["Code"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.Name, act => act.MapFrom(src => src["Name"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductDescription, act => act.MapFrom(src => src["ProductDescription"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductClassificationCode, act => act.MapFrom(src => src["ProductClassificationCode"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductClassificationDescription, act => act.MapFrom(src => src["ProductClassificationDescription"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductCategoryCode, act => act.MapFrom(src => src["ProductCategoryCode"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductCategoryDescription, act => act.MapFrom(src => src["ProductCategoryDescription"].ToString()));
            mappingExpression.ForMember(dest => dest.Price, act => act.MapFrom(src => src["Price"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.Currency, act => act.MapFrom(src => src["PriceCurrencyCode"].ToString()));
            mappingExpression.ForMember(dest => dest.ImageType, act => act.MapFrom(src => src["ImageType"].ToString()));
            mappingExpression.ForMember(dest => dest.ImageFolderName, act => act.MapFrom(src => src["ImageFolderName"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeScaleName, act => act.MapFrom(src => src["SizeScaleName"].ToString()));
            //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
            //mappingExpression.ForMember(dest => dest.ScaleSizesOrder, act => act.MapFrom(src => src["ScaleSizesOrder"].ToString()));
            //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
            mappingExpression.ForMember(dest => dest.SizeRatioName, act => act.MapFrom(src => src["SizeRatioName"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeRatioValue, act => act.MapFrom(src => src["SizeRatioValue"].ToString()));
            mappingExpression.ForMember(dest => dest.ExtraAttributes, opt => opt.MapFrom<List<ExtraAttribute>>(src => extraAttributes));

            mappingExpression.ForMember(dest => dest.ParentId, act => act.MapFrom(src => 0));
            //mappingExpression.ForMember(dest => dest.ExtraAttributesValues, opt => opt.MapFrom<List<AppItemImpExtrAttributes>>(src => extraAttributes));
            mappingExpression.ForMember(dest => dest.ExtraAttributesValues, opt => opt.MapFrom(new BmiValueResolver()));
            //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
            mappingExpression.ForMember(dest => dest.NoOfDim, act => act.MapFrom(src => src["NoOfDimensions"].ToString()));
            mappingExpression.ForMember(dest => dest.D1Name, act => act.MapFrom(src => src["Dimension1Name"].ToString()));
            mappingExpression.ForMember(dest => dest.D2Name, act => act.MapFrom(src => src["Dimension2Name"].ToString()));
            mappingExpression.ForMember(dest => dest.D3Name, act => act.MapFrom(src => src["Dimension3Name"].ToString()));
            mappingExpression.ForMember(dest => dest.D1Sizes, act => act.MapFrom(src => src["Dimension1Sizes"].ToString()));
            mappingExpression.ForMember(dest => dest.D2Sizes, act => act.MapFrom(src => src["Dimension2Sizes"].ToString()));
            mappingExpression.ForMember(dest => dest.D3Sizes, act => act.MapFrom(src => src["Dimension3Sizes"].ToString()));
            mappingExpression.ForMember(dest => dest.D1Pos, act => act.MapFrom(src => src["Dimension1Position"].ToString()));
            mappingExpression.ForMember(dest => dest.D2Pos, act => act.MapFrom(src => src["Dimension2Position"].ToString()));
            mappingExpression.ForMember(dest => dest.D3Pos, act => act.MapFrom(src => src["Dimension3Position"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeCode, act => act.MapFrom(src => src["SIZEcode"].ToString()));
            //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]

            //if (extraAttributes != null && extraAttributes.Count > 0)
            //{
            //    //mappingExpression.ForMember(dest => dest.ExtraAttributes, act => act.co


            //    if (extraAttributes[0] != null)
            //        mappingExpression.ForMember(dest => dest.ExtraAttributes,
            //            act => act.MapFrom(src => new List<AppItemImpExtrAttributes>(extraAttributes.Count)));
            //    //for (int ext = 0; ext < extraAttributes.Count; ext++)
            //    int ext = 0;
            //    foreach (var extra in extraAttributes)
            //    {

            //        if (extra != null)
            //        {


            //            mappingExpression.ForMember<AppItemImpExtrAttributes>(dest => dest.ExtraAttributes.ElementAt<AppItemImpExtrAttributes>(ext),
            //                act => act.MapFrom(src => new AppItemImpExtrAttributes
            //            {
            //                Name = extra.Name.ToString(),
            //                Code = src[extra.Name + "Code"].ToString(),
            //                Value = src[extra.Name + "Name"].ToString()
            //            }));
            //            //mappingExpression.ForMember(dest => dest.ExtraAttributes.ElementAt<AppItemImpExtrAttributes>(ext).Name, act => act.MapFrom(src => extra.Name.ToString()));
            //            //mappingExpression.ForMember(dest => dest.ExtraAttributes.ElementAt<AppItemImpExtrAttributes>(ext).Code, act => act.MapFrom(src => src[extra.Name + "Code"].ToString()));
            //            //mappingExpression.ForMember(dest => dest.ExtraAttributes.ElementAt<AppItemImpExtrAttributes>(ext).Value, act => act.MapFrom(src => src[extra.Name + "Name"].ToString()));
            //            ext += 1;
            //        }
            //    }
            //return (new List<AppItemImpExtrAttributes>(extraAttributes.Count)); ));

        }

    }
    public class BmiValueResolver : IValueResolver<DataRow, AppItemExcelDto, List<AppItemImpExtrAttributes>>
    {
        public List<AppItemImpExtrAttributes> Resolve(DataRow source, AppItemExcelDto destination,
            List<AppItemImpExtrAttributes> destMember, ResolutionContext context)
        {
            List<AppItemImpExtrAttributes> returnList = new List<AppItemImpExtrAttributes>();
            if (destination.ExtraAttributes != null && destination.ExtraAttributes.Count > 0)
            {
                //mappingExpression.ForMember(dest => dest.ExtraAttributes, act => act.co


                if (destination.ExtraAttributes[0] != null)
                {

                    foreach (var extra in destination.ExtraAttributes)
                    {

                        if (extra != null)
                        {
                            returnList.Add(new AppItemImpExtrAttributes
                            {
                                Name = extra.Name.ToString(),
                                Code = extra.IsLookup ? source[extra.Name.Replace(" ", "") + "Code"].ToString() : source[extra.Name.Replace(" ", "")].ToString(),
                                Value = extra.IsLookup ? source[extra.Name.Replace(" ", "") + "Name"].ToString() : source[extra.Name.Replace(" ", "")].ToString()
                            });

                        }
                    }

                }

            }
            return returnList;
        }
    }

    // MMT
}