using Abp.Application.Services.Dto;

namespace onetouch.AppItemsLists.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}