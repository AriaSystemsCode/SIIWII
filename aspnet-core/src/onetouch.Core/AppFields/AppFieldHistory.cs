using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;

namespace onetouch.AppFields
{
    [Table("AppFieldsHistory")]
    public class AppFieldHistory : Entity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        public long AppFieldId { get; set; }

        [Required, StringLength(10)]
        public string RevisionNo { get; set; }

        [Required, StringLength(20)]
        public string ChangeType { get; set; }

        // Keep the definition as typed columns so older revisions remain readable
        // independently of the current AppFields row.
        public Guid FieldDefinitionKey { get; set; }
        public long? SourceFieldId { get; set; }
        public long? SycObjectId { get; set; }
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

        [Required, StringLength(32)]
        public string FieldLevelCode { get; set; }

        [Required, StringLength(32)]
        public string FieldStatusCode { get; set; }

        [StringLength(100)]
        public string TrackingNo { get; set; }

        [Required, StringLength(10)]
        public string CurrentRevisionNo { get; set; }

        public bool IsStandard { get; set; }
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
        public long? SourceAttributeId { get; set; }
        [StringLength(100)] public string SourceDataType { get; set; }
        public long? SourceEntityObjectTypeId { get; set; }
        [StringLength(100)] public string EntityObjectTypeCode { get; set; }
        [StringLength(500)] public string Usage { get; set; }
        public bool? IsLookup { get; set; }
        public bool? IsVariation { get; set; }
        public bool? IsAdvancedSearch { get; set; }
        public bool? AcceptMultipleValues { get; set; }
        public bool? AllowAddNew { get; set; }
        public ICollection<AppFieldHistoryDropdownOption> DropdownOptions { get; set; } = new List<AppFieldHistoryDropdownOption>();
        public ICollection<AppFieldHistorySettingValue> SettingValues { get; set; } = new List<AppFieldHistorySettingValue>();

        public DateTime CreationTime { get; set; }
        public long? CreatorUserId { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public long? LastModifierUserId { get; set; }
        public bool IsDeleted { get; set; }
        public long? DeleterUserId { get; set; }
        public DateTime? DeletionTime { get; set; }

        public DateTime ChangedAt { get; set; }
        public long? ChangedBy { get; set; }

        [StringLength(10)]
        public string RestoredFromRevisionNo { get; set; }
    }
}
