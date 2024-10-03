using onetouch.SycServices;
using onetouch.SycApplications;
using onetouch.AppTransactions;
using onetouch.SycPlans;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using onetouch.MultiTenancy;

namespace onetouch.AppTenantsActivitiesLogs
{
    [Table("AppTenantsActivitiesLogs")]
    public class AppTenantsActivitiesLog : Entity
    {
        public int? TenantId { get; set; }

        [ForeignKey("TenantId")]
        public Tenant TenantFk { get; set; }

        public virtual DateTime ActivityDate { get; set; }

        public virtual int Units { get; set; }

        public virtual decimal UnitPrice { get; set; }

        public virtual decimal Amount { get; set; }

        public virtual bool Billed { get; set; }

        public virtual bool IsManual { get; set; }

        [StringLength(AppTenantsActivitiesLogConsts.MaxInvoiceNumberLength, MinimumLength = AppTenantsActivitiesLogConsts.MinInvoiceNumberLength)]
        public virtual string InvoiceNumber { get; set; }

        public virtual DateTime InvoiceDate { get; set; }

        public virtual string Notes { get; set; }

        public virtual int? ServiceId { get; set; }

        [ForeignKey("ServiceId")]
        public SycService ServiceFk { get; set; }

        public virtual int? ApplicationId { get; set; }

        [ForeignKey("ApplicationId")]
        public SycApplication ApplicationFk { get; set; }

        public virtual int? TransactionId { get; set; }

        [ForeignKey("TransactionId")]
        public AppTransaction TransactionFk { get; set; }

        public virtual int? PlanId { get; set; }

        [ForeignKey("PlanId")]
        public SycPlan PlanFk { get; set; }

    }
}