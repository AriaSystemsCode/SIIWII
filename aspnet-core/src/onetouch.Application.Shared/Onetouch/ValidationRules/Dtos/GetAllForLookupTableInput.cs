using Abp.Application.Services.Dto;

namespace onetouch.Onetouch.ValidationRules.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}