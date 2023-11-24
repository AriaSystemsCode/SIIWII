using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppEvents.Dtos;
using onetouch.Dto;

namespace onetouch.AppEvents
{
    public interface IAppEventsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppEventForViewDto>> GetAll(GetAllAppEventsInput input);

        Task<GetAppEventForEditDto> GetAppEventForEdit(long id);
        Task<GetAppEventForViewDto> GetAppEventForView(long id, long entityId);
        Task<long> CreateOrEdit(CreateOrEditAppEventDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppEventsToExcel(GetAllAppEventsForExcelInput input);

       // Task<PagedResultDto<AppUpComingEventAppEntityLookupTableDto>> GetAllAppEntityForLookupTable(GetAllForLookupTableInput input);

    }
}