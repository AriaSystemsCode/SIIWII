using Abp.Application.Services.Dto;

namespace onetouch.SycPlanServices.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}