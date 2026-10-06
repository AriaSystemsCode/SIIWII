using System;
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
        [Required] public string SnapshotJson { get; set; }
        public long SycObjectId { get; set; }
        public long? SycEntityObjectTypeId { get; set; }
    }
}
