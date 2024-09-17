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
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Extensions;

namespace onetouch.AppSubScriptionPlan
{
    [AbpAuthorize(AppPermissions.Pages_AppSubscriptionPlanHeaders)]
    public class AppSubscriptionPlanHeadersAppService : onetouchAppServiceBase, IAppSubscriptionPlanHeadersAppService
    {
        private readonly IRepository<AppSubscriptionPlanHeader, long> _appSubscriptionPlanHeaderRepository;
        private readonly IAppSubscriptionPlanHeadersExcelExporter _appSubscriptionPlanHeadersExcelExporter;
        private readonly IRepository<AppTenantSubscriptionPlan, long> _appTenantSubscriptionPlanRepository;
        private readonly Helper _helper;
        public AppSubscriptionPlanHeadersAppService(IRepository<AppSubscriptionPlanHeader, long> appSubscriptionPlanHeaderRepository,
            IAppSubscriptionPlanHeadersExcelExporter appSubscriptionPlanHeadersExcelExporter, Helper helper, IRepository<AppTenantSubscriptionPlan, long> appTenantSubscriptionPlanRepository)
        {
            _appSubscriptionPlanHeaderRepository = appSubscriptionPlanHeaderRepository;
            _appSubscriptionPlanHeadersExcelExporter = appSubscriptionPlanHeadersExcelExporter;
            _appTenantSubscriptionPlanRepository = appTenantSubscriptionPlanRepository;
            _helper = helper;
        }
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<GetAppSubscriptionPlanHeaderForViewDto>> GetAll(GetAllAppSubscriptionPlanHeadersInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var filteredAppSubscriptionPlanHeaders = _appSubscriptionPlanHeaderRepository.GetAll().IncludeIf( AbpSession.TenantId!=null , z=>z.AppSubscriptionPlanDetails)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Description.Contains(input.Filter) || e.BillingCode.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(input.IsStandardFilter.HasValue && input.IsStandardFilter > -1, e => (input.IsStandardFilter == 1 && e.IsStandard) || (input.IsStandardFilter == 0 && !e.IsStandard))
                        .WhereIf(input.IsBillableFilter.HasValue && input.IsBillableFilter > -1, e => (input.IsBillableFilter == 1 && e.IsBillable) || (input.IsBillableFilter == 0 && !e.IsBillable))
                        .WhereIf(input.MinDiscountFilter != null, e => e.Discount >= input.MinDiscountFilter)
                        .WhereIf(input.MaxDiscountFilter != null, e => e.Discount <= input.MaxDiscountFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BillingCodeFilter), e => e.BillingCode == input.BillingCodeFilter)
                        .WhereIf(input.MinMonthlyPriceFilter != null, e => e.MonthlyPrice >= input.MinMonthlyPriceFilter)
                        .WhereIf(input.MaxMonthlyPriceFilter != null, e => e.MonthlyPrice <= input.MaxMonthlyPriceFilter)
                        .WhereIf(input.MinYearlyPriceFilter != null, e => e.YearlyPrice >= input.MinYearlyPriceFilter)
                        .WhereIf(input.MaxYearlyPriceFilter != null, e => e.YearlyPrice <= input.MaxYearlyPriceFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter);

                var pagedAndFilteredAppSubscriptionPlanHeaders = filteredAppSubscriptionPlanHeaders
                    .OrderBy(input.Sorting ?? "id asc")
                    .PageBy(input);

                var appSubscriptionPlanHeaders = from o in pagedAndFilteredAppSubscriptionPlanHeaders
                                                 select new
                                                 {

                                                     o.Description,
                                                     o.IsStandard,
                                                     o.IsBillable,
                                                     o.Discount,
                                                     o.BillingCode,
                                                     o.MonthlyPrice,
                                                     o.YearlyPrice,
                                                     o.Code,
                                                     o.Name,
                                                     Id = o.Id,
                                                     o.AppSubscriptionPlanDetails
                                                 };

                var totalCount = await filteredAppSubscriptionPlanHeaders.CountAsync();

                var dbList = await appSubscriptionPlanHeaders.ToListAsync();
                var results = new List<GetAppSubscriptionPlanHeaderForViewDto>();

