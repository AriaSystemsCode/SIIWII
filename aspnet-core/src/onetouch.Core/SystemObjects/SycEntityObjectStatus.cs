using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using Abp.Authorization.Users;
using System.ComponentModel;

namespace onetouch.SystemObjects
{
	[Table("SycEntityObjectStatuses")]
    [Audited]
    public class SycEntityObjectStatus : FullAuditedEntity<long>
	{

		[StringLength(SycEntityObjectStatusConsts.MaxCodeLength, MinimumLength = SycEntityObjectStatusConsts.MinCodeLength)]
		public virtual string Code { get; set; }
		
		[Required]
		[StringLength(SycEntityObjectStatusConsts.MaxNameLength, MinimumLength = SycEntityObjectStatusConsts.MinNameLength)]
		public virtual string Name { get; set; }

		public virtual long ObjectId { get; set; }
		
        [ForeignKey("ObjectId")]
		public SydObject ObjectFk { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string ObjectCode { get; set; }

		public int? TenantId { get; set; }

		[ForeignKey("UserId")]
		public AbpUserBase UserFk { get; set; }

		[DefaultValue(false)]
		public virtual bool IsDefault { get; set; }
	}
}