using Abp.Application.Services.Dto;
using System;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllSycAttachmentTypesInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }

		public string NameFilter { get; set; }

		public int TypeFilter { get; set; }

		public string ExtensionFilter { get; set; }



    }
}