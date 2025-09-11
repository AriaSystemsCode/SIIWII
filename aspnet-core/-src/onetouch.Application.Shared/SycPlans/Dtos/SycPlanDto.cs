using System;
using Abp.Application.Services.Dto;

namespace onetouch.SycPlans.Dtos
{
    public class SycPlanDto : EntityDto
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string Notes { get; set; }

        public int? ApplicationId { get; set; }

    }
}