using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class AppTenantSubscriptionPlanDto : EntityDto<long>
    {
        public string TenantName { get; set; }

        public long AppSubscriptionPlanHeaderId { get; set; }

        public string SubscriptionPlanCode { get; set; }

        public DateTime CurrentPeriodStartDate { get; set; }

        public DateTime CurrentPeriodEndDate { get; set; }

        public string BillingPeriod { get; set; }

        public bool AllowOverAge { get; set; }

    }
}