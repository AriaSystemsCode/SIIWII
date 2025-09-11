using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SystemObjects.Exporting
{
    public class SycEntityObjectStatusesExcelExporter : NpoiExcelExporterBase, ISycEntityObjectStatusesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycEntityObjectStatusesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycEntityObjectStatusForViewDto> sycEntityObjectStatuses)
        {
            return CreateExcelPackage(
                "SycEntityObjectStatuses.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("SycEntityObjectStatuses"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        (L("SydObject")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sycEntityObjectStatuses,
                        _ => _.SycEntityObjectStatus.Code,
                        _ => _.SycEntityObjectStatus.Name,
                        _ => _.SydObjectName
                        );

					
					
                });
        }
    }
}
