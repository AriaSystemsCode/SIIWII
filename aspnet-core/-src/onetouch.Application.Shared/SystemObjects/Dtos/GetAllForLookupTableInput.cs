using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}