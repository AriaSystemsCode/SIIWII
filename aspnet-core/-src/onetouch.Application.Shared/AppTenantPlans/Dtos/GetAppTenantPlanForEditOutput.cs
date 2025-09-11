using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppTenantPlans.Dtos
{
    public class GetAppTenantPlanForEditOutput
    {
        public CreateOrEditAppTenantPlanDto AppTenantPlan { get; set; }

        public string SycPlanName { get; set; }

    }
}