using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAllAppFeaturesForExcelInput
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public string NameFilter { get; set; }

        public string DescriptionFilter { get; set; }

        public string UnitOfMeasurementCodeFilter { get; set; }

        public string UnitOfMeasurementNameFilter { get; set; }

        public string FeaturePeriodLimitFilter { get; set; }

        public int? BillableFilter { get; set; }

        public string BillingCodeFilter { get; set; }

        public decimal? MaxUnitPriceFilter { get; set; }
        public decimal? MinUnitPriceFilter { get; set; }

        public string CategoryFilter { get; set; }

        public int? TrackActivityFilter { get; set; }

    }
}