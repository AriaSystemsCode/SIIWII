using Abp.Application.Services.Dto;
using System;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSycEntityObjectClassificationsForExcelInput
    {
		public string Filter { get; set; }

		public string CodeFilter { get; set; }

		public string NameFilter { get; set; }

		 public string SydObjectNameFilter { get; set; }

		 		 public string SycEntityObjectClassificationNameFilter { get; set; }

		 
    }
}