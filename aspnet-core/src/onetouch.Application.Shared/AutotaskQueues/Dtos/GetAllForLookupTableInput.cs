using Abp.Application.Services.Dto;

namespace onetouch.AutotaskQueues.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}