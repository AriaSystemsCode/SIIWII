using Abp.Application.Services.Dto;
using System;

namespace onetouch.SycPlanServices.Dtos
{
    public class GetAllSycPlanServicesForExcelInput
    {
        public string Filter { get; set; }

        public string UnitOfMeasureFilter { get; set; }

        public decimal? MaxUnitPriceFilter { get; set; }
        public decimal? MinUnitPriceFilter { get; set; }

        public int? MaxUnitsFilter { get; set; }
        public int? MinUnitsFilter { get; set; }

        public string BillingFrequencyFilter { get; set; }

        public int? MaxMinimumUnitsFilter { get; set; }
        public int? MinMinimumUnitsFilter { get; set; }

        public string SycApplicationNameFilter { get; set; }

        public string SycPlanNameFilter { get; set; }

        public string SycServiceCodeFilter { get; set; }

    }
}