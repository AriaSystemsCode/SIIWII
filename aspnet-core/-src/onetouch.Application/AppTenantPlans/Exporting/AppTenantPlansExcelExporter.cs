using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppTenantPlans.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppTenantPlans.Exporting
{
    public class AppTenantPlansExcelExporter : NpoiExcelExporterBase, IAppTenantPlansExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppTenantPlansExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppTenantPlanForViewDto> appTenantPlans)
        {
            return CreateExcelPackage(
                "AppTenantPlans.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppTenantPlans"));

                    AddHeader(
                        sheet,
                        L("AddDate"),
                        L("EndDate"),
                        L("StartDate"),
                        (L("SycPlan")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, appTenantPlans,
                        _ => _timeZoneConverter.Convert(_.AppTenantPlan.AddDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _timeZoneConverter.Convert(_.AppTenantPlan.EndDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _timeZoneConverter.Convert(_.AppTenantPlan.StartDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _.SycPlanName
                        );

                    for (var i = 1; i <= appTenantPlans.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[1], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(1); for (var i = 1; i <= appTenantPlans.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[2], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(2); for (var i = 1; i <= appTenantPlans.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[3], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(3);
                });
        }
    }
}