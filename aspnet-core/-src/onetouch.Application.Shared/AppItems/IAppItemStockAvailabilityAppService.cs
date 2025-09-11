using Abp.Application.Services;
using onetouch.AppItems.Dtos;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppItems
{
    public interface IAppItemStockAvailabilityAppService: IApplicationService
    {
        Task<List<ImportItemReturnDto>> ImportItemStock(List<AppItemStockAvailabilityExcelDto> itemExcelDtoList);
    }
}
