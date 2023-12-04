using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppItemsLists.Exporting;
using onetouch.AppItemsLists.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;
using onetouch.Helpers;
using onetouch.AppEntities.Dtos;
using onetouch.AppEntities;
using onetouch.AppItems;
using onetouch.AppItems.Dtos;
using Abp.Domain.Uow;
using onetouch.Authorization.Users.Profile;
using Newtonsoft.Json;
using onetouch.SystemObjects;
using onetouch.AppItemSelectors;
using onetouch.EntityFrameworkCore;
using Abp.EntityFrameworkCore.Uow;
using onetouch.SystemObjects.Dtos;
using onetouch.AppMarketplaceItemLists;
using onetouch.AppMarketplaceItems;
using Abp.AspNetZeroCore.Timing;

namespace onetouch.AppItemsLists
{
    [AbpAuthorize(AppPermissions.Pages_AppItemsLists)]
    public class AppItemsListsAppService : onetouchAppServiceBase, IAppItemsListsAppService
    {
        //MMT33-2
        private readonly IRepository<AppMarketplaceItemLists.AppMarketplaceItemLists, long> _appMarketplaceItemListRepository;
        private readonly IRepository<AppMarketplaceItemsListDetails, long> _appMarketplaceItemsListDetailRepository;
        private readonly IRepository<AppMarketplaceItemSharings, long> _appMarketplaceItemSharing;
        private readonly IRepository<AppMarketplaceItems.AppMarketplaceItems, long> _appMarketplaceItem;
        //MMT33-2
        private readonly IRepository<AppItemsList, long> _appItemsListRepository;
        private readonly IRepository<AppItemsListDetail, long> _appItemsListDetailRepository;
        private readonly IRepository<AppItemSelector, long> _appItemSelectorRepository;
        private readonly ISycEntityObjectStatusesAppService _sycEntityObjectStatusesAppService;

        private readonly IAppItemsListsExcelExporter _appItemsListsExcelExporter;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IRepository<AppItem, long> _appItemRepository;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppEntitiesRelationship, long> _appEntitiesRelationshipRepository;
        private readonly IRepository<AppItemSharing, long> _appItemSharingRepository;

        private readonly Helper _helper;
        private readonly IProfileAppService _iProfileAppService;

        public AppItemsListsAppService(IRepository<AppItemsList, long> appItemsListRepository, IAppItemsListsExcelExporter appItemsListsExcelExporter, Helper helper
            , IAppEntitiesAppService appEntitiesAppService
            , IRepository<AppItem, long> appItemRepository
            , IRepository<AppEntity, long> appEntityRepository
            , IRepository<AppItemsListDetail, long> appItemsListDetailRepository
            , IRepository<AppItemSharing, long> appItemSharingRepository
            , IRepository<AppEntitiesRelationship, long> appEntitiesRelationshipRepository
            , IProfileAppService iProfileAppService
            , ISycEntityObjectStatusesAppService sycEntityObjectStatusesAppService
            ,IRepository<AppItemSelector, long> appItemSelectorRepository, IRepository<AppMarketplaceItemLists.AppMarketplaceItemLists, long> appMarketplaceItemListRepository,
             IRepository<AppMarketplaceItemsListDetails, long> appMarketplaceItemsListDetailRepository, 
             IRepository<AppMarketplaceItemSharings, long> appMarketplaceItemSharing, IRepository<AppMarketplaceItems.AppMarketplaceItems, long> appMarketplaceItem)
        {
            //MMT33-2
            _appMarketplaceItem = appMarketplaceItem;
            _appMarketplaceItemListRepository = appMarketplaceItemListRepository;
            _appMarketplaceItemsListDetailRepository = appMarketplaceItemsListDetailRepository;
            _appMarketplaceItemSharing = appMarketplaceItemSharing;
            //MMT33-2
            _appItemsListRepository = appItemsListRepository;
            _appItemsListsExcelExporter = appItemsListsExcelExporter;
            _helper = helper;
            _appEntitiesAppService = appEntitiesAppService;
            _appEntityRepository = appEntityRepository;
            _appItemRepository = appItemRepository;
            _appItemsListDetailRepository = appItemsListDetailRepository;
            _appItemSharingRepository = appItemSharingRepository;
            _appEntitiesRelationshipRepository = appEntitiesRelationshipRepository;
            _iProfileAppService = iProfileAppService;
            _sycEntityObjectStatusesAppService = sycEntityObjectStatusesAppService;
            _appItemSelectorRepository = appItemSelectorRepository;
        }

