using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycCounters.Dtos
{
    public class CreateOrEditSycCounterDto : EntityDto<long?>
    {

        public long Counter { get; set; }

        public long? SycSegmentIdentifierDefinitionId { get; set; }

    }
}