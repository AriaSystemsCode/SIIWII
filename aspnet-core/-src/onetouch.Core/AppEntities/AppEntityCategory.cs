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
	[Table("AppEntityCategories")]
    [Audited]
    public class AppEntityCategory : Entity<long>
	{
		public virtual long EntityId { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string EntityCode { get; set; }

		public virtual long EntityObjectCategoryId { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string EntityObjectCategoryCode { get; set; }

		[ForeignKey("EntityId")]
		public AppEntity EntityFk { get; set; }

		[ForeignKey("EntityObjectCategoryId")]
		public SycEntityObjectCategory EntityObjectCategoryFk { get; set; }

	}
}