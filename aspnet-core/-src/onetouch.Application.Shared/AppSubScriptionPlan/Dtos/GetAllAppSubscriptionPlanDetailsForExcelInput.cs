using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAllAppSubscriptionPlanDetailsForExcelInput
    {
        public string Filter { get; set; }

        public string FeatureCodeFilter { get; set; }

        public string FeatureNameFilter { get; set; }

        public string AvailabilityFilter { get; set; }

        public int? MaxFeatureLimitFilter { get; set; }
        public int? MinFeatureLimitFilter { get; set; }

        public int? RollOverFilter { get; set; }

        public decimal? MaxUnitPriceFilter { get; set; }
        public decimal? MinUnitPriceFilter { get; set; }

        public string FeaturePeriodLimitFilter { get; set; }

        public string CategoryFilter { get; set; }

        public string FeatureDescriptionFilter { get; set; }

        public string FeatureStatusFilter { get; set; }

        public string UnitOfMeasurementNameFilter { get; set; }

        public string UnitOfMeasurmentCodeFilter { get; set; }

        public int? IsFeatureBillableFilter { get; set; }

        public string FeatureBillingCodeFilter { get; set; }

        public string FeatureCategoryFilter { get; set; }

        public int? TrackactivityFilter { get; set; }

        public string AppSubscriptionPlanHeaderFilter { get; set; }

        public string AppFeatureDescriptionFilter { get; set; }

    }
}