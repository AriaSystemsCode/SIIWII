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
        public VisibleWhen? VisibleWhen { get; set; }
        [XmlElement("RelatedWhen")]
        public RelatedWhen? RelatedWhen { get; set; }
        public DataSource? DataSource { get; set; }

    }
    [Serializable]
    public class DataSource
    {
        public string Service { get; set; }
        public string Api { get; set; }
        public string Parameter { get; set; }
    }

    [Serializable]
    public class VisibleWhen
    {
        public string ExtraAttributeId { get; set; }
        public string OperatorValue { get; set; }
        public string Value { get; set; }

    }

    [Serializable]
    public class RelatedWhen
    {
        [XmlElement("Relation")]
        public List<Relation> Relation { get; set; }
    }

    [Serializable]
    public class Relation
    {
        [XmlElement("TargetName")]
        public string TargetName { get; set; }
        [XmlElement("SourceField")]
        public string SourceField { get; set; }
        [XmlElement("TargetField")]
        public string TargetField { get; set; }
    }

}