using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AutoTaskTicketNotes.Dtos;

namespace onetouch.AutoTaskTickets.Dtos
{
    public class GetTicketForEditOutput
    {
        public CreateOrEditTicketDto Ticket { get; set; }
        public List<AttachmentInfoDto> Attachments { get; set; }

    }
}