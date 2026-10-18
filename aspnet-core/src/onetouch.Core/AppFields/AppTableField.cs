using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace onetouch.AppFields
{
    [Table("AppTableFields")]
    public class AppTableField : CreationAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        public Guid FieldDefinitionKey { get; set; }
        [Required, StringLength(11)] public string FieldCode { get; set; }
        [Required, StringLength(10)] public string AppliedRevisionNo { get; set; }
        public long SycObjectId { get; set; }
        public long? SycEntityObjectTypeId { get; set; }

        // The applied definition belongs to this assignment, independently of AppFields.
        public long SourceAppFieldId { get; set; }
        public int? FieldTenantId { get; set; }
        public long? SourceFieldId { get; set; }
        public long? DefinitionSycObjectId { get; set; }
        public long? EntitySycObjectId { get; set; }
        [Required, StringLength(250)] public string FieldName { get; set; }
        [StringLength(2000)] public string Description { get; set; }
        public long FieldTypeId { get; set; }
        public long? WidgetTypeId { get; set; }
        public long? FieldLevelId { get; set; }
        public long? FieldStatusId { get; set; }
        [Required, StringLength(32)] public string FieldLevelCode { get; set; }
        [Required, StringLength(32)] public string FieldStatusCode { get; set; }
        [StringLength(100)] public string TrackingNo { get; set; }
        public bool IsStandard { get; set; }
        public bool IsExtraField { get; set; }
        public bool IsHidden { get; set; }
        public bool AllowNull { get; set; }
        public int? Length { get; set; }
        public int? Decimals { get; set; }
        [StringLength(2000)] public string DefaultValue { get; set; }
        [StringLength(100)] public string DateFormat { get; set; }
        [StringLength(100)] public string TimeFormat { get; set; }
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
        public ICollection<AppTableFieldSettingValue> SettingValues { get; set; } = new List<AppTableFieldSettingValue>();
        public DateTime FieldCreationTime { get; set; }
        public long? FieldCreatorUserId { get; set; }
        public DateTime? FieldLastModificationTime { get; set; }
        public long? FieldLastModifierUserId { get; set; }
        public bool FieldIsDeleted { get; set; }
        public long? FieldDeleterUserId { get; set; }
        public DateTime? FieldDeletionTime { get; set; }

        public void CopyDefinitionFrom(AppField field)
        {
            FieldDefinitionKey = field.FieldDefinitionKey;
            FieldCode = field.FieldCode;
            AppliedRevisionNo = field.CurrentRevisionNo;
            SourceAppFieldId = field.Id;
            FieldTenantId = field.TenantId;
            SourceFieldId = field.SourceFieldId;
            DefinitionSycObjectId = field.SycObjectId;
            EntitySycObjectId = field.EntitySycObjectId;
            FieldName = field.FieldName;
            Description = field.Description;
            FieldTypeId = field.FieldTypeId;
            WidgetTypeId = field.WidgetTypeId;
            FieldLevelId = field.FieldLevelId;
            FieldStatusId = field.FieldStatusId;
            FieldLevelCode = field.FieldLevelCode;
            FieldStatusCode = field.FieldStatusCode;
            TrackingNo = field.TrackingNo;
            IsStandard = field.IsStandard;
            IsExtraField = field.IsExtraField;
            IsHidden = field.IsHidden;
            AllowNull = field.AllowNull;
            Length = field.Length;
            Decimals = field.Decimals;
            DefaultValue = field.DefaultValue;
            DateFormat = field.DateFormat;
            TimeFormat = field.TimeFormat;
            AllowMultiSelect = field.AllowMultiSelect;
            Required = field.Required;
            Visible = field.Visible;
            Editable = field.Editable;
            SourceAttributeId = field.SourceAttributeId;
            SourceDataType = field.SourceDataType;
            SourceEntityObjectTypeId = field.SourceEntityObjectTypeId;
            EntityObjectTypeCode = field.EntityObjectTypeCode;
            Usage = field.Usage;
            IsLookup = field.IsLookup;
            IsVariation = field.IsVariation;
            IsAdvancedSearch = field.IsAdvancedSearch;
            AcceptMultipleValues = field.AcceptMultipleValues;
            AllowAddNew = field.AllowAddNew;
            SettingValues.Clear();
            foreach (var value in field.SettingValues)
                SettingValues.Add(new AppTableFieldSettingValue
                {
                    SettingFieldId = value.SettingFieldId,
                    SettingFieldCode = value.SettingFieldCode,
                    SettingFieldName = value.SettingFieldName,
                    AppFieldsOptionId = value.AppFieldsOptionId,
                    OptionCode = value.OptionCode,
                    OptionName = value.OptionName,
                    ValueText = value.ValueText,
                    ValueNumber = value.ValueNumber,
                    ValueBoolean = value.ValueBoolean,
                    ValueDateTime = value.ValueDateTime
                });
            FieldCreationTime = field.CreationTime;
            FieldCreatorUserId = field.CreatorUserId;
            FieldLastModificationTime = field.LastModificationTime;
            FieldLastModifierUserId = field.LastModifierUserId;
            FieldIsDeleted = field.IsDeleted;
            FieldDeleterUserId = field.DeleterUserId;
            FieldDeletionTime = field.DeletionTime;
        }

        public AppField ToAppField()
        {
            return new AppField
            {
                Id = SourceAppFieldId,
                TenantId = FieldTenantId,
                FieldDefinitionKey = FieldDefinitionKey,
                SourceFieldId = SourceFieldId,
                SycObjectId = DefinitionSycObjectId,
                EntitySycObjectId = EntitySycObjectId,
                FieldCode = FieldCode,
                FieldName = FieldName,
                Description = Description,
                FieldTypeId = FieldTypeId,
                WidgetTypeId = WidgetTypeId,
                FieldLevelId = FieldLevelId,
                FieldStatusId = FieldStatusId,
                FieldLevelCode = FieldLevelCode,
                FieldStatusCode = FieldStatusCode,
                TrackingNo = TrackingNo,
                CurrentRevisionNo = AppliedRevisionNo,
                IsStandard = IsStandard,
                IsExtraField = IsExtraField,
                IsHidden = IsHidden,
                AllowNull = AllowNull,
                Length = Length,
                Decimals = Decimals,
                DefaultValue = DefaultValue,
                DateFormat = DateFormat,
                TimeFormat = TimeFormat,
                AllowMultiSelect = AllowMultiSelect,
                Required = Required,
                Visible = Visible,
                Editable = Editable,
                SourceAttributeId = SourceAttributeId,
                SourceDataType = SourceDataType,
                SourceEntityObjectTypeId = SourceEntityObjectTypeId,
                EntityObjectTypeCode = EntityObjectTypeCode,
                Usage = Usage,
                IsLookup = IsLookup,
                IsVariation = IsVariation,
                IsAdvancedSearch = IsAdvancedSearch,
                AcceptMultipleValues = AcceptMultipleValues,
                AllowAddNew = AllowAddNew,
                SettingValues = SettingValues.Select(x => new AppFieldSettingValue
                {
                    TenantId = FieldTenantId,
                    AppFieldId = SourceAppFieldId,
                    SettingFieldId = x.SettingFieldId,
                    SettingFieldCode = x.SettingFieldCode,
                    SettingFieldName = x.SettingFieldName,
                    AppFieldsOptionId = x.AppFieldsOptionId,
                    OptionCode = x.OptionCode,
                    OptionName = x.OptionName,
                    ValueText = x.ValueText,
                    ValueNumber = x.ValueNumber,
                    ValueBoolean = x.ValueBoolean,
                    ValueDateTime = x.ValueDateTime
                }).ToList(),
                CreationTime = FieldCreationTime,
                CreatorUserId = FieldCreatorUserId,
                LastModificationTime = FieldLastModificationTime,
                LastModifierUserId = FieldLastModifierUserId,
                IsDeleted = FieldIsDeleted,
                DeleterUserId = FieldDeleterUserId,
                DeletionTime = FieldDeletionTime
            };
        }
    }
}
