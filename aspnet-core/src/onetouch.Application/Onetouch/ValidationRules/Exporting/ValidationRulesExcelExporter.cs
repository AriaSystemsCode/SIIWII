using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.Onetouch.ValidationRules.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.Onetouch.ValidationRules.Exporting
{
    public class ValidationRulesExcelExporter : NpoiExcelExporterBase, IValidationRulesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public ValidationRulesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetValidationRuleForViewDto> validationRules)
        {
            return CreateExcelPackage(
                "ValidationRules.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("ValidationRules"));

                    AddHeader(
                        sheet,
                        L("FieldName"),
                        L("RuleType"),
                        L("RuleValue"),
                        L("ErrorMessage")
                        );

                    AddObjects(
                        sheet, 2, validationRules,
                        _ => _.ValidationRule.FieldName,
                        _ => _.ValidationRule.RuleType,
                        _ => _.ValidationRule.RuleValue,
                        _ => _.ValidationRule.ErrorMessage
                        );

                });
        }
    }
}