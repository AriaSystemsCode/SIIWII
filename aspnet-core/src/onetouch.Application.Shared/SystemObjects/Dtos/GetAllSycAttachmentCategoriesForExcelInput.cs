using Abp.Application.Services.Dto;
using System;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSycAttachmentCategoriesForExcelInput
    {
		public string Filter { get; set; }

		public string CodeFilter { get; set; }

		public string NameFilter { get; set; }

		public string AttributesFilter { get; set; }

		public string ParentCodeFilter { get; set; }

		 public string SycAttachmentCategoryNameFilter { get; set; }

		 public string AspectRatioFilter { get; set; }

		 public int? MaxFileSizeFilter { get; set; }

		 public string MessageFilter { get; set; }

		 public AttachmentType? TypeFilter { get; set; }

	}
}