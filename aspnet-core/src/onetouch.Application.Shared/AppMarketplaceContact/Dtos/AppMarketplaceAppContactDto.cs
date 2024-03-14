using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppMarketplaceContact.Dtos
{
    public class AppMarketplaceAppContactDto : EntityDto<long>
    {
        public string Name { get; set; }

        public string TradeName { get; set; }

    }
}