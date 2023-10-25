using onetouch.AutoTaskTicketNotes.Dtos;
using System.Collections.Generic;

namespace onetouch.AutoTaskTickets.Dtos
{
    public class GetTicketForViewDto
    {
        public TicketDto Ticket { get; set; }
        public List<AttachmentInfoDto> Attachments { get; set; }
    }
}