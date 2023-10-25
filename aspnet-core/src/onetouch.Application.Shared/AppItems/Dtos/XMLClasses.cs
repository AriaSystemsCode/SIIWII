using System;
using System.Collections.Generic;
using System.Xml.Serialization;
using Abp.Application.Services.Dto;

namespace onetouch.AppItems.Dtos
{
    [Serializable]
    public class BaseXML
    {
        public string ToXML()
        {
            using (var stringwriter = new System.IO.StringWriter())
            {
                var serializer = new XmlSerializer(this.GetType());
                serializer.Serialize(stringwriter, this);
                return stringwriter.ToString();
            }
        }
    }


    [Serializable]
    public class ItemExtraAttributes : BaseXML
    {
        public List<ExtraAttribute> ExtraAttributes { get; set; }
    }

    [Serializable]
    public class ExtraAttribute : BaseXML
    {
        public long AttributeId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string DataType { get; set; }
        public string Width { get; set; }
        public int Decimals { get; set; }
        public string DefaultValue { get; set; }
        public string Usage { get; set; }
        public bool IsLookup { get; set; }
        public string EntityObjectTypeCode { get; set; }
        public bool AcceptMultipleValues { get; set; }
        public string ValidEntries { get; set; }
        public bool IsVariation { get; set; }
        public bool IsAdvancedSearch { get; set; }
        public bool AllowAddNew { get; set; }
        
    }

}