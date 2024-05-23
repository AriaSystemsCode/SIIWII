using Abp.Application.Services.Dto;

namespace onetouch.MarketplaceAccounts.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }
    }
}