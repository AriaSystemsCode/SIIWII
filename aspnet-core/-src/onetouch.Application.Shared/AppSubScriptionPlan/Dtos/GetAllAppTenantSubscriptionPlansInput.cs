using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAllAppTenantSubscriptionPlansInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string TenantNameFilter { get; set; }

        public long? MaxAppSubscriptionHeaderIdFilter { get; set; }
        public long? MinAppSubscriptionHeaderIdFilter { get; set; }

        public string SubscriptionPlanCodeFilter { get; set; }

        public DateTime? MaxCurrentPeriodStartDateFilter { get; set; }
        public DateTime? MinCurrentPeriodStartDateFilter { get; set; }

        public DateTime? MaxCurrentPeriodEndDateFilter { get; set; }
        public DateTime? MinCurrentPeriodEndDateFilter { get; set; }

        public string BillingPeriodFilter { get; set; }

        public int? AllowOverAgeFilter { get; set; }

    }
}