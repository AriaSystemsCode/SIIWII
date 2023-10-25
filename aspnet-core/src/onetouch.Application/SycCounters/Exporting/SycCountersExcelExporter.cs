using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SycCounters.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SycCounters.Exporting
{
    public class SycCountersExcelExporter : NpoiExcelExporterBase, ISycCountersExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycCountersExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycCounterForViewDto> sycCounters)
        {
            return CreateExcelPackage(
                "SycCounters.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("SycCounters"));

                    AddHeader(
                        sheet,
                        L("Counter"),
                        (L("SycSegmentIdentifierDefinition")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sycCounters,
                        _ => _.SycCounter.Counter,
                        _ => _.SycSegmentIdentifierDefinitionName
                        );

                });
        }
    }
}