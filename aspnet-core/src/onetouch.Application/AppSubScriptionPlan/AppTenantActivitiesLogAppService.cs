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
using System.Runtime.Caching;
using NPOI.OpenXmlFormats.Shared;
using Microsoft.AspNetCore.Authorization;
using onetouch.Helpers;

namespace onetouch.AppSubScriptionPlan
{
   // [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantActivitiesLog)]
    public class AppTenantActivitiesLogAppService : onetouchAppServiceBase, IAppTenantActivitiesLogAppService
    {
        private readonly IRepository<AppTenantActivitiesLog, long> _appTenantActivityLogRepository;
        private readonly IAppTenantActivitiesLogExcelExporter _appTenantActivitiesLogExcelExporter;
        private readonly IRepository<AppTenantSubscriptionPlan, long> _appTenantSubscriptionPlanRepository;
        private readonly IRepository<AppSubscriptionPlanDetail, long> _appSubscriptionPlanDetailRepository;
        private readonly Helper _helper;
        public AppTenantActivitiesLogAppService(IRepository<AppTenantActivitiesLog, long> appTenantActivityLogRepository, IAppTenantActivitiesLogExcelExporter appTenantActivitiesLogExcelExporter,
             IRepository<AppTenantSubscriptionPlan, long> appTenantSubscriptionPlanRepository, IRepository<AppSubscriptionPlanDetail, long> appSubscriptionPlanDetailRepository,Helper helper)
        {
            _appTenantActivityLogRepository = appTenantActivityLogRepository;
            _appTenantActivitiesLogExcelExporter = appTenantActivitiesLogExcelExporter;
            _appTenantSubscriptionPlanRepository = appTenantSubscriptionPlanRepository;
            _appSubscriptionPlanDetailRepository = appSubscriptionPlanDetailRepository;
            _helper = helper;
        }

