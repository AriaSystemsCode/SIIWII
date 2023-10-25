using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppEntities.Dtos;
using onetouch.AppItemsLists.Dtos;
using onetouch.Dto;

namespace onetouch.AppItemsLists
{
    public interface IAppItemsListsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppItemsListForViewDto>> GetAll(GetAllAppItemsListsInput input);

        //Task<GetAppItemsListForViewDto> GetAppItemsListForView(long id);
        Task<List<AppItemsListItemVariationDto>> GetItemsListVariations(long ItemId, long ItemsListId);

        Task<GetAppItemsListForEditOutput> GetAppItemsListForEdit(EntityDto<long> input);

        Task<GetAppItemsListForEditOutput> CreateOrEdit(CreateOrEditAppItemsListDto input);

        Task SaveState(CreateOrEditAppItemsListDto input);

        Task Cancel(long id);

        Task ChangeStatus(long itemListId, string status);

        Task SaveSelection(long itemListId, Guid key);

        Task MarItemsAs(long itemListId, long itemId, StateEnum state);
        
        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppItemsListsToExcel(GetAllAppItemsListsForExcelInput input);

        Task<GetStatusResult> GetStatus(long itemListId);
        Task<List<CreateOrEditAppItemsListItemDto>> GetSelectedVariations(long ItemListId, long ItemId);
        //Task<List<LookupLabelDto>> SearchForDropDown(string search);
    }
    public class GetStatusResult
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public long? Id { get; set; }
    }
}