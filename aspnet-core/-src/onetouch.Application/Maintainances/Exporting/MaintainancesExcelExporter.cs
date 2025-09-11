using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.Maintainances.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.Maintainances.Exporting
{
    public class MaintainancesExcelExporter : NpoiExcelExporterBase, IMaintainancesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public MaintainancesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetMaintainanceForViewDto> maintainances)
        {
            return CreateExcelPackage(
                    "Maintainances.xlsx",
                    excelPackage =>
                    {

                        var sheet = excelPackage.CreateSheet(L("Maintainances"));

                        AddHeader(
                            sheet,
                        L("Name"),
                        L("Description"),
                        L("From"),
                        L("To"),
                        L("Published"),
                        L("DismissIds")
                            );

                        AddObjects(
                            sheet, 2, maintainances,
                        _ => _.Maintainance.Name,
                        _ => _.Maintainance.Description,
                        _ => _timeZoneConverter.Convert(_.Maintainance.From, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _timeZoneConverter.Convert(_.Maintainance.To, _abpSession.TenantId, _abpSession.GetUserId()),
                        _ => _.Maintainance.Published,
                        _ => _.Maintainance.DismissIds
                            );

                        for (var i = 1; i <= maintainances.Count; i++)
                        {
                            SetCellDataFormat(sheet.GetRow(i).Cells[3 - 1], "yyyy-mm-dd");
                        }
                        sheet.AutoSizeColumn(3 - 1); for (var i = 1; i <= maintainances.Count; i++)
                        {
                            SetCellDataFormat(sheet.GetRow(i).Cells[4 - 1], "yyyy-mm-dd");
                        }
                        sheet.AutoSizeColumn(4 - 1);
                    });

        }
    }
}