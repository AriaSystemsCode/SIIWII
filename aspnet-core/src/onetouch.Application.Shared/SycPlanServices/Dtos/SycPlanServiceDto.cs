using System;
using Abp.Application.Services.Dto;

namespace onetouch.SycPlanServices.Dtos
{
    public class SycPlanServiceDto : EntityDto
    {
        public string UnitOfMeasure { get; set; }

        public decimal UnitPrice { get; set; }

        public int Units { get; set; }

        public string BillingFrequency { get; set; }

        public int MinimumUnits { get; set; }

        public int? ApplicationId { get; set; }

        public int? PlanId { get; set; }

        public int? ServiceId { get; set; }

    }
}