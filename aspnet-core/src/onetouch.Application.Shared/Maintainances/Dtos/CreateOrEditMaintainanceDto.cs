using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.Maintainances.Dtos
{
    public class CreateOrEditMaintainanceDto : EntityDto<long?>
    {

        [Required]
        [StringLength(MaintainanceConsts.MaxNameLength, MinimumLength = MaintainanceConsts.MinNameLength)]
        public string Name { get; set; }

        public string Description { get; set; }

        public DateTime From { get; set; }

        public DateTime To { get; set; }

        public bool Published { get; set; }

        public string DismissIds { get; set; }

    }
}