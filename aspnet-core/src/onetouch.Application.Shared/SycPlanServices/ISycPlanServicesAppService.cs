using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SycPlanServices.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Collections.Generic;

namespace onetouch.SycPlanServices
{
    public interface ISycPlanServicesAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycPlanServiceForViewDto>> GetAll(GetAllSycPlanServicesInput input);

        Task<GetSycPlanServiceForViewDto> GetSycPlanServiceForView(int id);

        Task<GetSycPlanServiceForEditOutput> GetSycPlanServiceForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditSycPlanServiceDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetSycPlanServicesToExcel(GetAllSycPlanServicesForExcelInput input);

        Task<List<SycPlanServiceSycApplicationLookupTableDto>> GetAllSycApplicationForTableDropdown();

        Task<List<SycPlanServiceSycPlanLookupTableDto>> GetAllSycPlanForTableDropdown();

        Task<List<SycPlanServiceSycServiceLookupTableDto>> GetAllSycServiceForTableDropdown();

    }
}