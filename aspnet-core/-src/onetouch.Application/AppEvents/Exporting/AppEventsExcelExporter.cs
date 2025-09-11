using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppEvents.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppEvents.Exporting
{
    public class AppEventsExcelExporter : NpoiExcelExporterBase, IAppEventsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppEventsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppEventForViewDto> appEvents)
        {
            return CreateExcelPackage(
                "AppEvents.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppEvents"));

                    AddHeader(
                        sheet,
                        (L("AppEntity")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, appEvents, null
                        
                        );

                });
        }
    }
}