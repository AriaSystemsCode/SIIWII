using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;

namespace onetouch.AppSubScriptionPlan
{
    [Table("AppTenantSubscriptionPlans")]
    [Audited]
    public class AppTenantSubscriptionPlan : AppEntity
    {

        //public virtual long TenantId { get; set; }

        [Required]
        [StringLength(AppTenantSubscriptionPlanConsts.MaxTenantNameLength, MinimumLength = AppTenantSubscriptionPlanConsts.MinTenantNameLength)]
        public virtual string TenantName { get; set; }

        public virtual long AppSubscriptionPlanHeaderId { get; set; }

        [Required]
        [StringLength(AppTenantSubscriptionPlanConsts.MaxSubscriptionPlanCodeLength, MinimumLength = AppTenantSubscriptionPlanConsts.MinSubscriptionPlanCodeLength)]
        public virtual string SubscriptionPlanCode { get; set; }

        public virtual DateTime CurrentPeriodStartDate { get; set; }

        public virtual DateTime CurrentPeriodEndDate { get; set; }

        [Required]
        [StringLength(AppTenantSubscriptionPlanConsts.MaxBillingPeriodLength, MinimumLength = AppTenantSubscriptionPlanConsts.MinBillingPeriodLength)]
        public virtual string BillingPeriod { get; set; }

        public virtual bool AllowOverAge { get; set; }
        [ForeignKey("AppSubscriptionPlanHeaderId")]
        public AppSubscriptionPlanHeader AppSubscriptionPlanHeaderFk { get; set; }
    }
}