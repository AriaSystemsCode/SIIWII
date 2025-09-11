using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSycEntityObjectClassificationsInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }

		public string CodeFilter { get; set; }

		public string NameFilter { get; set; }

		 public string SydObjectNameFilter { get; set; }

		public string SycEntityObjectClassificationNameFilter { get; set; }

		public long ObjectId { get; set; }

		public long ParentId { get; set; }
		public List<long> ExcludeIds { get; set; }
		public long EntityId { get; set; }


	}
}