        public async Task<PagedResultDto<GetAppItemsListForViewDto>> GetAll(GetAllAppItemsListsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                //var filteredAppItemsLists = _appItemsListRepository.GetAll()
                //    .Include(x => x.ItemSharingFkList)
                //        .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                //        //.Where(x=>x.EntityFk.EntitiesRelationships.Count()==0)
                //        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
                //        .WhereIf(input.FilterType == ItemsListFilterTypesEnum.MyItemsList, e => e.TenantId == AbpSession.TenantId && e.SharingLevel == 0)
                //        .WhereIf(input.FilterType == ItemsListFilterTypesEnum.Public, e => e.TenantId != AbpSession.TenantId && e.SharingLevel == 1)
                //        .WhereIf(input.FilterType == ItemsListFilterTypesEnum.SharedWithMe, e => e.TenantId != AbpSession.TenantId && e.SharingLevel == 2
                //                    && _appItemSharingRepository.GetAll().Count(c => c.ItemListId ==e.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId && (c.SharedTenantId == AbpSession.TenantId || c.SharedUserId == AbpSession.UserId)) > 0);//.PageBy(input);


                var filteredAppItemsLists = (from il in _appItemsListRepository.GetAll()
                                             join etyr1 in _appEntityRepository.GetAll() on il.EntityId equals etyr1.Id into r10
                                             from etyrr1 in r10.DefaultIfEmpty()
                                             join er1 in _appEntitiesRelationshipRepository.GetAll() on il.EntityId equals er1.EntityId into r1
                                             from rr1 in r1.DefaultIfEmpty()
                                                 //join ilp in _appItemsListRepository.GetAll().Include(x=>x.ItemSharingFkList) on er.EntityId equals ilp.EntityId
                                             join er2 in _appEntitiesRelationshipRepository.GetAll() on il.EntityId equals er2.RelatedEntityId into r2
                                             from rr2 in r2.DefaultIfEmpty()
                                             join ilp in _appItemsListRepository.GetAll().Include(x => x.ItemSharingFkList).Include(x => x.AppItemsListDetails).ThenInclude(x => x.ItemFK) on rr2.EntityId equals ilp.EntityId into i
                                             from ilpp in i.DefaultIfEmpty()
                                             where (
                                             (string.IsNullOrWhiteSpace(input.Filter) || il.Code.Contains(input.Filter) || il.Name.Contains(input.Filter))
                                             && (
                                                (input.FilterType == ItemsListFilterTypesEnum.MyItemsList && il.TenantId == AbpSession.TenantId && il.SharingLevel == 0)
                                                || (input.FilterType == ItemsListFilterTypesEnum.Public && il.SharingLevel == 1)
                                                || (input.FilterType == ItemsListFilterTypesEnum.SharedWithMe && il.TenantId != AbpSession.TenantId && il.SharingLevel == 2
                                                      && ilpp.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0)
                                            ))
                                             select new
                                             {
                                                 //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                                                 il.SSIN,
                                                 //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                                                 il.Code,
                                                 il.Name,
                                                 il.SharingLevel,
                                                 Id = il.Id,
                                                 EntityId = il.EntityId,
                                                 Description = il.Description,
                                                 CreationTime = il.CreationTime,
                                                 Published = rr1 != null,
                                                 CreatorUserId = il.CreatorUserId,
                                                 ItemsCount = il.AppItemsListDetails.Count(x => x.ItemFK.ParentId == null),
                                                 TenantId = il.TenantId,
                                                 StatusCode = etyrr1.EntityObjectStatusCode,
                                                 StatusId = etyrr1.EntityObjectStatusId
                                             }); ;

                var totalCount = await filteredAppItemsLists.CountAsync();
                if (input.NoLimit == true) input.MaxResultCount = totalCount;
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                //var pagedAndFilteredAppItemsLists = filteredAppItemsLists
                //    .OrderBy(input.Sorting ?? "id asc")
                //    .PageBy(input);
                var pagedAndFilteredAppItemsLists = filteredAppItemsLists
                    .OrderBy(input.Sorting ?? "id asc");
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                //var imageQuery = _appItemsListRepository.GetAll().Include(x=>x.AppItemsListDetails).ThenInclude(x => x.ItemFK).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk);

                var appItemsLists = from o in pagedAndFilteredAppItemsLists
                                        //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                                        join m in _appMarketplaceItemListRepository.GetAll().Where(a=> a.TenantOwner== AbpSession.TenantId)
                                        on o.SSIN equals m.Code into j1
                                    from j2 in j1.DefaultIfEmpty()
                                        //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                                    select new GetAppItemsListForViewDto()
                                    {
                                        AppItemsList = new AppItemsListDto
                                        {

                                            Code = o.Code,
                                            Name = o.Name,
                                            //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                                            //SharingLevel = o.SharingLevel,
                                            SharingLevel = j2 !=null ? j2.SharingLevel:null,
                                            //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                                            Id = o.Id,
                                            Description = o.Description,
                                            Published = o.Published,
                                            CreationTime = o.CreationTime,
                                            CreatorUserName = UserManager.Users.FirstOrDefault(x => x.Id == o.CreatorUserId).FullName,
                                            ItemsCount = o.ItemsCount,
                                            TenantId = o.TenantId,
                                            StatusCode = o.StatusCode,
                                            StatusId = o.StatusId
                                            //ImgURL = (imageQuery.FirstOrDefault(x => x.Id == o.Id).AppItemsListDetails!=null
                                            //                && imageQuery.FirstOrDefault(x => x.Id == o.Id).AppItemsListDetails.FirstOrDefault().ItemFK.EntityFk.EntityAttachments!=null)
                                            //     ?
                                            //      "attachments/" + AbpSession.TenantId + "/" + imageQuery.FirstOrDefault(x => x.Id == o.Id).AppItemsListDetails.FirstOrDefault().ItemFK.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment
                                            //      : "",
                                        }
                                    };

                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                var appItemsPage = appItemsLists.PageBy(input);
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                var imageQuery = _appItemsListDetailRepository.GetAll().Include(x => x.ItemFK).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk);
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
                //var appItemsListsWithImages = await appItemsLists.ToListAsync();
                var appItemsListsWithImages = await appItemsPage.ToListAsync();
                //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
                foreach (var item in appItemsListsWithImages)
                {

                    item.AppItemsList.ImgURL = imageQuery.FirstOrDefault(x => x.ItemsListId == item.AppItemsList.Id && x.ItemFK.EntityFk.EntityAttachments.Count > 0) != null
                                                 ? "attachments/" + item.AppItemsList.TenantId + "/" + imageQuery.FirstOrDefault(x => x.ItemsListId == item.AppItemsList.Id && x.ItemFK.EntityFk.EntityAttachments.Count > 0).ItemFK.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment
                                                  : "";
                }

