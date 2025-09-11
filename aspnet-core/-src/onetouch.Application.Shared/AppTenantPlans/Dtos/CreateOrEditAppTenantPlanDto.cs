using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppTenantPlans.Dtos
{
    public class CreateOrEditAppTenantPlanDto : EntityDto<int?>
    {

        public DateTime AddDate { get; set; }

        public DateTime EndDate { get; set; }

        public DateTime StartDate { get; set; }

        public int? PlanId { get; set; }

    }
}