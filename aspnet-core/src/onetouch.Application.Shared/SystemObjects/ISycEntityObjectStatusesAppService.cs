using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using System.Collections.Generic;


namespace onetouch.SystemObjects
{
    public interface ISycEntityObjectStatusesAppService : IApplicationService 
    {
        Task<PagedResultDto<GetSycEntityObjectStatusForViewDto>> GetAll(GetAllSycEntityObjectStatusesInput input);

        Task<GetSycEntityObjectStatusForViewDto> GetSycEntityObjectStatusForView(int id);

		Task<GetSycEntityObjectStatusForEditOutput> GetSycEntityObjectStatusForEdit(EntityDto input);

		Task CreateOrEdit(CreateOrEditSycEntityObjectStatusDto input);

		Task Delete(EntityDto input);

		Task<FileDto> GetSycEntityObjectStatusesToExcel(GetAllSycEntityObjectStatusesForExcelInput input);

		
		Task<List<SycEntityObjectStatusSydObjectLookupTableDto>> GetAllSydObjectForTableDropdown();
		
    }
}