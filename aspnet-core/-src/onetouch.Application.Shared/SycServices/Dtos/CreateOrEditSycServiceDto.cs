using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycServices.Dtos
{
    public class CreateOrEditSycServiceDto : EntityDto<int?>
    {

        [Required]
        [StringLength(SycServiceConsts.MaxCodeLength, MinimumLength = SycServiceConsts.MinCodeLength)]
        public string Code { get; set; }

        public string Description { get; set; }

        [StringLength(SycServiceConsts.MaxUnitOfMeasureLength, MinimumLength = SycServiceConsts.MinUnitOfMeasureLength)]
        public string UnitOfMeasure { get; set; }

        public decimal UnitPrice { get; set; }

        public string Notes { get; set; }

    }
}