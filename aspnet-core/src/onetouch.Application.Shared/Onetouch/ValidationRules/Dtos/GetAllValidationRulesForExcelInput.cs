using Abp.Application.Services.Dto;
using System;

namespace onetouch.Onetouch.ValidationRules.Dtos
{
    public class GetAllValidationRulesForExcelInput
    {
        public string Filter { get; set; }

        public string FieldNameFilter { get; set; }

        public string RuleTypeFilter { get; set; }

        public string RuleValueFilter { get; set; }

        public string ErrorMessageFilter { get; set; }

    }
}