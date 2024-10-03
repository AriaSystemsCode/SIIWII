using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppSubscriptionPlans.Dtos
{
    public class AppTenantInvoiceDto : EntityDto<long>
    {
        public string InvoiceNumber { get; set; }

        public DateTime InvoiceDate { get; set; }

        public decimal Amount { get; set; }

        public DateTime DueDate { get; set; }

        public DateTime PayDate { get; set; }
        public string Attachment { set; get; }
        public string DisplayName { set; get; }
        public string TenantName { set; get; }

    }
}