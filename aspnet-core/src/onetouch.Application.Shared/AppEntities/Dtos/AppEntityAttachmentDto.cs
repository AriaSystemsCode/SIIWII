using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using Abp.Application.Services.Dto;

namespace onetouch.AppEntities.Dtos
{
    public class AppEntityAttachmentDto : EntityDto<long>
	{
		public virtual long AttachmentCategoryId { get; set; }

		public virtual AttachmentsCategories AttachmentCategoryEnum { get; set; }

		public virtual string FileName { get; set; }

		public virtual string DisplayName { get; set; }

		public virtual string Url { get; set; }

		public virtual string guid { get; set; }

		public virtual string Attributes { get; set; }

		public virtual int Index { get; set; }

		public virtual bool IsDefault { get; set; }

	}
	public enum AttachmentsCategories
	{
		LOGO,
		BANNER,
		IMAGE,
		FILE,
		VIDEO,
	}
}