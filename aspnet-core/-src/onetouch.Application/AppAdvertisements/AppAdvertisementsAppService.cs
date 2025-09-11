using onetouch.AppEntities;
using onetouch.Authorization.Users;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppAdvertisements.Dtos;
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
using GetAllForLookupTableInput = onetouch.AppAdvertisements.Dtos.GetAllForLookupTableInput;
using onetouch.Configuration;
using Microsoft.Extensions.Configuration;
using onetouch.AppContacts;
using Abp.Domain.Uow;

namespace onetouch.AppAdvertisements
{
    public class AppAdvertisementsAppService : onetouchAppServiceBase, IAppAdvertisementsAppService
    {
        private readonly IRepository<AppAdvertisement, long> _appAdvertisementRepository;
        private readonly IRepository<AppEntity, long> _lookup_appEntityRepository;
        private readonly IRepository<User, long> _lookup_userRepository;
        private readonly Helper _helper;
        private readonly DateTimeHelper _dateTimeHelper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly string _attachmentUrl;
        private readonly IRepository<AppContact, long> _lookup_appContactRepository;

        public AppAdvertisementsAppService(IRepository<AppAdvertisement, long> appAdvertisementRepository,  IRepository<AppEntity, long> appEntityRepository, DateTimeHelper dateTimeHelper,
            IRepository<AppEntity, long> lookup_appEntityRepository, IRepository<User, long> lookup_userRepository, Helper helper, IAppEntitiesAppService appEntitiesAppService,
            IAppConfigurationAccessor appConfigurationAccessor, IRepository<AppContact, long> lookup_appContactRepository)
        {
            _appAdvertisementRepository = appAdvertisementRepository;
            _lookup_appEntityRepository = lookup_appEntityRepository;
            _lookup_userRepository = lookup_userRepository;
            _helper = helper;
            _appEntitiesAppService = appEntitiesAppService;
            _appEntityRepository = appEntityRepository;
            _dateTimeHelper = dateTimeHelper;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _attachmentUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
            _lookup_appContactRepository = lookup_appContactRepository;
        }
        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements)]
        public async Task<PagedResultDto<GetAppAdvertisementForViewDto>> GetAll(GetAllAppAdvertisementsInput input)
        {
            var attBannerId = await _helper.SystemTables.GetAttachmentCategoryId("BANNER");
            var attImageId = await _helper.SystemTables.GetAttachmentCategoryId("PHOTO");
            var filteredAppAdvertisements = _appAdvertisementRepository.GetAll()
                        .Include(e => e.AppEntityFk).ThenInclude (x=> x.EntityAttachments)
                        .Include(e => e.UserFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.StartTime.Contains(input.Filter) || e.EndTime.Contains(input.Filter) || e.TimeZone.Contains(input.Filter) || e.PaymentMethod.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(input.MinTenantIdFilter != null, e => e.TenantId >= input.MinTenantIdFilter)
                        .WhereIf(input.MaxTenantIdFilter != null, e => e.TenantId <= input.MaxTenantIdFilter)
                        .WhereIf(input.MinStartDateFilter != null, e => e.StartDate >= input.MinStartDateFilter)
                        .WhereIf(input.MaxStartDateFilter != null, e => e.StartDate <= input.MaxStartDateFilter)
                        .WhereIf(input.MinEndDateFilter != null, e => e.EndDate >= input.MinEndDateFilter)
                        .WhereIf(input.MaxEndDateFilter != null, e => e.EndDate <= input.MaxEndDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.StartTimeFilter), e => e.StartTime == input.StartTimeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.EndTimeFilter), e => e.EndTime == input.EndTimeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TimeZoneFilter), e => e.TimeZone == input.TimeZoneFilter)
                        .WhereIf(input.PublishOnHomePageFilter.HasValue && input.PublishOnHomePageFilter > -1, e => (input.PublishOnHomePageFilter == 1 && e.PublishOnHomePage) || (input.PublishOnHomePageFilter == 0 && !e.PublishOnHomePage))
                        .WhereIf(input.PublishOnMarketLandingPageFilter.HasValue && input.PublishOnMarketLandingPageFilter > -1, e => (input.PublishOnMarketLandingPageFilter == 1 && e.PublishOnMarketLandingPage) || (input.PublishOnMarketLandingPageFilter == 0 && !e.PublishOnMarketLandingPage))
                        .WhereIf(input.MinApprovalDateTimeFilter != null, e => e.ApprovalDateTime >= input.MinApprovalDateTimeFilter)
                        .WhereIf(input.MaxApprovalDateTimeFilter != null, e => e.ApprovalDateTime <= input.MaxApprovalDateTimeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.PaymentMethodFilter), e => e.PaymentMethod == input.PaymentMethodFilter)
                        .WhereIf(input.MinInvoiceNumberFilter != null, e => e.InvoiceNumber >= input.MinInvoiceNumberFilter)
                        .WhereIf(input.MaxInvoiceNumberFilter != null, e => e.InvoiceNumber <= input.MaxInvoiceNumberFilter)
                        .WhereIf(input.MinNumberOfOccurencesFilter != null, e => e.NumberOfOccurences >= input.MinNumberOfOccurencesFilter)
                        .WhereIf(input.MaxNumberOfOccurencesFilter != null, e => e.NumberOfOccurences <= input.MaxNumberOfOccurencesFilter)
                        .WhereIf(input.MinPeriodOfViewFilter != null, e => e.PeriodOfView >= input.MinPeriodOfViewFilter)
                        .WhereIf(input.MaxPeriodOfViewFilter != null, e => e.PeriodOfView <= input.MaxPeriodOfViewFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppEntityNameFilter), e => e.AppEntityFk != null && e.AppEntityFk.Name == input.AppEntityNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UserNameFilter), e => e.UserFk != null && e.UserFk.Name == input.UserNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Url), e => e.Url.Contains(input.Url) );

            var pagedAndFilteredAppAdvertisements = filteredAppAdvertisements
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appAdvertisements = from o in pagedAndFilteredAppAdvertisements
                                    join o1 in _lookup_appEntityRepository.GetAll() on o.AppEntityId equals o1.Id into j1
                                    from s1 in j1.DefaultIfEmpty()

                                    join o2 in _lookup_userRepository.GetAll() on o.UserId equals o2.Id into j2
                                    from s2 in j2.DefaultIfEmpty()

                                    select new
                                    {
                                        
                                        o.Code,
                                        o.TenantId,
                                        o.Description,
                                        o.StartDate,
                                        o.EndDate,
                                        o.StartTime,
                                        o.EndTime,
                                        o.TimeZone,
                                        o.PublishOnHomePage,
                                        o.PublishOnMarketLandingPage,
                                        o.ApprovalDateTime,
                                        o.PaymentMethod,
                                        o.InvoiceNumber,
                                        o.NumberOfOccurences,
                                        o.PeriodOfView,
                                        o.Url,
                                        Id = o.Id,
                                        AppEntityName = s1 == null || s1.Name == null ? "" : s1.Name.ToString(),
                                        UserName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                                        BannerImage = 
                                         string.IsNullOrEmpty(o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attImageId).AttachmentFk.Attachment) ?
                                            ""
                                            : _attachmentUrl + 
                                            (o.TenantId != null && o.TenantId > 0 ? o.TenantId.ToString() : "-1" ) +
                                            "/" + o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attImageId).AttachmentFk.Attachment,
                                        MarketPlaceImage =
                                         string.IsNullOrEmpty(o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment) ?
                                            ""
                                            : _attachmentUrl +
                                            (o.TenantId != null && o.TenantId > 0 ? o.TenantId.ToString() : "-1") +
                                            "/" + o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment
                                    };
            var totalCount = await filteredAppAdvertisements.CountAsync();

            var dbList = await appAdvertisements.ToListAsync();
            var results = new List<GetAppAdvertisementForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAppAdvertisementForViewDto()
                {
                    AppAdvertisement = new AppAdvertisementDto
                    {

                        Code = o.Code,
                        TenantId = o.TenantId,
                        Description = o.Description,
                        StartDate = o.StartDate,
                        EndDate = o.EndDate,
                        StartTime = o.StartTime,
                        EndTime = o.EndTime,
                        TimeZone = o.TimeZone,
                        PublishOnHomePage = o.PublishOnHomePage,
                        PublishOnMarketLandingPage = o.PublishOnMarketLandingPage,
                        ApprovalDateTime = o.ApprovalDateTime,
                        PaymentMethod = o.PaymentMethod,
                        InvoiceNumber = o.InvoiceNumber,
                        NumberOfOccurences = o.NumberOfOccurences,
                        PeriodOfView = o.PeriodOfView,
                        Id = o.Id,
                        MarketPlaceImage = o.MarketPlaceImage,
                        HomeImage = o.BannerImage,
                        Url = o.Url
                    },
                    AppEntityName = o.AppEntityName,
                    UserName = o.UserName,
                    TenantName = TenantManager.GetById(int.Parse(o.TenantId.ToString ())).Name 
                };

                results.Add(res);
            }

            return new PagedResultDto<GetAppAdvertisementForViewDto>(
                totalCount,
                results
            );

        }
        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements)]
        public async Task<GetAppAdvertisementForViewDto> GetAppAdvertisementForView(long id)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appAdvertisement = await _appAdvertisementRepository.GetAsync(id);

                var output = new GetAppAdvertisementForViewDto { AppAdvertisement = ObjectMapper.Map<AppAdvertisementDto>(appAdvertisement) };

                if (output.AppAdvertisement.AppEntityId != null)
                {
                    var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("PHOTO");
                    var attBannerId = await _helper.SystemTables.GetAttachmentCategoryId("BANNER");
                    var _lookupAppEntity = await _lookup_appEntityRepository.FirstOrDefaultAsync((long)output.AppAdvertisement.AppEntityId);
                    output.AppEntityName = _lookupAppEntity?.Name?.ToString();
                    if (_lookupAppEntity?.EntityAttachments != null)
                    {

                        output.AppAdvertisement.HomeImage = string.IsNullOrEmpty(_lookupAppEntity?.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment) ?
                                                ""
                                                : _attachmentUrl + 
                                                (output.AppAdvertisement.TenantId != null && output.AppAdvertisement.TenantId > 0 ? output.AppAdvertisement.TenantId.ToString() : "-1") 
                                                + "/" + _lookupAppEntity?.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment;
                        output.AppAdvertisement.MarketPlaceImage = string.IsNullOrEmpty(_lookupAppEntity?.EntityAttachments.FirstOrDefault(x=> x.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment) ?
                                                ""
                                                : _attachmentUrl +
                                                (output.AppAdvertisement.TenantId != null && output.AppAdvertisement.TenantId > 0 ? output.AppAdvertisement.TenantId.ToString() : "-1")
                                                + "/" + _lookupAppEntity?.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment;
                    }
                }

                if (output.AppAdvertisement.UserId != null)
                {
                    var _lookupUser = await _lookup_userRepository.FirstOrDefaultAsync((long)output.AppAdvertisement.UserId);
                    output.UserName = _lookupUser?.Name?.ToString();
                }
                if (output.AppAdvertisement.TenantId != null)
                {
                    var _lookupTenant = TenantManager.GetById((int)output.AppAdvertisement.TenantId);
                    output.TenantName = _lookupTenant?.Name;
                }
                output.AppAdvertisement.Url = appAdvertisement.Url;

                return output;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements_Edit)]
        public async Task<GetAppAdvertisementForEditOutput> GetAppAdvertisementForEdit(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appAdvertisement = await _appAdvertisementRepository.FirstOrDefaultAsync(input.Id);
                var output = new GetAppAdvertisementForEditOutput { AppAdvertisement = ObjectMapper.Map<CreateOrEditAppAdvertisementDto>(appAdvertisement) };

                if (output.AppAdvertisement.AppEntityId != null)
                {
                    var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("PHOTO");
                    var _lookupAppEntity = await _lookup_appEntityRepository.GetAll()
                        .Where(x => x.Id == (long)output.AppAdvertisement.AppEntityId)
                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                        .FirstOrDefaultAsync();
                    output.AppEntityName = _lookupAppEntity?.Name?.ToString();
                    if (_lookupAppEntity.EntityAttachments != null)
                    {
                        var attObj = _lookupAppEntity.EntityAttachments;

                        if (attObj != null)
                        output.AppAdvertisement.Attachments = ObjectMapper.Map<List<AppEntityAttachmentDto>>(attObj);
                        foreach (var item in output.AppAdvertisement.Attachments)
                        {
                            item.Url = _attachmentUrl + (output.AppAdvertisement.TenantId != null && output.AppAdvertisement.TenantId > 0 ? output.AppAdvertisement.TenantId.ToString() : "-1")
                                        + "/" + item.FileName;
                        }
                    }
                }

                if (output.AppAdvertisement.UserId != null)
                {
                    var _lookupUser = await _lookup_userRepository.FirstOrDefaultAsync((long)output.AppAdvertisement.UserId);
                    output.UserName = _lookupUser?.Name?.ToString();
                }

                return output;
            }

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements_Edit, AppPermissions.Pages_Administration_AppAdvertisements_Create)]
        public async Task CreateOrEdit(CreateOrEditAppAdvertisementDto input)
        {
            if (input.Id == null)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements_Create)]
        protected virtual async Task Create(CreateOrEditAppAdvertisementDto input)
        {
            var adsObjectId = await _helper.SystemTables.GetObjectAdvertisementId();
            var partnerEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeAdvertisementId();
            AppEntityDto entity = new AppEntityDto();
            //ObjectMapper.Map(input, entity);
            entity.Id = 0;
            entity.ObjectId = adsObjectId;
            entity.EntityObjectTypeId = partnerEntityObjectTypeId;
            entity.Name = input.Code ;
            entity.Notes = input.Description;
            entity.Code = input.Code;
            entity.TenantId = (int)input.TenantId;
            if (entity?.EntityAttachments == null) entity.EntityAttachments = new List<AppEntityAttachmentDto>();
            if (input.Attachments != null && input.Attachments.Count() > 0)
            {
                entity.EntityAttachments = input.Attachments;
            }
            var appAdvertisement = ObjectMapper.Map<AppAdvertisement>(input);
            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
            appAdvertisement.AppEntityId = savedEntity;
         
            DateTime startDateTime = new DateTime(appAdvertisement.StartDate.Year, appAdvertisement.StartDate.Month,
                appAdvertisement.StartDate.Day, DateTime.Parse(appAdvertisement.StartTime).Hour, DateTime.Parse(appAdvertisement.StartTime).Minute,
                DateTime.Parse(appAdvertisement.StartTime).Second);
            appAdvertisement.UTCFromDateTime = _dateTimeHelper.GetUTCDatetimeValue(startDateTime, input.TimeZone); //TimeZoneInfo.ConvertTimeToUtc(startDateTime, timeZone);


            DateTime endDateTime = new DateTime(appAdvertisement.EndDate.Year, appAdvertisement.EndDate.Month,
               appAdvertisement.EndDate.Day, DateTime.Parse(appAdvertisement.EndTime ).Hour, DateTime.Parse(appAdvertisement.EndTime).Minute,
               DateTime.Parse(appAdvertisement.EndTime).Second);
            
            appAdvertisement.UTCToDateTime = _dateTimeHelper.GetUTCDatetimeValue(endDateTime, input.TimeZone);

            
            await _appAdvertisementRepository.InsertAsync(appAdvertisement);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements_Edit)]
        protected virtual async Task Update(CreateOrEditAppAdvertisementDto input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appAdvertisement = await _appAdvertisementRepository.FirstOrDefaultAsync((long)input.Id);
                ObjectMapper.Map(input, appAdvertisement);
                DateTime startDateTime = new DateTime(appAdvertisement.StartDate.Year, appAdvertisement.StartDate.Month,
                 appAdvertisement.StartDate.Day, DateTime.Parse(appAdvertisement.StartTime).Hour, DateTime.Parse(appAdvertisement.StartTime).Minute,
                 DateTime.Parse(appAdvertisement.StartTime).Second);
                appAdvertisement.UTCFromDateTime = _dateTimeHelper.GetUTCDatetimeValue(startDateTime, input.TimeZone); //TimeZoneInfo.ConvertTimeToUtc(startDateTime, timeZone);


                DateTime endDateTime = new DateTime(appAdvertisement.EndDate.Year, appAdvertisement.EndDate.Month,
                   appAdvertisement.EndDate.Day, DateTime.Parse(appAdvertisement.EndTime).Hour, DateTime.Parse(appAdvertisement.EndTime).Minute,
                   DateTime.Parse(appAdvertisement.EndTime).Second);

                appAdvertisement.UTCToDateTime = _dateTimeHelper.GetUTCDatetimeValue(endDateTime, input.TimeZone);


                await _appAdvertisementRepository.UpdateAsync(appAdvertisement);
                if (appAdvertisement.AppEntityId != 0)
                {
                    var adsObjectId = await _helper.SystemTables.GetObjectAdvertisementId();
                    var partnerEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeAdvertisementId();
                    AppEntityDto entity = new AppEntityDto();
                    //ObjectMapper.Map(input, entity);
                    entity.Id = appAdvertisement.AppEntityId;
                    entity.ObjectId = adsObjectId;
                    entity.EntityObjectTypeId = partnerEntityObjectTypeId;
                    entity.Name = input.Code;
                    entity.Code = input.Code;
                    entity.Notes = input.Description;
                    entity.TenantId = (int)input.TenantId;
                
                    if (entity?.EntityAttachments == null) entity.EntityAttachments = new List<AppEntityAttachmentDto>();
                    if (input.Attachments != null && input.Attachments.Count() > 0)
                    {
                        entity.EntityAttachments = input.Attachments;
                    }

                    var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
                }
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            AppAdvertisement  appAdvertisement = await _appAdvertisementRepository.FirstOrDefaultAsync(x => x.Id == input.Id);
            if (appAdvertisement != null)
            {
                await _appAdvertisementRepository.DeleteAsync(input.Id);
                var entity = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.Id == appAdvertisement.AppEntityId);
                if (entity != null)
                {
                   await _appEntityRepository.DeleteAsync(entity);
                }
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements)]
        public async Task<PagedResultDto<AppAdvertisementAppEntityLookupTableDto>> GetAllAppEntityForLookupTable(GetAllForLookupTableInput input)
        {
            var query = _lookup_appEntityRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => e.Name != null && e.Name.Contains(input.Filter)
               );

            var totalCount = await query.CountAsync();

            var appEntityList = await query
                .PageBy(input)
                .ToListAsync();

            var lookupTableDtoList = new List<AppAdvertisementAppEntityLookupTableDto>();
            foreach (var appEntity in appEntityList)
            {
                lookupTableDtoList.Add(new AppAdvertisementAppEntityLookupTableDto
                {
                    Id = appEntity.Id,
                    DisplayName = appEntity.Name?.ToString()
                });
            }

            return new PagedResultDto<AppAdvertisementAppEntityLookupTableDto>(
                totalCount,
                lookupTableDtoList
            );
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements)]
        public async Task<PagedResultDto<AppAdvertisementUserLookupTableDto>> GetAllUserForLookupTable(GetAllForLookupTableInput input)
        {
            var query = _lookup_userRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => e.Name != null && e.Name.Contains(input.Filter)
               );

            var totalCount = await query.CountAsync();

            var userList = await query
                .PageBy(input)
                .ToListAsync();

            var lookupTableDtoList = new List<AppAdvertisementUserLookupTableDto>();
            foreach (var user in userList)
            {
                lookupTableDtoList.Add(new AppAdvertisementUserLookupTableDto
                {
                    Id = user.Id,
                    DisplayName = user.Name?.ToString()
                });
            }

            return new PagedResultDto<AppAdvertisementUserLookupTableDto>(
                totalCount,
                lookupTableDtoList
            );
        }

        Task<PagedResultDto<AppAdvertisementAppEntityLookupTableDto>> IAppAdvertisementsAppService.GetAllAppEntityForLookupTable(Dtos.GetAllForLookupTableInput input)
        {
            throw new NotImplementedException();
        }

        Task<PagedResultDto<AppAdvertisementUserLookupTableDto>> IAppAdvertisementsAppService.GetAllUserForLookupTable(Dtos.GetAllForLookupTableInput input)
        {
            throw new NotImplementedException();
        }
        [AbpAllowAnonymous]
        public async Task<List<GetAppAdvertisementForViewDto>> GetCurrentPeriodAdvertisement(int topAdsInCurrentPeriod,bool? PublishOnHomePage,bool? PublishOnMarketLandingPage)
        {
             using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
               
                var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("PHOTO");
                var attBannerId = await _helper.SystemTables.GetAttachmentCategoryId("BANNER");
                var filteredAppAdvertisements = _appAdvertisementRepository.GetAll()
                        .Include(e => e.AppEntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x=>x.AttachmentFk)
                        .Include(e => e.UserFk)
                        .Where(x => DateTime.UtcNow >= x.UTCFromDateTime && DateTime.UtcNow <= x.UTCToDateTime && (x.PublishOnHomePage == PublishOnHomePage || x.PublishOnMarketLandingPage == PublishOnMarketLandingPage))
                        .Take (topAdsInCurrentPeriod);

                var pagedAndFilteredAppAdvertisements = filteredAppAdvertisements
                .OrderBy("id asc");
                

                var appAdvertisements = from o in pagedAndFilteredAppAdvertisements
                                        join o1 in _lookup_appEntityRepository.GetAll() on o.AppEntityId equals o1.Id into j1
                                        from s1 in j1.DefaultIfEmpty()

                                        join o2 in _lookup_userRepository.GetAll() on o.UserId equals o2.Id into j2
                                        from s2 in j2.DefaultIfEmpty()

                                        select new
                                        {

                                            o.Code,
                                            o.TenantId,
                                            o.Description,
                                            o.StartDate,
                                            o.EndDate,
                                            o.StartTime,
                                            o.EndTime,
                                            o.TimeZone,
                                            o.PublishOnMarketLandingPage,
                                            o.PublishOnHomePage,
                                            o.ApprovalDateTime,
                                            o.PaymentMethod,
                                            o.InvoiceNumber,
                                            o.NumberOfOccurences,
                                            o.PeriodOfView,
                                            o.Url,
                                            Id = o.Id,
                                            o.AppEntityId,
                                            AppEntityName = s1 == null || s1.Name == null ? "" : s1.Name.ToString(),
                                            UserName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                                            HomeImage = (bool)PublishOnHomePage && string.IsNullOrEmpty(o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment) ?
                                                ""
                                                : _attachmentUrl +
                                                (o.TenantId != null && o.TenantId > 0 ? o.TenantId.ToString() : "-1") +
                                                "/" + o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment,
                                            MarketPlaceImage = (bool)PublishOnMarketLandingPage && string.IsNullOrEmpty(o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment) ?
                                                ""
                                                : _attachmentUrl +
                                                (o.TenantId != null && o.TenantId > 0 ? o.TenantId.ToString() : "-1") +
                                                "/" + o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment
                                        };

                var totalCount = await filteredAppAdvertisements.CountAsync();

                var dbList = await appAdvertisements.ToListAsync();
                var results = new List<GetAppAdvertisementForViewDto>();
            
                foreach (var o in dbList)
                {
                    var res = new GetAppAdvertisementForViewDto()
                    {
                        AppAdvertisement = new AppAdvertisementDto
                        {

                            Code = o.Code,
                            TenantId = o.TenantId,
                            Description = o.Description,
                            StartDate = o.StartDate,
                            EndDate = o.EndDate,
                            StartTime = o.StartTime,
                            EndTime = o.EndTime,
                            TimeZone = o.TimeZone,
                            PublishOnHomePage = o.PublishOnHomePage,
                            PublishOnMarketLandingPage = o.PublishOnMarketLandingPage,
                            ApprovalDateTime = o.ApprovalDateTime,
                            PaymentMethod = o.PaymentMethod,
                            InvoiceNumber = o.InvoiceNumber,
                            NumberOfOccurences = o.NumberOfOccurences,
                            PeriodOfView = o.PeriodOfView,
                            AppEntityId = o.AppEntityId,
                            Id = o.Id,
                            HomeImage = o?.HomeImage,
                            MarketPlaceImage = o?.MarketPlaceImage,
                            Url = o?.Url
                        },
                        AppEntityName = o.AppEntityName,
                        UserName = o.UserName,
                        TenantName = TenantManager.GetById(int.Parse(o.TenantId.ToString())).Name
                    };
                    //MMT
                    var account = _lookup_appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == o.TenantId && x.IsProfileData && x.ParentId == null && x.PartnerId == null && x.AccountId == null);
                    if (account != null)
                    {
                        var publishAccount = _lookup_appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == null && x.IsProfileData == false&& x.ParentId == null && x.PartnerId == account.Id && x.AccountId == null);
                        if(publishAccount != null ) res.AccountId = publishAccount.Id;
                    }
                    //MMT
                    results.Add(res);
                }

                return results;
            }
            //Select Top(N) *from AppAdvertisement where Current Date Between(FromDate, ToDate)
        }
        
        [AbpAuthorize(AppPermissions.Pages_Administration_AppAdvertisements_Edit)]
        public async Task<PagedResultDto<GetAppAdvertisementForViewDto>> GetAllAdvertisementForUpdate()
        {

            var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("PHOTO");
            var attBannerId = await _helper.SystemTables.GetAttachmentCategoryId("BANNER");
            var filteredAppAdvertisements = _appAdvertisementRepository.GetAll()
                        .Include(e => e.AppEntityFk).ThenInclude(x => x.EntityAttachments)
                        .Include(e => e.UserFk)
                        .Where(x => x.TenantId == AbpSession.TenantId);

            var pagedAndFilteredAppAdvertisements = filteredAppAdvertisements
                .OrderBy("id asc")
                .PageBy(new PagedAndSortedResultRequestDto());

            var appAdvertisements = from o in pagedAndFilteredAppAdvertisements
                                    join o1 in _lookup_appEntityRepository.GetAll() on o.AppEntityId equals o1.Id into j1
                                    from s1 in j1.DefaultIfEmpty()

                                    join o2 in _lookup_userRepository.GetAll() on o.UserId equals o2.Id into j2
                                    from s2 in j2.DefaultIfEmpty()

                                    select new
                                    {

                                        o.Code,
                                        o.TenantId,
                                        o.Description,
                                        o.StartDate,
                                        o.EndDate,
                                        o.StartTime,
                                        o.EndTime,
                                        o.TimeZone,
                                        o.PublishOnMarketLandingPage,
                                        o.PublishOnHomePage,
                                        o.ApprovalDateTime,
                                        o.PaymentMethod,
                                        o.InvoiceNumber,
                                        o.NumberOfOccurences,
                                        o.PeriodOfView,
                                        o.Url,
                                        Id = o.Id,
                                        AppEntityName = s1 == null || s1.Name == null ? "" : s1.Name.ToString(),
                                        UserName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                                        HomeImage = string.IsNullOrEmpty(o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment) ?
                                                ""
                                                : _attachmentUrl +
                                                (o.TenantId != null && o.TenantId > 0 ? o.TenantId.ToString() : "-1") +
                                                "/" + o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment,
                                        MarketPlaceImage = string.IsNullOrEmpty(o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment) ?
                                                ""
                                                : _attachmentUrl +
                                                (o.TenantId != null && o.TenantId > 0 ? o.TenantId.ToString() : "-1") +
                                                "/" + o.AppEntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attBannerId).AttachmentFk.Attachment
                                    };

            var totalCount = await filteredAppAdvertisements.CountAsync();

            var dbList = await appAdvertisements.ToListAsync();
            var results = new List<GetAppAdvertisementForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAppAdvertisementForViewDto()
                {
                    AppAdvertisement = new AppAdvertisementDto
                    {

                        Code = o.Code,
                        TenantId = o.TenantId,
                        Description = o.Description,
                        StartDate = o.StartDate,
                        EndDate = o.EndDate,
                        StartTime = o.StartTime,
                        EndTime = o.EndTime,
                        TimeZone = o.TimeZone,
                        PublishOnHomePage = o.PublishOnHomePage,
                        PublishOnMarketLandingPage = o.PublishOnMarketLandingPage,
                        ApprovalDateTime = o.ApprovalDateTime,
                        PaymentMethod = o.PaymentMethod,
                        InvoiceNumber = o.InvoiceNumber,
                        NumberOfOccurences = o.NumberOfOccurences,
                        PeriodOfView = o.PeriodOfView,
                        Id = o.Id,
                        HomeImage = o.HomeImage,
                        MarketPlaceImage = o.MarketPlaceImage,
                        Url = o.Url,
                    },
                    AppEntityName = o.AppEntityName,
                    UserName = o.UserName
                };

                results.Add(res);
            }

            return new PagedResultDto<GetAppAdvertisementForViewDto>(
                totalCount,
                results
            );
        }
        public async Task<List<SelectItemDto>> GetTimeZonesList()
        {
            IReadOnlyCollection<TimeZoneInfo> zones = TimeZoneInfo.GetSystemTimeZones();

            List<SelectItemDto> result = new List<SelectItemDto>();
            foreach (var zone in zones)
            {
                result.Add(new SelectItemDto { Label = zone.DisplayName.ToString(), Value = zone.Id });
            }
            return result;
        }
       
    }

    }