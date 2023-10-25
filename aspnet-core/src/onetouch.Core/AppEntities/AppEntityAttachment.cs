using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.Attachments;
using System.Collections.Generic;

namespace onetouch.AppEntities
{
	[Table("AppEntityAttachments")]
    [Audited]
    public class AppEntityAttachment : Entity<long>
	{
		public virtual long EntityId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string EntityCode { get; set; }

		public virtual long AttachmentId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string AttachmentCode { get; set; }

		public virtual long AttachmentCategoryId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string AttachmentCategoryCode { get; set; }

		[ForeignKey("EntityId")]
		public AppEntity EntityFk { get; set; }

		[ForeignKey("AttachmentId")]
		public AppAttachment AttachmentFk { get; set; }

		[ForeignKey("AttachmentCategoryId")]
		public SycAttachmentCategory AttachmentCategoryFk { get; set; }

		public virtual string Attributes { get; set; }

		public virtual bool IsDefault { get; set; }


	}
}