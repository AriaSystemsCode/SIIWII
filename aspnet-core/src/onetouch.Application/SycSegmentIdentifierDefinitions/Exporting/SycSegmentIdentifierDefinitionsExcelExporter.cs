﻿using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SycSegmentIdentifierDefinitions.Exporting
{
    public class SycSegmentIdentifierDefinitionsExcelExporter : NpoiExcelExporterBase, ISycSegmentIdentifierDefinitionsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycSegmentIdentifierDefinitionsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycSegmentIdentifierDefinitionForViewDto> sycSegmentIdentifierDefinitions)
        {
            return CreateExcelPackage(
                "SycSegmentIdentifierDefinitions.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("SycSegmentIdentifierDefinitions"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        L("SegmentNumber"),
                        L("SegmentHeader"),
                        L("SegmentMask"),
                        L("SegmentLength"),
                        L("SegmentType"),
                        L("IsAutoGenerated"),
                        L("IsEditable"),
                        L("IsVisible"),
                        L("CodeStartingValue"),
                        L("LookOrFieldName"),
                        (L("SycIdentifierDefinition")) + L("Code")
                        );

                    AddObjects(
                        sheet, 2, sycSegmentIdentifierDefinitions,
                        _ => _.SycSegmentIdentifierDefinition.Code,
                        _ => _.SycSegmentIdentifierDefinition.Name,
                        _ => _.SycSegmentIdentifierDefinition.SegmentNumber,
                        _ => _.SycSegmentIdentifierDefinition.SegmentHeader,
                        _ => _.SycSegmentIdentifierDefinition.SegmentMask,
                        _ => _.SycSegmentIdentifierDefinition.SegmentLength,
                        _ => _.SycSegmentIdentifierDefinition.SegmentType,
                        _ => _.SycSegmentIdentifierDefinition.IsAutoGenerated,
                        _ => _.SycSegmentIdentifierDefinition.IsEditable,
                        _ => _.SycSegmentIdentifierDefinition.IsVisible,
                        _ => _.SycSegmentIdentifierDefinition.CodeStartingValue,
                        _ => _.SycSegmentIdentifierDefinition.LookOrFieldName,
                        _ => _.SycIdentifierDefinitionCode
                        );

                });
        }
    }
}