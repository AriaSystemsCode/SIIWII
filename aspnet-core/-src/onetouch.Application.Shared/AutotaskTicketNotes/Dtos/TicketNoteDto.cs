using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;

namespace onetouch.AutoTaskTicketNotes.Dtos
{
    public class TicketNoteDto : EntityDto<long>
    {
        public string Title { get; set; }

        public string Description { get; set; }

        public int? TicketId { get; set; }
        public DateTime? CreateDateTime { get; set; }
        public long? CreatorUserId { get; set; }
        public long? QueueID { get; set; }
    }
}