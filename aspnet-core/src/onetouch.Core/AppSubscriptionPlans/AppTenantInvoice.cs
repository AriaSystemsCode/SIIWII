using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;

namespace onetouch.AppSubscriptionPlans
{
    [Table("AppTenantInvoices")]
    [Audited]
    public class AppTenantInvoice : AppEntity
    {

        [Required]
        [StringLength(AppTenantInvoiceConsts.MaxInvoiceNumberLength, MinimumLength = AppTenantInvoiceConsts.MinInvoiceNumberLength)]
        public virtual string InvoiceNumber { get; set; }

        public virtual DateTime InvoiceDate { get; set; }

        public virtual decimal Amount { get; set; }

        public virtual DateTime DueDate { get; set; }

        public virtual DateTime PayDate { get; set; }

    }
}