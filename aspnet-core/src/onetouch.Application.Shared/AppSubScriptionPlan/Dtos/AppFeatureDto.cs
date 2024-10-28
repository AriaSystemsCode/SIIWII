using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class AppFeatureDto : EntityDto
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string UnitOfMeasurementCode { get; set; }

        public string UnitOfMeasurementName { get; set; }

        public string FeaturePeriodLimit { get; set; }

        public bool Billable { get; set; }

        public string BillingCode { get; set; }

        public decimal? UnitPrice { get; set; }

        public string Category { get; set; }

        public bool TrackActivity { get; set; }
        public bool IsAddOn { get; set; }
        public string FeatureStatus { get; set; }
        public string Notes { get; set; }

    }
}