using Abp.Application.Services.Dto;

namespace onetouch.AppTenantPlans.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}