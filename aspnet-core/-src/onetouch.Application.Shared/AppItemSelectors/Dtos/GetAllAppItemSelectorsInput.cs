using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppItemSelectors.Dtos
{
    public class GetAllAppItemSelectorsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public Guid? KeyFilter { get; set; }

        public long? MaxSelectedIdFilter { get; set; }
        public long? MinSelectedIdFilter { get; set; }

    }
}