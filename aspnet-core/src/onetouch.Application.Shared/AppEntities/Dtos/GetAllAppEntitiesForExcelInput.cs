using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppEntities.Dtos
{
    public class GetAllAppEntitiesForExcelInput
    {
		public string Filter { get; set; }

		public string NameFilter { get; set; }

		public string CodeFilter { get; set; }

		public string DescriptionFilter { get; set; }

		public string ExtraDataFilter { get; set; }


		 public string SycEntityObjectTypeNameFilter { get; set; }

		 		 public string SycEntityObjectStatusNameFilter { get; set; }

		 		 public string SydObjectNameFilter { get; set; }

		 
    }
}