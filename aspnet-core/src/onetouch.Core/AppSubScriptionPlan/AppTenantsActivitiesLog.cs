using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;
using Microsoft.EntityFrameworkCore;

namespace onetouch.AppSubScriptionPlan
{
    [Table("AppTenantActivitiesLog")]
    [Audited]
    [Index(nameof(TenantName), nameof(ActivityType), nameof(CreditOrUsage), nameof(Year), nameof(Month))]
    public class AppTenantsActivitiesLog : AppEntity 
    {

        //public virtual long TenantId { get; set; }

        [StringLength(AppTenantActivityLogConsts.MaxTenantNameLength, MinimumLength = AppTenantActivityLogConsts.MinTenantNameLength)]
        public virtual string TenantName { get; set; }

        public virtual long UserId { get; set; }

        [Required]
        [StringLength(AppTenantActivityLogConsts.MaxActivityTypeLength, MinimumLength = AppTenantActivityLogConsts.MinActivityTypeLength)]
        public virtual string ActivityType { get; set; }

        public virtual long AppSubscriptionPlanHeaderId { get; set; }

        [StringLength(AppTenantActivityLogConsts.MaxAppSubscriptionPlanCodeLength, MinimumLength = AppTenantActivityLogConsts.MinAppSubscriptionPlanCodeLength)]
        public virtual string AppSubscriptionPlanCode { get; set; }

        public virtual DateTime ActivityDateTime { get; set; }

        [StringLength(AppTenantActivityLogConsts.MaxUserNameLength, MinimumLength = AppTenantActivityLogConsts.MinUserNameLength)]
        public virtual string UserName { get; set; }

        [StringLength(AppTenantActivityLogConsts.MaxFeatureCodeLength, MinimumLength = AppTenantActivityLogConsts.MinFeatureCodeLength)]
        public virtual string FeatureCode { get; set; }

        [StringLength(AppTenantActivityLogConsts.MaxFeatureNameLength, MinimumLength = AppTenantActivityLogConsts.MinFeatureNameLength)]
        public virtual string FeatureName { get; set; }

        public virtual bool Billable { get; set; }

        public virtual bool Invoiced { get; set; }

        [StringLength(AppTenantActivityLogConsts.MaxReferenceLength, MinimumLength = AppTenantActivityLogConsts.MinReferenceLength)]
        public virtual string Reference { get; set; }

        public virtual long Qty { get; set; }

        public virtual long ConsumedQty { get; set; }

        public virtual long RemainingQty { get; set; }

        public virtual decimal Price { get; set; }

        public virtual decimal Amount { get; set; }

        public virtual DateTime InvoiceDate { get; set; }

        [StringLength(AppTenantActivityLogConsts.MaxInvoiceNumberLength, MinimumLength = AppTenantActivityLogConsts.MinInvoiceNumberLength)]
        public virtual string InvoiceNumber { get; set; }

        [Required]
        [StringLength(AppTenantActivityLogConsts.MaxCreditOrUsageLength, MinimumLength = AppTenantActivityLogConsts.MinCreditOrUsageLength)]
        public virtual string CreditOrUsage { get; set; }

        [Required]
        [StringLength(AppTenantActivityLogConsts.MaxMonthLength, MinimumLength = AppTenantActivityLogConsts.MinMonthLength)]
        public virtual string Month { get; set; }

        [StringLength(AppTenantActivityLogConsts.MaxYearLength, MinimumLength = AppTenantActivityLogConsts.MinYearLength)]
        public virtual string Year { get; set; }

        public virtual long CreditId { get; set; }
        [ForeignKey("CreditId")]
        public AppTenantsActivitiesLog AppTenantActivityLogFk { get; set; }
        [ForeignKey("AppSubscriptionPlanHeaderId")]
        public AppSubscriptionPlanHeader AppSubscriptionPlanHeaderFk { get; set; }
    }
}