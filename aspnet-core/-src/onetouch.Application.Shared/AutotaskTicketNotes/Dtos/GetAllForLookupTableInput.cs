using Abp.Application.Services.Dto;

namespace onetouch.AutoTaskTicketNotes.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}