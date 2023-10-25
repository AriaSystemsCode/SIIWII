using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppTenantsActivitiesLogs.Dtos
{
    public class GetAllAppTenantsActivitiesLogsForExcelInput
    {
        public string Filter { get; set; }

        public DateTime? MaxActivityDateFilter { get; set; }
        public DateTime? MinActivityDateFilter { get; set; }

        public int? MaxUnitsFilter { get; set; }
        public int? MinUnitsFilter { get; set; }

        public decimal? MaxUnitPriceFilter { get; set; }
        public decimal? MinUnitPriceFilter { get; set; }

        public decimal? MaxAmountFilter { get; set; }
        public decimal? MinAmountFilter { get; set; }

        public int? BilledFilter { get; set; }

        public int? IsManualFilter { get; set; }

        public string InvoiceNumberFilter { get; set; }

        public DateTime? MaxInvoiceDateFilter { get; set; }
        public DateTime? MinInvoiceDateFilter { get; set; }

        public string SycServiceCodeFilter { get; set; }

        public string SycApplicationNameFilter { get; set; }

        public string AppTransactionCodeFilter { get; set; }

        public string SycPlanNameFilter { get; set; }

    }
}