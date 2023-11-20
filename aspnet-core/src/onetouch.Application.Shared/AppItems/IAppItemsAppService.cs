using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppEntities.Dtos;
using onetouch.AppItems.Dtos;
using onetouch.Dto;

namespace onetouch.AppItems
{
    public interface IAppItemsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppItemForViewDto>> GetAll(GetAllAppItemsInput input);
        Task<PagedResultDto<ExtraDataSelectedValues>> GetFirstAttributeValues(ExtraDataFirstAttributeValuesInput input);

        Task<PagedResultDto<LookupLabelDto>> GetSecondAttributeValues(ExtraDataSecondAttributeValuesInput input);
        Task<List<AppEntityAttachmentDto>> GetFirstAttributeAttachments(ExtraDataFirstAttributeAttachmentsInput input);

        Task<GetAppItemDetailForViewDto> GetAppItemForView(GetAppItemWithPagedAttributesForViewInput input);
        Task<PagedResultDto<AppEntityCategoryDto>> GetAppItemCategoriesWithPaging(GetAppItemAttributesWithPagingInput input);
        Task<PagedResultDto<AppEntityClassificationDto>> GetAppItemClassificationsWithPaging(GetAppItemAttributesWithPagingInput input);
        Task<PagedResultDto<AppEntityCategoryDto>> GetAppItemDepartmentsWithPaging(GetAppItemAttributesWithPagingInput input);
        Task<PagedResultDto<string>> GetAppItemCategoriesNamesWithPaging(GetAppItemAttributesWithPagingInput input);
        Task<PagedResultDto<string>> GetAppItemClassificationsNamesWithPaging(GetAppItemAttributesWithPagingInput input);
        Task<PagedResultDto<string>> GetAppItemDepartmentsNamesWithPaging(GetAppItemAttributesWithPagingInput input);
        Task<PagedResultDto<AppEntityAttachmentDto>> GetAppItemAttachmentsWithPaging(GetAppItemExtraAttributesInput input);
        Task<PagedResultDto<ExtraDataAttrDto>> GetAppItemExtraDataWithPaging(GetAppItemExtraAttributesInput input);

        Task<GetAppItemForEditOutput> GetAppItemForEdit(GetAppItemWithPagedAttributesForEditInput input);

        Task<long> CreateOrEdit(CreateOrEditAppItemDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppItemsToExcel(GetAllAppItemsForExcelInput input);
        Task ShareProduct(SharingItemOptions input);


    }
}