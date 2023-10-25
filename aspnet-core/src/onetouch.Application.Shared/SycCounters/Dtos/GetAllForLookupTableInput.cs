using Abp.Application.Services.Dto;

namespace onetouch.SycCounters.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}