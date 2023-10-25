using Abp.Application.Services.Dto;
using System;

namespace onetouch.AutoTaskTicketNotes.Dtos
{
    public class GetAllTicketNotesForExcelInput
    {
        public string Filter { get; set; }

        public string TitleFilter { get; set; }

        public string DescriptionFilter { get; set; }

        public string TicketTicketNumberFilter { get; set; }

    }
}