using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan
{
    public interface IAppTenantActivitiesLogAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppTenantActivityLogForViewDto>> GetAll(GetAllAppTenantActivitiesLogInput input);

        Task<GetAppTenantActivityLogForViewDto> GetAppTenantActivityLogForView(long id);

        Task<GetAppTenantActivityLogForEditOutput> GetAppTenantActivityLogForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAppTenantActivityLogDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppTenantActivitiesLogToExcel(GetAllAppTenantActivitiesLogForExcelInput input);
        //Task<bool> AddUsageActivityLog(string featureCode, string reference, int qty);
        //Task<bool> AddUsageActivityLog(string featureCode, string? relatedEntityCode, long? relatedEntityId, long? relatedEntityOvbjectTypeId, string reference, int qty);
        Task<bool> AddUsageActivityLog(string featureCode, string? relatedEntityCode, long? relatedEntityId, long? relatedEntityOvbjectTypeId, string? relatedEntityObjectTypeCode, string reference, int qty);
        Task<bool> AddPlanRenewalBalances(DateTime startdate);
        Task<bool> IsFeatureAvailable(string featureCode);
    }
}