using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycPlans.Dtos
{
    public class CreateOrEditSycPlanDto : EntityDto<int?>
    {

        [Required]
        [StringLength(SycPlanConsts.MaxCodeLength, MinimumLength = SycPlanConsts.MinCodeLength)]
        public string Code { get; set; }

        [StringLength(SycPlanConsts.MaxNameLength, MinimumLength = SycPlanConsts.MinNameLength)]
        public string Name { get; set; }

        public string Notes { get; set; }

        public int? ApplicationId { get; set; }

    }
}