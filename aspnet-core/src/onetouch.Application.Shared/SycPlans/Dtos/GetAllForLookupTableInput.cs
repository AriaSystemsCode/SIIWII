using Abp.Application.Services.Dto;

namespace onetouch.SycPlans.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}