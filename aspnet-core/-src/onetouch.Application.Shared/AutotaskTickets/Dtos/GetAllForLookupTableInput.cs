using Abp.Application.Services.Dto;

namespace onetouch.AutoTaskTickets.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}