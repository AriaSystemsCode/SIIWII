using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public class AppTenantSubscriptionPlansExcelExporter : NpoiExcelExporterBase, IAppTenantSubscriptionPlansExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppTenantSubscriptionPlansExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppTenantSubscriptionPlanForViewDto> appTenantSubscriptionPlans)
        {
            return CreateExcelPackage(
                "AppTenantSubscriptionPlans.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppTenantSubscriptionPlans"));

                    AddHeader(
                        sheet,
                        L("TenantName"),
                        L("AppSubscriptionHeaderId"),
                        L("SubscriptionPlanCode"),
                        L("CurrentPeriodStartDate"),
                        L("CurrentPeriodEndDate"),
                        L("BillingPeriod"),
                        L("AllowOverAge")
                        );

                    AddObjects(
                        sheet, 2, appTenantSubscriptionPlans,
                        _ => _.AppTenantSubscriptionPlan.TenantName,
                        _ => _.AppTenantSubscriptionPlan.AppSubscriptionHeaderId,
                        _ => _.AppTenantSubscriptionPlan.SubscriptionPlanCode,
                        _ => _timeZoneConverter.Convert(_.AppTenantSubscriptionPlan.CurrentPeriodStartDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _timeZoneConverter.Convert(_.AppTenantSubscriptionPlan.CurrentPeriodEndDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _.AppTenantSubscriptionPlan.BillingPeriod,
                        _ => _.AppTenantSubscriptionPlan.AllowOverAge
                        );

                    for (var i = 1; i <= appTenantSubscriptionPlans.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[4], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(4); for (var i = 1; i <= appTenantSubscriptionPlans.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[5], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(5);
                });
        }
    }
}