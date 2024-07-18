using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycCurrencyExchangeRates.Dtos
{
    public class CreateOrEditSycCurrencyExchangeRatesDto : EntityDto<long?>
    {

        [Required]
        [StringLength(SycCurrencyExchangeRatesConsts.MaxCurrencyCodeLength, MinimumLength = SycCurrencyExchangeRatesConsts.MinCurrencyCodeLength)]
        public string CurrencyCode { get; set; }

        [Required]
        [StringLength(SycCurrencyExchangeRatesConsts.MaxBaseCurrencyCodeLength, MinimumLength = SycCurrencyExchangeRatesConsts.MinBaseCurrencyCodeLength)]
        public string BaseCurrencyCode { get; set; }

        public decimal ExchangeRate { get; set; }

        [StringLength(SycCurrencyExchangeRatesConsts.MaxCurrencyMethodLength, MinimumLength = SycCurrencyExchangeRatesConsts.MinCurrencyMethodLength)]
        public string CurrencyMethod { get; set; }

        public int CurrencyUnit { get; set; }

    }
}