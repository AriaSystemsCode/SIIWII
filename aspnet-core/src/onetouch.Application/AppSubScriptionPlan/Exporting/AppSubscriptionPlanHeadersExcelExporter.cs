using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public class AppSubscriptionPlanHeadersExcelExporter : NpoiExcelExporterBase, IAppSubscriptionPlanHeadersExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppSubscriptionPlanHeadersExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppSubscriptionPlanHeaderForViewDto> appSubscriptionPlanHeaders)
        {
            return CreateExcelPackage(
                "AppSubscriptionPlanHeaders.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppSubscriptionPlanHeaders"));

                    AddHeader(
                        sheet,
                        L("Description"),
                        L("IsStandard"),
                        L("IsBillable"),
                        L("Discount"),
                        L("BillingCode"),
                        L("MonthlyPrice"),
                        L("YearlyPrice"),
                        L("Code"),
                        L("Name")
                        );

                    AddObjects(
                        sheet, 2, appSubscriptionPlanHeaders,
                        _ => _.AppSubscriptionPlanHeader.Description,
                        _ => _.AppSubscriptionPlanHeader.IsStandard,
                        _ => _.AppSubscriptionPlanHeader.IsBillable,
                        _ => _.AppSubscriptionPlanHeader.Discount,
                        _ => _.AppSubscriptionPlanHeader.BillingCode,
                        _ => _.AppSubscriptionPlanHeader.MonthlyPrice,
                        _ => _.AppSubscriptionPlanHeader.YearlyPrice,
                        _ => _.AppSubscriptionPlanHeader.Code,
                        _ => _.AppSubscriptionPlanHeader.Name
                        );

                });
        }
    }
}