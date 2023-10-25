using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppItems.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppItems.Exporting
{
    public class AppItemsExcelExporter : NpoiExcelExporterBase, IAppItemsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppItemsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppItemForViewDto> appItems)
        {
            return CreateExcelPackage(
                "AppItems.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppItems"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        L("Description"),
                        L("Price")
                        );

                    AddObjects(
                        sheet, 2, appItems,
                        _ => _.AppItem.Code,
                        _ => _.AppItem.Name,
                        _ => _.AppItem.Description,
                        _ => _.AppItem.Price
                        );

                });
        }
    }
}