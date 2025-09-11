using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AutoTaskTickets.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AutoTaskTickets.Exporting
{
    public class TicketsExcelExporter : NpoiExcelExporterBase, ITicketsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public TicketsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetTicketForViewDto> tickets)
        {
            return CreateExcelPackage(
                "Tickets.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("Tickets"));

                    AddHeader(
                        sheet,
                        L("Title"),
                        L("TicketNumber"),
                        L("Description")
                        );

                    AddObjects(
                        sheet, 2, tickets,
                        _ => _.Ticket.Title,
                        _ => _.Ticket.TicketNumber,
                        _ => _.Ticket.Description
                        );

                });
        }
    }
}