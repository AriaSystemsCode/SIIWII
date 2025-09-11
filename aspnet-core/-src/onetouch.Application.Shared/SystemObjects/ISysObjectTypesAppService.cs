using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using onetouch.Common;

namespace onetouch.SystemObjects
{
    public interface ISysObjectTypesAppService : IApplicationService 
    {
        Task<PagedResultDto<TreeNode<GetSysObjectTypeForViewDto>>> GetAll(GetAllSysObjectTypesInput input);

        Task<GetSysObjectTypeForViewDto> GetSysObjectTypeForView(int id);

		Task<GetSysObjectTypeForEditOutput> GetSysObjectTypeForEdit(EntityDto input);

		Task CreateOrEdit(CreateOrEditSysObjectTypeDto input);

		Task Delete(EntityDto input);

		Task<FileDto> GetSysObjectTypesToExcel(GetAllSysObjectTypesForExcelInput input);

		
		Task<List<SysObjectTypeSysObjectTypeLookupTableDto>> GetAllSysObjectTypeForTableDropdown();
		
    }
}