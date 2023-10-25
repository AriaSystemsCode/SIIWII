using System;
using System.Collections.Generic;

namespace onetouch.AutoTaskTicketNotes.Dtos
{
    public class GetTicketNoteForViewDto
    {
        public TicketNoteDto TicketNote { get; set; }

        public string TicketTicketNumber { get; set; }

        public string CreateUserName { get; set; }

        public List<AttachmentInfoDto> Attachments { get; set; }
    }
}