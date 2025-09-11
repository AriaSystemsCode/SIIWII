using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycPlans.Dtos
{
    public class GetSycPlanForEditOutput
    {
        public CreateOrEditSycPlanDto SycPlan { get; set; }

        public string SycApplicationName { get; set; }

    }
}