using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public class AppTenantActivitiesLogExcelExporter : NpoiExcelExporterBase, IAppTenantActivitiesLogExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppTenantActivitiesLogExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppTenantActivityLogForViewDto> appTenantActivitiesLog)
        {
            return CreateExcelPackage(
                "AppTenantActivitiesLog.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppTenantActivitiesLog"));

                    AddHeader(
                        sheet,
                        L("TenantId"),
                        L("TenantName"),
                        L("UserId"),
                        L("ActivityType"),
                        L("AppSubscriptionPlanHeaderId"),
                        L("AppSubscriptionPlanCode"),
                        L("ActivityDateTime"),
                        L("UserName"),
                        L("FeatureCode"),
                        L("FeatureName"),
                        L("Billable"),
                        L("Invoiced"),
                        L("Reference"),
                        L("Qty"),
                        L("ConsumedQty"),
                        L("RemainingQty"),
                        L("Price"),
                        L("Amount"),
                        L("InvoiceDate"),
                        L("InvoiceNumber"),
                        L("CreditOrUsage"),
                        L("Month"),
                        L("Year")
                        );

                    AddObjects(
                        sheet, 2, appTenantActivitiesLog,
                        _ => _.AppTenantActivityLog.TenantId,
                        _ => _.AppTenantActivityLog.TenantName,
                        _ => _.AppTenantActivityLog.UserId,
                        _ => _.AppTenantActivityLog.ActivityType,
                        _ => _.AppTenantActivityLog.AppSubscriptionPlanHeaderId,
                        _ => _.AppTenantActivityLog.AppSubscriptionPlanCode,
                        _ => _timeZoneConverter.Convert(_.AppTenantActivityLog.ActivityDateTime, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _.AppTenantActivityLog.UserName,
                        _ => _.AppTenantActivityLog.FeatureCode,
                        _ => _.AppTenantActivityLog.FeatureName,
                        _ => _.AppTenantActivityLog.Billable,
                        _ => _.AppTenantActivityLog.Invoiced,
                        _ => _.AppTenantActivityLog.Reference,
                        _ => _.AppTenantActivityLog.Qty,
                        _ => _.AppTenantActivityLog.ConsumedQty,
                        _ => _.AppTenantActivityLog.RemainingQty,
                        _ => _.AppTenantActivityLog.Price,
                        _ => _.AppTenantActivityLog.Amount,
                        _ => _timeZoneConverter.Convert(_.AppTenantActivityLog.InvoiceDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _.AppTenantActivityLog.InvoiceNumber,
                        _ => _.AppTenantActivityLog.CreditOrUsage,
                        _ => _.AppTenantActivityLog.Month,
                        _ => _.AppTenantActivityLog.Year
                        );

                    for (var i = 1; i <= appTenantActivitiesLog.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[7], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(7); for (var i = 1; i <= appTenantActivitiesLog.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[19], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(19);
                });
        }
    }
}