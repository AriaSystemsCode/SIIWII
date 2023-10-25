using onetouch.SystemObjects.Dtos;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.SystemObjects
{
	[Table("SycAttachmentTypes")]
    [Audited]
    public class SycAttachmentType : FullAuditedEntity<long> 
    {

		[Required]
		[StringLength(SycAttachmentTypeConsts.MaxNameLength, MinimumLength = SycAttachmentTypeConsts.MinNameLength)]
		public virtual string Name { get; set; }
		
		public virtual AttachmentType Type { get; set; }
		
		[Required]
		[StringLength(SycAttachmentTypeConsts.MaxExtensionLength, MinimumLength = SycAttachmentTypeConsts.MinExtensionLength)]
		public virtual string Extension { get; set; }
		

    }
}