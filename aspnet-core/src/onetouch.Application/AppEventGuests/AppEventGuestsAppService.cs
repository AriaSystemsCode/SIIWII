using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppEventGuests.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.Helpers;
using Abp.UI;
using onetouch.Storage;
using onetouch.AppEntities.Dtos;
using onetouch.AppEntities;
using Abp.Domain.Uow;
using onetouch.AppEvents;
using onetouch.Notifications;
using System.Globalization;

namespace onetouch.AppEventGuests
{
    [AbpAuthorize(AppPermissions.Pages_AppEventGuests)]
    public class AppEventGuestsAppService : onetouchAppServiceBase, IAppEventGuestsAppService
    {
        //T-SII-20221013.0006,1 MMT 11/03/2022 Notify the Event Creator with the user's response[Start]
        private readonly IRepository<AppEvent, long> _appEventRepository;
        private readonly IAppNotifier _appNotifier;
        //T-SII-20221013.0006,1 MMT 11/03/2022 Notify the Event Creator with the user's response[End]

        private readonly IRepository<AppEventGuest, long> _appEventGuestRepository;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly Helper _helper;
        public AppEventGuestsAppService(IRepository<AppEventGuest, long> appEventGuestRepository,
            IAppEntitiesAppService appEntitiesAppService, Helper helper,IRepository<AppEvent, long> appEventRepository, IAppNotifier appNotifier)
        {
            _appEventGuestRepository = appEventGuestRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _helper = helper;
            //T-SII-20221013.0006,1 MMT 11/03/2022 Notify the Event Creator with the user's response[Start]
            _appEventRepository = appEventRepository;
            _appNotifier = appNotifier;
            //T-SII-20221013.0006,1 MMT 11/03/2022 Notify the Event Creator with the user's response[End]

        }

