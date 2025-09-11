using System;
using Abp.Application.Services.Dto;

namespace onetouch.SycApplications.Dtos
{
    public class SycApplicationDto : EntityDto
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string Notes { get; set; }

    }
}