using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppEntities.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppEntities.Exporting
{
    public class AppEntitiesExcelExporter : NpoiExcelExporterBase, IAppEntitiesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppEntitiesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppEntityForViewDto> appEntities)
        {
            return CreateExcelPackage(
                "AppEntities.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("AppEntities"));

                    AddHeader(
                        sheet,
                        L("Name"),
                        L("Code"),
                        L("Notes"),
                        (L("SycEntityObjectType")) + L("Name"),
                        (L("SycEntityObjectStatus")) + L("Name"),
                        (L("SydObject")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, appEntities,
                        _ => _.AppEntity.Name,
                        _ => _.AppEntity.Code,
                        _ => _.AppEntity.Notes,
                        _ => _.SycEntityObjectTypeName,
                        _ => _.SycEntityObjectStatusName,
                        _ => _.SydObjectName
                        );

					
					
                });
        }
    }
}
