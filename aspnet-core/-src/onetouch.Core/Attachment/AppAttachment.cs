using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;

namespace onetouch.Attachments
{
	[Table("AppAttachments")]
    [Audited]
    public class AppAttachment : Entity<long>, IMayHaveTenant
	{
		public int? TenantId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string Code { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxNameLength, MinimumLength = SycEntityObjectClassificationConsts.MinNameLength)]
		public virtual string Name { get; set; }

		public virtual string Attachment { get; set; }

		public virtual string Attributes { get; set; }
		

	}
}