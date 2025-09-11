using onetouch.SycSegmentIdentifierDefinitions;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.SycCounters
{
    [Table("SycCounters")]
    [Audited]
    public class SycCounter : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        public virtual long Counter { get; set; }

        public virtual long? SycSegmentIdentifierDefinitionId { get; set; }

        [ForeignKey("SycSegmentIdentifierDefinitionId")]
        public SycSegmentIdentifierDefinition SycSegmentIdentifierDefinitionFk { get; set; }

    }
}