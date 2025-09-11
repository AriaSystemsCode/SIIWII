using System;
using Abp.Application.Services.Dto;

namespace onetouch.Maintainances.Dtos
{
    public class MaintainanceDto : EntityDto<long>
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public DateTime From { get; set; }

        public DateTime To { get; set; }

        public bool Published { get; set; }

        public string DismissIds { get; set; }

    }
}