using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SycCurrencyExchangeRates.Exporting;
using onetouch.SycCurrencyExchangeRates.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;

namespace onetouch.SycCurrencyExchangeRates
{
    [AbpAuthorize(AppPermissions.Pages_Administration_SycCurrencyExchangeRates)]
    public class SycCurrencyExchangeRatesAppService : onetouchAppServiceBase, ISycCurrencyExchangeRatesAppService
    {
        private readonly IRepository<SycCurrencyExchangeRates, long> _sycCurrencyExchangeRatesRepository;
        private readonly ISycCurrencyExchangeRatesExcelExporter _sycCurrencyExchangeRatesExcelExporter;

        public SycCurrencyExchangeRatesAppService(IRepository<SycCurrencyExchangeRates, long> sycCurrencyExchangeRatesRepository, ISycCurrencyExchangeRatesExcelExporter sycCurrencyExchangeRatesExcelExporter)
        {
            _sycCurrencyExchangeRatesRepository = sycCurrencyExchangeRatesRepository;
            _sycCurrencyExchangeRatesExcelExporter = sycCurrencyExchangeRatesExcelExporter;

        }

        public async Task<PagedResultDto<GetSycCurrencyExchangeRatesForViewDto>> GetAll(GetAllSycCurrencyExchangeRatesInput input)
        {

            var filteredSycCurrencyExchangeRates = _sycCurrencyExchangeRatesRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.CurrencyCode.Contains(input.Filter) || e.BaseCurrencyCode.Contains(input.Filter) || e.CurrencyMethod.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CurrencyCodeFilter), e => e.CurrencyCode == input.CurrencyCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BaseCurrencyCodeFilter), e => e.BaseCurrencyCode == input.BaseCurrencyCodeFilter);

            var pagedAndFilteredSycCurrencyExchangeRates = filteredSycCurrencyExchangeRates
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var sycCurrencyExchangeRates = from o in pagedAndFilteredSycCurrencyExchangeRates
                                           select new
                                           {

                                               o.CurrencyCode,
                                               o.BaseCurrencyCode,
                                               o.ExchangeRate,
                                               o.CurrencyMethod,
                                               o.CurrencyUnit,
                                               Id = o.Id
                                           };

            var totalCount = await filteredSycCurrencyExchangeRates.CountAsync();

            var dbList = await sycCurrencyExchangeRates.ToListAsync();
            var results = new List<GetSycCurrencyExchangeRatesForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetSycCurrencyExchangeRatesForViewDto()
                {
                    SycCurrencyExchangeRates = new SycCurrencyExchangeRatesDto
                    {

                        CurrencyCode = o.CurrencyCode,
                        BaseCurrencyCode = o.BaseCurrencyCode,
                        ExchangeRate = o.ExchangeRate,
                        CurrencyMethod = o.CurrencyMethod,
                        CurrencyUnit = o.CurrencyUnit,
                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetSycCurrencyExchangeRatesForViewDto>(
                totalCount,
                results
            );

        }

        public async Task<GetSycCurrencyExchangeRatesForViewDto> GetSycCurrencyExchangeRatesForView(long id)
        {
            var sycCurrencyExchangeRates = await _sycCurrencyExchangeRatesRepository.GetAsync(id);

            var output = new GetSycCurrencyExchangeRatesForViewDto { SycCurrencyExchangeRates = ObjectMapper.Map<SycCurrencyExchangeRatesDto>(sycCurrencyExchangeRates) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCurrencyExchangeRates_Edit)]
        public async Task<GetSycCurrencyExchangeRatesForEditOutput> GetSycCurrencyExchangeRatesForEdit(EntityDto<long> input)
        {
            var sycCurrencyExchangeRates = await _sycCurrencyExchangeRatesRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetSycCurrencyExchangeRatesForEditOutput { SycCurrencyExchangeRates = ObjectMapper.Map<CreateOrEditSycCurrencyExchangeRatesDto>(sycCurrencyExchangeRates) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycCurrencyExchangeRatesDto input)
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

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCurrencyExchangeRates_Create)]
        protected virtual async Task Create(CreateOrEditSycCurrencyExchangeRatesDto input)
        {
            var sycCurrencyExchangeRates = ObjectMapper.Map<SycCurrencyExchangeRates>(input);

            await _sycCurrencyExchangeRatesRepository.InsertAsync(sycCurrencyExchangeRates);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCurrencyExchangeRates_Edit)]
        protected virtual async Task Update(CreateOrEditSycCurrencyExchangeRatesDto input)
        {
            var sycCurrencyExchangeRates = await _sycCurrencyExchangeRatesRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, sycCurrencyExchangeRates);

        }

        [AbpAuthorize(AppPermissions.Pages_Administration_SycCurrencyExchangeRates_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _sycCurrencyExchangeRatesRepository.DeleteAsync(input.Id);
        }

        public async Task<FileDto> GetSycCurrencyExchangeRatesToExcel(GetAllSycCurrencyExchangeRatesForExcelInput input)
        {

            var filteredSycCurrencyExchangeRates = _sycCurrencyExchangeRatesRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.CurrencyCode.Contains(input.Filter) || e.BaseCurrencyCode.Contains(input.Filter) || e.CurrencyMethod.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CurrencyCodeFilter), e => e.CurrencyCode == input.CurrencyCodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.BaseCurrencyCodeFilter), e => e.BaseCurrencyCode == input.BaseCurrencyCodeFilter);

            var query = (from o in filteredSycCurrencyExchangeRates
                         select new GetSycCurrencyExchangeRatesForViewDto()
                         {
                             SycCurrencyExchangeRates = new SycCurrencyExchangeRatesDto
                             {
                                 CurrencyCode = o.CurrencyCode,
                                 BaseCurrencyCode = o.BaseCurrencyCode,
                                 ExchangeRate = o.ExchangeRate,
                                 CurrencyMethod = o.CurrencyMethod,
                                 CurrencyUnit = o.CurrencyUnit,
                                 Id = o.Id
                             }
                         });

            var sycCurrencyExchangeRatesListDtos = await query.ToListAsync();

            return _sycCurrencyExchangeRatesExcelExporter.ExportToFile(sycCurrencyExchangeRatesListDtos);
        }

    }
}