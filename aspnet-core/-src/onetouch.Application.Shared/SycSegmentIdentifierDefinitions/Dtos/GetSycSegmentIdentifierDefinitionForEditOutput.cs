using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycSegmentIdentifierDefinitions.Dtos
{
    public class GetSycSegmentIdentifierDefinitionForEditOutput
    {
        public CreateOrEditSycSegmentIdentifierDefinitionDto SycSegmentIdentifierDefinition { get; set; }

        public string SycIdentifierDefinitionCode { get; set; }

    }
}