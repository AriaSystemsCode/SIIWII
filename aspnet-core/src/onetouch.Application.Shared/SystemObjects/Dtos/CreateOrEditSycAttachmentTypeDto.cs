using onetouch.SystemObjects.Dtos;

using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSycAttachmentTypeDto : EntityDto<long?>
    {

		[Required]
		[StringLength(SycAttachmentTypeConsts.MaxNameLength, MinimumLength = SycAttachmentTypeConsts.MinNameLength)]
		public string Name { get; set; }
		
		
		public AttachmentType Type { get; set; }
		
		
		[Required]
		[StringLength(SycAttachmentTypeConsts.MaxExtensionLength, MinimumLength = SycAttachmentTypeConsts.MinExtensionLength)]
		public string Extension { get; set; }
		
		

    }
}