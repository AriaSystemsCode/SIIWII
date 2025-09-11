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
	[Table("AppEntityStates")]
    [Audited]
    public class AppEntityState : Entity<long>
	{
		public virtual long EntityId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string EntityCode { get; set; }

		[MaxLength]
		public virtual string JsonString { get; set; }

		[ForeignKey("EntityId")]
		public AppEntity EntityFk { get; set; }

	}
}