using onetouch.AppEntities;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppEvents.Exporting;
using onetouch.AppEvents.Dtos;
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
using onetouch.AppEventGuests;
using onetouch.SystemObjects;
using Abp.Domain.Uow;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;
using onetouch.AppEventGuests.Dtos;

namespace onetouch.AppEvents
{
    [AbpAuthorize(AppPermissions.Pages_AppEvents)]
    public class AppEventsAppService : onetouchAppServiceBase, IAppEventsAppService
    {
        private readonly IRepository<AppEvent, long> _appEventRepository;
        private readonly IRepository<AppEntityAddress, long> _appEntityAddressRepository;
        private readonly IAppEventsExcelExporter _appEventsExcelExporter;
        private readonly IRepository<AppEntity, long> _lookup_appEntityRepository;
        private readonly IRepository<AppEventGuest, long> _lookup_appEventGuestsRepository;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly ISycAttachmentCategoriesAppService _sycAttachmentCategoriesAppService;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly Helper _helper;

        public AppEventsAppService(IRepository<AppEvent, long> appEventRepository,
            IAppEventsExcelExporter appEventsExcelExporter, 
            IRepository<AppEntity, long> lookup_appEntityRepository,
            IAppEntitiesAppService appEntitiesAppService, 
            Helper helper,
            IRepository<AppEventGuest, long> lookup_appEventGuestsRepository,
            ISycAttachmentCategoriesAppService sycAttachmentCategoriesAppService,
            IAppConfigurationAccessor appConfigurationAccessor,
            IRepository<AppEntityAddress, long> appEntityAddressRepository
            )
        {
            _appEventRepository = appEventRepository;
            _appEventsExcelExporter = appEventsExcelExporter;
            _lookup_appEntityRepository = lookup_appEntityRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _helper = helper;
            _lookup_appEventGuestsRepository = lookup_appEventGuestsRepository;
            _sycAttachmentCategoriesAppService = sycAttachmentCategoriesAppService;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appEntityAddressRepository = appEntityAddressRepository;
        }
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<GetAppEventForViewDto>> GetAll(GetAllAppEventsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.FilterType == null) input.FilterType = EventsFilterTypesEnum.AllEvents;
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                
                long BannerAttachmentCategoryId = await _sycAttachmentCategoriesAppService.GetSycAttachmentCategoryForViewByCode(AttachmentsCategories.BANNER.ToString());
                long LogoAttachmentCategoryId = await _sycAttachmentCategoriesAppService.GetSycAttachmentCategoryForViewByCode(AttachmentsCategories.LOGO.ToString());

