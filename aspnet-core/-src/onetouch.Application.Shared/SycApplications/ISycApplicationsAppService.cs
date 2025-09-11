using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SycApplications.Dtos;
using onetouch.Dto;

namespace onetouch.SycApplications
{
    public interface ISycApplicationsAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycApplicationForViewDto>> GetAll(GetAllSycApplicationsInput input);

        Task<GetSycApplicationForViewDto> GetSycApplicationForView(int id);

        Task<GetSycApplicationForEditOutput> GetSycApplicationForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditSycApplicationDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetSycApplicationsToExcel(GetAllSycApplicationsForExcelInput input);

    }
}