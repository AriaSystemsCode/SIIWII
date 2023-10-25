using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AutoTaskTicketNotes.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AutoTaskTicketNotes.Exporting
{
    public class TicketNotesExcelExporter : NpoiExcelExporterBase, ITicketNotesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public TicketNotesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetTicketNoteForViewDto> ticketNotes)
        {
            return CreateExcelPackage(
                "TicketNotes.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("TicketNotes"));

                    AddHeader(
                        sheet,
                        L("Title"),
                        L("Description"),
                        (L("Ticket")) + L("TicketNumber")
                        );

                    AddObjects(
                        sheet, 2, ticketNotes,
                        _ => _.TicketNote.Title,
                        _ => _.TicketNote.Description,
                        _ => _.TicketTicketNumber
                        );

                });
        }
    }
}