                return new PagedResultDto<GetAppItemsListForViewDto>(
                    totalCount,
                    appItemsListsWithImages
                );
            }
        }

        public async Task<List<AppItemsListItemVariationDto>> GetItemsListVariations(long ItemId, long ItemsListId)
        {
            var selectedVariations = await _appItemsListDetailRepository.GetAll()
                            .Include(x => x.ItemFK).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments)
                            .Include(x => x.ItemFK).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                            .Include(x => x.ItemFK).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                            .Where(x => x.ItemsListId == ItemsListId && x.ItemFK.ParentId == ItemId).ToListAsync();
            var appItemsListItemVariations = new List<AppItemsListItemVariationDto>();
            foreach (var itemVariation in selectedVariations)
            {
                var listItemVariationDto = ObjectMapper.Map<AppItemsListItemVariationDto>(itemVariation);

                listItemVariationDto.Variation = ObjectMapper.Map<AppItemVariationDto>(itemVariation.ItemFK);
                appItemsListItemVariations.Add(listItemVariationDto);
            }
            return appItemsListItemVariations;

        }

        public async Task<long> GetItemsListDetailId(long ItemId, long ItemsListId)
        {
            var items = await _appItemsListDetailRepository.GetAll()
                        .FirstOrDefaultAsync(x => x.ItemId == ItemId && x.ItemsListId == ItemsListId);

            return items == null ? 0 : items.Id;

        }

        public async Task<PagedResultDto<CreateOrEditAppItemsListItemDto>> GetDetails(GetDetailsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var itemslistItemsIDsAndState = _appItemsListDetailRepository.GetAll().Where(x => x.ItemsListId == input.ItemListId).Select(x => new { x.ItemId, x.State }).ToArray();

                var filteredAppItemsListItems = _appItemsListDetailRepository.GetAll()
                            .Include(x => x.ItemFK).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments)
                            .Include(x => x.ItemFK).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                            .Include(x => x.ItemFK).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                            .WhereIf(input.ItemId > 0, x => x.ItemId == input.ItemId)
                            .Where(x => x.ItemsListId == input.ItemListId && x.ItemFK.ParentId == null)
                            ;

                var pagedAndFilteredAppItemsListItems = filteredAppItemsListItems
                    .OrderBy(input.Sorting ?? "id asc")
                    .PageBy(input);

                var appItemsLists = ObjectMapper.Map<IReadOnlyList<CreateOrEditAppItemsListItemDto>>(pagedAndFilteredAppItemsListItems);

                var imageQuery = _appItemsListDetailRepository.GetAll().Include(x => x.ItemFK).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk);
                foreach (var item in appItemsLists)
                {
                    item.AppItemsListItemVariations = await GetItemsListVariations(item.ItemId, item.ItemsListId);
                    item.ImageURL = imageQuery.FirstOrDefault(x => x.Id == item.Id && x.ItemFK.EntityFk.EntityAttachments.Count > 0) != null
                                                ? "attachments/" + item.ImageURL + "/" + imageQuery.FirstOrDefault(x => x.Id == item.Id && x.ItemFK.EntityFk.EntityAttachments.Count > 0).ItemFK.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment
                                                    : "";
                }

                var totalCount = await filteredAppItemsListItems.CountAsync();

                return new PagedResultDto<CreateOrEditAppItemsListItemDto>(
                    totalCount,
                    appItemsLists
                );
            }
        }

        public async Task<List<CreateOrEditAppItemsListItemDto>> GetSelectedVariations(long ItemListId, long ItemId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var filteredAppItemsListItems = await _appItemsListDetailRepository.GetAll()
                            .Include(x => x.ItemFK).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments)
                            .Include(x => x.ItemFK).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.AttributeValueFk)
                            .Include(x => x.ItemFK).ThenInclude(x => x.ParentFkList).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityExtraData).ThenInclude(x => x.EntityObjectTypeFk)
                            .Where(x => x.ItemsListId == ItemListId && x.ItemFK.ParentId == ItemId).ToListAsync()
                            ;

                var appItemsLists = ObjectMapper.Map<IReadOnlyList<CreateOrEditAppItemsListItemDto>>(filteredAppItemsListItems);

                var imageQuery = _appItemsListDetailRepository.GetAll().Include(x => x.ItemFK).ThenInclude(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk);
                foreach (var item in appItemsLists)
                {
                    //item.VariationsCount = await _appItemRepository.CountAsync(x => x.ParentId == item.Id);
                    item.ImageURL = imageQuery.FirstOrDefault(x => x.Id == item.Id && x.ItemFK.EntityFk.EntityAttachments.Count > 0) != null
                                                ? "attachments/" + item.ImageURL + "/" + imageQuery.FirstOrDefault(x => x.Id == item.Id && x.ItemFK.EntityFk.EntityAttachments.Count > 0).ItemFK.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment
                                                 : "";
                }

                return appItemsLists.ToList();
            }
        }


        public async Task<GetAppItemsListForEditOutput> GetAppItemsListForView(long id)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var appItemsList = await _appItemsListRepository.GetAll().Where(x => x.Id == id).Include(x => x.EntityFk).Include(x => x.ItemSharingFkList).ThenInclude(x => x.UserFk).FirstOrDefaultAsync();

                var output = new GetAppItemsListForEditOutput { AppItemsList = ObjectMapper.Map<CreateOrEditAppItemsListDto>(appItemsList), TenantId = appItemsList.TenantId };
                output.AppItemsList.AppItemsListItems = await GetDetails(new GetDetailsInput { ItemListId = id, SkipCount = 0, MaxResultCount = 10 });

                //get published flag
                var relation = await _appEntitiesRelationshipRepository.FirstOrDefaultAsync(x => x.EntityId == appItemsList.EntityId);
                output.AppItemsList.Published = relation != null;

                //get entity state
                var jsonstring = _appEntitiesAppService.GetAppEntityState(appItemsList.EntityId).Result;
                if (!string.IsNullOrEmpty(jsonstring))
                {
                    var jsonObject = JsonConvert.DeserializeObject<AppItemsList>(jsonstring);
                    output.AppItemsList.Name = jsonObject.Name;
                    output.AppItemsList.Code = jsonObject.Code;
                    output.AppItemsList.Description = jsonObject.Description;
                }
                //MMT33-2
                output.ShowSync = false;
                var marketplaceItemList = await _appMarketplaceItemListRepository.GetAll().Where(a => a.Code == appItemsList.SSIN).FirstOrDefaultAsync();
                if (marketplaceItemList != null )
                {
                    if(marketplaceItemList.TimeStamp < marketplaceItemList.TimeStamp)
                    output.ShowSync = true;

                    output.AppItemsList.SharingLevel = marketplaceItemList.SharingLevel;
                }
                else
                {
                    output.ShowSync = false;
                    output.AppItemsList.SharingLevel = 0;
                }
                if (output.AppItemsList.SharingLevel == 0)
                {
                    output.NumberOfSubscribers = 0;
                }
                else
                {
                    var subscribersCnt = await _appEntityRepository.CountAsync(a => a.Code == appItemsList.SSIN & a.TenantId != null & a.TenantId != a.TenantOwner);
                    output.NumberOfSubscribers = subscribersCnt;
                }
                if (!string.IsNullOrEmpty(appItemsList.LastModificationTime.ToString()))
                    output.LastModifiedDate = DateTime.Parse(appItemsList.LastModificationTime.ToString());
                //MMT33-2
                return output;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Edit)]
        public async Task<GetAppItemsListForEditOutput> GetAppItemsListForEdit(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //var appItemsList = await _appItemsListRepository.GetAll().Where(x => x.Id == input.Id && x.TenantId==AbpSession.TenantId).Include(x => x.ItemSharingFkList).ThenInclude(x => x.UserFk).FirstOrDefaultAsync();
                var appItemsList = await _appItemsListRepository.GetAll().Where(x => x.Id == input.Id).Include(e => e.EntityFk).Include(x => x.ItemSharingFkList).ThenInclude(x => x.UserFk).FirstOrDefaultAsync();

                var output = new GetAppItemsListForEditOutput { AppItemsList = ObjectMapper.Map<CreateOrEditAppItemsListDto>(appItemsList), TenantId = appItemsList.TenantId };
                output.AppItemsList.AppItemsListItems = await GetDetails(new GetDetailsInput { ItemListId = input.Id, SkipCount = 0, MaxResultCount = 10 });

                //get published flag
                var relation = await _appEntitiesRelationshipRepository.FirstOrDefaultAsync(x => x.EntityId == appItemsList.EntityId);
                output.AppItemsList.Published = relation != null;
                foreach (var item in output.AppItemsList.Users)
                {
                    var systemUser = UserManager.Users.FirstOrDefault(x => x.Id == item.Id);
                    if (systemUser != null && systemUser.Id > 0)
                    {
                        var profilePictureId = systemUser.ProfilePictureId;
                        if (profilePictureId != null)
                        {
                            item.ImageURL = "data:image/jpeg;base64," + _iProfileAppService.GetProfilePictureById((Guid)profilePictureId)?.Result?.ProfilePicture;
                        }
                    }
                }
                //get entity state
                var jsonstring = _appEntitiesAppService.GetAppEntityState(appItemsList.EntityId).Result;
                if (!string.IsNullOrEmpty(jsonstring))
                {
                    var jsonObject = JsonConvert.DeserializeObject<AppItemsList>(jsonstring);
                    output.AppItemsList.Name = jsonObject.Name;
                    output.AppItemsList.Code = jsonObject.Code;
                    output.AppItemsList.Description = jsonObject.Description;
                }
                //MMT33-2
                output.ShowSync = false;
                var marketplaceItemList = await _appMarketplaceItemListRepository.GetAll().Where(a => a.Code == appItemsList.SSIN).FirstOrDefaultAsync();
                if (marketplaceItemList != null)
                {
                    if (marketplaceItemList.TimeStamp < appItemsList.TimeStamp)
                        output.ShowSync = true;

                    output.AppItemsList.SharingLevel = marketplaceItemList.SharingLevel;
                }
                else
                {
                    output.ShowSync = false;
                    output.AppItemsList.SharingLevel = 0;
                }
                if (output.AppItemsList.SharingLevel == 0)
                {
                    output.NumberOfSubscribers = 0;
                }
                else
                {
                    var subscribersCnt = await _appEntityRepository.CountAsync(a => a.Code == appItemsList.SSIN & a.TenantId != null & a.TenantId != a.TenantOwner);
                    output.NumberOfSubscribers = subscribersCnt;
                }
                if (!string.IsNullOrEmpty(appItemsList.LastModificationTime.ToString()))
                    output.LastModifiedDate = DateTime.Parse(appItemsList.LastModificationTime.ToString());
                //MMT33-2
                return output;
            }
        }

        public async Task<GetAppItemsListForEditOutput> CreateOrEdit(CreateOrEditAppItemsListDto input)
        {
            if (input.Id == null)
            {
                return await Create(input);
            }
            else
            {
                return await Update(input);
            }
        }

        public async Task SaveState(CreateOrEditAppItemsListDto input)
        {
            if (input != null && input.Id > 0)
            {
                var appItemListCurrent = await _appItemsListRepository.FirstOrDefaultAsync((long)input.Id);
                
                //ObjectMapper.Map(input, appItemList);
                var appItemList = ObjectMapper.Map<AppItemsList>(input);
                if (appItemList != null)
                {
                    var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(appItemList);
                    if (!string.IsNullOrEmpty(jsonString))
                    {   
                        await _appEntitiesAppService.SetAppEntityState(appItemListCurrent.EntityId, jsonString);
                    }
                    // look Hassan, should not update the item list
                    //_appItemsListRepository
                }
            }
        }

        public async Task ChangeStatus(long itemListId, string status)
        {
            List<GetSycEntityObjectStatusForViewDto> statusList = new List<GetSycEntityObjectStatusForViewDto>() ;
            if (status != null)
            {
                statusList = _sycEntityObjectStatusesAppService.GetAll(new SystemObjects.Dtos.GetAllSycEntityObjectStatusesInput { SydObjectCodeFilter = "ITEMS-LIST", CodeFilter = status }).Result.Items.ToList();
            }
            var itemList = await _appItemsListRepository.FirstOrDefaultAsync(e => e.Id == itemListId);
            if (itemList != null && itemList.Id > 0)
            {
                var appItemsDetailsCount = itemList.AppItemsListDetails?.Count();
                var entityObject = await _appEntityRepository.FirstOrDefaultAsync(e => e.Id == itemList.EntityId);
                if (entityObject != null && entityObject.Id > 0)
                {
                    bool setNullStatus = status == StatusEnum.ACTIVE.ToString() && (!appItemsDetailsCount.HasValue || appItemsDetailsCount == 0);
                    entityObject.EntityObjectStatusId = setNullStatus ? null : statusList?[0]?.SycEntityObjectStatus?.Id ;
                    entityObject.EntityObjectStatusCode = setNullStatus ? null : statusList?[0]?.SycEntityObjectStatus?.Code;
                }
            }
        }

        public async Task<GetStatusResult> GetStatus(long itemListId)
        {
            var itemList = await _appItemsListRepository.GetAll()
                .Where(x=>x.Id == itemListId).Include(e=>e.EntityFk)                 
                .FirstOrDefaultAsync();
            return new GetStatusResult() { Code = itemList.EntityFk.EntityObjectStatusCode, Id = itemList.EntityFk.EntityObjectStatusId };
        }

        public async Task Cancel(long id)
        {
            if (id > 0)
            {
                var appItemlist = await _appItemsListRepository.FirstOrDefaultAsync(id);
                var appItemlistDetails = _appItemsListDetailRepository.GetAll().Where(e => e.ItemsListId == id).ToList();
                //6.1 Hard delete lines with status “ToBeAdded”
                _appItemsListDetailRepository.Delete(e => e.State == StateEnum.ToBeAdded.ToString() && e.ItemsListId == id);

                //6.2 Change lines “ToBeRemoved” to ""Active"".
                appItemlistDetails.Where(e => e.State == StateEnum.ToBeRemoved.ToString()).ToList().ForEach(e => e.State = StateEnum.ActiveOrEmpty.ToString());

                //6.3 ChangeStatus(ChangeStatusAppItemsListDto input) with Active.
                await ChangeStatus(id, StatusEnum.ACTIVE.ToString());

                //6.4 Delete any related rows in AppEntititesTemp.
                await _appEntitiesAppService.SetAppEntityState(appItemlist.EntityId, "");

            }
        }

        public async Task SaveSelection(long itemListId, Guid key)
        {
            //5.1 Validate selected products if they exist in the product list.
            var itemsExist = _appItemsListDetailRepository.GetAll().Where(e => e.ItemsListId == itemListId).ToList();
            List<long> itemsExistIds = new List<long>();
            if (itemsExist != null && itemsExist.Count > 0)
            {
                 itemsExistIds = itemsExist.Select(x => x.ItemId).ToList();
            }
            { 
                var majorList = _appItemSelectorRepository.GetAll().Where(e => e.Key == key && !itemsExistIds.Contains(e.SelectedId)).ToList();
                if(majorList!=null && majorList.Count> 0 )
                {
                    var majorListIds = majorList.Select(x => x.SelectedId).ToList();
                    var majorListVariations = _appItemRepository.GetAll().Where(x => majorListIds.Contains( (long)x.ParentId ) ).Select(x=>x.Id);
                    //5.3 For each product to add call, CreateOrEditItem(), to add item with DraftStatus as ToBeAdded
                    List< AppItemsListDetail> appItemsListDetailsMajorList = majorList.Select(e => new AppItemsListDetail {ItemId=e.SelectedId, ItemsListId= itemListId, State= StateEnum.ToBeAdded.ToString() }).ToList();
                    List< AppItemsListDetail> appItemsListDetailsVariationList = majorListVariations.Select(id => new AppItemsListDetail {ItemId= id, ItemsListId= itemListId, State= StateEnum.ToBeAdded.ToString() }).ToList();
                    //List<AppItemsListDetail> appItemsListDetailsList = new List<AppItemsListDetail>();
                    
                    foreach(var x in appItemsListDetailsMajorList)
                    {
                        await _appItemsListDetailRepository.InsertAsync(x);
                    }
                    foreach (var x in appItemsListDetailsVariationList)
                    {
                        await _appItemsListDetailRepository.InsertAsync(x);
                    }


                    //appItemsListDetailsList.AddRange(appItemsListDetailsMajorList);
                    //appItemsListDetailsList.AddRange(appItemsListDetailsVariationList);

                    //var dbContext = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                    //if (appItemsListDetailsList.Count() > 0)
                    //   dbContext.AppItemsListDetails.UpdateRange(appItemsListDetailsList);

                    //if (appItemsListDetailsList.Count() > 0 )
                    //   await dbContext.BulkSaveChangesAsync();

                }
                _appItemSelectorRepository.HardDelete(e => e.Key == key);
            }

            //5.2 If it does not exist, add to PL with and their variations then remove them from the APP ITEMSELECTOR table.
            
            //5.4 change the status of the header to draft
            await ChangeStatus(itemListId, "DRAFT");
        }

        public async Task MarItemsAs(long itemListId, long itemId, StateEnum state)
        {
            if (itemListId > 0)
            {
                if (itemId > 0)
                {
                    var item = await _appItemsListDetailRepository.FirstOrDefaultAsync(e => e.ItemsListId == itemListId && e.ItemId == itemId);
                    if (item != null && item.Id > 0)
                    {
                        item.State = state.ToString();
                        await ChangeStatus(itemListId, StatusEnum.DRAFT.ToString());
                    }
                }
            }
        }

        public async Task MarkManyItemsAs(CreateOrEditAppItemsListItemDto[] list)
        {
            foreach (var item in list) { 
                await MarItemsAs(item.ItemsListId, item.ItemId, item.State);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Create)]
        protected virtual async Task<GetAppItemsListForEditOutput> Create(CreateOrEditAppItemsListDto input)
        {
            //var appItemsList = ObjectMapper.Map<AppItemsList>(input);

            //if (AbpSession.TenantId != null)
            //{
            //    appItemsList.TenantId = (int)AbpSession.TenantId;
            //}

            //await _appItemsListRepository.InsertAsync(appItemsList);
            return await DoCreateOrEdit(input);

        }

        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Edit)]
        protected virtual async Task<GetAppItemsListForEditOutput> Update(CreateOrEditAppItemsListDto input)
        {
            //var appItemsList = await _appItemsListRepository.FirstOrDefaultAsync((long)input.Id);
            //ObjectMapper.Map(input, appItemsList);
            return await DoCreateOrEdit(input);
        }

        private async Task<GetAppItemsListForEditOutput> DoCreateOrEdit(CreateOrEditAppItemsListDto input)
        {
            var itemObjectId = await _helper.SystemTables.GetObjectItemId(); //check with Wael
            var productEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeProductId(); //check with Wael

            AppItemsList appItemlist;
            if (input.Id == 0 || input.Id == null)
            {
                appItemlist = ObjectMapper.Map<AppItemsList>(input);
            }
            else
            {
                appItemlist = await _appItemsListRepository.FirstOrDefaultAsync((long)input.Id);
                ObjectMapper.Map(input, appItemlist);
            }

            AppEntityDto entity = new AppEntityDto();
            ObjectMapper.Map(input, entity);
            entity.Id = 0;
            entity.Code = input.Code;
            entity.ObjectId = itemObjectId;
            entity.EntityObjectTypeId = productEntityObjectTypeId;
            entity.TenantId = AbpSession.TenantId;
            //entity.EntityObjectStatusId = itemStatusId;
            entity.Id = appItemlist.EntityId;
            entity.Notes = input.Name;
            //MMT33-2[Start]
            var timeStamp = DateTime.Now;
            appItemlist.TimeStamp = timeStamp;
            if (string.IsNullOrEmpty(appItemlist.SSIN))
            {
                appItemlist.SSIN = await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                entity.SSIN = appItemlist.SSIN;
            }
            entity.TenantOwner = int.Parse(AbpSession.TenantId.ToString()); 
            //MMT33-2[End]

            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);

            appItemlist.EntityId = savedEntity;
            appItemlist.TenantId = AbpSession.TenantId;
            //MMT30
            if (appItemlist.AppItemsListDetails!= null)
            {
                foreach (var detItem in appItemlist.AppItemsListDetails)
                {
                    var itemobj = _appItemRepository.FirstOrDefault(a => a.Id == detItem.ItemId);
                    if (itemobj != null)
                        detItem.ItemSSIN = itemobj.SSIN;
                }
            }
            //MMT30
            long id = 0;
            if (appItemlist.Id == 0)
            {
                id = await _appItemsListRepository.InsertAndGetIdAsync(appItemlist);
            }
            else
            {
                id = appItemlist.Id;
                //var appItemlist1 = await _appItemsListRepository.FirstOrDefaultAsync(id);
                var appItemlistDetails = _appItemsListDetailRepository.GetAll().Where(e => e.ItemsListId == id).ToList();
                //MMT30
                if (appItemlistDetails != null)
                {
                    foreach (var detItem in appItemlistDetails)
                    {
                        var itemobj = _appItemRepository.FirstOrDefault(a => a.Id == detItem.ItemId);
                        if (itemobj != null)
                            detItem.ItemSSIN = itemobj.SSIN;
                    }
                }
                //MMT30
                //6.1 Delete lines with state removed
                _appItemsListDetailRepository.Delete(e => e.State == StateEnum.ToBeRemoved.ToString() && e.ItemsListId == id);

                //6.2 Change lines “ToBeAdded” to ""Active"".
                appItemlistDetails.Where(e => e.State == StateEnum.ToBeAdded.ToString()).ToList().ForEach(e => e.State = StateEnum.ActiveOrEmpty.ToString());
            }
            if (id > 0) 
            { 
                //6.3 ChangeStatus(ChangeStatusAppItemsListDto input) with Active.
                await ChangeStatus(id, StatusEnum.ACTIVE.ToString());

                //6.4 Delete any related rows in AppEntititesTemp.
                await _appEntitiesAppService.SetAppEntityState(appItemlist.EntityId, "");

            }
            return await GetAppItemsListForEdit(new EntityDto<long>(appItemlist.Id));
        }

        public async Task CreateOrEditItem(CreateOrEditAppItemsListItemDto input)
        {
            //set detail id
            input.Id = await GetItemsListDetailId(input.ItemId, input.ItemsListId);
            foreach (var item in input.AppItemsListItemVariations)
            {
                item.Id = await GetItemsListDetailId(item.ItemId, input.ItemsListId);
            }

            //Save parent product
            AppItemsListDetail appItemlistDetail;
            if (input.Id == 0)
            {
                appItemlistDetail = ObjectMapper.Map<AppItemsListDetail>(input);
            }
            else
            {
                appItemlistDetail = await _appItemsListDetailRepository.FirstOrDefaultAsync(input.Id);
                ObjectMapper.Map(input, appItemlistDetail);
                appItemlistDetail.ItemsListId = input.ItemsListId;
            }
            //MMT30
            if (appItemlistDetail != null)
            {
               var itemobj = _appItemRepository.FirstOrDefault(a => a.Id == appItemlistDetail.ItemId);
               if (itemobj != null)
                    appItemlistDetail.ItemSSIN = itemobj.SSIN;
               
            }
            //MMT30
            if (appItemlistDetail.Id == 0)
                await _appItemsListDetailRepository.InsertAsync(appItemlistDetail);

            //Save variatons products
            if (input.AppItemsListItemVariations.Count() > 0)
            {
                foreach (var v in input.AppItemsListItemVariations)
                {
                    AppItemsListDetail variationDetail;
                    if (v.Id == 0)
                    {
                        variationDetail = ObjectMapper.Map<AppItemsListDetail>(v);
                        variationDetail.ItemsListId = input.ItemsListId;
                    }
                    else
                    {
                        variationDetail = await _appItemsListDetailRepository.FirstOrDefaultAsync(v.Id);
                        ObjectMapper.Map(v, variationDetail);
                    }
                    
                    //MMT30
                    if (variationDetail != null)
                    {

                        var itemobj = _appItemRepository.FirstOrDefault(a => a.Id == variationDetail.ItemId);
                        if (itemobj != null)
                            variationDetail.ItemSSIN = itemobj.SSIN;

                    }
                    //MMT30

                    if (variationDetail.Id == 0)
                    {
                        var newRecord = await _appItemsListDetailRepository.InsertAsync(variationDetail);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        v.Id = newRecord.Id;
                    }
                   
                }
            }

            if (input.Id != 0)
            {
                //delete not exists ItemsListDetails
                var existedIds = input.AppItemsListItemVariations.Select(x => x.Id).ToArray();
                var tmpList = existedIds.ToList();
                tmpList.Add(input.Id);
                var finalIds = tmpList.ToArray();
                await _appItemsListDetailRepository.DeleteAsync(x => x.ItemsListId == input.ItemsListId && x.ItemFK.ParentId == input.ItemId && !finalIds.Contains(x.Id));
            }
        }

        private async Task SaveSharingOptions(PublishItemOptions input)
        {
            //var item = await _appItemRepository.GetAll().Include(x=>x.ItemSharingFkList).FirstOrDefaultAsync(x=>x.Id==input.ListingItemId);

            //item.SharingLevel = input.SharingLevel;

            ////save ItemSharing
            if (input.ItemSharing != null)
            {
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
                    sharing.ItemListId = input.ItemListId;
                    if (sharing.Id == 0 && (sharing.SharedTenantId != 0 || sharing.SharedUserId != 0 || string.IsNullOrEmpty(sharing.SharedUserEMail)))
                        await _appItemSharingRepository.InsertAsync(sharing);
                }

                ////delete not existed item sharing
                var sharingIds = input.ItemSharing.Select(x => x.Id).ToArray();
                if (sharingIds != null)
                    await _appItemSharingRepository.DeleteAsync(x => x.ItemListId == input.ItemListId && !sharingIds.Contains(x.Id));
            }
        }

        public async Task<PublishItemOptions> GetPublishOptions(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var item = await _appItemsListRepository.GetAll().Include(x => x.ItemSharingFkList).ThenInclude(x => x.UserFk).FirstOrDefaultAsync(x => x.Id == input.Id);
                var entitiesRelationship = await _appEntitiesRelationshipRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.EntityId == item.EntityId);

                AppItemsList publishItemsList = null;
                if (entitiesRelationship != null)
                    publishItemsList = await _appItemsListRepository.GetAll().Include(x => x.ItemSharingFkList).FirstOrDefaultAsync(x => x.EntityId == entitiesRelationship.RelatedEntityId);


                if (publishItemsList != null)
                {
                    PublishItemOptions options = new PublishItemOptions
                    {
                        ItemListId = input.Id,
                        SharingLevel = publishItemsList.SharingLevel,
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

        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            var itemsList = await _appItemsListRepository.GetAll()
                .FirstOrDefaultAsync(x => x.Id == input.Id);

            await _appEntitiesRelationshipRepository.DeleteAsync(x => x.RelatedEntityId == itemsList.EntityId);
            await _appItemsListDetailRepository.DeleteAsync(x => x.ItemsListId == input.Id);
            await _appItemsListRepository.DeleteAsync(input.Id);
            await _appEntityRepository.DeleteAsync(itemsList.EntityId);
        }

        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Delete)]
        public async Task DeleteItem(long[] inputIds)
        {
            foreach (var id in inputIds)
            {
                await _appItemsListDetailRepository.DeleteAsync(id);
            }
        }

        public async Task<FileDto> GetAppItemsListsToExcel(GetAllAppItemsListsForExcelInput input)
        {

            var filteredAppItemsLists = _appItemsListRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter));

            var query = (from o in filteredAppItemsLists
                         select new GetAppItemsListForViewDto()
                         {
                             AppItemsList = new AppItemsListDto
                             {
                                 Code = o.Code,
                                 Name = o.Name,
                                 SharingLevel = o.SharingLevel,
                                 Id = o.Id
                             }
                         });

            var appItemsListListDtos = await query.ToListAsync();

            return _appItemsListsExcelExporter.ExportToFile(appItemsListListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Publish)]
        public async Task Publish(PublishItemOptions input)
        {
            ShareItemListOptions input1 = new ShareItemListOptions();
            input1.ItemListId = input.ItemListId;
            input1.ItemSharing = input.ItemSharing;
            input1.SharingLevel = input.SharingLevel;
            input1.Message = input.Message;
            input1.ItemListId = int.Parse(input.ListingItemId.ToString());
            await ShareItemList( input1);
            return;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                await SaveSharingOptions(input);

                var itemsList = await _appItemsListRepository.GetAll().Include(x => x.EntityFk).Include(x => x.AppItemsListDetails)
                    .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.ItemListId);

                //get entityRelation
                AppEntitiesRelationship entitiesRelationship = await _appEntitiesRelationshipRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.EntityId == itemsList.EntityId);

                //get publishedItemsList
                AppItemsList publishItemsList = new AppItemsList();
                if (entitiesRelationship != null)
                    publishItemsList = await _appItemsListRepository.GetAll().FirstOrDefaultAsync(x => x.EntityId == entitiesRelationship.RelatedEntityId);

                if (publishItemsList == null || publishItemsList.Id == 0)
                {
                    publishItemsList = ObjectMapper.Map<AppItemsList>(itemsList);
                    publishItemsList.EntityId = 0;
                    //MMT
                    publishItemsList.TenantId = null;
                    //MMt
                }
                else
                {
                    var publishEntityId = publishItemsList.EntityId;
                    ObjectMapper.Map(itemsList, publishItemsList);
                    publishItemsList.AppItemsListDetails = null;
                    publishItemsList.EntityId = publishEntityId;

                }

                publishItemsList.SharingLevel = input.SharingLevel;

                AppEntityDto entityDto = new AppEntityDto();
                ObjectMapper.Map(itemsList.EntityFk, entityDto);
                entityDto.Id = 0;
                //MMT
                entityDto.TenantId = null;
                //MMt
                if (publishItemsList != null)
                {
                    //newitem.Id = publishItem.Id;
                    entityDto.Id = publishItemsList.EntityId;
                    entityDto.Code = publishItemsList.Code;
                }

                var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                publishItemsList.EntityId = savedEntity;
                if (publishItemsList.Id == 0)
                {
                    if (entitiesRelationship == null)
                    {
                        entitiesRelationship = new AppEntitiesRelationship { EntityId = itemsList.EntityId, EntityTable = "AppItemsLists", RelatedEntityId = savedEntity, TenantId = null };
                        entitiesRelationship = _appEntitiesRelationshipRepository.Insert(entitiesRelationship);
                    }

                    publishItemsList = await _appItemsListRepository.InsertAsync(publishItemsList);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }

                //Delete removed child items
                var publishedDetails = _appItemsListDetailRepository.GetAll().AsNoTracking().Where(x => x.ItemsListId == publishItemsList.Id);
                var existedIds = publishedDetails.Select(x => x.Id).ToArray();

                var itemIds = itemsList.AppItemsListDetails.Select(x => x.ItemId).ToArray();

                var toBeDeletedIds = _appItemsListDetailRepository.GetAll().Where(x => existedIds.Contains(x.Id) && (!itemIds.Contains((long)x.ItemId))).Select(x => x.Id).ToArray();

                await _appItemsListDetailRepository.DeleteAsync(x => toBeDeletedIds.Contains(x.Id));
                //

                //Save details
                foreach (var child in itemsList.AppItemsListDetails)
                {
                    AppItemsListDetail publishChild = new AppItemsListDetail(); ;
                    //if (publishItemsList != null && publishItemsList.AppItemsListDetails != null)
                    publishChild = publishedDetails.FirstOrDefault(x => x.ItemId == child.ItemId);

                    if (publishChild == null)
                    {
                        publishChild = new AppItemsListDetail();
                        ObjectMapper.Map(child, publishChild);
                        publishChild.Id = 0;
                        publishChild.ItemsListId = publishItemsList.Id;

                        if (publishChild.Id == 0)
                        {
                            publishChild = await _appItemsListDetailRepository.InsertAsync(publishChild);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                    }

                }
            }
            //send notification to the users
            //await _appNotifier.SharedProduct(tenant);

        }
        //MMT33-2
        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Publish)]
        public async Task UnHideItemList(long itemListId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItemList = await _appItemsListRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.Id == itemListId);
                if (appItemList != null)
                {
                    var appMarketplaceItemList = await _appMarketplaceItemListRepository.GetAll().Include(z=>z.ItemSharingFkList).Where(x => x.Code == appItemList.SSIN).FirstOrDefaultAsync();
                    if (appMarketplaceItemList != null)
                    {
                        
                        appMarketplaceItemList.SharingLevel = (appMarketplaceItemList.ItemSharingFkList != null && appMarketplaceItemList.ItemSharingFkList.Count > 0) ? byte.Parse(2.ToString()): byte.Parse(1.ToString());
                        await _appMarketplaceItemListRepository.UpdateAsync(appMarketplaceItemList);
                    }
                }
                await CurrentUnitOfWork.SaveChangesAsync();
            }

        }
        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Publish)]
        public async Task HideItemList(long itemListId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItemList = await _appItemsListRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.Id == itemListId);
                if (appItemList != null)
                {
                    var appMarketplaceItemList = await _appMarketplaceItemListRepository.GetAll().Where(x => x.Code == appItemList.SSIN).FirstOrDefaultAsync();
                    if (appMarketplaceItemList != null)
                    {
                        appMarketplaceItemList.SharingLevel = 4;
                        await _appMarketplaceItemListRepository.UpdateAsync(appMarketplaceItemList);
                    }
                }
                await CurrentUnitOfWork.SaveChangesAsync();
            }

        }
        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Publish)]
        public async Task MakeItemListPrivate(long itemListId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItemList = await _appItemsListRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.Id == itemListId);
                if (appItemList != null)
                {
                    var appMarketplaceItemList = await _appMarketplaceItemListRepository.GetAll().Where(x => x.Code == appItemList.SSIN).FirstOrDefaultAsync();
                    if (appMarketplaceItemList != null)
                    {
                        appMarketplaceItemList.SharingLevel = 3;
                        await _appMarketplaceItemListRepository.UpdateAsync(appMarketplaceItemList);
                    }
                }
                await CurrentUnitOfWork.SaveChangesAsync();
           }

        }
        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Publish)]
        public async Task SyncItemList(long itemListId)
        {
            ShareItemListOptions input = new ShareItemListOptions();
            input.ItemListId = itemListId;
            input.SyncProductList = true;
            await ShareItemList(input);

        }
        [AbpAuthorize(AppPermissions.Pages_AppItemsLists_Publish)]
        public async Task ShareItemList(ShareItemListOptions input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //await SaveSharingOptions(input);

                var itemsList = await _appItemsListRepository.GetAll().Include(x => x.EntityFk).Include(x => x.AppItemsListDetails)
                    .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.ItemListId);

                //get entityRelation
                AppEntitiesRelationship entitiesRelationship = await _appEntitiesRelationshipRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.EntityId == itemsList.EntityId);

                //get publishedItemsList
                AppMarketplaceItemLists.AppMarketplaceItemLists publishItemsList = new AppMarketplaceItemLists.AppMarketplaceItemLists();
                if (entitiesRelationship != null)
                    publishItemsList = await _appMarketplaceItemListRepository.GetAll().FirstOrDefaultAsync(x => x.Id == entitiesRelationship.RelatedEntityId);

                if (publishItemsList == null || publishItemsList.Id == 0)
                {
                    publishItemsList = ObjectMapper.Map<onetouch.AppMarketplaceItemLists.AppMarketplaceItemLists>(itemsList);
                    publishItemsList.Id = 0;
                    publishItemsList.TenantId = null;
                    var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                    publishItemsList.SSIN = itemsList.SSIN; // await _helper.SystemTables.GenerateSSIN(itemObjectId, null);
                    publishItemsList.Code= itemsList.SSIN;
                    publishItemsList.TenantOwner = int.Parse(itemsList.TenantId.ToString());
                }
                else
                {
                    var publishEntityId = publishItemsList.Id;
                    ObjectMapper.Map(itemsList, publishItemsList);
                    publishItemsList.AppItemsListDetails = null;
                    publishItemsList.Id = publishEntityId;
                    publishItemsList.TenantId = null;
                    publishItemsList.TenantOwner = int.Parse(itemsList.TenantId.ToString());
                }
                publishItemsList.Code = itemsList.SSIN;
                if (!input.SyncProductList)
                publishItemsList.SharingLevel = input.SharingLevel;

                if (publishItemsList.Id != 0)
                {
                    
                    await _appMarketplaceItemSharing.DeleteAsync(x => x.AppMarketplaceItemListId  == publishItemsList.Id);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                if (!input.SyncProductList)
                {
                    publishItemsList.ItemSharingFkList = new List<AppMarketplaceItemSharings>();
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
                        publishItemsList.ItemSharingFkList.Add(sharing);

                    }
                }

                //var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                //publishItemsList.EntityId = savedEntity;
                if (publishItemsList.Id == 0)
                {
                    publishItemsList.AppItemsListDetails = null;
                    publishItemsList = await _appMarketplaceItemListRepository.InsertAsync(publishItemsList);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    if (entitiesRelationship == null)
                    {
                       entitiesRelationship = new AppEntitiesRelationship { EntityId = itemsList.EntityId, EntityTable = "AppItemsLists", RelatedEntityId = publishItemsList.Id, TenantId = null };
                       entitiesRelationship = _appEntitiesRelationshipRepository.Insert(entitiesRelationship);
                    }

                    
                    await CurrentUnitOfWork.SaveChangesAsync();
                }

                //Delete removed child items
                var publishedDetails = _appMarketplaceItemsListDetailRepository.GetAll().AsNoTracking().Where(x => x.AppMarketplaceItemsListId == publishItemsList.Id);
                var existedIds = publishedDetails.Select(x => x.Id).ToArray();

                var itemIds = itemsList.AppItemsListDetails.Select(x => x.ItemId).ToArray();

                var toBeDeletedIds = _appMarketplaceItemsListDetailRepository.GetAll().Where(x => existedIds.Contains(x.Id) && (!itemIds.Contains((long) x.AppMarketplaceItemId))).Select(x => x.Id).ToArray();

                await _appMarketplaceItemsListDetailRepository.DeleteAsync(x => toBeDeletedIds.Contains(x.Id));
                //

                //Save details
                foreach (var child in itemsList.AppItemsListDetails)
                {
                    AppMarketplaceItemsListDetails publishChild = new AppMarketplaceItemsListDetails(); 
                    //if (publishItemsList != null && publishItemsList.AppItemsListDetails != null)
                    publishChild = publishedDetails.FirstOrDefault(x => x.AppMarketplaceItemId == child.ItemId);

                    if (publishChild == null)
                    {
                        var marketplaceItem = await _appMarketplaceItem.GetAll().FirstOrDefaultAsync(x=> x.Code== child.ItemSSIN);

                        publishChild = new AppMarketplaceItemsListDetails();
                        ObjectMapper.Map(child, publishChild);
                        publishChild.Id = 0;
                        publishChild.AppMarketplaceItemsListId= publishItemsList.Id;
                        if (marketplaceItem != null)
                        {
                            publishChild.AppMarketplaceItemSSIN = marketplaceItem.SSIN;
                            publishChild.ItemCode = marketplaceItem.Code;
                        }
                        publishChild.ItemsListFK = null;
                        publishChild.AppMarketplaceItemId = marketplaceItem.Id;
                        if (publishChild.Id == 0)
                        {
                            publishChild = await _appMarketplaceItemsListDetailRepository.InsertAsync(publishChild);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                    }

                }
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            //send notification to the users
            //await _appNotifier.SharedProduct(tenant);

        }
        //MMT-2
        [AbpAuthorize(AppPermissions.Pages_AccountInfo_Publish)]
        public async Task UnPublish(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            { 
                var itemsList = await _appItemsListRepository.GetAll()
                    .AsNoTracking().FirstOrDefaultAsync(x => x.Id == input.Id);

                //get entityRelation
                AppEntitiesRelationship entitiesRelationship = await _appEntitiesRelationshipRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.EntityId == itemsList.EntityId);

                //get publishedItemsList
                var publishItemsList = await _appItemsListRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.EntityId == entitiesRelationship.RelatedEntityId);
                await Delete(new EntityDto<long> { Id = (long)publishItemsList.Id });
            }
        }
        //public async Task<List<LookupLabelDto>> SearchForDropDown(string search, ItemsListFilterTypesEnum filterType )
        //{
        //    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
        //    {
        //        var results = await _appItemsListRepository.GetAll()
        //                                        .Include(x=>x.ItemSharingFkList)
        //                                        .WhereIf(!string.IsNullOrWhiteSpace(search),x => x.Code.Contains(search) || x.Name.Contains(search))
        //                                        .Where(x=>(
        //                                            (filterType == ItemsListFilterTypesEnum.MyItemsList && x.TenantId == AbpSession.TenantId && x.SharingLevel == 0)
        //                                            || 
        //                                            (filterType == ItemsListFilterTypesEnum.Public && x.SharingLevel == 1)
        //                                            || 
        //                                            (filterType == ItemsListFilterTypesEnum.SharedWithMe && x.TenantId != AbpSession.TenantId && x.SharingLevel == 2 && x.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0)
        //                                        ))
        //                                        .Select(g => new LookupLabelDto() { Value = g.Id, Label = g.Name, Code = g.Code })
        //                                        .ToListAsync();
        //        return results;
        //    }
        //}
    }
}