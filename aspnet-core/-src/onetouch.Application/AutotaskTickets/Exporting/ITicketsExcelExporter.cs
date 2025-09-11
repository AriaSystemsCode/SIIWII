using System.Collections.Generic;
using onetouch.AutoTaskTickets.Dtos;
using onetouch.Dto;

namespace onetouch.AutoTaskTickets.Exporting
{
    public interface ITicketsExcelExporter
    {
        FileDto ExportToFile(List<GetTicketForViewDto> tickets);
    }
}