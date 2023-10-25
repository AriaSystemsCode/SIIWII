using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SystemObjects.Exporting
{
    public class SydObjectsExcelExporter : NpoiExcelExporterBase, ISydObjectsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SydObjectsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSydObjectForViewDto> sydObjects)
        {
            return CreateExcelPackage(
                "SydObjects.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("SydObjects"));

                    AddHeader(
                        sheet,
                        L("Name"),
                        L("Code"),
                        (L("SysObjectType")) + L("Name"),
                        (L("SydObject")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sydObjects,
                        _ => _.SydObject.Name,
                        _ => _.SydObject.Code,
                        _ => _.SysObjectTypeName,
                        _ => _.SydObjectName
                        );

					
					
                });
        }
    }
}
