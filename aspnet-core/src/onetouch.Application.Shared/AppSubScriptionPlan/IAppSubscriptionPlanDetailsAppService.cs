using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan
{
    public interface IAppSubscriptionPlanDetailsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppSubscriptionPlanDetailForViewDto>> GetAll(GetAllAppSubscriptionPlanDetailsInput input);

        Task<GetAppSubscriptionPlanDetailForViewDto> GetAppSubscriptionPlanDetailForView(long id);

        Task<GetAppSubscriptionPlanDetailForEditOutput> GetAppSubscriptionPlanDetailForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAppSubscriptionPlanDetailDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppSubscriptionPlanDetailsToExcel(GetAllAppSubscriptionPlanDetailsForExcelInput input);

        Task<PagedResultDto<AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableDto>> GetAllAppSubscriptionPlanHeaderForLookupTable(GetAllForLookupTableInput input);

    }
}