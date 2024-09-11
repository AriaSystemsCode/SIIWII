using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan
{
    public interface IAppTenantSubscriptionPlansAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppTenantSubscriptionPlanForViewDto>> GetAll(GetAllAppTenantSubscriptionPlansInput input);

        Task<GetAppTenantSubscriptionPlanForViewDto> GetAppTenantSubscriptionPlanForView(long id);

        Task<GetAppTenantSubscriptionPlanForEditOutput> GetAppTenantSubscriptionPlanForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAppTenantSubscriptionPlanDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppTenantSubscriptionPlansToExcel(GetAllAppTenantSubscriptionPlansForExcelInput input);
        Task<long?> GetTenantSubscriptionPlanId(long tenantId);
    }
}