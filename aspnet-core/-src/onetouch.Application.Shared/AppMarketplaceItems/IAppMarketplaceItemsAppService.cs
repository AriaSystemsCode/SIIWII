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
    }
}
