using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using System.Collections.Generic;

namespace onetouch.SystemObjects
{
	[Table("SydObjectRevisions")]
    [Audited]
    public class SydObjectRevision : FullAuditedEntity<long>
	{
		public virtual long ObjectId { get; set; }
		
        [ForeignKey("ObjectId")]
		public SydObject ObjectFk { get; set; }

		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public virtual string ObjectCode { get; set; }

		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public virtual string RevisionCode { get; set; }

		public virtual string Settings { get; set; }
	}
}