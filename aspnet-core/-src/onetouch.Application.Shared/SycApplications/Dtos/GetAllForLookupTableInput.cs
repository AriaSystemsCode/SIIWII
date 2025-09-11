using Abp.Application.Services.Dto;

namespace onetouch.SycApplications.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}