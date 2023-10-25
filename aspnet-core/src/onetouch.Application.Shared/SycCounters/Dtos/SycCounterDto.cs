using System;
using Abp.Application.Services.Dto;

namespace onetouch.SycCounters.Dtos
{
    public class SycCounterDto : EntityDto<long>
    {
        public long Counter { get; set; }

        public long? SycSegmentIdentifierDefinitionId { get; set; }

    }
}