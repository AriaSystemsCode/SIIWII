using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycApplications.Dtos
{
    public class GetSycApplicationForEditOutput
    {
        public CreateOrEditSycApplicationDto SycApplication { get; set; }

    }
}