using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;
using onetouch.SystemObjects.Dtos;

namespace onetouch.AppSubScriptionPlan
{
    public interface IAppSubscriptionPlanHeadersAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppSubscriptionPlanHeaderForViewDto>> GetAll(GetAllAppSubscriptionPlanHeadersInput input);

        Task<GetAppSubscriptionPlanHeaderForViewDto> GetAppSubscriptionPlanHeaderForView(long id);

        Task<GetAppSubscriptionPlanHeaderForEditOutput> GetAppSubscriptionPlanHeaderForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAppSubscriptionPlanHeaderDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppSubscriptionPlanHeadersToExcel(GetAllAppSubscriptionPlanHeadersForExcelInput input);
        Task<List<SycEntityObjectStatusLookupTableDto>> GetPlanStatusList();

    }
}