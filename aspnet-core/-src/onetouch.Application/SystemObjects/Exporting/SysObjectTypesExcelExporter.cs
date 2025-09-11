using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SystemObjects.Exporting
{
    public class SysObjectTypesExcelExporter : NpoiExcelExporterBase, ISysObjectTypesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SysObjectTypesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSysObjectTypeForViewDto> sysObjectTypes)
        {
            return CreateExcelPackage(
                "SysObjectTypes.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("SysObjectTypes"));

                    AddHeader(
                        sheet,
                        L("Name"),
                        (L("SysObjectType")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sysObjectTypes,
                        _ => _.SysObjectType.Name,
                        _ => _.SysObjectTypeName
                        );

					
					
                });
        }
    }
}
