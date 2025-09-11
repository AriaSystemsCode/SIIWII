using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using onetouch.Dto;

namespace onetouch.SycSegmentIdentifierDefinitions
{
    public interface ISycSegmentIdentifierDefinitionsAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycSegmentIdentifierDefinitionForViewDto>> GetAll(GetAllSycSegmentIdentifierDefinitionsInput input);

        Task<GetSycSegmentIdentifierDefinitionForViewDto> GetSycSegmentIdentifierDefinitionForView(long id);

        Task<GetSycSegmentIdentifierDefinitionForEditOutput> GetSycSegmentIdentifierDefinitionForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditSycSegmentIdentifierDefinitionDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetSycSegmentIdentifierDefinitionsToExcel(GetAllSycSegmentIdentifierDefinitionsForExcelInput input);

        Task<PagedResultDto<SycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableDto>> GetAllSycIdentifierDefinitionForLookupTable(GetAllForLookupTableInput input);

    }
}