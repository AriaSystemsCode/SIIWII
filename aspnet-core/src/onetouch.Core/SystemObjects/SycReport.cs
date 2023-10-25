using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.SystemObjects
{
	[Table("SycReports")]
    [Audited]
    public class SycReport : FullAuditedEntity ,IMayHaveTenant
    {

		public int? TenantId { get; set; }

		[Required]
		[StringLength(SycEntityObjectTypeConsts.MaxCodeLength, MinimumLength = SycEntityObjectTypeConsts.MinCodeLength)]
		public virtual string Code { get; set; }

		[Required]
		[StringLength(SycEntityObjectTypeConsts.MaxNameLength, MinimumLength = SycEntityObjectTypeConsts.MinNameLength)]
		public virtual string Name { get; set; }

		public virtual string Description { get; set; }

		public virtual string Thumbnail { get; set; }

		public virtual long EntityObjectTypeId { get; set; }

		[ForeignKey("EntityObjectTypeId")]
		public SycEntityObjectType EntityObjectTypeFk { get; set; }

		[StringLength(SycEntityObjectTypeConsts.MaxCodeLength, MinimumLength = SycEntityObjectTypeConsts.MinCodeLength)]
		public virtual string EntityObjectTypeCode { get; set; }

	}
}