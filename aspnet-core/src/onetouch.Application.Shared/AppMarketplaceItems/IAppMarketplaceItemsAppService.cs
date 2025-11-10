using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppItems.Dtos;
using onetouch.AppMarketplaceItems.Dtos;
using onetouch.Sessions.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceItems
{
    public interface IAppMarketplaceItemsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppMarketItemForViewDto>> GetAll(GetAllAppMarketItemsInput input);
        Task<bool> CheckCurrencyExchangeRate(CurrencyInfoDto inpurCurrencyCode);
        //I49[Start]
        Task<GetAppMarketplaceItemDetailForViewDto> GetMarketplaceAppItemForView(GetAppMarketplaceItemWithPagedAttributesForViewInput input);
        Task<GetAppMarketItemForViewDto> GetAppMarketplaceViewData(string ssin, string? currencyCode);
        Task<PagedResultDto<GetAppMarketItemForViewDto>> GetAppItemRelatedItems(GetAllAppMarketItemsInput input);
        //I49[End]
    }
}
