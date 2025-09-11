using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SycPlans.Dtos;
using onetouch.Dto;
using System.Collections.Generic;

namespace onetouch.SycPlans
{
    public interface ISycPlansAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycPlanForViewDto>> GetAll(GetAllSycPlansInput input);

        Task<GetSycPlanForViewDto> GetSycPlanForView(int id);

        Task<GetSycPlanForEditOutput> GetSycPlanForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditSycPlanDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetSycPlansToExcel(GetAllSycPlansForExcelInput input);

        Task<List<SycPlanSycApplicationLookupTableDto>> GetAllSycApplicationForTableDropdown();

    }
}