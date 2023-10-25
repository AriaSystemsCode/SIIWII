using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycPlanServices.Dtos
{
    public class GetSycPlanServiceForEditOutput
    {
        public CreateOrEditSycPlanServiceDto SycPlanService { get; set; }

        public string SycApplicationName { get; set; }

        public string SycPlanName { get; set; }

        public string SycServiceCode { get; set; }

    }
}