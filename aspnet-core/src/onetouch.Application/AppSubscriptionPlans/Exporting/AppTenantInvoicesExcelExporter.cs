using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppSubscriptionPlans.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppSubscriptionPlans.Exporting
{
    public class AppTenantInvoicesExcelExporter : NpoiExcelExporterBase, IAppTenantInvoicesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppTenantInvoicesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppTenantInvoiceForViewDto> appTenantInvoices)
        {
            return CreateExcelPackage(
                "AppTenantInvoices.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppTenantInvoices"));

                    AddHeader(
                        sheet,
                        L("InvoiceNumber"),
                        L("InvoiceDate"),
                        L("Amount"),
                        L("DueDate"),
                        L("PayDate")
                        );

                    AddObjects(
                        sheet, 2, appTenantInvoices,
                        _ => _.AppTenantInvoice.InvoiceNumber,
                        _ => _timeZoneConverter.Convert(_.AppTenantInvoice.InvoiceDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _.AppTenantInvoice.Amount,
                        _ => _timeZoneConverter.Convert(_.AppTenantInvoice.DueDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _timeZoneConverter.Convert(_.AppTenantInvoice.PayDate, _abpSession.TenantId, _abpSession.GetUserId())
                        );

                    for (var i = 1; i <= appTenantInvoices.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[2], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(2); for (var i = 1; i <= appTenantInvoices.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[4], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(4); for (var i = 1; i <= appTenantInvoices.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[5], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(5);
                });
        }
    }
}