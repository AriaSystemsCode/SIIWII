using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;

namespace onetouch.AppFields.Dto
{
    public class PreviewFieldCodeInput
    {
        [Range(1, long.MaxValue)] public long FieldTypeId { get; set; }
        [Required, StringLength(250)] public string FieldName { get; set; }
        [StringLength(32)] public string FieldLevelCode { get; set; }
    }

    public class FieldCodePreviewDto
    {
        public string FieldCode { get; set; }
    }

    public class CreateOrEditFieldInput
    {
        public long? Id { get; set; }
        public long SycObjectId { get; set; }
        public long? EntitySycObjectId { get; set; }
        public long? SelectedObjectTypeId { get; set; }
        public long FieldTypeId { get; set; }
        public long? WidgetTypeId { get; set; }
        public long? FieldLevelId { get; set; }
        public long? FieldStatusId { get; set; }
        [StringLength(11)] public string FieldCode { get; set; }
        [Required, StringLength(250)] public string FieldName { get; set; }
        [StringLength(2000)] public string Description { get; set; }
        [StringLength(32)] public string FieldLevelCode { get; set; }
        [StringLength(32)] public string FieldStatusCode { get; set; }
        [StringLength(100)] public string TrackingNo { get; set; }
        public bool IsExtraField { get; set; }
        public bool AllowNull { get; set; }
        public int? Length { get; set; }
        public int? Decimals { get; set; }
        [StringLength(2000)] public string DefaultValue { get; set; }
        [StringLength(100)] public string DateFormat { get; set; }
        [StringLength(100)] public string TimeFormat { get; set; }
        public bool AllowMultiSelect { get; set; }
        public bool Required { get; set; }
        public bool Visible { get; set; } = true;
        public bool Editable { get; set; } = true;
        public string ExtraAttributes { get; set; }
    }

    public class GetFieldsInput : PagedAndSortedResultRequestDto
    {
        public long? SelectedObjectId { get; set; }
        public long? SelectedObjectTypeId { get; set; }
        public bool AllFields { get; set; } = true;
        public string SearchText { get; set; }
        public long? FieldTypeId { get; set; }
        public long? FieldStatusId { get; set; }
        public long? FieldLevelId { get; set; }
        public string FieldStatusCode { get; set; }
        public string FieldLevelCode { get; set; }
        public string TrackingNo { get; set; }
        public bool? IsStandard { get; set; }
        public long? CreatedByUserId { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public string GroupBy { get; set; }
    }

    public class AssignExistingFieldInput
    {
        [Range(1, long.MaxValue)] public long AppFieldId { get; set; }
        [Range(1, long.MaxValue)] public long SycObjectId { get; set; }
        public long? SycEntityObjectTypeId { get; set; }
    }

    public class AppFieldDto : CreateOrEditFieldInput
    {
        public int? TenantId { get; set; }
        public long? SourceFieldId { get; set; }
        public string CurrentRevisionNo { get; set; }
        public bool IsStandard { get; set; }
        public bool IsCustom { get; set; }
        public bool IsHidden { get; set; }
        public DateTime CreationTime { get; set; }
        public long? CreatorUserId { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public long? LastModifierUserId { get; set; }
        public bool IsDeleted { get; set; }
        public long? DeleterUserId { get; set; }
        public DateTime? DeletionTime { get; set; }
    }

    public class AppFieldListDto
    {
        public long Id { get; set; }
        public string FieldCode { get; set; }
        public string FieldName { get; set; }
        public string Description { get; set; }
        public string FieldTypeName { get; set; }
        public string WidgetTypeName { get; set; }
        public string FieldLevelName { get; set; }
        public string StatusName { get; set; }
        public string RevisionNo { get; set; }
        public string TrackingNo { get; set; }
        public string StandardOrCustom { get; set; }
        public bool IsStandard { get; set; }
        public bool IsCustom { get; set; }
        public bool IsExtraField { get; set; }
        public bool IsHidden { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanHide { get; set; }
        public long SycObjectId { get; set; }
        public long? EntitySycObjectId { get; set; }
        public long? CreatorUserId { get; set; }
        public DateTime CreationTime { get; set; }
        public List<string> Tables { get; set; } = new List<string>();
    }

    public class FieldEditPermissionDto
    {
        public bool CanEditCoreInfo { get; set; }
        public bool CanEditAttributes { get; set; }
        public bool CanDelete { get; set; }
        public bool CanHide { get; set; }
        public bool IsTenantCustomCopyRequired { get; set; }
    }

    public class GetFieldForEditOutput
    {
        public AppFieldDto Field { get; set; }
        public FieldEditPermissionDto Permissions { get; set; }
    }

    public class FieldManagerPermissionDto
    {
        public bool CanViewPage { get; set; }
        public bool CanCreateField { get; set; }
        public bool CanEditField { get; set; }
        public bool CanDeleteField { get; set; }
        public bool CanDuplicateField { get; set; }
        public bool CanRestoreRevision { get; set; }
        public bool CanAddExistingField { get; set; }
        public bool IsHost { get; set; }
        public bool IsTenant { get; set; }
    }

    public class ObjectTypeTreeNodeDto
    {
        public long Id { get; set; }
        public long? ParentId { get; set; }
        public string Key { get; set; }
        public string ParentKey { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string NodeType { get; set; }
        public long SycObjectId { get; set; }
        public List<ObjectTypeTreeNodeDto> Children { get; set; } = new List<ObjectTypeTreeNodeDto>();
    }

    public class FieldActionResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class FieldLookupDto
    {
        public long? Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
    }

    public class FieldCreateOrEditMetadataDto
    {
        public List<FieldLookupDto> FieldTypes { get; set; }
        public List<FieldLookupDto> WidgetTypes { get; set; }
        public List<FieldLookupDto> FieldLevels { get; set; }
        public List<FieldLookupDto> FieldStatuses { get; set; }
        public List<FieldLookupDto> Entities { get; set; }
    }
}
