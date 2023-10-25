using Abp.Application.Services.Dto;

namespace onetouch.AppAdvertisements.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}