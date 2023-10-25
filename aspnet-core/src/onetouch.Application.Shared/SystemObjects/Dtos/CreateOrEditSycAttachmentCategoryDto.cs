
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSycAttachmentCategoryDto : EntityDto<long?>
    {

		[Required]
		[StringLength(SycAttachmentCategoryConsts.MaxCodeLength, MinimumLength = SycAttachmentCategoryConsts.MinCodeLength)]
		public string Code { get; set; }
		
		
		[Required]
		[StringLength(SycAttachmentCategoryConsts.MaxNameLength, MinimumLength = SycAttachmentCategoryConsts.MinNameLength)]
		public string Name { get; set; }
		
		
		public string Attributes { get; set; }
		
		
		[StringLength(SycAttachmentCategoryConsts.MaxCodeLength, MinimumLength = SycAttachmentCategoryConsts.MaxCodeLength)]
		public string ParentCode { get; set; }
		
		
		 public long? ParentId { get; set; }
		
		[StringLength(SycAttachmentCategoryConsts.MaxAspectRatioLength, MinimumLength = SycAttachmentCategoryConsts.MinAspectRatioLength)]
		public string AspectRatio { get; set; }

		[StringLength(SycAttachmentCategoryConsts.MaxMessageLength, MinimumLength = SycAttachmentCategoryConsts.MinMessageLength)]
		public string Message { get; set; }

		public int? MaxFileSize { get; set; }

		public AttachmentType Type { get; set; }


	}
}