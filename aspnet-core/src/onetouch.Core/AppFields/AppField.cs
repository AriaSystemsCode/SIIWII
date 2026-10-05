using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace onetouch.AppFields
{
    [Table("APPFields")]
    public class AppField : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        public long? SourceFieldId { get; set; }
        public long SycObjectId { get; set; }
        public long? EntitySycObjectId { get; set; }

        [Required, StringLength(11, MinimumLength = 11)]
        public string FieldCode { get; set; }

        [Required, StringLength(250)]
        public string FieldName { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        public long FieldTypeId { get; set; }
        public long? WidgetTypeId { get; set; }
        public long? FieldLevelId { get; set; }
        public long? FieldStatusId { get; set; }

        // The level and status lookup IDs remain optional until their metadata is defined.
        [Required, StringLength(32)]
        public string FieldLevelCode { get; set; }

        [Required, StringLength(32)]
        public string FieldStatusCode { get; set; }

        [StringLength(100)]
        public string TrackingNo { get; set; }

        [Required, StringLength(10)]
        public string CurrentRevisionNo { get; set; }

        public bool IsStandard { get; set; }
        public bool IsCustom { get; set; }
        public bool IsExtraField { get; set; }
        public bool IsHidden { get; set; }

        public bool AllowNull { get; set; }
        public int? Length { get; set; }
        public int? Decimals { get; set; }

        [StringLength(2000)]
        public string DefaultValue { get; set; }

        [StringLength(100)]
        public string DateFormat { get; set; }

        [StringLength(100)]
        public string TimeFormat { get; set; }

        public bool AllowMultiSelect { get; set; }
        public bool Required { get; set; }
        public bool Visible { get; set; }
        public bool Editable { get; set; }

        // Type-specific attributes (for example dropdown options) are JSON.
        public string ExtraAttributes { get; set; }
    }
}
