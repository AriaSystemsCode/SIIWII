using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppTenantPlans.Dtos
{
    public class GetAllAppTenantPlansInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public DateTime? MaxAddDateFilter { get; set; }
        public DateTime? MinAddDateFilter { get; set; }

        public DateTime? MaxEndDateFilter { get; set; }
        public DateTime? MinEndDateFilter { get; set; }

        public DateTime? MaxStartDateFilter { get; set; }
        public DateTime? MinStartDateFilter { get; set; }

        public string SycPlanNameFilter { get; set; }

    }
}