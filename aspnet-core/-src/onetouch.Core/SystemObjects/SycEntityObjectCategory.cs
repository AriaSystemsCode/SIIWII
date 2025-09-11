using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using System.Collections.Generic;
using Abp.Authorization.Users;
using onetouch.Authorization.Users;
using System.ComponentModel;

namespace onetouch.SystemObjects
{
	[Table("SycEntityObjectCategories")]
    [Audited]
    public class SycEntityObjectCategory : FullAuditedEntity <long>
    {

		[Required]
		[StringLength(SycEntityObjectCategoryConsts.MaxCodeLength, MinimumLength = SycEntityObjectCategoryConsts.MinCodeLength)]
		public virtual string Code { get; set; }
		
		[Required]
		[StringLength(SycEntityObjectCategoryConsts.MaxNameLength, MinimumLength = SycEntityObjectCategoryConsts.MinNameLength)]
		public virtual string Name { get; set; }

		public virtual long ObjectId { get; set; }
		
        [ForeignKey("ObjectId")]
		public SydObject ObjectFk { get; set; }

		[StringLength(SycEntityObjectCategoryConsts.MaxCodeLength, MinimumLength = SycEntityObjectCategoryConsts.MinCodeLength)]
		public virtual string ObjectCode { get; set; }

		public virtual long? ParentId { get; set; }
		
        [ForeignKey("ParentId")]
		public SycEntityObjectCategory ParentFk { get; set; }

		[StringLength(SycEntityObjectCategoryConsts.MaxCodeLength, MinimumLength = SycEntityObjectCategoryConsts.MinCodeLength)]
		public virtual string ParentCode { get; set; }

		public ICollection<SycEntityObjectCategory> SycEntityObjectCategories { get; set; }
		public int? TenantId { get; set; }


		public virtual long? UserId { get; set; }

		[ForeignKey("UserId")]
		public AbpUserBase UserFk { get; set; }

		[DefaultValue(false)]
		public virtual bool IsDefault { get; set; }
	}
}