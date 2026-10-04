using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace onetouch.AppFields
{
    [Table("AppTableFields")]
    public class AppTableField : CreationAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        public long AppFieldId { get; set; }
        public long SycObjectId { get; set; }
        public long? SycEntityObjectTypeId { get; set; }
    }
}
