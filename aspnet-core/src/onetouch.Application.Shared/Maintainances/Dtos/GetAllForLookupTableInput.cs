using Abp.Application.Services.Dto;

namespace onetouch.Maintainances.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}