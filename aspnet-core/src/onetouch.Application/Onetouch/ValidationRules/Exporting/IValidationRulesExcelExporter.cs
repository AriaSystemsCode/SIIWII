using System.Collections.Generic;
using onetouch.Onetouch.ValidationRules.Dtos;
using onetouch.Dto;

namespace onetouch.Onetouch.ValidationRules.Exporting
{
    public interface IValidationRulesExcelExporter
    {
        FileDto ExportToFile(List<GetValidationRuleForViewDto> validationRules);
    }
}