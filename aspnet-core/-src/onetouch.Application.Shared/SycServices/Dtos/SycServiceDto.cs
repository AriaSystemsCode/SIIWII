using System;
using Abp.Application.Services.Dto;

namespace onetouch.SycServices.Dtos
{
    public class SycServiceDto : EntityDto
    {
        public string Code { get; set; }

        public string Description { get; set; }

        public string UnitOfMeasure { get; set; }

        public decimal UnitPrice { get; set; }

        public string Notes { get; set; }

    }
}