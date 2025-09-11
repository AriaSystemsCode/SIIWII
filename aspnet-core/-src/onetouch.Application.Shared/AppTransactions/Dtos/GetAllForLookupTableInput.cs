using Abp.Application.Services.Dto;

namespace onetouch.AppTransactions.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}