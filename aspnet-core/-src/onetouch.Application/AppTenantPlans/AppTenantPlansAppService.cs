using onetouch.SycPlans;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppTenantPlans.Exporting;
using onetouch.AppTenantPlans.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;

namespace onetouch.AppTenantPlans
{
    [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantPlans)]
    public class AppTenantPlansAppService : onetouchAppServiceBase, IAppTenantPlansAppService
    {
        private readonly IRepository<AppTenantPlan> _appTenantPlanRepository;
        private readonly IAppTenantPlansExcelExporter _appTenantPlansExcelExporter;
        private readonly IRepository<SycPlan, int> _lookup_sycPlanRepository;

        public AppTenantPlansAppService(IRepository<AppTenantPlan> appTenantPlanRepository, IAppTenantPlansExcelExporter appTenantPlansExcelExporter, IRepository<SycPlan, int> lookup_sycPlanRepository)
        {
            _appTenantPlanRepository = appTenantPlanRepository;
            _appTenantPlansExcelExporter = appTenantPlansExcelExporter;
            _lookup_sycPlanRepository = lookup_sycPlanRepository;

        }

        public async Task<PagedResultDto<GetAppTenantPlanForViewDto>> GetAll(GetAllAppTenantPlansInput input)
        {

            var filteredAppTenantPlans = _appTenantPlanRepository.GetAll()
                        .Include(e => e.PlanFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false)
                        .WhereIf(input.MinAddDateFilter != null, e => e.AddDate >= input.MinAddDateFilter)
                        .WhereIf(input.MaxAddDateFilter != null, e => e.AddDate <= input.MaxAddDateFilter)
                        .WhereIf(input.MinEndDateFilter != null, e => e.EndDate >= input.MinEndDateFilter)
                        .WhereIf(input.MaxEndDateFilter != null, e => e.EndDate <= input.MaxEndDateFilter)
                        .WhereIf(input.MinStartDateFilter != null, e => e.StartDate >= input.MinStartDateFilter)
                        .WhereIf(input.MaxStartDateFilter != null, e => e.StartDate <= input.MaxStartDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycPlanNameFilter), e => e.PlanFk != null && e.PlanFk.Name == input.SycPlanNameFilter);

            var pagedAndFilteredAppTenantPlans = filteredAppTenantPlans
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appTenantPlans = from o in pagedAndFilteredAppTenantPlans
                                 join o1 in _lookup_sycPlanRepository.GetAll() on o.PlanId equals o1.Id into j1
                                 from s1 in j1.DefaultIfEmpty()

                                 select new GetAppTenantPlanForViewDto()
                                 {
                                     AppTenantPlan = new AppTenantPlanDto
                                     {
                                         AddDate = o.AddDate,
                                         EndDate = o.EndDate,
                                         StartDate = o.StartDate,
                                         Id = o.Id
                                     },
                                     SycPlanName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                                 };

            var totalCount = await filteredAppTenantPlans.CountAsync();

            return new PagedResultDto<GetAppTenantPlanForViewDto>(
                totalCount,
                await appTenantPlans.ToListAsync()
            );
        }

        public async Task<GetAppTenantPlanForViewDto> GetAppTenantPlanForView(int id)
        {
            var appTenantPlan = await _appTenantPlanRepository.GetAsync(id);

            var output = new GetAppTenantPlanForViewDto { AppTenantPlan = ObjectMapper.Map<AppTenantPlanDto>(appTenantPlan) };

            if (output.AppTenantPlan.PlanId != null)
            {
                var _lookupSycPlan = await _lookup_sycPlanRepository.FirstOrDefaultAsync((int)output.AppTenantPlan.PlanId);
                output.SycPlanName = _lookupSycPlan?.Name?.ToString();
            }

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantPlans_Edit)]
        public async Task<GetAppTenantPlanForEditOutput> GetAppTenantPlanForEdit(EntityDto input)
        {
            var appTenantPlan = await _appTenantPlanRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppTenantPlanForEditOutput { AppTenantPlan = ObjectMapper.Map<CreateOrEditAppTenantPlanDto>(appTenantPlan) };

            if (output.AppTenantPlan.PlanId != null)
            {
                var _lookupSycPlan = await _lookup_sycPlanRepository.FirstOrDefaultAsync((int)output.AppTenantPlan.PlanId);
                output.SycPlanName = _lookupSycPlan?.Name?.ToString();
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppTenantPlanDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantPlans_Create)]
        protected virtual async Task Create(CreateOrEditAppTenantPlanDto input)
        {
            var appTenantPlan = ObjectMapper.Map<AppTenantPlan>(input);

            if (AbpSession.TenantId != null)
            {
                appTenantPlan.TenantId = (int?)AbpSession.TenantId;
            }

            await _appTenantPlanRepository.InsertAsync(appTenantPlan);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantPlans_Edit)]
        protected virtual async Task Update(CreateOrEditAppTenantPlanDto input)
        {
            var appTenantPlan = await _appTenantPlanRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, appTenantPlan);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantPlans_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _appTenantPlanRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppTenantPlansToExcel(GetAllAppTenantPlansForExcelInput input)
        {

            var filteredAppTenantPlans = _appTenantPlanRepository.GetAll()
                        .Include(e => e.PlanFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false)
                        .WhereIf(input.MinAddDateFilter != null, e => e.AddDate >= input.MinAddDateFilter)
                        .WhereIf(input.MaxAddDateFilter != null, e => e.AddDate <= input.MaxAddDateFilter)
                        .WhereIf(input.MinEndDateFilter != null, e => e.EndDate >= input.MinEndDateFilter)
                        .WhereIf(input.MaxEndDateFilter != null, e => e.EndDate <= input.MaxEndDateFilter)
                        .WhereIf(input.MinStartDateFilter != null, e => e.StartDate >= input.MinStartDateFilter)
                        .WhereIf(input.MaxStartDateFilter != null, e => e.StartDate <= input.MaxStartDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycPlanNameFilter), e => e.PlanFk != null && e.PlanFk.Name == input.SycPlanNameFilter);

            var query = (from o in filteredAppTenantPlans
                         join o1 in _lookup_sycPlanRepository.GetAll() on o.PlanId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         select new GetAppTenantPlanForViewDto()
                         {
                             AppTenantPlan = new AppTenantPlanDto
                             {
                                 AddDate = o.AddDate,
                                 EndDate = o.EndDate,
                                 StartDate = o.StartDate,
                                 Id = o.Id
                             },
                             SycPlanName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                         });

            var appTenantPlanListDtos = await query.ToListAsync();

            return _appTenantPlansExcelExporter.ExportToFile(appTenantPlanListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantPlans)]
        public async Task<List<AppTenantPlanSycPlanLookupTableDto>> GetAllSycPlanForTableDropdown()
        {
            return await _lookup_sycPlanRepository.GetAll()
                .Select(sycPlan => new AppTenantPlanSycPlanLookupTableDto
                {
                    Id = sycPlan.Id,
                    DisplayName = sycPlan == null || sycPlan.Name == null ? "" : sycPlan.Name.ToString()
                }).ToListAsync();
        }

    }
}