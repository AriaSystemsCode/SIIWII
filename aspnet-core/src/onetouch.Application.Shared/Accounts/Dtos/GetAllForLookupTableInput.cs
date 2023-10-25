using Abp.Application.Services.Dto;

namespace onetouch.Accounts.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }
    }
}