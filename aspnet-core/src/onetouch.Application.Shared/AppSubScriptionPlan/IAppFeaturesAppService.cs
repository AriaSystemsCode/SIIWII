using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan
{
    public interface IAppFeaturesAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppFeatureForViewDto>> GetAll(GetAllAppFeaturesInput input);

        Task<GetAppFeatureForViewDto> GetAppFeatureForView(int id);

        Task<GetAppFeatureForEditOutput> GetAppFeatureForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditAppFeatureDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetAppFeaturesToExcel(GetAllAppFeaturesForExcelInput input);

    }
}