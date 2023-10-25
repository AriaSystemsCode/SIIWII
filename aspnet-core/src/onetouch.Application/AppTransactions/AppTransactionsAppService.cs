using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppTransactions.Exporting;
using onetouch.AppTransactions.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;

namespace onetouch.AppTransactions
{
    [AbpAuthorize(AppPermissions.Pages_Administration_AppTransactions)]
    public class AppTransactionsAppService : onetouchAppServiceBase, IAppTransactionsAppService
    {
        private readonly IRepository<AppTransaction> _appTransactionRepository;
        private readonly IAppTransactionsExcelExporter _appTransactionsExcelExporter;

        public AppTransactionsAppService(IRepository<AppTransaction> appTransactionRepository, IAppTransactionsExcelExporter appTransactionsExcelExporter)
        {
            _appTransactionRepository = appTransactionRepository;
            _appTransactionsExcelExporter = appTransactionsExcelExporter;

        }

        public async Task<PagedResultDto<GetAppTransactionForViewDto>> GetAll(GetAllAppTransactionsInput input)
        {

            var filteredAppTransactions = _appTransactionRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(input.MinDateFilter != null, e => e.Date >= input.MinDateFilter)
                        .WhereIf(input.MaxDateFilter != null, e => e.Date <= input.MaxDateFilter)
                        .WhereIf(input.MinAddDateFilter != null, e => e.AddDate >= input.MinAddDateFilter)
                        .WhereIf(input.MaxAddDateFilter != null, e => e.AddDate <= input.MaxAddDateFilter)
                        .WhereIf(input.MinEndDateFilter != null, e => e.EndDate >= input.MinEndDateFilter)
                        .WhereIf(input.MaxEndDateFilter != null, e => e.EndDate <= input.MaxEndDateFilter);

            var pagedAndFilteredAppTransactions = filteredAppTransactions
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appTransactions = from o in pagedAndFilteredAppTransactions
                                  select new GetAppTransactionForViewDto()
                                  {
                                      AppTransaction = new AppTransactionDto
                                      {
                                          Code = o.Code,
                                          Date = o.Date,
                                          AddDate = o.AddDate,
                                          EndDate = o.EndDate,
                                          Id = o.Id
                                      }
                                  };

            var totalCount = await filteredAppTransactions.CountAsync();

            return new PagedResultDto<GetAppTransactionForViewDto>(
                totalCount,
                await appTransactions.ToListAsync()
            );
        }

        public async Task<GetAppTransactionForViewDto> GetAppTransactionForView(int id)
        {
            var appTransaction = await _appTransactionRepository.GetAsync(id);

            var output = new GetAppTransactionForViewDto { AppTransaction = ObjectMapper.Map<AppTransactionDto>(appTransaction) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTransactions_Edit)]
        public async Task<GetAppTransactionForEditOutput> GetAppTransactionForEdit(EntityDto input)
        {
            var appTransaction = await _appTransactionRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAppTransactionForEditOutput { AppTransaction = ObjectMapper.Map<CreateOrEditAppTransactionDto>(appTransaction) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAppTransactionDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTransactions_Create)]
        protected virtual async Task Create(CreateOrEditAppTransactionDto input)
        {
            var appTransaction = ObjectMapper.Map<AppTransaction>(input);

            if (AbpSession.TenantId != null)
            {
                appTransaction.TenantId = (int?)AbpSession.TenantId;
            }

            await _appTransactionRepository.InsertAsync(appTransaction);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTransactions_Edit)]
        protected virtual async Task Update(CreateOrEditAppTransactionDto input)
        {
            var appTransaction = await _appTransactionRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, appTransaction);
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_AppTransactions_Delete)]
        public async Task Delete(EntityDto input)
        {
            await _appTransactionRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetAppTransactionsToExcel(GetAllAppTransactionsForExcelInput input)
        {

            var filteredAppTransactions = _appTransactionRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(input.MinDateFilter != null, e => e.Date >= input.MinDateFilter)
                        .WhereIf(input.MaxDateFilter != null, e => e.Date <= input.MaxDateFilter)
                        .WhereIf(input.MinAddDateFilter != null, e => e.AddDate >= input.MinAddDateFilter)
                        .WhereIf(input.MaxAddDateFilter != null, e => e.AddDate <= input.MaxAddDateFilter)
                        .WhereIf(input.MinEndDateFilter != null, e => e.EndDate >= input.MinEndDateFilter)
                        .WhereIf(input.MaxEndDateFilter != null, e => e.EndDate <= input.MaxEndDateFilter);

            var query = (from o in filteredAppTransactions
                         select new GetAppTransactionForViewDto()
                         {
                             AppTransaction = new AppTransactionDto
                             {
                                 Code = o.Code,
                                 Date = o.Date,
                                 AddDate = o.AddDate,
                                 EndDate = o.EndDate,
                                 Id = o.Id
                             }
                         });

            var appTransactionListDtos = await query.ToListAsync();

            return _appTransactionsExcelExporter.ExportToFile(appTransactionListDtos);
        }

    }
}