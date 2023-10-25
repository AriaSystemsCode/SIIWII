using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using onetouch.AppEntities.Dtos;
using System.Collections.Generic;

namespace onetouch.AppAdvertisements.Dtos
{
    public class CreateOrEditAppAdvertisementDto : EntityDto<long?>
    {

        [Required]
        [StringLength(AppAdvertisementConsts.MaxCodeLength, MinimumLength = AppAdvertisementConsts.MinCodeLength)]
        public string Code { get; set; }

        public long? TenantId { get; set; }

        [StringLength(AppAdvertisementConsts.MaxDescriptionLength, MinimumLength = AppAdvertisementConsts.MinDescriptionLength)]
        public string Description { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string StartTime { get; set; }

        public string EndTime { get; set; }

        [StringLength(AppAdvertisementConsts.MaxTimeZoneLength, MinimumLength = AppAdvertisementConsts.MinTimeZoneLength)]
        public string TimeZone { get; set; }

        public bool PublishOnHomePage { get; set; }
        public bool PublishOnMarketLandingPage { get; set; }

        public DateTime ApprovalDateTime { get; set; }

        [StringLength(AppAdvertisementConsts.MaxPaymentMethodLength, MinimumLength = AppAdvertisementConsts.MinPaymentMethodLength)]
        public string PaymentMethod { get; set; }

        public long InvoiceNumber { get; set; }

        public DateTime UTCFromDateTime { get; set; }

        public DateTime UTCToDateTime { get; set; }

        public int NumberOfOccurences { get; set; }

        public int PeriodOfView { get; set; }

        public long AppEntityId { get; set; }

        public long? UserId { get; set; }
        public IList<AppEntityAttachmentDto> Attachments { get; set; }

        public OccuranceUnitOfTime OccuranceUnitOfTime { get; set; }
        public string Url { get; set; }
    }
}