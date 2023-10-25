using Abp.Application.Services.Dto;

namespace onetouch.SycIdentifierDefinitions.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}