using Abp.Application.Services.Dto;

namespace onetouch.AppItemSelectors.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}