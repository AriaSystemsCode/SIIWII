using Abp.Application.Services.Dto;
using System;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSydObjectsForExcelInput
    {
		public string Filter { get; set; }


		 public string SysObjectTypeNameFilter { get; set; }

		 		 public string SydObjectNameFilter { get; set; }

		 
    }
}