using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppAdvertisements.Dtos
{
    public class GetAllAppAdvertisementsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public long? MaxTenantIdFilter { get; set; }
        public long? MinTenantIdFilter { get; set; }

        public DateTime? MaxStartDateFilter { get; set; }
        public DateTime? MinStartDateFilter { get; set; }

        public DateTime? MaxEndDateFilter { get; set; }
        public DateTime? MinEndDateFilter { get; set; }

        public string StartTimeFilter { get; set; }

        public string EndTimeFilter { get; set; }

        public string TimeZoneFilter { get; set; }

        public int? PublishOnHomePageFilter { get; set; }
        public int? PublishOnMarketLandingPageFilter { get; set; }

        public DateTime? MaxApprovalDateTimeFilter { get; set; }
        public DateTime? MinApprovalDateTimeFilter { get; set; }

        public string PaymentMethodFilter { get; set; }

        public long? MaxInvoiceNumberFilter { get; set; }
        public long? MinInvoiceNumberFilter { get; set; }

        public int? MaxNumberOfOccurencesFilter { get; set; }
        public int? MinNumberOfOccurencesFilter { get; set; }

        public int? MaxPeriodOfViewFilter { get; set; }
        public int? MinPeriodOfViewFilter { get; set; }

        public string AppEntityNameFilter { get; set; }

        public string UserNameFilter { get; set; }
        public string Url { get; set; }
    }
}