                var filteredAppEvents = _appEventRepository.GetAll()
                            .Include(e => e.EntityFk).ThenInclude(e => e.EntityAddresses).ThenInclude(e => e.AddressFk)
                            .Include(e => e.EntityFk).ThenInclude(e => e.EntityObjectStatusFk)
                            .Include(e => e.EntityFk).ThenInclude(e => e.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                            .Include(e => e.AppEventGuests)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Name.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.RegistrationLink.Contains(input.Filter))
                            .WhereIf(input.IsOnLineFilter.HasValue, e => e.IsOnLine == input.IsOnLineFilter)
                            .WhereIf(input.IsPublishedFilter.HasValue, e => e.IsOnLine == input.IsPublishedFilter)
                            .WhereIf(input.IdFilter.HasValue && input.IdFilter != 0, e => e.Id == input.IdFilter)
                            .WhereIf(input.EntityIdFilter.HasValue && input.EntityIdFilter != 0, e => e.EntityId == input.EntityIdFilter)
                            .WhereIf(input.CreatorUserIdFilter.HasValue && input.CreatorUserIdFilter != 0, e => e.CreatorUserId == input.CreatorUserIdFilter)
                            .WhereIf(input.MinFromDateFilter.HasValue, e => e.UTCFromDateTime >= input.MinFromDateFilter)
                            .WhereIf(input.MaxFromDateFilter.HasValue, e => e.UTCFromDateTime <= input.MaxFromDateFilter)
                            .WhereIf(input.MinToDateFilter.HasValue, e => e.UTCToDateTime >= input.MinToDateFilter)
                            .WhereIf(input.MaxToDateFilter.HasValue, e => e.UTCToDateTime <= input.MaxToDateFilter)
                            .WhereIf(input.MinFromTimeFilter.HasValue, e => e.FromTime >= input.MinFromTimeFilter)
                            .WhereIf(input.MaxFromTimeFilter.HasValue, e => e.FromTime <= input.MaxFromTimeFilter)
                            .WhereIf(input.MinToTimeFilter.HasValue, e => e.ToTime >= input.MinToTimeFilter)
                            .WhereIf(input.MaxToTimeFilter.HasValue, e => e.ToTime <= input.MaxToTimeFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.TimeZoneFilter), e => e.TimeZone == input.TimeZoneFilter)
                            .WhereIf(input.PrivacyFilter.HasValue, e => input.PrivacyFilter == e.Privacy)
                            .WhereIf(input.GuestCanInviteFriendsFilter.HasValue, e => input.GuestCanInviteFriendsFilter == e.GuestCanInviteFriends)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.AppEntityNameFilter), e => e.EntityFk != null && e.EntityFk.Name.ToUpper().TrimEnd().Contains(input.AppEntityNameFilter.ToUpper().TrimEnd()))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.CityFilter), e => e.EntityFk.EntityAddresses != null && e.EntityFk.EntityAddresses.Count > 0 && e.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.City.ToUpper().TrimEnd().Contains(input.CityFilter.ToUpper().TrimEnd()))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.StateFilter), e => e.EntityFk.EntityAddresses != null && e.EntityFk.EntityAddresses.Count > 0 && e.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.State.ToUpper().TrimEnd().Contains(input.StateFilter.ToUpper().TrimEnd()))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.PostalFilter), e => e.EntityFk.EntityAddresses != null && e.EntityFk.EntityAddresses.Count > 0 && e.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.PostalCode.ToUpper().TrimEnd().Contains(input.PostalFilter.ToUpper().TrimEnd()))
                            .Where(e => ( input.FilterType == EventsFilterTypesEnum.MyEvents && e.TenantId == AbpSession.TenantId) || 
                                        ( input.FilterType == EventsFilterTypesEnum.AllEvents || input.FilterType == EventsFilterTypesEnum.UpcommingEvents || input.FilterType == EventsFilterTypesEnum.PriorEvents ) );

                var pagedAndFilteredAppEvents = filteredAppEvents
                    .OrderBy(input.Sorting ?? "UTCFromDateTime asc")
                    .PageBy(input);

                var appEvents = from o in pagedAndFilteredAppEvents
                                select new
                                {
                                    res = new GetAppEventForViewDto()
                                    {
                                        //   AppEvent = ObjectMapper.Map<AppEventDto>(o)

                                        AppEvent = new AppEventDto
                                        {
                                            EntityId = o.EntityId,
                                            IsOnLine = o.IsOnLine,
                                            IsPublished = o.IsPublished,
                                            UserId = (long)o.CreatorUserId,
                                            UserName = UserManager.Users.FirstOrDefault(x => x.Id == o.CreatorUserId && x.TenantId == o.TenantId).FullName,
                                            Attachments = input.IncludeAttachments == true ? ObjectMapper.Map<List<AppEntityAttachmentDto>>(o.EntityFk.EntityAttachments) : null,
                                            Status = o.EntityFk.EntityObjectStatusFk.Name,
                                            BanarURL = imagesUrl + (o.TenantId == null ? "-1" : o.TenantId.ToString()) + @"/" + o.EntityFk.EntityAttachments.Where(e => e.AttachmentCategoryId == BannerAttachmentCategoryId).FirstOrDefault().AttachmentFk.Attachment,
                                            LogoURL = imagesUrl + (o.TenantId == null ? "-1" : o.TenantId.ToString()) + @"/" + o.EntityFk.EntityAttachments.Where(e => e.AttachmentCategoryId == LogoAttachmentCategoryId).FirstOrDefault().AttachmentFk.Attachment,
                                            Address1 = o.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.AddressLine1,
                                            Address2 = o.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.AddressLine2,
                                            City = o.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.City,
                                            State = o.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.State,
                                            Postal = o.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.PostalCode,
                                            Country = o.EntityFk.EntityAddresses.FirstOrDefault().AddressFk.CountryFk.Name,
                                            GuestsCount = o.AppEventGuests.Where(r => r.UserResponce == (int)ResponceType.GOING).Count(),
                                            FromDate = o.FromDate,
                                            ToDate = o.ToDate,
                                            FromTime = o.FromTime,
                                            ToTime = o.ToTime,
                                            UTCFromDateTime = o.UTCFromDateTime,
                                            UTCToDateTime = o.UTCToDateTime,
                                            GuestCanInviteFriends = o.GuestCanInviteFriends,
                                            Name = o.Name,
                                            Code = o.Code,
                                            Description = o.Description,
                                            TimeZone = o.TimeZone,
                                            RegistrationLink = o.RegistrationLink,
                                            Id = o.Id,
                                            Address = o.EntityFk.EntityAddresses.Count > 0 ? ObjectMapper.Map<AppEntityAddressDto>(o.EntityFk.EntityAddresses.FirstOrDefault()) : null,
                                        }
                                    }
                                };

                var totalCount = await filteredAppEvents.CountAsync();

                var results = await appEvents.Select(r => r.res).ToListAsync();

                return new PagedResultDto<GetAppEventForViewDto>(
                    totalCount,
                    results
                );
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppEvents_Edit)]
        public async Task<GetAppEventForEditDto> GetAppEventForEdit(long id)
        {
            var appEvent = GetAll(new GetAllAppEventsInput(){ IdFilter=id,IncludeAttachments = true}).Result.Items.FirstOrDefault();
            var appEventDto = ObjectMapper.Map<GetAppEventForEditDto>(appEvent);
            var CurrentUserResponce = _lookup_appEventGuestsRepository.GetAll().Where(r => r.CreatorUserId == AbpSession.UserId && r.EventId == appEvent.AppEvent.Id).FirstOrDefault();
            if (CurrentUserResponce != null && CurrentUserResponce.Id > 0)
            { appEventDto.CurrentUserResponce = (ResponceType)CurrentUserResponce.UserResponce; }
            else
            {
                appEventDto.CurrentUserResponce = ResponceType.OTHER;
            }
            return appEventDto;
        }

        public async Task<GetAppEventForViewDto> GetAppEventForView(long id,long entityId, string timeZone)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            { 
                var appEvent = GetAll(new GetAllAppEventsInput() { IdFilter = id, EntityIdFilter = entityId, FilterType = EventsFilterTypesEnum.AllEvents }).Result.Items.FirstOrDefault();
                var CurrentUserResponce = _lookup_appEventGuestsRepository.GetAll().Where(r => r.CreatorUserId == AbpSession.UserId && r.EventId == appEvent.AppEvent.Id).FirstOrDefault();
                if (CurrentUserResponce != null && CurrentUserResponce.Id > 0)
                { appEvent.CurrentUserResponce = (ResponceType)CurrentUserResponce.UserResponce; }
                else
                {
                    appEvent.CurrentUserResponce = ResponceType.OTHER;
                }
                if (appEvent != null && appEvent.AppEvent != null && appEvent.AppEvent.UTCFromDateTime != null)
                {
                    appEvent.currentFromDateTime = _helper.GetDatetimeValueFromUTC(appEvent.AppEvent.UTCFromDateTime, timeZone);
                }
                if (appEvent != null && appEvent.AppEvent != null && appEvent.AppEvent.UTCToDateTime != null)
                {
                    appEvent.currentToDateTime = _helper.GetDatetimeValueFromUTC(appEvent.AppEvent.UTCToDateTime, timeZone);
                }

                return appEvent;
            }
        }

        public async Task<long> CreateOrEdit(CreateOrEditAppEventDto input)
        {
            //if (input.Id == null || input.Id == 0)
            //{
                return await DoCreateOrEdit(input);
            //}
            //else
           // {
             //   await Update(input);
           // }
        }

        [AbpAuthorize(AppPermissions.Pages_AppEvents_Create)]
        protected virtual async Task<long> DoCreateOrEdit(CreateOrEditAppEventDto input)
        {
            AppEvent appEvent;

            if (input.FromHour > 0 && input.FromMinute > 0)
            { //input.FromDate = new DateTime(input.FromDate.Year, input.FromDate.Month, input.FromDate.Day, input.FromHour, input.FromMinute,0);
                input.FromTime = new DateTime(input.FromTime.Year, input.FromTime.Month, input.FromTime.Day, input.FromHour, input.FromMinute, 0);
            
            }

            if (input.ToHour > 0 && input.ToMinute > 0)
            { //input.ToDate = new DateTime(input.ToDate.Year, input.ToDate.Month, input.ToDate.Day, input.ToHour, input.ToMinute, 0);
                input.ToTime = new DateTime(input.ToTime.Year, input.ToTime.Month, input.ToTime.Day, input.ToHour, input.ToMinute, 0);
            }

            if (input.Id == 0)
            {

                appEvent = ObjectMapper.Map<AppEvent>(input);
            }
            else
            {
                appEvent = await _appEventRepository.FirstOrDefaultAsync((long)input.Id);
                ObjectMapper.Map(input, appEvent);
            }

            if (AbpSession.TenantId != null)
            {
                appEvent.TenantId = (int?)AbpSession.TenantId;
            }
            #region save entity
            //look need to not use hardcoded values
            var objectTypeId = await _helper.SystemTables.GetEntityObjectTypeId("EVENT", true);
            var objectId = await _helper.SystemTables.GetObjectEventId();
            var statusId = await _helper.SystemTables.GetEntityObjectStatusEventDefault();
            if (input.Status!=0)
            { statusId = input.Status; }

            var entity = new AppEntityDto();
            entity.ObjectId = objectId;
            entity.EntityObjectStatusId = statusId;
            entity.EntityObjectTypeId = objectTypeId;
            entity.Code = input.Code;
            if (input.Id != 0)
            { entity.Id = input.EntityId; }

            //look should we save the name and code in entity
            entity.Name = input.Name;
            entity.Code = input.Code;
            entity.EntityAddresses = new List<AppEntityAddressDto>();
            if (input.Address != null && input.Address.AddressId > 0 ) 
            {
                if (input.Id > 0) // edit case
                {
                    var existedAddress = _appEntityAddressRepository.FirstOrDefault(x => x.EntityId == input.EntityId);
                    input.Address.EntitytId = input.EntityId;
                    if(existedAddress != null) await _appEventRepository.DeleteAsync(x => x.Id == existedAddress.Id);
                    var newAddress = ObjectMapper.Map<AppEntityAddress>(input.Address);
                    newAddress.EntityId = input.EntityId;
                    _appEntityAddressRepository.InsertAsync(newAddress);
                } 
                entity.EntityAddresses.Add(input.Address);
            }

            if (input.Attachments != null && input.Attachments.Count() > 0)
            {
                entity.EntityAttachments = input.Attachments;
            }

            if (AbpSession.TenantId != null)
            {
                entity.TenantId = (int?)AbpSession.TenantId;
            }

            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
            appEvent.EntityId = savedEntity;

            #endregion save entity


            appEvent.UTCFromDateTime = _helper.GetUTCDatetimeValueFromDateAndTime(appEvent.FromDate, appEvent.FromTime, appEvent.TimeZone);
            appEvent.UTCToDateTime = _helper.GetUTCDatetimeValueFromDateAndTime(appEvent.ToDate, appEvent.ToTime, appEvent.TimeZone);
            
            if (input.Id == 0)
            { await _appEventRepository.InsertAsync(appEvent); }
            else { await _appEventRepository.UpdateAsync(appEvent); }

            return savedEntity;
        }

        [AbpAuthorize(AppPermissions.Pages_AppEvents_Edit)]
        protected virtual async Task Update(CreateOrEditAppEventDto input)
        {
            
            //var appEvent = await _appEventRepository.FirstOrDefaultAsync((long)input.Id);
            //AppEntity entityEvent =  await _appEntitiesAppService.GetAll(new GetAllAppEntitiesInput { })
            //    .Where(e => e.Id == appEvent.EntityId).FirstOrDefaultAsync();
            //entityEvent.Name = input.Name;
            //entityEvent.Code = input.Code;

            //if (input.Status != 0)
            //{ entityEvent.EntityObjectStatusId = input.Status; }

            //entityEvent.EntityAddresses = new List<AppEntityAddressDto>();

            //if (input.AddressID != 0 )
            //{
            //    entityEvent.EntityAddresses.Add(new AppEntityAddressDto { AddressId = input.AddressID, AddressTypeId = input.AddressTypeID });
            //}

            //if (input.Attachments != null && input.Attachments.Count() > 0)
            //{
            //    foreach (AppEntityAttachmentDto appEntityAttachmentDto in input.Attachments)
            //    {
            //        appEntityAttachmentDto.AttachmentCategoryId = await _sycAttachmentCategoriesAppService.GetSycAttachmentCategoryForViewByCode(appEntityAttachmentDto.AttachmentCategoryEnum.ToString());
            //    }

            //    entityEvent.EntityAttachments = input.Attachments;
            //}
            //var savedEntity = await _appEntitiesAppService.SaveEntity(entityEvent);


            //ObjectMapper.Map(input, appEvent);

        }

        [AbpAuthorize(AppPermissions.Pages_AppEvents_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            var entity = _appEventRepository.GetAll().Where(r => r.Id == input.Id).FirstOrDefault();
            EntityDto<long> entityDto = new EntityDto<long>();
            entityDto.Id = (long)entity.EntityId;
            await _appEntitiesAppService.Delete(entityDto);

            await _lookup_appEventGuestsRepository.DeleteAsync(e => e.EventId == input.Id);

            await _appEventRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppEventsToExcel(GetAllAppEventsForExcelInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredAppEvents = _appEventRepository.GetAll()
                        .Include(e => e.EntityFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Description.Contains(input.Filter) || e.RegistrationLink.Contains(input.Filter))
                        .WhereIf(input.IsOnLineFilter.HasValue && input.IsOnLineFilter > -1, e => (input.IsOnLineFilter == 1 && e.IsOnLine) || (input.IsOnLineFilter == 0 && !e.IsOnLine))
                        .WhereIf(input.MinFromDateFilter != null, e => e.FromDate >= input.MinFromDateFilter)
                        .WhereIf(input.MaxFromDateFilter != null, e => e.FromDate <= input.MaxFromDateFilter)
                        .WhereIf(input.MinToDateFilter != null, e => e.ToDate >= input.MinToDateFilter)
                        .WhereIf(input.MaxToDateFilter != null, e => e.ToDate <= input.MaxToDateFilter)
                        .WhereIf(input.MinFromTimeFilter != null, e => e.FromTime >= input.MinFromTimeFilter)
                        .WhereIf(input.MaxFromTimeFilter != null, e => e.FromTime <= input.MaxFromTimeFilter)
                        .WhereIf(input.MinToTimeFilter != null, e => e.ToTime >= input.MinToTimeFilter)
                        .WhereIf(input.MaxToTimeFilter != null, e => e.ToTime <= input.MaxToTimeFilter)
                        .WhereIf(input.PrivacyFilter.HasValue && input.PrivacyFilter > -1, e => (input.PrivacyFilter == 1 && e.Privacy) || (input.PrivacyFilter == 0 && !e.Privacy))
                        .WhereIf(input.GuestCanInviteFriendsFilter.HasValue && input.GuestCanInviteFriendsFilter > -1, e => (input.GuestCanInviteFriendsFilter == 1 && e.GuestCanInviteFriends) || (input.GuestCanInviteFriendsFilter == 0 && !e.GuestCanInviteFriends))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppEntityNameFilter), e => e.EntityFk != null && e.EntityFk.Name == input.AppEntityNameFilter);

                var query = (from o in filteredAppEvents
                             join o1 in _lookup_appEntityRepository.GetAll() on o.EntityId equals o1.Id into j1
                             from s1 in j1.DefaultIfEmpty()

                             select new GetAppEventForViewDto()
                             {
                                 AppEvent = new AppEventDto
                                 {
                                     Id = o.Id
                                 }
                             });

                var appEventListDtos = await query.ToListAsync();

                return _appEventsExcelExporter.ExportToFile(appEventListDtos);
            }
        }
        [AbpAuthorize(AppPermissions.Pages_AppEventGuests_Edit)]
        public virtual async Task<bool> Publish(long Id)
        {
            return await UpdatePublicity(Id, true);
        }
        public virtual async Task<bool> UnPublish(long Id)
        {
            return await UpdatePublicity(Id, false);
        }

        [AbpAuthorize(AppPermissions.Pages_AppEventGuests_Edit)]
        private async Task<bool> UpdatePublicity(long Id,bool value)
        {
            AppEvent appEvent;
            appEvent = await _appEventRepository.FirstOrDefaultAsync(Id);
            appEvent.IsPublished = value;
            await _appEventRepository.UpdateAsync(appEvent);
            return true;
        }

    }
}