using Abp.Application.Services.Dto;
using System;

namespace onetouch.AutoTaskTickets.Dtos
{
    public class GetAllTicketsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string TitleFilter { get; set; }

        public string TicketNumberFilter { get; set; }

        public string DescriptionFilter { get; set; }

    }
}