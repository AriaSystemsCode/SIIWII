using onetouch.AppSubScriptionPlan;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppSubScriptionPlan.Exporting;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;
using onetouch.Helpers;

namespace onetouch.AppSubScriptionPlan
{
    [AbpAuthorize(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails)]
    public class AppSubscriptionPlanDetailsAppService : onetouchAppServiceBase, IAppSubscriptionPlanDetailsAppService
    {
        private readonly IRepository<AppSubscriptionPlanDetail, long> _appSubscriptionPlanDetailRepository;
        private readonly IAppSubscriptionPlanDetailsExcelExporter _appSubscriptionPlanDetailsExcelExporter;
        private readonly IRepository<AppSubscriptionPlanHeader, long> _lookup_appSubscriptionPlanHeaderRepository;
        private readonly Helper _helper;
        public AppSubscriptionPlanDetailsAppService(IRepository<AppSubscriptionPlanDetail, long> appSubscriptionPlanDetailRepository
            , IAppSubscriptionPlanDetailsExcelExporter appSubscriptionPlanDetailsExcelExporter, IRepository<AppSubscriptionPlanHeader, long> lookup_appSubscriptionPlanHeaderRepository, Helper helper)
        {
            _appSubscriptionPlanDetailRepository = appSubscriptionPlanDetailRepository;
            _appSubscriptionPlanDetailsExcelExporter = appSubscriptionPlanDetailsExcelExporter;
            _lookup_appSubscriptionPlanHeaderRepository = lookup_appSubscriptionPlanHeaderRepository;
            _helper = helper;
        }

