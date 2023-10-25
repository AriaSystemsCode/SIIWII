using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class GetSycAttachmentCategoryForEditOutput
    {
		public CreateOrEditSycAttachmentCategoryDto SycAttachmentCategory { get; set; }

		public string SycAttachmentCategoryName { get; set;}


    }
}