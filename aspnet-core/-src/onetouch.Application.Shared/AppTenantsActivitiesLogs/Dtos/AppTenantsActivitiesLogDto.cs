using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppTenantsActivitiesLogs.Dtos
{
    public class AppTenantsActivitiesLogDto : EntityDto
    {
        public DateTime ActivityDate { get; set; }

        public int Units { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Amount { get; set; }

        public bool Billed { get; set; }

        public bool IsManual { get; set; }

        public string InvoiceNumber { get; set; }

        public DateTime InvoiceDate { get; set; }

        public int? ServiceId { get; set; }

        public int? ApplicationId { get; set; }

        public int? TransactionId { get; set; }

        public int? PlanId { get; set; }
        public int? TenantId { get; set; }
        public string Notes { get; set; }
    }
}