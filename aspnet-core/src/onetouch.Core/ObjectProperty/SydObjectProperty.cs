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
	[Table("SydObjectProperties")]
    [Audited]
    public class SydObjectProperty : FullAuditedEntity<long>
	{
		public virtual long ObjectId { get; set; }
		
        [ForeignKey("ObjectId")]
		public SydObject ObjectFk { get; set; }

		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public virtual string ObjectCode { get; set; }

		public virtual long ObjectRevisionId { get; set; }

		[ForeignKey("ObjectRevisionId")]
		public SydObjectRevision ObjectRevisionFk { get; set; }

		public virtual long PropertyId { get; set; }

		[ForeignKey("PropertyId")]
		public SysObjectTypeProperty PropertyFk { get; set; }


		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public virtual string PropertyCode { get; set; }

		[StringLength(SydObjectConsts.MaxNameLength, MinimumLength = SydObjectConsts.MinNameLength)]
		public virtual string PropertyName { get; set; }

		public virtual long PropertyTypeId { get; set; }

		[ForeignKey("PropertyTypeId")]
		public SysPropertyType PropertyTypeFk { get; set; }

		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public virtual string PropertyTypeCode { get; set; }

		public virtual string PropertySettings { get; set; }

	}
}