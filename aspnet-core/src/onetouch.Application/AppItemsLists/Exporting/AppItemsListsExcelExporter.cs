using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppItemsLists.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppItemsLists.Exporting
{
    public class AppItemsListsExcelExporter : NpoiExcelExporterBase, IAppItemsListsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppItemsListsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppItemsListForViewDto> appItemsLists)
        {
            return CreateExcelPackage(
                "AppItemsLists.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppItemsLists"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        L("SharingLevel")
                        );

                    AddObjects(
                        sheet, 2, appItemsLists,
                        _ => _.AppItemsList.Code,
                        _ => _.AppItemsList.Name,
                        _ => _.AppItemsList.SharingLevel
                        );

                });
        }
    }
}