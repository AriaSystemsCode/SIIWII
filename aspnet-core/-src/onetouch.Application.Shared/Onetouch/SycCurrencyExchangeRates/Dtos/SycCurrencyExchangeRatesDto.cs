using System;
using Abp.Application.Services.Dto;

namespace onetouch.SycCurrencyExchangeRates.Dtos
{
    public class SycCurrencyExchangeRatesDto : EntityDto<long>
    {
        public string CurrencyCode { get; set; }

        public string BaseCurrencyCode { get; set; }

        public decimal ExchangeRate { get; set; }

        public string CurrencyMethod { get; set; }

        public int CurrencyUnit { get; set; }

    }
}