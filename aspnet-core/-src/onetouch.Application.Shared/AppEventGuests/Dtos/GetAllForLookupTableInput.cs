using Abp.Application.Services.Dto;

namespace onetouch.AppEventGuests.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}