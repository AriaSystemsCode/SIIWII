using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.Onetouch.ValidationRules.Dtos
{
    public class GetValidationRuleForEditOutput
    {
        public CreateOrEditValidationRuleDto ValidationRule { get; set; }

    }
}