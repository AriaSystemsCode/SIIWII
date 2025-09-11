using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycCurrencyExchangeRates.Dtos
{
    public class GetSycCurrencyExchangeRatesForEditOutput
    {
        public CreateOrEditSycCurrencyExchangeRatesDto SycCurrencyExchangeRates { get; set; }

    }
}