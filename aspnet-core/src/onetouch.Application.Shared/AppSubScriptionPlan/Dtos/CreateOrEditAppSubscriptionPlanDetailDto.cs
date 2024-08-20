using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class CreateOrEditAppSubscriptionPlanDetailDto : EntityDto<long?>
    {

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureCodeLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureCodeLength)]
        public string FeatureCode { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureNameLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureNameLength)]
        public string FeatureName { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxAvailabilityLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinAvailabilityLength)]
        public string Availability { get; set; }

        public int FeatureLimit { get; set; }

        public bool RollOver { get; set; }

        public decimal UnitPrice { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeaturePeriodLimitLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeaturePeriodLimitLength)]
        public string FeaturePeriodLimit { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxCategoryLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinCategoryLength)]
        public string Category { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureDescriptionLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureDescriptionLength)]
        public string FeatureDescription { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureStatusLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureStatusLength)]
        public string FeatureStatus { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxUnitOfMeasurementNameLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinUnitOfMeasurementNameLength)]
        public string UnitOfMeasurementName { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxUnitOfMeasurmentCodeLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinUnitOfMeasurmentCodeLength)]
        public string UnitOfMeasurmentCode { get; set; }

        public bool IsFeatureBillable { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureBillingCodeLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureBillingCodeLength)]
        public string FeatureBillingCode { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureCategoryLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureCategoryLength)]
        public string FeatureCategory { get; set; }

        public bool Trackactivity { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxNotesLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinNotesLength)]
        public string Notes { get; set; }
        public bool IsAddOn { get; set; }
        public long AppSubscriptionPlanHeaderId { get; set; }
        public string EntityStatusCode { set; get; }
        public int? EntityStatusId { get; set; }
        public long? AppFeatureId { get; set; }
    }
}