using Abp.Application.Services.Dto;

namespace onetouch.AppPosts.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}