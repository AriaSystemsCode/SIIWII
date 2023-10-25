using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppTransactions.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppTransactions.Exporting
{
    public class AppTransactionsExcelExporter : NpoiExcelExporterBase, IAppTransactionsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppTransactionsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppTransactionForViewDto> appTransactions)
        {
            return CreateExcelPackage(
                "AppTransactions.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppTransactions"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Date"),
                        L("AddDate"),
                        L("EndDate")
                        );

                    AddObjects(
                        sheet, 2, appTransactions,
                        _ => _.AppTransaction.Code,
                        _ => _timeZoneConverter.Convert(_.AppTransaction.Date, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _timeZoneConverter.Convert(_.AppTransaction.AddDate, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _timeZoneConverter.Convert(_.AppTransaction.EndDate, _abpSession.TenantId, _abpSession.GetUserId())
                        );

                    for (var i = 1; i <= appTransactions.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[2], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(2); for (var i = 1; i <= appTransactions.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[3], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(3); for (var i = 1; i <= appTransactions.Count; i++)
                    {
                        SetCellDataFormat(sheet.GetRow(i).Cells[4], "yyyy-mm-dd");
                    }
                    sheet.AutoSizeColumn(4);
                });
        }
    }
}