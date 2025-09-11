using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppEventGuests.Dtos
{
    public class GetAllAppEventGuestsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public int? MaxUserResponceFilter { get; set; }
        public int? MinUserResponceFilter { get; set; }

        public long? EventIdFilter { get; set; }
        public bool CurrentUserFilter { get; set; }

    }
}