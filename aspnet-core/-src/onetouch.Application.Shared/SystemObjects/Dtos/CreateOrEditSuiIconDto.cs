
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSuiIconDto : EntityDto<int?>
    {

		[Required]
		public string Name { get; set; }
		
		

    }
}