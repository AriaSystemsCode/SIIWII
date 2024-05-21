using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using onetouch.AppEntities.Dtos;
using System.Collections.Generic;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class CreateOrEditAppFeatureDto : EntityDto<int?>
    {

        //public int Id { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxCodeLength, MinimumLength = AppFeatureConsts.MinCodeLength)]
        public string Code { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxNameLength, MinimumLength = AppFeatureConsts.MinNameLength)]
        public string Name { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxDescriptionLength, MinimumLength = AppFeatureConsts.MinDescriptionLength)]
        public string Description { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxUnitOfMeasurementCodeLength, MinimumLength = AppFeatureConsts.MinUnitOfMeasurementCodeLength)]
        public string UnitOfMeasurementCode { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxUnitOfMeasurementNameLength, MinimumLength = AppFeatureConsts.MinUnitOfMeasurementNameLength)]
        public string UnitOfMeasurementName { get; set; }

        [Required]
        [StringLength(AppFeatureConsts.MaxFeaturePeriodLimitLength, MinimumLength = AppFeatureConsts.MinFeaturePeriodLimitLength)]
        public string FeaturePeriodLimit { get; set; }

        public bool Billable { get; set; }

        [StringLength(AppFeatureConsts.MaxBillingCodeLength, MinimumLength = AppFeatureConsts.MinBillingCodeLength)]
        public string BillingCode { get; set; }

        public decimal? UnitPrice { get; set; }

        //[Required]
        //[StringLength(AppFeatureConsts.MaxCategoryLength, MinimumLength = AppFeatureConsts.MinCategoryLength)]
        //public string Category { get; set; }

        public bool TrackActivity { get; set; }
        public string EntityStatusCode { set; get; }
        public int? EntityStatusId{ get; set; }

        public virtual IList<AppEntityCategoryDto> EntityCategories { get; set; }
    }
}