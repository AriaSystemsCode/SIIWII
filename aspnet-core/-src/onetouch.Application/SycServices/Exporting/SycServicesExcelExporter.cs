using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SycServices.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SycServices.Exporting
{
    public class SycServicesExcelExporter : NpoiExcelExporterBase, ISycServicesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycServicesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycServiceForViewDto> sycServices)
        {
            return CreateExcelPackage(
                "SycServices.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("SycServices"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Description"),
                        L("UnitOfMeasure"),
                        L("UnitPrice"),
                        L("Notes")
                        );

                    AddObjects(
                        sheet, 2, sycServices,
                        _ => _.SycService.Code,
                        _ => _.SycService.Description,
                        _ => _.SycService.UnitOfMeasure,
                        _ => _.SycService.UnitPrice,
                        _ => _.SycService.Notes
                        );

                });
        }
    }
}