using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;

namespace onetouch.AppSubScriptionPlan
{
    [Table("AppSubscriptionPlanHeaders")]
    [Audited]
    public class AppSubscriptionPlanHeader : AppEntity
    {

        [StringLength(AppSubscriptionPlanHeaderConsts.MaxDescriptionLength, MinimumLength = AppSubscriptionPlanHeaderConsts.MinDescriptionLength)]
        public virtual string Description { get; set; }

        public virtual bool IsStandard { get; set; }

        public virtual bool IsBillable { get; set; }

        public virtual decimal Discount { get; set; }

        [StringLength(AppSubscriptionPlanHeaderConsts.MaxBillingCodeLength, MinimumLength = AppSubscriptionPlanHeaderConsts.MinBillingCodeLength)]
        public virtual string BillingCode { get; set; }

        public virtual decimal MonthlyPrice { get; set; }

        public virtual decimal YearlyPrice { get; set; }

        //[Required]
        //[StringLength(AppSubscriptionPlanHeaderConsts.MaxCodeLength, MinimumLength = AppSubscriptionPlanHeaderConsts.MinCodeLength)]
        //public virtual string Code { get; set; }

        //[Required]
        //[StringLength(AppSubscriptionPlanHeaderConsts.MaxNameLength, MinimumLength = AppSubscriptionPlanHeaderConsts.MinNameLength)]
        //public virtual string Name { get; set; }

    }
}