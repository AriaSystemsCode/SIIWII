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
    public interface ISycEntityObjectClassificationsAppService : IApplicationService 
    {
		Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllChildsWithPaging(GetAllSycEntityObjectClassificationsInput input);
		Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForContactWithPaging(GetAllSycEntityObjectClassificationsInput input);
		Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForProductWithPaging(GetAllSycEntityObjectClassificationsInput input);
		Task<PagedResultDto<TreeviewItem>> GetAllWithChildsForContactAsTreeViewWithPaging(GetAllSycEntityObjectClassificationsInput tmpInput);

		Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAllWithChildsForContact();
		Task<PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>>> GetAll(GetAllSycEntityObjectClassificationsInput input);

        Task<GetSycEntityObjectClassificationForViewDto> GetSycEntityObjectClassificationForView(int id);

		Task<GetSycEntityObjectClassificationForEditOutput> GetSycEntityObjectClassificationForEdit(EntityDto input);

		Task CreateOrEdit(CreateOrEditSycEntityObjectClassificationDto input);

		Task Delete(EntityDto input);

		Task<FileDto> GetSycEntityObjectClassificationsToExcel(GetAllSycEntityObjectClassificationsForExcelInput input);

		
		Task<List<SycEntityObjectClassificationSydObjectLookupTableDto>> GetAllSydObjectForTableDropdown();
		
		Task<List<SycEntityObjectClassificationSycEntityObjectClassificationLookupTableDto>> GetAllSycEntityObjectClassificationForTableDropdown();
		
    }
}