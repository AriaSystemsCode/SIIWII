using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using onetouch.AppEntities.Dtos;


namespace onetouch.SystemObjects
{
    public interface ISycAttachmentCategoriesAppService : IApplicationService 
    {
        Task<PagedResultDto<GetSycAttachmentCategoryForViewDto>> GetAll(GetAllSycAttachmentCategoriesInput input);

		Task<long> GetSycAttachmentCategoryForViewByCode(string code);

		Task<GetSycAttachmentCategoryForViewDto> GetSycAttachmentCategoryForView(long id);

		Task<GetSycAttachmentCategoryForEditOutput> GetSycAttachmentCategoryForEdit(EntityDto<long> input);

		Task CreateOrEdit(CreateOrEditSycAttachmentCategoryDto input);

		Task Delete(EntityDto<long> input);

		Task<FileDto> GetSycAttachmentCategoriesToExcel(GetAllSycAttachmentCategoriesForExcelInput input);
		
		Task<List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto>> GetAllSycAttachmentCategoryForTableDropdown();

		List<SelectItemDto> GetAllSycAttachmentCategoryTypesForTableDropdown();

		Task<List<SycAttachmentCategoryDto>> GetSycAttachmentCategoriesByCodes(string[] codes);
	}
}