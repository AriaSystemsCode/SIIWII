using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppItems.Dtos;
using onetouch.AppItemSelectors.Dtos;
using onetouch.Dto;

namespace onetouch.AppItemSelectors
{
    public interface IAppItemSelectorsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppItemSelectorForViewDto>> GetAll(GetAllAppItemSelectorsInput input);

        Task<GetAppItemSelectorForEditOutput> GetAppItemSelectorForEdit(EntityDto<long> input);

        Task<int> SelectAll(Guid key, GetAllAppItemsInput input);

        Task<int> Invert(Guid key, GetAllAppItemsInput input);
        

        Task<Int32> CreateOrEdit(CreateOrEditAppItemSelectorDto input);

        Task DeleteAllTempWithKey(CreateOrEditAppItemSelectorDto input);

        Task<Int32> Delete(CreateOrEditAppItemSelectorDto input);

    }
}