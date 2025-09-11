using Abp.Application.Services.Dto;
using System;

namespace onetouch.SycCurrencyExchangeRates.Dtos
{
    public class GetAllSycCurrencyExchangeRatesInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string CurrencyCodeFilter { get; set; }

        public string BaseCurrencyCodeFilter { get; set; }

    }
}