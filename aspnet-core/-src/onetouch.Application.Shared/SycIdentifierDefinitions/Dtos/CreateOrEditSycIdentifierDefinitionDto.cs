using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycIdentifierDefinitions.Dtos
{
    public class CreateOrEditSycIdentifierDefinitionDto : EntityDto<long?>
    {

        [StringLength(SycIdentifierDefinitionConsts.MaxCodeLength, MinimumLength = SycIdentifierDefinitionConsts.MinCodeLength)]
        public string Code { get; set; }

        public bool IsTenantLevel { get; set; }

        public int NumberOfSegments { get; set; }

        public int MaxLength { get; set; }

        public int MinSegmentLength { get; set; }

        public int MaxSegmentLength { get; set; }

    }
}