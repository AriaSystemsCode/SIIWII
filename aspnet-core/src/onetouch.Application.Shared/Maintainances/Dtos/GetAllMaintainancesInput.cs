using Abp.Application.Services.Dto;
using System;

namespace onetouch.Maintainances.Dtos
{
    public class GetAllMaintainancesInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public string NameFilter { get; set; }

        public string DescriptionFilter { get; set; }

        public DateTime? MaxFromFilter { get; set; }
        public DateTime? MinFromFilter { get; set; }

        public DateTime? MaxToFilter { get; set; }
        public DateTime? MinToFilter { get; set; }

        public int? PublishedFilter { get; set; }

        public string DismissIdsFilter { get; set; }

    }
}