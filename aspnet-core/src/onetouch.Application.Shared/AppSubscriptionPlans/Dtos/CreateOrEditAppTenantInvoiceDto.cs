using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using onetouch.AppEntities.Dtos;
using System.Collections.Generic;

namespace onetouch.AppSubscriptionPlans.Dtos
{
    public class CreateOrEditAppTenantInvoiceDto : EntityDto<long?>
    {
        [Required]
        public long TenantId { set; get; }    
        [Required]
        [StringLength(AppTenantInvoiceConsts.MaxInvoiceNumberLength, MinimumLength = AppTenantInvoiceConsts.MinInvoiceNumberLength)]
        public string InvoiceNumber { get; set; }

        public DateTime InvoiceDate { get; set; }

        public decimal Amount { get; set; }

        public DateTime DueDate { get; set; }

        public DateTime PayDate { get; set; }
        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }

    }
}