        public async Task<PagedResultDto<GetAppTenantActivityLogForViewDto>> GetAll(GetAllAppTenantActivitiesLogInput input)
        {

            var filteredAppTenantActivitiesLog = _appTenantActivityLogRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.TenantName.Contains(input.Filter) || e.ActivityType.Contains(input.Filter) || e.AppSubscriptionPlanCode.Contains(input.Filter) || e.UserName.Contains(input.Filter) || e.FeatureCode.Contains(input.Filter) || e.FeatureName.Contains(input.Filter) || e.Reference.Contains(input.Filter) || e.InvoiceNumber.Contains(input.Filter) || e.CreditOrUsage.Contains(input.Filter) || e.Month.Contains(input.Filter) || e.Year.Contains(input.Filter))
                        .WhereIf(input.MinTenantIdFilter != null, e => e.TenantId >= input.MinTenantIdFilter)
                        .WhereIf(input.MaxTenantIdFilter != null, e => e.TenantId <= input.MaxTenantIdFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TenantNameFilter), e => e.TenantName == input.TenantNameFilter)
                        .WhereIf(input.MinUserIdFilter != null, e => e.UserId >= input.MinUserIdFilter)
                        .WhereIf(input.MaxUserIdFilter != null, e => e.UserId <= input.MaxUserIdFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.ActivityTypeFilter), e => e.ActivityType == input.ActivityTypeFilter)
                        .WhereIf(input.MinAppSubscriptionPlanHeaderIdFilter != null, e => e.AppSubscriptionPlanHeaderId >= input.MinAppSubscriptionPlanHeaderIdFilter)
                        .WhereIf(input.MaxAppSubscriptionPlanHeaderIdFilter != null, e => e.AppSubscriptionPlanHeaderId <= input.MaxAppSubscriptionPlanHeaderIdFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppSubscriptionPlanCodeFilter), e => e.AppSubscriptionPlanCode == input.AppSubscriptionPlanCodeFilter)
                        .WhereIf(input.MinActivityDateTimeFilter != null, e => e.ActivityDateTime >= input.MinActivityDateTimeFilter)
                        .WhereIf(input.MaxActivityDateTimeFilter != null, e => e.ActivityDateTime <= input.MaxActivityDateTimeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UserNameFilter), e => e.UserName == input.UserNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureCodeFilter), e => e.FeatureCode == input.FeatureCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureNameFilter), e => e.FeatureName == input.FeatureNameFilter)
                        .WhereIf(input.BillableFilter.HasValue && input.BillableFilter > -1, e => (input.BillableFilter == 1 && e.Billable) || (input.BillableFilter == 0 && !e.Billable))
                        .WhereIf(input.InvoicedFilter.HasValue && input.InvoicedFilter > -1, e => (input.InvoicedFilter == 1 && e.Invoiced) || (input.InvoicedFilter == 0 && !e.Invoiced))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.ReferenceFilter), e => e.Reference == input.ReferenceFilter)
                        .WhereIf(input.MinQtyFilter != null, e => e.Qty >= input.MinQtyFilter)
                        .WhereIf(input.MaxQtyFilter != null, e => e.Qty <= input.MaxQtyFilter)
                        .WhereIf(input.MinConsumedQtyFilter != null, e => e.ConsumedQty >= input.MinConsumedQtyFilter)
                        .WhereIf(input.MaxConsumedQtyFilter != null, e => e.ConsumedQty <= input.MaxConsumedQtyFilter)
                        .WhereIf(input.MinRemainingQtyFilter != null, e => e.RemainingQty >= input.MinRemainingQtyFilter)
                        .WhereIf(input.MaxRemainingQtyFilter != null, e => e.RemainingQty <= input.MaxRemainingQtyFilter)
                        .WhereIf(input.MinPriceFilter != null, e => e.Price >= input.MinPriceFilter)
                        .WhereIf(input.MaxPriceFilter != null, e => e.Price <= input.MaxPriceFilter)
                        .WhereIf(input.MinAmountFilter != null, e => e.Amount >= input.MinAmountFilter)
                        .WhereIf(input.MaxAmountFilter != null, e => e.Amount <= input.MaxAmountFilter)
                        .WhereIf(input.MinInvoiceDateFilter != null, e => e.InvoiceDate >= input.MinInvoiceDateFilter)
                        .WhereIf(input.MaxInvoiceDateFilter != null, e => e.InvoiceDate <= input.MaxInvoiceDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.InvoiceNumberFilter), e => e.InvoiceNumber == input.InvoiceNumberFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CreditOrUsageFilter), e => e.CreditOrUsage == input.CreditOrUsageFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.MonthFilter), e => e.Month == input.MonthFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.YearFilter), e => e.Year == input.YearFilter);

            var pagedAndFilteredAppTenantActivitiesLog = filteredAppTenantActivitiesLog
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appTenantActivitiesLog = from o in pagedAndFilteredAppTenantActivitiesLog
                                         select new
                                         {

                                             o.TenantId,
                                             o.TenantName,
                                             o.UserId,
                                             o.ActivityType,
                                             o.AppSubscriptionPlanHeaderId,
                                             o.AppSubscriptionPlanCode,
                                             o.ActivityDateTime,
                                             o.UserName,
                                             o.FeatureCode,
                                             o.FeatureName,
                                             o.Billable,
                                             o.Invoiced,
                                             o.Reference,
                                             o.Qty,
                                             o.ConsumedQty,
                                             o.RemainingQty,
                                             o.Price,
                                             o.Amount,
                                             o.InvoiceDate,
                                             o.InvoiceNumber,
                                             o.CreditOrUsage,
                                             o.Month,
                                             o.Year,
                                             Id = o.Id
                                         };

            var totalCount = await filteredAppTenantActivitiesLog.CountAsync();

            var dbList = await appTenantActivitiesLog.ToListAsync();
            var results = new List<GetAppTenantActivityLogForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAppTenantActivityLogForViewDto()
                {
                    AppTenantActivityLog = new AppTenantActivityLogDto
                    {

                        TenantId = long.Parse(o.TenantId.ToString()),
                        TenantName = o.TenantName,
                        UserId = o.UserId,
                        ActivityType = o.ActivityType,
                        AppSubscriptionPlanHeaderId = long.Parse(o.AppSubscriptionPlanHeaderId.ToString()),
                        AppSubscriptionPlanCode = o.AppSubscriptionPlanCode,
                        ActivityDateTime = o.ActivityDateTime,
                        UserName = o.UserName,
                        FeatureCode = o.FeatureCode,
                        FeatureName = o.FeatureName,
                        Billable = o.Billable,
                        Invoiced = o.Invoiced,
                        Reference = o.Reference,
                        Qty = o.Qty,
                        ConsumedQty = o.ConsumedQty,
                        RemainingQty = o.RemainingQty,
                        Price = o.Price,
                        Amount = o.Amount,
                        InvoiceDate = o.InvoiceDate,
                        InvoiceNumber = o.InvoiceNumber,
                        CreditOrUsage = o.CreditOrUsage,
                        Month = o.Month,
                        Year = o.Year,
                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetAppTenantActivityLogForViewDto>(
                totalCount,
                results
            );

        }

        public async Task<GetAppTenantActivityLogForViewDto> GetAppTenantActivityLogForView(long id)
        {
            var appTenantActivityLog = await _appTenantActivityLogRepository.GetAsync(id);

            var output = new GetAppTenantActivityLogForViewDto { AppTenantActivityLog = ObjectMapper.Map<AppTenantActivityLogDto>(appTenantActivityLog) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantActivitiesLog_Edit)]
        public async Task<GetAppTenantActivityLogForEditOutput> GetAppTenantActivityLogForEdit(EntityDto<long> input)
        {
            var appTenantActivityLog = await _appTenantActivityLogRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppTenantActivityLogForEditOutput { AppTenantActivityLog = ObjectMapper.Map<CreateOrEditAppTenantActivityLogDto>(appTenantActivityLog) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppTenantActivityLogDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantActivitiesLog_Create)]
        protected virtual async Task Create(CreateOrEditAppTenantActivityLogDto input)
        {
            var appTenantActivityLog = ObjectMapper.Map<AppTenantActivitiesLog>(input);

            await _appTenantActivityLogRepository.InsertAsync(appTenantActivityLog);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantActivitiesLog_Edit)]
        protected virtual async Task Update(CreateOrEditAppTenantActivityLogDto input)
        {
            var appTenantActivityLog = await _appTenantActivityLogRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, appTenantActivityLog);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTenantActivitiesLog_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _appTenantActivityLogRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppTenantActivitiesLogToExcel(GetAllAppTenantActivitiesLogForExcelInput input)
        {

            var filteredAppTenantActivitiesLog = _appTenantActivityLogRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.TenantName.Contains(input.Filter) || e.ActivityType.Contains(input.Filter) || e.AppSubscriptionPlanCode.Contains(input.Filter) || e.UserName.Contains(input.Filter) || e.FeatureCode.Contains(input.Filter) || e.FeatureName.Contains(input.Filter) || e.Reference.Contains(input.Filter) || e.InvoiceNumber.Contains(input.Filter) || e.CreditOrUsage.Contains(input.Filter) || e.Month.Contains(input.Filter) || e.Year.Contains(input.Filter))
                        .WhereIf(input.MinTenantIdFilter != null, e => e.TenantId >= input.MinTenantIdFilter)
                        .WhereIf(input.MaxTenantIdFilter != null, e => e.TenantId <= input.MaxTenantIdFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.TenantNameFilter), e => e.TenantName == input.TenantNameFilter)
                        .WhereIf(input.MinUserIdFilter != null, e => e.UserId >= input.MinUserIdFilter)
                        .WhereIf(input.MaxUserIdFilter != null, e => e.UserId <= input.MaxUserIdFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.ActivityTypeFilter), e => e.ActivityType == input.ActivityTypeFilter)
                        .WhereIf(input.MinAppSubscriptionPlanHeaderIdFilter != null, e => e.AppSubscriptionPlanHeaderId >= input.MinAppSubscriptionPlanHeaderIdFilter)
                        .WhereIf(input.MaxAppSubscriptionPlanHeaderIdFilter != null, e => e.AppSubscriptionPlanHeaderId <= input.MaxAppSubscriptionPlanHeaderIdFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppSubscriptionPlanCodeFilter), e => e.AppSubscriptionPlanCode == input.AppSubscriptionPlanCodeFilter)
                        .WhereIf(input.MinActivityDateTimeFilter != null, e => e.ActivityDateTime >= input.MinActivityDateTimeFilter)
                        .WhereIf(input.MaxActivityDateTimeFilter != null, e => e.ActivityDateTime <= input.MaxActivityDateTimeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.UserNameFilter), e => e.UserName == input.UserNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureCodeFilter), e => e.FeatureCode == input.FeatureCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.FeatureNameFilter), e => e.FeatureName == input.FeatureNameFilter)
                        .WhereIf(input.BillableFilter.HasValue && input.BillableFilter > -1, e => (input.BillableFilter == 1 && e.Billable) || (input.BillableFilter == 0 && !e.Billable))
                        .WhereIf(input.InvoicedFilter.HasValue && input.InvoicedFilter > -1, e => (input.InvoicedFilter == 1 && e.Invoiced) || (input.InvoicedFilter == 0 && !e.Invoiced))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.ReferenceFilter), e => e.Reference == input.ReferenceFilter)
                        .WhereIf(input.MinQtyFilter != null, e => e.Qty >= input.MinQtyFilter)
                        .WhereIf(input.MaxQtyFilter != null, e => e.Qty <= input.MaxQtyFilter)
                        .WhereIf(input.MinConsumedQtyFilter != null, e => e.ConsumedQty >= input.MinConsumedQtyFilter)
                        .WhereIf(input.MaxConsumedQtyFilter != null, e => e.ConsumedQty <= input.MaxConsumedQtyFilter)
                        .WhereIf(input.MinRemainingQtyFilter != null, e => e.RemainingQty >= input.MinRemainingQtyFilter)
                        .WhereIf(input.MaxRemainingQtyFilter != null, e => e.RemainingQty <= input.MaxRemainingQtyFilter)
                        .WhereIf(input.MinPriceFilter != null, e => e.Price >= input.MinPriceFilter)
                        .WhereIf(input.MaxPriceFilter != null, e => e.Price <= input.MaxPriceFilter)
                        .WhereIf(input.MinAmountFilter != null, e => e.Amount >= input.MinAmountFilter)
                        .WhereIf(input.MaxAmountFilter != null, e => e.Amount <= input.MaxAmountFilter)
                        .WhereIf(input.MinInvoiceDateFilter != null, e => e.InvoiceDate >= input.MinInvoiceDateFilter)
                        .WhereIf(input.MaxInvoiceDateFilter != null, e => e.InvoiceDate <= input.MaxInvoiceDateFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.InvoiceNumberFilter), e => e.InvoiceNumber == input.InvoiceNumberFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CreditOrUsageFilter), e => e.CreditOrUsage == input.CreditOrUsageFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.MonthFilter), e => e.Month == input.MonthFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.YearFilter), e => e.Year == input.YearFilter);

            var query = (from o in filteredAppTenantActivitiesLog
                         select new GetAppTenantActivityLogForViewDto()
                         {
                             AppTenantActivityLog = new AppTenantActivityLogDto
                             {
                                 TenantId = long.Parse(o.TenantId.ToString()),
                                 TenantName = o.TenantName,
                                 UserId = o.UserId,
                                 ActivityType = o.ActivityType,
                                 AppSubscriptionPlanHeaderId = long.Parse(o.AppSubscriptionPlanHeaderId.ToString()),
                                 AppSubscriptionPlanCode = o.AppSubscriptionPlanCode,
                                 ActivityDateTime = o.ActivityDateTime,
                                 UserName = o.UserName,
                                 FeatureCode = o.FeatureCode,
                                 FeatureName = o.FeatureName,
                                 Billable = o.Billable,
                                 Invoiced = o.Invoiced,
                                 Reference = o.Reference,
                                 Qty = o.Qty,
                                 ConsumedQty = o.ConsumedQty,
                                 RemainingQty = o.RemainingQty,
                                 Price = o.Price,
                                 Amount = o.Amount,
                                 InvoiceDate = o.InvoiceDate,
                                 InvoiceNumber = o.InvoiceNumber,
                                 CreditOrUsage = o.CreditOrUsage,
                                 Month = o.Month,
                                 Year = o.Year,
                                 Id = o.Id
                             }
                         });

            var appTenantActivityLogListDtos = await query.ToListAsync();

            return _appTenantActivitiesLogExcelExporter.ExportToFile(appTenantActivityLogListDtos);
        }
        public async Task<bool> IsFeatureAvailable(string featureCode)
        {
            var tenantPlan = await _appTenantSubscriptionPlanRepository.GetAll().Include(z=>z.AppSubscriptionPlanHeaderFk).Where(z => z.TenantId == AbpSession.TenantId &&
            (z.CurrentPeriodStartDate <= DateTime.Now.Date && z.CurrentPeriodEndDate >= DateTime.Now.Date)).FirstOrDefaultAsync();
            if (tenantPlan != null)
            {
                var featureDetail = await _appSubscriptionPlanDetailRepository.GetAll().Where(z => z.AppSubscriptionPlanHeaderId == tenantPlan.AppSubscriptionPlanHeaderId &&
                z.FeatureCode == featureCode).FirstOrDefaultAsync();
                if (featureDetail != null)
                {
                    if (featureDetail.Availability == "Limited")
                    {
                        string month = DateTime.Now.Date.Month.ToString("00");
                        string year = DateTime.Now.Date.Year.ToString("0000");
                        var balanceLog = await _appTenantActivityLogRepository.GetAll()
                            .Where(z => z.TenantId == AbpSession.TenantId && z.FeatureCode == featureCode && (z.ActivityType == "Plan Renewal Credit" || z.ActivityType == "Adjustment Credit") &&
                            z.CreditOrUsage == "Credit" && z.RemainingQty > 0 && z.Month == month && z.Year == year
                            ).FirstOrDefaultAsync();
                        if (balanceLog != null)
                        {
                            return true;
                        }
                        else
                        {
                            if (tenantPlan.AllowOverAge)
                            {
                                var overageLog = await _appTenantActivityLogRepository.GetAll()
                                            .Where(z => z.TenantId == AbpSession.TenantId && z.FeatureCode == featureCode && (z.ActivityType == "Overage") &&
                                            z.CreditOrUsage == "Credit" && z.Month == month && z.Year == year
                                            ).FirstOrDefaultAsync();
                                if (overageLog != null)
                                {
                                    return true;
                                }
                                else
                                {
                                    AppTenantActivitiesLog obj = new AppTenantActivitiesLog();
                                    obj.TenantId = AbpSession.TenantId;
                                    var tenant = TenantManager.GetById(int.Parse(AbpSession.TenantId.ToString()));
                                    obj.TenantName = tenant.Name;
                                    obj.UserId = long.Parse(AbpSession.UserId.ToString());
                                    var user = UserManager.GetUserById(long.Parse(AbpSession.UserId.ToString()));
                                    obj.UserName = user.UserName;
                                    obj.Month = DateTime.Now.Date.Month.ToString("00");
                                    obj.Year = DateTime.Now.Date.Year.ToString("0000");
                                    obj.FeatureCode = featureCode;
                                    obj.FeatureName = featureDetail.FeatureName;
                                    obj.ActivityDateTime = DateTime.Now.Date;
                                    obj.ActivityType = "Overage";
                                    obj.Amount = 0;
                                    obj.Billable = featureDetail.IsFeatureBillable;
                                    obj.Invoiced = false;
                                    //obj.InvoiceDate = ;
                                    obj.InvoiceNumber = "";
                                    obj.ConsumedQty = 0;
                                    obj.Qty = 0;
                                    obj.RemainingQty = 0;
                                    obj.CreditOrUsage = "Credit";
                                    obj.Price = featureDetail.UnitPrice;
                                    obj.Reference = "Overage";
                                    obj.AppSubscriptionPlanHeaderId = tenantPlan.AppSubscriptionPlanHeaderId;
                                    obj.AppSubscriptionPlanCode = tenantPlan.AppSubscriptionPlanHeaderFk.Code;
                                    obj.Code = featureDetail.FeatureCode.TrimEnd()+" "+DateTime.Now.ToString();
                                    obj.Name = obj.Code;
                                    obj.ObjectId = await _helper.SystemTables.GetObjectTenantActivityLogId();
                                    var entityActivityObjectType = await _helper.SystemTables.GetEntityObjectTypeActLog();
                                    obj.EntityObjectTypeId = entityActivityObjectType.Id;
                                    obj.EntityObjectTypeCode = entityActivityObjectType.Code;
                                    await _appTenantActivityLogRepository.InsertAsync(obj);
                                    await CurrentUnitOfWork.SaveChangesAsync();
                                    return true;
                                }
                            }
                        }
                    }
                    else
                    {
                        return true;
                    }
                }

                //_appSubscriptionPlanDetailRepository 
            }
            return false;
        }
        [AllowAnonymous]
        public async Task<bool> AddUsageActivityLog(string featureCode,string? relatedEntityCode, long? relatedEntityId, long? relatedEntityOvbjectTypeId,string? relatedEntityObjectTypeCode, string reference, int qty)
        {
            if (AbpSession.TenantId == null)
                return true;
            
            var tenantPlan = await _appTenantSubscriptionPlanRepository.GetAll().Include(z=>z.AppSubscriptionPlanHeaderFk).Where(z => z.TenantId == AbpSession.TenantId &&
            (z.CurrentPeriodStartDate <= DateTime.Now.Date && DateTime.Now.Date <= z.CurrentPeriodEndDate)).FirstOrDefaultAsync();
            if (AbpSession.UserId !=null && AbpSession.UserId>0)// && tenantPlan != null)
            {
                //if (featureCode.Contains("User Logged"))
                //{
                //    AppTenantActivitiesLog obj = new AppTenantActivitiesLog();
                //    obj.TenantId = AbpSession.TenantId;
                //    var tenant = TenantManager.GetById(int.Parse(AbpSession.TenantId.ToString()));
                //    obj.TenantName = tenant.Name;
                //    obj.UserId = long.Parse(AbpSession.UserId.ToString());
                //    var user = UserManager.GetUserById(long.Parse(AbpSession.UserId.ToString()));
                //    obj.UserName = user.Name;
                //    obj.Month = DateTime.Now.Date.Month.ToString("00");
                //    obj.Year = DateTime.Now.Date.Year.ToString("0000");
                //    obj.FeatureCode = featureCode;
                //    obj.FeatureName = featureCode;
                //    obj.ActivityDateTime = DateTime.Now.Date;
                //    obj.ActivityType = "Usage";
                //    obj.CreditOrUsage = "Usage";
                //    obj.Amount = 0;
                //    obj.Billable = false;
                //    obj.Invoiced = false;
                //    //obj.CreditId = long.Parse(creditId.ToString());
                //    obj.InvoiceNumber = "";
                //    obj.ConsumedQty = 0;
                //    obj.Qty = qty;
                //    obj.RemainingQty = 0;
                //    obj.Price = 0;
                //    obj.Reference = reference;
                //    obj.AppSubscriptionPlanHeaderId = tenantPlan.AppSubscriptionPlanHeaderId;
                //    obj.AppSubscriptionPlanCode = tenantPlan.AppSubscriptionPlanHeaderFk.Code;
                //    obj.Name = user.Name.TrimEnd()+" "+featureCode;
                //    obj.ObjectId = await _helper.SystemTables.GetObjectTenantActivityLogId();
                //    var entityActivityObjectType = await _helper.SystemTables.GetEntityObjectTypeActLog();
                //    obj.EntityObjectTypeId = entityActivityObjectType.Id;
                //    obj.EntityObjectTy
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //
                //    peCode = entityActivityObjectType.Code;
                //    obj.Code = featureCode.Trim()+" " + DateTime.Now.ToString();

                //    await _appTenantActivityLogRepository.InsertAsync(obj);
                //    return true;
                //}
                AppSubscriptionPlanDetail featureDetail = null;
                if (tenantPlan != null)
                {
                    featureDetail = await _appSubscriptionPlanDetailRepository.GetAll().Where(z => z.AppSubscriptionPlanHeaderId == tenantPlan.AppSubscriptionPlanHeaderId &&
                 z.FeatureCode == featureCode).FirstOrDefaultAsync();
                }
                if (featureDetail != null)
                {
                    long? creditId = null;
                    string month = DateTime.Now.Date.Month.ToString("00");
                    string year = DateTime.Now.Date.Year.ToString("0000");
                    var balanceLog = await _appTenantActivityLogRepository.GetAll()
                            .Where(z => z.TenantId == AbpSession.TenantId && z.FeatureCode == featureCode && (z.ActivityType == "Plan Renewal Credit" || z.ActivityType == "Adjustment Credit") &&
                            z.CreditOrUsage == "Credit" && z.RemainingQty > 0 && z.Month == month && z.Year == year
                            ).FirstOrDefaultAsync();
                    if (balanceLog != null)
                    {
                        creditId = balanceLog.Id;
                        balanceLog.RemainingQty -= qty;
                        balanceLog.ConsumedQty += qty;
                        await _appTenantActivityLogRepository.UpdateAsync(balanceLog);
                    }
                    else
                    {
                        if (tenantPlan.AllowOverAge)
                        {
                            var overageLog = await _appTenantActivityLogRepository.GetAll()
                                        .Where(z => z.TenantId == AbpSession.TenantId && z.FeatureCode == featureCode && (z.ActivityType == "Overage") &&
                                        z.CreditOrUsage == "Credit" && z.Month == month && z.Year == year
                                        ).FirstOrDefaultAsync();
                            if (overageLog != null)
                            {
                                creditId = overageLog.Id;
                                overageLog.Qty += qty;
                                overageLog.ConsumedQty += qty;
                                overageLog.Amount += qty * featureDetail.UnitPrice;
                                await _appTenantActivityLogRepository.UpdateAsync(overageLog);
                            }
                        }
                    }
                    AppTenantActivitiesLog obj = new AppTenantActivitiesLog();
                    obj.TenantId = AbpSession.TenantId;
                    var tenant = TenantManager.GetById(int.Parse(AbpSession.TenantId.ToString()));
                    obj.TenantName = tenant.Name;
                    obj.UserId = long.Parse(AbpSession.UserId.ToString());
                    var user = UserManager.GetUserById(long.Parse(AbpSession.UserId.ToString()));
                    obj.UserName = user.UserName;
                    obj.Month = DateTime.Now.Date.Month.ToString("00");
                    obj.Year = DateTime.Now.Date.Year.ToString("0000");
                    obj.FeatureCode = featureCode;
                    obj.FeatureName = featureDetail.FeatureName;
                    obj.ActivityDateTime = DateTime.Now.Date;
                    obj.ActivityType = "Usage";
                    obj.CreditOrUsage = "Usage";
                    obj.Amount = qty * featureDetail.UnitPrice;
                    obj.Billable = featureDetail.IsFeatureBillable;
                    obj.Invoiced = false;
                    obj.CreditId = long.Parse(creditId.ToString());
                    obj.InvoiceNumber = "";
                    obj.ConsumedQty = 0;
                    obj.Qty = qty;
                    obj.RemainingQty = 0;
                    obj.Price = featureDetail.UnitPrice;
                    obj.Reference = reference;
                    obj.AppSubscriptionPlanHeaderId = tenantPlan == null ? null : tenantPlan.AppSubscriptionPlanHeaderId;
                    obj.AppSubscriptionPlanCode = tenantPlan == null ? null : tenantPlan.AppSubscriptionPlanHeaderFk.Code;
                    obj.Code = featureDetail.FeatureCode.TrimEnd() + " " + DateTime.Now.ToString();
                    obj.Name = obj.Code;
                    obj.ObjectId = await _helper.SystemTables.GetObjectTenantActivityLogId();
                    var entityActivityObjectType = await _helper.SystemTables.GetEntityObjectTypeActLog();
                    obj.EntityObjectTypeId = entityActivityObjectType.Id;
                    obj.EntityObjectTypeCode = entityActivityObjectType.Code;
                    obj.RelatedEntityCode = relatedEntityCode;
                    obj.RelatedEntityId = relatedEntityId;
                    obj.RelatedEntityObjectTypeId = relatedEntityOvbjectTypeId;
                    obj.RelatedEntityObjectTypeCode = relatedEntityObjectTypeCode;
                    await _appTenantActivityLogRepository.InsertAsync(obj);
                }
                else
                {
                    AppTenantActivitiesLog obj = new AppTenantActivitiesLog();
                    obj.TenantId = AbpSession.TenantId;
                    var tenant = TenantManager.GetById(int.Parse(AbpSession.TenantId.ToString()));
                    obj.TenantName = tenant.Name;
                    obj.UserId = long.Parse(AbpSession.UserId.ToString());
                    var user = UserManager.GetUserById(long.Parse(AbpSession.UserId.ToString()));
                    obj.UserName = user.UserName;
                    obj.Month = DateTime.Now.Date.Month.ToString("00");
                    obj.Year = DateTime.Now.Date.Year.ToString("0000");
                    obj.FeatureCode = featureCode;
                    obj.FeatureName = "Not Found";
                    obj.ActivityDateTime = DateTime.Now.Date;
                    obj.ActivityType = "Usage";
                    obj.CreditOrUsage = "Usage";
                    obj.Amount = 0;
                    obj.Billable = false;
                    obj.Invoiced = false;
                    //obj.CreditId = long.Parse(creditId.ToString());
                    obj.InvoiceNumber = "";
                    obj.ConsumedQty = 0;
                    obj.Qty = qty;
                    obj.RemainingQty = 0;
                    obj.Price = 0;
                    obj.Reference = reference;
                    obj.AppSubscriptionPlanHeaderId = tenantPlan == null ? null : tenantPlan.AppSubscriptionPlanHeaderId;
                    obj.AppSubscriptionPlanCode = tenantPlan == null ? null : tenantPlan.AppSubscriptionPlanHeaderFk.Code;
                    obj.Name = user.Name.TrimEnd() + " " + featureCode;
                    obj.ObjectId = await _helper.SystemTables.GetObjectTenantActivityLogId();
                    var entityActivityObjectType = await _helper.SystemTables.GetEntityObjectTypeActLog();
                    obj.EntityObjectTypeId = entityActivityObjectType.Id;
                    obj.EntityObjectTypeCode = entityActivityObjectType.Code;
                    obj.Code = featureCode.Trim() + " " + DateTime.Now.ToString();
                    obj.RelatedEntityCode = relatedEntityCode;
                    obj.RelatedEntityId = relatedEntityId;
                    obj.RelatedEntityObjectTypeId = relatedEntityOvbjectTypeId;
                    obj.RelatedEntityObjectTypeCode = relatedEntityObjectTypeCode;
                    await _appTenantActivityLogRepository.InsertAsync(obj);
                }

            }
            return true;
        }
        public async Task<bool> AddPlanRenewalBalances(DateTime startdate)
        {
            var tenantPlan = await _appTenantSubscriptionPlanRepository.GetAll().Include(z=>z.AppSubscriptionPlanHeaderFk).Where(z => z.TenantId == AbpSession.TenantId &&
            (z.CurrentPeriodStartDate >= DateTime.Now.Date && z.CurrentPeriodEndDate >= DateTime.Now.Date)).FirstOrDefaultAsync();
            if (tenantPlan != null)
            {
                tenantPlan.CurrentPeriodStartDate = startdate;
                tenantPlan.CurrentPeriodEndDate = new DateTime(startdate.Year, startdate.Month, DateTime.DaysInMonth(startdate.Year, startdate.Month));
                await _appTenantSubscriptionPlanRepository.UpdateAsync(tenantPlan);
                var featureDetails = await _appSubscriptionPlanDetailRepository.GetAll().Where(z => z.AppSubscriptionPlanHeaderId == tenantPlan.AppSubscriptionPlanHeaderId).ToListAsync();
                if (featureDetails != null && featureDetails.Count() > 0)
                {
                    foreach (var det in featureDetails)
                    {
                        long rolledOverQty = 0;
                        if (det.RollOver)
                        {
                            var lastMonth = DateTime.Now.Date.Month != 1 ? DateTime.Now.Date.Month - 1 : 12;
                            var year = DateTime.Now.Date.Month == 1 ? DateTime.Now.Year - 1 : DateTime.Now.Year;
                            var tenantPlanPrev = await _appTenantActivityLogRepository.GetAll().Where(z => z.TenantId == AbpSession.TenantId && z.FeatureCode== det.FeatureCode &&
                              z.RemainingQty > 0 && z.Month == lastMonth.ToString("00") && z.Year == year.ToString("0000")).FirstOrDefaultAsync();
                            if (tenantPlanPrev != null)
                            {
                                rolledOverQty = tenantPlanPrev.RemainingQty;
                            }
                        }
                        AppTenantActivitiesLog obj = new AppTenantActivitiesLog();
                        obj.TenantId = AbpSession.TenantId;
                        var tenant = TenantManager.GetById(int.Parse(AbpSession.TenantId.ToString()));
                        obj.TenantName = tenant.Name;
                        obj.UserId = long.Parse(AbpSession.UserId.ToString());
                        var user = UserManager.GetUserById(long.Parse(AbpSession.UserId.ToString()));
                        obj.UserName = user.Name;
                        obj.Month = DateTime.Now.Date.Month.ToString("00");
                        obj.Year = DateTime.Now.Date.Year.ToString("0000");
                        obj.FeatureCode = det.FeatureCode;
                        obj.FeatureName = det.FeatureName;
                        obj.ActivityDateTime = DateTime.Now.Date;
                        obj.ActivityType = "Plan Renewal Credit";
                        obj.CreditOrUsage = "Credit";
                        obj.Amount = 0;
                        obj.Billable = det.IsFeatureBillable;
                        obj.Invoiced = false;
                        //obj.CreditId = long.Parse(creditId.ToString());
                        obj.InvoiceNumber = "";
                        obj.ConsumedQty = 0;
                        obj.Qty = long.Parse(det.FeatureLimit.ToString())+ rolledOverQty;
                        obj.RemainingQty = long.Parse(det.FeatureLimit.ToString());
                        obj.Price = det.UnitPrice;
                        obj.Reference = "Plan Renewal Credit";
                        obj.AppSubscriptionPlanHeaderId = tenantPlan.AppSubscriptionPlanHeaderId;
                        obj.AppSubscriptionPlanCode = tenantPlan.AppSubscriptionPlanHeaderFk.Code;
                        obj.Code = det.FeatureCode.TrimEnd() + " " + DateTime.Now.ToString();
                        obj.Name = obj.Code;
                        obj.ObjectId = await _helper.SystemTables.GetObjectTenantActivityLogId();
                        var entityActivityObjectType = await _helper.SystemTables.GetEntityObjectTypeActLog();
                        obj.EntityObjectTypeId = entityActivityObjectType.Id;
                        obj.EntityObjectTypeCode = entityActivityObjectType.Code;
                        await _appTenantActivityLogRepository.InsertAsync(obj);
                    }
                }
                
            }

            return true;
        }
    }
}