using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Auditing;
using Abp.BackgroundJobs;
using Abp.Collections.Extensions;
using Abp.Configuration.Startup;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Abp.Linq.Extensions;
using Abp.Timing;
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
using System.Transactions;
using System.Xml.Serialization;
using ExtraAttribute = onetouch.AppItems.Dtos.ExtraAttribute;
using onetouch.AppMarketplaceItems;
using Z.EntityFramework.Plus;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using onetouch.AppMarketplaceItemLists;
using onetouch.Attachments;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Org.BouncyCastle.Utilities.Encoders;
using onetouch.AppSiiwiiTransaction;
using NPOI.HPSF;
using NPOI.POIFS.NIO;
using System.Dynamic;
using NPOI.OpenXmlFormats.Vml;
using onetouch.AppSubScriptionPlan;
using FluentValidation;
using Stripe;
using Castle.Core.Resource;
using onetouch.EntityFrameworkCore.Repositories;
using onetouch.Onetouch.ValidationRules;
using System.Reflection;
using MimeKit.Tnef;
using Z.Expressions;
using onetouch.Migrations;
using Newtonsoft.Json;
using System.Drawing;
using System.Diagnostics;
using DocumentFormat.OpenXml.Office2010.ExcelAc;
using onetouch.MultiTenancy;
using Org.BouncyCastle.Crypto.Agreement.JPake;

namespace onetouch.AppItems
{
    [AbpAuthorize(AppPermissions.Pages_AppItems)]
    public partial class AppItemsAppService : onetouchAppServiceBase, IAppItemsAppService, IAppItemsAppImportService, IExcelImporter<AppItemExcelResultsDTO>
    {
        //i46[Start]
        public static IUnitOfWorkManager _unitOfWorkManagerValid;
        //I46[End]
        private readonly IRepository<AppItemsListDetail, long> _appItemsListDetailRepository;
        private readonly IRepository<AppItem, long> _appItemRepository;
        private readonly IAppItemsExcelExporter _appItemsExcelExporter;
        private readonly AppEntitiesAppService _appEntitiesAppService;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppEntitiesRelationship, long> _appEntitiesRelationship;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategoryRepository;
        private readonly IRepository<SycEntityObjectClassification, long> _sycEntityObjectClassificationRepository;
        private readonly IRepository<AppEntityCategory, long> _appEntityCategoryRepository;
        private readonly IRepository<AppEntityClassification, long> _appEntityClassificationRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppItemSharing, long> _appItemSharingRepository;
        private readonly IAppNotifier _appNotifier;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IRepository<AppAttachment, long> _appAttachmentRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectTypeRepository;
        private readonly IRepository<AppEntityAttachment, long> _appEntityAttachmentRepository;
        private readonly ISycEntityObjectClassificationsAppService _sycEntityObjectClassificationsAppService;
        private readonly SycEntityObjectCategoriesAppService _sycEntityObjectCategoriesAppService;
        private readonly ISycAttachmentCategoriesAppService _sSycAttachmentCategoriesAppService;
        private readonly IRepository<AppItemPrices, long> _appItemPricesRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<AppItemSizeScalesHeader, long> _appItemSizeScalesHeaderRepository;
        private readonly IRepository<AppItemSizeScalesDetails, long> _appItemSizeScalesDetailRepository;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        private readonly AppSizeScaleAppService _appSizeScaleAppService;
        private readonly IRepository<AppSizeScalesHeader, long> _appSizeScalesHeaderRepository;
        private readonly IRepository<AppMarketplaceItemSharings, long> _appMarketplaceItemSharing;
        private readonly IRepository<AppMarketplaceItems.AppMarketplaceItems, long> _appMarketplaceItem;
        private readonly IRepository<AppMarketplaceItemPrices, long> _appMarketplaceItemPricesRepository;
        TimeZoneInfoAppService _timeZoneInfoAppService;
        private readonly IRepository<AppTransactionDetails, long> _appTransactionDetails;
        private readonly IRepository<AppItemSelector, long> _appItemSelectorRepository;
        private readonly Helper _helper;
        SycEntityObjectTypesAppService _SycEntityObjectTypesAppService;
        private readonly IRepository<SydObject, long> _syObjectRepository;
        private readonly IRepository<SycSegmentIdentifierDefinition, long> _sycSegmentIdentifierDefinition;
        private readonly IRepository<SycCounter, long> _sycCounter;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategory;
        private readonly IRepository<AppMarketplaceItemsListDetails, long> _appMarketplaceItemsListDetails;

