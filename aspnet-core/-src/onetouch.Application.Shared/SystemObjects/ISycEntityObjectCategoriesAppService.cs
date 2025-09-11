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
    public interface ISycEntityObjectCategoriesAppService : IApplicationService 
    {
		Task<PagedResultDto<TreeviewItem>> GetAllWithChildsForContactAsTreeViewWithPaging(GetAllSycEntityObjectCategoriesInput tmpInput);
		Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllWithChildsForContactWithPaging(GetAllSycEntityObjectCategoriesInput tmpInput);

		Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllDepartmentsWithChildsForProduct();
		Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAllChildsWithPaging(GetAllSycEntityObjectCategoriesInput input);

		Task<PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>>> GetAll(GetAllSycEntityObjectCategoriesInput input);

        Task<GetSycEntityObjectCategoryForViewDto> GetSycEntityObjectCategoryForView(int id);

		Task<GetSycEntityObjectCategoryForEditOutput> GetSycEntityObjectCategoryForEdit(EntityDto input);

		Task CreateOrEdit(CreateOrEditSycEntityObjectCategoryDto input);

		Task Delete(EntityDto input);

		Task<FileDto> GetSycEntityObjectCategoriesToExcel(GetAllSycEntityObjectCategoriesForExcelInput input);

		
		Task<List<SycEntityObjectCategorySydObjectLookupTableDto>> GetAllSydObjectForTableDropdown();
		
		Task<List<SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto>> GetAllSycEntityObjectCategoryForTableDropdown();
		
    }
}