                foreach (var o in dbList)
                {
                    var res = new GetAppSubscriptionPlanHeaderForViewDto()
                    {
                        AppSubscriptionPlanHeader = new AppSubscriptionPlanHeaderDto
                        {

                            Description = o.Description,
                            IsStandard = o.IsStandard,
                            IsBillable = o.IsBillable,
                            Discount = o.Discount,
                            BillingCode = o.BillingCode,
                            MonthlyPrice = o.MonthlyPrice,
                            YearlyPrice = o.YearlyPrice,
                            Code = o.Code,
                            Name = o.Name,
                            Id = o.Id,
                            AppSubscriptionPlanDetails =ObjectMapper.Map<List<AppSubscriptionPlanDetailDto>>(o.AppSubscriptionPlanDetails),
                        }
                    };

                    results.Add(res);
                }
                //MMT
                if (AbpSession.TenantId != null)
                {
                    var tenantPlan = await _appTenantSubscriptionPlanRepository.GetAll()
                        .Where(z => z.TenantId == AbpSession.TenantId && z.CurrentPeriodEndDate >= DateTime.Now.Date && DateTime.Now.Date >= z.CurrentPeriodStartDate).FirstOrDefaultAsync();
                    if (tenantPlan != null)
                    {
                        var plan = results.Where(z => z.AppSubscriptionPlanHeader.Id == tenantPlan.AppSubscriptionPlanHeaderId).FirstOrDefault();
                        if (plan != null)
                            plan.AppSubscriptionPlanHeader.AppTenantSubscriptionPlanId= tenantPlan.Id;

                    }
                          
                }
                   // AppTenantSubscriptionPlanId
                //MMT
                return new PagedResultDto<GetAppSubscriptionPlanHeaderForViewDto>(
                    totalCount,
                    results
                );

            }
        }

        public async Task<GetAppSubscriptionPlanHeaderForViewDto> GetAppSubscriptionPlanHeaderForView(long id)
        {
            var appSubscriptionPlanHeader = await _appSubscriptionPlanHeaderRepository.GetAsync(id);

            var output = new GetAppSubscriptionPlanHeaderForViewDto { AppSubscriptionPlanHeader = ObjectMapper.Map<AppSubscriptionPlanHeaderDto>(appSubscriptionPlanHeader) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_AppSubscriptionPlanHeaders_Edit)]
        public async Task<GetAppSubscriptionPlanHeaderForEditOutput> GetAppSubscriptionPlanHeaderForEdit(EntityDto<long> input)
        {
            var appSubscriptionPlanHeader = await _appSubscriptionPlanHeaderRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppSubscriptionPlanHeaderForEditOutput { AppSubscriptionPlanHeader = ObjectMapper.Map<CreateOrEditAppSubscriptionPlanHeaderDto>(appSubscriptionPlanHeader) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppSubscriptionPlanHeaderDto input)
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

        [AbpAuthorize(AppPermissions.Pages_AppSubscriptionPlanHeaders_Create)]
        protected virtual async Task Create(CreateOrEditAppSubscriptionPlanHeaderDto input)
        {
            var appSubscriptionPlanHeader = ObjectMapper.Map<AppSubscriptionPlanHeader>(input);
            var appSubscriptionPlanObjectId = await _helper.SystemTables.GetObjectStandardSubscriptionPlanId();
            appSubscriptionPlanHeader.ObjectId = appSubscriptionPlanObjectId;
            var StatusId = input.EntityStatusCode == "ACTIVE" ? await _helper.SystemTables.GetEntityObjectStatusItemActive() : await _helper.SystemTables.GetEntityObjectStatusItemDraft();
            appSubscriptionPlanHeader.EntityObjectStatusId = StatusId;
            var entitySubPlanObjectType = await _helper.SystemTables.GetObjectStandardSubscriptionPlan();
            appSubscriptionPlanHeader.EntityObjectTypeId = entitySubPlanObjectType.Id;
            appSubscriptionPlanHeader.EntityObjectTypeCode = entitySubPlanObjectType.Code;
            appSubscriptionPlanHeader.TenantId = null;
            await _appSubscriptionPlanHeaderRepository.InsertAsync(appSubscriptionPlanHeader);

        }

        [AbpAuthorize(AppPermissions.Pages_AppSubscriptionPlanHeaders_Edit)]
        protected virtual async Task Update(CreateOrEditAppSubscriptionPlanHeaderDto input)
        {
            var appSubscriptionPlanHeader = await _appSubscriptionPlanHeaderRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, appSubscriptionPlanHeader);

        }

        [AbpAuthorize(AppPermissions.Pages_AppSubscriptionPlanHeaders_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _appSubscriptionPlanHeaderRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppSubscriptionPlanHeadersToExcel(GetAllAppSubscriptionPlanHeadersForExcelInput input)
        {

            var filteredAppSubscriptionPlanHeaders = _appSubscriptionPlanHeaderRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Description.Contains(input.Filter) || e.BillingCode.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(input.IsStandardFilter.HasValue && input.IsStandardFilter > -1, e => (input.IsStandardFilter == 1 && e.IsStandard) || (input.IsStandardFilter == 0 && !e.IsStandard))
                        .WhereIf(input.IsBillableFilter.HasValue && input.IsBillableFilter > -1, e => (input.IsBillableFilter == 1 && e.IsBillable) || (input.IsBillableFilter == 0 && !e.IsBillable))
                        .WhereIf(input.MinDiscountFilter != null, e => e.Discount >= input.MinDiscountFilter)
                        .WhereIf(input.MaxDiscountFilter != null, e => e.Discount <= input.MaxDiscountFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BillingCodeFilter), e => e.BillingCode == input.BillingCodeFilter)
                        .WhereIf(input.MinMonthlyPriceFilter != null, e => e.MonthlyPrice >= input.MinMonthlyPriceFilter)
                        .WhereIf(input.MaxMonthlyPriceFilter != null, e => e.MonthlyPrice <= input.MaxMonthlyPriceFilter)
                        .WhereIf(input.MinYearlyPriceFilter != null, e => e.YearlyPrice >= input.MinYearlyPriceFilter)
                        .WhereIf(input.MaxYearlyPriceFilter != null, e => e.YearlyPrice <= input.MaxYearlyPriceFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter);

            var query = (from o in filteredAppSubscriptionPlanHeaders
                         select new GetAppSubscriptionPlanHeaderForViewDto()
                         {
                             AppSubscriptionPlanHeader = new AppSubscriptionPlanHeaderDto
                             {
                                 Description = o.Description,
                                 IsStandard = o.IsStandard,
                                 IsBillable = o.IsBillable,
                                 Discount = o.Discount,
                                 BillingCode = o.BillingCode,
                                 MonthlyPrice = o.MonthlyPrice,
                                 YearlyPrice = o.YearlyPrice,
                                 Code = o.Code,
                                 Name = o.Name,
                                 Id = o.Id
                             }
                         });

            var appSubscriptionPlanHeaderListDtos = await query.ToListAsync();

            return _appSubscriptionPlanHeadersExcelExporter.ExportToFile(appSubscriptionPlanHeaderListDtos);
        }

    }
}