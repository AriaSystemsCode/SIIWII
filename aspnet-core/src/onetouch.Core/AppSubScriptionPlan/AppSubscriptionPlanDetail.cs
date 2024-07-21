using onetouch.AppSubScriptionPlan;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;

namespace onetouch.AppSubScriptionPlan
{
    [Table("AppSubscriptionPlanDetails")]
    [Audited]
    public class AppSubscriptionPlanDetail : AppEntity
    {

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureCodeLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureCodeLength)]
        public virtual string FeatureCode { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureNameLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureNameLength)]
        public virtual string FeatureName { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxAvailabilityLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinAvailabilityLength)]
        public virtual string Availability { get; set; }

        public virtual int FeatureLimit { get; set; }

        public virtual bool RollOver { get; set; }

        public virtual decimal UnitPrice { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeaturePeriodLimitLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeaturePeriodLimitLength)]
        public virtual string FeaturePeriodLimit { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxCategoryLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinCategoryLength)]
        public virtual string Category { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureDescriptionLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureDescriptionLength)]
        public virtual string FeatureDescription { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureStatusLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureStatusLength)]
        public virtual string FeatureStatus { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxUnitOfMeasurementNameLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinUnitOfMeasurementNameLength)]
        public virtual string UnitOfMeasurementName { get; set; }

        [Required]
        [StringLength(AppSubscriptionPlanDetailConsts.MaxUnitOfMeasurmentCodeLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinUnitOfMeasurmentCodeLength)]
        public virtual string UnitOfMeasurmentCode { get; set; }

        public virtual bool IsFeatureBillable { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureBillingCodeLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureBillingCodeLength)]
        public virtual string FeatureBillingCode { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxFeatureCategoryLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinFeatureCategoryLength)]
        public virtual string FeatureCategory { get; set; }

        public virtual bool Trackactivity { get; set; }
        public virtual bool IsAddOn { get; set; }

        [StringLength(AppSubscriptionPlanDetailConsts.MaxNotesLength, MinimumLength = AppSubscriptionPlanDetailConsts.MinNotesLength)]
        public virtual string Notes { get; set; }

        public virtual long AppSubscriptionPlanHeaderId { get; set; }

        [ForeignKey("AppSubscriptionPlanHeaderId")]
        public AppSubscriptionPlanHeader AppSubscriptionPlanHeaderFk { get; set; }

    }
}