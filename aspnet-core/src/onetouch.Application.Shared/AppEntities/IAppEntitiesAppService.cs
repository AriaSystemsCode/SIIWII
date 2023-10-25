using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppEntities.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using onetouch.AppContacts.Dtos;
using onetouch.AppItems.Dtos;
using onetouch.Sessions.Dto;

namespace onetouch.AppEntities
{
    public interface IAppEntitiesAppService : IApplicationService 
    {
		Task<PagedResultDto<LookupLabelDto>> GetAllCurrencyForTableDropdownWithPaging(GetAllAppEntitiesInput input);
		Task<PagedResultDto<LookupLabelDto>> GetAllLanguageForTableDropdownWithPaging(GetAllAppEntitiesInput input);
		Task<PagedResultDto<LookupLabelDto>> GetAllCountryForTableDropdowWithPaging(GetAllAppEntitiesInput input);
		Task<PagedResultDto<LookupLabelDto>> GetAllAccountTypesForTableDropdownWithPaging(GetAllAppEntitiesInput input);
		Task<PagedResultDto<LookupLabelDto>> GetAllEntityTypeForTableDropdown(GetAllAppEntitiesInput input);
		Task<List<LookupLabelDto>> GetAllAccountTypeForTableDropdown();
		Task<PagedResultDto<LookupLabelWithAttachmentDto>> GetAllBackgroundWithPaging(GetAllAppEntitiesInput input);

        Task<List<LookupLabelDto>> GetLineSheetDetailPageSort();
        Task<List<LookupLabelDto>> GetLineSheetColorSort();

        Task<List<LookupLabelDto>> GetAllAddressTypeForTableDropdown();

		Task<List<LookupLabelDto>> GetAllPhoneTypeForTableDropdown();
		
		Task<List<LookupLabelDto>> GetAllCountryForTableDropdown();
		
		Task<List<LookupLabelDto>> GetAllLanguageForTableDropdown();

		Task<List<LookupLabelDto>> GetAllAccountTypesForTableDropdown();

        Task<List<CurrencyInfoDto>> GetAllCurrencyForTableDropdown();

        Task<List<LookupLabelDto>> GetAllTitlesForTableDropdown();
		
		Task<PagedResultDto<GetAppEntityForViewDto>> GetAll(GetAllAppEntitiesInput input);

        Task<GetAppEntityForViewDto> GetAppEntityForView(long id);
		Task<string> GetAppEntityState(long id);
		Task SetAppEntityState(long id, string jsonString);

		Task<GetAppEntityForEditOutput> GetAppEntityForEdit(EntityDto<long> input);

		Task CreateOrEdit(CreateOrEditAppEntityDto input);

		Task Delete(EntityDto<long> input);

		Task<FileDto> GetAppEntitiesToExcel(GetAllAppEntitiesForExcelInput input);

		
		Task<List<AppEntitySycEntityObjectTypeLookupTableDto>> GetAllSycEntityObjectTypeForTableDropdown();
		
		Task<List<AppEntitySycEntityObjectStatusLookupTableDto>> GetAllSycEntityObjectStatusForTableDropdown();
		
		Task<List<AppEntitySydObjectLookupTableDto>> GetAllSydObjectForTableDropdown();

		Task<long> SaveContact(AppContactDto input);

		Task<long> SaveEntity(AppEntityDto input);
		Task<PagedResultDto<AppEntityCategoryDto>> GetAppEntityCategoriesWithPaging(GetAppEntityAttributesInput input);
		Task<PagedResultDto<AppEntityCategoryDto>> GetAppEntityDepartmentsWithPaging(GetAppEntityAttributesInput input);
		Task<PagedResultDto<AppEntityClassificationDto>> GetAppEntityClassificationsWithPaging(GetAppEntityAttributesInput input);
		Task<PagedResultDto<string>> GetAppEntityCategoriesNamesWithPaging(GetAppEntityAttributesInput input);
		Task<PagedResultDto<string>> GetAppEntityClassificationsNamesWithPaging(GetAppEntityAttributesInput input);
		Task<PagedResultDto<string>> GetAppEntityDepartmentsNamesWithPaging(GetAppEntityAttributesInput input);

		Task<PagedResultDto<AppEntityAttachmentDto>> GetAppEntityAttachmentsWithPaging(GetAppEntityAttributesInput input);
		Task<PagedResultDto<AppEntityAttachmentDto>> GetAppEntitysAttachmentsWithPaging(GetAppEntitysAttributesInput input);
		Task<PagedResultDto<AppEntityExtraDataDto>> GetAppEntityExtraWithPaging(GetAppEntityAttributesWithAttributeIdsInput input);
		Task<PagedResultDto<long>> GetAppEntityAttrDistinctWithPaging(GetAppEntityAttributesWithAttributeIdsInput input);
		Task<PagedResultDto<AppEntityExtraDataDto>> GetAppEntityColorsWithPaging(GetAppEntitysColorsInput input);
		Task<List<TopPostDto>> GetTopPosts(int numberOfPosts, int numberOfDays);
        Task<List<UserInformationDto>> GetTopContributors(int numberOfContributors, int numberOfDays);
        Task<List<TopCompany>> GetTopCompanies(int numberOfCompanies, int numberOfDays);
		Task<bool> UpdateEntityCommentsCount(long entitlyId, bool RemoveComment);
		//MMT
		Task<List<LookupLabelDto>> GetAllEntitiesByTypeCode(string code);
		//MMT

	}
}