using System.Collections.Generic;
using onetouch.SycCurrencyExchangeRates.Dtos;
using onetouch.Dto;

namespace onetouch.SycCurrencyExchangeRates.Exporting
{
    public interface ISycCurrencyExchangeRatesExcelExporter
    {
        FileDto ExportToFile(List<GetSycCurrencyExchangeRatesForViewDto> sycCurrencyExchangeRates);
    }
}