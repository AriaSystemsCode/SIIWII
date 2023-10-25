using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Maintainances.Dtos;
using onetouch.Dto;

namespace onetouch.Maintainances
{
    public interface IMaintainancesAppService : IApplicationService
    {
        Task<PagedResultDto<GetMaintainanceForViewDto>> GetAll(GetAllMaintainancesInput input);

        Task<GetMaintainanceForViewDto> GetMaintainanceForView(long id);

        Task<GetMaintainanceForEditOutput> GetMaintainanceForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditMaintainanceDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetMaintainancesToExcel(GetAllMaintainancesForExcelInput input);
        Task<GetMaintainanceForViewDto> GetOpenBuild();

        Task UpdateOpenBuildWithUserId(long userId);

    }
}