using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppSubscriptionPlans.Dtos
{
    public class GetAppTenantInvoiceForEditOutput
    {
        public CreateOrEditAppTenantInvoiceDto AppTenantInvoice { get; set; }

    }
}