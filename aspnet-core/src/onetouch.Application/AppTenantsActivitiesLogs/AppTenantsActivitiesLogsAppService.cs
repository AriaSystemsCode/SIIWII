using onetouch.SycServices;
using onetouch.SycApplications;
using onetouch.AppTransactions;
using onetouch.SycPlans;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppTenantsActivitiesLogs.Exporting;
using onetouch.AppTenantsActivitiesLogs.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.MultiTenancy;
using onetouch.AppSubScriptionPlan;

namespace onetouch.AppTenantsActivitiesLogs
{
    [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs)]
    public class AppTenantsActivitiesLogsAppService : onetouchAppServiceBase, IAppTenantsActivitiesLogsAppService
    {
        private readonly IRepository<oldAppTenantsActivitiesLog> _appTenantsActivitiesLogRepository;
        private readonly IAppTenantsActivitiesLogsExcelExporter _appTenantsActivitiesLogsExcelExporter;
        private readonly IRepository<SycService, int> _lookup_sycServiceRepository;
        private readonly IRepository<SycApplication, int> _lookup_sycApplicationRepository;
        private readonly IRepository<AppTransaction, int> _lookup_appTransactionRepository;
        private readonly IRepository<SycPlan, int> _lookup_sycPlanRepository;
        private readonly IRepository<Tenant, int> _lookup_TenantRepository;

        public AppTenantsActivitiesLogsAppService(IRepository<oldAppTenantsActivitiesLog> appTenantsActivitiesLogRepository, IAppTenantsActivitiesLogsExcelExporter appTenantsActivitiesLogsExcelExporter, IRepository<SycService, int> lookup_sycServiceRepository, IRepository<SycApplication, int> lookup_sycApplicationRepository, IRepository<AppTransaction, int> lookup_appTransactionRepository, IRepository<SycPlan, int> lookup_sycPlanRepository, IRepository<Tenant, int> lookup_TenantRepository)
        {
            _appTenantsActivitiesLogRepository = appTenantsActivitiesLogRepository;
            _appTenantsActivitiesLogsExcelExporter = appTenantsActivitiesLogsExcelExporter;
            _lookup_sycServiceRepository = lookup_sycServiceRepository;
            _lookup_sycApplicationRepository = lookup_sycApplicationRepository;
            _lookup_appTransactionRepository = lookup_appTransactionRepository;
            _lookup_sycPlanRepository = lookup_sycPlanRepository;
            _lookup_TenantRepository = lookup_TenantRepository;

        }

        public async Task<PagedResultDto<GetAppTenantsActivitiesLogForViewDto>> GetAll(GetAllAppTenantsActivitiesLogsInput input)
        {

            var filteredAppTenantsActivitiesLogs = _appTenantsActivitiesLogRepository.GetAll()
                        .Include(e => e.ServiceFk)
                        .Include(e => e.ApplicationFk)
                        .Include(e => e.TransactionFk)
                        .Include(e => e.PlanFk)
                        .Include(e => e.TenantFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.TransactionFk.Id.ToString() == input.Filter || e.TransactionFk.Code.Contains(input.Filter) || e.ServiceFk.Id.ToString()== input.Filter || e.ServiceFk.Code.Contains(input.Filter) || e.TenantFk.Id.ToString() == input.Filter || e.TenantFk.TenancyName.Contains(input.Filter))
                        .WhereIf(input.MinActivityDateFilter != null, e => e.ActivityDate >= input.MinActivityDateFilter)
                        .WhereIf(input.MaxActivityDateFilter != null, e => e.ActivityDate <= input.MaxActivityDateFilter)
                        .WhereIf(input.MinUnitsFilter != null, e => e.Units >= input.MinUnitsFilter)
                        .WhereIf(input.MaxUnitsFilter != null, e => e.Units <= input.MaxUnitsFilter)
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        .WhereIf(input.MinAmountFilter != null, e => e.Amount >= input.MinAmountFilter)
                        .WhereIf(input.MaxAmountFilter != null, e => e.Amount <= input.MaxAmountFilter)
                        .WhereIf(input.BilledFilter.HasValue && input.BilledFilter > -1, e => (input.BilledFilter == 1 && e.Billed) || (input.BilledFilter == 0 && !e.Billed))
                        .WhereIf(input.IsManualFilter.HasValue && input.IsManualFilter > -1, e => (input.IsManualFilter == 1 && e.IsManual) || (input.IsManualFilter == 0 && !e.IsManual))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.InvoiceNumberFilter), e => e.InvoiceNumber == input.InvoiceNumberFilter)
                        .WhereIf(input.MinInvoiceDateFilter != null, e => e.InvoiceDate >= input.MinInvoiceDateFilter)
                        .WhereIf(input.MaxInvoiceDateFilter != null, e => e.InvoiceDate <= input.MaxInvoiceDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycServiceCodeFilter), e => e.ServiceFk != null && e.ServiceFk.Code == input.SycServiceCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycApplicationNameFilter), e => e.ApplicationFk != null && e.ApplicationFk.Name == input.SycApplicationNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppTransactionCodeFilter), e => e.TransactionFk != null && e.TransactionFk.Code == input.AppTransactionCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycPlanNameFilter), e => e.PlanFk != null && e.PlanFk.Name == input.SycPlanNameFilter)
                        .WhereIf(AbpSession.TenantId!=null, e => e.TenantId==AbpSession.TenantId) ;

            var pagedAndFilteredAppTenantsActivitiesLogs = filteredAppTenantsActivitiesLogs
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appTenantsActivitiesLogs = from o in pagedAndFilteredAppTenantsActivitiesLogs
                                           join o1 in _lookup_sycServiceRepository.GetAll() on o.ServiceId equals o1.Id into j1
                                           from s1 in j1.DefaultIfEmpty()

                                           join o2 in _lookup_sycApplicationRepository.GetAll() on o.ApplicationId equals o2.Id into j2
                                           from s2 in j2.DefaultIfEmpty()

                                           join o3 in _lookup_appTransactionRepository.GetAll() on o.TransactionId equals o3.Id into j3
                                           from s3 in j3.DefaultIfEmpty()

                                           join o4 in _lookup_sycPlanRepository.GetAll() on o.PlanId equals o4.Id into j4
                                           from s4 in j4.DefaultIfEmpty()

                                           join o5 in _lookup_TenantRepository.GetAll() on o.TenantId equals o5.Id into j5
                                           from s5 in j5.DefaultIfEmpty()

                                           select new GetAppTenantsActivitiesLogForViewDto()
                                           {
                                               AppTenantsActivitiesLog = new AppTenantsActivitiesLogDto
                                               {
                                                   ActivityDate = o.ActivityDate,
                                                   Units = o.Units,
                                                   UnitPrice = o.UnitPrice,
                                                   Amount = o.Amount,
                                                   Billed = o.Billed,
                                                   IsManual = o.IsManual,
                                                   InvoiceNumber = o.InvoiceNumber,
                                                   InvoiceDate = o.InvoiceDate,
                                                   Notes = o.Notes,
                                                   Id = o.Id
                                               },
                                               SycServiceCode = s1 == null || s1.Code == null ? "" : s1.Code.ToString(),
                                               SycApplicationName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                                               AppTransactionCode = s3 == null || s3.Code == null ? "" : s3.Code.ToString(),
                                               SycPlanName = s4 == null || s4.Name == null ? "" : s4.Name.ToString(),
                                               TenancyName = s5 == null || s5.TenancyName == null ? "" : s5.TenancyName.ToString()
                                           };

            var totalCount = await filteredAppTenantsActivitiesLogs.CountAsync();

            return new PagedResultDto<GetAppTenantsActivitiesLogForViewDto>(
                totalCount,
                await appTenantsActivitiesLogs.ToListAsync()
            );
        }

        public async Task<GetAppTenantsActivitiesLogForViewDto> GetAppTenantsActivitiesLogForView(int id)
        {
            var appTenantsActivitiesLog = await _appTenantsActivitiesLogRepository.GetAsync(id);

            var output = new GetAppTenantsActivitiesLogForViewDto { AppTenantsActivitiesLog = ObjectMapper.Map<AppTenantsActivitiesLogDto>(appTenantsActivitiesLog) };

            if (output.AppTenantsActivitiesLog.ServiceId != null)
            {
                var _lookupSycService = await _lookup_sycServiceRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.ServiceId);
                output.SycServiceCode = _lookupSycService?.Code?.ToString();
            }

            if (output.AppTenantsActivitiesLog.ApplicationId != null)
            {
                var _lookupSycApplication = await _lookup_sycApplicationRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.ApplicationId);
                output.SycApplicationName = _lookupSycApplication?.Name?.ToString();
            }

            if (output.AppTenantsActivitiesLog.TransactionId != null)
            {
                var _lookupAppTransaction = await _lookup_appTransactionRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.TransactionId);
                output.AppTransactionCode = _lookupAppTransaction?.Code?.ToString();
            }

            if (output.AppTenantsActivitiesLog.PlanId != null)
            {
                var _lookupSycPlan = await _lookup_sycPlanRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.PlanId);
                output.SycPlanName = _lookupSycPlan?.Name?.ToString();
            }

            if (output.AppTenantsActivitiesLog.TenantId != null)
            {
                var _lookupTenant = await _lookup_TenantRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.TenantId);
                output.TenancyName = _lookupTenant?.Name?.ToString();
            }


            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs_Edit)]
        public async Task<GetAppTenantsActivitiesLogForEditOutput> GetAppTenantsActivitiesLogForEdit(EntityDto input)
        {
            var appTenantsActivitiesLog = await _appTenantsActivitiesLogRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppTenantsActivitiesLogForEditOutput { AppTenantsActivitiesLog = ObjectMapper.Map<CreateOrEditAppTenantsActivitiesLogDto>(appTenantsActivitiesLog) };

            if (output.AppTenantsActivitiesLog.ServiceId != null)
            {
                var _lookupSycService = await _lookup_sycServiceRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.ServiceId);
                output.SycServiceCode = _lookupSycService?.Code?.ToString();
            }

            if (output.AppTenantsActivitiesLog.ApplicationId != null)
            {
                var _lookupSycApplication = await _lookup_sycApplicationRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.ApplicationId);
                output.SycApplicationName = _lookupSycApplication?.Name?.ToString();
            }

            if (output.AppTenantsActivitiesLog.TransactionId != null)
            {
                var _lookupAppTransaction = await _lookup_appTransactionRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.TransactionId);
                output.AppTransactionCode = _lookupAppTransaction?.Code?.ToString();
            }

            if (output.AppTenantsActivitiesLog.PlanId != null)
            {
                var _lookupSycPlan = await _lookup_sycPlanRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.PlanId);
                output.SycPlanName = _lookupSycPlan?.Name?.ToString();
            }

            if (output.AppTenantsActivitiesLog.TenantId != null)
            {
                var _lookupTenant = await _lookup_TenantRepository.FirstOrDefaultAsync((int)output.AppTenantsActivitiesLog.TenantId);
                output.TenancyName = _lookupTenant?.Name?.ToString();
            }

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppTenantsActivitiesLogDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs_Create)]
        protected virtual async Task Create(CreateOrEditAppTenantsActivitiesLogDto input)
        {
            var appTenantsActivitiesLog = ObjectMapper.Map<oldAppTenantsActivitiesLog>(input);

            if (AbpSession.TenantId != null)
            {
                appTenantsActivitiesLog.TenantId = (int?)AbpSession.TenantId;
            }

            await _appTenantsActivitiesLogRepository.InsertAsync(appTenantsActivitiesLog);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs_Edit)]
        protected virtual async Task Update(CreateOrEditAppTenantsActivitiesLogDto input)
        {
            var appTenantsActivitiesLog = await _appTenantsActivitiesLogRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, appTenantsActivitiesLog);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _appTenantsActivitiesLogRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppTenantsActivitiesLogsToExcel(GetAllAppTenantsActivitiesLogsForExcelInput input)
        {

            var filteredAppTenantsActivitiesLogs = _appTenantsActivitiesLogRepository.GetAll()
                        .Include(e => e.ServiceFk)
                        .Include(e => e.ApplicationFk)
                        .Include(e => e.TransactionFk)
                        .Include(e => e.PlanFk)
                        .Include(e => e.TenantFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.TransactionFk.Id.ToString() == input.Filter || e.TransactionFk.Code.Contains(input.Filter) || e.ServiceFk.Id.ToString() == input.Filter || e.ServiceFk.Code.Contains(input.Filter) || e.TenantFk.Id.ToString() == input.Filter || e.TenantFk.TenancyName.Contains(input.Filter))
                        .WhereIf(input.MinActivityDateFilter != null, e => e.ActivityDate >= input.MinActivityDateFilter)
                        .WhereIf(input.MaxActivityDateFilter != null, e => e.ActivityDate <= input.MaxActivityDateFilter)
                        .WhereIf(input.MinUnitsFilter != null, e => e.Units >= input.MinUnitsFilter)
                        .WhereIf(input.MaxUnitsFilter != null, e => e.Units <= input.MaxUnitsFilter)
                        .WhereIf(input.MinUnitPriceFilter != null, e => e.UnitPrice >= input.MinUnitPriceFilter)
                        .WhereIf(input.MaxUnitPriceFilter != null, e => e.UnitPrice <= input.MaxUnitPriceFilter)
                        .WhereIf(input.MinAmountFilter != null, e => e.Amount >= input.MinAmountFilter)
                        .WhereIf(input.MaxAmountFilter != null, e => e.Amount <= input.MaxAmountFilter)
                        .WhereIf(input.BilledFilter.HasValue && input.BilledFilter > -1, e => (input.BilledFilter == 1 && e.Billed) || (input.BilledFilter == 0 && !e.Billed))
                        .WhereIf(input.IsManualFilter.HasValue && input.IsManualFilter > -1, e => (input.IsManualFilter == 1 && e.IsManual) || (input.IsManualFilter == 0 && !e.IsManual))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.InvoiceNumberFilter), e => e.InvoiceNumber == input.InvoiceNumberFilter)
                        .WhereIf(input.MinInvoiceDateFilter != null, e => e.InvoiceDate >= input.MinInvoiceDateFilter)
                        .WhereIf(input.MaxInvoiceDateFilter != null, e => e.InvoiceDate <= input.MaxInvoiceDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycServiceCodeFilter), e => e.ServiceFk != null && e.ServiceFk.Code == input.SycServiceCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycApplicationNameFilter), e => e.ApplicationFk != null && e.ApplicationFk.Name == input.SycApplicationNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppTransactionCodeFilter), e => e.TransactionFk != null && e.TransactionFk.Code == input.AppTransactionCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycPlanNameFilter), e => e.PlanFk != null && e.PlanFk.Name == input.SycPlanNameFilter);

            var query = (from o in filteredAppTenantsActivitiesLogs
                         join o1 in _lookup_sycServiceRepository.GetAll() on o.ServiceId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         join o2 in _lookup_sycApplicationRepository.GetAll() on o.ApplicationId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                         join o3 in _lookup_appTransactionRepository.GetAll() on o.TransactionId equals o3.Id into j3
                         from s3 in j3.DefaultIfEmpty()

                         join o4 in _lookup_sycPlanRepository.GetAll() on o.PlanId equals o4.Id into j4
                         from s4 in j4.DefaultIfEmpty()

                         join o5 in _lookup_TenantRepository.GetAll() on o.TenantId equals o5.Id into j5
                         from s5 in j5.DefaultIfEmpty()

                         select new GetAppTenantsActivitiesLogForViewDto()
                         {
                             AppTenantsActivitiesLog = new AppTenantsActivitiesLogDto
                             {
                                 ActivityDate = o.ActivityDate,
                                 Units = o.Units,
                                 UnitPrice = o.UnitPrice,
                                 Amount = o.Amount,
                                 Billed = o.Billed,
                                 IsManual = o.IsManual,
                                 InvoiceNumber = o.InvoiceNumber,
                                 InvoiceDate = o.InvoiceDate,
                                 Notes=o.Notes,
                                 Id = o.Id
                             },
                             SycServiceCode = s1 == null || s1.Code == null ? "" : s1.Code.ToString(),
                             SycApplicationName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                             AppTransactionCode = s3 == null || s3.Code == null ? "" : s3.Code.ToString(),
                             SycPlanName = s4 == null || s4.Name == null ? "" : s4.Name.ToString(),
                             TenancyName = s5 == null || s5.TenancyName == null ? "" : s5.TenancyName.ToString()
                         });

            var appTenantsActivitiesLogListDtos = await query.ToListAsync();

            return _appTenantsActivitiesLogsExcelExporter.ExportToFile(appTenantsActivitiesLogListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs)]
        public async Task<List<AppTenantsActivitiesLogSycServiceLookupTableDto>> GetAllSycServiceForTableDropdown()
        {
            return await _lookup_sycServiceRepository.GetAll()
                .Select(sycService => new AppTenantsActivitiesLogSycServiceLookupTableDto
                {
                    Id = sycService.Id,
                    DisplayName = sycService == null || sycService.Code == null ? "" : sycService.Code.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs)]
        public async Task<List<AppTenantsActivitiesLogSycApplicationLookupTableDto>> GetAllSycApplicationForTableDropdown()
        {
            return await _lookup_sycApplicationRepository.GetAll()
                .Select(sycApplication => new AppTenantsActivitiesLogSycApplicationLookupTableDto
                {
                    Id = sycApplication.Id,
                    DisplayName = sycApplication == null || sycApplication.Name == null ? "" : sycApplication.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs)]
        public async Task<List<AppTenantsActivitiesLogAppTransactionLookupTableDto>> GetAllAppTransactionForTableDropdown()
        {
            return await _lookup_appTransactionRepository.GetAll()
                .Select(appTransaction => new AppTenantsActivitiesLogAppTransactionLookupTableDto
                {
                    Id = appTransaction.Id,
                    DisplayName = appTransaction == null || appTransaction.Code == null ? "" : appTransaction.Code.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs)]
        public async Task<List<AppTenantsActivitiesLogSycPlanLookupTableDto>> GetAllSycPlanForTableDropdown()
        {
            return await _lookup_sycPlanRepository.GetAll()
                .Select(sycPlan => new AppTenantsActivitiesLogSycPlanLookupTableDto
                {
                    Id = sycPlan.Id,
                    DisplayName = sycPlan == null || sycPlan.Name == null ? "" : sycPlan.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs)]
        public async Task<List<AppTenantsActivitiesLogTenantLookupTableDto>> GetAllTenantForTableDropdown()
        {
            return await _lookup_TenantRepository.GetAll()
                .Select(Tenant => new AppTenantsActivitiesLogTenantLookupTableDto
                {
                    Id = Tenant.Id,
                    DisplayName = Tenant == null || Tenant.TenancyName == null ? "" : Tenant.TenancyName.ToString()
                }).ToListAsync();
        }

    }
}