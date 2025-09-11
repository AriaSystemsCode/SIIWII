using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycCounters.Dtos
{
    public class GetSycCounterForEditOutput
    {
        public CreateOrEditSycCounterDto SycCounter { get; set; }

        public string SycSegmentIdentifierDefinitionName { get; set; }

    }
}