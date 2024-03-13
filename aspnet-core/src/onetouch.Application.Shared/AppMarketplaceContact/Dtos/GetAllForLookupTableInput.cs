using Abp.Application.Services.Dto;

namespace onetouch.AppMarketplaceContact.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}