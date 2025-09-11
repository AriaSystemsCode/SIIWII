using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycPlanServices.Dtos
{
    public class CreateOrEditSycPlanServiceDto : EntityDto<int?>
    {

        [StringLength(SycPlanServiceConsts.MaxUnitOfMeasureLength, MinimumLength = SycPlanServiceConsts.MinUnitOfMeasureLength)]
        public string UnitOfMeasure { get; set; }

        public decimal UnitPrice { get; set; }

        public int Units { get; set; }

        [StringLength(SycPlanServiceConsts.MaxBillingFrequencyLength, MinimumLength = SycPlanServiceConsts.MinBillingFrequencyLength)]
        public string BillingFrequency { get; set; }

        public int MinimumUnits { get; set; }

        public int? ApplicationId { get; set; }

        public int? PlanId { get; set; }

        public int? ServiceId { get; set; }

    }
}