        public async Task<PagedResultDto<GetAppEventGuestForViewDto>> GetAll(GetAllAppEventGuestsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredAppEventGuests = _appEventGuestRepository.GetAll()
                .Include(e => e.EntityFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false)
                        .WhereIf(input.EventIdFilter != null && input.EventIdFilter > 0, e => e.EventId==input.EventIdFilter)
                        .WhereIf(input.CurrentUserFilter ==true, e=> e.CreatorUserId==AbpSession.UserId)
                        .WhereIf(input.MinUserResponceFilter != null, e => e.UserResponce >= input.MinUserResponceFilter)
                        .WhereIf(input.MaxUserResponceFilter != null, e => e.UserResponce <= input.MaxUserResponceFilter);

                var pagedAndFilteredAppEventGuests = filteredAppEventGuests
                    .OrderBy(input.Sorting ?? "id asc")
                    .PageBy(input);

                var appEventGuests = from o in pagedAndFilteredAppEventGuests
                                     select new
                                     {

                                         Id = o.Id,
                                         EntityId = o.EntityId,
                                         ResponceId = o.UserResponce,
                                         EventId = o.EventId,
                                         UserId = o.CreatorUserId,
                                         };

                var totalCount = await filteredAppEventGuests.CountAsync();

                var dbList = await appEventGuests.ToListAsync();
                var results = new List<GetAppEventGuestForViewDto>();

                foreach (var o in dbList)
                {
                    var res = new GetAppEventGuestForViewDto()
                    {
                        AppEventGuest = new AppEventGuestDto
                        {

                            Id = o.Id,
                            EntityId = o.EntityId,
                            ResponceId = o.ResponceId,
                            EventId = o.EventId,
                            UserId = o.UserId,
                            UserResponceType = (ResponceType)o.ResponceId,
                        }
                    };

                    results.Add(res);
                }

                return new PagedResultDto<GetAppEventGuestForViewDto>(
                    totalCount,
                    results
                );
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppEventGuests_Edit)]
        public async Task<GetAppEventGuestForEditOutput> GetAppEventGuestForEdit(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appEventGuest = await _appEventGuestRepository.FirstOrDefaultAsync(input.Id);

                var output = new GetAppEventGuestForEditOutput { AppEventGuest = ObjectMapper.Map<CreateOrEditAppEventGuestDto>(appEventGuest) };

                return output;
            }
        }

        public async Task CreateOrEdit(CreateOrEditAppEventGuestDto input)
        {
            //if (input.Id == null || input.Id == 0)
           // {
                await Create(input);
            //}
            //else
            //{
            //    await Update(input);
            //}
        }

        [AbpAuthorize(AppPermissions.Pages_AppEventGuests_Create)]
        protected virtual async Task Create(CreateOrEditAppEventGuestDto input)
        {
            var CurrentUserResponce = _appEventGuestRepository.GetAll().Where(r => r.CreatorUserId == AbpSession.UserId && r.EventId == input.EventId).FirstOrDefault();
            if (CurrentUserResponce != null && CurrentUserResponce.Id > 0)
            {
                CurrentUserResponce.UserResponce = (int)input.UserResponce;
            }
            else
            {


                var appEventGuest = ObjectMapper.Map<AppEventGuest>(input);

                if (AbpSession.TenantId != null)
                {
                    appEventGuest.TenantId = (int?)AbpSession.TenantId;
                }

                #region save entity
                //look need to not use hardcoded values
                var objectTypeId = await _helper.SystemTables.GetEntityObjectTypeId("EVENT", true);
                var objectId = await _helper.SystemTables.GetObjectEventGuestId();

                var entity = new AppEntityDto();
                entity.ObjectId = objectId;
                entity.EntityObjectTypeId = objectTypeId;

                //look should we save the name and code in entity
                entity.Name = input.Code;
                entity.Code = input.Code;
                if (AbpSession.TenantId != null)
                {
                    entity.TenantId = (int?)AbpSession.TenantId;
                }

                var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
                appEventGuest.EntityId = savedEntity;
                appEventGuest.UserResponce= (int)input.UserResponce;

                #endregion save entity

                await _appEventGuestRepository.InsertAsync(appEventGuest);
            }

            //T-SII-20221013.0006,1 MMT 11/03/2022 Notify the Event Creator with the user's response[Start]
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var eventObj = _appEventRepository.FirstOrDefault(x => x.Id == input.EventId);

                if (eventObj != null && eventObj.TenantId != null && eventObj.CreatorUserId != null)
                {

                    var tenantObject = await TenantManager.GetByIdAsync(int.Parse(eventObj.TenantId.ToString()));
                    if (tenantObject != null)
                    {
                        string tenancyName = tenantObject.TenancyName;
                        var myUser = await UserManager.FindByIdAsync(AbpSession.UserId.ToString());
                        if (myUser != null && AbpSession.TenantId != null)
                        {
                            var myTenantObject = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                            TextInfo textInfo = new CultureInfo("en-US", false).TextInfo;
                            string action = input.UserResponce.ToString();
                            if (input.UserResponce == ResponceType.NOTINTEREST)
                                action = "Not interested";
                            if (input.UserResponce == ResponceType.CANNOTGO)
                                action = "Cannot go";
                            if (input.UserResponce == ResponceType.MAYBE)
                                action ="May be";

                            await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(eventObj.TenantId, long.Parse(eventObj.CreatorUserId.ToString())),
                                "User " + myUser.FullName +"@"+ myTenantObject .TenancyName+ " responded with "
                                + textInfo.ToTitleCase(action.ToLower()) + 
                                " to the Event: " + eventObj.Name, Abp.Notifications.NotificationSeverity.Info);
                        }
                    }
                }
            }
            //T-SII-20221013.0006,1 MMT 11/03/2022 Notify the Event Creator with the user's response[End]

                   
        }

        [AbpAuthorize(AppPermissions.Pages_AppEventGuests_Edit)]
        protected virtual async Task Update(CreateOrEditAppEventGuestDto input)
        {
            var appEventGuest = new AppEventGuest();
            if (input.Id != null && input.Id > 0)
            {
                appEventGuest = await _appEventGuestRepository.FirstOrDefaultAsync((long)input.Id);
            }
            else
            {
                appEventGuest = _appEventGuestRepository.GetAll().Where(r => r.EventId == input.EventId && r.CreatorUserId == AbpSession.UserId).FirstOrDefault();
            }
            ObjectMapper.Map(input, appEventGuest);
            appEventGuest.UserResponce = (int)input.UserResponce;

        }

        [AbpAuthorize(AppPermissions.Pages_AppEventGuests_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var entity = _appEventGuestRepository.GetAll().Where(r => r.Id == input.Id).FirstOrDefault();
                EntityDto<long> entityDto = new EntityDto<long>();
                entityDto.Id = (long)entity.EntityId;
                await _appEntitiesAppService.Delete(entityDto);
                await _appEventGuestRepository.DeleteAsync(input.Id);
            }
        }

    }
}