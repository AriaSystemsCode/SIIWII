
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSycEntityObjectCategoryDto : EntityDto<int?>
    {

		[Required]
		[StringLength(SycEntityObjectCategoryConsts.MaxCodeLength, MinimumLength = SycEntityObjectCategoryConsts.MinCodeLength)]
		public string Code { get; set; }
		
		
		[Required]
		[StringLength(SycEntityObjectCategoryConsts.MaxNameLength, MinimumLength = SycEntityObjectCategoryConsts.MinNameLength)]
		public string Name { get; set; }
		
		
		 public long ObjectId { get; set; }
		 
		 		 public int? ParentId { get; set; }
		 
		 
    }
}