using Abp.Application.Services.Dto;
using System;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSycEntityObjectCategoriesForExcelInput
    {
		public string Filter { get; set; }

		public string CodeFilter { get; set; }

		public string NameFilter { get; set; }


		 public string SydObjectNameFilter { get; set; }

		 		 public string SycEntityObjectCategoryNameFilter { get; set; }

		 
    }
}