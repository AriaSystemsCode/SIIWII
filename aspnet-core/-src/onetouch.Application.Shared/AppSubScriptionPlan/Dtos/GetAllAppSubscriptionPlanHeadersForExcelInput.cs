using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAllAppSubscriptionPlanHeadersForExcelInput
    {
        public string Filter { get; set; }

        public string DescriptionFilter { get; set; }

        public int? IsStandardFilter { get; set; }

        public int? IsBillableFilter { get; set; }

        public decimal? MaxDiscountFilter { get; set; }
        public decimal? MinDiscountFilter { get; set; }

        public string BillingCodeFilter { get; set; }

        public decimal? MaxMonthlyPriceFilter { get; set; }
        public decimal? MinMonthlyPriceFilter { get; set; }

        public decimal? MaxYearlyPriceFilter { get; set; }
        public decimal? MinYearlyPriceFilter { get; set; }

        public string CodeFilter { get; set; }

        public string NameFilter { get; set; }

    }
}