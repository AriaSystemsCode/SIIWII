using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppTenantPlans.Dtos;
using onetouch.Dto;
using System.Collections.Generic;

namespace onetouch.AppTenantPlans
{
    public interface IAppTenantPlansAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppTenantPlanForViewDto>> GetAll(GetAllAppTenantPlansInput input);

        Task<GetAppTenantPlanForViewDto> GetAppTenantPlanForView(int id);

        Task<GetAppTenantPlanForEditOutput> GetAppTenantPlanForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditAppTenantPlanDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetAppTenantPlansToExcel(GetAllAppTenantPlansForExcelInput input);

        Task<List<AppTenantPlanSycPlanLookupTableDto>> GetAllSycPlanForTableDropdown();

    }
}