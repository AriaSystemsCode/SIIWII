using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SystemObjects.Exporting
{
    public class SycAttachmentCategoriesExcelExporter : NpoiExcelExporterBase, ISycAttachmentCategoriesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycAttachmentCategoriesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycAttachmentCategoryForViewDto> sycAttachmentCategories)
        {
            return CreateExcelPackage(
                "SycAttachmentCategories.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("SycAttachmentCategories"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        L("Attributes"),
                        L("ParentCode"),
                        (L("SycAttachmentCategory")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, sycAttachmentCategories,
                        _ => _.SycAttachmentCategory.Code,
                        _ => _.SycAttachmentCategory.Name,
                        _ => _.SycAttachmentCategory.Attributes,
                        _ => _.SycAttachmentCategory.ParentCode,
                        _ => _.SycAttachmentCategoryName
                        );

					
					
                });
        }
    }
}
