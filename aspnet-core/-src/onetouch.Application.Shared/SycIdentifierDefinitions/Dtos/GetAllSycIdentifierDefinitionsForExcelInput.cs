using Abp.Application.Services.Dto;
using System;

namespace onetouch.SycIdentifierDefinitions.Dtos
{
    public class GetAllSycIdentifierDefinitionsForExcelInput
    {
        public string Filter { get; set; }

        public string CodeFilter { get; set; }

        public int? IsTenantLevelFilter { get; set; }

        public int? MaxNumberOfSegmentsFilter { get; set; }
        public int? MinNumberOfSegmentsFilter { get; set; }

        public int? MaxMaxLengthFilter { get; set; }
        public int? MinMaxLengthFilter { get; set; }

        public int? MaxMinSegmentLengthFilter { get; set; }
        public int? MinMinSegmentLengthFilter { get; set; }

        public int? MaxMaxSegmentLengthFilter { get; set; }
        public int? MinMaxSegmentLengthFilter { get; set; }

    }
}