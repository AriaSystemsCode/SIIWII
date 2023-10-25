using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SystemObjects.Exporting
{
    public class SycEntityObjectTypesExcelExporter : NpoiExcelExporterBase, ISycEntityObjectTypesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycEntityObjectTypesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycEntityObjectTypeForViewDto> sycEntityObjectTypes)
        {
            return CreateExcelPackage(
                "SycEntityObjectTypes.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("SycEntityObjectTypes"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        L("ExtraAttributes"),
                        (L("SydObject")) + L("Name"),
                        (L("SycEntityObjectType")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sycEntityObjectTypes,
                        _ => _.SycEntityObjectType.Code,
                        _ => _.SycEntityObjectType.Name,
                        _ => _.SycEntityObjectType.ExtraAttributes,
                        _ => _.SydObjectName,
                        _ => _.SycEntityObjectTypeName
                        );

					
					
                });
        }
    }
}
