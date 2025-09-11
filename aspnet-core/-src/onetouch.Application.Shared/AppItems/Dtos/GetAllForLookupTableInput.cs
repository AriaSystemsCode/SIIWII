using Abp.Application.Services.Dto;

namespace onetouch.AppItems.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}