using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Application.Services.Dto;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class AppTenantActivityLogDto : EntityDto<long>
    {
        public long TenantId { get; set; }

        public string TenantName { get; set; }

        public long UserId { get; set; }

        public string ActivityType { get; set; }

        public long AppSubscriptionPlanHeaderId { get; set; }

        public string AppSubscriptionPlanCode { get; set; }

        public DateTime ActivityDateTime { get; set; }

        public string UserName { get; set; }

        public string FeatureCode { get; set; }

        public string FeatureName { get; set; }

        public bool Billable { get; set; }

        public bool Invoiced { get; set; }

        public string Reference { get; set; }

        public long Qty { get; set; }

        public long ConsumedQty { get; set; }

        public long RemainingQty { get; set; }

        public decimal Price { get; set; }

        public decimal Amount { get; set; }

        public DateTime? InvoiceDate { get; set; }

        public string? InvoiceNumber { get; set; }

        public string CreditOrUsage { get; set; }

        public string Month { get; set; }

        public string Year { get; set; }
        public virtual string? RelatedEntityCode { get; set; }

        public virtual long? RelatedEntityObjectTypeId { get; set; }

        public virtual long? RelatedEntityId { get; set; }
     

    }
}