        public async Task<PagedResultDto<GetAppSubscriptionPlanDetailForViewDto>> GetAll(GetAllAppSubscriptionPlanDetailsInput input)
        {

            var filteredAppSubscriptionPlanDetails = _appSubscriptionPlanDetailRepository.GetAll()
                        .Include(e => e.AppSubscriptionPlanHeaderFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.FeatureCode.Contains(input.Filter) || e.FeatureName.Contains(input.Filter) || e.Availability.Contains(input.Filter) || e.FeaturePeriodLimit.Contains(input.Filter) || e.Category.Contains(input.Filter) || e.FeatureDescription.Contains(input.Filter) || e.FeatureStatus.Contains(input.Filter) || e.UnitOfMeasurementName.Contains(input.Filter) || e.UnitOfMeasurmentCode.Contains(input.Filter) || e.FeatureBillingCode.Contains(input.Filter) || e.FeatureCategory.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureCodeFilter), e => e.FeatureCode == input.FeatureCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureNameFilter), e => e.FeatureName == input.FeatureNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AvailabilityFilter), e => e.Availability == input.AvailabilityFilter)
                        .WhereIf(input.MinFeatureLimitFilter != null, e => e.FeatureLimit >= input.MinFeatureLimitFilter)
                        .WhereIf(input.MaxFeatureLimitFilter != null, e => e.FeatureLimit <= input.MaxFeatureLimitFilter)
                        .WhereIf(input.RollOverFilter.HasValue && input.RollOverFilter > -1, e => (input.RollOverFilter == 1 && e.RollOver) || (input.RollOverFilter == 0 && !e.RollOver))
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeaturePeriodLimitFilter), e => e.FeaturePeriodLimit == input.FeaturePeriodLimitFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CategoryFilter), e => e.Category == input.CategoryFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureDescriptionFilter), e => e.FeatureDescription == input.FeatureDescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureStatusFilter), e => e.FeatureStatus == input.FeatureStatusFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasurementNameFilter), e => e.UnitOfMeasurementName == input.UnitOfMeasurementNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasurmentCodeFilter), e => e.UnitOfMeasurmentCode == input.UnitOfMeasurmentCodeFilter)
                        .WhereIf(input.IsFeatureBillableFilter.HasValue && input.IsFeatureBillableFilter > -1, e => (input.IsFeatureBillableFilter == 1 && e.IsFeatureBillable) || (input.IsFeatureBillableFilter == 0 && !e.IsFeatureBillable))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureBillingCodeFilter), e => e.FeatureBillingCode == input.FeatureBillingCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureCategoryFilter), e => e.FeatureCategory == input.FeatureCategoryFilter)
                        .WhereIf(input.TrackactivityFilter.HasValue && input.TrackactivityFilter > -1, e => (input.TrackactivityFilter == 1 && e.Trackactivity) || (input.TrackactivityFilter == 0 && !e.Trackactivity))
                        //.WhereIf(!string.IsNullOrWhiteSpace(input.AppSubscriptionPlanHeaderFilter), e => e.AppSubscriptionPlanHeaderFk != null && e..AppSubscriptionPlanHeaderFk. == input.AppSubscriptionPlanHeaderFilter)
                        .WhereIf(input.AppSubscriptionPlanHeaderIdFilter.HasValue, e => false || e.AppSubscriptionPlanHeaderId == input.AppSubscriptionPlanHeaderIdFilter.Value);

            var pagedAndFilteredAppSubscriptionPlanDetails = filteredAppSubscriptionPlanDetails
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appSubscriptionPlanDetails = from o in pagedAndFilteredAppSubscriptionPlanDetails
                                             join o1 in _lookup_appSubscriptionPlanHeaderRepository.GetAll() on o.AppSubscriptionPlanHeaderId equals o1.Id into j1
                                             from s1 in j1.DefaultIfEmpty()

                                             select new
                                             {

                                                 o.FeatureCode,
                                                 o.FeatureName,
                                                 o.Availability,
                                                 o.FeatureLimit,
                                                 o.RollOver,
                                                 o.UnitPrice,
                                                 o.FeaturePeriodLimit,
                                                 o.Category,
                                                 o.FeatureDescription,
                                                 o.FeatureStatus,
                                                 o.UnitOfMeasurementName,
                                                 o.UnitOfMeasurmentCode,
                                                 o.IsFeatureBillable,
                                                 o.FeatureBillingCode,
                                                 o.FeatureCategory,
                                                 o.Trackactivity,
                                                 Id = o.Id,
                                                 AppSubscriptionPlanHeader = (s1 == null ? 0 : s1.Id)
                                             };

            var totalCount = await filteredAppSubscriptionPlanDetails.CountAsync();

            var dbList = await appSubscriptionPlanDetails.ToListAsync();
            var results = new List<GetAppSubscriptionPlanDetailForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAppSubscriptionPlanDetailForViewDto()
                {
                    AppSubscriptionPlanDetail = new AppSubscriptionPlanDetailDto
                    {

                        FeatureCode = o.FeatureCode,
                        FeatureName = o.FeatureName,
                        Availability = o.Availability,
                        FeatureLimit = o.FeatureLimit,
                        RollOver = o.RollOver,
                        UnitPrice = o.UnitPrice,
                        FeaturePeriodLimit = o.FeaturePeriodLimit,
                        Category = o.Category,
                        FeatureDescription = o.FeatureDescription,
                        FeatureStatus = o.FeatureStatus,
                        UnitOfMeasurementName = o.UnitOfMeasurementName,
                        UnitOfMeasurmentCode = o.UnitOfMeasurmentCode,
                        IsFeatureBillable = o.IsFeatureBillable,
                        FeatureBillingCode = o.FeatureBillingCode,
                        FeatureCategory = o.FeatureCategory,
                        Trackactivity = o.Trackactivity,
                        Id = o.Id,
                    },
                    AppSubscriptionPlanHeader = o.AppSubscriptionPlanHeader.ToString()
                };

                results.Add(res);
            }

            return new PagedResultDto<GetAppSubscriptionPlanDetailForViewDto>(
                totalCount,
                results
            );

        }

        public async Task<GetAppSubscriptionPlanDetailForViewDto> GetAppSubscriptionPlanDetailForView(long id)
        {
            var appSubscriptionPlanDetail = await _appSubscriptionPlanDetailRepository.GetAsync(id);

            var output = new GetAppSubscriptionPlanDetailForViewDto { AppSubscriptionPlanDetail = ObjectMapper.Map<AppSubscriptionPlanDetailDto>(appSubscriptionPlanDetail) };

            if (output.AppSubscriptionPlanDetail.AppSubscriptionPlanHeaderId != null)
            {
                var _lookupAppSubscriptionPlanHeader = await _lookup_appSubscriptionPlanHeaderRepository.FirstOrDefaultAsync((long)output.AppSubscriptionPlanDetail.AppSubscriptionPlanHeaderId);
                output.AppSubscriptionPlanHeader = _lookupAppSubscriptionPlanHeader?.Code.ToString();
            }

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails_Edit)]
        public async Task<GetAppSubscriptionPlanDetailForEditOutput> GetAppSubscriptionPlanDetailForEdit(EntityDto<long> input)
        {
            var appSubscriptionPlanDetail = await _appSubscriptionPlanDetailRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppSubscriptionPlanDetailForEditOutput { AppSubscriptionPlanDetail = ObjectMapper.Map<CreateOrEditAppSubscriptionPlanDetailDto>(appSubscriptionPlanDetail) };

            if (output.AppSubscriptionPlanDetail.AppSubscriptionPlanHeaderId != null)
            {
                var _lookupAppSubscriptionPlanHeader = await _lookup_appSubscriptionPlanHeaderRepository.FirstOrDefaultAsync((long)output.AppSubscriptionPlanDetail.AppSubscriptionPlanHeaderId);
                output.AppSubscriptionPlanHeader = _lookupAppSubscriptionPlanHeader?.Code.ToString();
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppSubscriptionPlanDetailDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails_Create)]
        protected virtual async Task Create(CreateOrEditAppSubscriptionPlanDetailDto input)
        {
            var appSubscriptionPlanDetail = ObjectMapper.Map<AppSubscriptionPlanDetail>(input);
            var appSubscriptionPlanObjectId = await _helper.SystemTables.GetObjectStandardSubscriptionPlanId();
            appSubscriptionPlanDetail.ObjectId = appSubscriptionPlanObjectId;
            var StatusId = input.EntityStatusCode == "ACTIVE" ? await _helper.SystemTables.GetEntityObjectStatusItemActive() : await _helper.SystemTables.GetEntityObjectStatusItemDraft();
            appSubscriptionPlanDetail.EntityObjectStatusId = StatusId;
            var entitySubPlanObjectType = await _helper.SystemTables.GetObjectStandardSubscriptionPlan();
            appSubscriptionPlanDetail.EntityObjectTypeId = entitySubPlanObjectType.Id;
            appSubscriptionPlanDetail.EntityObjectTypeCode = entitySubPlanObjectType.Code;
            appSubscriptionPlanDetail.TenantId = null;
            appSubscriptionPlanDetail.Code = input.FeatureCode;
            appSubscriptionPlanDetail.Name = input.FeatureName;
            await _appSubscriptionPlanDetailRepository.InsertAsync(appSubscriptionPlanDetail);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails_Edit)]
        protected virtual async Task Update(CreateOrEditAppSubscriptionPlanDetailDto input)
        {
            var appSubscriptionPlanDetail = await _appSubscriptionPlanDetailRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, appSubscriptionPlanDetail);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _appSubscriptionPlanDetailRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppSubscriptionPlanDetailsToExcel(GetAllAppSubscriptionPlanDetailsForExcelInput input)
        {

            var filteredAppSubscriptionPlanDetails = _appSubscriptionPlanDetailRepository.GetAll()
                        .Include(e => e.AppSubscriptionPlanHeaderFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.FeatureCode.Contains(input.Filter) || e.FeatureName.Contains(input.Filter) || e.Availability.Contains(input.Filter) || e.FeaturePeriodLimit.Contains(input.Filter) || e.Category.Contains(input.Filter) || e.FeatureDescription.Contains(input.Filter) || e.FeatureStatus.Contains(input.Filter) || e.UnitOfMeasurementName.Contains(input.Filter) || e.UnitOfMeasurmentCode.Contains(input.Filter) || e.FeatureBillingCode.Contains(input.Filter) || e.FeatureCategory.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureCodeFilter), e => e.FeatureCode == input.FeatureCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureNameFilter), e => e.FeatureName == input.FeatureNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AvailabilityFilter), e => e.Availability == input.AvailabilityFilter)
                        .WhereIf(input.MinFeatureLimitFilter != null, e => e.FeatureLimit >= input.MinFeatureLimitFilter)
                        .WhereIf(input.MaxFeatureLimitFilter != null, e => e.FeatureLimit <= input.MaxFeatureLimitFilter)
                        .WhereIf(input.RollOverFilter.HasValue && input.RollOverFilter > -1, e => (input.RollOverFilter == 1 && e.RollOver) || (input.RollOverFilter == 0 && !e.RollOver))
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeaturePeriodLimitFilter), e => e.FeaturePeriodLimit == input.FeaturePeriodLimitFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CategoryFilter), e => e.Category == input.CategoryFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureDescriptionFilter), e => e.FeatureDescription == input.FeatureDescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureStatusFilter), e => e.FeatureStatus == input.FeatureStatusFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasurementNameFilter), e => e.UnitOfMeasurementName == input.UnitOfMeasurementNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasurmentCodeFilter), e => e.UnitOfMeasurmentCode == input.UnitOfMeasurmentCodeFilter)
                        .WhereIf(input.IsFeatureBillableFilter.HasValue && input.IsFeatureBillableFilter > -1, e => (input.IsFeatureBillableFilter == 1 && e.IsFeatureBillable) || (input.IsFeatureBillableFilter == 0 && !e.IsFeatureBillable))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureBillingCodeFilter), e => e.FeatureBillingCode == input.FeatureBillingCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureCategoryFilter), e => e.FeatureCategory == input.FeatureCategoryFilter)
                        .WhereIf(input.TrackactivityFilter.HasValue && input.TrackactivityFilter > -1, e => (input.TrackactivityFilter == 1 && e.Trackactivity) || (input.TrackactivityFilter == 0 && !e.Trackactivity));
                        //.WhereIf(!string.IsNullOrWhiteSpace(input.AppSubscriptionPlanHeaderFilter), e => e.AppSubscriptionPlanHeaderFk != null && e.AppSubscriptionPlanHeaderFk. == input.AppSubscriptionPlanHeaderFilter);

            var query = (from o in filteredAppSubscriptionPlanDetails
                         join o1 in _lookup_appSubscriptionPlanHeaderRepository.GetAll() on o.AppSubscriptionPlanHeaderId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         select new GetAppSubscriptionPlanDetailForViewDto()
                         {
                             AppSubscriptionPlanDetail = new AppSubscriptionPlanDetailDto
                             {
                                 FeatureCode = o.FeatureCode,
                                 FeatureName = o.FeatureName,
                                 Availability = o.Availability,
                                 FeatureLimit = o.FeatureLimit,
                                 RollOver = o.RollOver,
                                 UnitPrice = o.UnitPrice,
                                 FeaturePeriodLimit = o.FeaturePeriodLimit,
                                 Category = o.Category,
                                 FeatureDescription = o.FeatureDescription,
                                 FeatureStatus = o.FeatureStatus,
                                 UnitOfMeasurementName = o.UnitOfMeasurementName,
                                 UnitOfMeasurmentCode = o.UnitOfMeasurmentCode,
                                 IsFeatureBillable = o.IsFeatureBillable,
                                 FeatureBillingCode = o.FeatureBillingCode,
                                 FeatureCategory = o.FeatureCategory,
                                 Trackactivity = o.Trackactivity,
                                 Id = o.Id
                             },
                             AppSubscriptionPlanHeader = s1 == null || s1 == null ? "" : s1.ToString()
                         });

            var appSubscriptionPlanDetailListDtos = await query.ToListAsync();

            return _appSubscriptionPlanDetailsExcelExporter.ExportToFile(appSubscriptionPlanDetailListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails)]
        public async Task<PagedResultDto<AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableDto>> GetAllAppSubscriptionPlanHeaderForLookupTable(GetAllForLookupTableInput input)
        {
            var query = _lookup_appSubscriptionPlanHeaderRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => (e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter)));

            var totalCount = await query.CountAsync();

            var appSubscriptionPlanHeaderList = await query
                .PageBy(input)
                .ToListAsync();

            var lookupTableDtoList = new List<AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableDto>();
            foreach (var appSubscriptionPlanHeader in appSubscriptionPlanHeaderList)
            {
                lookupTableDtoList.Add(new AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableDto
                {
                    Id = appSubscriptionPlanHeader.Id,
                    DisplayName = appSubscriptionPlanHeader.Name.ToString()
                });
            }

            return new PagedResultDto<AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableDto>(
                totalCount,
                lookupTableDtoList
            );
        }

    }
}