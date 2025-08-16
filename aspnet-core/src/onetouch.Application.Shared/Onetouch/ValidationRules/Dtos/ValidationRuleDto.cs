using System;
using Abp.Application.Services.Dto;

namespace onetouch.Onetouch.ValidationRules.Dtos
{
    public class ValidationRuleDto : EntityDto
    {
        public string FieldName { get; set; }

        public string RuleType { get; set; }

        public string RuleValue { get; set; }

        public string ErrorMessage { get; set; }

    }
}