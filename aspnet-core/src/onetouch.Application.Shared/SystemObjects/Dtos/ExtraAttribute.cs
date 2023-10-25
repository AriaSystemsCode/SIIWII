
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace onetouch.SystemObjects.Dtos
{
    public class ExtraAttributesRoot
    {
        public IList<ExtraAttribute> ExtraAttributes { get; set; }
    }
    public class ExtraAttribute
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string DataType { get; set; }
        public string Width { get; set; }
        public string Decimals { get; set; }
        public string DefaultValue { get; set; }
        public string Usage { get; set; }
        public string IsLookup { get; set; }
        public string EntityObjectTypeCode { get; set; }
        public string AcceptMultipleValues { get; set; }
        public string ValidEntries { get; set; }
        public string IsVariation { get; set; }
        public string IsAdvancedSearch { get; set; }
    }
}