        private readonly IAppTenantActivitiesLogAppService _appTenantActivitiesLogAppService;
        private readonly IRepository<ValidationRule> _validationRuleRepo;
        private readonly IBackgroundJobManager _backgroundJobManager;
        private readonly IAbpStartupConfiguration _abpStartupConfiguration;
        private static readonly object ImportEntityHistoryIgnoredTypesLock = new object();
        private static readonly HashSet<Type> ImportEntityHistoryTypesAddedByScope = new HashSet<Type>();
        private static int ImportEntityHistorySuppressionCount;
        public AppItemsAppService(
            IRepository<AppItem, long> appItemRepository,
            IAppItemsExcelExporter appItemsExcelExporter, AppEntitiesAppService appEntitiesAppService, Helper helper, IRepository<AppEntity, long> appEntityRepository, SycEntityObjectTypesAppService sycEntityObjectTypesAppService
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
            IRepository<SycEntityObjectType, long> sycEntityObjectTypeRepository, IRepository<AppAttachment, long> appAttachmentRepository, TimeZoneInfoAppService timeZoneInfoAppService,
            IRepository<AppTransactionDetails, long> appTransactionDetails, IAppTenantActivitiesLogAppService appTenantActivitiesLogAppService,
             IRepository<AppMarketplaceItemsListDetails, long> appMarketplaceItemsListDetails, IRepository<ValidationRule> validationRuleRepo,
             IRepository<AppEntitiesRelationship, long> appEntitiesRelationship,
             IBackgroundJobManager backgroundJobManager,
             IAbpStartupConfiguration abpStartupConfiguration,
             IRepository<AppContact, long> appContactRepository
            )
        {
            _backgroundJobManager = backgroundJobManager;
            _abpStartupConfiguration = abpStartupConfiguration;
            _appEntitiesRelationship = appEntitiesRelationship;
            _appTenantActivitiesLogAppService = appTenantActivitiesLogAppService;
            _appMarketplaceItemsListDetails = appMarketplaceItemsListDetails;
            _appTransactionDetails = appTransactionDetails;
            _timeZoneInfoAppService = timeZoneInfoAppService;
            _appAttachmentRepository = appAttachmentRepository;
            _sycEntityObjectTypeRepository = sycEntityObjectTypeRepository;
            _appEntityAttachmentRepository = appEntityAttachment;
            _appMarketplaceItem = appMarketplaceItem;
            _appMarketplaceItemSharing = appMarketplaceItemSharing;
            _appMarketplaceItemPricesRepository = appMarketplaceItemPricesRepository;
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
            _appSizeScalesHeaderRepository = appSizeScalesHeaderRepository;
            _appSizeScaleAppService = appSizeScaleAppService;
            _appItemPricesRepository = appItemPricesRepository;
            _appContactRepository = appContactRepository;
            _sycEntityObjectClassificationsAppService = sycEntityObjectClassificationsAppService;
            _sycEntityObjectCategoriesAppService = sycEntityObjectCategoriesAppService;
            _sSycAttachmentCategoriesAppService = sSycAttachmentCategoriesAppService;
            _iAppSycIdentifierDefinitionsService = sycIdentifierDefinitionsAppService;
            _appItemSizeScalesHeaderRepository = appItemSizeScalesHeaderRepository;
            _appItemSizeScalesDetailRepository = appItemSizeScalesDetailRepository;
            _sycSegmentIdentifierDefinition = sycSegmentIdentifierDefinition;
            _appItemSelectorRepository = appItemSelectorRepository;
            _sycEntityObjectCategory = sycEntityObjectCategory;
            _validationRuleRepo = validationRuleRepo;

        }
        private async Task<List<long>> LoadDepartmentChildern(long deptId)
        {

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                List<long> listDept = new List<long>();
                var depts = await _sycEntityObjectCategoryRepository.GetAll().Where(z => z.ParentId == deptId && (z.TenantId == null || z.TenantId == AbpSession.TenantId)).Select(z => z.Id).ToListAsync();
                if (depts != null && depts.Count() > 0)
                {
                    listDept.AddRange(depts);
                    foreach (var d in depts)
                    {
                        var children = await LoadDepartmentChildern(d);
                        if (children != null && children.Count() > 0)
                        {
                            listDept.AddRange(children);

                        }
                    }
                }

                return listDept;
            }
        }
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
                    AppItemListDetails = await _appItemsListDetailRepository.GetAll()
                        .Where(x => x.ItemsListId == input.AppItemListId)
                        .Select(x => x.ItemId)
                        .ToListAsync();
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
                if (!string.IsNullOrWhiteSpace(input.Filter))
                    input.Filter = input.Filter.TrimEnd().TrimStart();
                var depts = input.departmentFilters.ToList();
                if (input.departmentFilters != null && input.departmentFilters.Count() > 0)
                {
                    List<long> listDept = new List<long>();
                    foreach (var dept in input.departmentFilters)
                    {
                        var children = await LoadDepartmentChildern(dept);
                        if (children != null && children.Count > 0)
                        {
                            listDept.AddRange(children);
                        }
                    }
                    foreach (var d in listDept)
                        depts.AddIfNotContains(d);
                }
                var allCategories = input.CategoryFilters.ToList();
                allCategories.AddRange(depts.ToList());
                input.CategoryFilters = allCategories.ToArray();
                #endregion merge categories and departments
                List<long> SelectedItems = new List<long>();
                if (input.SelectorKey != null)
                {
                    SelectedItems = await _appItemSelectorRepository.GetAll()
                        .Where(e => e.Key == input.SelectorKey)
                        .Select(e => e.SelectedId)
                        .ToListAsync();
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
                var attrs = input.ArrtibuteFilters.Select(r => r.ArrtibuteValueId).Distinct().ToList();
                #endregion
                var filteredAppItems = _appItemRepository.GetAll().AsNoTracking().Include(z => z.EntityFk).ThenInclude(z => z.EntityCategories).ThenInclude(z => z.EntityObjectCategoryFk)
                    .Include(z => z.EntityFk).ThenInclude(z => z.EntityClassifications).ThenInclude(z => z.EntityObjectClassificationFk)
                    //P-SII-20240425.0003,1 MMT 05/07/2024 - My Product page - product card margins and product price is 0[Start]
                    .Include(z => z.ItemPricesFkList.Where(z => z.Code == "MSRP" && z.IsDefault))
                    //P-SII-20240425.0003,1 MMT 05/07/2024 - My Product page - product card margins and product price is 0[End]
                    .Include(x => x.ItemSizeScaleHeadersFkList)
                    .AsSplitQuery()
                    .Select(x => new
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
                        x.ItemSizeScaleHeadersFkList,
                        x.ManufacturerCode,
                        //P-SII-20240425.0003,1 MMT 05/07/2024 - My Product page - product card margins and product price is 0[Start]
                        x.ItemPricesFkList
                        //P-SII-20240425.0003,1 MMT 05/07/2024 - My Product page - product card margins and product price is 0[End]

                    })
                .WhereIf(input.ArrtibuteFilters != null && input.ArrtibuteFilters.Count() > 0,
                e =>
                (e.EntityFk.EntityExtraData != null && e.EntityFk.EntityExtraData.Any(r => attrs.Contains(((long)r.AttributeValueId))))
                ||
                (e.ParentFkList != null &&
                e.ParentFkList.Any(x1 => x1.EntityFk.EntityExtraData.Any(x2 => attrs.Contains((long)x2.AttributeValueId))))
                )
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                .WhereIf(input.FilterType == ItemsFilterTypesEnum.MyItems || input.FilterType == ItemsFilterTypesEnum.MyListing, a => a.TenantId == AbpSession.TenantId)
                .WhereIf(input.FilterType == ItemsFilterTypesEnum.MyOwnedItems, a => a.TenantId == AbpSession.TenantId && a.TenantOwner == AbpSession.TenantId)
                .WhereIf(input.FilterType == ItemsFilterTypesEnum.MyPatrnersItems, a => a.TenantId == AbpSession.TenantId && a.TenantOwner != AbpSession.TenantId)
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                //xx
                .WhereIf(input.ScalesFilters != null && input.ScalesFilters.Count() > 0, a => a.ItemSizeScaleHeadersFkList.Any(r => allScales.Contains(r.Name.TrimEnd())))
                //xx
                .WhereIf(input.AppItemListId != null && input.AppItemListId > 0, e => AppItemListDetails.Contains(e.Id))
                .WhereIf(input.SelectorOnly == true && SelectedItems != null && SelectedItems.Count() > 0, e => SelectedItems.Contains(e.Id))
                .WhereIf(input.EntityObjectTypeId > 0, e => e.EntityFk.EntityObjectTypeId == input.EntityObjectTypeId)
                .WhereIf(input.CategoryFilters != null && input.CategoryFilters.Count() > 0, e => e.EntityFk.EntityCategories.Any(r => allCategories.Contains(r.EntityObjectCategoryId)))
                .WhereIf(input.ClassificationFilters != null && input.ClassificationFilters.Count() > 0, e => e.EntityFk.EntityClassifications.Any(r => input.ClassificationFilters.Contains(r.EntityObjectClassificationId)))
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter))
                    //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                    //D-SII-20230918.0001,1 MMT 09/19/2023 Display Items only and exclude listing[T-SII-20230829.0001][Start]
                    .Where(x => x.ParentId == null && x.TenantId == AbpSession.TenantId && x.ItemType == 0);
                //D-SII-20230918.0001,1 MMT 09/19/2023 Display Items only and exclude listing[T-SII-20230829.0001][End]
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[END]


                var filteredOrderedAppItems = filteredAppItems.OrderBy(input.Sorting ?? "id asc");

                IQueryable<GetAppItemForViewDto> appItems = null;
                var marketplaceItems = _appMarketplaceItem.GetAll()
                    .AsNoTracking()
                    .Where(a => a.TenantOwner == AbpSession.TenantId);

                if (input.PublishStatus == 0)
                {
                    appItems = from d in filteredOrderedAppItems
                               select new GetAppItemForViewDto()
                               {
                                   AppItem = new AppItemDto
                                   {
                                       ManufacturerCode = (d.ManufacturerCode == null && (d.TenantOwner == AbpSession.TenantId || d.TenantOwner == null || d.TenantOwner == 0) ? d.Code : d.ManufacturerCode),
                                       Code = d.Code,
                                       Name = d.Name,
                                       Description = d.EntityFk.Notes,
                                       Price = d.ItemPricesFkList.Where(z => z.Code == "MSRP" && z.IsDefault).Select(z => (decimal?)z.Price).FirstOrDefault() ?? d.Price,
                                       //P-SII-20240425.0003,1 MMT 05/07/2024 - My Product page - product card margins and product price is 0[End]
                                       Id = d.Id,

                                       SSIN = d.SSIN,
                                       SharingLevel = d.SharingLevel == 0 ? null : d.SharingLevel.ToString(),

                                       Listed = d.ListingItemFkList.Any(),
                                       ImageUrl = (d.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                   (d.EntityFk.EntityAttachments.FirstOrDefault() == null ? "attachments/" + d.TenantId + "/" + d.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                   : "attachments/" + (d.TenantId.HasValue ? d.TenantId : -1) + "/" + d.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                   },
                                   Selected = (input.SelectorKey != null && SelectedItems != null && SelectedItems.Count > 0 && SelectedItems.Contains(d.Id)) ? true : false,
                                   EntityObjectCategoryNames = d.EntityFk.EntityCategories.Where(z => z.EntityObjectCategoryFk.TenantId != null).Select(z => z.EntityObjectCategoryFk.Name).ToList(),
                                   EntityClassificationNames = d.EntityFk.EntityClassifications.Select(z => z.EntityObjectClassificationFk.Name).ToList(),


                               };
                }
                else
                {
                    if (input.PublishStatus != 3) //(input.SharingLevel != "N")
                    {
                        var joined = filteredOrderedAppItems
                            .WhereIf(input.PublishStatus == 1, a => a.SharingLevel == 1)
                            .WhereIf(input.PublishStatus == 2, a => a.SharingLevel == 2)
                            .WhereIf(input.PublishStatus == 4, a => a.SharingLevel == 4)
                            .Select(s => new { item = s });
                        appItems = from o in joined
                                   select new GetAppItemForViewDto()
                                   {
                                       AppItem = new AppItemDto
                                       {
                                           Code = o.item.Code,
                                           Name = o.item.Name,
                                           Description = o.item.EntityFk.Notes,
                                           Price = o.item.ItemPricesFkList.Where(z => z.Code == "MSRP" && z.IsDefault).Select(z => (decimal?)z.Price).FirstOrDefault() ?? o.item.Price,
                                           //P-SII-20240425.0003,1 MMT 05/07/2024 - My Product page - product card margins and product price is 0[End]
                                           Id = o.item.Id,
                                           ManufacturerCode = (o.item.ManufacturerCode == null && (o.item.TenantOwner == AbpSession.TenantId || o.item.TenantOwner == null || o.item.TenantOwner == 0) ? o.item.Code : o.item.ManufacturerCode),
                                           SSIN = o.item.SSIN,
                                           SharingLevel = o.item.SharingLevel == 0 ? null : o.item.SharingLevel.ToString(),
                                           //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                                           Listed = o.item.ListingItemFkList.Any(),
                                           Published = o.item.PublishedListingItemFkList.Any(),
                                           ImageUrl = (o.item.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                            (o.item.EntityFk.EntityAttachments.FirstOrDefault() == null ? "attachments/" + o.item.TenantId + "/" + o.item.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                            : "attachments/" + (o.item.TenantId.HasValue ? o.item.TenantId : -1) + "/" + o.item.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                       },
                                       Selected = (input.SelectorKey != null && SelectedItems != null && SelectedItems.Count > 0 && SelectedItems.Contains(o.item.Id)) ? true : false,
                                       EntityObjectCategoryNames = o.item.EntityFk.EntityCategories.Where(z => z.EntityObjectCategoryFk.TenantId != null).Select(z => z.EntityObjectCategoryFk.Name).ToList(),
                                       EntityClassificationNames = o.item.EntityFk.EntityClassifications.Select(z => z.EntityObjectClassificationFk.Name).ToList()
                                   };
                    }
                    else
                    {
                        appItems = from d in filteredOrderedAppItems.Where(z => z.SharingLevel == 0 || z.SharingLevel == 3)
                                   select new GetAppItemForViewDto()
                                   {
                                       AppItem = new AppItemDto
                                       {

                                           Code = d.Code,
                                           Name = d.Name,
                                           Description = d.EntityFk.Notes,
                                           ManufacturerCode = (d.ManufacturerCode == null && (d.TenantOwner == AbpSession.TenantId || d.TenantOwner == 0 || d.TenantOwner == null) ? d.Code : d.ManufacturerCode),
                                           Price = d.ItemPricesFkList.Where(z => z.Code == "MSRP" && z.IsDefault).Select(z => (decimal?)z.Price).FirstOrDefault() ?? d.Price,
                                           //P-SII-20240425.0003,1 MMT 05/07/2024 - My Product page - product card margins and product price is 0[End]
                                           Id = d.Id,
                                           //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                                           SSIN = d.SSIN,
                                           SharingLevel = d.SharingLevel == 0 ? null : d.SharingLevel.ToString(),
                                           //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                                           Listed = d.ListingItemFkList.Any(),
                                           ImageUrl = (d.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                       (d.EntityFk.EntityAttachments.FirstOrDefault() == null ? "attachments/" + d.TenantId + "/" + d.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                       : "attachments/" + (d.TenantId.HasValue ? d.TenantId : -1) + "/" + d.EntityFk.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                       },
                                       Selected = (input.SelectorKey != null && SelectedItems != null && SelectedItems.Count > 0 && SelectedItems.Contains(d.Id)) ? true : false,
                                       EntityObjectCategoryNames = d.EntityFk.EntityCategories.Where(z => z.EntityObjectCategoryFk.TenantId != null).Select(z => z.EntityObjectCategoryFk.Name).ToList(),
                                       EntityClassificationNames = d.EntityFk.EntityClassifications.Select(z => z.EntityObjectClassificationFk.Name).ToList()
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


        public async Task<PagedResultDto<LookupLabelDto>> GetSecondAttributeValues(ExtraDataSecondAttributeValuesInput input)
        {
            //get all child items
            // get all entity ids for that first attribute id, value
            // get all values for entity ids for second attribute
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
                    var filteredItems = appItems.Where(x => x.EntityFk.EntityExtraData
                        .Any(z => z.AttributeId == attributeId
                                  && !string.IsNullOrEmpty(z.AttributeValue)
                                  && !string.IsNullOrEmpty(attributeCode)
                                  && string.Equals(z.AttributeValue, attributeCode, StringComparison.OrdinalIgnoreCase)))
                        .ToList();
                    foreach (var item in filteredItems)
                    {
                        var extraAttributes = item.EntityFk.EntityExtraData.Where(z => (item.EntityFk.EntityExtraData.Count() > 1 ? z.AttributeId != attributeId : z.AttributeId == attributeId) && z.AttributeValue != null).ToList();
                        if (extraAttributes != null && extraAttributes.Count > 0)
                        {
                            foreach (var extr in extraAttributes)
                            {
                                if (extr.AttributeValue == null || extr.AttributeCode == null)
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
                    var zz = xx.AppItemSizeScalesDetails.OrderBy(s => Convert.ToInt32(s.D1Position))
                        .OrderBy(s => Convert.ToInt32(s.D2Position)).OrderBy(s => Convert.ToInt32(s.D3Position)).Select(a => a.SizeCode).ToList();
                    var ss = appItemAttributePriceDto;
                    foreach (var t in zz)
                    {
                        if (ss.FirstOrDefault(z => z.AttributeValue == t || z.AttibuteCode == t) != null)
                            appRetItemAttributePriceDto.Add(ss.FirstOrDefault(z => z.AttributeValue == t || z.AttibuteCode == t));
                    }
                    return appRetItemAttributePriceDto;

                }
                //End
                return appItemAttributePriceDto;
            }
        }

        [AbpAllowAnonymous]
        public async Task<Byte[]> GetFile64FromUrl(string Url)
        {
            Byte[] returnList = new Byte[1];
            Uri uri = new Uri(Url);
            Url = uri.AbsolutePath;
            Url = _appConfiguration[$"Attachment:Omitt"] + @"\" + Url;
            if (System.IO.File.Exists(Url))
            {
                returnList = System.IO.File.ReadAllBytes(Url);
            }
            return returnList;
        }
        public async Task<GetAppItemDetailForViewDto> GetAppItemForView(GetAppItemWithPagedAttributesForViewInput input)
        {
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
                //XX
                var allItems = await _appItemRepository.GetAll()
               .Include(x => x.ItemPricesFkList).ThenInclude(x => x.CurrencyFk).ThenInclude(x => x.EntityExtraData)
               .Include(x => x.ItemSizeScaleHeadersFkList).ThenInclude(x => x.AppItemSizeScalesDetails)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectTypeFk)
               .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
               .Include(x => x.EntityFk).ThenInclude(z => z.EntityCategories).ThenInclude(z => z.EntityObjectCategoryFk)
               .Include(x => x.EntityFk).ThenInclude(z => z.EntityClassifications).ThenInclude(z => z.EntityObjectClassificationFk)
               .AsNoTracking()
               .AsSplitQuery()
               .Where(x => x.Id == input.ItemId || x.ParentId == input.ItemId).ToListAsync();
                //XX
                var appItem = allItems.Where(z => z.Id == input.ItemId).FirstOrDefault();
                var varAppItems = allItems.Where(z => z.ParentId == input.ItemId).ToList();


                if (appItem == null)
                {
                    throw new EntityNotFoundException(typeof(AppItem), input.ItemId);
                }

                if (appItem.EntityFk != null && appItem.EntityFk.EntitiesRelationships == null)
                {
                    appItem.EntityFk.EntitiesRelationships = new List<AppEntitiesRelationship>();
                }

                appItem.ParentFkList = varAppItems;
                var output = new GetAppItemDetailForViewDto { AppItem = ObjectMapper.Map<AppItemForViewDto>(appItem) };
                if (appItem.ManufacturerCode == null && (appItem.TenantOwner == AbpSession.TenantId || appItem.TenantOwner == null || appItem.TenantOwner == 0))
                {
                    output.AppItem.ManufacturerCode = appItem.Code;
                }
                //
                output.AppItem.AppItemSizesScaleInfo
                    .ForEach(a => a.AppSizeScalesDetails = a.AppSizeScalesDetails.OrderBy(d => Convert.ToInt32(d.D1Position))
                    .OrderBy(d => Convert.ToInt32(d.D2Position)).OrderBy(d => Convert.ToInt32(d.D3Position)).ToList());
                //
                if (appItem != null)
                {
                    string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                    output.AppItem.RelatedAppItems = await GetAppItemRelatedProductsWithPaging(new GetAllSycEntityObjectCategoriesInput() { EntityId = appItem.EntityId, SkipCount = input.GetAppItemAttributesInputForRelatedItems.SkipCount, MaxResultCount = input.GetAppItemAttributesInputForRelatedItems.MaxResultCount, Sorting = input.GetAppItemAttributesInputForRelatedItems.Sorting });

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
                    output.AppItem.ShowSync = false;
                    var marketplaceItem = await _appMarketplaceItem.GetAll().Where(a => a.Code == appItem.SSIN || (a.ManufacturerCode == appItem.Code && a.TenantOwner == appItem.TenantId)).FirstOrDefaultAsync();
                    if (marketplaceItem != null && marketplaceItem.TimeStamp < appItem.EntityFk.TimeStamp)
                    {
                        output.AppItem.ShowSync = true;
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
                        var sharedUsers = marketplaceItem == null ? new List<AppMarketplaceItemSharings>() : await _appMarketplaceItemSharing.GetAll().Where(a => a.AppMarketplaceItemId == marketplaceItem.Id).ToListAsync();
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
                    if (varAppItems.Select(r => r.StockAvailability).Sum() >= 0)
                    // T-SII-20230511.0001,1 MMT 05/14/2023-Wrong total product available quantities in product view mode[End]
                    {
                        output.AppItem.StockAvailability = varAppItems.Select(r => r.StockAvailability).Sum();
                    }

                    var EntityExtraDataList = output.AppItem.EntityExtraData;
                    output.AppItem.Recommended = new List<ExtraDataAttrDto>();
                    output.AppItem.Additional = new List<ExtraDataAttrDto>();
                    output.AppItem.Charges = new List<ExtraDataAttrDto>();

                    if (input.GetAppItemAttributesInputForExtraData == null)
                        input.GetAppItemAttributesInputForExtraData = new GetAppItemExtraAttributesInput();

                    input.GetAppItemAttributesInputForExtraData.recommandedOrAdditional = RecommandedOrAdditional.RECOMMENDED;
                    input.GetAppItemAttributesInputForExtraData.ItemEntityId = output.AppItem.EntityId;
                    input.GetAppItemAttributesInputForExtraData.EntityObjectTypeId = appItem.EntityFk.EntityObjectTypeId;
                    output.AppItem.Recommended = (await GetAppItemExtraDataWithPaging(input.GetAppItemAttributesInputForExtraData)).Items.ToList();

                    input.GetAppItemAttributesInputForExtraData.recommandedOrAdditional = RecommandedOrAdditional.ADDITIONAL;
                    output.AppItem.Additional = (await GetAppItemExtraDataWithPaging(input.GetAppItemAttributesInputForExtraData)).Items.ToList();

                    input.GetAppItemAttributesInputForExtraData.recommandedOrAdditional = RecommandedOrAdditional.CHARGES;
                    output.AppItem.Charges = (await GetAppItemExtraDataWithPaging(input.GetAppItemAttributesInputForExtraData)).Items.ToList();


                    string variations = appItem.Variations;
                    output.AppItem.variations = new List<ExtraDataAttrDto>();
                    if (varAppItems.Count > 0)
                    {
                        string firstAttributeId = "";
                        var frstAttId = varAppItems.Select(x => x.EntityFk.EntityAttachments.Where(z => !string.IsNullOrEmpty(z.Attributes) && z.Attributes.Contains("=")).Select(a => a.Attributes)).FirstOrDefault();
                        if (frstAttId != null && frstAttId.Count() > 0)
                            firstAttributeId = frstAttId.FirstOrDefault().ToString().Split("=")[0];

                        var firstItem = varAppItems.FirstOrDefault();
                        var selectableExtraData = firstItem.EntityFk.EntityExtraData
                            .Where(x => !string.IsNullOrEmpty(x.EntityObjectTypeCode)
                                        && !string.IsNullOrEmpty(x.AttributeValue)
                                        && !string.IsNullOrEmpty(x.AttributeCode))
                            .GroupBy(x => x.AttributeId)
                            .Select(x => x.First())
                            .ToList();
                        if (selectableExtraData.Count == 0)
                        {
                            selectableExtraData = firstItem.EntityFk.EntityExtraData
                                .Where(x => !string.IsNullOrEmpty(x.EntityObjectTypeCode))
                                .GroupBy(x => x.AttributeId)
                                .Select(x => x.First())
                                .ToList();
                        }

                        AppEntityExtraData firstAttribute = null;
                        if (!string.IsNullOrEmpty(firstAttributeId) && long.TryParse(firstAttributeId, out var firstAttributeIdLongFromImage))
                        {
                            firstAttribute = selectableExtraData.FirstOrDefault(a => a.AttributeId == firstAttributeIdLongFromImage);
                        }
                        firstAttribute = firstAttribute
                                         ?? selectableExtraData.FirstOrDefault(a => a.EntityObjectTypeCode == "COLOR")
                                         ?? selectableExtraData.FirstOrDefault();

                        selectableExtraData = selectableExtraData
                            .Where(x => x.AttributeId == firstAttribute.AttributeId)
                            .Concat(selectableExtraData.Where(x => x.AttributeId != firstAttribute.AttributeId))
                            .ToList();

                        List<string> attributeValues = selectableExtraData.Select(x => x.EntityObjectTypeCode).Distinct().ToList();
                        List<string> attributeIDs = selectableExtraData.Select(x => x.AttributeId.ToString()).Distinct().ToList();
                        var firstAttributeID = firstAttribute.AttributeId.ToString();
                        var secondAttId = attributeIDs.FirstOrDefault(a => a != firstAttributeID.ToString());
                        var firstAttributeValue = firstAttribute.EntityObjectTypeCode.ToString();
                        var firstattributeValues = varAppItems.Select(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID))
                                                   .Select(z => z.AttributeValue)).Distinct().Select(a => a.FirstOrDefault()).Distinct().ToList();//.ToList().FirstOrDefault().Distinct().ToList();
                        int firstattributeValuesCount = firstattributeValues.Count();
                        var firstattributeDefaultImages1 = varAppItems.Select(x => x.EntityFk.EntityAttachments.Where(z => !string.IsNullOrEmpty(z.Attributes) && z.Attributes.Contains(firstAttributeID) & z.IsDefault).Select(z => new { z.AttachmentFk.Attachment, z.Attributes })).ToList().Distinct().ToList().Distinct().ToList();
                        var firstattributeDefaultImages = firstattributeDefaultImages1.Select(x => x.FirstOrDefault()).Distinct().ToList();
                        var secondAttributeValuesFor1st = new List<string>();
                        var firstattributeCodes = varAppItems.Select(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID))
                                                .Select(z => new { z.AttributeCode, z.AttributeValue, z.AttributeValueId })).Distinct().Select(a => a.FirstOrDefault()).Distinct().ToList();
                        var firstAttributeIdLong = long.Parse(firstAttributeID);
                        List<AppEntityExtraData> secondAttributeValuesFor1st11 = null;
                        if (secondAttId != null) secondAttributeValuesFor1st11 = varAppItems.Select(z => z.EntityFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == long.Parse(secondAttId))).ToList();
                        if (secondAttributeValuesFor1st11 != null)
                        {
                            var secondAttributeValuesFor1st1 =
                            secondAttributeValuesFor1st11.Select(a => a.AttributeCode + "," + a.AttributeValue).ToList();
                            if (secondAttributeValuesFor1st1 != null && secondAttributeValuesFor1st1.Count > 0)
                            {
                                var attribName = firstItem.EntityFk.EntityExtraData.FirstOrDefault(a => a.AttributeId == long.Parse(secondAttId)).EntityObjectTypeCode;
                                if (attribName == "SIZE" && appItem.ItemSizeScaleHeadersFkList != null && appItem.ItemSizeScaleHeadersFkList.Count() > 0)
                                {
                                    var xx = appItem.ItemSizeScaleHeadersFkList.FirstOrDefault(a => a.ParentId == null);
                                    var zz = xx.AppItemSizeScalesDetails.OrderBy(s => Convert.ToInt32(s.D1Position)).OrderBy(s => Convert.ToInt32(s.D2Position)).OrderBy(s => Convert.ToInt32(s.D3Position)).Select(a => a.SizeCode.TrimEnd()).ToList();
                                    var ss = secondAttributeValuesFor1st1.Distinct().ToList();
                                    secondAttributeValuesFor1st = xx.AppItemSizeScalesDetails.OrderBy(s => Convert.ToInt32(s.D1Position))
                                        .OrderBy(s => Convert.ToInt32(s.D2Position)).OrderBy(s => Convert.ToInt32(s.D3Position)).Select(a => a.SizeCode.TrimEnd() + "," + a.SizeId.ToString()).ToList();
                                    foreach (var t in zz)
                                    {
                                        if (!ss.Contains(t.ToString()))
                                            secondAttributeValuesFor1st.Remove(t.ToString());
                                    }

                                }
                                else
                                    secondAttributeValuesFor1st = secondAttributeValuesFor1st1.Distinct().ToList();
                            }
                        }
                        if (firstattributeCodes != null && firstattributeCodes.Count > 0)
                        {
                            output.NonLookupValues = new List<LookupLabelDto>();
                            var firstAttributeCodeValues = firstattributeCodes
                                .Where(z => !string.IsNullOrEmpty(z.AttributeCode))
                                .Select(z => z.AttributeCode)
                                .Distinct()
                                .ToList();
                            var existingLookupCodeSet = (await _appEntityRepository.GetAll()
                                .AsNoTracking()
                                .Where(z => z.EntityObjectTypeCode == firstAttributeValue
                                            && firstAttributeCodeValues.Contains(z.Code)
                                            && (z.TenantId == null || z.TenantId == AbpSession.TenantId))
                                .Select(z => z.Code)
                                .ToListAsync())
                                .ToHashSet();

                            for (int cod = 0; cod < firstattributeCodes.Count; cod++)
                            {
                                if (!existingLookupCodeSet.Contains(firstattributeCodes[cod].AttributeCode))
                                {
                                    AppEntityExtraData? hexa, img;
                                    hexa = null;
                                    img = null;
                                    var itm = varAppItems.Where(z => z.EntityFk.EntityExtraData
                                    .Where(x => x.AttributeId == long.Parse(firstAttributeID.ToString()) && x.AttributeCode == firstattributeCodes[cod].AttributeCode).Count() > 0).FirstOrDefault();
                                    if (itm != null)
                                    {
                                        hexa = itm.EntityFk.EntityExtraData.Where(z => z.AttributeId == 201).FirstOrDefault();
                                        img = itm.EntityFk.EntityExtraData.Where(z => z.AttributeId == 202).FirstOrDefault();
                                    }
                                    output.NonLookupValues.Add(new LookupLabelDto
                                    {
                                        Code = firstattributeCodes[cod].AttributeCode,
                                        Label = firstattributeCodes[cod].AttributeValue,
                                        HexaCode = hexa != null ? hexa.AttributeValue : "",
                                        Image = img != null ? img.AttributeValue : ""
                                    });
                                }
                            }
                        }


                        List<string> variationsLists = string.IsNullOrEmpty(variations) ? new List<string>() : variations.Split(';').ToList();
                        if (variationsLists != null)
                        {


                            var extraDataAttrDto = new ExtraDataAttrDto();
                            extraDataAttrDto.extraAttrName = firstAttributeValue;
                            extraDataAttrDto.selectedValuesTotalCount = firstattributeValuesCount;
                            extraDataAttrDto.extraAttributeId = long.Parse(firstAttributeID);
                            extraDataAttrDto.selectedValues = new List<ExtraDataSelectedValues>();
                            int imageLoopCounter = 0;
                            bool firstAttributeRelatedAdded = false;
                            var tenantIdvar = AbpSession.TenantId;
                            if (appItem.TenantId != AbpSession.TenantId)
                            {
                                var orgItems = varAppItems.FirstOrDefault(x => x.ParentId == appItem.Id);
                                if (orgItems != null)
                                    tenantIdvar = orgItems.TenantId;
                            }
                            foreach (var varItem in firstattributeCodes)
                            {
                                ExtraDataSelectedValues extraDataSelectedValues = new ExtraDataSelectedValues();
                                extraDataSelectedValues.value = varItem.AttributeValue;
                                extraDataSelectedValues.Code = varItem.AttributeCode;
                                //Iteration#42,1 MMT 08/20/2024 Add new property for the code[End]

                                extraDataSelectedValues.DefaultEntityAttachment = new AppEntityAttachmentDto();
                                //YYY
                                //41
                                //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[Start]
                                var codeItemVar = varAppItems.Where(x => x.EntityFk.EntityExtraData
                                                                                 .Where(a => a.AttributeValue == varItem.AttributeValue.ToString() &&
                                                                                 a.AttributeId == firstAttributeIdLong
                                                                                 ).Any()).FirstOrDefault();
                                if (codeItemVar != null)
                                {
                                    var varColor = codeItemVar.EntityFk.EntityExtraData.Where(x => x.AttributeId == 201).FirstOrDefault();
                                    if (varColor != null && !string.IsNullOrEmpty(varColor.AttributeValue))
                                        extraDataSelectedValues.ColorHexaCode = varColor.AttributeValue;
                                    else
                                        extraDataSelectedValues.ColorHexaCode = "";

                                    var varColorImage = codeItemVar.EntityFk.EntityExtraData.Where(x => x.AttributeId == 202).FirstOrDefault();
                                    if (varColorImage != null && !string.IsNullOrEmpty(varColorImage.AttributeValue))
                                    {
                                        string tenantId = varColorImage.AttributeValueId != null ? null : AbpSession.TenantId.ToString();
                                        extraDataSelectedValues.ColorImage = imagesUrl + (tenantId == null ? "-1" : tenantId.ToString()) + @"/" + varColorImage.AttributeValue;
                                    }
                                    else
                                    {
                                        extraDataSelectedValues.ColorImage = "";
                                    }
                                }
                                if (firstattributeDefaultImages.Count > imageLoopCounter && firstattributeDefaultImages[imageLoopCounter] != null && !string.IsNullOrEmpty(firstattributeDefaultImages[imageLoopCounter].ToString()))
                                    extraDataSelectedValues.DefaultEntityAttachment.Url = imagesUrl + (tenantIdvar == null ? "-1" : tenantIdvar.ToString()) + @"/" + firstattributeDefaultImages[imageLoopCounter].ToString();
                                var attribut = varItem;
                                if (attribut != null)
                                {
                                    var imgObj = firstattributeDefaultImages.FirstOrDefault(z => z != null &&
                                    (z.Attributes == firstAttributeID.Trim() + "=" + attribut.AttributeCode ||
                                    z.Attributes == firstAttributeID.Trim() + "=" + attribut.AttributeValueId.ToString()));
                                    if (imgObj != null && imgObj.Attachment != null)
                                    {
                                        extraDataSelectedValues.DefaultEntityAttachment.Url = imagesUrl + (tenantIdvar == null ? "-1" : tenantIdvar.ToString()) + @"/" + imgObj.Attachment.ToString();
                                    }
                                }
                                //xx2024
                                //
                                var item = varAppItems.Where(x => x.EntityFk.EntityExtraData
                                                                                 .Where(a => (a.AttributeValue == varItem.AttributeValue || a.AttributeCode == varItem.AttributeCode) &&
                                                                                 a.AttributeId == firstAttributeIdLong).Any()).FirstOrDefault();
                                //
                                if (item != null)
                                {
                                    var varColorImage = item.EntityFk.EntityExtraData.Where(x => x.AttributeId == 202).FirstOrDefault();
                                    if (varColorImage != null)
                                    {
                                        string tenantId = null;
                                        if (item.EntityFk != null)
                                            tenantId = item.EntityFk.TenantId.ToString();
                                        extraDataSelectedValues.DefaultEntityAttachment.Url = imagesUrl + (tenantId == null ? "-1" : tenantId.ToString()) + @"/" + varColorImage.AttributeValue;
                                    }
                                }
                                //xx2024
                                imageLoopCounter = imageLoopCounter + 1;
                                if (true)
                                {
                                    extraDataSelectedValues.EDRestAttributes = new List<EDRestAttributes>();
                                    if (attributeIDs.Count == 1)
                                    {
                                        string attVal = attributeValues[0].Split(',')[0];
                                        string attCode = attributeIDs[0].Split(',')[0];
                                        EDRestAttributes eDRestAttributes = new EDRestAttributes();
                                        eDRestAttributes.ExtraAttributeId = long.Parse(attributeIDs[0].Split(',')[0].ToString());
                                        var lookupLabelDtoList = firstattributeValues.Where(a => a == varItem.AttributeValue).ToList();
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
                                                                                   .Where(a => (a.AttributeValue == attlook.Label.ToString() || a.AttributeCode == attlook.Label.ToString()) &&
                                                                                   a.AttributeId == firstAttributeIdLong
                                                                                   ).Any()).ToList();
                                            var itemVarSum = codeItems.Where(x =>
                                           x.EntityFk.EntityExtraData.Where(a => a.AttributeId == firstAttributeIdLong &
                                           a.AttributeValue == varItem.AttributeValue).Any()).Sum(a => a.StockAvailability);
                                            attlook.StockAvailability = itemVarSum;
                                        }
                                        eDRestAttributes.TotalCount = secondAttributeValuesFor1st.Count;//variationsLists[loop_counter + 3].Split('|').ToList().Count;
                                        extraDataSelectedValues.EDRestAttributes.Add(eDRestAttributes);
                                    }
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
                                            var codeItemsFirst = varAppItems.Where(x => x.EntityFk.EntityExtraData
                                                                                    .Where(a => (a.AttributeValue == attlook.Label.ToString() || a.AttributeCode == attlook.Label.ToString()) &&
                                                                                    a.AttributeId == long.Parse(secondAttId)
                                                                                    ).Any()).ToList();
                                            var codeItems = codeItemsFirst.Where(x => x.EntityFk.EntityExtraData
                                                                                    .Where(a => (a.AttributeValue == extraDataSelectedValues.value.ToString() ||
                                                                                    a.AttributeCode == extraDataSelectedValues.Code.ToString()) &&
                                                                                    a.AttributeId == firstAttributeIdLong
                                                                                    ).Any()).ToList();
                                            if (codeItems.Count != 0)
                                            {
                                                var itemVarSum = codeItems.Where(x =>
                                             x.EntityFk.EntityExtraData.Where(a => a.AttributeId == firstAttributeIdLong &
                                             a.AttributeValue == varItem.AttributeValue).Any()).Sum(a => a.StockAvailability);
                                                attlook.StockAvailability = itemVarSum;
                                            }
                                            else
                                            {
                                                attlook.StockAvailability = null;
                                            }
                                        }
                                        eDRestAttributes.Values.RemoveAll(x => x.StockAvailability == null);
                                        eDRestAttributes.TotalCount = secondAttributeValuesFor1st.Count;
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


                    output.AppItem.EntityCategories = null;
                    output.AppItem.EntityClassifications = null;
                    output.AppItem.EntityDepartments = null;

                    output.AppItem.EntityObjectTypeName = appItem.EntityFk.EntityObjectTypeFk.Name;
                    if (input.GetAppItemAttributesInputForCategories == null)
                        input.GetAppItemAttributesInputForCategories = new GetAppItemAttributesInput();
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
                    output.AppItem.EntityDepartmentsNames = new PagedResultDto<string> { Items = (await GetAppItemDepartmentsWithFullNameWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForDepartments.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForDepartments.SkipCount, Sorting = input.GetAppItemAttributesInputForDepartments.Sorting })).Items.Select(a => a.EntityObjectCategoryName).ToList() };
                }
                stopwatch.Stop();
                var elapsed_time = stopwatch.ElapsedMilliseconds;
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
                returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + categoriesFiltered.Name;
            }
            return returnName;

        }

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

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllWithChildsExceptSelectedForProductWithPaging(GetAllSycEntityObjectCategoriesInput input)
        {
            input.ObjectId = await _helper.SystemTables.GetObjectItemId();
            string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
            List<long> exceptList = new List<long>();
            if (input.EntityId != 0)
            {
                var query0 = _appEntitiesRelationship.GetAll()
                     .Where(e => (e.EntityId == input.EntityId || e.RelatedEntityId == input.EntityId)
                     )
                      .Select(e => new
                      {
                          Id = e.EntityId == input.EntityId ? e.RelatedEntityId : e.EntityId
                      });
                exceptList = query0.Select(e => e.Id).ToList();
            }
            var query = _appItemRepository.GetAll().Include(e => e.EntityFk).ThenInclude(e => e.EntityAttachments)
                .Where(e => (e.EntityId != input.EntityId) && !exceptList.Contains(e.EntityId) && (e.ParentId == 0 || e.ParentId == null) && (e.IsDeleted == null || e.IsDeleted == false))
                .WhereIf(!string.IsNullOrEmpty(input.Filter), e => e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter))
                .Include(e => e.EntityFk.EntityAttachments).ThenInclude(e => e.AttachmentFk);

            var totalCount = await query.CountAsync();

            var entityRelated = await query
                .OrderBy(!string.IsNullOrEmpty(input.Sorting) ? input.Sorting : "Id asc")
                .PageBy(input)
                .Select(e => new TreeNode<GetSycEntityObjectCategoryForViewDto>
                {
                    Leaf = true,
                    label = e.Code,
                    Data = new GetSycEntityObjectCategoryForViewDto
                    {
                        SycEntityObjectCategoryName = "",
                        SydObjectName = "ITEM",

                        SycEntityObjectCategory = new SycEntityObjectCategoryDto
                        {
                            Code = e.Code,
                            Name = e.Name,
                            ObjectId = e.EntityId,
                            Id = e.EntityId,
                            AppItemImageUrl = (e.EntityFk.EntityAttachments != null && e.EntityFk.EntityAttachments.Count() > 0) ? imagesUrl + (e.TenantId.HasValue ? e.TenantId.ToString() : "-1") + @"/" + e.EntityFk.EntityAttachments[0].AttachmentFk.Attachment : "",
                            AppItemImageName = (e.EntityFk.EntityAttachments != null && e.EntityFk.EntityAttachments.Count() > 0) ? e.EntityFk.EntityAttachments[0].AttachmentFk.Name : ""

                        }
                    },
                })
                .ToListAsync();

            return new PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>(
                totalCount,
                entityRelated
            );


        }

        public async Task<PagedResultDto<AppItemLookupDto>> GetAppItemRelatedProductsWithPaging(GetAllSycEntityObjectCategoriesInput input)
        {

            if (input.EntityId != 0)
            {
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";


                var query = _appEntitiesRelationship.GetAll()
                    .Where(e => (e.EntityId == input.EntityId || e.RelatedEntityId == input.EntityId)
                    )
                    .Include(e => e.EntityFk).ThenInclude(e => e.EntityAttachments).ThenInclude(e => e.AttachmentFk)
                    .Include(e => e.RelatedEntityFk).ThenInclude(e => e.EntityAttachments).ThenInclude(e => e.AttachmentFk)
                     .Select(e => new
                     {
                         Id = e.EntityId == input.EntityId ? e.RelatedEntityId : e.EntityId,
                         Code = e.EntityId == input.EntityId ? e.RelatedEntityFk.Code : e.EntityFk.Code,
                         Name = e.EntityId == input.EntityId ? e.RelatedEntityFk.Name : e.EntityFk.Name,
                         EntityFk = e.EntityId == input.EntityId ? e.RelatedEntityFk : e.EntityFk,
                         TenantId = e.EntityId == input.EntityId ? e.RelatedTenantId : e.TenantId,
                         EntityAttachments = e.EntityId == input.EntityId ? e.RelatedEntityFk.EntityAttachments.Where(e => e.IsDefault).ToList() : e.EntityFk.EntityAttachments.Where(e => e.IsDefault).ToList()
                     });

                var totalCount = await query.CountAsync();

                var sel = from entity in query
                          join item in _appItemRepository.GetAll()
                          on entity.Id equals item.EntityId into j1
                          from j2 in j1.DefaultIfEmpty()
                          select new
                          {
                              Id = entity.Id,
                              Code = j2.Code,
                              Name = j2.Name,
                              EntityFk = entity.EntityFk,
                              TenantId = entity.TenantId,
                              EntityAttachments = entity.EntityAttachments
                          };

                var entityRelated = await sel
                    .OrderBy(!string.IsNullOrEmpty(input.Sorting) ? input.Sorting : "Id asc")
                    .PageBy(input)
                    .Select(e => new AppItemLookupDto
                    {
                        AppItemCode = e.Code,
                        AppItemName = e.Name,
                        AppItemId = e.Id,
                        Id = e.Id,
                        AppItemImageUrl = (e.EntityAttachments != null && e.EntityAttachments.Count() > 0) ? imagesUrl + (e.TenantId.HasValue ? e.TenantId.ToString() : "-1") + @"/" + e.EntityAttachments[0].AttachmentFk.Attachment : "",
                        AppItemImageName = (e.EntityAttachments != null && e.EntityAttachments.Count() > 0) ? e.EntityAttachments[0].AttachmentFk.Name : ""

                    })
                    .ToListAsync();

                return new PagedResultDto<AppItemLookupDto>(
                    totalCount,
                    entityRelated
                );
            }

            return new PagedResultDto<AppItemLookupDto>(0, new List<AppItemLookupDto>());
        }


        [AbpAuthorize(AppPermissions.Pages_AppItems_Edit)]
        public async Task<GetAppItemForEditOutput> GetAppItemForEdit(GetAppItemWithPagedAttributesForEditInput input)
        {

            var appItem = await _appItemRepository.GetAll()
                .AsNoTracking()
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                .Include(x => x.ListingItemFkList)
                .Include(x => x.PublishedListingItemFkList)
                .AsSplitQuery()
                .FirstOrDefaultAsync(x => x.Id == input.ItemId);
            if (appItem == null)
            {
                throw new EntityNotFoundException(typeof(AppItem), input.ItemId);
            }
            if (appItem.EntityFk != null && appItem.EntityFk.EntitiesRelationships == null)
            {
                appItem.EntityFk.EntitiesRelationships = new List<AppEntitiesRelationship>();
            }
            if (appItem.EntityFk != null && appItem.EntityFk.RelatedEntitiesRelationships == null)
            {
                appItem.EntityFk.RelatedEntitiesRelationships = new List<AppEntitiesRelationship>();
            }
            var output = new GetAppItemForEditOutput { AppItem = ObjectMapper.Map<AppItemForEditDto>(appItem) };
            var ab = await _appItemSizeScalesHeaderRepository.GetAll()
                                                  .AsNoTracking()
                                                  .Include(b => b.AppItemSizeScalesDetails).Where(a => a.AppItemId == appItem.Id).ToListAsync();
            output.AppItem.AppItemSizesScaleInfo = ObjectMapper.Map<List<AppItemSizesScaleInfo>>(ab);

            var prcItem = await _appItemPricesRepository.GetAll().AsNoTracking().Include(a => a.CurrencyFk).Where(a => a.AppItemId == appItem.Id).ToListAsync();
            output.AppItem.AppItemPriceInfos = ObjectMapper.Map<List<AppItemPriceInfo>>(prcItem);
            if (input.GetAppItemAttributesInputForRelatedItems == null)
            {
                input.GetAppItemAttributesInputForRelatedItems = new GetAppItemAttributesInput();
                input.GetAppItemAttributesInputForRelatedItems.Sorting = "Id";
                input.GetAppItemAttributesInputForRelatedItems.SkipCount = 0;
                input.GetAppItemAttributesInputForRelatedItems.MaxResultCount = 10;
            }
            output.AppItem.RelatedAppItems = await GetAppItemRelatedProductsWithPaging(new GetAllSycEntityObjectCategoriesInput() { EntityId = appItem.EntityId, SkipCount = input.GetAppItemAttributesInputForRelatedItems.SkipCount, MaxResultCount = input.GetAppItemAttributesInputForRelatedItems.MaxResultCount, Sorting = input.GetAppItemAttributesInputForRelatedItems.Sorting });

            var varAppItems = appItem.ParentFkList;
            var variationStockAvailability = varAppItems.Select(r => r.StockAvailability).Sum();
            if (variationStockAvailability > 0)
            {
                output.AppItem.StockAvailability = variationStockAvailability;
            }
            //xx
            output.AppItem.EntityAttachments.ForEach(a => a.Url = @"attachments/" + AbpSession.TenantId + @"/" + a.FileName);

            var variationItemIds = output.AppItem.VariationItems.Select(a => a.Id).ToList();
            var variationPrices = await _appItemPricesRepository.GetAll()
                .AsNoTracking()
                .Include(a => a.CurrencyFk)
                .Where(a => variationItemIds.Contains(a.AppItemId))
                .ToListAsync();
            var variationPricesByItemId = variationPrices
                .GroupBy(a => a.AppItemId)
                .ToDictionary(a => a.Key, a => ObjectMapper.Map<List<AppItemPriceInfo>>(a.ToList()));
            foreach (var item in output.AppItem.VariationItems)
            {
                var marketplacesize = item.EntityExtraData.Where(s => s.AttributeId == 205).FirstOrDefault();
                if (marketplacesize != null)
                    marketplacesize.EntityObjectTypeCode = "SIZEMARKETPLACECODE";
                item.EntityAttachments.ForEach(a => a.Url = @"attachments/" + AbpSession.TenantId + @"/" + a.FileName);
                item.AppItemPriceInfos = variationPricesByItemId.TryGetValue(item.Id, out var itemPrices) ? itemPrices : new List<AppItemPriceInfo>();
            }

            output.AppItem.EntityObjectTypeName = appItem.EntityFk.EntityObjectTypeFk.Name;//.EntityFk.EntityObjectTypeFk.Name;
            if (input.GetAppItemAttributesInputForCategories == null)
                input.GetAppItemAttributesInputForCategories = new GetAppItemAttributesInput();
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
            output.AppItem.EntityDepartments = await GetAppItemDepartmentsWithFullNameWithPaging(new GetAppItemAttributesWithPagingInput { ItemEntityId = appItem.EntityId, MaxResultCount = input.GetAppItemAttributesInputForDepartments.MaxResultCount, SkipCount = input.GetAppItemAttributesInputForDepartments.SkipCount, Sorting = input.GetAppItemAttributesInputForDepartments.Sorting });
            string firstAttributeId = "";
            var frstAttId = varAppItems.Select(x => x.EntityFk.EntityAttachments.Where(z => z.Attributes.Contains("=")).Select(a => a.Attributes)).FirstOrDefault();
            if (frstAttId != null && frstAttId.Count() > 0)
                firstAttributeId = frstAttId.FirstOrDefault().ToString().Split("=")[0];

            var firstItem = varAppItems.FirstOrDefault();
            if (firstItem != null)
            {
                List<string> attributeValues = firstItem.EntityFk.EntityExtraData.Select(x => x.EntityObjectTypeCode).Distinct().ToList();
                List<string> attributeIDs = firstItem.EntityFk.EntityExtraData.Select(x => x.AttributeId.ToString()).Distinct().ToList();
                var firstAttributeID = firstItem.EntityFk.EntityExtraData.WhereIf(!string.IsNullOrEmpty(firstAttributeId), a => a.AttributeId == long.Parse(firstAttributeId)).Select(x => x.AttributeId)
                    .FirstOrDefault().ToString();
                var firstAttributeValue = firstItem.EntityFk.EntityExtraData.WhereIf(!string.IsNullOrEmpty(firstAttributeId), a => a.AttributeId == long.Parse(firstAttributeId)).Select(x => x.EntityObjectTypeCode.ToString()).FirstOrDefault();
                var firstattributeCodes = varAppItems.Select(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID)).Select(z => new { z.AttributeCode, z.AttributeValue, z.AttributeValueId })).Distinct().Select(a => a.FirstOrDefault()).Distinct().ToList();
                var firstattributeValues = varAppItems.Select(x => x.EntityFk.EntityExtraData.Where(z => z.AttributeId == long.Parse(firstAttributeID))
                                                      .Select(z => z.AttributeValue)).Distinct().Select(a => a.FirstOrDefault()).Distinct().ToList();
                if (firstattributeCodes != null && firstattributeCodes.Count > 0)
                {
                    string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";

                    output.NonLookupValues = new List<LookupLabelDto>();
                    var firstAttributeCodeValues = firstattributeCodes
                        .Where(z => !string.IsNullOrEmpty(z.AttributeCode))
                        .Select(z => z.AttributeCode)
                        .Distinct()
                        .ToList();
                    var existingLookupCodeSet = (await _appEntityRepository.GetAll()
                        .AsNoTracking()
                        .Where(z => z.EntityObjectTypeCode == firstAttributeValue
                                    && firstAttributeCodeValues.Contains(z.Code)
                                    && (z.TenantId == null || z.TenantId == AbpSession.TenantId))
                        .Select(z => z.Code)
                        .ToListAsync())
                        .ToHashSet();

                    for (int cod = 0; cod < firstattributeCodes.Count; cod++)
                    {
                        if (!existingLookupCodeSet.Contains(firstattributeCodes[cod].AttributeCode))
                        {
                            AppEntityExtraData? hexa, img;
                            hexa = null;
                            img = null;
                            var itm = varAppItems.Where(z => z.EntityFk.EntityExtraData
                            .Any(x => x.AttributeId == long.Parse(firstAttributeID.ToString()) && x.AttributeCode == firstattributeCodes[cod].AttributeCode)).FirstOrDefault();
                            if (itm != null)
                            {
                                hexa = itm.EntityFk.EntityExtraData.Where(z => z.AttributeId == 201).FirstOrDefault();
                                img = itm.EntityFk.EntityExtraData.Where(z => z.AttributeId == 202).FirstOrDefault();
                            }
                            output.NonLookupValues.Add(new LookupLabelDto
                            {
                                Code = firstattributeCodes[cod].AttributeCode,
                                Label = firstattributeCodes[cod].AttributeValue,
                                HexaCode = (hexa != null && hexa.AttributeValue != null) ? hexa.AttributeValue : "",
                                Image = (img != null && img.AttributeValue != null) ? (imagesUrl + (itm.TenantId.HasValue ? itm.TenantId.ToString() : "-1") + @"/" + img.AttributeValue) : ""
                            });
                        }
                    }
                }
            }
            return output;
        } //I46-POC
        public FluentValidation.Results.ValidationResult ValidateItem(CreateOrEditAppItemDto input)
        {
            _unitOfWorkManagerValid = UnitOfWorkManager;
            var validator = new DynamicValidator<CreateOrEditAppItemDto>(_validationRuleRepo, typeof(AppItemsAppService));
            var result = validator.Validate(input);
            return result;
        }
        //I46-POC
        public async Task<long> CreateOrEdit(CreateOrEditAppItemDto input)
        {
            List<AppItemValidationInputDTO> validateInput = new List<AppItemValidationInputDTO>();
            validateInput.Add(ObjectMapper.Map<AppItemValidationInputDTO>(input));
            var returnList = await ValidateItemData(validateInput);
            if (returnList != null && returnList.Count > 0)
            {
                string errorList = "";
                foreach (var item in returnList)
                {
                    foreach (var err in item.ErrorMessages)
                    {
                        errorList += err + "\n";
                    }

                }
                if (!string.IsNullOrEmpty(errorList))
                    throw new UserFriendlyException(errorList);
            }
            if (input.Id == 0)
            {
                if (!string.IsNullOrEmpty(input.OriginalCode) && input.OriginalCode == input.Code)
                {

                    bool llNewCodeFound = false;
                    while (!llNewCodeFound)
                    {
                        var nextCode = await GenerateProductCode(int.Parse(input.EntityObjectTypeId.ToString()), true, AbpSession.TenantId);
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
                if (input.TenantId == null)
                    input.TenantId = AbpSession.TenantId;
                var appItemExisting = await _appItemRepository.GetAll().Where(r => r.TenantId == input.TenantId && r.Code == input.Code && r.ItemType == input.ItemType).FirstOrDefaultAsync();
                if (appItemExisting != null)
                {
                    throw new UserFriendlyException("This product code already existing. Please use different code.");
                }

                long result = await Create(input);
                return result;
            }
            else
            {
                long result = await Update(input);
                return result;
            }
        }
        //I46
        public static bool IsExtisting(string code)
        {
            var x = _unitOfWorkManagerValid.Current.GetDbContext<onetouchDbContext>(null, null);
            var appItemExist = x.AppItems.Where(r => r.Code == code).FirstOrDefault();
            if (appItemExist != null)
            {
                return false;
            }
            return true;

        }
        //I46
        public async Task<bool> IsVariationOrdered(string sSIN)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                return await _appTransactionDetails.GetAll().Where(z => z.ItemSSIN == sSIN).CountAsync() > 0;
            }
        }
        public async Task<VariationListToDeleteDto> GetItemVariationsToDelete(long productId, List<string> sSINs)
        {
            //<VariationItemDto, bool>
            VariationListToDeleteDto returnDto = new VariationListToDeleteDto();
            returnDto.VariationCanBeDeleted = new List<VariationItemDto>();
            returnDto.VariationsInUse = new List<VariationItemDto>();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (sSINs != null && sSINs.Count() > 0)
                {
                    foreach (var ssin in sSINs)
                    {
                        VariationItemDto variationDto = new VariationItemDto();
                        var item = await _appItemRepository.GetAll().Where(z => z.ParentId == productId && z.SSIN == ssin).FirstOrDefaultAsync();
                        if (item != null)
                            variationDto = ObjectMapper.Map<VariationItemDto>(item);

                        var ret = await _appTransactionDetails.GetAll().Where(z => z.ItemSSIN == ssin).CountAsync() > 0;
                        if (!ret)
                        {
                            returnDto.VariationCanBeDeleted.Add(variationDto);
                        }
                        else
                        {
                            returnDto.VariationsInUse.Add(variationDto);
                        }
                    }
                }
                else
                {
                    var items = await _appItemRepository.GetAll().Where(z => z.ParentId == productId).ToListAsync();
                    if (items != null && items.Count() > 0)
                    {
                        foreach (var item in items)
                        {
                            VariationItemDto variationDto = ObjectMapper.Map<VariationItemDto>(item);
                            var ret = await _appTransactionDetails.GetAll().Where(z => z.ItemSSIN == item.SSIN).CountAsync() > 0;
                            if (!ret)
                            {
                                returnDto.VariationCanBeDeleted.Add(variationDto);
                            }
                            else
                            {
                                returnDto.VariationsInUse.Add(variationDto);
                            }
                        }
                    }
                }
            }
            return returnDto;
        }
        [AbpAuthorize(AppPermissions.Pages_AppItems_Create)]
        protected virtual async Task<long> Create(CreateOrEditAppItemDto input)
        {


            return await DoCreateOrEdit(input);
        }

        [AbpAuthorize(AppPermissions.Pages_AppItems_Edit)]
        protected virtual async Task<long> Update(CreateOrEditAppItemDto input)
        {
            return await DoCreateOrEdit(input);
        }
        private async Task<IList<AppEntityExtraDataDto>> GetExtraAttributeData(string attributeCode, long entityObjectTypeId, long? tenantId, int prdouctTypeId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appEntity = await _appEntityRepository.GetAll().AsNoTracking()
                .Include(x => x.EntityExtraData).AsNoTracking()
                .Include(x => x.EntityAttachments)
                .ThenInclude(x => x.AttachmentFk)
                .FirstOrDefaultAsync(x => x.Code == attributeCode && x.EntityObjectTypeId == entityObjectTypeId && (x.TenantId == tenantId || x.TenantId == null || x.TenantId == AbpSession.TenantId));

                var entity = new GetAppEntityForEditOutput { AppEntity = ObjectMapper.Map<CreateOrEditAppEntityDto>(appEntity) };


                if (entity != null && entity.AppEntity != null)
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
        private async Task<long> DoCreateOrEdit(CreateOrEditAppItemDto input)
        {
            // Load shared values used by the parent item, child variations, prices, and entity status.
            var timeStamp = DateTime.Now;
            var currencyVar = await TenantManager.GetTenantCurrency();
            string currency = currencyVar.Code;
            DateTime start = DateTime.Now;

            var itemObjectId = await _helper.SystemTables.GetObjectItemId();
            if (input.ItemType == 1)
            { itemObjectId = await _helper.SystemTables.GetObjectListingId(); }

            var itemStatusId = input.Status == "ACTIVE" ? await _helper.SystemTables.GetEntityObjectStatusItemActive() : await _helper.SystemTables.GetEntityObjectStatusItemDraft();

            // Merge departments into categories because entity persistence stores both as category records.
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
            var appItemChildrenTmp = new List<AppItem>();
            // Create a new item model or load the existing parent and its children for update matching.
            if (input.Id == 0)
            {
                appItem = ObjectMapper.Map<AppItem>(input);
                appItem.ListingItemId = input.ParentId == 0 ? null : input.ParentId;
                appItem.ParentId = null;

            }
            else
            {


                var appItemAll = await _appItemRepository.GetAll()//.Include(x => x.ItemPricesFkList).AsNoTracking()
                .Where(r => r.Id == input.Id || r.ParentId == input.Id)
                .ToListAsync();
                appItem = appItemAll.Where(z => z.Id == input.Id).FirstOrDefault();
                appItemChildrenTmp = appItemAll.Where(z => z.ParentId == input.Id).ToList();
                var orgSSIN = appItem.SSIN;
                ObjectMapper.Map(input, appItem);
                appItem.SSIN = orgSSIN;
            }
            // Build the AppEntity DTO that carries classifications, categories, attributes, status, and SSIN.
            AppEntityDto entity = new AppEntityDto();
            ObjectMapper.Map(input, entity);
            entity.Id = 0;
            entity.SSIN = appItem.SSIN;
            entity.Code = input.Code;
            entity.ObjectId = itemObjectId;
            if (entity.TenantId == null)
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
                // Reload the existing entity links so removed/added categories and classifications are reconciled.
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
            // Keep item and entity timestamps aligned and generate SSIN only when the item does not already have one.
            appItem.TimeStamp = timeStamp;
            entity.TimeStamp = timeStamp;
            if (appItem.TenantOwner == null)
                appItem.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
            if (string.IsNullOrEmpty(appItem.SSIN) && !input.SkipGenerateSsin)
            {
                appItem.SSIN = await _helper.SystemTables.GenerateSSIN(itemObjectId, ObjectMapper.Map<AppEntityDto>(entity));
                entity.SSIN = appItem.SSIN;
            }
            else
            {
                entity.SSIN = appItem.SSIN;
            }
            entity.TenantOwner = appItem.TenantOwner;
            if (input.Id == 0 && entity.TenantOwner != null && entity.TenantOwner != 0)
            {
                entity.AttachmentSourceTenantId = -1;
            }
            // Rebuild the related-items list after applying add/remove deltas.
            #region Iteration49 handle the related items
            if (input.Id == 0 || input.entityRelatedItems == null)
            { input.entityRelatedItems = new List<AppEntityCategoryDto>(); }

            if (input.entityRelatedItemsRemoved != null && input.entityRelatedItemsRemoved.Count > 0)
            {
                List<long> tempIds = input.entityRelatedItemsRemoved.Select(r => r.EntityObjectCategoryId).ToList();
                input.entityRelatedItems = input.entityRelatedItems.Where(r => tempIds.Contains(r.EntityObjectCategoryId) == false).ToList();
            }

            if (input.entityRelatedItemAdded != null && input.entityRelatedItemAdded.Count > 0)
            { ((List<AppEntityCategoryDto>)input.entityRelatedItems).AddRange(input.entityRelatedItemAdded); }

            entity.RelatedEntitiesIds = new List<long>();
            entity.RelatedEntitiesIds = input.entityRelatedItems.Select(e => e.EntityObjectCategoryId).ToList();

            #endregion Iteration49 handle the related items
            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
            await CurrentUnitOfWork.SaveChangesAsync();
            if (appItem.TenantId == null)
                appItem.TenantId = AbpSession.TenantId;

            appItem.EntityId = savedEntity;

            // Persist the parent AppItem and record product create/edit usage.
            if (appItem.Id == 0)
            {
                appItem = await _appItemRepository.InsertAsync(appItem);
                if (input.VariationItems != null && input.VariationItems.Count > 0)
                {
                    await CurrentUnitOfWork.SaveChangesAsync();
                }

                {
                    await _appTenantActivitiesLogAppService.AddUsageActivityLog("CREATE-PRODUCT", appItem.Code, appItem.EntityId, appItem.EntityFk.EntityObjectTypeId, appItem.EntityFk.EntityObjectTypeCode, appItem.Code, 1);
                }
            }
            else
            {
                appItem = await _appItemRepository.UpdateAsync(appItem);
                await _appTenantActivitiesLogAppService.AddUsageActivityLog("EDIT-PRODUCT", appItem.Code, appItem.EntityId, appItem.EntityFk.EntityObjectTypeId, appItem.EntityFk.EntityObjectTypeCode, appItem.Code, 1);
            }


            List<Action> pendingFileMoves = new List<Action>();
            var attributeValueEntityObjectTypeCache = new Dictionary<long, long?>();
            var entityObjectTypeCodeCache = new Dictionary<string, long?>(StringComparer.OrdinalIgnoreCase);
            if (input.VariationItems != null && input.VariationItems.Count > 0)
            {
                // Match existing variation IDs by code, then delete child items/entities removed from the request.
                foreach (var child in input.VariationItems)
                {
                    if (child.Id == 0 && input.Id != 0 && appItemChildrenTmp != null && appItemChildrenTmp.Count > 0)
                    {
                        var appItemChildTmp = appItemChildrenTmp.FirstOrDefault(a => a.Code == child.Code)
                            ?? appItemChildrenTmp.FirstOrDefault(a => string.Equals(a.Code?.Trim(), child.Code?.Trim(), StringComparison.OrdinalIgnoreCase));
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

                // These lists are used to rebuild the parent AppItem.Variations serialized summary.
                #region set variations field lists
                List<string> attributteNames = new List<string>();
                List<string> attributteIDs = new List<string>();
                List<string> firstAttributteValues = new List<string>();
                List<string> firstAttributteImageDefaults = new List<string>();
                List<ExtraDto> secondAttributteValues = new List<ExtraDto>();
                List<List<ExtraDto>> restAttributteValues = new List<List<ExtraDto>>();
                string firstColor = "";
                #endregion set tvariations field lists

                // Determine which variation attribute controls the default image grouping.
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

                List<AppEntity> sizesList = new List<AppEntity>();
                List<AppEntity> colorsList = new List<AppEntity>();
                // Preload size/color lookup entities once to avoid querying inside each variation.
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var sizeCodes = input.VariationItems.SelectMany(x => x.EntityExtraData)
                        .Where(z => z.AttributeId == 105 && !string.IsNullOrEmpty(z.AttributeCode))
                        .Select(z => z.AttributeCode).Distinct().ToList();

                    if (sizeCodes.Any())
                    {
                        sizesList = await _appEntityRepository.GetAll()
                            .Include(z => z.EntityExtraData)
                            .Where(z => z.EntityObjectTypeCode == "SIZE" && sizeCodes.Contains(z.Code) && (z.TenantId == AbpSession.TenantId || z.TenantId == null))
                            .ToListAsync();
                    }

                    var colorCodes = input.VariationItems.SelectMany(x => x.EntityExtraData)
                        .Where(z => z.AttributeId == 101 && !string.IsNullOrEmpty(z.AttributeCode))
                        .Select(z => z.AttributeCode).Distinct().ToList();

                    if (colorCodes.Any())
                    {
                        colorsList = await _appEntityRepository.GetAll()
                            .Include(z => z.EntityExtraData)
                            .Include(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                            .Where(z => z.EntityObjectTypeCode == "COLOR" && colorCodes.Contains(z.Code) && (z.TenantId == AbpSession.TenantId || z.TenantId == null))
                            .ToListAsync();
                    }
                }

                var sizesByCode = sizesList
                    .OrderByDescending(x => x.TenantId == AbpSession.TenantId)
                    .Where(x => !string.IsNullOrWhiteSpace(x.Code))
                    .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);
                var colorsByCode = colorsList
                    .OrderByDescending(x => x.TenantId == AbpSession.TenantId)
                    .Where(x => !string.IsNullOrWhiteSpace(x.Code))
                    .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);

                var existingVariationItemsById = appItemChildrenTmp.ToDictionary(x => x.Id);
                var existingVariationEntitiesById = new Dictionary<long, AppEntity>();
                var existingVariationPricesByItemId = new Dictionary<long, List<AppItemPrices>>();
                if (existingVariationItemsById.Count > 0)
                {
                    var existingVariationItemIds = existingVariationItemsById.Keys.ToList();
                    var existingVariationEntityIds = existingVariationItemsById.Values
                        .Where(x => x.EntityId != 0)
                        .Select(x => x.EntityId)
                        .Distinct()
                        .ToList();

                    if (existingVariationEntityIds.Count > 0)
                    {
                        existingVariationEntitiesById = await _appEntityRepository.GetAll()
                            .Include(x => x.EntityExtraData)
                            .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                            .Where(x => existingVariationEntityIds.Contains(x.Id))
                            .ToDictionaryAsync(x => x.Id);
                    }

                    existingVariationPricesByItemId = (await _appItemPricesRepository.GetAll()
                        .Where(x => existingVariationItemIds.Contains(x.AppItemId))
                        .ToListAsync())
                        .GroupBy(x => x.AppItemId)
                        .ToDictionary(x => x.Key, x => x.ToList());
                }

                var submittedVariationCodes = input.VariationItems
                    .Where(x => !string.IsNullOrEmpty(x.Code))
                    .Select(x => x.Code)
                    .Distinct()
                    .ToList();

                if (submittedVariationCodes.Count > 0)
                {
                    var variationTenantId = input.TenantId == null || input.TenantId == -1 ? AbpSession.TenantId : input.TenantId;
                    var variationEntityObjectTypeCode = entity.EntityObjectTypeCode;
                    var existingEntitiesBySubmittedCode = await _appEntityRepository.GetAll()
                        .Include(x => x.EntityExtraData)
                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                        .Where(x =>
                            submittedVariationCodes.Contains(x.Code) &&
                            x.TenantId == variationTenantId &&
                            x.ObjectCode == null &&
                            x.EntityObjectTypeCode == variationEntityObjectTypeCode)
                        .ToListAsync();

                    foreach (var existingEntity in existingEntitiesBySubmittedCode)
                    {
                        if (!existingVariationEntitiesById.ContainsKey(existingEntity.Id))
                            existingVariationEntitiesById.Add(existingEntity.Id, existingEntity);
                    }
                }

                var variationEntitiesByUniqueKey = existingVariationEntitiesById.Values
                    .GroupBy(x => _appEntitiesAppService.GetVariationEntityUniqueKey(x.TenantId, x.EntityObjectTypeCode, x.Code))
                    .ToDictionary(x => x.Key, x => x.First());

                var bulkDbContext = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                var originalAutoDetectChanges = bulkDbContext.ChangeTracker.AutoDetectChangesEnabled;
                var disableAutoDetectChanges = input.VariationItems.Count >= 25;
                if (disableAutoDetectChanges)
                    bulkDbContext.ChangeTracker.AutoDetectChangesEnabled = false;

                try
                {
                foreach (var child in input.VariationItems)
                {
                    // Process one variation: map DTOs, enrich attributes, save child entity/item, and save prices.
                    AppItem appItemChild = new AppItem();
                    if (child.Id == 0)
                    {
                        ObjectMapper.Map(appItem, appItemChild);
                        ObjectMapper.Map(child, appItemChild);
                        if (string.IsNullOrEmpty(appItemChild.SSIN))
                            appItemChild.SSIN = "";
                        appItemChild.Id = 0;
                        appItemChild.EntityId = 0;
                        appItemChild.ParentEntityId = 0;
                        appItemChild.ListingItemId = child.ParentId == 0 ? null : child.ParentId;
                    }
                    else
                    {
                        existingVariationItemsById.TryGetValue((long)child.Id, out appItemChild);
                        if (appItemChild == null)
                            appItemChild = await _appItemRepository.FirstOrDefaultAsync((long)child.Id);

                        if (appItemChild != null)
                        {
                            var existingChildEntityId = appItemChild.EntityId;
                            var existingChildSsin = appItemChild.SSIN;
                            ObjectMapper.Map(child, appItemChild);
                            appItemChild.EntityId = existingChildEntityId;
                            if (!string.IsNullOrEmpty(existingChildSsin))
                                appItemChild.SSIN = existingChildSsin;
                        }
                    }

                    // Build the child entity that stores variation attributes and links back to the parent item.
                    AppEntityDto childEntity = new AppEntityDto();
                    ObjectMapper.Map(child, childEntity);
                    childEntity.Id = 0;
                    childEntity.Code = child.Code;
                    childEntity.ObjectId = itemObjectId;
                    childEntity.EntityObjectTypeId = entity.EntityObjectTypeId;
                    childEntity.EntityObjectTypeCode = entity.EntityObjectTypeCode;
                    if (childEntity.TenantId == null)
                        childEntity.TenantId = AbpSession.TenantId;
                    childEntity.EntityObjectStatusId = itemStatusId;
                    childEntity.Id = appItemChild.EntityId;
                    childEntity.Name = appItem.Name;
                    childEntity.Notes = appItem.Description;

                    // Fill missing derived size/color metadata and queue cross-tenant attachment moves.
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                    {
                        var sizeNRF = childEntity.EntityExtraData.Where(z => z.AttributeId == 206).FirstOrDefault();
                        if (sizeNRF == null)
                        {
                            childEntity.EntityExtraData.Add(new AppEntityExtraDataDto
                            {
                                EntityObjectTypeCode = "SIZE-NRF",
                                AttributeId = 206,
                                EntityId = childEntity.Id,
                                AttributeValue = null
                            });
                        }
                        var sizeMarketplacev = childEntity.EntityExtraData.Where(z => z.AttributeId == 205).FirstOrDefault();
                        if (sizeMarketplacev == null)
                        {
                            childEntity.EntityExtraData.Add(new AppEntityExtraDataDto
                            {
                                EntityObjectTypeCode = "SIZEMARKETPLACECODE",
                                AttributeId = 205,
                                EntityId = childEntity.Id,
                                AttributeValue = null
                            });
                        }
                        var colorImage = childEntity.EntityExtraData.Where(z => z.AttributeId == 202).FirstOrDefault();
                        if (colorImage == null)
                        {
                            childEntity.EntityExtraData.Add(new AppEntityExtraDataDto
                            {
                                EntityObjectTypeCode = "COLOR-IMAGE",
                                AttributeId = 202,
                                EntityId = childEntity.Id,
                                AttributeValue = null
                            });
                        }
                        var colorHexa = childEntity.EntityExtraData.Where(z => z.AttributeId == 201).FirstOrDefault();
                        if (colorHexa == null)
                        {
                            childEntity.EntityExtraData.Add(new AppEntityExtraDataDto
                            {
                                EntityObjectTypeCode = "COLOR-HEX",
                                AttributeId = 201,
                                EntityId = childEntity.Id,
                                AttributeValue = null
                            });
                        }
                        var colorNRF = childEntity.EntityExtraData.Where(z => z.AttributeId == 204).FirstOrDefault();
                        if (colorNRF == null)
                        {
                            childEntity.EntityExtraData.Add(new AppEntityExtraDataDto
                            {
                                EntityObjectTypeCode = "COLOR-NRF",
                                AttributeId = 204,
                                EntityId = childEntity.Id,
                                AttributeValue = null
                            });
                        }
                        var colorSchv = childEntity.EntityExtraData.Where(z => z.AttributeId == 203).FirstOrDefault();
                        if (colorSchv == null)
                        {
                            childEntity.EntityExtraData.Add(new AppEntityExtraDataDto
                            {
                                EntityObjectTypeCode = "COLOR-SCHEME",
                                AttributeId = 203,
                                EntityId = childEntity.Id,
                                AttributeValue = null
                            });
                        }
                        var sizeExtraAtt = childEntity.EntityExtraData.Where(z => z.AttributeId == 105).FirstOrDefault();
                        if (sizeExtraAtt != null)
                        {
                            sizesByCode.TryGetValue(sizeExtraAtt.AttributeCode ?? string.Empty, out var sizeExtra);
                            if (sizeExtra != null)
                            {
                                var sizeNRFEnt = sizeExtra.EntityExtraData.Where(z => z.AttributeId == 36).FirstOrDefault();
                                if (sizeNRFEnt != null && !string.IsNullOrEmpty(sizeNRFEnt.AttributeValue))
                                {
                                    var colorNRFv = childEntity.EntityExtraData.Where(z => z.AttributeId == 206).FirstOrDefault();
                                    if (colorNRFv != null)
                                    {
                                        if (string.IsNullOrEmpty(colorNRFv.AttributeValue))
                                            colorNRFv.AttributeValue = sizeNRFEnt.AttributeValue;
                                    }
                                }

                                var sizeMarketplace = sizeExtra.EntityExtraData.Where(z => z.AttributeId == 35).FirstOrDefault();
                                if (sizeMarketplace != null && !string.IsNullOrEmpty(sizeMarketplace.AttributeValue))
                                {
                                    sizeMarketplacev = childEntity.EntityExtraData.Where(z => z.AttributeId == 205).FirstOrDefault();
                                    if (sizeMarketplacev != null)
                                    {
                                        if (string.IsNullOrEmpty(sizeMarketplacev.AttributeValue))
                                            sizeMarketplacev.AttributeValue = sizeMarketplace.AttributeValue;
                                    }
                                }
                            }
                        }
                        var colorExtraAtt = childEntity.EntityExtraData.Where(z => z.AttributeId == 101).FirstOrDefault();
                        if (colorExtraAtt == null)
                        {
                            colorExtraAtt = childEntity.EntityExtraData.Where(z => z.AttributeId == 100).FirstOrDefault();
                        }
                        if (colorExtraAtt != null)
                        {
                            colorsByCode.TryGetValue(colorExtraAtt.AttributeCode ?? string.Empty, out var colorExtra);
                            if (colorExtra != null)
                            {
                                if (colorExtra.EntityAttachments != null && colorExtra.EntityAttachments.Count > 0 && !string.IsNullOrEmpty(colorExtra.EntityAttachments[0].AttachmentFk.Attachment))
                                {
                                    colorImage = childEntity.EntityExtraData.Where(z => z.AttributeId == 202).FirstOrDefault();
                                    if (colorImage != null)
                                    {
                                        var path = _appConfiguration[$"Attachment:Path"] + @"\" + AbpSession.TenantId.ToString().Trim() + @"\" + colorExtra.EntityAttachments[0].AttachmentFk.Attachment;

                                        {
                                            if (colorExtra.EntityAttachments[0].AttachmentFk.TenantId != AbpSession.TenantId)
                                            {
                                                var attachmentStr = colorExtra.EntityAttachments[0].AttachmentFk.Attachment;
                                                var sourceTenantId = colorExtra.EntityAttachments[0].AttachmentFk.TenantId;
                                                var destTenantId = input.TenantId == null ? AbpSession.TenantId : int.Parse(input.TenantId.ToString());
                                                pendingFileMoves.Add(() => MoveFile(attachmentStr, sourceTenantId, destTenantId));
                                            }
                                            colorImage.AttributeValue = colorExtra.EntityAttachments[0].AttachmentFk.Attachment;
                                        }
                                    }
                                }
                                var colorHex = colorExtra.EntityExtraData.Where(z => z.AttributeId == 39).FirstOrDefault();
                                if (colorHex != null && !string.IsNullOrEmpty(colorHex.AttributeValue))
                                {
                                    colorHexa = childEntity.EntityExtraData.Where(z => z.AttributeId == 201).FirstOrDefault();
                                    if (colorHexa != null)
                                    {
                                        if (string.IsNullOrEmpty(colorHexa.AttributeValue))
                                            colorHexa.AttributeValue = colorHex.AttributeValue;
                                    }

                                }

                                var colorNRFlook = colorExtra.EntityExtraData.Where(z => z.AttributeId == 38).FirstOrDefault();
                                if (colorNRFlook != null && !string.IsNullOrEmpty(colorNRFlook.AttributeValue))
                                {
                                    var colorNRFEnt = childEntity.EntityExtraData.Where(z => z.AttributeId == 204).FirstOrDefault();
                                    if (colorNRFEnt != null)
                                    {
                                        if (string.IsNullOrEmpty(colorNRFEnt.AttributeValue))
                                            colorNRFEnt.AttributeValue = colorNRFlook.AttributeValue;
                                    }

                                }
                                var colorSch = colorExtra.EntityExtraData.Where(z => z.AttributeId == 37).FirstOrDefault();
                                if (colorSch != null && !string.IsNullOrEmpty(colorSch.AttributeValueId.ToString()))
                                {
                                    colorSchv = childEntity.EntityExtraData.Where(z => z.AttributeId == 203).FirstOrDefault();
                                    if (colorSchv != null)
                                    {
                                        if (string.IsNullOrEmpty(colorSchv.AttributeValue))
                                            colorSchv.AttributeValue = colorSch.AttributeValueId.ToString();
                                    }
                                }
                            }
                            else
                            {
                                var extraNonLookup = input.NonLookupValues.FirstOrDefault(z => z.Code == colorExtraAtt.AttributeCode);
                                if (extraNonLookup != null)
                                {
                                    if (extraNonLookup.HexaCode != null)
                                    {
                                        colorHexa = childEntity.EntityExtraData.Where(z => z.AttributeId == 201).FirstOrDefault();
                                        if (colorHexa != null)
                                        {
                                            if (string.IsNullOrEmpty(colorHexa.AttributeValue))
                                                colorHexa.AttributeValue = extraNonLookup.HexaCode;
                                        }
                                    }
                                    if (!string.IsNullOrEmpty(extraNonLookup.Image))
                                    {
                                        colorImage = childEntity.EntityExtraData.Where(z => z.AttributeId == 202).FirstOrDefault();
                                        if (colorImage != null)
                                        {
                                            colorImage.AttributeValue = Path.GetFileName(extraNonLookup.Image);
                                            var attachmentStr2 = colorImage.AttributeValue;
                                            var sourceTenantId2 = AbpSession.TenantId;
                                            var destTenantId2 = input.TenantId == null ? AbpSession.TenantId : int.Parse(input.TenantId.ToString());
                                            pendingFileMoves.Add(() => MoveFile(attachmentStr2, sourceTenantId2, destTenantId2));
                                        }

                                    }
                                }
                            }

                        }
                    }

                    // Generate child SSIN when needed, save the child entity, then insert/update the child item.
                    appItemChild.TimeStamp = timeStamp;
                    childEntity.TimeStamp = timeStamp;
                    if (appItemChild.TenantOwner == null)
                        appItemChild.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                    if (input.Id == 0 && childEntity.TenantOwner != null && childEntity.TenantOwner != 0)
                    {
                        childEntity.AttachmentSourceTenantId = -1;
                    }
                    if (string.IsNullOrEmpty(appItemChild.SSIN))
                    {
                        childEntity.SSIN = appItemChild.SSIN;
                    }
                    childEntity.TenantOwner = appItemChild.TenantOwner;

                    var savedChildEntity = await _appEntitiesAppService.SaveVariationEntityLean(childEntity, attributeValueEntityObjectTypeCache, entityObjectTypeCodeCache, existingVariationEntitiesById, variationEntitiesByUniqueKey);

                    appItemChild.EntityId = savedChildEntity.Id;
                    appItemChild.EntityFk = savedChildEntity;
                    appItemChild.ParentId = appItem.Id;
                    appItemChild.ParentEntityId = appItem.EntityId;


                    if (appItemChild.Id == 0)
                    {
                        appItemChild.ItemPricesFkList = new List<AppItemPrices>();
                        appItemChild = await _appItemRepository.InsertAsync(appItemChild);
                        // SaveChangesAsync intentionally removed for performance! EF Core will handle via Navigation Properties
                    }

                    // Replace removed child prices and insert/update the submitted variation prices.
                    existingVariationPricesByItemId.TryGetValue(appItemChild.Id, out var existingVariationPrices);
                    if (appItemChild.Id != 0 && child.Id != 0 && existingVariationPrices != null)
                    {
                        var submittedPriceIds = child.AppItemPriceInfos == null
                            ? new HashSet<long>()
                            : child.AppItemPriceInfos.Where(a => a.Id != 0).Select(a => a.Id).ToHashSet();

                        foreach (var existingPrice in existingVariationPrices.Where(x => !submittedPriceIds.Contains(x.Id)).ToList())
                        {
                            _appItemPricesRepository.Delete(existingPrice);
                            existingVariationPrices.Remove(existingPrice);
                        }
                    }
                    else if (appItemChild.Id != 0 && child.Id != 0)
                    {
                        if (child.AppItemPriceInfos != null && child.AppItemPriceInfos.Count() > 0)
                        {
                            var idList = child.AppItemPriceInfos.Select(a => a.Id).Distinct().ToList();
                            await _appItemPricesRepository.DeleteAsync(z => z.AppItemId == child.Id && !idList.Contains(z.Id));
                        }
                        else
                        {
                            await _appItemPricesRepository.DeleteAsync(z => z.AppItemId == child.Id);
                        }
                    }

                    if (child.AppItemPriceInfos != null)
                    {
                        EnsureDefaultPriceInfos(child.AppItemPriceInfos, currency);

                        if (appItemChild.ItemPricesFkList == null)
                            appItemChild.ItemPricesFkList = new List<AppItemPrices>();

                        foreach (var itemPrice in child.AppItemPriceInfos)
                        {
                            var itemPriceObj = ObjectMapper.Map<AppItemPrices>(itemPrice);
                            itemPriceObj.AppItemCode = appItemChild.Code;
                            if (appItemChild.Id != 0)
                                itemPriceObj.AppItemId = appItemChild.Id;

                            if (itemPriceObj.TenantId == null)
                                itemPriceObj.TenantId = AbpSession.TenantId;
                            if (itemPriceObj.CurrencyCode == currency)
                                itemPriceObj.IsDefault = true;

                            if (appItemChild.Id == 0)
                            {
                                appItemChild.ItemPricesFkList.Add(itemPriceObj);
                            }
                            else
                            {
                                // Existing variation
                                if (itemPriceObj.Id == 0)
                                    await _appItemPricesRepository.InsertAsync(itemPriceObj);
                                else if (existingVariationPrices != null)
                                {
                                    var existingPrice = existingVariationPrices.FirstOrDefault(x => x.Id == itemPriceObj.Id);
                                    if (existingPrice != null)
                                    {
                                        ObjectMapper.Map(itemPrice, existingPrice);
                                        existingPrice.AppItemCode = appItemChild.Code;
                                        existingPrice.AppItemId = appItemChild.Id;
                                        if (existingPrice.TenantId == null)
                                            existingPrice.TenantId = AbpSession.TenantId;
                                        existingPrice.IsDefault = existingPrice.CurrencyCode == currency;
                                    }
                                    else
                                    {
                                        await _appItemPricesRepository.UpdateAsync(itemPriceObj);
                                    }
                                }
                                else
                                    await _appItemPricesRepository.UpdateAsync(itemPriceObj);
                            }
                        }
                    }

                    // Collect the attribute names, ids, values, and default images for AppItem.Variations.
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
                }
                finally
                {
                    if (disableAutoDetectChanges)
                    {
                        try
                        {
                            bulkDbContext.ChangeTracker.DetectChanges();
                        }
                        finally
                        {
                            bulkDbContext.ChangeTracker.AutoDetectChangesEnabled = originalAutoDetectChanges;
                        }
                    }
                }

                // Serialize variation metadata used by the UI to render variation selectors.
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
            else
            {
                if (input.Id != null && input.Id != 0)
                {
                    await _appItemRepository.DeleteAsync(x => x.ParentId == input.Id);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }
            // Remove parent price rows that are no longer present in the submitted DTO.
            if (input.AppItemPriceInfos != null && input.AppItemPriceInfos.Count() > 0)
            {
                var idList = input.AppItemPriceInfos.Select(a => a.Id).Distinct().ToList();
                await _appItemPricesRepository.DeleteAsync(z => z.AppItemId == appItem.Id && !idList.Contains(z.Id));
            }
            else
            {
                await _appItemPricesRepository.DeleteAsync(z => z.AppItemId == appItem.Id);
            }

            await CurrentUnitOfWork.SaveChangesAsync();

            if (input.AppItemPriceInfos != null)
            {
                EnsureDefaultPriceInfos(input.AppItemPriceInfos, currency);

                // Insert or update parent item prices and mark the tenant currency as default.
                foreach (var itemPrice in input.AppItemPriceInfos)
                {
                    if (itemPrice.CurrencyCode == currency) //itemPrice.Code == "MSRP" &&
                    {
                        itemPrice.IsDefault = true;
                    }
                    var itemPriceObj = ObjectMapper.Map<AppItemPrices>(itemPrice);
                    itemPriceObj.AppItemCode = input.Code;
                    itemPriceObj.AppItemId = appItem.Id;
                    if (itemPriceObj.TenantId == null)
                        itemPriceObj.TenantId = AbpSession.TenantId;
                    if (itemPriceObj.Id == 0)
                        await _appItemPricesRepository.InsertAsync(itemPriceObj);
                    else
                        await _appItemPricesRepository.UpdateAsync(itemPriceObj);
                }
            }
            if (input.AppItemSizesScaleInfo != null && input.AppItemSizesScaleInfo.Count() > 0)
            {

                // Synchronize item size-scale headers and details, including soft-deleting removed detail rows.
                var idList = input.AppItemSizesScaleInfo.Select(a => a.Id).ToList().Distinct();
                string ids = string.Join(",", idList);
                var sizeScales = await _appItemSizeScalesHeaderRepository.GetAll().Where(a => a.AppItemId == appItem.Id).AsNoTracking()
                                 .Include(a => a.AppItemSizeScalesDetails).AsNoTracking().ToListAsync();
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
                        if (scaleHeader.TenantId == null)
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
                            if (size.TenantId == null)
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
                        if (scaleHeader.TenantId == null)
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
                        var sizeScaleObj = _appItemSizeScalesHeaderRepository.GetAll()
                        .Where(a => a.AppItemId == appItem.Id & a.Id == sizeHead.Id).AsNoTracking()
                        .Include(a => a.AppItemSizeScalesDetails).AsNoTracking().FirstOrDefault();

                        var sizeIdList = sizeHead.AppSizeScalesDetails.Select(a => a.SizeCode + "-" + (a.DimensionName == null ? "" : a.DimensionName)).ToList().Distinct();
                        string sizeids = string.Join(",", sizeIdList);

                        foreach (var size in sizeScaleObj.AppItemSizeScalesDetails)
                        {
                            if (!sizeids.Contains(size.SizeCode.ToString() + "-" + (size.DimensionName == null ? "" : size.DimensionName)))
                            {
                                var sz = ObjectMapper.Map<AppSizeScalesDetailDto>(size);
                                var sizeObject = ObjectMapper.Map<AppItemSizeScalesDetails>(sz);
                                sizeObject.IsDeleted = true;
                                if (sizeObject.TenantId == null)
                                    sizeObject.TenantId = AbpSession.TenantId;
                                sizeObject.SizeScaleId = sizeScaleObj.Id;
                                await _appItemSizeScalesDetailRepository.UpdateAsync(sizeObject);
                            }
                        }


                        foreach (var sizObj in sizeHead.AppSizeScalesDetails)
                        {
                            var sizeObject = ObjectMapper.Map<AppItemSizeScalesDetails>(sizObj);
                            if (sizeObject.TenantId == null)
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
                }

            }
            else
            {
                // No size-scale data was submitted, so remove all item size-scale headers.
                await _appItemSizeScalesHeaderRepository.DeleteAsync(z => z.AppItemId == appItem.Id);
            }


            await CurrentUnitOfWork.SaveChangesAsync();

            if (!input.SkipGenerateSsin && input.VariationItems != null && input.VariationItems.Any())
            {
                await _backgroundJobManager.EnqueueAsync<GenerateVariationSsinsJob, GenerateVariationSsinsJobArgs>(
                    new GenerateVariationSsinsJobArgs
                    {
                        ParentItemId = appItem.Id,
                        ObjectTypeId = itemObjectId,
                        TenantId = AbpSession.TenantId
                    });
            }

            // Queue attachment file moves after database changes have been persisted without blocking the save response.
            if (pendingFileMoves.Count > 0)
            {
                var fileMovesToRun = pendingFileMoves.ToList();
                _ = Task.Run(() =>
                {
                    foreach (var moveAction in fileMovesToRun)
                    {
                        try
                        {
                            moveAction();
                        }
                        catch (Exception)
                        {
                        }
                    }
                });
            }

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
                    //XX
                    if (publishItem.Variations != null)
                        //XX
                        publishItem.Variations.Replace($"/{publishItem.TenantId.ToString()}/", "/-1/");
                    publishItem.TenantId = null;
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

                }
                else
                {

                    await _appItemPricesRepository.DeleteAsync(x => x.AppItemId == publishItem.Id);
                    publishedEntityId = publishItem.EntityId;
                    ObjectMapper.Map(listingItem, publishItem);

                    //XX
                    publishItem.ItemPricesFkList = listingItem.ItemPricesFkList;
                    publishItem.ItemPricesFkList.ForEach(a => a.TenantId = null);
                    publishItem.ItemPricesFkList.ForEach(a => a.Id = 0);
                    publishItem.ItemPricesFkList.ForEach(a => a.AppItemId = publishItem.Id);

                }

                publishItem.ListingItemId = null;
                publishItem.ItemType = 2;

                publishItem.SharingLevel = input.SharingLevel;
                publishItem.PublishedListingItemId = input.ListingItemId;


                AppEntityDto entityDto = new AppEntityDto();
                ObjectMapper.Map(listingItem.EntityFk, entityDto);
                entityDto.Id = 0;
                entityDto.TenantId = null;
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
                    ObjectMapper.Map(child, publishChild);
                    publishChild.ParentId = publishItem.Id;
                    publishChild.ParentEntityId = publishItem.EntityId;
                    publishChild.SharingLevel = input.SharingLevel;
                    publishChild.ListingItemId = null;
                    publishChild.PublishedListingItemId = child.Id;
                    publishChild.ItemType = 2;
                    publishChild.TenantId = null;
                    publishChild.ItemPricesFkList = child.ItemPricesFkList;
                    publishChild.ItemPricesFkList.ForEach(a => a.TenantId = null);
                    publishChild.ItemPricesFkList.ForEach(a => a.Id = 0);
                    publishChild.ItemPricesFkList.ForEach(a => a.AppItemId = publishChild.Id);

                    var savedEntityChild = await _appEntitiesAppService.SaveEntity(entityChildDto);
                    publishChild.EntityId = savedEntityChild;

                    if (publishChild.Id == 0)
                    {
                        publishChild = await _appItemRepository.InsertAsync(publishChild);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }

                //send notification to the users

            }
        }
        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Publish)]
        public async Task MakeProductPrivate(long appItemId)
        {
            await UpdateMarketplaceSharingLevelForItemAndChildren(appItemId, 3);
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
        public async Task<long> SyncSelectedProduct(Guid key)//long appItemId)
        {
            long returnCount = 0;
            var apptemSelector = from o in _appItemSelectorRepository.GetAll().Where(e => e.Key == key)
                                 join i in _appItemRepository.GetAll().Include(z => z.EntityFk) on o.SelectedId equals i.Id into j
                                 from j1 in j
                                 select new { item = j1 };

            var selectedItems = apptemSelector.ToList(); //3194a542-2d03-13c2-82f3-6914504839dd
            if (selectedItems != null && selectedItems.Count > 0)
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {

                    foreach (var itm in selectedItems)
                    {
                        if (itm.item.SSIN == null)
                            continue;
                        var sharedItem = _appMarketplaceItem.GetAll().Where(z => z.SSIN == itm.item.SSIN).FirstOrDefault();
                        if (sharedItem != null && sharedItem.TimeStamp < itm.item.EntityFk.TimeStamp)
                        {
                            returnCount++;
                            await SyncProduct(itm.item.Id);
                        }
                    }
                }
            }
            return returnCount;
        }
        [AbpAuthorize(AppPermissions.Pages_AppItems_Publish)]
        public async Task UnHideProduct(long appItemId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var parentSsin = await _appItemRepository.GetAll().AsNoTracking()
                    .Where(x => x.Id == appItemId)
                    .Select(x => x.SSIN)
                    .FirstOrDefaultAsync();

                if (string.IsNullOrEmpty(parentSsin))
                    return;

                var sharingLevel = await _appMarketplaceItemSharing.GetAll().AsNoTracking()
                    .AnyAsync(x => x.AppMarketplaceItemIdFk.Code == parentSsin) ? (byte)2 : (byte)1;

                await UpdateMarketplaceSharingLevelForItemAndChildren(appItemId, sharingLevel);
            }
        }
        [AbpAuthorize(AppPermissions.Pages_AppItems_Publish)]
        public async Task HideProduct(long appItemId)
        {
            await UpdateMarketplaceSharingLevelForItemAndChildren(appItemId, 4);
        }

        private async Task<List<string>> GetItemAndChildSsins(long appItemId)
        {
            var ssins = await _appItemRepository.GetAll().AsNoTracking()
                .Where(x => x.Id == appItemId || x.ParentId == appItemId)
                .Select(x => x.SSIN)
                .Where(x => !string.IsNullOrEmpty(x))
                .ToListAsync();

            return ssins.Distinct().ToList();
        }

        private async Task UpdateMarketplaceSharingLevelForItemAndChildren(long appItemId, byte sharingLevel)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var ssins = await GetItemAndChildSsins(appItemId);
                if (ssins.Count == 0)
                    return;

                var appItems = await _appItemRepository.GetAll()
                    .Where(x => x.Id == appItemId || x.ParentId == appItemId)
                    .ToListAsync();

                foreach (var appItem in appItems)
                {
                    appItem.SharingLevel = sharingLevel;
                }

                var marketplaceItems = await _appMarketplaceItem.GetAll()
                    .Where(x => ssins.Contains(x.Code))
                    .ToListAsync();

                foreach (var marketplaceItem in marketplaceItems)
                {
                    marketplaceItem.SharingLevel = sharingLevel;
                }

                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        private async Task<bool> TryUpdateMarketplaceSharingOptions(SharingItemOptions input)
        {
            if (input.SyncProduct)
                return false;

            var sourceItem = await _appItemRepository.GetAll().AsNoTracking()
                .Where(x => x.Id == input.AppItemId)
                .Select(x => new { x.SSIN, x.Code, x.TenantId })
                .FirstOrDefaultAsync();

            if (sourceItem == null || string.IsNullOrEmpty(sourceItem.SSIN))
                return false;

            var marketplaceItem = await _appMarketplaceItem.GetAll().AsNoTracking()
                .Where(x => x.Code == sourceItem.SSIN || (x.ManufacturerCode == sourceItem.Code && x.TenantOwner == sourceItem.TenantId))
                .Select(x => new { x.Id, x.Code })
                .FirstOrDefaultAsync();

            if (marketplaceItem == null)
                return false;

            var ssins = await GetItemAndChildSsins(input.AppItemId);
            var appItems = await _appItemRepository.GetAll()
                .Where(x => x.Id == input.AppItemId || x.ParentId == input.AppItemId)
                .ToListAsync();

            foreach (var appItem in appItems)
            {
                appItem.SharingLevel = input.SharingLevel;
            }

            var marketplaceItems = await _appMarketplaceItem.GetAll()
                .Where(x => ssins.Contains(x.Code))
                .ToListAsync();

            foreach (var item in marketplaceItems)
            {
                item.SharingLevel = input.SharingLevel;
            }

            await _appMarketplaceItemSharing.DeleteAsync(x => x.AppMarketplaceItemId == marketplaceItem.Id);
            if (input.ItemSharing != null)
            {
                foreach (var sharingDto in input.ItemSharing)
                {
                    var sharing = ObjectMapper.Map<AppMarketplaceItemSharings>(sharingDto);
                    sharing.Id = 0;
                    sharing.AppMarketplaceItemId = marketplaceItem.Id;
                    sharing.AppMarketplaceItemListId = null;
                    await _appMarketplaceItemSharing.InsertAsync(sharing);
                }
            }

            await CurrentUnitOfWork.SaveChangesAsync();
            return true;
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
        public async Task<long> ShareSelectedProducts(Guid key)
        {
            long returnCount = 0;
            var apptemSelector = from o in _appItemSelectorRepository.GetAll().Where(e => e.Key == key)
                                 join i in _appItemRepository.GetAll() on o.SelectedId equals i.Id into j
                                 from j1 in j
                                 select new { item = j1 };

            var selectedItems = await apptemSelector
                .AsNoTracking()
                .ToListAsync(); //3194a542-2d03-13c2-82f3-6914504839dd

            if (selectedItems.Count > 0)
            {
                foreach (var itm in selectedItems)
                {
                    if (string.IsNullOrEmpty(itm.item.SSIN))
                        continue;

                    try
                    {
                        // Keep every product in an independent transaction. A constraint or
                        // data failure rolls back only this product and does not poison the
                        // DbContext used for the remaining selection.
                        using (var itemUnitOfWork = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew))
                        {
                            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                            {
                                SharingItemOptions shareOp = new SharingItemOptions
                                {
                                    AppItemId = itm.item.Id,
                                    SharingLevel = 1,
                                    SyncProduct = false,
                                    ItemSharing = new List<ItemSharingDto>()
                                };

                                await ShareProduct(shareOp);
                                await itemUnitOfWork.CompleteAsync();
                            }
                        }

                        returnCount++;
                    }
                    catch (Exception ex)
                    {
                        Logger.Error($"Failed to share selected product {itm.item.Id} (SSIN: {itm.item.SSIN}). Continuing with the remaining products.", ex);
                    }
                }
            }
            return returnCount;
        }
        [AbpAuthorize(AppPermissions.Pages_AppItems_Publish)]
        public async Task ShareProduct(SharingItemOptions input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);

                if (await TryUpdateMarketplaceSharingOptions(input))
                    return;

                if (!input.SyncProduct)
                    await UpdateMarketplaceSharingLevelForItemAndChildren(input.AppItemId, input.SharingLevel);

                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var appItem = await _appItemRepository.GetAll().AsNoTracking()
                    .Include(x => x.EntityFk).AsNoTracking()
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityCategories)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships) // Iteration49 while 
                    //Mariam
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)//.ThenInclude(x => x.EntityObjectTypeFk)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                    //Mariam
                    .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    //Mariam
                    .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)//.ThenInclude(x => x.EntityObjectTypeFk)
                    .Include(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                    .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.AppItemId);
                    //XX
                    AppMarketplaceItems.AppMarketplaceItems marketplaceItemObject = null;
                    long publishedEntityId = 0;
                    byte sharingLevel = 0;

                    appItem.ItemSizeScaleHeadersFkList = await _appItemSizeScalesHeaderRepository.GetAll()
                        .Include(a => a.AppItemSizeScalesDetails).AsNoTracking().Where(a => a.AppItemId == input.AppItemId).ToListAsync();
                    appItem.ItemPricesFkList = await _appItemPricesRepository.GetAll().AsNoTracking().Where(a => a.AppItemId == input.AppItemId).ToListAsync();
                    EnsureDefaultPrices(appItem.ItemPricesFkList);
                    var itemObjectId = await _helper.SystemTables.GetObjectListingId();
                    List<AppMarketplaceItems.AppMarketplaceItems> children = new List<AppMarketplaceItems.AppMarketplaceItems>();
                    //XX
                    //MD
                    var marketplaceItems = await _appMarketplaceItem.GetAll().Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList)
                        .Include(a => a.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)
                        .Where(x => x.Code == appItem.SSIN || (x.ManufacturerCode == appItem.Code && x.TenantOwner == appItem.TenantId)).ToListAsync();
                    if (marketplaceItems != null && marketplaceItems.Count > 1)
                    {
                        foreach (var markItem in marketplaceItems.Where(z => z.Code != z.SSIN).ToList())
                        {
                            await _appMarketplaceItem.DeleteAsync(markItem);
                        }
                        await CurrentUnitOfWork.SaveChangesAsync();

                        var marketplaceItemsList = await _appMarketplaceItem.GetAll().Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList)
                       .Include(a => a.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)
                       .Where(x => x.Code == appItem.SSIN || (x.ManufacturerCode == appItem.Code && x.TenantOwner == appItem.TenantId)).ToListAsync();
                        if (marketplaceItemsList != null && marketplaceItemsList.Count > 1)
                        {
                            int cntt = 0;
                            foreach (var markItem in marketplaceItemsList)
                            {
                                cntt++;
                                if (cntt == 1)
                                {
                                    continue;
                                }
                                await _appMarketplaceItem.DeleteAsync(markItem);

                            }
                        }
                    }

                    //MD
                    AppMarketplaceItems.AppMarketplaceItems marketplaceItem = await _appMarketplaceItem.GetAll().Include(x => x.ParentFkList).ThenInclude(x => x.ItemPricesFkList)
                        .Include(a => a.ItemSizeScaleHeadersFkList).ThenInclude(a => a.AppItemSizeScalesDetails)
                        .Where(x => x.Code == appItem.SSIN || (x.ManufacturerCode == appItem.Code && x.TenantOwner == appItem.TenantId)).FirstOrDefaultAsync();

                    if (marketplaceItem == null || marketplaceItem.Id == 0)
                    {

                        marketplaceItem = ObjectMapper.Map<onetouch.AppMarketplaceItems.AppMarketplaceItems>(appItem);
                        marketplaceItem.Id = 0;
                        marketplaceItem.ObjectId = itemObjectId;
                        //XX
                        if (marketplaceItem.Variations != null)
                            //XX
                            marketplaceItem.Variations.Replace($"/{marketplaceItem.TenantId.ToString()}/", "/-1/");
                        marketplaceItem.TenantId = null;
                        marketplaceItem.SSIN = appItem.SSIN;  //await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                        x.ChangeTracker.Clear();
                        marketplaceItem.TenantOwner = int.Parse(appItem.TenantId.ToString());
                        //XX
                        marketplaceItem.ItemPricesFkList = ObjectMapper.Map<List<AppMarketplaceItemPrices>>(appItem.ItemPricesFkList);
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
                            sizeScaleMarketplace.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
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
                    //Iteration 49
                    .Include(x => x.EntitiesRelationships)
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
                            //iteration 49 remove market place item old relation
                            if (marketplaceItemObject.EntitiesRelationships != null)
                            {
                                foreach (var clas in marketplaceItemObject.EntitiesRelationships)
                                {
                                    await _appEntitiesRelationship.DeleteAsync(clas);
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
                        //i45
                        marketplaceItem.TimeStamp = appItem.EntityFk.TimeStamp;
                        //i45
                    }
                    marketplaceItem.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                    if (!input.SyncProduct)
                        marketplaceItem.SharingLevel = input.SharingLevel;
                    else
                        marketplaceItem.SharingLevel = sharingLevel;

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
                            //check if the related item publisehd or not
                            //rela.RelatedEntityId
                            var appItemForEntity = _appItemRepository.GetAll()
                                .Where(e => e.EntityId == rela.RelatedEntityId).FirstOrDefault();
                            if (appItemForEntity != null)
                            {
                                var appMarketplaceItem = await _appMarketplaceItem.GetAll()
                                .Where(x => x.Code == appItemForEntity.SSIN || (x.ManufacturerCode == appItemForEntity.Code && x.TenantOwner == appItemForEntity.TenantId)).FirstOrDefaultAsync();
                                if (appMarketplaceItem != null)
                                {
                                    rela.RelatedEntityId = appMarketplaceItem.Id;
                                    rela.RelatedEntityCode = appMarketplaceItem.Code;
                                }
                                else
                                {
                                    rela.RelatedEntityId = 0;
                                }
                            }
                        }
                        var notSharedRelated = marketplaceItem.EntitiesRelationships.Where(e => e.RelatedEntityId == 0).ToList();
                        foreach (var rela in notSharedRelated)
                        { marketplaceItem.EntitiesRelationships.Remove(rela); }


                    }


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
                        }
                    }

                    if (marketplaceItem.Id == 0)
                    {
                        marketplaceItem.ItemSizeScaleHeadersFkList = null;
                        var entityObjType = await _sycEntityObjectTypeRepository.GetAll().AsNoTracking().Where(z => z.Id == marketplaceItem.EntityObjectTypeId)
                               .AsNoTracking().FirstOrDefaultAsync();
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
                        if (appItem.ItemSizeScaleHeadersFkList.Count > 0)
                        {
                            marketplaceItem.ItemSizeScaleHeadersFkList = null;
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
                                        sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
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


                            if (appItem.ItemSizeScaleHeadersFkList.Count > 0)
                            {
                                marketplaceItem.ItemSizeScaleHeadersFkList = null;
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
                                            sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                            sizeRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = 0);
                                            marketplaceItem.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                                        }
                                    }
                                }
                            }
                            await _appMarketplaceItem.UpdateAsync(marketplaceItem);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                    }

                    //Delete removed child items
                    if (marketplaceItem != null && publishedEntityId != 0 && children != null && children.Count > 0)  //&& marketplaceItem.ParentFkList != null
                    {
                        x.ChangeTracker.Clear();
                        var itemIds = appItem.ParentFkList.Select(x => x.SSIN).ToArray();
                        var existedIds = children.Select(z => z.Code).ToArray();
                        var toBeDeletedIds = _appMarketplaceItem.GetAll().Where(x => existedIds.Contains(x.Code) && !itemIds.Contains(x.Code)).Select(x => x.Id).ToArray();
                        var toBeEntitiesDeletedIds = _appItemRepository.GetAll().Where(x => toBeDeletedIds.Contains(x.Id)).Select(x => x.EntityId).ToArray();

                        await _appMarketplaceItem.DeleteAsync(x => toBeDeletedIds.Contains(x.Id));

                        await _appMarketplaceItemPricesRepository.DeleteAsync(x => toBeDeletedIds.Contains(x.AppMarketplaceItemId));

                        await x.SaveChangesAsync();
                        //XX
                    }


                    foreach (var child in appItem.ParentFkList)
                    {
                        if (string.IsNullOrWhiteSpace(child.SSIN))
                        {
                            Logger.Warn($"Child item {child.Id} was not shared because it has no SSIN.");
                            continue;
                        }

                        var marketplaceCode = child.SSIN;
                        child.ItemPricesFkList = await _appItemPricesRepository.GetAll().AsNoTracking().Where(a => a.AppItemId == child.Id).ToListAsync();
                        EnsureDefaultPrices(child.ItemPricesFkList);
                        AppMarketplaceItems.AppMarketplaceItems publishChild = new AppMarketplaceItems.AppMarketplaceItems(); ;
                        if (publishedEntityId != 0)
                            publishChild = await _appMarketplaceItem.GetAll().Include(x => x.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                                .Include(z => z.EntityExtraData).Include(z => z.ItemPricesFkList)
                                .Where(x => x.Code == marketplaceCode).FirstOrDefaultAsync();
                        long publishId = 0;
                        if (publishChild == null)
                            publishChild = new AppMarketplaceItems.AppMarketplaceItems();
                        else
                        {
                            publishId = publishChild.Id;

                        }
                        string newSSIN = "";
                        if (publishId == 0)
                        {
                            newSSIN = child.SSIN;//await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                        }
                        else
                        {
                            newSSIN = publishChild.SSIN;
                            //SS
                            if (publishChild.ItemPricesFkList != null)
                            {
                                foreach (var itemPrice in publishChild.ItemPricesFkList)
                                {
                                    await _appMarketplaceItemPricesRepository.DeleteAsync(a => a.Id == itemPrice.Id);
                                }
                            }
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
                        publishChild.Code = marketplaceCode;

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


                        publishChild.Id = publishId;
                        publishChild.ObjectId = itemObjectId;
                        publishChild.ParentId = marketplaceItem.Id;
                        publishChild.Notes = child.EntityFk.Notes;
                        publishChild.Name = child.Name;
                        publishChild.Name = marketplaceItem.Name;
                        publishChild.Notes = marketplaceItem.Notes;
                        //i45
                        publishChild.TimeStamp = child.EntityFk.TimeStamp;
                        if (!input.SyncProduct)
                            publishChild.SharingLevel = input.SharingLevel;
                        else
                            publishChild.SharingLevel = sharingLevel;
                        publishChild.TenantId = null;
                        publishChild.SSIN = newSSIN; // await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                        publishChild.TenantOwner = int.Parse(child.TenantId.ToString());
                        publishChild.ItemPricesFkList = ObjectMapper.Map<List<AppMarketplaceItemPrices>>(child.ItemPricesFkList);
                        publishChild.ItemPricesFkList.ForEach(a => a.Id = 0);
                        publishChild.ItemPricesFkList.ForEach(a => a.AppMarketplaceItemId = publishChild.Id);
                        publishChild.ParentFk = null;


                        if (publishChild.Id == 0)
                        {


                            publishChild = await _appMarketplaceItem.InsertAsync(publishChild);
                            await x.SaveChangesAsync();
                            if (child.EntityFk.EntityExtraData != null)
                            {
                                publishChild.EntityExtraData = new List<AppEntityExtraData>();
                                x.ChangeTracker.Clear();
                                foreach (var chEx in child.EntityFk.EntityExtraData)
                                {
                                    //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[Start]
                                    if (chEx.AttributeId == 202 && !string.IsNullOrEmpty(chEx.AttributeValue))
                                        MoveFile(chEx.AttributeValue, AbpSession.TenantId, -1);
                                    //T-SII-20230818.0003,1 MMT 08/23/2023 Display the Product Solid color or image in the Marketplace product detail page[End]
                                    chEx.Id = 0;
                                    chEx.EntityCode = publishChild.Code;
                                    chEx.EntityId = publishChild.Id;
                                    chEx.EntityObjectTypeFk = null;
                                    publishChild.EntityExtraData.Add(chEx);


                                }
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

                }
            }

        }
        private static void EnsureDefaultPriceInfos(IEnumerable<AppItemPriceInfo> prices, string currencyCode)
        {
            if (prices == null)
                return;

            var priceList = prices.ToList();
            foreach (var price in priceList.Where(x => !string.IsNullOrEmpty(currencyCode) && x.CurrencyCode == currencyCode))
            {
                price.IsDefault = true;
            }

            foreach (var priceGroup in priceList.Where(x => !string.IsNullOrEmpty(x.Code)).GroupBy(x => x.Code))
            {
                if (!priceGroup.Any(x => x.IsDefault))
                    priceGroup.First().IsDefault = true;
            }

            foreach (var buyerGroup in priceList.Where(x => !string.IsNullOrEmpty(x.BuyerSSIN)).GroupBy(x => x.BuyerSSIN))
            {
                if (!buyerGroup.Any(x => x.IsDefault))
                    buyerGroup.First().IsDefault = true;
            }
        }

        private static void EnsureDefaultPrices(IEnumerable<AppItemPrices> prices)
        {
            if (prices == null)
                return;

            var priceList = prices.ToList();
            foreach (var priceGroup in priceList.Where(x => !string.IsNullOrEmpty(x.Code)).GroupBy(x => x.Code))
            {
                if (!priceGroup.Any(x => x.IsDefault))
                    priceGroup.First().IsDefault = true;
            }

            foreach (var buyerGroup in priceList.Where(x => !string.IsNullOrEmpty(x.BuyerSSIN)).GroupBy(x => x.BuyerSSIN))
            {
                if (!buyerGroup.Any(x => x.IsDefault))
                    buyerGroup.First().IsDefault = true;
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
        private async Task SaveSharingOptions(PublishItemOptions input)
        {


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
                //T-SII-20240125.0003,1 MMT 02/14/2024 - Seller showroom - Deleted products still showing in the marketplace seller showroom[Start]
                var marketplaceItem = await _appMarketplaceItem.GetAll().AsNoTracking().Where(a => a.Code == item.SSIN).FirstOrDefaultAsync();
                if (marketplaceItem != null)
                {
                    await HideProduct(item.Id);
                }
                //T-SII-20240125.0003,1 MMT 02/14/2024 - Seller showroom - Deleted products still showing in the marketplace seller showroom[End]
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
                if (!productTypeId.HasValue)
                {
                    throw new UserFriendlyException("Product type is required.");
                }

                #region get lookups
                var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                var currencyTypeId = await _helper.SystemTables.GetEntityObjectTypeCurrencyId();

                // The workbook only needs codes/names. Avoid loading tree nodes, localization
                // joins, child collections, and currency extra data.
                List<string> currencyCodes = await _appEntityRepository.GetAll()
                    .AsNoTracking()
                    .Where(x => x.EntityObjectTypeId == currencyTypeId &&
                                (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                    .OrderBy(x => x.Name)
                    .Select(x => x.Code)
                    .ToListAsync();

                List<string> departmentCodes = await _sycEntityObjectCategoryRepository.GetAll()
                    .AsNoTracking()
                    .Where(x => x.ObjectId == itemObjectId && x.ParentId == null && x.TenantId == null)
                    .OrderBy(x => x.Name)
                    .Select(x => x.Code)
                    .ToListAsync();

                List<string> classificationCodes = await _sycEntityObjectClassificationRepository.GetAll()
                    .AsNoTracking()
                    .Where(x => x.ObjectId == itemObjectId && x.ParentId == null &&
                                (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                    .OrderBy(x => x.Name)
                    .Select(x => x.Code)
                    .ToListAsync();

                List<string> categoryCodes = await _sycEntityObjectCategoryRepository.GetAll()
                    .AsNoTracking()
                    .Where(x => x.ObjectId == itemObjectId && x.ParentId == null &&
                                x.TenantId == AbpSession.TenantId)
                    .OrderBy(x => x.Name)
                    .Select(x => x.Code)
                    .ToListAsync();

                List<string> productTypes = await _sycEntityObjectCategoryRepository.GetAll()
                    .AsNoTracking()
                    .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null)
                    .OrderBy(x => x.Name)
                    .Select(x => x.Name)
                    .ToListAsync();

                List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();

                var entityObjectExtraAttribute = (await _SycEntityObjectTypesAppService
                    .GetAllWithExtraAttributes(productTypeId.Value))
                    .FirstOrDefault();

                var lookupTypeCodes = entityObjectExtraAttribute?.ExtraAttributes?.ExtraAttributes?
                    .Where(x => x.IsLookup && !string.IsNullOrWhiteSpace(x.EntityObjectTypeCode))
                    .Select(x => x.EntityObjectTypeCode)
                    .Distinct()
                    .ToList() ?? new List<string>();

                var lookupEntries = await _appEntityRepository.GetAll()
                    .AsNoTracking()
                    .Where(x => lookupTypeCodes.Contains(x.EntityObjectTypeCode) &&
                                (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                    .OrderBy(x => x.Name)
                    .Select(x => new
                    {
                        x.EntityObjectTypeCode,
                        x.Code,
                        Label = x.Name
                    })
                    .ToListAsync();

                var lookupEntriesByTypeCode = lookupEntries
                    .GroupBy(x => x.EntityObjectTypeCode)
                    .ToDictionary(x => x.Key, x => x.ToList());
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
                            Sheet.Cell(0, start).Value = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].Name + " " + "code";
                            Sheet.Range(0, start, 0, start).FillPatternForeColor = System.Drawing.Color.FromArgb(146, 208, 80);
                            Sheet.Cell(0, start).SetFontProperties("Calibri", false, false, false, 11, 0, 0, 0);
                            start += 1;
                            Sheet.Cell(0, start).Value = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].Name + " " + "name";
                            Sheet.Range(0, start, 0, start).FillPatternBackColor = System.Drawing.Color.FromArgb(146, 208, 80);
                            Sheet.Cell(0, start).SetFontProperties("Calibri", false, false, false, 11, 0, 0, 0);
                            start += 1;
                        }
                    }

                }


                #endregion fill accounts valid entries

                #region fill valid entries sheet
                // Get worksheet by name [Accounts]
                Worksheet Sheetvalid = document.Workbook.Worksheets.ByName("Valid Entries");

                string column = "B";
                int row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Product Type";
                row = 3;
                foreach (var productType in productTypes)
                {


                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = productType;
                }

                column = "C";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Currency";
                row = 3;
                foreach (var currencyCode in currencyCodes)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = currencyCode;
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
                foreach (var departmentCode in departmentCodes)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = departmentCode;
                }
                // Language 
                column = "F";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Classification";
                row = 3;
                foreach (var classificationCode in classificationCodes)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = classificationCode;
                }
                // Country 
                column = "G";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Category";
                row = 3;
                foreach (var categoryCode in categoryCodes)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = categoryCode;
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
                        var lookupTypeCode = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes[exAtr].EntityObjectTypeCode;
                        if (lookupEntriesByTypeCode.TryGetValue(lookupTypeCode, out var returnValues) &&
                            returnValues.Count > 0)
                        {
                            Sheetvalid.Cell(row, startCol).Value = lookupTypeCode + " Code";
                            Sheetvalid.Cell(row, startCol).SetFontProperties("Calibri", true, false, false, 11, 0, 0, 0);
                            Sheetvalid.Cell(row, startCol + 1).Value = lookupTypeCode + " Description";
                            Sheetvalid.Cell(row, startCol + 1).SetFontProperties("Calibri", true, false, false, 11, 0, 0, 0);
                            row = 2;
                            foreach (var val in returnValues)
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
            AppItemExcelResultsDTO itemExcelResultsDTO = new AppItemExcelResultsDTO();
            itemExcelResultsDTO.ExcelRecords = new List<AppItemtExcelRecordDTO>();

            if (!string.IsNullOrEmpty(guidFile))
            {
                string currentExcelTemplateVersion = _appConfiguration[$"ItemTemplates:ItemExcelTemplateVersion:CurrentVersion"];
                string validExcelTemplates = _appConfiguration[$"ItemTemplates:ItemExcelTemplateVersion:SupportedVersions"];

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
                    PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());

                    PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> categoriesIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });
                    // get Product Categories
                    List<SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto> productTypes = await _sycEntityObjectCategoriesAppService.GetAllSycEntityObjectCategoryForTableDropdown();

                    List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();

                    string productType = ds.Tables["Products"].Rows[1].ItemArray[0].ToString();
                    GetAllEntityObjectTypeOutput productTypeId = null;
                    if (!string.IsNullOrEmpty(productType))
                    {
                        var pdtyp = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(productType);
                        productTypeId = pdtyp.FirstOrDefault();
                    }
                    else
                    {
                        var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                        var defaultProductType = _sycEntityObjectTypeRepository.GetAll().Where(x => x.ObjectId == itemObjectId && x.IsDefault == true).Select(z => z.Code).FirstOrDefault();
                        if (defaultProductType == null)
                            throw new UserFriendlyException("No Product type is marked as default.");
                        else
                        {
                            var pdtyp = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(defaultProductType);
                            productTypeId = pdtyp.FirstOrDefault();
                            for (int cnt = 1; cnt < ds.Tables["Products"].Rows.Count; cnt++)
                            {
                                ds.Tables["Products"].Rows[cnt]["ProductType"] = defaultProductType;
                            }

                        }
                    }
                    var productColumn = ds.Tables["Products"].Columns["ProductType"];
                    if (productColumn == null)
                        throw new UserFriendlyException("Product Type column is missing.");

                    var colData = ds.Tables["Products"].DefaultView.ToTable(true, new string[] { "ProductType" });

                    if (colData.Rows.Count > 2)
                        throw new UserFriendlyException("Product Type column must have the same value in all data rows.");

                    if (productTypeId == null)
                        throw new UserFriendlyException("Invalid Product Type");
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

                        {
                            foreach (DataRow itemExcelDto in ds.Tables["Products"].Rows)
                            {
                                if (itemExcelDto["RecordType"].ToString() == "Color")
                                {
                                    itemExcelDto["Code"] = "-";
                                    itemExcelDto["Name"] = "-";
                                    itemExcelDto["ProductDescription"] = " - ";
                                    itemExcelDto["Price"] = "1";
                                    itemExcelDto["ParentCode"] = " - ";
                                    itemExcelDto["PriceCurrencyCode"] = " - ";
                                }
                            }
                        }

                        result = mapper.Map<List<DataRow>, List<AppItemExcelDto>>(new List<DataRow>(ds.Tables[0].Rows.OfType<DataRow>()));
                        int index = -1;
                        foreach (DataRow itemExcelDto in ds.Tables["Products"].Rows)
                        {
                            index++;
                            if (itemExcelDto["RecordType"].ToString() == "Color")
                            {

                                result[index].ColorCode = itemExcelDto["COLORCode"].ToString();
                                result[index].ColorName = itemExcelDto["COLORName"].ToString();
                            }
                        }
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


                    itemExcelResultsDTO.TotalRecords = result.Count();
                    itemExcelResultsDTO.TotalPassedRecords = 0;
                    itemExcelResultsDTO.TotalFailedRecords = 0;
                    itemExcelResultsDTO.FilePath = path;
                    itemExcelResultsDTO.ExcelRecords = new List<AppItemtExcelRecordDTO>() { };
                    #region Excel validation rules only.
                    List<string> RecordsCodes = result.Select(r => r.Code).ToList();
                    List<string> RecordsParentCodes = result.Select(r => r.ParentCode).ToList();
                    var validateContext = await BuildValidateImportItemDataContext(result, currencyIds, attachmentsCategories, classIds, categoriesIds);

                    List<ImportItemInputDto> x = new List<ImportItemInputDto>();
                    MapperConfiguration configurationMap;
                    configurationMap = new MapperConfiguration(a => { a.AddProfile(new AppItemExcelImportDtoProfile(entityExtraAttributes)); });
                    IMapper mapperc;
                    mapperc = configurationMap.CreateMapper();

                    foreach (AppItemExcelDto itemExcelDto in result)
                    {
                        if (itemExcelDto.ProductType == "Product Type")
                        {
                            continue;
                        }
                        List<ImportItemReturnDto> validationList = new List<ImportItemReturnDto>();
                        if (itemExcelDto.RecordType != "Color")
                        {
                            ImportItemInputDto importItemInputDto;
                            try
                            {
                                importItemInputDto = mapperc.Map<DataRow, ImportItemInputDto>(ds.Tables[0].Rows[rowNumber]);
                            }
                            catch (Exception exObj)
                            {
                                throw new UserFriendlyException("This Excel file format is invalid");
                            }
                            x.Add(importItemInputDto);

                            validationList = ValidateImportItemData(importItemInputDto, validateContext);
                        }

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


                        validateContext.ExistingItemsByNormalizedCode.TryGetValue(NormalizeImportCode(itemExcelDto.Code), out var itemExists);
                        //T-SII-20230330.0001,1 MMT 04/05/2023 -Delete an item , then import it again[End]
                        if (itemExists != null)
                        {
                            itemExcelDto.Id = itemExists.Id;
                            recordErrorMEssage = "Code :" + itemExcelDto.Code + " already exists!";
                            //T-SII-20231127.0003,1 MMT 01/01/2024 -Import products program-Validation Step-need to adjust the text appear on the validation step of import program - ( Code is already existing ) to (Code already exists)[End]
                            itemExcelResultsDTO.HasDuplication = true;
                            hasWarning = true;
                        }


                        itemExcelRecordErrorDTO.ExcelDto = itemExcelDto;


                        #region check images
                        bool hasError = false;

                        if (imagesList != null && imagesList.Count() > 0)
                        {
                            itemExcelDto.Images = new List<AppItemImage>();
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
                            if (itemExcelDto.RecordType == "Color")
                            {
                                var colorImage = imagesList.Where(x => x.ToUpper().StartsWith(("C-") + itemExcelDto.ColorCode.ToUpper())).ToList();
                                if (colorImage.Count == 0)
                                {

                                    {
                                        hasWarning = true;
                                        itemExcelRecordErrorDTO.FieldsErrors.Add("Color Code :" + itemExcelDto.ColorCode + " does not have an image in images folder.!");
                                        recordErrorMEssage = "Color Code :" + itemExcelDto.ColorCode + " does not have an image in images folder.!";
                                        itemExcelDto.Images.Add(new AppItemImage { ImageFileName = "noimage_item.jpg" });//, ImageGuid = (new Guid("noimage_item.jpg")).ToString() 
                                    }
                                }
                                else
                                {
                                    foreach (var img in colorImage)
                                    {
                                        itemExcelDto.Images.Add(new AppItemImage { ImageFileName = img });  //, ImageGuid = (new Guid(img)).ToString()
                                    }
                                    itemExcelDto.ImageFolderName = colorImage[0];

                                }
                            }

                        }
                        #endregion check images
                        if (validationList != null && validationList.Count > 0)
                        {
                            foreach (var err in validationList)
                            {
                                itemExcelRecordErrorDTO.FieldsErrors.Add(err.ErrorMessage);
                                switch (err.ErrorType)
                                {
                                    case "Warning":
                                        hasWarning = true;
                                        break;
                                    case "Stopper":
                                        hasError = true;
                                        break;
                                    case "Duplication":
                                        itemExcelResultsDTO.HasDuplication = true;
                                        break;
                                }
                            }
                        }
                        #region code, name, email and website validation    
                        ItemType itemExcelRecordType;


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
                    var childrenByParentCode = itemExcelResultsDTO.ExcelRecords
                        .Where(r => !string.IsNullOrWhiteSpace(r.ParentCode))
                        .GroupBy(r => r.ParentCode, StringComparer.OrdinalIgnoreCase)
                        .ToDictionary(r => r.Key, r => r.ToList(), StringComparer.OrdinalIgnoreCase);

                    foreach (AppItemtExcelRecordDTO itemExcelRecord in itemExcelResultsDTO.ExcelRecords)
                    {
                        if (itemExcelRecord.Status == ExcelRecordStatus.Failed.ToString() &&
                            !string.IsNullOrWhiteSpace(itemExcelRecord.Code) &&
                            childrenByParentCode.TryGetValue(itemExcelRecord.Code, out var childRecords))
                        {
                            childRecords.ForEach(r => r.Status = ExcelRecordStatus.Failed.ToString());
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
                    Sheet.Cell("AB1").Value = "Processing Status";
                    Sheet.Cell("AC1").Value = "Processing Error Message";
                    Sheet.Cell("AD1").Value = "Processing Error Details";
                    //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[End]
                    rowNumber = 1;
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
                        Sheet.Cell("AB" + rowNumber.ToString()).Value = logRecord.Status;
                        Sheet.Cell("AC" + rowNumber.ToString()).Value = logRecord.ErrorMessage;
                        Sheet.Cell("AD" + rowNumber.ToString()).Value = logRecord.FieldsErrors.ToList().JoinAsString(",");
                        //T-SII-20230407.0006,1 MMT 05/02/2023 Adjust the error log columns in the Excel log file[Start]
                    }
                    itemExcelResultsDTO.ToList.Add(rowNumber);
                    //move to attachment folder and save
                    itemExcelResultsDTO.FilePath = itemExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:PathTemp"], _appConfiguration[$"Attachment:Path"]);
                    string attachmentFolder = _appConfiguration[$"Attachment:Path"] + @"\" + tenantId;
                    System.IO.DirectoryInfo dire = new DirectoryInfo(attachmentFolder);
                    if (!dire.Exists)
                        dire.Create();
                    document.SaveAsXLSX(itemExcelResultsDTO.FilePath);

                    // Close document
                    document.Close();

                    itemExcelResultsDTO.ExcelLogDTO = new ExcelLogDto();

                    itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath = itemExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:Omitt"].ToString(), "");
                    itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath = itemExcelResultsDTO.ExcelLogDTO.ExcelLogPath.ToLower();
                    itemExcelResultsDTO.ExcelLogDTO.ExcelLogFileName = _appConfiguration[$"ItemTemplates:ItemExcelLogFileName"];
                    #endregion
                    ////I46 test


                }
                catch (Exception ex)
                {
                    throw new UserFriendlyException(ex.Message);
                }

            }


            #region Iteration 44 save not used images

            var imageUsages = itemExcelResultsDTO.ExcelRecords.Select(e => e).Where(e => e.ExcelDto.Images != null)
                .SelectMany(record => record.ExcelDto.Images
                    .Where(image => !string.IsNullOrWhiteSpace(image.ImageFileName))
                    .Select(image => new
                    {
                        ImageFileName = image.ImageFileName,
                        Code = record.Code,
                        Name = record.Name
                    }))
                .Distinct()
                .ToList();


            var uploadedImageNames = imagesList
                .Where(img => !string.IsNullOrWhiteSpace(img))
                .Select(img => img.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var usedImageNames = imageUsages
                .Select(x => x.ImageFileName.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            // An Excel image reference is not a successfully uploaded image unless
            // the corresponding file is also present in the selected folder.
            var uploadedImageUsages = imageUsages
                .Where(x => uploadedImageNames.Contains(x.ImageFileName.Trim()))
                .ToList();

            var uniqueImageFileNamesNotUsed = imagesList
                .Where(img => !string.IsNullOrWhiteSpace(img))
                .Where(img => !usedImageNames.Contains(img))
                .ToList();

            foreach (var img in uploadedImageUsages)
            {//add line to each image into the excel dto(s) to return to FE
                AppItemtExcelRecordDTO appItemExcelRecordDto = new AppItemtExcelRecordDTO();

                appItemExcelRecordDto.Status = "Passed";
                appItemExcelRecordDto.ErrorMessage = "";
                appItemExcelRecordDto.Code = img.Code;
                appItemExcelRecordDto.Name = img.Name;

                // Fill needed prop(s)
                appItemExcelRecordDto.ParentCode = "";
                appItemExcelRecordDto.image = img.ImageFileName;

                appItemExcelRecordDto.RecordType = "Image";
                appItemExcelRecordDto.ExcelDto = new AppItemExcelDto();
                appItemExcelRecordDto.ExcelDto.RecordType = "Image";
                appItemExcelRecordDto.ExcelDto.ProductType = "UnAssigned";

                appItemExcelRecordDto.ExcelDto.ProductDescription = "-";
                appItemExcelRecordDto.ExcelDto.Name = "-";
                appItemExcelRecordDto.ExcelDto.Code = "-";
                appItemExcelRecordDto.ExcelDto.ParentCode = "-";
                appItemExcelRecordDto.ExcelDto.ParentId = 0;


                appItemExcelRecordDto.ExcelDto.Actions = "";
                appItemExcelRecordDto.ExcelDto.ImagePreview = _appConfiguration[$"Attachment:PathTemp"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/" + img;

                itemExcelResultsDTO.ExcelRecords.Add(appItemExcelRecordDto);
            }

            foreach (var img in uniqueImageFileNamesNotUsed)
            {//add line to each image into the excel dto(s) to return to FE
                AppItemtExcelRecordDTO appItemExcelRecordDto = new AppItemtExcelRecordDTO();

                appItemExcelRecordDto.Status = "Failed";
                appItemExcelRecordDto.ErrorMessage = "Image is not linked to data";
                appItemExcelRecordDto.Code = "";
                appItemExcelRecordDto.Name = "";

                // Fill needed prop(s)
                appItemExcelRecordDto.ParentCode = "";

                appItemExcelRecordDto.image = img;

                appItemExcelRecordDto.RecordType = "Image";
                appItemExcelRecordDto.ExcelDto = new AppItemExcelDto();
                appItemExcelRecordDto.ExcelDto.RecordType = "Image";
                appItemExcelRecordDto.ExcelDto.ProductType = "UnAssigned";

                appItemExcelRecordDto.ExcelDto.ProductDescription = "-";
                appItemExcelRecordDto.ExcelDto.Name = "-";
                appItemExcelRecordDto.ExcelDto.Code = "-";

                appItemExcelRecordDto.ExcelDto.Actions = "";
                appItemExcelRecordDto.ExcelDto.ImagePreview = _appConfiguration[$"Attachment:PathTemp"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/" + img;

                itemExcelResultsDTO.ExcelRecords.Add(appItemExcelRecordDto);
            }

            #endregion Iteration 44 save not used images
            var resultKey = GetValidateExcelResultKey(guidFile);
            await SaveValidateExcelResultJson(itemExcelResultsDTO, resultKey);

            var pagedResult = CreateValidateExcelPagedResult(itemExcelResultsDTO, resultKey, 0, ValidateExcelDefaultPageSize);

            return pagedResult;
        }
        //Iteation#46[Start]
        private sealed class ValidateImportItemDataContext
        {
            public HashSet<string> CurrencyCodes { get; set; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            public Dictionary<string, ExistingImportItemInfo> ExistingItemsByNormalizedCode { get; set; } = new Dictionary<string, ExistingImportItemInfo>(StringComparer.OrdinalIgnoreCase);
            public HashSet<string> AttachmentCategoryCodes { get; set; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            public HashSet<string> ProductClassificationKeys { get; set; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            public HashSet<string> ProductCategoryKeys { get; set; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }

        private sealed class ExistingImportItemInfo
        {
            public long Id { get; set; }
        }

        private static string NormalizeImportCode(string code)
        {
            return string.IsNullOrWhiteSpace(code) ? string.Empty : code.Replace(" ", string.Empty).Trim();
        }

        private static void AddLookupKey(HashSet<string> keys, string value)
        {
            if (!string.IsNullOrWhiteSpace(value))
                keys.Add(value.Trim());
        }

        private const int ValidateExcelDefaultPageSize = 25;

        private string GetValidateExcelResultKey(string guidFile)
        {
            return string.IsNullOrWhiteSpace(guidFile) ? Guid.NewGuid().ToString("N") : guidFile.Trim();
        }

        private string GetValidateExcelResultPath(string resultKey)
        {
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            return Path.Combine(_appConfiguration[$"Attachment:PathTemp"], tenantId.ToString(), resultKey + ".validate-result.json");
        }

        private async Task SaveValidateExcelResultJson(AppItemExcelResultsDTO result, string resultKey)
        {
            var resultPath = GetValidateExcelResultPath(resultKey);
            var resultDirectory = Path.GetDirectoryName(resultPath);
            if (!Directory.Exists(resultDirectory))
                Directory.CreateDirectory(resultDirectory);

            result.ResultKey = resultKey;
            result.IsPagedResult = false;
            result.PageSkipCount = 0;
            result.PageMaxResultCount = 0;
            result.TotalDisplayRecords = result.ExcelRecords?.Count ?? 0;

            var json = JsonConvert.SerializeObject(result);
            await System.IO.File.WriteAllTextAsync(resultPath, json);
        }

        private async Task<AppItemExcelResultsDTO> LoadValidateExcelResultJson(string resultKey)
        {
            var resultPath = GetValidateExcelResultPath(resultKey);
            if (!System.IO.File.Exists(resultPath))
                throw new UserFriendlyException("Import validation result is expired or not found. Please validate the Excel file again.");

            var json = await System.IO.File.ReadAllTextAsync(resultPath);
            var result = JsonConvert.DeserializeObject<AppItemExcelResultsDTO>(json);
            if (result == null)
                throw new UserFriendlyException("Import validation result is invalid. Please validate the Excel file again.");

            result.ResultKey = resultKey;
            return result;
        }

        private AppItemExcelResultsDTO CreateValidateExcelPagedResult(AppItemExcelResultsDTO fullResult, string resultKey, int skipCount, int maxResultCount, string recordType = null)
        {
            skipCount = Math.Max(0, skipCount);
            maxResultCount = maxResultCount <= 0
                ? ValidateExcelDefaultPageSize
                : Math.Min(maxResultCount, ValidateExcelDefaultPageSize);

            var fullRecords = fullResult.ExcelRecords ?? new List<AppItemtExcelRecordDTO>();
            for (var index = 0; index < fullRecords.Count; index++)
                fullRecords[index].RecordIndex = index;

            var displayRecords = string.Equals(recordType, "Image", StringComparison.OrdinalIgnoreCase)
                ? fullRecords.Where(x => string.Equals(x?.RecordType, "Image", StringComparison.OrdinalIgnoreCase)).ToList()
                : string.Equals(recordType, "Data", StringComparison.OrdinalIgnoreCase)
                    ? fullRecords.Where(x => !string.Equals(x?.RecordType, "Image", StringComparison.OrdinalIgnoreCase)).ToList()
                    : fullRecords;

            return new AppItemExcelResultsDTO
            {
                ExcelLogDTO = fullResult.ExcelLogDTO,
                TotalRecords = fullResult.TotalRecords,
                CodesFromList = fullResult.CodesFromList,
                FromList = fullResult.FromList,
                From = fullResult.From,
                ToList = fullResult.ToList,
                To = fullResult.To,
                TotalPassedRecords = fullResult.TotalPassedRecords,
                TotalFailedRecords = fullResult.TotalFailedRecords,
                RepreateHandler = fullResult.RepreateHandler,
                ExcelRecords = displayRecords.Skip(skipCount).Take(maxResultCount).ToList(),
                FilePath = fullResult.FilePath,
                ErrorMessage = fullResult.ErrorMessage,
                HasDuplication = fullResult.HasDuplication,
                ResultKey = resultKey,
                IsPagedResult = true,
                PageSkipCount = skipCount,
                PageMaxResultCount = maxResultCount,
                TotalDisplayRecords = displayRecords.Count
            };
        }

        private void ApplyCurrentPageChanges(AppItemExcelResultsDTO fullResult, AppItemExcelResultsDTO currentResult)
        {
            if (fullResult?.ExcelRecords == null || currentResult?.ExcelRecords == null || currentResult.ExcelRecords.Count == 0)
                return;

            var fullRecordsByRow = fullResult.ExcelRecords
                .Where(x => x?.ExcelDto != null && x.ExcelDto.rowNumber > 0)
                .GroupBy(x => x.ExcelDto.rowNumber)
                .ToDictionary(x => x.Key, x => x.First());

            foreach (var changedRecord in currentResult.ExcelRecords)
            {
                AppItemtExcelRecordDTO fullRecord = null;

                if (string.Equals(changedRecord?.RecordType, "Image", StringComparison.OrdinalIgnoreCase) &&
                    !string.IsNullOrWhiteSpace(changedRecord?.ExcelDto?.ImagePreview))
                {
                    var changedImageFileName = Path.GetFileName(changedRecord.ExcelDto.ImagePreview);
                    var matchingImageRecords = fullResult.ExcelRecords.Where(x =>
                        string.Equals(x?.RecordType, "Image", StringComparison.OrdinalIgnoreCase) &&
                        string.Equals(
                            Path.GetFileName(x?.ExcelDto?.ImagePreview),
                            changedImageFileName,
                            StringComparison.OrdinalIgnoreCase))
                        .ToList();

                    fullRecord = matchingImageRecords.FirstOrDefault(x =>
                        string.Equals(x?.Code, changedRecord?.Code, StringComparison.OrdinalIgnoreCase))
                        ?? (matchingImageRecords.Count == 1 ? matchingImageRecords[0] : null);
                }
                else
                {
                    if (changedRecord?.ExcelDto != null && changedRecord.ExcelDto.rowNumber > 0)
                        fullRecordsByRow.TryGetValue(changedRecord.ExcelDto.rowNumber, out fullRecord);

                    if (fullRecord == null && !string.IsNullOrWhiteSpace(changedRecord?.Code))
                        fullRecord = fullResult.ExcelRecords.FirstOrDefault(x =>
                            !string.Equals(x?.RecordType, "Image", StringComparison.OrdinalIgnoreCase) &&
                            string.Equals(x.Code, changedRecord.Code, StringComparison.OrdinalIgnoreCase));
                }

                if (fullRecord != null)
                {
                    var index = fullResult.ExcelRecords.IndexOf(fullRecord);
                    fullResult.ExcelRecords[index] = changedRecord;
                }
            }
        }

        public async Task<AppItemExcelResultsDTO> GetValidateExcelResultPage(string resultKey, int skipCount, int maxResultCount, string recordType = null)
        {
            var fullResult = await LoadValidateExcelResultJson(resultKey);
            return CreateValidateExcelPagedResult(fullResult, resultKey, skipCount, maxResultCount, recordType);
        }

        public async Task<AppItemExcelResultsDTO> ValidatePriceCSV(string guidFile, string[] imagesList)
        {
            var resultDto = new AppItemExcelResultsDTO
            {
                ExcelRecords = new List<AppItemtExcelRecordDTO>(),
                TotalRecords = 0,
                TotalPassedRecords = 0,
                TotalFailedRecords = 0
            };

            if (string.IsNullOrEmpty(guidFile))
                return resultDto;

            try
            {
                var tenantId = AbpSession.TenantId ?? -1;
                var path = Path.Combine(
                    _appConfiguration["Attachment:PathTemp"],
                    tenantId.ToString(),
                    guidFile + ".csv"
                );

                if (!System.IO.File.Exists(path))
                    throw new UserFriendlyException("CSV file not found.");

                var lines = System.IO.File.ReadAllLines(path);
                if (lines.Length < 2)
                    throw new UserFriendlyException("CSV file is empty.");

                var headers = lines[0].Split(',').Select(h => h.Trim()).ToList();

                if (!headers.Any(h => h.Equals("accountssin", StringComparison.OrdinalIgnoreCase)) ||
                    !headers.Any(h => h.Equals("discsplit", StringComparison.OrdinalIgnoreCase)) ||
                    !headers.Any(h => h.Equals("currcode", StringComparison.OrdinalIgnoreCase)))
                {
                    throw new UserFriendlyException("CSV must contain accountssin, discsplit, and currcode columns.");
                }

                if (!headers.Any(h => h.Equals("Status", StringComparison.OrdinalIgnoreCase)))
                    headers.Add("Status");

                if (!headers.Any(h => h.Equals("ErrorMessage", StringComparison.OrdinalIgnoreCase)))
                    headers.Add("ErrorMessage");

                var outputLines = new List<string>
                {
                    string.Join(",", headers)
                };

                var currencies = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();

                var appContacts = await _appContactRepository.GetAll().ToListAsync();
                var appContactsDict = appContacts
                    .Where(x => !string.IsNullOrWhiteSpace(x.SSIN))
                    .GroupBy(x => x.SSIN.Trim().ToUpper())
                    .ToDictionary(g => g.Key, g => g.First());

                var appItems = await _appItemRepository.GetAll()
                    .AsNoTracking()
                    .Where(x => !string.IsNullOrWhiteSpace(x.Code))
                    .Select(x => new { x.Id, x.Code })
                    .ToListAsync();
                var appItemDict = appItems
                    .GroupBy(x => NormalizePriceImportKey(x.Code))
                    .ToDictionary(g => g.Key, g => g.First());

                var currencyDict = currencies
                    .Where(x => !string.IsNullOrWhiteSpace(x.Code))
                    .GroupBy(x => x.Code.Trim().ToUpper())
                    .ToDictionary(g => g.Key, g => g.First());

                int rowNumber = 1;

                for (int i = 1; i < lines.Length; i++)
                {
                    rowNumber++;

                    var values = lines[i].Split(',');

                    var row = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    for (int h = 0; h < headers.Count; h++)
                        row[headers[h]] = h < values.Length ? values[h] : "";

                    var record = new AppItemtExcelRecordDTO
                    {
                        Status = ExcelRecordStatus.Passed.ToString(),
                        FieldsErrors = new List<string>(),
                        ErrorMessage = ""
                    };

                    var dto = new AppItemPriceCsvDto
                    {
                        Code = row.ContainsKey("stymajor") ? row["stymajor"]?.Trim() : "",
                        SSIN = row["accountssin"]?.Trim(),
                        Currency = row["currcode"]?.Trim(),
                        Price = row["discsplit"]?.Trim(),
                        RowNumber = rowNumber
                    };

                    record.Code = dto.Code;
                    record.RecordType = "Account Code";

                    bool hasError = false;

                    if (string.IsNullOrWhiteSpace(dto.SSIN))
                    {
                        record.FieldsErrors.Add("SSIN is required.");
                        hasError = true;
                    }
                    else if (!appContactsDict.TryGetValue(dto.SSIN.ToUpper(), out var appContact))
                    {
                        record.FieldsErrors.Add("SSIN is not found.");
                        hasError = true;
                    }

                    appItemDict.TryGetValue(NormalizePriceImportKey(dto.Code), out var item);

                    if (item == null)
                    {
                        record.FieldsErrors.Add($"Item code {dto.Code} not found.");
                        hasError = true;
                    }

                    if (!decimal.TryParse(dto.Price, out decimal price) || price <= 0)
                    {
                        record.FieldsErrors.Add("Invalid price value.");
                        hasError = true;
                    }

                    long currencyId = 0;
                    string currencyCode = "";

                    currencyDict.TryGetValue(dto.Currency?.Trim().ToUpper() ?? string.Empty, out var matchedCurrency);

                    if (matchedCurrency == null)
                    {
                        record.FieldsErrors.Add("Invalid currency code.");
                        hasError = true;
                    }
                    else
                    {
                        currencyId = matchedCurrency.Value;
                        currencyCode = matchedCurrency.Code;
                    }

                    if (hasError)
                    {
                        record.Status = ExcelRecordStatus.Failed.ToString();
                        record.ErrorMessage = string.Join(" | ", record.FieldsErrors);
                        resultDto.TotalFailedRecords++;
                    }
                    else
                    {
                        record.Status = ExcelRecordStatus.Passed.ToString();
                        record.ErrorMessage = "";

                        record.ExcelDto = new AppItemExcelDto
                        {
                            Code = dto.Code,
                            EntityObjectCategoryID = item.Id,
                            Name = dto.SSIN,
                            Price = price.ToString(),
                            Currency = currencyCode,
                            ParentId = currencyId,
                            RecordType = "Price",
                            ProductDescription = "-",
                            ProductType = "-"
                        };

                        resultDto.TotalPassedRecords++;
                    }

                    row["Status"] = record.Status;
                    row["ErrorMessage"] = record.ErrorMessage;

                    outputLines.Add(string.Join(",", headers.Select(h => row[h])));

                    resultDto.ExcelRecords.Add(record);
                }

                resultDto.TotalRecords = resultDto.ExcelRecords.Count;

                var newFileName = $"{Path.GetFileNameWithoutExtension(path)}_Validated_{DateTime.Now:yyyyMMddHHmmss}.csv";
                var newPath = Path.Combine(Path.GetDirectoryName(path), newFileName);

                newPath = newPath.Replace(_appConfiguration[$"Attachment:PathTemp"].ToString(), _appConfiguration[$"Attachment:Path"]);
                resultDto.FilePath = newPath;

                System.IO.File.WriteAllLines(newPath, outputLines);
                newPath = newPath.Replace(_appConfiguration[$"Attachment:Omitt"].ToString(), "");

                resultDto.ExcelLogDTO = new ExcelLogDto();
                resultDto.ExcelLogDTO.ExcelLogPath = newPath;
                resultDto.ExcelLogDTO.ExcelLogFileName = newFileName;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(ex.Message);
            }

            return resultDto;
        }

        public void UpdateCsvStatusFromErrorLog(string csvFilePath, List<AppItemtExcelRecordDTO> errorLogList)
        {
            if (string.IsNullOrEmpty(csvFilePath) || errorLogList == null || !errorLogList.Any())
                return;

            if (!System.IO.File.Exists(csvFilePath))
                return;

            var lines = System.IO.File.ReadAllLines(csvFilePath).ToList();
            if (lines.Count < 2)
                return;

            var headers = lines[0].Split(',').Select(h => h.Trim()).ToList();

            int statusCol = headers.FindIndex(h => h.Equals("Status", StringComparison.OrdinalIgnoreCase));
            int errorMsgCol = headers.FindIndex(h => h.Equals("ErrorMessage", StringComparison.OrdinalIgnoreCase));

            if (statusCol < 0)
            {
                headers.Add("Status");
                statusCol = headers.Count - 1;
            }

            if (errorMsgCol < 0)
            {
                headers.Add("ErrorMessage");
                errorMsgCol = headers.Count - 1;
            }

            lines[0] = string.Join(",", headers);

            for (int i = 1; i < lines.Count && i <= errorLogList.Count; i++)
            {
                var values = lines[i].Split(',').ToList();

                while (values.Count < headers.Count)
                    values.Add("");

                values[statusCol] = errorLogList[i - 1].Status;
                values[errorMsgCol] = errorLogList[i - 1].ErrorMessage;

                lines[i] = string.Join(",", values);
            }

            System.IO.File.WriteAllLines(csvFilePath, lines);
        }

        private static string NormalizePriceImportKey(string value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? string.Empty
                : value.Replace(" ", "").Trim().ToUpper();
        }

        private static string GetPriceImportLookupKey(long appItemId, string code, string buyerSsin, string currencyCode)
        {
            return $"{appItemId}|{NormalizePriceImportKey(code)}|{NormalizePriceImportKey(buyerSsin)}|{NormalizePriceImportKey(currencyCode)}";
        }

        public async Task<ExcelLogDto> SavePriceFromCSV(AppItemExcelResultsDTO itemExcelResultsDTO)
        {
            var excelLog = new ExcelLogDto();

            if (itemExcelResultsDTO?.ExcelRecords == null || !itemExcelResultsDTO.ExcelRecords.Any())
                return excelLog;

            var result = itemExcelResultsDTO.ExcelRecords.Where(r => r.Status !=
            ExcelRecordStatus.Failed.ToString()).ToList();

            var tenantId = AbpSession.TenantId;
            var userId = AbpSession.UserId;
            var now = Clock.Now;

            var appItems = await _appItemRepository.GetAll().ToListAsync();
            var appItemDict = appItems
                .Where(x => !string.IsNullOrWhiteSpace(x.Code))
                .GroupBy(x => NormalizePriceImportKey(x.Code))
                .ToDictionary(g => g.Key, g => g.First());

            var currencies = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();
            var currencyDict = currencies
                .Where(x => !string.IsNullOrWhiteSpace(x.Code))
                .GroupBy(x => x.Code?.Trim().ToUpper())
                .ToDictionary(g => g.Key, g => g.First());

            var appContacts = await _appContactRepository.GetAll().ToListAsync();
            var appContactsDict = appContacts
                .Where(x => !string.IsNullOrWhiteSpace(x.SSIN))
                .GroupBy(x => x.SSIN.Trim().ToUpper())
                .ToDictionary(g => g.Key, g => g.First());

            var importAppItemIds = new HashSet<long>();
            var importBuyerSsins = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var importCurrencyCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var record in result)
            {
                var dto = record.ExcelDto;
                if (dto == null)
                    continue;

                if (appItemDict.TryGetValue(NormalizePriceImportKey(dto.Code), out var appItem))
                    importAppItemIds.Add(appItem.Id);

                if (!string.IsNullOrWhiteSpace(dto.Name))
                    importBuyerSsins.Add(dto.Name.Trim());

                if (!string.IsNullOrWhiteSpace(dto.Currency))
                    importCurrencyCodes.Add(dto.Currency.Trim());
            }

            var importAppItemIdsList = importAppItemIds.ToList();
            var importBuyerSsinsList = importBuyerSsins.ToList();
            var importCurrencyCodesList = importCurrencyCodes.ToList();

            var existingPrices = await _appItemPricesRepository.GetAll()
                .Where(x =>
                    !x.IsDeleted &&
                    importAppItemIdsList.Contains(x.AppItemId) &&
                    importBuyerSsinsList.Contains(x.BuyerSSIN) &&
                    importCurrencyCodesList.Contains(x.CurrencyCode))
                .ToListAsync();

            var existingPriceDict = existingPrices
                .GroupBy(x => GetPriceImportLookupKey(x.AppItemId, x.Code, x.BuyerSSIN, x.CurrencyCode))
                .ToDictionary(g => g.Key, g => g.First());

            var updatedAppItemIds = new HashSet<long>();

            foreach (var logRecord in result)
            {
                var excelDto = logRecord.ExcelDto;

                try
                {
                    if (string.IsNullOrWhiteSpace(excelDto.Code) ||
                        string.IsNullOrWhiteSpace(excelDto.Name) ||
                        string.IsNullOrWhiteSpace(excelDto.Currency) ||
                        string.IsNullOrWhiteSpace(excelDto.Price))
                    {
                        logRecord.Status = "Failed";
                        logRecord.ErrorMessage = "Required field is missing";
                        continue;
                    }

                    if (!decimal.TryParse(excelDto.Price, out var price))
                    {
                        logRecord.Status = "Failed";
                        logRecord.ErrorMessage = "Invalid price value";
                        continue;
                    }

                    var appItemKey = NormalizePriceImportKey(excelDto.Code);
                    var currencyKey = excelDto.Currency.Trim().ToUpper();
                    var appContactKey = excelDto.Name.Trim().ToUpper();

                    if (!appItemDict.TryGetValue(appItemKey, out var appItem))
                    {
                        logRecord.Status = "Failed";
                        logRecord.ErrorMessage = "AppItem not found";
                        continue;
                    }

                    if (!appContactsDict.TryGetValue(appContactKey, out var appContact))
                    {
                        logRecord.Status = "Failed";
                        logRecord.ErrorMessage = "SSIN not found";
                        continue;
                    }

                    if (!currencyDict.TryGetValue(currencyKey, out var currency))
                    {
                        logRecord.Status = "Failed";
                        logRecord.ErrorMessage = "Currency not found";
                        continue;
                    }

                    var priceCode = excelDto.Name.Trim();
                    var currencyCode = currency.Code.Trim();

                    existingPriceDict.TryGetValue(
                        GetPriceImportLookupKey(appItem.Id, priceCode, excelDto.Name, currencyCode),
                        out var existingPrice);

                    if (existingPrice != null)
                    {
                        existingPrice.Price = price;
                        existingPrice.BuyerSSIN = excelDto.Name;
                        existingPrice.LastModificationTime = now;
                        existingPrice.LastModifierUserId = userId;
                        existingPrice.IsDefault = true;

                        await _appItemPricesRepository.UpdateAsync(existingPrice);
                    }
                    else
                    {
                        var priceEntity = new AppItemPrices
                        {
                            CreationTime = now,
                            CreatorUserId = userId,
                            TenantId = tenantId,
                            Code = priceCode,
                            Price = price,
                            BuyerSSIN = excelDto.Name,
                            AppItemId = (long)excelDto.EntityObjectCategoryID,
                            AppItemCode = excelDto.Code,
                            CurrencyId = excelDto.ParentId,
                            CurrencyCode = excelDto.Currency,
                            IsDefault = true,
                            IsDeleted = false
                        };

                        await _appItemPricesRepository.InsertAsync(priceEntity);
                        existingPriceDict[GetPriceImportLookupKey(priceEntity.AppItemId, priceEntity.Code, priceEntity.BuyerSSIN, priceEntity.CurrencyCode)] = priceEntity;
                    }

                    if (updatedAppItemIds.Add(appItem.Id))
                    {
                        appItem.LastModificationTime = now;
                        appItem.LastModifierUserId = userId;
                        appItem.TimeStamp = now;
                    }

                    logRecord.Status = "Success";
                    logRecord.ErrorMessage = "";
                }
                catch (Exception ex)
                {
                    logRecord.Status = "Failed";
                    logRecord.ErrorMessage = ex.Message;
                }
            }

            foreach (var appItemId in updatedAppItemIds)
            {
                var appItem = appItems.First(x => x.Id == appItemId);
                await _appItemRepository.UpdateAsync(appItem);
            }

            var attachmentFolder = Path.Combine(_appConfiguration[$"Attachment:Path"], tenantId.ToString());
            if (!Directory.Exists(attachmentFolder))
                Directory.CreateDirectory(attachmentFolder);

            this.UpdateCsvStatusFromErrorLog(itemExcelResultsDTO.FilePath, itemExcelResultsDTO.ExcelRecords);

            if (AbpSession.UserId != null)
            {
                long abpSessionUserId = (long)AbpSession.UserId;
                string message = "Items imported successfully.";
                if (!string.IsNullOrEmpty(itemExcelResultsDTO.FilePath) && !itemExcelResultsDTO.FilePath.ToUpper().Contains("UNDEFINED"))
                {
                    message = "Importing Item result can be downloaded from <a href=\"" + itemExcelResultsDTO.FilePath + "\" download>" + "here" + "</a>";
                }
                await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(AbpSession.TenantId, abpSessionUserId),
                    message,
                    Abp.Notifications.NotificationSeverity.Info, null);
            }

            return itemExcelResultsDTO.ExcelLogDTO;
        }

        [DisableAuditing]
        public async Task<ExcelLogDto> SaveFromExcelResult(string resultKey, AppItemExcelResultsDTO currentResult)
        {
            var fullResult = await LoadValidateExcelResultJson(resultKey);
            ApplyCurrentPageChanges(fullResult, currentResult);

            if (currentResult != null)
            {
                fullResult.RepreateHandler = currentResult.RepreateHandler;
                fullResult.From = currentResult.From;
                fullResult.To = currentResult.To;
                if (!string.IsNullOrWhiteSpace(currentResult.FilePath))
                    fullResult.FilePath = currentResult.FilePath;
            }

            return await SaveFromExcel(fullResult);
        }

        private async Task SendItemImportCompletedNotification(string filePath, int? tenantId, long userId)
        {
            string message = "Items imported successfully.";
            if (!string.IsNullOrEmpty(filePath) && !filePath.ToUpper().Contains("UNDEFINED"))
            {
                message = "Importing Item result can be downloaded from <a href=\"" + filePath + "\" download>" + "here" + "</a>";
            }

            await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(tenantId, userId),
                message,
                Abp.Notifications.NotificationSeverity.Info, null);
        }

        private static IEnumerable<List<T>> ChunkList<T>(IEnumerable<T> source, int chunkSize)
        {
            var chunk = new List<T>(chunkSize);
            foreach (var item in source)
            {
                chunk.Add(item);
                if (chunk.Count == chunkSize)
                {
                    yield return chunk;
                    chunk = new List<T>(chunkSize);
                }
            }

            if (chunk.Count > 0)
                yield return chunk;
        }

        private async Task<ValidateImportItemDataContext> BuildValidateImportItemDataContext(
            List<AppItemExcelDto> result,
            List<CurrencyInfoDto> currencyIds,
            List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories,
            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds,
            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> categoriesIds)
        {
            var context = new ValidateImportItemDataContext();

            if (currencyIds != null)
            {
                foreach (var currency in currencyIds)
                    AddLookupKey(context.CurrencyCodes, currency.Code);
            }

            if (attachmentsCategories != null)
            {
                foreach (var attachmentCategory in attachmentsCategories)
                {
                    AddLookupKey(context.AttachmentCategoryCodes, attachmentCategory.Code);
                    AddLookupKey(context.AttachmentCategoryCodes, attachmentCategory.DisplayName);
                }
            }

            if (classIds?.Items != null)
            {
                foreach (var classificationNode in classIds.Items)
                {
                    AddLookupKey(context.ProductClassificationKeys, classificationNode.Data?.SycEntityObjectClassification?.Code);
                    AddLookupKey(context.ProductClassificationKeys, classificationNode.Data?.SycEntityObjectClassification?.Name);
                }
            }

            if (categoriesIds?.Items != null)
            {
                foreach (var categoryNode in categoriesIds.Items)
                {
                    AddLookupKey(context.ProductCategoryKeys, categoryNode.Data?.SycEntityObjectCategory?.Code);
                    AddLookupKey(context.ProductCategoryKeys, categoryNode.Data?.SycEntityObjectCategory?.Name);
                }
            }

            var rawCodes = result
                .Where(x => x != null && !string.IsNullOrWhiteSpace(x.Code))
                .Select(x => x.Code.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (rawCodes.Count > 0)
            {
                foreach (var codeChunk in ChunkList(rawCodes, 500))
                {
                    var existingItems = await _appItemRepository.GetAll()
                        .AsNoTracking()
                        .Where(x => x.Code != null && x.ItemType == 0 && codeChunk.Contains(x.Code))
                        .Select(x => new { x.Id, x.Code })
                        .ToListAsync();

                    foreach (var existingItem in existingItems)
                    {
                        var normalizedCode = NormalizeImportCode(existingItem.Code);
                        if (!context.ExistingItemsByNormalizedCode.ContainsKey(normalizedCode))
                            context.ExistingItemsByNormalizedCode.Add(normalizedCode, new ExistingImportItemInfo { Id = existingItem.Id });
                    }
                }
            }

            return context;
        }

        private async Task<AppEntityClassificationDto> GetItemClassification(string classificationDescription)
        {
            AppEntityClassificationDto returnClassification = new AppEntityClassificationDto();
            if (!string.IsNullOrEmpty(classificationDescription))
            {
                PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput { NameFilter = classificationDescription });
                List<GetSycEntityObjectClassificationForViewDto> getSycEntityObjectClassificationForViewDtos = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Name == classificationDescription).ToList();

                if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                {
                    long ObjectId = await _helper.SystemTables.GetObjectItemId();
                    CreateOrEditSycEntityObjectClassificationDto createOrEditSycEntityObjectClassificationDto = new CreateOrEditSycEntityObjectClassificationDto();
                    string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("CLASSIFICATION");
                    createOrEditSycEntityObjectClassificationDto.Code = seq;
                    createOrEditSycEntityObjectClassificationDto.Name = classificationDescription;
                    createOrEditSycEntityObjectClassificationDto.ObjectId = ((int)ObjectId);
                    await _sycEntityObjectClassificationsAppService.CreateOrEdit(createOrEditSycEntityObjectClassificationDto);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());
                    var classification = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Name == classificationDescription).FirstOrDefault();
                    if (classification != null)
                    {
                        returnClassification.EntityObjectClassificationCode = classification.SycEntityObjectClassification.Code;
                        returnClassification.EntityObjectClassificationId = classification.SycEntityObjectClassification.Id;
                    }
                }
                else
                {
                    returnClassification.EntityObjectClassificationCode = getSycEntityObjectClassificationForViewDtos.FirstOrDefault().SycEntityObjectClassification.Code;
                    returnClassification.EntityObjectClassificationId = getSycEntityObjectClassificationForViewDtos.FirstOrDefault().SycEntityObjectClassification.Id;
                }
            }
            return returnClassification;
        }

        private async Task<AppEntityCategoryDto> GetItemCategory(string categoryDescription)
        {
            AppEntityCategoryDto returnCategory = new AppEntityCategoryDto();
            if (!string.IsNullOrEmpty(categoryDescription))
            {

                PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name", NameFilter = categoryDescription });
                List<GetSycEntityObjectCategoryForViewDto> getSycEntityObjectClassificationForViewDtos = departmentsIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Name == categoryDescription).ToList();
                if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                {
                    long ObjectId = await _helper.SystemTables.GetObjectItemId();
                    CreateOrEditSycEntityObjectCategoryDto createOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();
                    createOrEditSycEntityObjectCategoryDto.Name = categoryDescription;
                    createOrEditSycEntityObjectCategoryDto.ObjectId = ((int)ObjectId);
                    string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("CATEGORY");
                    createOrEditSycEntityObjectCategoryDto.Code = seq;
                    await _sycEntityObjectCategoriesAppService.CreateOrEdit(createOrEditSycEntityObjectCategoryDto);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });
                    var category = departmentsIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Name == categoryDescription).FirstOrDefault();
                    if (category != null)
                    {

                        returnCategory.EntityObjectCategoryCode = category.SycEntityObjectCategory.Code;
                        returnCategory.EntityObjectCategoryId = category.SycEntityObjectCategory.Id;
                    }
                }
                else
                {
                    returnCategory.EntityObjectCategoryCode = getSycEntityObjectClassificationForViewDtos.FirstOrDefault().SycEntityObjectCategory.Code;
                    returnCategory.EntityObjectCategoryId = getSycEntityObjectClassificationForViewDtos.FirstOrDefault().SycEntityObjectCategory.Id;
                }
            }
            return returnCategory;
        }

        public async Task<List<ImportItemReturnDto>> ImportItem(List<ImportItemInputDto> itemExcelDtoList, string repeatHandler)
        {
            AppItemExcelResultsDTO saveExcelinput = new AppItemExcelResultsDTO();
            saveExcelinput.CodesFromList = new List<string>();
            saveExcelinput.ToList = new List<int>();
            saveExcelinput.FromList = new List<int>();
            saveExcelinput.ErrorMessage = "";
            saveExcelinput.ExcelRecords = new List<AppItemtExcelRecordDTO>();
            saveExcelinput.RepreateHandler = (ExcelRecordRepeateHandler)Enum.Parse(typeof(ExcelRecordRepeateHandler), repeatHandler.ToString());
            saveExcelinput.To = 0;
            saveExcelinput.From = 0;
            List<ImportItemReturnDto> returnList = new List<ImportItemReturnDto>();
            foreach (var excelDto in itemExcelDtoList)
            {
                if (!string.IsNullOrEmpty(excelDto.ParentCode))
                    continue;
                long id = 0;
                bool canBeSaved = true;
                var list = await ValidateImportItemData(excelDto);
                if (list != null && list.Count > 0)
                {
                    foreach (var err in list)
                    {
                        returnList.Add(err);
                        canBeSaved = err.ErrorType != "Stopper" ? canBeSaved : false;
                        if (err.ErrorType == "Duplication")
                            id = long.Parse(err.Id.ToString());
                    }
                }
                if (canBeSaved == true)
                {
                    var pdtyp = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(excelDto.ProductType);
                    var prdObj = pdtyp.FirstOrDefault();

                    var entityObjectExtraAttribute = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(long.Parse(prdObj.Id.ToString()));
                    var entityextr = entityObjectExtraAttribute.FirstOrDefault();
                    List<ExtraAttribute> entityExtraAttributes = null;
                    if (entityextr != null && entityextr.ExtraAttributes != null)
                        entityExtraAttributes = entityextr.ExtraAttributes.ExtraAttributes;
                    MapperConfiguration configuration;
                    configuration = new MapperConfiguration(a => { a.AddProfile(new AppItemExcelImpDtoProfile(entityExtraAttributes)); });
                    IMapper mapper;
                    mapper = configuration.CreateMapper();


                    AppItemExcelDto importItemInputDto;
                    {
                        importItemInputDto = mapper.Map<ImportItemInputDto, AppItemExcelDto>(excelDto);
                        importItemInputDto.Id = id;
                    }

                    saveExcelinput.ExcelRecords.Add(new AppItemtExcelRecordDTO
                    {
                        Code = excelDto.Code,
                        ExcelDto = importItemInputDto,
                        RecordType = excelDto.RecordType,
                        Status = ""
                    });
                    var children = itemExcelDtoList.Where(z => z.ParentCode == excelDto.Code).ToList();
                    if (children != null && children.Count > 0)
                    {
                        foreach (var child in children)
                        {
                            AppItemExcelDto importItemInputDtoChild;
                            importItemInputDtoChild = mapper.Map<ImportItemInputDto, AppItemExcelDto>(child);


                            saveExcelinput.ExcelRecords.Add(new AppItemtExcelRecordDTO
                            {
                                Code = child.Code,
                                ExcelDto = importItemInputDtoChild,
                                RecordType = child.RecordType,
                                Status = ""
                            });
                        }
                    }

                }
            }
            if (saveExcelinput.ExcelRecords.Count > 0)
            {
                await SaveFromExcel(saveExcelinput);
                var myTenantObject = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                string tenancyName = myTenantObject.TenancyName;
                var adminUser = await UserManager.FindByNameAsync("admin@" + tenancyName);
                if (adminUser != null)
                {
                    await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(AbpSession.TenantId, adminUser.Id),
                        "Items imported successfully.",
                        Abp.Notifications.NotificationSeverity.Info, null);//new Abp.Domain.Entities.EntityIdentifier(typeof(AppContact), originalPublishContactFortCurrTenant.Id));
                }
            }
            //I46, MMT 07/08/2025 Save Result to Excel[Start]
            if (returnList.Count > 0)
            {
                string attachmentFolder = _appConfiguration[$"APP:ServerRootAddress"] + @"/" +
                    _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/" + AbpSession.TenantId.ToString();
                System.IO.DirectoryInfo dire = new DirectoryInfo(attachmentFolder);
                string fileName = "ImportItemResult-" + DateTime.Now.ToString("yyyy-dd-M--HH-mm-ss") + ".xlsx";
                string outFile = attachmentFolder + "//" + fileName;

                string jsonData = JsonConvert.SerializeObject(returnList);
                string fileToExport = _appConfiguration[$"Attachment:Path"] + @"\" + AbpSession.TenantId.ToString() + @"\" + fileName;
                _helper.ExcelHelper.ExportJsonToExcel(fileToExport, jsonData);
                {
                    var myTenantObject = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                    string tenancyName = myTenantObject.TenancyName;
                    var adminUser = await UserManager.FindByNameAsync("admin@" + tenancyName);
                    if (adminUser != null)
                    {
                        await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(AbpSession.TenantId, adminUser.Id),
                            "Importing Item result can be downloaded from <a href=\"" + outFile + "\" download>" + "here" + "</a>",
                            Abp.Notifications.NotificationSeverity.Info, null);//new Abp.Domain.Entities.EntityIdentifier(typeof(AppContact), originalPublishContactFortCurrTenant.Id));
                    }
                }
            }
            //ExportJsonToExcel
            //I46, MMT 07/08/2025 Save Result to Excel[End]
            return returnList;
        }

        private List<ImportItemReturnDto> ValidateImportItemData(ImportItemInputDto itemExcelDto, ValidateImportItemDataContext context)
        {
            if (itemExcelDto.NoOfDimensions == null) { itemExcelDto.NoOfDimensions = "1"; }

            List<ImportItemReturnDto> returnList = new List<ImportItemReturnDto>();
            var ValidateResults = new List<ValidationResult>();
            Validator.TryValidateObject(itemExcelDto, new System.ComponentModel.DataAnnotations.ValidationContext(itemExcelDto), ValidateResults, true);

            if (ValidateResults.Count > 0)
            {
                foreach (var res in ValidateResults)
                {
                    returnList.Add(new ImportItemReturnDto { RecordKey = itemExcelDto.Code, ErrorMessage = res.ErrorMessage, ErrorType = "Stopper" });
                }
            }

            if (itemExcelDto.RecordType == "Item")
            {
                if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) && int.Parse(itemExcelDto.NoOfDimensions.ToString()) == 1
                    && string.IsNullOrEmpty(itemExcelDto.Dimension1Name))
                {
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Dimension 1 name cannot be empty if size scale number of dimesions is 1",
                        ErrorType = "Stopper"
                    });
                }
                if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) & int.Parse(itemExcelDto.NoOfDimensions.ToString()) == 2 &&
                    (string.IsNullOrEmpty(itemExcelDto.Dimension1Name) | string.IsNullOrEmpty(itemExcelDto.Dimension2Name)))
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Dimension 1 name and Dimension 2 name cannot be empty if size scale number of dimesions is 2",
                        ErrorType = "Stopper"
                    });
                if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) & int.Parse(itemExcelDto.NoOfDimensions.ToString()) == 3 &
                    (string.IsNullOrEmpty(itemExcelDto.Dimension1Name) | string.IsNullOrEmpty(itemExcelDto.Dimension2Name) |
                    string.IsNullOrEmpty(itemExcelDto.Dimension3Name)))
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Dimension 1 name, Dimension 2 name, and Dimension 3 name cannot be empty if size scale number of dimesions is 3",
                        ErrorType = "Stopper"
                    });
                if (!string.IsNullOrEmpty(itemExcelDto.SizeRatioName) & string.IsNullOrEmpty(itemExcelDto.SizeRatioValue))
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Size ratio value cannot be empty if size ratio name is not empty",
                        ErrorType = "Stopper"
                    });
            }

            if (context.ExistingItemsByNormalizedCode.TryGetValue(NormalizeImportCode(itemExcelDto.Code), out var itemExists))
            {
                returnList.Add(new ImportItemReturnDto
                {
                    RecordKey = itemExcelDto.Code,
                    ErrorMessage = "Code :" + itemExcelDto.Code + " already exists!",
                    ErrorType = "Duplication",
                    Id = itemExists.Id
                });
            }

            if (!string.IsNullOrEmpty(itemExcelDto.ImageType) && !context.AttachmentCategoryCodes.Contains(itemExcelDto.ImageType.TrimEnd()))
            {
                returnList.Add(new ImportItemReturnDto { RecordKey = itemExcelDto.Code, ErrorMessage = "Invalid Image Type.", ErrorType = "Stopper" });
            }

            if (itemExcelDto.RecordType != "Item" && string.IsNullOrEmpty(itemExcelDto.ParentCode))
            {
                returnList.Add(new ImportItemReturnDto
                {
                    RecordKey = itemExcelDto.Code,
                    ErrorMessage = "Parent Code cannot be empty.",
                    ErrorType = "Stopper"
                });
            }

            if (itemExcelDto.RecordType != "Item Variant" && string.IsNullOrEmpty(itemExcelDto.ColorCode))
            {
                returnList.Add(new ImportItemReturnDto
                {
                    RecordKey = itemExcelDto.Code,
                    ErrorMessage = "Color Code cannot be empty.",
                    ErrorType = "Stopper"
                });
            }

            if (itemExcelDto.RecordType != "Item Variant" && string.IsNullOrEmpty(itemExcelDto.ColorName))
            {
                returnList.Add(new ImportItemReturnDto
                {
                    RecordKey = itemExcelDto.Code,
                    ErrorMessage = "Color Name cannot be empty.",
                    ErrorType = "Stopper"
                });
            }

            if (!string.IsNullOrEmpty(itemExcelDto.PriceCurrencyCode) && !context.CurrencyCodes.Contains(itemExcelDto.PriceCurrencyCode))
            {
                returnList.Add(new ImportItemReturnDto
                {
                    RecordKey = itemExcelDto.Code,
                    ErrorMessage = "Currency: Should Have a Valid Currency Value.",
                    ErrorType = "Stopper"
                });
            }

            if (!string.IsNullOrEmpty(itemExcelDto.ProductClassificationCode) && !context.ProductClassificationKeys.Contains(itemExcelDto.ProductClassificationCode))
            {
                returnList.Add(new ImportItemReturnDto
                {
                    RecordKey = itemExcelDto.Code,
                    ErrorMessage = "Product Classification is not found.",
                    ErrorType = "Warning"
                });
            }

            if (!string.IsNullOrEmpty(itemExcelDto.ProductCategoryCode) && !context.ProductCategoryKeys.Contains(itemExcelDto.ProductCategoryCode))
            {
                returnList.Add(new ImportItemReturnDto
                {
                    RecordKey = itemExcelDto.Code,
                    ErrorMessage = "Product Category is not found.",
                    ErrorType = "Warning"
                });
            }

            return returnList;
        }

        public async Task<List<ImportItemReturnDto>> ValidateImportItemData(ImportItemInputDto itemExcelDto)
        {
            if (itemExcelDto.NoOfDimensions == null) { itemExcelDto.NoOfDimensions = "1"; }

            List<CurrencyInfoDto> currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();
            List<ImportItemReturnDto> returnList = new List<ImportItemReturnDto>();
            {
                var ValidateResults = new List<ValidationResult>();
                Validator.TryValidateObject(itemExcelDto, new System.ComponentModel.DataAnnotations.ValidationContext(itemExcelDto), ValidateResults, true);

                if (ValidateResults.Count > 0)
                {
                    foreach (var res in ValidateResults)
                    {
                        returnList.Add(new ImportItemReturnDto { RecordKey = itemExcelDto.Code, ErrorMessage = res.ErrorMessage, ErrorType = "Stopper" });
                    }
                }

                if (itemExcelDto.RecordType == "Item")
                {
                    if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) && int.Parse(itemExcelDto.NoOfDimensions.ToString()) == 1
                        && string.IsNullOrEmpty(itemExcelDto.Dimension1Name))
                    {
                        returnList.Add(new ImportItemReturnDto
                        {
                            RecordKey = itemExcelDto.Code,
                            ErrorMessage = "Dimension 1 name cannot be empty if size scale number of dimesions is 1",
                            ErrorType = "Stopper"
                        });
                    }
                    if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) & int.Parse(itemExcelDto.NoOfDimensions.ToString()) == 2 &&
                        (string.IsNullOrEmpty(itemExcelDto.Dimension1Name) | string.IsNullOrEmpty(itemExcelDto.Dimension2Name)))
                        returnList.Add(new ImportItemReturnDto
                        {
                            RecordKey = itemExcelDto.Code,
                            ErrorMessage = "Dimension 1 name and Dimension 2 name cannot be empty if size scale number of dimesions is 2",
                            ErrorType = "Stopper"
                        });
                    if (!string.IsNullOrEmpty(itemExcelDto.SizeScaleName) & int.Parse(itemExcelDto.NoOfDimensions.ToString()) == 3 &
                        (string.IsNullOrEmpty(itemExcelDto.Dimension1Name) | string.IsNullOrEmpty(itemExcelDto.Dimension2Name) |
                        string.IsNullOrEmpty(itemExcelDto.Dimension3Name)))
                        returnList.Add(new ImportItemReturnDto
                        {
                            RecordKey = itemExcelDto.Code,
                            ErrorMessage = "Dimension 1 name, Dimension 2 name, and Dimension 3 name cannot be empty if size scale number of dimesions is 3",
                            ErrorType = "Stopper"
                        });
                    //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
                    if (!string.IsNullOrEmpty(itemExcelDto.SizeRatioName) & string.IsNullOrEmpty(itemExcelDto.SizeRatioValue))
                        returnList.Add(new ImportItemReturnDto
                        {
                            RecordKey = itemExcelDto.Code,
                            ErrorMessage = "Size ratio value cannot be empty if size ratio name is not empty",
                            ErrorType = "Stopper"
                        });

                }
                var itemExists = _appItemRepository.GetAll().FirstOrDefault(x => x.Code.Replace(" ", string.Empty) == itemExcelDto.Code.Replace(" ", string.Empty) && x.ItemType == 0);

                if (itemExists != null)
                {
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Code :" + itemExcelDto.Code + " already exists!",
                        ErrorType = "Duplication",
                        Id = itemExists.Id
                    });

                }
                if (!string.IsNullOrEmpty(itemExcelDto.ImageType))
                {
                    var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(itemExcelDto.ImageType.ToUpper().TrimEnd());
                    if (attCoverId == 0)
                    {
                        returnList.Add(new ImportItemReturnDto { RecordKey = itemExcelDto.Code, ErrorMessage = "Invalid Image Type.", ErrorType = "Stopper" });
                    }
                }
                if (itemExcelDto.RecordType != "Item" && string.IsNullOrEmpty(itemExcelDto.ParentCode))
                {
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Parent Code cannot be empty.",
                        ErrorType = "Stopper"
                    });
                }

                if (itemExcelDto.RecordType != "Item Variant" && string.IsNullOrEmpty(itemExcelDto.ColorCode))
                {
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Color Code cannot be empty.",
                        ErrorType = "Stopper"
                    });
                }

                if (itemExcelDto.RecordType != "Item Variant" && string.IsNullOrEmpty(itemExcelDto.ColorName))
                {
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Color Name cannot be empty.",
                        ErrorType = "Stopper"
                    });
                }


                if (!string.IsNullOrEmpty(itemExcelDto.PriceCurrencyCode) && GetTypeId(itemExcelDto.PriceCurrencyCode, currencyIds) == 0)
                {
                    returnList.Add(new ImportItemReturnDto
                    {
                        RecordKey = itemExcelDto.Code,
                        ErrorMessage = "Currency: Should Have a Valid Currency Value.",
                        ErrorType = "Stopper"
                    });
                }
                if (!string.IsNullOrEmpty(itemExcelDto.ProductClassificationCode))
                {
                    var returnResult = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput { NameFilter = itemExcelDto.ProductClassificationCode });
                    long classId = returnResult.Items.Count > 0 ? returnResult.Items.First().Data.SycEntityObjectClassification.Id : 0; //GetClassId(itemExcelDto.ProductClassificationDescription, classIds);
                    if (classId == 0)
                    {
                        returnList.Add(new ImportItemReturnDto
                        {
                            RecordKey = itemExcelDto.Code,
                            ErrorMessage = "Product Classification is not found.",
                            ErrorType = "Warning"
                        });

                    }
                }

                if (!string.IsNullOrEmpty(itemExcelDto.ProductCategoryCode))
                {
                    var returnResult = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name", NameFilter = itemExcelDto.ProductCategoryCode });
                    long categId = returnResult.Items.Count > 0 ? returnResult.Items.First().Data.SycEntityObjectCategory.Id : 0;
                    if (categId == 0)
                    {
                        returnList.Add(new ImportItemReturnDto
                        {
                            RecordKey = itemExcelDto.Code,
                            ErrorMessage = "Product Category is not found.",
                            ErrorType = "Warning"
                        });

                    }
                }
            }

            return returnList;
        }
        public async Task<List<AppItemValidationInputDTO>> ValidateItemData(List<AppItemValidationInputDTO> input)
        {
            foreach (var item in input)
            {

                item.ErrorMessages = new List<string>();
                var validationRes = ValidateItem(ObjectMapper.Map<CreateOrEditAppItemDto>(item));
                if (!validationRes.IsValid)
                {
                    foreach (var vldRes in validationRes.Errors)
                    {
                        item.ErrorMessages.Add(vldRes.ErrorMessage);
                    }
                }

            }
            return input;
        }
        //Iteration#46[End]
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

        private static string GetItemCopyCode(string code, HashSet<string> reservedCodes)
        {
            for (var copyNumber = 1; copyNumber < 1000; copyNumber++)
            {
                var newCode = code + copyNumber;
                if (reservedCodes.Add(newCode))
                    return newCode;
            }

            return code;
        }

        //Marima
        public async Task AddClassifications(List<AppItemExcelDto> result)
        {
            long ObjectId = await _helper.SystemTables.GetObjectItemId();
            #region add classifications
            var classificationDescriptions = result
                .Where(x => !string.IsNullOrWhiteSpace(x.ProductClassificationDescription))
                .Select(x => x.ProductClassificationDescription.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (classificationDescriptions.Count == 0)
                return;

            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classesIds =
                await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());

            var classificationsByName = classesIds.Items
                .Select(r => r.Data?.SycEntityObjectClassification)
                .Where(x => x != null && !string.IsNullOrEmpty(x.Name))
                .GroupBy(x => x.Name.Trim(), StringComparer.OrdinalIgnoreCase)
                .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);

            var missingClassificationDescriptions = classificationDescriptions
                .Where(x => !classificationsByName.ContainsKey(x))
                .ToList();

            foreach (var classificationDescription in missingClassificationDescriptions)
            {
                CreateOrEditSycEntityObjectClassificationDto createOrEditSycEntityObjectClassificationDto = new CreateOrEditSycEntityObjectClassificationDto();
                string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("CLASSIFICATION");
                createOrEditSycEntityObjectClassificationDto.Code = seq;
                createOrEditSycEntityObjectClassificationDto.Name = classificationDescription;
                createOrEditSycEntityObjectClassificationDto.ObjectId = ((int)ObjectId);
                await _sycEntityObjectClassificationsAppService.CreateOrEdit(createOrEditSycEntityObjectClassificationDto);
            }

            if (missingClassificationDescriptions.Count > 0)
            {
                await CurrentUnitOfWork.SaveChangesAsync();
                classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectClassificationsInput());
                classificationsByName = classesIds.Items
                    .Select(r => r.Data?.SycEntityObjectClassification)
                    .Where(x => x != null && !string.IsNullOrEmpty(x.Name))
                    .GroupBy(x => x.Name.Trim(), StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);
            }

            foreach (AppItemExcelDto src in result)
            {
                if (!string.IsNullOrWhiteSpace(src.ProductClassificationDescription) &&
                    classificationsByName.TryGetValue(src.ProductClassificationDescription.Trim(), out var classification))
                {
                    src.ProductClassificationCode = classification.Code;
                    src.EntityObjectClassificaionID = classification.Id;
                }

            }
            #endregion add classifications
        }


        public async Task AddCategories(List<AppItemExcelDto> result)
        {
            long ObjectId = await _helper.SystemTables.GetObjectItemId();
            #region add classifications
            var categoryDescriptions = result
                .Where(x => !string.IsNullOrWhiteSpace(x.ProductCategoryDescription))
                .Select(x => x.ProductCategoryDescription.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (categoryDescriptions.Count == 0)
                return;

            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentsIds =
                await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });

            var categoriesByName = departmentsIds.Items
                .Select(r => r.Data?.SycEntityObjectCategory)
                .Where(x => x != null && !string.IsNullOrEmpty(x.Name))
                .GroupBy(x => x.Name.Trim(), StringComparer.OrdinalIgnoreCase)
                .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);

            var missingCategoryDescriptions = categoryDescriptions
                .Where(x => !categoriesByName.ContainsKey(x))
                .ToList();

            foreach (var categoryDescription in missingCategoryDescriptions)
            {
                CreateOrEditSycEntityObjectCategoryDto createOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();
                createOrEditSycEntityObjectCategoryDto.Name = categoryDescription;
                createOrEditSycEntityObjectCategoryDto.ObjectId = ((int)ObjectId);
                string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("CATEGORY");
                createOrEditSycEntityObjectCategoryDto.Code = seq;
                await _sycEntityObjectCategoriesAppService.CreateOrEdit(createOrEditSycEntityObjectCategoryDto);
            }

            if (missingCategoryDescriptions.Count > 0)
            {
                await CurrentUnitOfWork.SaveChangesAsync();
                departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllWithChildsForProductWithPaging(new GetAllSycEntityObjectCategoriesInput() { DepartmentFlag = false, Sorting = "name" });
                categoriesByName = departmentsIds.Items
                    .Select(r => r.Data?.SycEntityObjectCategory)
                    .Where(x => x != null && !string.IsNullOrEmpty(x.Name))
                    .GroupBy(x => x.Name.Trim(), StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);
            }

            foreach (AppItemExcelDto src in result)
            {
                if (!string.IsNullOrWhiteSpace(src.ProductCategoryDescription) &&
                    categoriesByName.TryGetValue(src.ProductCategoryDescription.Trim(), out var category))
                {
                    src.ProductCategoryCode = category.Code;
                    src.EntityObjectCategoryID = category.Id;
                }
            }
            #endregion add classifications

        }

        private async Task<(string ProductTypeCode, List<ExtraAttribute> ExtraAttributes)> GetDefaultImportExtraAttributes()
        {
            var itemObjectId = await _helper.SystemTables.GetObjectItemId();
            var defaultProductType = _sycEntityObjectTypeRepository.GetAll().Where(x => x.ObjectId == itemObjectId && x.IsDefault == true).Select(z => z.Code).FirstOrDefault();
            if (defaultProductType == null)
                throw new UserFriendlyException("No Product type is marked as default.");

            var pdtyp = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(defaultProductType);
            var productTypeId = pdtyp.FirstOrDefault();
            var entityObjectExtraAttribute = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(long.Parse(productTypeId.Id.ToString()));
            var entityextr = entityObjectExtraAttribute.FirstOrDefault();
            var entityExtraAttributes = entityextr?.ExtraAttributes?.ExtraAttributes ?? new List<ExtraAttribute>();

            return (defaultProductType, entityExtraAttributes);
        }

        public async Task<AppItemtExcelRecordDTO> AddExtraAttrs(AppItemtExcelRecordDTO input)
        {
            var defaultExtraAttributes = await GetDefaultImportExtraAttributes();
            return AddExtraAttrs(input, defaultExtraAttributes.ProductTypeCode, defaultExtraAttributes.ExtraAttributes);
        }

        private AppItemtExcelRecordDTO AddExtraAttrs(AppItemtExcelRecordDTO input, string defaultProductType, List<ExtraAttribute> entityExtraAttributes)
        {
            input.ExcelDto.ProductType = defaultProductType;
            input.ExcelDto.ExtraAttributes = entityExtraAttributes;
            input.ExcelDto.ExtraAttributesValues = new List<AppItemImpExtrAttributes>();

            foreach (var extra in entityExtraAttributes)
            {

                if (extra != null)
                {
                    var xCode = extra.IsLookup ? extra.Name.Replace(" ", "") + "Code" : extra.Name.Replace(" ", "");
                    var xName = extra.IsLookup ? extra.Name.Replace(" ", "") + "Name" : extra.Name.Replace(" ", "");

                    var valueCode = input.ExcelDto.GetType()
                      .GetProperty(xCode,
                          System.Reflection.BindingFlags.IgnoreCase
                          | System.Reflection.BindingFlags.Public
                          | System.Reflection.BindingFlags.Instance)
                      ?.GetValue(input.ExcelDto, null);

                    var valueName = input.ExcelDto.GetType()
                      .GetProperty(xName,
                          System.Reflection.BindingFlags.IgnoreCase
                          | System.Reflection.BindingFlags.Public
                          | System.Reflection.BindingFlags.Instance)
                      ?.GetValue(input.ExcelDto, null);


                    input.ExcelDto.ExtraAttributesValues.Add(new AppItemImpExtrAttributes
                    {
                        Name = extra.Name.ToString(),
                        Code = valueCode == null ? "" : valueCode.ToString(),
                        Value = valueName == null ? "" : valueName.ToString(),
                    });

                }
            }

            return input;
        }


        private IDisposable SuppressEntityHistoryForExcelImport()
        {
            return new ImportEntityHistorySuppressionScope(_abpStartupConfiguration);
        }

        private sealed class ImportEntityHistorySuppressionScope : IDisposable
        {
            private static readonly Type[] IgnoredImportEntityTypes =
            {
                typeof(AppItem),
                typeof(AppItemPrices),
                typeof(AppItemSizeScalesHeader),
                typeof(AppItemSizeScalesDetails),
                typeof(AppSizeScalesHeader),
                typeof(AppSizeScalesDetail),
                typeof(AppEntity),
                typeof(AppEntityCategory),
                typeof(AppEntityClassification),
                typeof(AppEntityExtraData),
                typeof(AppEntityAttachment),
                typeof(AppEntityAddress),
                typeof(AppAttachment),
                typeof(SycCounter)
            };

            private readonly IAbpStartupConfiguration _configuration;
            private bool _disposed;

            public ImportEntityHistorySuppressionScope(IAbpStartupConfiguration configuration)
            {
                _configuration = configuration;

                lock (ImportEntityHistoryIgnoredTypesLock)
                {
                    if (ImportEntityHistorySuppressionCount++ == 0)
                    {
                        foreach (var ignoredType in IgnoredImportEntityTypes)
                        {
                            if (!_configuration.EntityHistory.IgnoredTypes.Contains(ignoredType))
                            {
                                _configuration.EntityHistory.IgnoredTypes.Add(ignoredType);
                                ImportEntityHistoryTypesAddedByScope.Add(ignoredType);
                            }
                        }
                    }
                }
            }

            public void Dispose()
            {
                if (_disposed)
                {
                    return;
                }

                lock (ImportEntityHistoryIgnoredTypesLock)
                {
                    ImportEntityHistorySuppressionCount--;
                    if (ImportEntityHistorySuppressionCount == 0)
                    {
                        foreach (var ignoredType in ImportEntityHistoryTypesAddedByScope)
                        {
                            _configuration.EntityHistory.IgnoredTypes.Remove(ignoredType);
                        }

                        ImportEntityHistoryTypesAddedByScope.Clear();
                    }
                }

                _disposed = true;
            }
        }
        //    // select type images
        //    // action 2 add to item
        //    // action 3 add to item code
        //    // action 4 add to color
        //    // remove from result


        [DisableAuditing]
        public async Task<ExcelLogDto> SaveFromExcel(AppItemExcelResultsDTO excelResultsDTO)
        {
            using var importEntityHistorySuppression = SuppressEntityHistoryForExcelImport();

            List<AppItemExcelDto> result = excelResultsDTO.ExcelRecords.Where(r => r.Status !=
            ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AppItemExcelDto>();

            async Task ValidateExcelItemsAsCreateOrEdit()
            {
                var parentRows = result.Where(x => string.IsNullOrEmpty(x.ParentCode)).ToList();
                if (parentRows.Count == 0)
                    return;

                var productTypeIdsByCode = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);
                foreach (var productTypeCode in parentRows.Select(x => x.ProductType).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase))
                {
                    var productTypes = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(productTypeCode);
                    var productType = productTypes.FirstOrDefault();
                    if (productType != null)
                        productTypeIdsByCode[productTypeCode] = productType.Id;
                }

                var validateInput = new List<AppItemValidationInputDTO>();
                foreach (var excelDto in parentRows)
                {
                    decimal.TryParse(excelDto.Price, out var price);
                    productTypeIdsByCode.TryGetValue(excelDto.ProductType ?? string.Empty, out var entityObjectTypeId);

                    validateInput.Add(new AppItemValidationInputDTO
                    {
                        Id = excelDto.Id,
                        Code = excelDto.Code,
                        Name = excelDto.Name,
                        Description = excelDto.ProductDescription,
                        Price = price,
                        EntityObjectTypeId = entityObjectTypeId,
                        ItemType = 0,
                        ParentId = null
                    });
                }

                var validationResults = await ValidateItemData(validateInput);
                var errorList = new List<string>();

                foreach (var item in validationResults.Where(x => x.ErrorMessages != null && x.ErrorMessages.Count > 0))
                {
                    var row = parentRows.FirstOrDefault(x => x.Code == item.Code);
                    var rowLabel = row != null && row.rowNumber > 0 ? $"Row {row.rowNumber} ({item.Code})" : item.Code;
                    foreach (var err in item.ErrorMessages)
                    {
                        errorList.Add($"{rowLabel}: {err}");
                    }
                }

                if (errorList.Count > 0)
                    throw new UserFriendlyException(string.Join("\n", errorList));
            }

            await ValidateExcelItemsAsCreateOrEdit();

            #region handle 4,2,3 actions
            // select type images
            // action 2 add to item
            // action 3 add to item code
            // action 4 add to color
            // remove from result


            // temp end
            List<AppItemtExcelRecordDTO> result123 = excelResultsDTO.ExcelRecords
                .Where(r => r.Status.ToUpper() != ExcelRecordStatus.Failed.ToString().ToUpper() && (r.ExcelDto.Actions == "7" || r.ExcelDto.Actions == "2" || r.ExcelDto.Actions == "3"
                || r.ExcelDto.Actions == "4" || r.ExcelDto.Actions == "5" || r.ExcelDto.Actions == "6"
                || r.ExcelDto.Actions == "8"
                || r.ExcelDto.Actions == "9"
                || r.ExcelDto.Actions == "10" || r.RecordType == "Color")
                && r.Status != ExcelRecordStatus.Failed.ToString()).Select(r => r).ToList<AppItemtExcelRecordDTO>();

            string defaultImportProductType = null;
            List<ExtraAttribute> defaultImportExtraAttributes = null;

            async Task EnsureDefaultImportExtraAttributesLoaded()
            {
                if (defaultImportExtraAttributes != null)
                    return;

                var defaultExtraAttributes = await GetDefaultImportExtraAttributes();
                defaultImportProductType = defaultExtraAttributes.ProductTypeCode;
                defaultImportExtraAttributes = defaultExtraAttributes.ExtraAttributes;
            }

            foreach (var excelDto in result123)
            {
                int number = 0;
                if (excelDto.ExcelDto.Actions != null)
                { number = Int32.Parse(excelDto.ExcelDto.Actions); }

                if (number == 2 || number == 3 || number == 4 || number == 10 || number == 7 || excelDto.RecordType == "Color")
                    if (number == 2 || number == 3 || number == 4 || number == 10 || number == 7 || excelDto.RecordType == "Color")
                    {
                        if (number == 10) { excelDto.ExcelDto.Code = "-"; }
                        foreach (var id in excelDto.ExcelDto.Code.Split(","))
                        { var ret1 = await SaveImageToColor(id, excelDto); }
                    }
                if (number == 5)
                    if (number == 5)
                    {
                        if (excelDto.ExcelDto.Images is null) { excelDto.ExcelDto.Images = new List<AppItemImage>(); }

                        excelDto.ExcelDto.Images.Add(new AppItemImage
                        {
                            ImageFileName = Path.GetFileName(excelDto.ExcelDto.ImagePreview),
                            ImageGuid = Path.GetFileNameWithoutExtension(excelDto.image),
                            IsDefault = excelDto.ExcelDto.ImageIsDefault

                        });

                        if (excelDto.ExcelDto.Code == "-") { excelDto.ExcelDto.Code = excelDto.Code; }
                        if (excelDto.ExcelDto.Name == "-") { excelDto.ExcelDto.Name = excelDto.Name; }
                        if (excelDto.ExcelDto.NoOfDim == null) { excelDto.ExcelDto.NoOfDim = "1"; }
                        if (string.IsNullOrEmpty(excelDto.ExcelDto.ImageType)) { excelDto.ExcelDto.ImageType = "Image"; }

                        await EnsureDefaultImportExtraAttributesLoaded();
                        var xexcelDto = AddExtraAttrs(excelDto, defaultImportProductType, defaultImportExtraAttributes);
                        excelDto.ExcelDto.ExtraAttributes = xexcelDto.ExcelDto.ExtraAttributes;
                        excelDto.ExcelDto.ExtraAttributesValues = xexcelDto.ExcelDto.ExtraAttributesValues;

                        excelDto.ExcelDto.Actions = "";
                        excelDto.ExcelDto.RecordType = "Item";
                        excelDto.RecordType = "Item";


                    }

                if (number == 6)
                {
                    // search for parent record and get ScaleSizesOrder
                    // replace record type as 'Item Variant', and consider as base record
                    // remove the base record
                    int index = excelResultsDTO.ExcelRecords.FindIndex(x => x.Code == excelDto.ParentCode);
                    if (index > -1)
                    {
                        var parent = excelResultsDTO.ExcelRecords[index];
                        int childNo = 0;
                        foreach (var size in parent.ExcelDto.SizeScaleOrder.Split('|'))
                        {
                            var json = JsonConvert.SerializeObject(excelDto);
                            var thirdItemCopy = JsonConvert.DeserializeObject<AppItemtExcelRecordDTO>(json);

                            thirdItemCopy.Code = thirdItemCopy.Code.TrimEnd() + "-" + size.TrimEnd();
                            thirdItemCopy.RecordType = "Item Variant";

                            thirdItemCopy.ExcelDto.Code = thirdItemCopy.Code.TrimEnd();
                            thirdItemCopy.ExcelDto.RecordType = "Item Variant";
                            thirdItemCopy.ExcelDto.SizeCode = size.TrimEnd();
                            thirdItemCopy.ExcelDto.SizeName = size.TrimEnd();

                            thirdItemCopy.ExcelDto.Images = new List<AppItemImage>();
                            thirdItemCopy.ExcelDto.Images.Add(new AppItemImage
                            {
                                ImageFileName = Path.GetFileName(excelDto.ExcelDto.ImagePreview),
                                ImageGuid = Path.GetFileNameWithoutExtension(excelDto.image),
                                IsDefault = excelDto.ExcelDto.ImageIsDefault,
                                Attributes = "101=" + excelDto.ExcelDto.Code.Split('-')[1]
                            });
                            thirdItemCopy.ExcelDto.Images.Add(new AppItemImage
                            {
                                ImageFileName = Path.GetFileName(excelDto.ExcelDto.ImagePreview),
                                ImageGuid = Path.GetFileNameWithoutExtension(excelDto.image),
                                IsDefault = excelDto.ExcelDto.ImageIsDefault,
                                Attributes = "101=" + excelDto.ExcelDto.Code.Split('-')[1]
                            });
                            thirdItemCopy.ExcelDto.Actions = "";
                            childNo += 1;
                            thirdItemCopy.ExcelDto.D1Pos = childNo.ToString();

                            await EnsureDefaultImportExtraAttributesLoaded();
                            var xexcelDto = AddExtraAttrs(thirdItemCopy, defaultImportProductType, defaultImportExtraAttributes);
                            thirdItemCopy.ExcelDto.ExtraAttributes = xexcelDto.ExcelDto.ExtraAttributes;
                            thirdItemCopy.ExcelDto.ExtraAttributesValues = xexcelDto.ExcelDto.ExtraAttributesValues;
                            thirdItemCopy.ExcelDto.ParentCode = thirdItemCopy.ParentCode;
                            excelResultsDTO.ExcelRecords.Insert(index + childNo, thirdItemCopy);

                        }

                    }


                }
                if (number == 8 && !string.IsNullOrEmpty(excelDto.ExcelDto.Code))
                {
                    var record = excelResultsDTO.ExcelRecords[int.Parse(excelDto.ExcelDto.Code)].ExcelDto;
                    var images = record.Images;
                    if (images is null || (images != null && images.Count == 1 && images[0].ImageFileName == "noimage_item.jpg")) { images = new List<AppItemImage>(); }

                    string guid = System.Guid.NewGuid().ToString();

                    images.Add(new AppItemImage
                    {
                        ImageFileName = Path.GetFileName(excelDto.ExcelDto.ImagePreview),
                        ImageGuid = Path.GetFileNameWithoutExtension(excelDto.image),
                        IsDefault = excelDto.ExcelDto.ImageIsDefault
                    });
                    record.Images = images;


                }
                if (number == 9 && !string.IsNullOrEmpty(excelDto.ExcelDto.Code))
                {
                    foreach (var id in excelDto.ExcelDto.Code.Split(","))
                    {
                        var record = excelResultsDTO.ExcelRecords[int.Parse(id)].ExcelDto;
                        var images = record.Images;
                        if (images is null || (images != null && images.Count == 1 && images[0].ImageFileName == "noimage_item.jpg")) { images = new List<AppItemImage>(); }
                        images.Add(new AppItemImage
                        {
                            ImageFileName = Path.GetFileName(excelDto.ExcelDto.ImagePreview),
                            ImageGuid = Path.GetFileNameWithoutExtension(excelDto.image),
                            IsDefault = excelDto.ExcelDto.ImageIsDefault,
                            Attributes = "101=" + excelResultsDTO.ExcelRecords[int.Parse(id)].ExcelDto.Code.Split('-')[1]
                        });
                        record.Images = images;
                    }


                }
            }
            result = excelResultsDTO.ExcelRecords.Where(r => r.Status !=
            ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AppItemExcelDto>();

            result = result.Select(r => r).Where(r => (r.Actions != "2" && r.Actions != "3" && r.Actions != "4"
            && r.Actions != "5" && r.Actions != "6" && r.Actions != "7"
            && r.Actions != "8" && r.Actions != "9" && r.Actions != "10"
            && r.RecordType != "Image" && r.RecordType != "Color")).ToList();

            if (result.Count <= 0)
            {
                #region send notification to current user
                if (AbpSession.UserId != null)
                {
                    long AbpSessionUserId = (long)AbpSession.UserId;
                    await SendItemImportCompletedNotification(excelResultsDTO.FilePath, AbpSession.TenantId, AbpSessionUserId);
                }

                #endregion send notification to current user 

                return excelResultsDTO.ExcelLogDTO;
            }
            #endregion


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


            List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();
            string productType = result.Select(x => x.ProductType).FirstOrDefault().ToString();
            var pdtyp = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributesByCode(productType);
            var productTypeId = pdtyp.FirstOrDefault();
            Dictionary<GetAllEntityObjectTypeOutput, List<LookupLabelDto>> extrattributesLists = new Dictionary<GetAllEntityObjectTypeOutput, List<LookupLabelDto>>();
            long? defIdentfier = null;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var productTypeVar = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(int.Parse(productTypeId.Id.ToString()));
                if (productTypeVar != null)
                {
                    var identifierId = productTypeVar.SycEntityObjectType.SycIdentifierDefinitionId;
                    if (identifierId == null)
                    {
                        var sydobject = _syObjectRepository.FirstOrDefault(x => x.Code == "ITEM");
                        if (sydobject != null)
                        {
                            defIdentfier = sydobject.SycDefaultIdentifierId;
                        }
                    }
                    else { defIdentfier = identifierId; }
                }
            }
            var entityObjectExtraAttribute = (await _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(long.Parse(productTypeId.Id.ToString()))).ToList().FirstOrDefault();
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
            var currencyByCode = currencyIds
                .Where(x => !string.IsNullOrEmpty(x.Code))
                .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);
            var extraAttributesByName = extrattributesLists.Keys
                .Where(x => x != null && !string.IsNullOrEmpty(x.Name))
                .GroupBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);
            var colorLookupByCode = extrattributesLists
                .FirstOrDefault(x => x.Key?.Code == "COLOR")
                .Value?
                .Where(x => !string.IsNullOrWhiteSpace(x.Code))
                .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(x => x.Key, x => x.First().Label, StringComparer.OrdinalIgnoreCase)
                ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            var attachmentsCategoriesByCode = attachmentsCategories
                .Where(x => !string.IsNullOrWhiteSpace(x.Code))
                .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(x => x.Key, x => x.First(), StringComparer.OrdinalIgnoreCase);
            var childrenByParentCode = result
                .Where(x => !string.IsNullOrWhiteSpace(x.ParentCode))
                .GroupBy(x => x.ParentCode, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(x => x.Key, x => x.ToList(), StringComparer.OrdinalIgnoreCase);
            HashSet<string> reservedCopyCodes = null;
            if (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.CreateACopy)
            {
                var existingCodes = await _appItemRepository.GetAll()
                    .AsNoTracking()
                    .Where(x => x.TenantId == AbpSession.TenantId && x.Code != null)
                    .Select(x => x.Code)
                    .ToListAsync();

                reservedCopyCodes = new HashSet<string>(existingCodes, StringComparer.OrdinalIgnoreCase);
            }
            var importParentCount = result.Count(z => string.IsNullOrEmpty(z.ParentCode));
            var itemObjectId = await _helper.SystemTables.GetObjectItemId();
            var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
            var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\";
            var attachmentTenantPath = _appConfiguration[$"Attachment:Path"] + @"\" + tenantId.ToString();
            var attachmentTenantDirectoryEnsured = false;
            string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/" + tenantId + @"/";
            var itemStatusId = await _helper.SystemTables.GetEntityObjectStatusItemActive();
            List<AppItem> appItemList = new List<AppItem>();
            List<AppItem> appItemModifyList = new List<AppItem>();
            List<AppEntity> appEntityDeleteList = new List<AppEntity>();
            List<AppEntityAttachment> appEntityAttachmentDeleteList = new List<AppEntityAttachment>();
            List<AppEntityCategory> appEntityCategoryDeleteList = new List<AppEntityCategory>();
            List<AppEntityClassification> appEntityClassificationDeleteList = new List<AppEntityClassification>();
            List<AppEntityExtraData> appEntityExtraDataDeleteList = new List<AppEntityExtraData>();
            var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
            List<string> sizeScaleNames = new List<string>();
            var createdSizeScalesByName = new Dictionary<string, AppSizeScaleForEditDto>(StringComparer.OrdinalIgnoreCase);
            var createdSizeRatiosByName = new Dictionary<string, AppSizeScaleForEditDto>(StringComparer.OrdinalIgnoreCase);

            void EnsureAttachmentTenantDirectory()
            {
                if (attachmentTenantDirectoryEnsured)
                    return;

                if (!System.IO.Directory.Exists(attachmentTenantPath))
                    System.IO.Directory.CreateDirectory(attachmentTenantPath);

                attachmentTenantDirectoryEnsured = true;
            }

            const int importSaveBatchSize = 100;
            var pendingLeanImportItems = 0;
            var importedParentsWithVariations = new List<AppItem>();
            List<SycSegmentIdentifierDefinition> importSsinSegments = null;
            SycSegmentIdentifierDefinition importSsinSequenceSegment = null;
            SycCounter importSsinCounter = null;
            long? importSsinNextCounter = null;
            async Task PrepareImportSsinRange(int requiredCount)
            {
                if (requiredCount <= 0 || importSsinNextCounter.HasValue)
                    return;

                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var objectRec = await _syObjectRepository.GetAll()
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x => x.Id == itemObjectId);

                    if (objectRec?.SSINIdentifierId == null)
                        return;

                    importSsinSegments = await _sycSegmentIdentifierDefinition.GetAll()
                        .Where(e => e.SycIdentifierDefinitionId == objectRec.SSINIdentifierId)
                        .OrderBy(e => e.SegmentNumber)
                        .ToListAsync();

                    importSsinSequenceSegment = importSsinSegments
                        .FirstOrDefault(e => e.IsAutoGenerated && e.SegmentType == "Sequence");

                    if (importSsinSequenceSegment == null)
                        return;

                    importSsinCounter = await _sycCounter.GetAll()
                        .FirstOrDefaultAsync(e => e.SycSegmentIdentifierDefinitionId == importSsinSequenceSegment.Id &&
                                                  e.TenantId == AbpSession.TenantId);

                    if (importSsinCounter == null)
                    {
                        importSsinCounter = new SycCounter
                        {
                            SycSegmentIdentifierDefinitionId = importSsinSequenceSegment.Id,
                            Counter = importSsinSequenceSegment.CodeStartingValue + requiredCount,
                            TenantId = AbpSession.TenantId
                        };
                        importSsinNextCounter = importSsinSequenceSegment.CodeStartingValue;
                        await _sycCounter.InsertAsync(importSsinCounter);
                    }
                    else
                    {
                        importSsinNextCounter = importSsinCounter.Counter;
                        importSsinCounter.Counter += requiredCount;
                        await _sycCounter.UpdateAsync(importSsinCounter);
                    }

                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }

            async Task GenerateImportedParentSsin(AppItem importedItem)
            {
                if (!string.IsNullOrEmpty(importedItem.SSIN) || importedItem.EntityFk == null)
                    return;

                if (importSsinSequenceSegment == null || importSsinSegments == null || !importSsinNextCounter.HasValue)
                {
                    importedItem.SSIN = await _helper.SystemTables.GenerateSSIN(
                        itemObjectId,
                        ObjectMapper.Map<AppEntityDto>(importedItem.EntityFk));
                }
                else
                {
                    var ssinParts = new List<string>();
                    foreach (var segment in importSsinSegments)
                    {
                        if (segment.IsAutoGenerated && segment.SegmentType == "Sequence")
                        {
                            if (segment.SegmentLength > 0)
                                ssinParts.Add(importSsinNextCounter.Value.ToString().Trim().PadLeft(segment.SegmentLength, '0'));

                            importSsinNextCounter++;
                            continue;
                        }

                        if (segment.SegmentType == "Field")
                        {
                            string segmentValue = null;
                            if (segment.LookOrFieldName.ToUpper() == "TENANTID")
                            {
                                segmentValue = importedItem.EntityFk.TenantId?.ToString() ?? AbpSession.TenantId?.ToString();
                            }
                            else
                            {
                                var prop = importedItem.EntityFk.GetType().GetProperty(segment.LookOrFieldName);
                                segmentValue = prop?.GetValue(importedItem.EntityFk)?.ToString();
                            }

                            if (!string.IsNullOrEmpty(segmentValue))
                            {
                                if (segment.SegmentLength > 0)
                                    segmentValue = segmentValue.PadLeft(segment.SegmentLength, '0');

                                ssinParts.Add(segmentValue);
                            }
                        }
                    }

                    importedItem.SSIN = string.Join("-", ssinParts);
                }

                importedItem.EntityFk.SSIN = importedItem.SSIN;
            }

            async Task SaveLeanImportBatchIfNeeded()
            {
                if (pendingLeanImportItems < importSaveBatchSize)
                    return;

                await x.SaveChangesAsync();
                x.ChangeTracker.Clear();
                appItemList.Clear();
                appItemModifyList.Clear();
                pendingLeanImportItems = 0;
            }

            async Task FlushLeanImportBatch()
            {
                if (pendingLeanImportItems == 0)
                    return;

                if (appItemList.Count > 0)
                    x.AppItems.AddRange(appItemList);

                if (appItemModifyList.Count > 0)
                    x.AppItems.UpdateRange(appItemModifyList);

                await x.SaveChangesAsync();
                x.ChangeTracker.Clear();
                appItemList.Clear();
                appItemModifyList.Clear();
                pendingLeanImportItems = 0;
            }

            async Task SaveImportedItemLean(AppItem importedItem)
            {
                if (importedItem.Id == 0)
                {
                    appItemList.Add(importedItem);
                }
                else
                {
                    var importedItemIds = new List<long> { importedItem.Id };
                    if (importedItem.ParentFkList != null)
                    {
                        importedItemIds.AddRange(importedItem.ParentFkList
                            .Where(z => z.Id != 0)
                            .Select(z => z.Id));
                    }

                    await x.AppItemPrices
                        .Where(z => importedItemIds.Contains(z.AppItemId))
                        .DeleteAsync();

                    appItemModifyList.Add(importedItem);
                }

                pendingLeanImportItems++;

                if (pendingLeanImportItems >= importSaveBatchSize)
                {
                    if (appItemList.Count > 0)
                        x.AppItems.AddRange(appItemList);

                    if (appItemModifyList.Count > 0)
                        x.AppItems.UpdateRange(appItemModifyList);
                }

                await SaveLeanImportBatchIfNeeded();
            }

            var existingParentIds = result
                .Where(z => string.IsNullOrEmpty(z.ParentCode) && z.Id != 0)
                .Select(z => z.Id)
                .Distinct()
                .ToList();
            var existingParentsById = existingParentIds.Count == 0
                ? new Dictionary<long, AppItem>()
                : (await _appItemRepository.GetAll()
                    .AsNoTracking()
                    .AsSplitQuery()
                    .Where(z => existingParentIds.Contains(z.Id) && z.ListingItemId == null)
                    .Include(z => z.EntityFk).ThenInclude(z => z.EntityCategories)
                    .Include(z => z.EntityFk).ThenInclude(z => z.EntityClassifications)
                    .Include(z => z.EntityFk).ThenInclude(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                    .Include(z => z.EntityFk).ThenInclude(z => z.EntityExtraData)
                    .Include(z => z.ItemPricesFkList)
                    .Include(z => z.ParentFkList).ThenInclude(z => z.EntityFk).ThenInclude(z => z.EntityExtraData)
                    .Include(z => z.ParentFkList).ThenInclude(z => z.EntityFk).ThenInclude(z => z.EntityCategories)
                    .Include(z => z.ParentFkList).ThenInclude(z => z.EntityFk).ThenInclude(z => z.EntityClassifications)
                    .Include(z => z.ParentFkList).ThenInclude(z => z.EntityFk).ThenInclude(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                    .Include(z => z.ParentFkList).ThenInclude(z => z.ItemPricesFkList)
                    .ToListAsync())
                    .ToDictionary(z => z.Id);
            var existingItemScaleHeadersByItemId = existingParentIds.Count == 0
                ? new Dictionary<long, List<AppItemSizeScalesHeader>>()
                : (await x.AppItemSizeScalesHeaders
                    .AsNoTracking()
                    .Where(z => existingParentIds.Contains(z.AppItemId))
                    .Include(z => z.AppItemSizeScalesDetails)
                    .ToListAsync())
                    .GroupBy(z => z.AppItemId)
                    .ToDictionary(z => z.Key, z => z.ToList());
            var requestedSizeScaleNames = result
                .Where(z => !string.IsNullOrWhiteSpace(z.SizeScaleName))
                .Select(z => z.SizeScaleName.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            var requestedSizeRatioNames = result
                .Where(z => !string.IsNullOrWhiteSpace(z.SizeRatioName) || !string.IsNullOrWhiteSpace(z.SizeScaleName))
                .Select(z => !string.IsNullOrWhiteSpace(z.SizeRatioName) ? z.SizeRatioName.Trim() : z.SizeScaleName.TrimEnd() + " Ratio")
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            var sizeScaleHeadersByName = requestedSizeScaleNames.Count == 0
                ? new Dictionary<string, AppSizeScalesHeader>(StringComparer.OrdinalIgnoreCase)
                : (await _appSizeScalesHeaderRepository.GetAll()
                    .AsNoTracking()
                    .Where(z => z.ParentId == null && requestedSizeScaleNames.Contains(z.Name))
                    .ToListAsync())
                    .GroupBy(z => z.Name, StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(z => z.Key, z => z.First(), StringComparer.OrdinalIgnoreCase);
            var sizeRatioHeadersByName = requestedSizeRatioNames.Count == 0
                ? new Dictionary<string, AppSizeScalesHeader>(StringComparer.OrdinalIgnoreCase)
                : (await _appSizeScalesHeaderRepository.GetAll()
                    .AsNoTracking()
                    .Where(z => z.ParentId != null && requestedSizeRatioNames.Contains(z.Name))
                    .ToListAsync())
                    .GroupBy(z => z.Name, StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(z => z.Key, z => z.First(), StringComparer.OrdinalIgnoreCase);
            await PrepareImportSsinRange(importParentCount);
            foreach (AppItemExcelDto excelDto in result)
            {
                if (!string.IsNullOrEmpty(excelDto.ParentCode))
                    continue;
                var itemEntityExtraData = new List<AppEntityExtraData>();
                AppItem itemOrg = new AppItem();
                if (excelDto.Id != 0)
                {
                    //T-SII-20231127.0001,1 MMT 02/05/2024 Import product does not import new variations of an existing item[Start]
                    bool lNewVariation = false;
                    if (childrenByParentCode.TryGetValue(excelDto.Code, out var importedChildren))
                        lNewVariation = importedChildren.Any(z => z.Id == 0);
                    //T-SII-20231127.0001,1 MMT 02/05/2024 Import product does not import new variations of an existing item[End]
                    switch (excelResultsDTO.RepreateHandler)
                    {
                        case ExcelRecordRepeateHandler.IgnoreDuplicatedRecords: //ignore
                            //T-SII-20231127.0001,1 MMT 02/05/2024 Import product does not import new variations of an existing item[Start]
                            if (lNewVariation == true)
                            {
                                existingParentsById.TryGetValue(excelDto.Id, out itemOrg);
                                break;
                            }
                            else
                                //T-SII-20231127.0001,1 MMT 02/05/2024 Import product does not import new variations of an existing item[End]
                                continue;
                        case ExcelRecordRepeateHandler.ReplaceDuplicatedRecords: // replace

                            existingParentsById.TryGetValue(excelDto.Id, out itemOrg);


                            break;
                        case ExcelRecordRepeateHandler.CreateACopy: // override
                            string oldCode = excelDto.Code;
                            excelDto.Code = GetItemCopyCode(excelDto.Code, reservedCopyCodes);
                            excelDto.Id = 0;
                            if (childrenByParentCode.TryGetValue(oldCode, out var childItemsCopy))
                            {
                                foreach (var itemCopy in childItemsCopy)
                                {
                                    itemCopy.Code = GetItemCopyCode(itemCopy.Code, reservedCopyCodes);
                                    itemCopy.Id = 0;
                                    itemCopy.ParentCode = excelDto.Code;
                                }

                                childrenByParentCode.Remove(oldCode);
                                childrenByParentCode[excelDto.Code] = childItemsCopy;
                            }
                            break;
                        default:
                            break;
                    }
                }


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

                if (string.IsNullOrEmpty(excelDto.Price))
                    excelDto.Price = "0";

                appItem.Price = decimal.Parse(excelDto.Price);
                long? excelCurrencyId = null;
                if (!string.IsNullOrEmpty(excelDto.Currency) && currencyByCode.TryGetValue(excelDto.Currency, out var excelCurrencyObj))
                    excelCurrencyId = excelCurrencyObj.Value;
                //XX
                if (appItem.ItemPricesFkList == null)
                    appItem.ItemPricesFkList = new List<AppItemPrices>();
                else
                {
                    if (appItem.ItemPricesFkList.Count > 0)
                        appItem.ItemPricesFkList = new List<AppItemPrices>();
                }
                {
                    appItem.ItemPricesFkList.Add(new AppItemPrices
                    {
                        AppItemCode = appItem.Code,
                        Code = "MSRP",
                        Price = appItem.Price,
                        CurrencyCode = string.IsNullOrEmpty(excelDto.Currency) ? currencyCode : excelDto.Currency,
                        TenantId = AbpSession.TenantId,
                        CurrencyId = !string.IsNullOrEmpty(excelDto.Currency) ? excelCurrencyId : currencyIDDef,
                        IsDefault = true
                    });
                }
                if (string.IsNullOrEmpty(excelDto.PriceA))
                    excelDto.PriceA = "0";
                if (!string.IsNullOrEmpty(excelDto.PriceA))// && decimal.Parse(excelDto.PriceA) > 0)
                {
                    appItem.ItemPricesFkList.Add(new AppItemPrices
                    {
                        AppItemCode = appItem.Code,
                        Code = "A",
                        Price = decimal.Parse(excelDto.PriceA),
                        CurrencyCode = string.IsNullOrEmpty(excelDto.Currency) ? currencyCode : excelDto.Currency,
                        TenantId = AbpSession.TenantId,
                        CurrencyId = !string.IsNullOrEmpty(excelDto.Currency) ? excelCurrencyId : currencyIDDef,
                        IsDefault = true
                    });
                }
                if (string.IsNullOrEmpty(excelDto.PriceB))
                    excelDto.PriceB = "0";

                if (!string.IsNullOrEmpty(excelDto.PriceB))// &&  decimal.Parse(excelDto.PriceB) > 0)
                {
                    appItem.ItemPricesFkList.Add(new AppItemPrices
                    {
                        AppItemCode = appItem.Code,
                        Code = "B",
                        Price = decimal.Parse(excelDto.PriceB),
                        CurrencyCode = string.IsNullOrEmpty(excelDto.Currency) ? currencyCode : excelDto.Currency,
                        TenantId = AbpSession.TenantId,
                        CurrencyId = !string.IsNullOrEmpty(excelDto.Currency) ? excelCurrencyId : currencyIDDef,
                        IsDefault = true
                    });
                }
                if (string.IsNullOrEmpty(excelDto.PriceC))
                    excelDto.PriceC = "0";

                if (!string.IsNullOrEmpty(excelDto.PriceC))// && decimal.Parse(excelDto.PriceC) > 0)
                {
                    appItem.ItemPricesFkList.Add(new AppItemPrices
                    {
                        AppItemCode = appItem.Code,
                        Code = "C",
                        Price = decimal.Parse(excelDto.PriceC),
                        CurrencyCode = string.IsNullOrEmpty(excelDto.Currency) ? currencyCode : excelDto.Currency,
                        TenantId = AbpSession.TenantId,
                        CurrencyId = !string.IsNullOrEmpty(excelDto.Currency) ? excelCurrencyId : currencyIDDef,
                        IsDefault = true
                    });
                }
                if (string.IsNullOrEmpty(excelDto.PriceD))
                    excelDto.PriceD = "0";

                if (!string.IsNullOrEmpty(excelDto.PriceD))// && decimal.Parse(excelDto.PriceD) > 0)
                {
                    appItem.ItemPricesFkList.Add(new AppItemPrices
                    {
                        AppItemCode = appItem.Code,
                        Code = "D",
                        Price = decimal.Parse(excelDto.PriceD),
                        CurrencyCode = string.IsNullOrEmpty(excelDto.Currency) ? currencyCode : excelDto.Currency,
                        TenantId = AbpSession.TenantId,
                        CurrencyId = !string.IsNullOrEmpty(excelDto.Currency) ? excelCurrencyId : currencyIDDef,
                        IsDefault = true
                    });
                }
                //XX
                appItem.Name = excelDto.Name;

                if (excelDto.ExtraAttributesValues != null)
                {

                    for (int et = 0; et < excelDto.ExtraAttributesValues.Count; et++)
                    {
                        if (excelDto.ExtraAttributes[et].IsVariation) continue;

                        if (!extraAttributesByName.TryGetValue(excelDto.ExtraAttributes[et].Name, out var AttributeInfoObj)) continue;
                        itemEntityExtraData.Add(new AppEntityExtraData
                        {
                            AttributeCode = excelDto.ExtraAttributesValues[et].Code,
                            AttributeValue = excelDto.ExtraAttributesValues[et].Value,
                            AttributeValueId = null,//AttributeValueId,
                            EntityObjectTypeName = excelDto.ExtraAttributes[et].Name,
                            AttributeId = excelDto.ExtraAttributes[et].AttributeId,
                            EntityObjectTypeId = AttributeInfoObj.Id

                        });
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
                appItem.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                appItem.EntityFk.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                if (excelDto.Id == 0)
                    appItem.EntityFk.EntityAttachments = new List<AppEntityAttachment>();

                if (!string.IsNullOrEmpty(excelDto.ImageType) && excelDto.Images != null && excelDto.Images.Count > 0)
                {
                    attachmentsCategoriesByCode.TryGetValue(excelDto.ImageType, out var attachCategory);
                    var defaultImage = excelDto.Images.Where(x => x.ImageFileName.ToLower().Contains("_default") || x.IsDefault).FirstOrDefault();

                    if (appItem.EntityFk.EntityAttachments.Count > 0)
                    {
                        var defaultExists = excelDto.Images.Select(w => w.IsDefault).ToList();
                        if (defaultExists != null && defaultExists.Count > 0)
                        {
                            foreach (var img in appItem.EntityFk.EntityAttachments)
                            { img.IsDefault = false; }
                        }
                    }
                    foreach (var img in excelDto.Images)
                    {
                        if (img.ImageFileName == "noimage_item.jpg")
                        {
                            img.ImageGuid = Guid.NewGuid().ToString();
                            EnsureAttachmentTenantDirectory();

                            try
                            {
                                System.IO.File.Copy(System.IO.Directory.GetCurrentDirectory() + @"\Assets\noimage_item.jpg", attachmentTenantPath + @"\" + img.ImageGuid + ".jpg", true);
                            }
                            catch { }
                        }
                        else
                        {
                            EnsureAttachmentTenantDirectory();

                            try
                            {
                                System.IO.File.Copy(path + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], attachmentTenantPath + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], true);
                            }
                            catch { }
                        }
                        AppEntityAttachment appEntityAttachment = new AppEntityAttachment();
                        appEntityAttachment.AttachmentFk = new Attachments.AppAttachment { Name = img.ImageFileName, Attachment = img.ImageGuid + "." + img.ImageFileName.Split('.')[1], TenantId = AbpSession.TenantId };
                        appEntityAttachment.AttachmentCategoryId = attachCategory.Id;
                        appEntityAttachment.Attributes = img.Attributes;
                        appEntityAttachment.AttachmentCategoryCode = attachCategory.Code;
                        appEntityAttachment.EntityCode = excelDto.Code;
                        if (img.ImageFileName.ToLower().Contains("_default") || img.IsDefault)
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
                DateTime timeStamp = DateTime.Now;
                appItem.TimeStamp = timeStamp;
                appItem.EntityFk.TimeStamp = timeStamp;
                appItem.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                appItem.EntityFk.TenantOwner = appItem.TenantOwner;
                await GenerateImportedParentSsin(appItem);

                if (appItem.ParentFkList != null && appItem.ParentFkList.Any())
                    importedParentsWithVariations.Add(appItem);

                if (!string.IsNullOrEmpty(excelDto.SizeScaleName))
                {
                    sizeRatioHeadersByName.TryGetValue(excelDto.SizeRatioName ?? string.Empty, out var ratioHeader);
                    sizeScaleHeadersByName.TryGetValue(excelDto.SizeScaleName ?? string.Empty, out var scaleHeader);
                    if (scaleHeader == null || ratioHeader == null || (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.CreateACopy) ||
                       (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.ReplaceDuplicatedRecords) || (excelDto.Id == 0))
                    {
                        var d1sizesArray = !string.IsNullOrEmpty(excelDto.D1Sizes) ? excelDto.D1Sizes.Split('|') : "".Split('|');
                        var d2sizesArray = !string.IsNullOrEmpty(excelDto.D2Sizes) ? excelDto.D2Sizes.Split('|') : "".Split('|');
                        var d3sizesArray = !string.IsNullOrEmpty(excelDto.D3Sizes) ? excelDto.D3Sizes.Split('|') : "".Split('|'); ;
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
                        List<AppSizeScalesDetailDto> appSizeScalesDetailDtoList = new List<AppSizeScalesDetailDto>();
                        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
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
                        childrenByParentCode.TryGetValue(excelDto.Code, out var sizeChildren);
                        var sizes = (sizeChildren ?? new List<AppItemExcelDto>())
                            .Select(a => new { a.SizeCode, a.D1Pos, a.D2Pos, a.D3Pos })
                            .Distinct()
                            .ToList();
                        if (sizes != null)
                        {
                            foreach (var sz in sizes)
                            {
                                var exist = appSizeScalesDetailDtoList.FirstOrDefault(z => z.SizeCode == sz.SizeCode &&
                                   z.D1Position == (sz.D1Pos == null || sz.D1Pos == "0" ? null : (int.Parse(sz.D1Pos.ToString()) - 1).ToString()) &&
                                   z.D2Position == (sz.D2Pos == null || sz.D2Pos == "0" ? null : (int.Parse(sz.D2Pos.ToString()) - 1).ToString()) &&
                                   z.D3Position == (sz.D3Pos == null || sz.D3Pos == "0" ? null : (int.Parse(sz.D3Pos.ToString()) - 1).ToString()));
                                if (exist == null)
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
                        AppSizeScaleForEditDto appSizeScaleForEditDto = new AppSizeScaleForEditDto();
                        appSizeScaleForEditDto.AppSizeScalesDetails = appSizeScalesDetailDtoList;
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
                        long? sizeScaleSavedId = 0;
                        AppSizeScaleForEditDto sizescale = null;
                        try
                        {
                            if (!string.IsNullOrEmpty(excelDto.SizeScaleName) &&
                                createdSizeScalesByName.TryGetValue(excelDto.SizeScaleName, out sizescale))
                            {
                                sizeScaleSavedId = sizescale.Id;
                            }
                            else
                            {
                                sizescale = await _appSizeScaleAppService.CreateOrEditAppSizeScale(appSizeScaleForEditDto);
                                sizeScaleSavedId = sizescale.Id;
                                if (!string.IsNullOrEmpty(excelDto.SizeScaleName))
                                    createdSizeScalesByName[excelDto.SizeScaleName] = sizescale;
                                sizeScaleNames.Add(excelDto.SizeScaleName);
                            }
                        }
                        catch (Exception ex)
                        {
                            if (sizeScaleNames.FirstOrDefault(z => z == excelDto.SizeScaleName) != null)
                            {
                                sizescale = await _appSizeScaleAppService.GetSizeScaleForEdit(long.Parse(appSizeScaleForEditDto.Id.ToString()));
                                sizeScaleSavedId = sizescale.Id;
                                if (!string.IsNullOrEmpty(excelDto.SizeScaleName))
                                    createdSizeScalesByName[excelDto.SizeScaleName] = sizescale;
                            }
                        }

                        long sizeRatioId = 0;
                        long sizeScaleId = 0;
                        existingItemScaleHeadersByItemId.TryGetValue(appItem.Id, out var itemScaleData);
                        itemScaleData ??= new List<AppItemSizeScalesHeader>();
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
                        appItemSizeScalesHeader.Name = sizescale.Name;
                        appItemSizeScalesHeader.SizeScaleCode = sizescale.Code;
                        appItemSizeScalesHeader.NoOfDimensions = sizescale.NoOfDimensions;
                        appItemSizeScalesHeader.Dimesion1Name = sizescale.Dimesion1Name;
                        appItemSizeScalesHeader.ParentId = null;
                        appItemSizeScalesHeader.AppItemSizeScalesDetails = ObjectMapper.Map<List<AppItemSizeScalesDetails>>(appSizeScalesDetailDtoList.Where(z => z.DimensionName != null));
                        appItemSizeScalesHeader.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                        appItemSizeScalesHeader.AppItemSizeScalesDetails.ForEach(a => a.TenantId = AbpSession.TenantId);
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
                                    }
                                }
                            }

                        }


                        {
                            var scaleRatioName = !string.IsNullOrEmpty(excelDto.SizeRatioName) ? excelDto.SizeRatioName : sizescale.Name.TrimEnd() + " Ratio";
                            sizeRatioHeadersByName.TryGetValue(scaleRatioName, out var scaleHeaderRatio);
                            if (scaleHeaderRatio == null || (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.CreateACopy) ||
                                (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.ReplaceDuplicatedRecords))
                            {
                                AppSizeScaleForEditDto appSizeScaleRatioForEditDto = new AppSizeScaleForEditDto();
                                appSizeScaleRatioForEditDto.AppSizeScalesDetails = appSizeScalesDetailDtoList;
                                appSizeScaleRatioForEditDto.NoOfDimensions = 1;
                                appSizeScaleRatioForEditDto.ParentId = sizescale.Id;

                                if (scaleHeaderRatio != null & (excelResultsDTO.RepreateHandler == ExcelRecordRepeateHandler.ReplaceDuplicatedRecords))
                                {
                                    appSizeScaleRatioForEditDto.Id = scaleHeaderRatio.Id;
                                    appSizeScaleRatioForEditDto.Code = scaleHeaderRatio.Code;
                                }
                                else
                                    appSizeScaleRatioForEditDto.Code = "";

                                appSizeScaleRatioForEditDto.Dimesion1Name = sizescale.Dimesion1Name;
                                appSizeScaleRatioForEditDto.Name = scaleRatioName;
                                string[] arraySizeRatio = new string[sizes.Count];
                                System.Array.Fill(arraySizeRatio, "0");
                                if (!string.IsNullOrEmpty(excelDto.SizeRatioName))
                                {
                                    var arrayRatio = excelDto.SizeRatioValue.Split('=')[0];
                                    arraySizeRatio = arrayRatio.Split('-');
                                }
                                List<AppSizeScalesDetailDto> appSizeScalesRatioDetailDtoList = new List<AppSizeScalesDetailDto>();
                                if (!string.IsNullOrEmpty(excelDto.SizeRatioName) && !string.IsNullOrEmpty(excelDto.SizeRatioValue.Split('|')[0]) && !string.IsNullOrEmpty(excelDto.SizeRatioValue.Split('|')[1]))
                                {
                                    var sizesList = excelDto.SizeRatioValue.Split('|')[0].Split('~').ToList();
                                    var sizesRatios = excelDto.SizeRatioValue.Split('|')[1].Split('-').ToList();
                                    var sizesRatio = (sizeChildren ?? new List<AppItemExcelDto>())
                                        .Select(a => new { a.SizeCode, a.D1Pos, a.D2Pos, a.D3Pos })
                                        .Distinct()
                                        .ToList();
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
                                }
                                if (string.IsNullOrEmpty(excelDto.SizeRatioName) && (appSizeScaleRatioForEditDto.AppSizeScalesDetails == null || appSizeScaleRatioForEditDto.AppSizeScalesDetails.Count == 0))
                                {
                                    foreach (var sz in appSizeScaleForEditDto.AppSizeScalesDetails)
                                    {
                                        {
                                            appSizeScalesRatioDetailDtoList.Add(new AppSizeScalesDetailDto
                                            {
                                                SizeCode = sz.SizeCode.TrimEnd(),
                                                D3Position = sz.D3Position,
                                                SizeId = null,
                                                D1Position = sz.D1Position,
                                                D2Position = sz.D2Position,
                                                SizeRatio = 0
                                            });
                                        }
                                    }
                                    appSizeScaleRatioForEditDto.AppSizeScalesDetails = appSizeScalesRatioDetailDtoList;

                                }
                                appSizeScaleRatioForEditDto.Id = 0;
                                AppSizeScaleForEditDto sizescaleRatio = null;

                                if (createdSizeRatiosByName.TryGetValue(scaleRatioName, out sizescaleRatio))
                                {
                                    // Reuse the ratio created earlier in this import batch.
                                }
                                else
                                {
                                    try
                                    {
                                        sizescaleRatio = await _appSizeScaleAppService.CreateOrEditAppSizeScale(appSizeScaleRatioForEditDto);
                                        createdSizeRatiosByName[scaleRatioName] = sizescaleRatio;

                                    }
                                    catch (Exception ex)
                                    {
                                        if (sizeScaleNames.FirstOrDefault(z => z == excelDto.SizeScaleName) != null)
                                        {
                                            sizescaleRatio = await _appSizeScaleAppService.GetSizeScaleForEdit(long.Parse(appSizeScaleRatioForEditDto.Id.ToString()));
                                            createdSizeRatiosByName[scaleRatioName] = sizescaleRatio;
                                        }
                                    }
                                }
                                //T-SII-20250725.0002,1 MMT 09/24/2025 Fix import item issues[End]
                                AppItemSizeScalesHeader appItemSizeScalesHeaderRatio = new AppItemSizeScalesHeader();
                                appItemSizeScalesHeaderRatio.SizeScaleId = sizescaleRatio.Id;
                                appItemSizeScalesHeaderRatio.Id = sizeRatioId;
                                appItemSizeScalesHeaderRatio.Name = sizescaleRatio.Name;
                                appItemSizeScalesHeaderRatio.SizeScaleCode = sizescaleRatio.Code;
                                appItemSizeScalesHeaderRatio.NoOfDimensions = sizescaleRatio.NoOfDimensions;
                                appItemSizeScalesHeaderRatio.Dimesion1Name = sizescaleRatio.Dimesion1Name;
                                appItemSizeScalesHeaderRatio.ParentId = null;// appItemSizeScalesHeader.Id;
                                appItemSizeScalesHeaderRatio.TenantId = AbpSession.TenantId;
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails = ObjectMapper.Map<List<AppItemSizeScalesDetails>>(appSizeScalesRatioDetailDtoList);
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.ForEach(a => a.Id = 0);
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.ForEach(a => a.TenantId = AbpSession.TenantId);
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.ForEach(a => a.DimensionName = sizescale.Dimesion1Name);
                                appItemSizeScalesHeaderRatio.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = appItemSizeScalesHeaderRatio.Id);
                                if (appItem.Id != 0 && itemScaleData != null && itemScaleData.Count > 0)
                                {

                                    var sizeScaleH = itemScaleData.FirstOrDefault(x => x.ParentId != null);
                                    if (sizeScaleH != null)
                                    {
                                        var cnt = itemScaleData.Count(x => x.ParentId != null);
                                        if (cnt > 1)
                                        {
                                            await _appItemSizeScalesHeaderRepository.DeleteAsync(x => x.AppItemId == appItem.Id && x.Id != sizeScaleH.Id && x.ParentId != null);
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
                                if (appItem.ItemSizeScaleHeadersFkList.Count == 0)
                                {
                                    appItemSizeScalesHeader.AppItemId = appItem.Id;
                                    appItem.ItemSizeScaleHeadersFkList.Add(appItemSizeScalesHeader);
                                }
                                appItemSizeScalesHeaderRatio.AppItemId = appItem.Id;
                                appItemSizeScalesHeaderRatio.ItemSizeScaleFK = appItemSizeScalesHeader;
                                appItem.ItemSizeScaleHeadersFkList.Add(appItemSizeScalesHeaderRatio);
                            }

                        }
                        if (appItem.ItemSizeScaleHeadersFkList.Count == 0)
                        {
                            appItemSizeScalesHeader.AppItemId = appItem.Id;
                            appItem.ItemSizeScaleHeadersFkList.Add(appItemSizeScalesHeader);
                        }


                    }
                }
                else
                {
                    long sizeScaleId = 0;
                    string scaleName = appItem.Code + " Scale";
                    string scaleCode = null;
                    string scaleDim1Name = appItem.Code + " 1st Dimesion";


                    existingItemScaleHeadersByItemId.TryGetValue(appItem.Id, out var itemScaleData);
                    itemScaleData ??= new List<AppItemSizeScalesHeader>();
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
                    childrenByParentCode.TryGetValue(excelDto.Code, out var childrenForParent);
                    var childItemsExtraData = (childrenForParent ?? new List<AppItemExcelDto>())
                        .Select(a => new { a.ExtraAttributes, a.ExtraAttributesValues });
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

                var childItems = childrenByParentCode.TryGetValue(excelDto.Code, out var children)
                    ? children
                    : new List<AppItemExcelDto>();
                bool firstItem = false;
                foreach (var item in childItems)
                {
                    var appChildItem = new AppItem();
                    if (excelDto.Id != 0)
                    {
                        var itemExist = appItem.ParentFkList.FirstOrDefault(x => x.Code.Replace(" ", string.Empty) == item.Code.Replace(" ", string.Empty));
                        if (itemExist != null)
                        {
                            appChildItem = itemExist;
                            appChildItem.Description = excelDto.ProductDescription;
                            appChildItem.Price = decimal.Parse(excelDto.Price);
                            appChildItem.Name = excelDto.Name;
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
                    if (appChildItem.ItemPricesFkList == null)
                        appChildItem.ItemPricesFkList = new List<AppItemPrices>();
                    else
                    {
                        if (appChildItem.ItemPricesFkList.Count > 0)
                            appChildItem.ItemPricesFkList = new List<AppItemPrices>();
                    }
                    if (string.IsNullOrEmpty(appChildItem.Price.ToString()))
                        appChildItem.Price = 0;

                    long? itemCurrencyId = null;
                    if (!string.IsNullOrEmpty(item.Currency) && currencyByCode.TryGetValue(item.Currency, out var itemCurrencyObj))
                        itemCurrencyId = itemCurrencyObj.Value;
                    {
                        appChildItem.ItemPricesFkList.Add(new AppItemPrices
                        {
                            AppItemCode = appChildItem.Code,
                            Code = "MSRP",
                            CurrencyId = !string.IsNullOrEmpty(item.Currency) ? itemCurrencyId : currencyIDDef,
                            Price = appChildItem.Price,
                            CurrencyCode = string.IsNullOrEmpty(item.Currency) ? currencyCode : item.Currency,
                            TenantId = AbpSession.TenantId,
                            IsDefault = true
                        });
                    }
                    if (string.IsNullOrEmpty(item.PriceA))
                        item.PriceA = "0";

                    if (!string.IsNullOrEmpty(item.PriceA))// &&  decimal.Parse(item.PriceA) > 0)
                    {
                        appChildItem.ItemPricesFkList.Add(new AppItemPrices
                        {
                            AppItemCode = appChildItem.Code,
                            Code = "A",
                            Price = decimal.Parse(item.PriceA),
                            CurrencyCode = string.IsNullOrEmpty(item.Currency) ? currencyCode : item.Currency,
                            TenantId = AbpSession.TenantId,
                            CurrencyId = !string.IsNullOrEmpty(item.Currency) ? itemCurrencyId : currencyIDDef,
                            IsDefault = true
                        });
                    }
                    if (string.IsNullOrEmpty(item.PriceB))
                        item.PriceB = "0";

                    if (!string.IsNullOrEmpty(item.PriceB))// && decimal.Parse(item.PriceB) > 0)
                    {
                        appChildItem.ItemPricesFkList.Add(new AppItemPrices
                        {
                            AppItemCode = appChildItem.Code,
                            Code = "B",
                            Price = decimal.Parse(item.PriceB),
                            CurrencyCode = string.IsNullOrEmpty(item.Currency) ? currencyCode : item.Currency,
                            TenantId = AbpSession.TenantId,
                            CurrencyId = !string.IsNullOrEmpty(item.Currency) ? itemCurrencyId : currencyIDDef,
                            IsDefault = true
                        });
                    }
                    if (string.IsNullOrEmpty(item.PriceC))
                        item.PriceC = "0";

                    if (!string.IsNullOrEmpty(item.PriceC))// && decimal.Parse(item.PriceC) > 0)
                    {
                        appChildItem.ItemPricesFkList.Add(new AppItemPrices
                        {
                            AppItemCode = appChildItem.Code,
                            Code = "C",
                            Price = decimal.Parse(item.PriceC),
                            CurrencyCode = string.IsNullOrEmpty(item.Currency) ? currencyCode : item.Currency,
                            TenantId = AbpSession.TenantId,
                            CurrencyId = !string.IsNullOrEmpty(item.Currency) ? itemCurrencyId : currencyIDDef,
                            IsDefault = true
                        });
                    }
                    if (string.IsNullOrEmpty(item.PriceD))
                        item.PriceD = "0";

                    if (!string.IsNullOrEmpty(item.PriceD))// && decimal.Parse(item.PriceD) > 0)
                    {
                        appChildItem.ItemPricesFkList.Add(new AppItemPrices
                        {
                            AppItemCode = appChildItem.Code,
                            Code = "D",
                            Price = decimal.Parse(item.PriceD),
                            CurrencyCode = string.IsNullOrEmpty(item.Currency) ? currencyCode : item.Currency,
                            TenantId = AbpSession.TenantId,
                            CurrencyId = !string.IsNullOrEmpty(item.Currency) ? itemCurrencyId : currencyIDDef,
                            IsDefault = true
                        });
                    }
                    //XX
                    appChildItem.TimeStamp = timeStamp;
                    appChildItem.EntityFk.TimeStamp = timeStamp;
                    appChildItem.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                    appChildItem.EntityFk.TenantOwner = appItem.TenantOwner;
                    if (appChildItem.Id == 0)
                        appChildItem.EntityFk.EntityExtraData = new List<AppEntityExtraData>();

                    var entityExtraData = new List<AppEntityExtraData>();
                    if (item.ExtraAttributesValues != null)
                    {
                        for (int etx = 0; etx < item.ExtraAttributesValues.Count; etx++)
                        {
                            if (!item.ExtraAttributes[etx].IsVariation) continue;

                            extraAttributesByName.TryGetValue(item.ExtraAttributes[etx].Name, out var AttributeInfoObj);
                            var colorLookupName = "";
                            if (item.ExtraAttributes[etx].AttributeId == 101 && !string.IsNullOrEmpty(item.ExtraAttributesValues[etx].Code)) //Color
                            {
                                colorLookupByCode.TryGetValue(item.ExtraAttributesValues[etx].Code, out colorLookupName);
                            }

                            AppEntityExtraData extra = new AppEntityExtraData
                            {
                                AttributeCode = item.ExtraAttributesValues[etx].Code,
                                AttributeValue = !string.IsNullOrEmpty(colorLookupName)? colorLookupName: item.ExtraAttributesValues[etx].Value,
                                AttributeValueId = null, // AttributeValueId,
                                EntityObjectTypeName = item.ExtraAttributes[etx].Name,
                                AttributeId = item.ExtraAttributes[etx].AttributeId,
                                EntityObjectTypeId = AttributeInfoObj != null ? AttributeInfoObj.Id : null,
                                EntityObjectTypeCode = AttributeInfoObj != null ? item.ExtraAttributes[etx].EntityObjectTypeCode : item.ExtraAttributes[etx].Name,
                                EntityCode = appChildItem.Code

                            };

                            var childEntityExtraData = appChildItem.EntityFk.EntityExtraData ??= new List<AppEntityExtraData>();
                            if (appChildItem.Id == 0)
                            {
                                childEntityExtraData.Add(extra);
                            }
                            else
                            {
                                var ext = childEntityExtraData.FirstOrDefault(x => x.AttributeId == item.ExtraAttributes[etx].AttributeId);
                                if (ext == null)
                                {
                                    childEntityExtraData.Add(extra);
                                }
                                else
                                {
                                    ext.AttributeCode = item.ExtraAttributesValues[etx].Code;
                                    ext.AttributeValue = item.ExtraAttributesValues[etx].Value;
                                    ext.AttributeValueId = null;
                                    ext.EntityObjectTypeName = item.ExtraAttributes[etx].Name;
                                    ext.EntityObjectTypeId = AttributeInfoObj != null ? AttributeInfoObj.Id : null;
                                    ext.EntityObjectTypeCode = item.ExtraAttributes[etx].EntityObjectTypeCode;
                                    ext.EntityCode = appChildItem.Code;
                                }
                            }
                            if (etx == 0)
                                firstAttributteValues.Add(item.ExtraAttributesValues[etx].Value);
                            if (string.IsNullOrEmpty(item.ImageType)) { item.ImageType = "Image"; }
                            if (etx == 0 && !string.IsNullOrEmpty(item.ImageType) && item.Images != null && item.Images.Count > 0)
                            {
                                attachmentsCategoriesByCode.TryGetValue(item.ImageType, out var attachCategory);
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

                                    EnsureAttachmentTenantDirectory();

                                    try
                                    {
                                        System.IO.File.Copy(path + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], attachmentTenantPath + @"\" + img.ImageGuid + "." + img.ImageFileName.Split('.')[1], true);
                                    }
                                    catch { }


                                    if (img.ImageFileName.ToLower().Contains("_default") || img.IsDefault)
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
                            secondAttributteValues.Add(new AppItemExtraDto()
                            {
                                ParentCode = extra.AttributeCode,
                                Id = item.ExtraAttributes[etx].AttributeId,
                                Value = item.ExtraAttributesValues[etx].Value
                            });
                        }
                    }
                    if (appChildItem.Id == 0)
                    {
                        appChildItem.CreatorUserId = AbpSession.UserId;
                        appChildItem.TenantId = AbpSession.TenantId;
                    }
                    appChildItem.Description = item.ProductDescription;

                    firstItem = true;


                    if (appChildItem.Id == 0)
                        appChildItem.ParentEntityFk = appItem.EntityFk;

                    restAttributteValues.Add(secondAttributteValues);

                    secondAttributteValues = new List<AppItemExtraDto>();
                    if (appChildItem.Id == 0)
                        appItem.ParentFkList.Add(appChildItem);

                }
                if (appItem.SycIdentifierId == null)
                    appItem.SycIdentifierId = defIdentfier;

                await SaveImportedItemLean(appItem);
            }

            await FlushLeanImportBatch();

            foreach (var importedParent in importedParentsWithVariations.Where(x => x.Id != 0))
            {
                await _backgroundJobManager.EnqueueAsync<GenerateVariationSsinsJob, GenerateVariationSsinsJobArgs>(
                    new GenerateVariationSsinsJobArgs
                    {
                        ParentItemId = importedParent.Id,
                        ObjectTypeId = itemObjectId,
                        TenantId = AbpSession.TenantId
                    });
            }

            #region send notification to current user
            if (AbpSession.UserId != null)
            {
                long AbpSessionUserId = (long)AbpSession.UserId;
                await SendItemImportCompletedNotification(excelResultsDTO.FilePath, AbpSession.TenantId, AbpSessionUserId);
            }

            #endregion send notification to current user
            return excelResultsDTO.ExcelLogDTO;
        }   //public async Task<ExcelResultsDTO> ValidateExcel(string guidFile, string[] imagesList)


        ////Mariam[End]
        public async Task<string> GenerateProductCode(int productId, bool lUpdateSeq, long? tenantId)
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
                                var identifierDefDet = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionByTypeForView(productType.SycEntityObjectType.Code);//(identifierDef.SycIdentifierDefinition.Code);
                                if (identifierDefDet != null)
                                {
                                    var productCodeSegment = identifierDefDet.SycSegmentIdentifierDefinitions.FirstOrDefault(z => z.SegmentNumber == 1);
                                    returnCode = await GetProductCode(productCodeSegment, lUpdateSeq, tenantId);
                                    entityIdentifierFound = true;
                                }
                            }
                        }
                    }
                    if (entityIdentifierFound == false)
                    {
                        var sydobject = _syObjectRepository.FirstOrDefault(x => x.Code == "ITEM");
                        if (sydobject != null)
                        {
                            var identifierId = sydobject.SycDefaultIdentifierId;
                            if (identifierId != null)
                            {
                                var identifierDef = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionForView(long.Parse(identifierId.ToString()));
                                if (identifierDef != null)
                                {
                                    var sycSegmentIdentifierDefinitions = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == identifierId).ToList();
                                    var sycSegmentIdentifierDefinitionList = ObjectMapper.Map<List<SycSegmentIdentifierDefinitionDto>>(sycSegmentIdentifierDefinitions);
                                    var productCodeSegment = sycSegmentIdentifierDefinitionList.FirstOrDefault(z => z.SegmentNumber == 1);
                                    returnCode = await GetProductCode(productCodeSegment, lUpdateSeq, tenantId);
                                    entityIdentifierFound = true;
                                }
                            }
                        }
                    }
                }
                return returnCode;
            }
        }
        public async Task<string> GetProductCode(SycSegmentIdentifierDefinitionDto segment, bool lUpdateSequence, long? tenantId)
        {
            if (tenantId == null)
                tenantId = AbpSession.TenantId;

            string returnString = "";
            if (segment.IsAutoGenerated & segment.SegmentType == "Sequence")
            {
                var sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == tenantId).FirstOrDefault();
                if (sycCounter == null)
                {
                    if (lUpdateSequence)
                    {
                        sycCounter = new SycCounter();
                        sycCounter.SycSegmentIdentifierDefinitionId = segment.Id;
                        sycCounter.Counter = segment.CodeStartingValue + 1;
                        if (AbpSession.TenantId != null)
                        {
                            sycCounter.TenantId = (int?)tenantId;
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
                                var identifierDefDet = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionByTypeForView(productType.SycEntityObjectType.Code);//(identifierDef.SycIdentifierDefinition.Code);
                                if (identifierDefDet != null)
                                {

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
                        var sydobject = _syObjectRepository.FirstOrDefault(x => x.Code == "ITEM");
                        if (sydobject != null)
                        {
                            var identifierId = sydobject.SycDefaultIdentifierId;
                            if (identifierId != null)
                            {
                                var identifierDef = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionForView(long.Parse(identifierId.ToString()));
                                if (identifierDef != null)
                                {
                                    {
                                        var serializer = new XmlSerializer(typeof(ItemExtraAttributes));
                                        ItemExtraAttributes extraAttributes = null;
                                        using (TextReader reader = new StringReader(productType.SycEntityObjectType.ExtraAttributes))
                                        {
                                            extraAttributes = (ItemExtraAttributes)serializer.Deserialize(reader);
                                        }
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
        public async Task<IList<VariationItemDto>> GetVariationsCodes(long identifierId, string productCode, IList<VariationItemDto> variationsList, long productTypeId, long? tenantId)
        {
            string productCodeMask = "";
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var productCodeSegment = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == identifierId).OrderBy(z => z.SegmentNumber).ToList();
                List<CurrencyInfoDto> currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();
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
                                productCodeMask = _helper.StringMask(sycSegmentIdentifierDefinitionList[attr].SegmentMask, productCode);
                                continue;
                            }
                        }
                        segments.Add(sycSegmentIdentifierDefinitionList[attr].Code, sycSegmentIdentifierDefinitionList[attr].SegmentMask);
                    }
                }

                // --- PERFORMANCE OPTIMIZATION ---
                var entityObjectTypeCodeCache = new Dictionary<long, string>();
                var extraAttributeDataCache = new Dictionary<string, IList<AppEntityExtraDataDto>>();
                ItemExtraAttributes productExtraAttributes = null;

                var productEntityObjectType = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(int.Parse(productTypeId.ToString()));
                if (productEntityObjectType != null && !string.IsNullOrEmpty(productEntityObjectType.SycEntityObjectType.ExtraAttributes))
                {
                    var serializer = new XmlSerializer(typeof(ItemExtraAttributes));
                    using (TextReader reader = new StringReader(productEntityObjectType.SycEntityObjectType.ExtraAttributes))
                    {
                        productExtraAttributes = (ItemExtraAttributes)serializer.Deserialize(reader);
                    }
                }

                foreach (var variation in variationsList)
                {
                    //xx
                    if (variation.Id != 0 && !string.IsNullOrEmpty(variation.Code))
                        continue;
                    List<AppEntityExtraDataDto> extrData = new List<AppEntityExtraDataDto>();
                    extrData.AddRange(variation.EntityExtraData);
                    foreach (var attr in variation.EntityExtraData)
                    {
                        if (attr.EntityObjectTypeId != null && attr.EntityObjectTypeCode == null)
                        {
                            long typeId = attr.EntityObjectTypeId.Value;
                            if (!entityObjectTypeCodeCache.ContainsKey(typeId))
                            {
                                var attrObjEnt = await _sycEntityObjectTypeRepository.GetAll().Where(z => z.Id == typeId).FirstOrDefaultAsync();
                                entityObjectTypeCodeCache[typeId] = attrObjEnt?.Code;
                            }
                            attr.EntityObjectTypeCode = entityObjectTypeCodeCache[typeId];
                        }

                        if (attr.AttributeCode != null && attr.EntityObjectTypeId != null && attr.EntityObjectTypeId != 0)
                        {
                            string cacheKey = $"{attr.AttributeCode}_{attr.EntityObjectTypeId}";
                            if (!extraAttributeDataCache.ContainsKey(cacheKey))
                            {
                                var attRelated = await GetExtraAttributeData(attr.AttributeCode.ToString(), long.Parse(attr.EntityObjectTypeId.ToString()), tenantId, int.Parse(productTypeId.ToString()));
                                extraAttributeDataCache[cacheKey] = attRelated;
                            }

                            var cachedRelated = extraAttributeDataCache[cacheKey];
                            if (cachedRelated != null && cachedRelated.Count > 0)
                            {
                                extrData.AddRange(cachedRelated);
                            }
                            {
                                if (productExtraAttributes != null && productExtraAttributes.ExtraAttributes.Count > 0 && !string.IsNullOrEmpty(attr.EntityObjectTypeCode))
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
                        else
                        {
                            if (productExtraAttributes != null && productExtraAttributes.ExtraAttributes.Count > 0 && !string.IsNullOrEmpty(attr.EntityObjectTypeCode))
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
                    variation.EntityExtraData = extrData;
                    //xx
                    variation.Code = productCodeMask;
                    foreach (var seg in segments)
                    {
                        string field = seg.Key;
                        var regFld = variation.GetType().GetProperty(field);
                        if (regFld != null)
                        {
                            var valFld = regFld.GetValue(variation)?.ToString();
                            if (valFld != null)
                            {
                                variation.Code += _helper.StringMask(seg.Value, valFld);
                            }
                        }
                        else
                        {
                            var ExtraFld = variation.EntityExtraData.FirstOrDefault(a => a.EntityObjectTypeCode == field);
                            if (ExtraFld != null)
                            {
                                var valFld = ExtraFld.AttributeCode?.ToString();
                                if (valFld != null)
                                {
                                    variation.Code += _helper.StringMask(seg.Value, valFld);
                                }
                            }
                        }
                    }
                }
            }

            return variationsList;
        }

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
        public async Task<string> EmptySSIN()
        {
            var itemsList = _appItemRepository.GetAll().Where(e => (e.TenantId == AbpSession.TenantId) && (e.IsDeleted == false)).ToListAsync().Result;

            itemsList.ForEach(e => e.SSIN = "");
            return "No of SSIN items Cleared - " + itemsList.Count.ToString();
        }

        public async Task<string> UpdateDouplicatedSSIN(int takeNo = 1, int skipNo = 0)
        {
            //reset syccounters
            //reset SSIN
            string ret = "";
            var itemsList = _appItemRepository.GetAll().Where(e => (e.TenantId == AbpSession.TenantId) && (e.IsDeleted == false)
                                                                     && (string.IsNullOrEmpty(e.SSIN))).Skip(skipNo).Take(takeNo).ToListAsync().Result;

            var itemsWithSSINList = _appItemRepository.GetAll().Where(e => (e.TenantId == AbpSession.TenantId) && (e.IsDeleted == false)
                                                                     && (!string.IsNullOrEmpty(e.SSIN))).ToListAsync().Result;

            int ssin = 1;
            if (itemsWithSSINList != null && itemsWithSSINList.Count > 0)
            {
                string ssinString = itemsWithSSINList.Select(e => e.SSIN).Max();
                if (!string.IsNullOrEmpty(ssinString))
                {
                    ssinString = ssinString.Substring(9);
                    ssin = int.Parse(ssinString);
                }
            }
            string tenantstring = AbpSession.TenantId.ToString().PadLeft(8, '0');

            //Update items SSIN WITH NEW SSIN

            if (itemsList != null)
            {
                var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                foreach (var item in itemsList)
                {
                    try
                    {
                        ssin = ssin + 1;

                        item.SSIN = tenantstring + "-" + ssin.ToString().PadLeft(12, '0');                                                                                                                  //item.SSIN = await _helper.SystemTables.GenerateSSIN(itemObjectId); //get ssing fun by Mariam
                        ret = item.SSIN;
                        var appentity = _appEntityRepository.GetAll().Where(e => e.Id == item.EntityId).FirstOrDefaultAsync().Result;
                        if (appentity != null)
                        {
                            appentity.SSIN = item.SSIN;
                        }

                        // #1
                        var _appTransactionDetailsList = _appTransactionDetails.GetAll()
                            .Where(e => e.ManufacturerCode == appentity.Code && e.TenantId == AbpSession.TenantId
                                            && (e.IsDeleted == false)).ToListAsync().Result;
                        if (_appTransactionDetailsList != null)
                        {
                            _appTransactionDetailsList.ForEach(e => { e.ItemSSIN = item.SSIN; e.SSIN = item.SSIN; });
                        }

                        // #2
                        var _appItemsListDetailRepositoryList = _appItemsListDetailRepository.GetAll()
                            .Where(e => e.ItemCode == appentity.Code && e.ItemId == item.Id
                            ).ToListAsync().Result;
                        if (_appItemsListDetailRepositoryList != null)
                        { _appItemsListDetailRepositoryList.ForEach(e => e.ItemSSIN = item.SSIN); }


                        //#3
                        var _appMarketplaceItemsList = _appMarketplaceItem.GetAll()
                             .Where(e => e.ManufacturerCode == appentity.Code && e.TenantOwner == AbpSession.TenantId
                             && (e.IsDeleted == false)).ToListAsync().Result;
                        if (_appMarketplaceItemsList != null)
                        { _appMarketplaceItemsList.ForEach(e => { e.SSIN = item.SSIN; e.Code = item.SSIN; }); }

                        var _appMarketplaceItemsListDetailsList = _appMarketplaceItemsListDetails.GetAll()
                            .Where(e => e.ItemCode == appentity.Code && e.AppMarketplaceItemId == item.Id).ToListAsync().Result;
                        if (_appMarketplaceItemsListDetailsList != null)
                        { _appMarketplaceItemsListDetailsList.ForEach(e => e.AppMarketplaceItemSSIN = item.SSIN); }

                    }
                    catch (Exception ex) { ret = ret + " --- " + ex.Message; }


                }
            }
            //UPDATE PRODUCT LIST DETAILS WITH SSIN
            //UPDATE TRANSACTION DETAILS WITH SSIN
            // CHECK IF STILL MORE DOUPICATIONS
            return ret;

        }
    }
    public sealed class AppItemExcelDtoProfile : Profile
    {

        public AppItemExcelDtoProfile(List<ExtraAttribute> extraAttributes)
        {
            IMappingExpression<DataRow, AppItemExcelDto> mappingExpression;

            mappingExpression = CreateMap<DataRow, AppItemExcelDto>();
            mappingExpression.ForMember(dest => dest.Id, act => act.MapFrom(src => 0));
            mappingExpression.ForMember(dest => dest.ProductType, act => act.MapFrom(src => src["ProductType"].ToString()));
            mappingExpression.ForMember(dest => dest.RecordType, act => act.MapFrom(src => src["RecordType"].ToString()));

            mappingExpression.ForMember(dest => dest.ColorCode, act => act.MapFrom(src => src["COLORCode"].ToString()));
            mappingExpression.ForMember(dest => dest.ColorName, act => act.MapFrom(src => src["COLORName"].ToString()));

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
            mappingExpression.ForMember(dest => dest.SizeRatioName, act => act.MapFrom(src => src["SizeRatioName"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeRatioValue, act => act.MapFrom(src => src["SizeRatioValue"].ToString()));
            mappingExpression.ForMember(dest => dest.ExtraAttributes, opt => opt.MapFrom<List<ExtraAttribute>>(src => extraAttributes));

            mappingExpression.ForMember(dest => dest.ParentId, act => act.MapFrom(src => 0));
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
            mappingExpression.ForMember(dest => dest.PriceA, act => act.MapFrom(src => src["PriceA"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceB, act => act.MapFrom(src => src["PriceB"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceC, act => act.MapFrom(src => src["PriceC"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceD, act => act.MapFrom(src => src["PriceD"].ToString().TrimEnd()));


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

    public sealed class AppItemExcelImpDtoProfile : Profile
    {

        public AppItemExcelImpDtoProfile(List<ExtraAttribute> extraAttributes)
        {
            IMappingExpression<ImportItemInputDto, AppItemExcelDto> mappingExpression;

            mappingExpression = CreateMap<ImportItemInputDto, AppItemExcelDto>();
            mappingExpression.ForMember(dest => dest.Id, act => act.MapFrom(src => 0));
            mappingExpression.ForMember(dest => dest.ProductType, act => act.MapFrom(src => src.ProductType.ToString()));
            mappingExpression.ForMember(dest => dest.RecordType, act => act.MapFrom(src => src.RecordType.ToString()));
            mappingExpression.ForMember(dest => dest.ParentCode, act => act.MapFrom(src => src.ParentCode.ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.ParentId, act => act.MapFrom(src => 0));
            mappingExpression.ForMember(dest => dest.Code, act => act.MapFrom(src => src.Code.ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.Name, act => act.MapFrom(src => src.Name.ToString()));
            mappingExpression.ForMember(dest => dest.ProductDescription, act => act.MapFrom(src => src.ProductDescription.ToString()));
            mappingExpression.ForMember(dest => dest.ProductClassificationCode, act => act.MapFrom(src => src.ProductClassificationCode.ToString()));
            mappingExpression.ForMember(dest => dest.ProductClassificationDescription, act => act.MapFrom(src => src.ProductClassificationDescription.ToString()));
            mappingExpression.ForMember(dest => dest.ProductCategoryCode, act => act.MapFrom(src => src.ProductCategoryCode.ToString()));
            mappingExpression.ForMember(dest => dest.ProductCategoryDescription, act => act.MapFrom(src => src.ProductCategoryDescription.ToString()));
            mappingExpression.ForMember(dest => dest.Price, act => act.MapFrom(src => src.Price.ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.Currency, act => act.MapFrom(src => src.PriceCurrencyCode.ToString()));
            mappingExpression.ForMember(dest => dest.ImageType, act => act.MapFrom(src => src.ImageType.ToString()));
            mappingExpression.ForMember(dest => dest.SizeScaleName, act => act.MapFrom(src => src.SizeScaleName.ToString()));
            mappingExpression.ForMember(dest => dest.SizeRatioName, act => act.MapFrom(src => src.SizeRatioName.ToString()));
            mappingExpression.ForMember(dest => dest.SizeRatioValue, act => act.MapFrom(src => src.SizeRatioValue.ToString()));
            mappingExpression.ForMember(dest => dest.ExtraAttributes, opt => opt.MapFrom<List<ExtraAttribute>>(src => extraAttributes));

            mappingExpression.ForMember(dest => dest.ParentId, act => act.MapFrom(src => 0));
            mappingExpression.ForMember(dest => dest.ExtraAttributesValues, opt => opt.MapFrom(new BmiValueImportResolver()));
            mappingExpression.ForMember(dest => dest.NoOfDim, act => act.MapFrom(src => src.NoOfDimensions.ToString()));
            mappingExpression.ForMember(dest => dest.D1Name, act => act.MapFrom(src => src.Dimension1Name.ToString()));
            mappingExpression.ForMember(dest => dest.D2Name, act => act.MapFrom(src => src.Dimension2Name.ToString()));
            mappingExpression.ForMember(dest => dest.D3Name, act => act.MapFrom(src => src.Dimension3Name.ToString()));
            mappingExpression.ForMember(dest => dest.D1Sizes, act => act.MapFrom(src => src.Dimension1Sizes.ToString()));
            mappingExpression.ForMember(dest => dest.D2Sizes, act => act.MapFrom(src => src.Dimension2Sizes.ToString()));
            mappingExpression.ForMember(dest => dest.D3Sizes, act => act.MapFrom(src => src.Dimension3Sizes.ToString()));
            mappingExpression.ForMember(dest => dest.D1Pos, act => act.MapFrom(src => src.Dimension1Position.ToString()));
            mappingExpression.ForMember(dest => dest.D2Pos, act => act.MapFrom(src => src.Dimension2Position.ToString()));
            mappingExpression.ForMember(dest => dest.D3Pos, act => act.MapFrom(src => src.Dimension3Position.ToString()));
            mappingExpression.ForMember(dest => dest.SizeCode, act => act.MapFrom(src => src.SizeCode.ToString()));
            mappingExpression.ForMember(dest => dest.PriceA, act => act.MapFrom(src => src.PriceA.ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceB, act => act.MapFrom(src => src.PriceB.ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceC, act => act.MapFrom(src => src.PriceC.ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceD, act => act.MapFrom(src => src.PriceD.ToString().TrimEnd()));


        }

    }
    public class BmiValueImportResolver : IValueResolver<ImportItemInputDto, AppItemExcelDto, List<AppItemImpExtrAttributes>>
    {
        public List<AppItemImpExtrAttributes> Resolve(ImportItemInputDto source, AppItemExcelDto destination,
            List<AppItemImpExtrAttributes> destMember, ResolutionContext context)
        {
            List<AppItemImpExtrAttributes> returnList = new List<AppItemImpExtrAttributes>();
            if (destination.ExtraAttributes != null && destination.ExtraAttributes.Count > 0)
            {


                if (destination.ExtraAttributes[0] != null)
                {

                    foreach (var extra in destination.ExtraAttributes)
                    {

                        if (extra != null)
                        {
                            returnList.Add(new AppItemImpExtrAttributes
                            {
                                Name = extra.Name.ToString(),

                                Code = extra.IsLookup ?
                                (source.GetType().GetProperty(extra.Name.Replace(" ", "") + "Code",
                                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(source)) != null ?
                                source.GetType().GetProperty(extra.Name.Replace(" ", "") + "Code", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(source).ToString() : ""
                                : (source.GetType().GetProperty(extra.Name.Replace(" ", ""), BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance) != null &&
                                source.GetType().GetProperty(extra.Name.Replace(" ", ""), BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(source) != null
                                ? source.GetType().GetProperty(extra.Name.Replace(" ", ""), BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(source).ToString() : ""),
                                Value = extra.IsLookup ? (source.GetType().GetProperty(extra.Name.Replace(" ", "") + "Name", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(source) != null ?
                                source.GetType().GetProperty(extra.Name.Replace(" ", "") + "Name", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(source).ToString() : ""
                                ) : (source.GetType().GetProperty(extra.Name.Replace(" ", ""), BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance) != null &&
                                source.GetType().GetProperty(extra.Name.Replace(" ", ""), BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(source) != null ? source.GetType().GetProperty(extra.Name.Replace(" ", ""), BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(source).ToString() : "")
                            });

                        }
                    }

                }

            }
            return returnList;
        }
    }
    public sealed class AppItemExcelImportDtoProfile : Profile
    {

        public AppItemExcelImportDtoProfile(List<ExtraAttribute> extraAttributes)
        {
            IMappingExpression<DataRow, ImportItemInputDto> mappingExpression;

            mappingExpression = CreateMap<DataRow, ImportItemInputDto>();
            mappingExpression.ForMember(dest => dest.ProductType, act => act.MapFrom(src => src["ProductType"].ToString()));
            mappingExpression.ForMember(dest => dest.RecordType, act => act.MapFrom(src => src["RecordType"].ToString()));
            mappingExpression.ForMember(dest => dest.ParentCode, act => act.MapFrom(src => src["ParentCode"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.Code, act => act.MapFrom(src => src["Code"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.Name, act => act.MapFrom(src => src["Name"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductDescription, act => act.MapFrom(src => src["ProductDescription"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductClassificationCode, act => act.MapFrom(src => src["ProductClassificationCode"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductClassificationDescription, act => act.MapFrom(src => src["ProductClassificationDescription"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductCategoryCode, act => act.MapFrom(src => src["ProductCategoryCode"].ToString()));
            mappingExpression.ForMember(dest => dest.ProductCategoryDescription, act => act.MapFrom(src => src["ProductCategoryDescription"].ToString()));
            mappingExpression.ForMember(dest => dest.Price, act => act.MapFrom(src => src["Price"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceCurrencyCode, act => act.MapFrom(src => src["PriceCurrencyCode"].ToString()));
            mappingExpression.ForMember(dest => dest.ImageType, act => act.MapFrom(src => src["ImageType"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeScaleName, act => act.MapFrom(src => src["SizeScaleName"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeRatioName, act => act.MapFrom(src => src["SizeRatioName"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeRatioValue, act => act.MapFrom(src => src["SizeRatioValue"].ToString()));

            mappingExpression.ForMember(dest => dest.NoOfDimensions, act => act.MapFrom(src => src["NoOfDimensions"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension1Name, act => act.MapFrom(src => src["Dimension1Name"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension2Name, act => act.MapFrom(src => src["Dimension2Name"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension3Name, act => act.MapFrom(src => src["Dimension3Name"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension1Sizes, act => act.MapFrom(src => src["Dimension1Sizes"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension2Sizes, act => act.MapFrom(src => src["Dimension2Sizes"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension3Sizes, act => act.MapFrom(src => src["Dimension3Sizes"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension1Position, act => act.MapFrom(src => src["Dimension1Position"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension2Position, act => act.MapFrom(src => src["Dimension2Position"].ToString()));
            mappingExpression.ForMember(dest => dest.Dimension3Position, act => act.MapFrom(src => src["Dimension3Position"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeCode, act => act.MapFrom(src => src["SIZEcode"].ToString()));
            mappingExpression.ForMember(dest => dest.SizeName, act => act.MapFrom(src => src["SizeName"].ToString()));
            mappingExpression.ForMember(dest => dest.ColorCode, act => act.MapFrom(src => src["ColorCode"].ToString()));
            mappingExpression.ForMember(dest => dest.ColorName, act => act.MapFrom(src => src["ColorName"].ToString()));
            //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
            mappingExpression.ForMember(dest => dest.PriceA, act => act.MapFrom(src => src["PriceA"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceB, act => act.MapFrom(src => src["PriceB"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceC, act => act.MapFrom(src => src["PriceC"].ToString().TrimEnd()));
            mappingExpression.ForMember(dest => dest.PriceD, act => act.MapFrom(src => src["PriceD"].ToString().TrimEnd()));


        }

    }
    public class ItemValidator : AbstractValidator<CreateOrEditAppItemDto>
    {
        public ItemValidator(onetouchDbContext x)
        {
            RuleFor(x => x.Code).NotEmpty().WithMessage("Item code cannot be empty");
            RuleFor(x => x.Code).Length(10, 50).WithMessage("Item code length cannot be less than 10 chars");
            RuleFor(x => x.Name).NotEmpty().WithMessage("Item Name cannot be empty");
            RuleFor(x => x.Description).NotEmpty().WithMessage("Item Descripion cannot be empty");
            RuleFor(x => x.EntityAttachments).NotNull().Must(x => x.Count > 0).WithMessage("Item must have an image");
            RuleFor(x => x.Code).Custom((z, context) => {
                if (x.AppItems.FirstOrDefault(x => x.Code.Replace(" ", string.Empty) == z.Replace(" ", string.Empty) && x.ItemType == 0) != null)
                {
                    context.AddFailure("The code:" + z + "is already existing.");
                }
            });

        }
    }


}




