using onetouch.SycApplications;
using onetouch.SycPlans;
using onetouch.SycServices;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SycPlanServices.Exporting;
using onetouch.SycPlanServices.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;

namespace onetouch.SycPlanServices
{
    [AbpAuthorize(AppPermissions.Pages_Administration_SycPlanServices)]
    public class SycPlanServicesAppService : onetouchAppServiceBase, ISycPlanServicesAppService
    {
        private readonly IRepository<SycPlanService> _sycPlanServiceRepository;
        private readonly ISycPlanServicesExcelExporter _sycPlanServicesExcelExporter;
        private readonly IRepository<SycApplication, int> _lookup_sycApplicationRepository;
        private readonly IRepository<SycPlan, int> _lookup_sycPlanRepository;
        private readonly IRepository<SycService, int> _lookup_sycServiceRepository;

        public SycPlanServicesAppService(IRepository<SycPlanService> sycPlanServiceRepository, ISycPlanServicesExcelExporter sycPlanServicesExcelExporter, IRepository<SycApplication, int> lookup_sycApplicationRepository, IRepository<SycPlan, int> lookup_sycPlanRepository, IRepository<SycService, int> lookup_sycServiceRepository)
        {
            _sycPlanServiceRepository = sycPlanServiceRepository;
            _sycPlanServicesExcelExporter = sycPlanServicesExcelExporter;
            _lookup_sycApplicationRepository = lookup_sycApplicationRepository;
            _lookup_sycPlanRepository = lookup_sycPlanRepository;
            _lookup_sycServiceRepository = lookup_sycServiceRepository;

        }

