using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.SystemObjects.Dtos;

namespace onetouch.SystemObjects
{
	[Table("SycAttachmentCategories")]
    [Audited]
    public class SycAttachmentCategory : FullAuditedEntity<long> 
    {

		[Required]
		[StringLength(SycAttachmentCategoryConsts.MaxCodeLength, MinimumLength = SycAttachmentCategoryConsts.MinCodeLength)]
		public virtual string Code { get; set; }
		
		[Required]
		[StringLength(SycAttachmentCategoryConsts.MaxNameLength, MinimumLength = SycAttachmentCategoryConsts.MinNameLength)]
		public virtual string Name { get; set; }
		
		public virtual string Attributes { get; set; }
		
		public virtual long? ParentId { get; set; }

		[ForeignKey("ParentId")]
		public SycAttachmentCategory ParentFk { get; set; }

		[StringLength(SycAttachmentCategoryConsts.MaxCodeLength, MinimumLength = SycAttachmentCategoryConsts.MaxCodeLength)]
		public virtual string ParentCode { get; set; }

		public virtual long? EntityObjectTypeId { get; set; }

		[ForeignKey("EntityObjectTypeId")]
		public SycEntityObjectType EntityObjectTypeFk { get; set; }

		[StringLength(SycAttachmentCategoryConsts.MaxCodeLength, MinimumLength = SycAttachmentCategoryConsts.MaxCodeLength)]
		public virtual string EntityObjectTypeCode { get; set; }

		[StringLength(SycAttachmentCategoryConsts.MaxAspectRatioLength, MinimumLength = SycAttachmentCategoryConsts.MinAspectRatioLength)]
		public virtual string AspectRatio { get; set; }

		[StringLength(SycAttachmentCategoryConsts.MaxMessageLength, MinimumLength = SycAttachmentCategoryConsts.MinMessageLength)]
		public virtual string Message { get; set; }

		public virtual int? MaxFileSize { get; set; }

		public virtual AttachmentType Type { get; set; }

	}
}