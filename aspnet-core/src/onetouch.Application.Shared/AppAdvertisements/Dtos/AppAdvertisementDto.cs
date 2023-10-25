using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppAdvertisements.Dtos
{
    public class AppAdvertisementDto : EntityDto<long>
    {
        public string Code { get; set; }

        public long? TenantId { get; set; }

        public string Description { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string StartTime { get; set; }

        public string EndTime { get; set; }

        public string TimeZone { get; set; }

        public bool PublishOnHomePage { get; set; }
        public bool PublishOnMarketLandingPage { get; set; }

        public DateTime ApprovalDateTime { get; set; }

        public string PaymentMethod { get; set; }

        public long InvoiceNumber { get; set; }

        public int NumberOfOccurences { get; set; }

        public int PeriodOfView { get; set; }

        public long AppEntityId { get; set; }

        public long? UserId { get; set; }
        public string MarketPlaceImage { get; set; }
        public string HomeImage { get; set; }
        public OccuranceUnitOfTime OccuranceUnitOfTime { get; set; }
        public string Url { get; set; }
    }
    public enum OccuranceUnitOfTime
    { 
        Hour,
        Day,
        Week,
        Month
    }
}