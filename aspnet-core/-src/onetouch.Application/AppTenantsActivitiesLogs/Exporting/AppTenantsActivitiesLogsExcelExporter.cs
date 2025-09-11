using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppTenantsActivitiesLogs.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppTenantsActivitiesLogs.Exporting
{
    public class AppTenantsActivitiesLogsExcelExporter : NpoiExcelExporterBase, IAppTenantsActivitiesLogsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppTenantsActivitiesLogsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppTenantsActivitiesLogForViewDto> appTenantsActivitiesLogs)
        {
            return CreateExcelPackage(
                "AppTenantsActivitiesLogs.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppTenantsActivitiesLogs"));

                    AddHeader(
                        sheet,
                        L("ActivityDate"),
                        L("Units"),
                        L("UnitPrice"),
                        L("Amount"),
                        L("Billed"),
                        L("IsManual"),
                        L("InvoiceNumber"),
                        L("InvoiceDate"),
                        (L("SycService")) + L("Code"),
                        (L("SycApplication")) + L("Name"),
                        (L("AppTransaction")) + L("Code"),
                        (L("SycPlan")) + L("Name"),
                        (L("Tenant")) + L("Name"),
                        L("Notes")
                        );

                    AddObjects(
                        sheet, 2, appTenantsActivitiesLogs,
                        _ => _timeZoneConverter.Convert(_.AppTenantsActivitiesLog.ActivityDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _.AppTenantsActivitiesLog.Units,
                        _ => _.AppTenantsActivitiesLog.UnitPrice,
                        _ => _.AppTenantsActivitiesLog.Amount,
                        _ => _.AppTenantsActivitiesLog.Billed,
                        _ => _.AppTenantsActivitiesLog.IsManual,
                        _ => _.AppTenantsActivitiesLog.InvoiceNumber,
                        _ => _timeZoneConverter.Convert(_.AppTenantsActivitiesLog.InvoiceDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _.SycServiceCode,
                        _ => _.SycApplicationName,
                        _ => _.AppTransactionCode,
                        _ => _.SycPlanName,
                        _ => _.TenancyName,
                        _ => _.Notes
                        );

                    for (var i = 1; i <= appTenantsActivitiesLogs.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[1], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(1); for (var i = 1; i <= appTenantsActivitiesLogs.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[8], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(8);
                });
        }
    }
}