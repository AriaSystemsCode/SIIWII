using onetouch.SystemObjects.Dtos;

using System;
using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SycAttachmentTypeDto : EntityDto<long>
    {
		public string Name { get; set; }

		public AttachmentType Type { get; set; }

		public string Extension { get; set; }



    }
}