using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SycCurrencyExchangeRates.Dtos;
using onetouch.Dto;

namespace onetouch.SycCurrencyExchangeRates
{
    public interface ISycCurrencyExchangeRatesAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycCurrencyExchangeRatesForViewDto>> GetAll(GetAllSycCurrencyExchangeRatesInput input);

        Task<GetSycCurrencyExchangeRatesForViewDto> GetSycCurrencyExchangeRatesForView(long id);

        Task<GetSycCurrencyExchangeRatesForEditOutput> GetSycCurrencyExchangeRatesForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditSycCurrencyExchangeRatesDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetSycCurrencyExchangeRatesToExcel(GetAllSycCurrencyExchangeRatesForExcelInput input);

    }
}