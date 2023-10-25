using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SycPlanServices.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SycPlanServices.Exporting
{
    public class SycPlanServicesExcelExporter : NpoiExcelExporterBase, ISycPlanServicesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycPlanServicesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycPlanServiceForViewDto> sycPlanServices)
        {
            return CreateExcelPackage(
                "SycPlanServices.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("SycPlanServices"));

                    AddHeader(
                        sheet,
                        L("UnitOfMeasure"),
                        L("UnitPrice"),
                        L("Units"),
                        L("BillingFrequency"),
                        L("MinimumUnits"),
                        (L("SycApplication")) + L("Name"),
                        (L("SycPlan")) + L("Name"),
                        (L("SycService")) + L("Code")
                        );

                    AddObjects(
                        sheet, 2, sycPlanServices,
                        _ => _.SycPlanService.UnitOfMeasure,
                        _ => _.SycPlanService.UnitPrice,
                        _ => _.SycPlanService.Units,
                        _ => _.SycPlanService.BillingFrequency,
                        _ => _.SycPlanService.MinimumUnits,
                        _ => _.SycApplicationName,
                        _ => _.SycPlanName,
                        _ => _.SycServiceCode
                        );

                });
        }
    }
}