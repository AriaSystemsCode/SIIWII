
using System;
using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SycEntityObjectCategoryDto : EntityDto<long>
    {
		public string Code { get; set; }

		public string Name { get; set; }
		 public long ObjectId { get; set; }

		 		 public long? ParentId { get; set; }

		 
    }
}