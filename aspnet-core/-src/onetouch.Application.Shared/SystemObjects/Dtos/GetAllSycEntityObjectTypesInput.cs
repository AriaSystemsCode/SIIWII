using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSycEntityObjectTypesInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }

		public string CodeFilter { get; set; }

		public string NameFilter { get; set; }

		public string ExtraDataFilter { get; set; }


		public string SydObjectNameFilter { get; set; }
		public long SydObjectIdFilter { get; set; }

		public string SycEntityObjectTypeNameFilter { get; set; }
        public bool? Hidden { get; set; }

        public long[] ParentIds { get; set; }

	}
}