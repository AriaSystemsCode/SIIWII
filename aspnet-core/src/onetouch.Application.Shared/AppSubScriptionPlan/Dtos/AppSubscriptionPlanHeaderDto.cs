using System;
using System.Collections;
using Abp.Application.Services.Dto;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class AppSubscriptionPlanHeaderDto : EntityDto<long>
    {
        public string Description { get; set; }

        public bool IsStandard { get; set; }

        public bool IsBillable { get; set; }

        public decimal Discount { get; set; }

        public string BillingCode { get; set; }

        public decimal MonthlyPrice { get; set; }

        public decimal YearlyPrice { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }
        public System.Collections.Generic.List<AppSubscriptionPlanDetailDto> AppSubscriptionPlanDetails { get; set; }
        public long? AppTenantSubscriptionPlanId { get; set; } = null;

    }
}