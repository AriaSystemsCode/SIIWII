using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SycApplications.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SycApplications.Exporting
{
    public class SycApplicationsExcelExporter : NpoiExcelExporterBase, ISycApplicationsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycApplicationsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycApplicationForViewDto> sycApplications)
        {
            return CreateExcelPackage(
                "SycApplications.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("SycApplications"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        L("Notes")
                        );

                    AddObjects(
                        sheet, 2, sycApplications,
                        _ => _.SycApplication.Code,
                        _ => _.SycApplication.Name,
                        _ => _.SycApplication.Notes
                        );

                });
        }
    }
}