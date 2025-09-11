using Abp.Application.Services.Dto;

namespace onetouch.AppEntities.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
		public string Filter { get; set; }
    }
}