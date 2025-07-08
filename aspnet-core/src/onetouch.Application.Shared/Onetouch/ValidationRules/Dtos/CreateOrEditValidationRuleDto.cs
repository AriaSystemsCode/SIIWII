using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.Onetouch.ValidationRules.Dtos
{
    public class CreateOrEditValidationRuleDto : EntityDto<int?>
    {

        [Required]
        [StringLength(ValidationRuleConsts.MaxFieldNameLength, MinimumLength = ValidationRuleConsts.MinFieldNameLength)]
        public string FieldName { get; set; }

        [Required]
        [StringLength(ValidationRuleConsts.MaxRuleTypeLength, MinimumLength = ValidationRuleConsts.MinRuleTypeLength)]
        public string RuleType { get; set; }

        [StringLength(ValidationRuleConsts.MaxRuleValueLength, MinimumLength = ValidationRuleConsts.MinRuleValueLength)]
        public string RuleValue { get; set; }

        [Required]
        [StringLength(ValidationRuleConsts.MaxErrorMessageLength, MinimumLength = ValidationRuleConsts.MinErrorMessageLength)]
        public string ErrorMessage { get; set; }

    }
}