using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAllAppTenantActivitiesLogInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public long? MaxTenantIdFilter { get; set; }
        public long? MinTenantIdFilter { get; set; }

        public string TenantNameFilter { get; set; }

        public long? MaxUserIdFilter { get; set; }
        public long? MinUserIdFilter { get; set; }

        public string ActivityTypeFilter { get; set; }

        public long? MaxAppSubscriptionPlanHeaderIdFilter { get; set; }
        public long? MinAppSubscriptionPlanHeaderIdFilter { get; set; }

        public string AppSubscriptionPlanCodeFilter { get; set; }

        public DateTime? MaxActivityDateTimeFilter { get; set; }
        public DateTime? MinActivityDateTimeFilter { get; set; }

        public string UserNameFilter { get; set; }

        public string FeatureCodeFilter { get; set; }

        public string FeatureNameFilter { get; set; }

        public int? BillableFilter { get; set; }

        public int? InvoicedFilter { get; set; }

        public string ReferenceFilter { get; set; }

        public long? MaxQtyFilter { get; set; }
        public long? MinQtyFilter { get; set; }

        public long? MaxConsumedQtyFilter { get; set; }
        public long? MinConsumedQtyFilter { get; set; }

        public long? MaxRemainingQtyFilter { get; set; }
        public long? MinRemainingQtyFilter { get; set; }

        public decimal? MaxPriceFilter { get; set; }
        public decimal? MinPriceFilter { get; set; }

        public decimal? MaxAmountFilter { get; set; }
        public decimal? MinAmountFilter { get; set; }

        public DateTime? MaxInvoiceDateFilter { get; set; }
        public DateTime? MinInvoiceDateFilter { get; set; }

        public string InvoiceNumberFilter { get; set; }

        public string CreditOrUsageFilter { get; set; }

        public string MonthFilter { get; set; }

        public string YearFilter { get; set; }

    }
}