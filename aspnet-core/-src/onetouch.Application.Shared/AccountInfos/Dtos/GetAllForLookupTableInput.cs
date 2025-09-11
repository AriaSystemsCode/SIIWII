using Abp.Application.Services.Dto;

namespace onetouch.AccountInfos.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }
    }
}