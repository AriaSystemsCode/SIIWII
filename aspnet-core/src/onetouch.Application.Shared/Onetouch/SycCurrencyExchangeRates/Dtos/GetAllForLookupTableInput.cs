using Abp.Application.Services.Dto;

namespace onetouch.SycCurrencyExchangeRates.Dtos
{
    public class GetAllForLookupTableInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}