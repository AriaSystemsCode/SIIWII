using System;
using Abp.Application.Services.Dto;

namespace onetouch.SycIdentifierDefinitions.Dtos
{
    public class SycIdentifierDefinitionDto : EntityDto<long>
    {
        public string Code { get; set; }

        public bool IsTenantLevel { get; set; }

        public int NumberOfSegments { get; set; }

        public int MaxLength { get; set; }

        public int MinSegmentLength { get; set; }

        public int MaxSegmentLength { get; set; }

    }
}