using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class CreateOrEditAppTenantSubscriptionPlanDto : EntityDto<long?>
    {

        public long TenantId { get; set; }

        [Required]
        [StringLength(AppTenantSubscriptionPlanConsts.MaxTenantNameLength, MinimumLength = AppTenantSubscriptionPlanConsts.MinTenantNameLength)]
        public string TenantName { get; set; }

        public long AppSubscriptionPlanHeaderId { get; set; }

        [Required]
        [StringLength(AppTenantSubscriptionPlanConsts.MaxSubscriptionPlanCodeLength, MinimumLength = AppTenantSubscriptionPlanConsts.MinSubscriptionPlanCodeLength)]
        public string SubscriptionPlanCode { get; set; }

        public DateTime CurrentPeriodStartDate { get; set; }

        public DateTime CurrentPeriodEndDate { get; set; }

        [Required]
        [StringLength(AppTenantSubscriptionPlanConsts.MaxBillingPeriodLength, MinimumLength = AppTenantSubscriptionPlanConsts.MinBillingPeriodLength)]
        public string BillingPeriod { get; set; }

        public bool AllowOverAge { get; set; }

    }
}