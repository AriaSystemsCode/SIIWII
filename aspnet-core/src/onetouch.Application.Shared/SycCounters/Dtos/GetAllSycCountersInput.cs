using Abp.Application.Services.Dto;
using System;

namespace onetouch.SycCounters.Dtos
{
    public class GetAllSycCountersInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public long? MaxCounterFilter { get; set; }
        public long? MinCounterFilter { get; set; }

        public string SycSegmentIdentifierDefinitionNameFilter { get; set; }

        public long? SycSegmentIdentifierDefinitionIdFilter { get; set; }
    }
}