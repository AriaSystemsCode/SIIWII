using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class CreateOrEditAppSubscriptionPlanHeaderDto : EntityDto<long?>
    {

        [StringLength(AppSubscriptionPlanHeaderConsts.MaxDescriptionLength, MinimumLength = AppSubscriptionPlanHeaderConsts.MinDescriptionLength)]
        public string Description { get; set; }

        public bool IsStandard { get; set; }

        public bool IsBillable { get; set; }

        public decimal Discount { get; set; }

        [StringLength(AppSubscriptionPlanHeaderConsts.MaxBillingCodeLength, MinimumLength = AppSubscriptionPlanHeaderConsts.MinBillingCodeLength)]
        public string BillingCode { get; set; }

        public decimal MonthlyPrice { get; set; }

        public decimal YearlyPrice { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanHeaderConsts.MaxCodeLength, MinimumLength = AppSubscriptionPlanHeaderConsts.MinCodeLength)]
        public string Code { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanHeaderConsts.MaxNameLength, MinimumLength = AppSubscriptionPlanHeaderConsts.MinNameLength)]
        public string Name { get; set; }
        public string EntityStatusCode { set; get; }
        public int? EntityStatusId { get; set; }
    }
}