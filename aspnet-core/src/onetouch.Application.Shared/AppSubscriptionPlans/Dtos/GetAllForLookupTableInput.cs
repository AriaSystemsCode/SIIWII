using Abp.Application.Services.Dto;

namespace onetouch.AppSubscriptionPlans.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}