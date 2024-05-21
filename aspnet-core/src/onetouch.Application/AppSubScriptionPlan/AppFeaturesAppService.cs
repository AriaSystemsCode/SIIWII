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

namespace onetouch.AppSubScriptionPlan
{
    [AbpAuthorize(AppPermissions.Pages_Administration_AppFeatures)]
    public class AppFeaturesAppService : onetouchAppServiceBase, IAppFeaturesAppService
    {
        private readonly IRepository<AppFeature, long> _appFeatureRepository;
        private readonly IAppFeaturesExcelExporter _appFeaturesExcelExporter;

        public AppFeaturesAppService(IRepository<AppFeature,long> appFeatureRepository, IAppFeaturesExcelExporter appFeaturesExcelExporter)
        {
            _appFeatureRepository = appFeatureRepository;
            _appFeaturesExcelExporter = appFeaturesExcelExporter;

        }

        public async Task<PagedResultDto<GetAppFeatureForViewDto>> GetAll(GetAllAppFeaturesInput input)
        {

            var filteredAppFeatures = _appFeatureRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.UnitOfMeasurementCode.Contains(input.Filter) || e.UnitOfMeasurementName.Contains(input.Filter) || e.FeaturePeriodLimit.Contains(input.Filter) || e.BillingCode.Contains(input.Filter))// || e.Category.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasurementCodeFilter), e => e.UnitOfMeasurementCode == input.UnitOfMeasurementCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasurementNameFilter), e => e.UnitOfMeasurementName == input.UnitOfMeasurementNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeaturePeriodLimitFilter), e => e.FeaturePeriodLimit == input.FeaturePeriodLimitFilter)
                        .WhereIf(input.BillableFilter.HasValue && input.BillableFilter > -1, e => (input.BillableFilter == 1 && e.Billable) || (input.BillableFilter == 0 && !e.Billable))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BillingCodeFilter), e => e.BillingCode == input.BillingCodeFilter)
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        //.WhereIf(!string.IsNullOrWhiteSpace(input.CategoryFilter), e => e.Category == input.CategoryFilter)
                        .WhereIf(input.TrackActivityFilter.HasValue && input.TrackActivityFilter > -1, e => (input.TrackActivityFilter == 1 && e.TrackActivity) || (input.TrackActivityFilter == 0 && !e.TrackActivity));

            var pagedAndFilteredAppFeatures = filteredAppFeatures
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appFeatures = from o in pagedAndFilteredAppFeatures
                              select new
                              {

                                  o.Code,
                                  o.Name,
                                  o.Description,
                                  o.UnitOfMeasurementCode,
                                  o.UnitOfMeasurementName,
                                  o.FeaturePeriodLimit,
                                  o.Billable,
                                  o.BillingCode,
                                  o.UnitPrice,
                                 // o.Category,
                                  o.TrackActivity,
                                  Id = o.Id
                              };

            var totalCount = await filteredAppFeatures.CountAsync();

            var dbList = await appFeatures.ToListAsync();
            var results = new List<GetAppFeatureForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAppFeatureForViewDto()
                {
                    AppFeature = new AppFeatureDto
                    {

                        Code = o.Code,
                        Name = o.Name,
                        Description = o.Description,
                        UnitOfMeasurementCode = o.UnitOfMeasurementCode,
                        UnitOfMeasurementName = o.UnitOfMeasurementName,
                        FeaturePeriodLimit = o.FeaturePeriodLimit,
                        Billable = o.Billable,
                        BillingCode = o.BillingCode,
                        UnitPrice = o.UnitPrice,
                       // Category = o.Category,
                        TrackActivity = o.TrackActivity,
                        Id = int.Parse(o.Id.ToString()),
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetAppFeatureForViewDto>(
                totalCount,
                results
            );

        }

        public async Task<GetAppFeatureForViewDto> GetAppFeatureForView(int id)
        {
            var appFeature = await _appFeatureRepository.GetAsync(id);

            var output = new GetAppFeatureForViewDto { AppFeature = ObjectMapper.Map<AppFeatureDto>(appFeature) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppFeatures_Edit)]
        public async Task<GetAppFeatureForEditOutput> GetAppFeatureForEdit(EntityDto input)
        {
            var appFeature = await _appFeatureRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppFeatureForEditOutput { AppFeature = ObjectMapper.Map<CreateOrEditAppFeatureDto>(appFeature) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppFeatureDto input)
        {
            if (input.Id == null || input.Id == 0)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppFeatures_Create)]
        protected virtual async Task Create(CreateOrEditAppFeatureDto input)
        {
            var appFeature = ObjectMapper.Map<AppFeature>(input);

            await _appFeatureRepository.InsertAsync(appFeature);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppFeatures_Edit)]
        protected virtual async Task Update(CreateOrEditAppFeatureDto input)
        {
            var appFeature = await _appFeatureRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, appFeature);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppFeatures_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _appFeatureRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppFeaturesToExcel(GetAllAppFeaturesForExcelInput input)
        {

            var filteredAppFeatures = _appFeatureRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.UnitOfMeasurementCode.Contains(input.Filter) || e.UnitOfMeasurementName.Contains(input.Filter) || e.FeaturePeriodLimit.Contains(input.Filter) || e.BillingCode.Contains(input.Filter) )//|| e.Category.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasurementCodeFilter), e => e.UnitOfMeasurementCode == input.UnitOfMeasurementCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasurementNameFilter), e => e.UnitOfMeasurementName == input.UnitOfMeasurementNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeaturePeriodLimitFilter), e => e.FeaturePeriodLimit == input.FeaturePeriodLimitFilter)
                        .WhereIf(input.BillableFilter.HasValue && input.BillableFilter > -1, e => (input.BillableFilter == 1 && e.Billable) || (input.BillableFilter == 0 && !e.Billable))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BillingCodeFilter), e => e.BillingCode == input.BillingCodeFilter)
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        //.WhereIf(!string.IsNullOrWhiteSpace(input.CategoryFilter), e => e.Category == input.CategoryFilter)
                        .WhereIf(input.TrackActivityFilter.HasValue && input.TrackActivityFilter > -1, e => (input.TrackActivityFilter == 1 && e.TrackActivity) || (input.TrackActivityFilter == 0 && !e.TrackActivity));

            var query = (from o in filteredAppFeatures
                         select new GetAppFeatureForViewDto()
                         {
                             AppFeature = new AppFeatureDto
                             {
                                 Code = o.Code,
                                 Name = o.Name,
                                 Description = o.Description,
                                 UnitOfMeasurementCode = o.UnitOfMeasurementCode,
                                 UnitOfMeasurementName = o.UnitOfMeasurementName,
                                 FeaturePeriodLimit = o.FeaturePeriodLimit,
                                 Billable = o.Billable,
                                 BillingCode = o.BillingCode,
                                 UnitPrice = o.UnitPrice,
                                // Category = o.Category,
                                 TrackActivity = o.TrackActivity,
                                 Id = int.Parse( o.Id.ToString())
                             }
                         });

            var appFeatureListDtos = await query.ToListAsync();

            return _appFeaturesExcelExporter.ExportToFile(appFeatureListDtos);
        }

    }
}