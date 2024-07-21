using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppSubscriptionPlans.Dtos
{
    public class GetAllAppTenantInvoicesInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string InvoiceNumberFilter { get; set; }

        public DateTime? MaxInvoiceDateFilter { get; set; }
        public DateTime? MinInvoiceDateFilter { get; set; }

        public DateTime? MaxDueDateFilter { get; set; }
        public DateTime? MinDueDateFilter { get; set; }

        public DateTime? MaxPayDateFilter { get; set; }
        public DateTime? MinPayDateFilter { get; set; }

    }
}