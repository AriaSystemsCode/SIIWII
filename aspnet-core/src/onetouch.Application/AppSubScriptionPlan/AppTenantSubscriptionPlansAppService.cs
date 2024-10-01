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
using Microsoft.AspNetCore.Authorization;
using Abp.Domain.Uow;

namespace onetouch.AppSubScriptionPlan
{
    [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans)]
    public class AppTenantSubscriptionPlansAppService : onetouchAppServiceBase, IAppTenantSubscriptionPlansAppService
    {
        private readonly IRepository<AppTenantSubscriptionPlan, long> _appTenantSubscriptionPlanRepository;
        private readonly IAppTenantSubscriptionPlansExcelExporter _appTenantSubscriptionPlansExcelExporter;
        private readonly Helper _helper;
        public AppTenantSubscriptionPlansAppService(IRepository<AppTenantSubscriptionPlan, long> appTenantSubscriptionPlanRepository, 
            IAppTenantSubscriptionPlansExcelExporter appTenantSubscriptionPlansExcelExporter, Helper helper)
        {
            _appTenantSubscriptionPlanRepository = appTenantSubscriptionPlanRepository;
            _appTenantSubscriptionPlansExcelExporter = appTenantSubscriptionPlansExcelExporter;
            _helper = helper;
        }

        public async Task<PagedResultDto<GetAppTenantSubscriptionPlanForViewDto>> GetAll(GetAllAppTenantSubscriptionPlansInput input)
        {

            var filteredAppTenantSubscriptionPlans = _appTenantSubscriptionPlanRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.TenantName.Contains(input.Filter) || e.SubscriptionPlanCode.Contains(input.Filter) || e.BillingPeriod.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TenantNameFilter), e => e.TenantName == input.TenantNameFilter)
                        .WhereIf(input.MinAppSubscriptionHeaderIdFilter != null, e => e.AppSubscriptionPlanHeaderId >= input.MinAppSubscriptionHeaderIdFilter)
                        .WhereIf(input.MaxAppSubscriptionHeaderIdFilter != null, e => e.AppSubscriptionPlanHeaderId <= input.MaxAppSubscriptionHeaderIdFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SubscriptionPlanCodeFilter), e => e.SubscriptionPlanCode == input.SubscriptionPlanCodeFilter)
                        .WhereIf(input.MinCurrentPeriodStartDateFilter != null, e => e.CurrentPeriodStartDate >= input.MinCurrentPeriodStartDateFilter)
                        .WhereIf(input.MaxCurrentPeriodStartDateFilter != null, e => e.CurrentPeriodStartDate <= input.MaxCurrentPeriodStartDateFilter)
                        .WhereIf(input.MinCurrentPeriodEndDateFilter != null, e => e.CurrentPeriodEndDate >= input.MinCurrentPeriodEndDateFilter)
                        .WhereIf(input.MaxCurrentPeriodEndDateFilter != null, e => e.CurrentPeriodEndDate <= input.MaxCurrentPeriodEndDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BillingPeriodFilter), e => e.BillingPeriod == input.BillingPeriodFilter)
                        .WhereIf(input.AllowOverAgeFilter.HasValue && input.AllowOverAgeFilter > -1, e => (input.AllowOverAgeFilter == 1 && e.AllowOverAge) || (input.AllowOverAgeFilter == 0 && !e.AllowOverAge));

            var pagedAndFilteredAppTenantSubscriptionPlans = filteredAppTenantSubscriptionPlans
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appTenantSubscriptionPlans = from o in pagedAndFilteredAppTenantSubscriptionPlans
                                             select new
                                             {

                                                 o.TenantName,
                                                 o.AppSubscriptionPlanHeaderId,
                                                 o.SubscriptionPlanCode,
                                                 o.CurrentPeriodStartDate,
                                                 o.CurrentPeriodEndDate,
                                                 o.BillingPeriod,
                                                 o.AllowOverAge,
                                                 Id = o.Id
                                             };

            var totalCount = await filteredAppTenantSubscriptionPlans.CountAsync();

            var dbList = await appTenantSubscriptionPlans.ToListAsync();
            var results = new List<GetAppTenantSubscriptionPlanForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAppTenantSubscriptionPlanForViewDto()
                {
                    AppTenantSubscriptionPlan = new AppTenantSubscriptionPlanDto
                    {

                        TenantName = o.TenantName,
                        AppSubscriptionPlanHeaderId = o.AppSubscriptionPlanHeaderId,
                        SubscriptionPlanCode = o.SubscriptionPlanCode,
                        CurrentPeriodStartDate = o.CurrentPeriodStartDate,
                        CurrentPeriodEndDate = o.CurrentPeriodEndDate,
                        BillingPeriod = o.BillingPeriod,
                        AllowOverAge = o.AllowOverAge,
                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetAppTenantSubscriptionPlanForViewDto>(
                totalCount,
                results
            );

        }
        [AllowAnonymous]
        public async Task<long?> GetTenantSubscriptionPlanId(long tenantId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var tenantPlan = await _appTenantSubscriptionPlanRepository.GetAll()
                .Where(z => z.TenantId == tenantId && (z.CurrentPeriodStartDate <= DateTime.Now.Date && z.CurrentPeriodEndDate >= DateTime.Now.Date)).FirstOrDefaultAsync();
                if (tenantPlan != null)
                    return tenantPlan.AppSubscriptionPlanHeaderId;
                else
                    return null;

            }
        }
        public async Task<GetAppTenantSubscriptionPlanForViewDto> GetAppTenantSubscriptionPlanForView(long id)
        {
            var appTenantSubscriptionPlan = await _appTenantSubscriptionPlanRepository.GetAsync(id);

            var output = new GetAppTenantSubscriptionPlanForViewDto { AppTenantSubscriptionPlan = ObjectMapper.Map<AppTenantSubscriptionPlanDto>(appTenantSubscriptionPlan) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans_Edit)]
        public async Task<GetAppTenantSubscriptionPlanForEditOutput> GetAppTenantSubscriptionPlanForEdit(EntityDto<long> input)
        {
            var appTenantSubscriptionPlan = await _appTenantSubscriptionPlanRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppTenantSubscriptionPlanForEditOutput { AppTenantSubscriptionPlan = ObjectMapper.Map<CreateOrEditAppTenantSubscriptionPlanDto>(appTenantSubscriptionPlan) };

            return output;
        }
        //[AbpAuthorize(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans_Edit)]
        public async Task CreateOrEdit(CreateOrEditAppTenantSubscriptionPlanDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans_Create)]
        protected virtual async Task Create(CreateOrEditAppTenantSubscriptionPlanDto input)
        {
            var appTenantSubscriptionPlan = ObjectMapper.Map<AppTenantSubscriptionPlan>(input);
            var appSubscriptionPlanObjectId = await _helper.SystemTables.GetObjectStandardSubscriptionPlanId();
            appTenantSubscriptionPlan.ObjectId = appSubscriptionPlanObjectId;
            //var StatusId = input.EntityStatusCode == "ACTIVE" ? await _helper.SystemTables.GetEntityObjectStatusItemActive() : await _helper.SystemTables.GetEntityObjectStatusItemDraft();
            //appSubscriptionPlanHeader.EntityObjectStatusId = StatusId;
            var entitySubPlanObjectType = await _helper.SystemTables.GetObjectStandardSubscriptionPlan();
            appTenantSubscriptionPlan.EntityObjectTypeId = entitySubPlanObjectType.Id;
            appTenantSubscriptionPlan.EntityObjectTypeCode = entitySubPlanObjectType.Code;
            appTenantSubscriptionPlan.TenantId = null;
            appTenantSubscriptionPlan.Name = input.TenantName + " " + input.SubscriptionPlanCode;
            appTenantSubscriptionPlan.Code = input.TenantId.ToString() + " " + input.SubscriptionPlanCode;
            await _appTenantSubscriptionPlanRepository.InsertAsync(appTenantSubscriptionPlan);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans_Edit)]
        protected virtual async Task Update(CreateOrEditAppTenantSubscriptionPlanDto input)
        {
            var appTenantSubscriptionPlan = await _appTenantSubscriptionPlanRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, appTenantSubscriptionPlan);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _appTenantSubscriptionPlanRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppTenantSubscriptionPlansToExcel(GetAllAppTenantSubscriptionPlansForExcelInput input)
        {

            var filteredAppTenantSubscriptionPlans = _appTenantSubscriptionPlanRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.TenantName.Contains(input.Filter) || e.SubscriptionPlanCode.Contains(input.Filter) || e.BillingPeriod.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TenantNameFilter), e => e.TenantName == input.TenantNameFilter)
                        .WhereIf(input.MinAppSubscriptionHeaderIdFilter != null, e => e.AppSubscriptionPlanHeaderId >= input.MinAppSubscriptionHeaderIdFilter)
                        .WhereIf(input.MaxAppSubscriptionHeaderIdFilter != null, e => e.AppSubscriptionPlanHeaderId <= input.MaxAppSubscriptionHeaderIdFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SubscriptionPlanCodeFilter), e => e.SubscriptionPlanCode == input.SubscriptionPlanCodeFilter)
                        .WhereIf(input.MinCurrentPeriodStartDateFilter != null, e => e.CurrentPeriodStartDate >= input.MinCurrentPeriodStartDateFilter)
                        .WhereIf(input.MaxCurrentPeriodStartDateFilter != null, e => e.CurrentPeriodStartDate <= input.MaxCurrentPeriodStartDateFilter)
                        .WhereIf(input.MinCurrentPeriodEndDateFilter != null, e => e.CurrentPeriodEndDate >= input.MinCurrentPeriodEndDateFilter)
                        .WhereIf(input.MaxCurrentPeriodEndDateFilter != null, e => e.CurrentPeriodEndDate <= input.MaxCurrentPeriodEndDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BillingPeriodFilter), e => e.BillingPeriod == input.BillingPeriodFilter)
                        .WhereIf(input.AllowOverAgeFilter.HasValue && input.AllowOverAgeFilter > -1, e => (input.AllowOverAgeFilter == 1 && e.AllowOverAge) || (input.AllowOverAgeFilter == 0 && !e.AllowOverAge));

            var query = (from o in filteredAppTenantSubscriptionPlans
                         select new GetAppTenantSubscriptionPlanForViewDto()
                         {
                             AppTenantSubscriptionPlan = new AppTenantSubscriptionPlanDto
                             {
                                 TenantName = o.TenantName,
                                 AppSubscriptionPlanHeaderId = o.AppSubscriptionPlanHeaderId,
                                 SubscriptionPlanCode = o.SubscriptionPlanCode,
                                 CurrentPeriodStartDate = o.CurrentPeriodStartDate,
                                 CurrentPeriodEndDate = o.CurrentPeriodEndDate,
                                 BillingPeriod = o.BillingPeriod,
                                 AllowOverAge = o.AllowOverAge,
                                 Id = o.Id
                             }
                         });

            var appTenantSubscriptionPlanListDtos = await query.ToListAsync();

            return _appTenantSubscriptionPlansExcelExporter.ExportToFile(appTenantSubscriptionPlanListDtos);
        }

    }
}