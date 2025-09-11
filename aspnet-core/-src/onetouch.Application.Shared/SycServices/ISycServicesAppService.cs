using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SycServices.Dtos;
using onetouch.Dto;

namespace onetouch.SycServices
{
    public interface ISycServicesAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycServiceForViewDto>> GetAll(GetAllSycServicesInput input);

        Task<GetSycServiceForViewDto> GetSycServiceForView(int id);

        Task<GetSycServiceForEditOutput> GetSycServiceForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditSycServiceDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetSycServicesToExcel(GetAllSycServicesForExcelInput input);

    }
}