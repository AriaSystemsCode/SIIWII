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
using System.ComponentModel;

namespace onetouch.SystemObjects
{
	[Table("SycEntityObjectClassifications")]
    [Audited]
    public class SycEntityObjectClassification : FullAuditedEntity <long>
    {

		[Required]
		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string Code { get; set; }
		
		[Required]
		[StringLength(SycEntityObjectClassificationConsts.MaxNameLength, MinimumLength = SycEntityObjectClassificationConsts.MinNameLength)]
		public virtual string Name { get; set; }
		
		public virtual long? ObjectId { get; set; }
		
        [ForeignKey("ObjectId")]
		public SydObject ObjectFk { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string ObjectCode { get; set; }

		public virtual long? ParentId { get; set; }
		
        [ForeignKey("ParentId")]
		public SycEntityObjectClassification ParentFk { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string ParentCode { get; set; }

		public ICollection<SycEntityObjectClassification> SycEntityObjectClassifications { get; set; }
		public int? TenantId { get; set; }

		[ForeignKey("UserId")]
		public AbpUserBase UserFk { get; set; }

		[DefaultValue(false)]
		public virtual bool IsDefault { get; set; }
	}
}