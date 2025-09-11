using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SycIdentifierDefinitions.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SycIdentifierDefinitions.Exporting
{
    public class SycIdentifierDefinitionsExcelExporter : NpoiExcelExporterBase, ISycIdentifierDefinitionsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycIdentifierDefinitionsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycIdentifierDefinitionForViewDto> sycIdentifierDefinitions)
        {
            return CreateExcelPackage(
                "SycIdentifierDefinitions.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("SycIdentifierDefinitions"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("IsTenantLevel"),
                        L("NumberOfSegments"),
                        L("MaxLength"),
                        L("MinSegmentLength"),
                        L("MaxSegmentLength")
                        );

                    AddObjects(
                        sheet, 2, sycIdentifierDefinitions,
                        _ => _.SycIdentifierDefinition.Code,
                        _ => _.SycIdentifierDefinition.IsTenantLevel,
                        _ => _.SycIdentifierDefinition.NumberOfSegments,
                        _ => _.SycIdentifierDefinition.MaxLength,
                        _ => _.SycIdentifierDefinition.MinSegmentLength,
                        _ => _.SycIdentifierDefinition.MaxSegmentLength
                        );

                });
        }
    }
}