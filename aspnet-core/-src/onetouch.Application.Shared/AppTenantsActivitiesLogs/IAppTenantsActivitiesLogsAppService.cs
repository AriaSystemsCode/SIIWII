using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppTenantsActivitiesLogs.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Collections.Generic;

namespace onetouch.AppTenantsActivitiesLogs
{
    public interface IAppTenantsActivitiesLogsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppTenantsActivitiesLogForViewDto>> GetAll(GetAllAppTenantsActivitiesLogsInput input);

        Task<GetAppTenantsActivitiesLogForViewDto> GetAppTenantsActivitiesLogForView(int id);

        Task<GetAppTenantsActivitiesLogForEditOutput> GetAppTenantsActivitiesLogForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditAppTenantsActivitiesLogDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetAppTenantsActivitiesLogsToExcel(GetAllAppTenantsActivitiesLogsForExcelInput input);

        Task<List<AppTenantsActivitiesLogSycServiceLookupTableDto>> GetAllSycServiceForTableDropdown();

        Task<List<AppTenantsActivitiesLogSycApplicationLookupTableDto>> GetAllSycApplicationForTableDropdown();

        Task<List<AppTenantsActivitiesLogAppTransactionLookupTableDto>> GetAllAppTransactionForTableDropdown();

        Task<List<AppTenantsActivitiesLogSycPlanLookupTableDto>> GetAllSycPlanForTableDropdown();

    }
}