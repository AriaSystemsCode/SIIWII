﻿using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycSegmentIdentifierDefinitions.Dtos
{
    public class CreateOrEditSycSegmentIdentifierDefinitionDto : EntityDto<long?>
    {

        [StringLength(SycSegmentIdentifierDefinitionConsts.MaxCodeLength, MinimumLength = SycSegmentIdentifierDefinitionConsts.MinCodeLength)]
        public string Code { get; set; }

        [StringLength(SycSegmentIdentifierDefinitionConsts.MaxNameLength, MinimumLength = SycSegmentIdentifierDefinitionConsts.MinNameLength)]
        public string Name { get; set; }

        public int SegmentNumber { get; set; }

        [StringLength(SycSegmentIdentifierDefinitionConsts.MaxSegmentHeaderLength, MinimumLength = SycSegmentIdentifierDefinitionConsts.MinSegmentHeaderLength)]
        public string SegmentHeader { get; set; }

        [StringLength(SycSegmentIdentifierDefinitionConsts.MaxSegmentMaskLength, MinimumLength = SycSegmentIdentifierDefinitionConsts.MinSegmentMaskLength)]
        public string SegmentMask { get; set; }

        public int SegmentLength { get; set; }

        public string SegmentType { get; set; }

        public bool IsAutoGenerated { get; set; }

        public bool IsEditable { get; set; }

        public bool IsVisible { get; set; }

        public int CodeStartingValue { get; set; }

        [StringLength(SycSegmentIdentifierDefinitionConsts.MaxLookOrFieldNameLength, MinimumLength = SycSegmentIdentifierDefinitionConsts.MinLookOrFieldNameLength)]
        public string LookOrFieldName { get; set; }

        public long? SycIdentifierDefinitionId { get; set; }

    }
}