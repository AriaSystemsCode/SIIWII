using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.AppEntities
{
	[Table("AppEntityClassifications")]
    [Audited]
    public class AppEntityClassification : Entity<long>
	{
		public virtual long EntityId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string EntityCode { get; set; }

		public virtual long EntityObjectClassificationId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string EntityObjectClassificationCode { get; set; }

		[ForeignKey("EntityId")]
		public AppEntity EntityFk { get; set; }

		[ForeignKey("EntityObjectClassificationId")]
		public SycEntityObjectClassification EntityObjectClassificationFk { get; set; }

	}
}