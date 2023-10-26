using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using System.Collections.Generic;
using onetouch.Common;
using onetouch.AppEntities.Dtos;

namespace onetouch.SystemObjects
{
    public interface ISycEntityObjectTypesAppService : IApplicationService 
    {
		Task<PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAll(GetAllSycEntityObjectTypesInput input);
		Task<PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAllWithChildsForProduct();

		Task<PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAllWithChildsForProductWithPaging(GetAllSycEntityObjectTypesInput tmpInput);
		Task<PagedResultDto<TreeNode<GetSycEntityObjectTypeForViewDto>>> GetAllChildsWithPaging(GetAllChildsWithPagingInput input);
		Task<GetSycEntityObjectTypeForViewDto> GetSycEntityObjectTypeForView(int id);

		Task<GetSycEntityObjectTypeForEditOutput> GetSycEntityObjectTypeForEdit(EntityDto input);

		Task CreateOrEdit(CreateOrEditSycEntityObjectTypeDto input);

		Task Delete(EntityDto input);

		Task<FileDto> GetSycEntityObjectTypesToExcel(GetAllSycEntityObjectTypesForExcelInput input);

		
		Task<List<SycEntityObjectTypeSydObjectLookupTableDto>> GetAllSydObjectForTableDropdown();
		
		Task<List<SycEntityObjectTypeSycEntityObjectTypeLookupTableDto>> GetAllSycEntityObjectTypeForTableDropdown();
		Task<List<SycEntityObjectTypeSycEntityObjectTypeLookupTableDto>> GetSycEntityObjectTypeForObjectAsTableDropdown(string objectCode);

        Task<PagedResultDto<SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto>> GetAllSycIdentifierDefinitionForLookupTable(onetouch.SystemObjects.Dtos.GetAllForLookupTableInput input);
		Task<SelectItemDto[]> GetAllParentsIds();

	}
}