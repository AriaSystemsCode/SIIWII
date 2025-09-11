using System.Collections.Generic;
using onetouch.AutoTaskTicketNotes.Dtos;
using onetouch.Dto;

namespace onetouch.AutoTaskTicketNotes.Exporting
{
    public interface ITicketNotesExcelExporter
    {
        FileDto ExportToFile(List<GetTicketNoteForViewDto> ticketNotes);
    }
}