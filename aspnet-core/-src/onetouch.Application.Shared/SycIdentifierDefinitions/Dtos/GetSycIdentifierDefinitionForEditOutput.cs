using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycIdentifierDefinitions.Dtos
{
    public class GetSycIdentifierDefinitionForEditOutput
    {
        public CreateOrEditSycIdentifierDefinitionDto SycIdentifierDefinition { get; set; }

    }
}