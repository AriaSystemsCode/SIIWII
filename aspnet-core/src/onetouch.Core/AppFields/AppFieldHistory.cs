using System;
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

        [Required]
        public string SnapshotJson { get; set; }

        public DateTime ChangedAt { get; set; }
        public long? ChangedBy { get; set; }

        [StringLength(10)]
        public string RestoredFromRevisionNo { get; set; }
    }
}
