using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;

namespace onetouch.AppSubScriptionPlan
{
    [Table("AppFeatures")]
    [Audited]
    public class AppFeature : AppEntity
    {

        //public virtual int Id { get; set; }

        //[Required]
        //[StringLength(AppFeatureConsts.MaxCodeLength, MinimumLength = AppFeatureConsts.MinCodeLength)]
        //public virtual string Code { get; set; }

        //[Required]
        //[StringLength(AppFeatureConsts.MaxNameLength, MinimumLength = AppFeatureConsts.MinNameLength)]
        //public virtual string Name { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxDescriptionLength, MinimumLength = AppFeatureConsts.MinDescriptionLength)]
        public virtual string Description { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxUnitOfMeasurementCodeLength, MinimumLength = AppFeatureConsts.MinUnitOfMeasurementCodeLength)]
        public virtual string UnitOfMeasurementCode { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxUnitOfMeasurementNameLength, MinimumLength = AppFeatureConsts.MinUnitOfMeasurementNameLength)]
        public virtual string UnitOfMeasurementName { get; set; }
        public virtual long UnitOfMeasurementId { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxFeaturePeriodLimitLength, MinimumLength = AppFeatureConsts.MinFeaturePeriodLimitLength)]
        public virtual string FeaturePeriodLimit { get; set; }

        public virtual bool Billable { get; set; }

        [StringLength(AppFeatureConsts.MaxBillingCodeLength, MinimumLength = AppFeatureConsts.MinBillingCodeLength)]
        public virtual string BillingCode { get; set; }

        public virtual decimal? UnitPrice { get; set; }

        //[Required]
        //[StringLength(AppFeatureConsts.MaxCategoryLength, MinimumLength = AppFeatureConsts.MinCategoryLength)]
        //public virtual string Category { get; set; }

        public virtual bool TrackActivity { get; set; }
        //public long EntityId { get; set; }

        [ForeignKey("UnitOfMeasurementId")]
        public virtual AppEntity UnitOfMeasurementFk { get; set; }

    }
}