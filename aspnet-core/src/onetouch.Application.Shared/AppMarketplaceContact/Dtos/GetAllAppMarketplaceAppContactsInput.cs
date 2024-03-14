using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppMarketplaceContact.Dtos
{
    public class GetAllAppMarketplaceAppContactsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string NameFilter { get; set; }

        public string TradeNameFilter { get; set; }

    }
}