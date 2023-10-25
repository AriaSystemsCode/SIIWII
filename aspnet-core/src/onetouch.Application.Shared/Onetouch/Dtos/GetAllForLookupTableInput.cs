using Abp.Application.Services.Dto;

namespace onetouch.Onetouch.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}