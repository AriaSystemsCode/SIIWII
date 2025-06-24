using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.Onetouch.ValidationRules
{
    [Table("ValidationRules")]
    [Audited]
    public class ValidationRule : Entity
    {

        [Required]
        [StringLength(ValidationRuleConsts.MaxFieldNameLength, MinimumLength = ValidationRuleConsts.MinFieldNameLength)]
        public virtual string FieldName { get; set; }

        [Required]
        [StringLength(ValidationRuleConsts.MaxRuleTypeLength, MinimumLength = ValidationRuleConsts.MinRuleTypeLength)]
        public virtual string RuleType { get; set; }

        [StringLength(ValidationRuleConsts.MaxRuleValueLength, MinimumLength = ValidationRuleConsts.MinRuleValueLength)]
        public virtual string RuleValue { get; set; }

        [Required]
        [StringLength(ValidationRuleConsts.MaxErrorMessageLength, MinimumLength = ValidationRuleConsts.MinErrorMessageLength)]
        public virtual string ErrorMessage { get; set; }

    }
}