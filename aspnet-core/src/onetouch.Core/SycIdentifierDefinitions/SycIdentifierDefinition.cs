using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.SycIdentifierDefinitions
{
    [Table("SycIdentifierDefinitions")]
    [Audited]
    public class SycIdentifierDefinition : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        [StringLength(SycIdentifierDefinitionConsts.MaxCodeLength, MinimumLength = SycIdentifierDefinitionConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        public virtual bool IsTenantLevel { get; set; }

        public virtual int NumberOfSegments { get; set; }

        public virtual int MaxLength { get; set; }

        public virtual int MinSegmentLength { get; set; }

        public virtual int MaxSegmentLength { get; set; }

    }
}