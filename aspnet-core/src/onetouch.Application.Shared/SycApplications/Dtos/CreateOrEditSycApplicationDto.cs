using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycApplications.Dtos
{
    public class CreateOrEditSycApplicationDto : EntityDto<int?>
    {

        [Required]
        [StringLength(SycApplicationConsts.MaxCodeLength, MinimumLength = SycApplicationConsts.MinCodeLength)]
        public string Code { get; set; }

        [StringLength(SycApplicationConsts.MaxNameLength, MinimumLength = SycApplicationConsts.MinNameLength)]
        public string Name { get; set; }

        public string Notes { get; set; }

    }
}