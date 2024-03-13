using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppMarketplaceContact.Dtos
{
    public class CreateOrEditAppMarketplaceAppContactDto : EntityDto<long?>
    {

        [StringLength(AppMarketplaceAppContactConsts.MaxNameLength, MinimumLength = AppMarketplaceAppContactConsts.MinNameLength)]
        public string Name { get; set; }

        [StringLength(AppMarketplaceAppContactConsts.MaxTradeNameLength, MinimumLength = AppMarketplaceAppContactConsts.MinTradeNameLength)]
        public string TradeName { get; set; }

    }
}