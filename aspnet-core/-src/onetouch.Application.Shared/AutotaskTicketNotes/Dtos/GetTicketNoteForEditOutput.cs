using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AutoTaskTicketNotes.Dtos
{
    public class GetTicketNoteForEditOutput
    {
        public CreateOrEditTicketNoteDto TicketNote { get; set; }

        public string TicketTicketNumber { get; set; }
     
        public string CreateUserName { get; set; }

    }
}