        public async Task<PagedResultDto<GetSycPlanServiceForViewDto>> GetAll(GetAllSycPlanServicesInput input)
        {

            var filteredSycPlanServices = _sycPlanServiceRepository.GetAll()
                        .Include(e => e.ApplicationFk)
                        .Include(e => e.PlanFk)
                        .Include(e => e.ServiceFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.UnitOfMeasure.Contains(input.Filter) || e.BillingFrequency.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasureFilter), e => e.UnitOfMeasure == input.UnitOfMeasureFilter)
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        .WhereIf(input.MinUnitsFilter != null, e => e.Units >= input.MinUnitsFilter)
                        .WhereIf(input.MaxUnitsFilter != null, e => e.Units <= input.MaxUnitsFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BillingFrequencyFilter), e => e.BillingFrequency == input.BillingFrequencyFilter)
                        .WhereIf(input.MinMinimumUnitsFilter != null, e => e.MinimumUnits >= input.MinMinimumUnitsFilter)
                        .WhereIf(input.MaxMinimumUnitsFilter != null, e => e.MinimumUnits <= input.MaxMinimumUnitsFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycApplicationNameFilter), e => e.ApplicationFk != null && e.ApplicationFk.Name == input.SycApplicationNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycPlanNameFilter), e => e.PlanFk != null && e.PlanFk.Name == input.SycPlanNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycServiceCodeFilter), e => e.ServiceFk != null && e.ServiceFk.Code == input.SycServiceCodeFilter);

            var pagedAndFilteredSycPlanServices = filteredSycPlanServices
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var sycPlanServices = from o in pagedAndFilteredSycPlanServices
                                  join o1 in _lookup_sycApplicationRepository.GetAll() on o.ApplicationId equals o1.Id into j1
                                  from s1 in j1.DefaultIfEmpty()

                                  join o2 in _lookup_sycPlanRepository.GetAll() on o.PlanId equals o2.Id into j2
                                  from s2 in j2.DefaultIfEmpty()

                                  join o3 in _lookup_sycServiceRepository.GetAll() on o.ServiceId equals o3.Id into j3
                                  from s3 in j3.DefaultIfEmpty()

                                  select new GetSycPlanServiceForViewDto()
                                  {
                                      SycPlanService = new SycPlanServiceDto
                                      {
                                          UnitOfMeasure = o.UnitOfMeasure,
                                          UnitPrice = o.UnitPrice,
                                          Units = o.Units,
                                          BillingFrequency = o.BillingFrequency,
                                          MinimumUnits = o.MinimumUnits,
                                          Id = o.Id
                                      },
                                      SycApplicationName = s1 == null || s1.Name == null ? "" : s1.Name.ToString(),
                                      SycPlanName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                                      SycServiceCode = s3 == null || s3.Code == null ? "" : s3.Code.ToString()
                                  };

            var totalCount = await filteredSycPlanServices.CountAsync();

            return new PagedResultDto<GetSycPlanServiceForViewDto>(
                totalCount,
                await sycPlanServices.ToListAsync()
            );
        }

        public async Task<GetSycPlanServiceForViewDto> GetSycPlanServiceForView(int id)
        {
            var sycPlanService = await _sycPlanServiceRepository.GetAsync(id);

            var output = new GetSycPlanServiceForViewDto { SycPlanService = ObjectMapper.Map<SycPlanServiceDto>(sycPlanService) };

            if (output.SycPlanService.ApplicationId != null)
            {
                var _lookupSycApplication = await _lookup_sycApplicationRepository.FirstOrDefaultAsync((int)output.SycPlanService.ApplicationId);
                output.SycApplicationName = _lookupSycApplication?.Name?.ToString();
            }

            if (output.SycPlanService.PlanId != null)
            {
                var _lookupSycPlan = await _lookup_sycPlanRepository.FirstOrDefaultAsync((int)output.SycPlanService.PlanId);
                output.SycPlanName = _lookupSycPlan?.Name?.ToString();
            }

            if (output.SycPlanService.ServiceId != null)
            {
                var _lookupSycService = await _lookup_sycServiceRepository.FirstOrDefaultAsync((int)output.SycPlanService.ServiceId);
                output.SycServiceCode = _lookupSycService?.Code?.ToString();
            }

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlanServices_Edit)]
        public async Task<GetSycPlanServiceForEditOutput> GetSycPlanServiceForEdit(EntityDto input)
        {
            var sycPlanService = await _sycPlanServiceRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetSycPlanServiceForEditOutput { SycPlanService = ObjectMapper.Map<CreateOrEditSycPlanServiceDto>(sycPlanService) };

            if (output.SycPlanService.ApplicationId != null)
            {
                var _lookupSycApplication = await _lookup_sycApplicationRepository.FirstOrDefaultAsync((int)output.SycPlanService.ApplicationId);
                output.SycApplicationName = _lookupSycApplication?.Name?.ToString();
            }

            if (output.SycPlanService.PlanId != null)
            {
                var _lookupSycPlan = await _lookup_sycPlanRepository.FirstOrDefaultAsync((int)output.SycPlanService.PlanId);
                output.SycPlanName = _lookupSycPlan?.Name?.ToString();
            }

            if (output.SycPlanService.ServiceId != null)
            {
                var _lookupSycService = await _lookup_sycServiceRepository.FirstOrDefaultAsync((int)output.SycPlanService.ServiceId);
                output.SycServiceCode = _lookupSycService?.Code?.ToString();
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycPlanServiceDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlanServices_Create)]
        protected virtual async Task Create(CreateOrEditSycPlanServiceDto input)
        {
            var sycPlanService = ObjectMapper.Map<SycPlanService>(input);

            await _sycPlanServiceRepository.InsertAsync(sycPlanService);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlanServices_Edit)]
        protected virtual async Task Update(CreateOrEditSycPlanServiceDto input)
        {
            var sycPlanService = await _sycPlanServiceRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, sycPlanService);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlanServices_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _sycPlanServiceRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetSycPlanServicesToExcel(GetAllSycPlanServicesForExcelInput input)
        {

            var filteredSycPlanServices = _sycPlanServiceRepository.GetAll()
                        .Include(e => e.ApplicationFk)
                        .Include(e => e.PlanFk)
                        .Include(e => e.ServiceFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.UnitOfMeasure.Contains(input.Filter) || e.BillingFrequency.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UnitOfMeasureFilter), e => e.UnitOfMeasure == input.UnitOfMeasureFilter)
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        .WhereIf(input.MinUnitsFilter != null, e => e.Units >= input.MinUnitsFilter)
                        .WhereIf(input.MaxUnitsFilter != null, e => e.Units <= input.MaxUnitsFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BillingFrequencyFilter), e => e.BillingFrequency == input.BillingFrequencyFilter)
                        .WhereIf(input.MinMinimumUnitsFilter != null, e => e.MinimumUnits >= input.MinMinimumUnitsFilter)
                        .WhereIf(input.MaxMinimumUnitsFilter != null, e => e.MinimumUnits <= input.MaxMinimumUnitsFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycApplicationNameFilter), e => e.ApplicationFk != null && e.ApplicationFk.Name == input.SycApplicationNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycPlanNameFilter), e => e.PlanFk != null && e.PlanFk.Name == input.SycPlanNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycServiceCodeFilter), e => e.ServiceFk != null && e.ServiceFk.Code == input.SycServiceCodeFilter);

            var query = (from o in filteredSycPlanServices
                         join o1 in _lookup_sycApplicationRepository.GetAll() on o.ApplicationId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         join o2 in _lookup_sycPlanRepository.GetAll() on o.PlanId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                         join o3 in _lookup_sycServiceRepository.GetAll() on o.ServiceId equals o3.Id into j3
                         from s3 in j3.DefaultIfEmpty()

                         select new GetSycPlanServiceForViewDto()
                         {
                             SycPlanService = new SycPlanServiceDto
                             {
                                 UnitOfMeasure = o.UnitOfMeasure,
                                 UnitPrice = o.UnitPrice,
                                 Units = o.Units,
                                 BillingFrequency = o.BillingFrequency,
                                 MinimumUnits = o.MinimumUnits,
                                 Id = o.Id
                             },
                             SycApplicationName = s1 == null || s1.Name == null ? "" : s1.Name.ToString(),
                             SycPlanName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                             SycServiceCode = s3 == null || s3.Code == null ? "" : s3.Code.ToString()
                         });

            var sycPlanServiceListDtos = await query.ToListAsync();

            return _sycPlanServicesExcelExporter.ExportToFile(sycPlanServiceListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlanServices)]
        public async Task<List<SycPlanServiceSycApplicationLookupTableDto>> GetAllSycApplicationForTableDropdown()
        {
            return await _lookup_sycApplicationRepository.GetAll()
                .Select(sycApplication => new SycPlanServiceSycApplicationLookupTableDto
                {
                    Id = sycApplication.Id,
                    DisplayName = sycApplication == null || sycApplication.Name == null ? "" : sycApplication.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlanServices)]
        public async Task<List<SycPlanServiceSycPlanLookupTableDto>> GetAllSycPlanForTableDropdown()
        {
            return await _lookup_sycPlanRepository.GetAll()
                .Select(sycPlan => new SycPlanServiceSycPlanLookupTableDto
                {
                    Id = sycPlan.Id,
                    DisplayName = sycPlan == null || sycPlan.Name == null ? "" : sycPlan.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycPlanServices)]
        public async Task<List<SycPlanServiceSycServiceLookupTableDto>> GetAllSycServiceForTableDropdown()
        {
            return await _lookup_sycServiceRepository.GetAll()
                .Select(sycService => new SycPlanServiceSycServiceLookupTableDto
                {
                    Id = sycService.Id,
                    DisplayName = sycService == null || sycService.Code == null ? "" : sycService.Code.ToString()
                }).ToListAsync();
        }

    }
}