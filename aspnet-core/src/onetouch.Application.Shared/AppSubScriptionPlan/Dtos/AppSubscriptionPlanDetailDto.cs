using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class AppSubscriptionPlanDetailDto : EntityDto<long>
    {
        public string FeatureCode { get; set; }

        public string FeatureName { get; set; }

        public string Availability { get; set; }

        public int FeatureLimit { get; set; }

        public bool RollOver { get; set; }

        public decimal UnitPrice { get; set; }

        public string FeaturePeriodLimit { get; set; }

        public string Category { get; set; }

        public string FeatureDescription { get; set; }

        public string FeatureStatus { get; set; }

        public string UnitOfMeasurementName { get; set; }

        public string UnitOfMeasurmentCode { get; set; }

        public bool IsFeatureBillable { get; set; }
        public bool IsAddOn { get; set; }

        public string FeatureBillingCode { get; set; }

        public string FeatureCategory { get; set; }

        public bool Trackactivity { get; set; }

        public long AppSubscriptionPlanHeaderId { get; set; }

        public long? AppFeatureId { get; set; }

    }
}