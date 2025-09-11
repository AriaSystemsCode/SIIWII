using Abp.Application.Services.Dto;

namespace onetouch.SycSegmentIdentifierDefinitions.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}