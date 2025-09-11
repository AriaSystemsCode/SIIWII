using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using System.Collections.Generic;
using onetouch.Common;

namespace onetouch.SystemObjects
{
    public interface ISydObjectsAppService : IApplicationService 
    {
		Task<PagedResultDto<TreeNode<GetSydObjectForViewDto>>> GetAll(GetAllSydObjectsInput input);

        Task<GetSydObjectForViewDto> GetSydObjectForView(int id);

		Task<GetSydObjectForEditOutput> GetSydObjectForEdit(EntityDto input);

		Task CreateOrEdit(CreateOrEditSydObjectDto input);

		Task Delete(EntityDto input);

		Task<FileDto> GetSydObjectsToExcel(GetAllSydObjectsForExcelInput input);

		
		Task<List<SydObjectSysObjectTypeLookupTableDto>> GetAllSysObjectTypeForTableDropdown();
		
		Task<List<SydObjectSydObjectLookupTableDto>> GetAllSydObjectForTableDropdown();
		Task<List<PageSettingDto>> GetAllSliderSettings(SliderEnum sliderType, string sliderCode);

	}
}