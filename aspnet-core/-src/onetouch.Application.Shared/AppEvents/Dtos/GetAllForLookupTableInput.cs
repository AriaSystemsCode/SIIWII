using Abp.Application.Services.Dto;

namespace onetouch.AppEvents.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}