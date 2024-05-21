using Abp.Application.Services.Dto;

namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}