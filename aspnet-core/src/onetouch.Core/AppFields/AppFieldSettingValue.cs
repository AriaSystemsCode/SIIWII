using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;

namespace onetouch.AppFields
{
    [Table("AppFieldSettingValues")]
    public class AppFieldSettingValue : Entity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        public long AppFieldId { get; set; }
        public long SettingFieldId { get; set; }
        [Required, StringLength(11)] public string SettingFieldCode { get; set; }
        [Required, StringLength(250)] public string SettingFieldName { get; set; }
        [StringLength(2000)] public string Value { get; set; }
    }

    [Table("AppFieldHistorySettingValues")]
    public class AppFieldHistorySettingValue : Entity<long>
    {
        public long AppFieldHistoryId { get; set; }
        public long SettingFieldId { get; set; }
        [Required, StringLength(11)] public string SettingFieldCode { get; set; }
        [Required, StringLength(250)] public string SettingFieldName { get; set; }
        [StringLength(2000)] public string Value { get; set; }
    }

    [Table("AppTableFieldSettingValues")]
    public class AppTableFieldSettingValue : Entity<long>
    {
        public long AppTableFieldId { get; set; }
        public long SettingFieldId { get; set; }
        [Required, StringLength(11)] public string SettingFieldCode { get; set; }
        [Required, StringLength(250)] public string SettingFieldName { get; set; }
        [StringLength(2000)] public string Value { get; set; }
    }
}
