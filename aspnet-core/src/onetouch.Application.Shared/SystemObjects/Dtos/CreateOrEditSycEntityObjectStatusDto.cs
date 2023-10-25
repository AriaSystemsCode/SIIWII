
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSycEntityObjectStatusDto : EntityDto<int?>
    {

		[StringLength(SycEntityObjectStatusConsts.MaxCodeLength, MinimumLength = SycEntityObjectStatusConsts.MinCodeLength)]
		public string Code { get; set; }
		
		
		[Required]
		[StringLength(SycEntityObjectStatusConsts.MaxNameLength, MinimumLength = SycEntityObjectStatusConsts.MinNameLength)]
		public string Name { get; set; }
		
		
		 public long ObjectId { get; set; }
		 
		 
    }
}