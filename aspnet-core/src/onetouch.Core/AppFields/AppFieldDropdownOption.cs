using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;

namespace onetouch.AppFields
{
    [Table("AppFieldDropdownOptions")]
    public class AppFieldDropdownOption : Entity<long>
    {
        public long AppFieldId { get; set; }
        public int SortOrder { get; set; }
        [Required, StringLength(500)] public string Option { get; set; }
        [Required, StringLength(500)] public string Value { get; set; }
    }

    [Table("AppFieldHistoryDropdownOptions")]
    public class AppFieldHistoryDropdownOption : Entity<long>
    {
        public long AppFieldHistoryId { get; set; }
        public int SortOrder { get; set; }
        [Required, StringLength(500)] public string Option { get; set; }
        [Required, StringLength(500)] public string Value { get; set; }
    }

    [Table("AppTableFieldDropdownOptions")]
    public class AppTableFieldDropdownOption : Entity<long>
    {
        public long AppTableFieldId { get; set; }
        public int SortOrder { get; set; }
        [Required, StringLength(500)] public string Option { get; set; }
        [Required, StringLength(500)] public string Value { get; set; }
    }
}
