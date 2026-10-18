using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;

namespace onetouch.AppFields
{
    [Table("AppFieldsOptions")]
    public class AppFieldsOption : Entity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        public long SettingFieldId { get; set; }
        [Required, StringLength(100)] public string Code { get; set; }
        [Required, StringLength(500)] public string Name { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    [Table("AppFieldSettingValues")]
    public class AppFieldSettingValue : Entity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        public long AppFieldId { get; set; }
        public long SettingFieldId { get; set; }
        [Required, StringLength(11)] public string SettingFieldCode { get; set; }
        [Required, StringLength(250)] public string SettingFieldName { get; set; }
        public long? AppFieldsOptionId { get; set; }
        [StringLength(100)] public string OptionCode { get; set; }
        [StringLength(500)] public string OptionName { get; set; }
        [StringLength(2000)] public string ValueText { get; set; }
        [Column(TypeName = "decimal(18,6)")] public decimal? ValueNumber { get; set; }
        public bool? ValueBoolean { get; set; }
        public DateTime? ValueDateTime { get; set; }
    }

    [Table("AppFieldHistorySettingValues")]
    public class AppFieldHistorySettingValue : Entity<long>
    {
        public long AppFieldHistoryId { get; set; }
        public long SettingFieldId { get; set; }
        [Required, StringLength(11)] public string SettingFieldCode { get; set; }
        [Required, StringLength(250)] public string SettingFieldName { get; set; }
        public long? AppFieldsOptionId { get; set; }
        [StringLength(100)] public string OptionCode { get; set; }
        [StringLength(500)] public string OptionName { get; set; }
        [StringLength(2000)] public string ValueText { get; set; }
        [Column(TypeName = "decimal(18,6)")] public decimal? ValueNumber { get; set; }
        public bool? ValueBoolean { get; set; }
        public DateTime? ValueDateTime { get; set; }
    }

    [Table("AppTableFieldSettingValues")]
    public class AppTableFieldSettingValue : Entity<long>
    {
        public long AppTableFieldId { get; set; }
        public long SettingFieldId { get; set; }
        [Required, StringLength(11)] public string SettingFieldCode { get; set; }
        [Required, StringLength(250)] public string SettingFieldName { get; set; }
        public long? AppFieldsOptionId { get; set; }
        [StringLength(100)] public string OptionCode { get; set; }
        [StringLength(500)] public string OptionName { get; set; }
        [StringLength(2000)] public string ValueText { get; set; }
        [Column(TypeName = "decimal(18,6)")] public decimal? ValueNumber { get; set; }
        public bool? ValueBoolean { get; set; }
        public DateTime? ValueDateTime { get; set; }
    }
}
