using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppTenantPlans.Dtos
{
    public class AppTenantPlanDto : EntityDto
    {
        public DateTime AddDate { get; set; }

        public DateTime EndDate { get; set; }

        public DateTime StartDate { get; set; }

        public int? PlanId { get; set; }

    }
}