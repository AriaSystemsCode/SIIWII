using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppPosts.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppPosts.Exporting
{
    public class AppPostsExcelExporter : NpoiExcelExporterBase, IAppPostsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppPostsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppPostForViewDto> appPosts)
        {
            return CreateExcelPackage(
                "AppPosts.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppPosts"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Description"),
                        //L("Type"),
                        (L("AppContact")) + L("Name"),
                        (L("AppEntity")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, appPosts,
                        _ => _.AppPost.Code,
                        _ => _.AppPost.Description,
                        //_ => _.AppPost.Type,
                        _ => _.AppContactName,
                        _ => _.AppEntityName
                        );

                });
        }
    }
}