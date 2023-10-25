
using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SycAttachmentCategoryDto : EntityDto<long>
    {
		public string Code { get; set; }

		public string Name { get; set; }

		public string Attributes { get; set; }

		public string ParentCode { get; set; }

		public long? ParentId { get; set; }

		public string AspectRatio { get; set; }

		public string Message { get; set; }

		public int? MaxFileSize { get; set; }

		public AttachmentType Type { get; set; }

		public List<SycAttachmentTypeDto> SycAttachmentTypeDto { get; set; }

	}
}