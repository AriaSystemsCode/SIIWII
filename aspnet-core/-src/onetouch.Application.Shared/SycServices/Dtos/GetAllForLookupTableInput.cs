using Abp.Application.Services.Dto;

namespace onetouch.SycServices.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}