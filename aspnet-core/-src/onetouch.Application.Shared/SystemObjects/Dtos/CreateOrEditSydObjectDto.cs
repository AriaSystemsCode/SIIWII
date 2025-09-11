
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSydObjectDto : EntityDto<int?>
    {

		[Required]
		[StringLength(SydObjectConsts.MaxNameLength, MinimumLength = SydObjectConsts.MinNameLength)]
		public string Name { get; set; }
		
		
		[Required]
		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public string Code { get; set; }
		
		
		 public int ObjectTypeId { get; set; }
		 
		 		 public int? ParentId { get; set; }
		 
		 
    }
}