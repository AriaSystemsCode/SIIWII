using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppMarketplaceContact.Dtos
{
    public class GetAppMarketplaceAppContactForEditOutput
    {
        public CreateOrEditAppMarketplaceAppContactDto AppMarketplaceAppContact { get; set; }

    }
}