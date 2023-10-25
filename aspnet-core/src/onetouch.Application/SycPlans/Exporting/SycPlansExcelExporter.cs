using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SycPlans.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SycPlans.Exporting
{
    public class SycPlansExcelExporter : NpoiExcelExporterBase, ISycPlansExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycPlansExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycPlanForViewDto> sycPlans)
        {
            return CreateExcelPackage(
                "SycPlans.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("SycPlans"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        L("Notes"),
                        (L("SycApplication")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sycPlans,
                        _ => _.SycPlan.Code,
                        _ => _.SycPlan.Name,
                        _ => _.SycPlan.Notes,
                        _ => _.SycApplicationName
                        );

                });
        }
    }
}