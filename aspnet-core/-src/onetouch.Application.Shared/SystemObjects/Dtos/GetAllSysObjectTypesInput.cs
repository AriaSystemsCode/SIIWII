using Abp.Application.Services.Dto;
using System;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSysObjectTypesInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }


		 public string SysObjectTypeNameFilter { get; set; }

		 
    }
}