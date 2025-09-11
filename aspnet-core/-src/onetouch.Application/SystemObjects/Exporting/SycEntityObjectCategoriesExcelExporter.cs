using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SystemObjects.Exporting
{
    public class SycEntityObjectCategoriesExcelExporter : NpoiExcelExporterBase, ISycEntityObjectCategoriesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycEntityObjectCategoriesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycEntityObjectCategoryForViewDto> sycEntityObjectCategories)
        {
            return CreateExcelPackage(
                "SycEntityObjectCategories.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("SycEntityObjectCategories"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        (L("SydObject")) + L("Name"),
                        (L("SycEntityObjectCategory")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sycEntityObjectCategories,
                        _ => _.SycEntityObjectCategory.Code,
                        _ => _.SycEntityObjectCategory.Name,
                        _ => _.SydObjectName,
                        _ => _.SycEntityObjectCategoryName
                        );

					
					
                });
        }
    }
}
