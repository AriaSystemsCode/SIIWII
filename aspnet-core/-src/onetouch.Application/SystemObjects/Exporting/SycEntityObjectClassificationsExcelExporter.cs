using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SystemObjects.Exporting
{
    public class SycEntityObjectClassificationsExcelExporter : NpoiExcelExporterBase, ISycEntityObjectClassificationsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycEntityObjectClassificationsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycEntityObjectClassificationForViewDto> sycEntityObjectClassifications)
        {
            return CreateExcelPackage(
                "SycEntityObjectClassifications.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("SycEntityObjectClassifications"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        (L("SydObject")) + L("Name"),
                        (L("SycEntityObjectClassification")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sycEntityObjectClassifications,
                        _ => _.SycEntityObjectClassification.Code,
                        _ => _.SycEntityObjectClassification.Name,
                        _ => _.SydObjectName,
                        _ => _.SycEntityObjectClassificationName
                        );

					
					
                });
        }
    }
}
