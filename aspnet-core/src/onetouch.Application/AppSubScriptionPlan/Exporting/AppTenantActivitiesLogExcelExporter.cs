using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;
using onetouch.Storage;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public class AppTenantActivitiesLogExcelExporter : NpoiExcelExporterBase, IAppTenantActivitiesLogExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;
        private readonly ITempFileCacheManager _tempFileCacheManager;

        public AppTenantActivitiesLogExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _tempFileCacheManager = tempFileCacheManager;
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
        //MMT[Start]
        [HttpPost]
        public async Task<FileDto> ExportAppTenantActivitiesLogToExcel(
    List<GetAppTenantActivityLogForViewDto> appTenantActivitiesLog)
        {
            using var workbook = new XLWorkbook();

            var sheet = workbook.Worksheets.Add("AppTenantActivitiesLog");

            // Headers
            sheet.Cell(1, 1).Value = L("TenantId");
            sheet.Cell(1, 2).Value = L("TenantName");
            sheet.Cell(1, 3).Value = L("UserId");
            sheet.Cell(1, 4).Value = L("ActivityType");
            sheet.Cell(1, 5).Value = L("AppSubscriptionPlanHeaderId");
            sheet.Cell(1, 6).Value = L("AppSubscriptionPlanCode");
            sheet.Cell(1, 7).Value = L("ActivityDateTime");
            sheet.Cell(1, 8).Value = L("UserName");
            sheet.Cell(1, 9).Value = L("FeatureCode");
            sheet.Cell(1, 10).Value = L("FeatureName");
            sheet.Cell(1, 11).Value = L("Billable");
            sheet.Cell(1, 12).Value = L("Invoiced");
            sheet.Cell(1, 13).Value = L("Reference");
            sheet.Cell(1, 14).Value = L("Qty");
            sheet.Cell(1, 15).Value = L("ConsumedQty");
            sheet.Cell(1, 16).Value = L("RemainingQty");
            sheet.Cell(1, 17).Value = L("Price");
            sheet.Cell(1, 18).Value = L("Amount");
            sheet.Cell(1, 19).Value = L("InvoiceDate");
            sheet.Cell(1, 20).Value = L("InvoiceNumber");
            sheet.Cell(1, 21).Value = L("CreditOrUsage");
            sheet.Cell(1, 22).Value = L("Month");
            sheet.Cell(1, 23).Value = L("Year");

            var row = 2;

            foreach (var dto in appTenantActivitiesLog)
            {
                var item = dto.AppTenantActivityLog;

                sheet.Cell(row, 1).Value = item.TenantId;
                sheet.Cell(row, 2).Value = item.TenantName;
                sheet.Cell(row, 3).Value = item.UserId;
                sheet.Cell(row, 4).Value = item.ActivityType;
                sheet.Cell(row, 5).Value = item.AppSubscriptionPlanHeaderId;
                sheet.Cell(row, 6).Value = item.AppSubscriptionPlanCode;

                sheet.Cell(row, 7).Value =
                    _timeZoneConverter.Convert(
                        item.ActivityDateTime,
                        _abpSession.TenantId,
                        _abpSession.GetUserId());

                sheet.Cell(row, 8).Value = item.UserName;
                sheet.Cell(row, 9).Value = item.FeatureCode;
                sheet.Cell(row, 10).Value = item.FeatureName;
                sheet.Cell(row, 11).Value = item.Billable;
                sheet.Cell(row, 12).Value = item.Invoiced;
                sheet.Cell(row, 13).Value = item.Reference;
                sheet.Cell(row, 14).Value = item.Qty;
                sheet.Cell(row, 15).Value = item.ConsumedQty;
                sheet.Cell(row, 16).Value = item.RemainingQty;
                sheet.Cell(row, 17).Value = item.Price;
                sheet.Cell(row, 18).Value = item.Amount;

                sheet.Cell(row, 19).Value =
                    _timeZoneConverter.Convert(
                        item.InvoiceDate,
                        _abpSession.TenantId,
                        _abpSession.GetUserId());

                sheet.Cell(row, 20).Value = item.InvoiceNumber;
                sheet.Cell(row, 21).Value = item.CreditOrUsage;
                sheet.Cell(row, 22).Value = item.Month;
                sheet.Cell(row, 23).Value = item.Year;

                row++;
            }

            sheet.Column(7).Style.DateFormat.Format = "yyyy-mm-dd";
            sheet.Column(19).Style.DateFormat.Format = "yyyy-mm-dd";

            sheet.Row(1).Style.Font.Bold = true;
            sheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();

            workbook.SaveAs(stream);

            var fileBytes = stream.ToArray();

            // Store the file using ASP.NET Zero's temporary file system
            var file = new FileDto(
                "AppTenantActivitiesLog.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

             _tempFileCacheManager.SetFile(
      file.FileToken,
      fileBytes);

            return file;
        }
        //MMT[End]
    }
}