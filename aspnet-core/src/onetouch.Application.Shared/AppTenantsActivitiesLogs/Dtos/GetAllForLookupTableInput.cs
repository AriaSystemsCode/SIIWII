using Abp.Application.Services.Dto;

namespace onetouch.AppTenantsActivitiesLogs.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}