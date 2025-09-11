
using System;
using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SydObjectDto : EntityDto<long>
    {
		public string Name { get; set; }

		public string Code { get; set; }


		 public int ObjectTypeId { get; set; }

		 		 public int? ParentId { get; set; }

		 
    }
}