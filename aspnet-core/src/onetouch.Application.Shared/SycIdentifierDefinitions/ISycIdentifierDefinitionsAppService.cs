using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SycIdentifierDefinitions.Dtos;
using onetouch.Dto;
using onetouch.SystemObjects.Dtos;

namespace onetouch.SycIdentifierDefinitions
{
    public interface ISycIdentifierDefinitionsAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycIdentifierDefinitionForViewDto>> GetAll(GetAllSycIdentifierDefinitionsInput input);

        Task<GetSycIdentifierDefinitionForViewDto> GetSycIdentifierDefinitionForView(long id);
        Task<GetSycIdentifierDefinitionForViewDto> GetSycIdentifierDefinitionByTypeForView(string code);
        Task<GetSycIdentifierDefinitionForEditOutput> GetSycIdentifierDefinitionForEdit(EntityDto<long> input);
        Task<string> GetNextEntityCode(string code);
        Task CreateOrEdit(CreateOrEditSycIdentifierDefinitionDto input);

        Task Delete(EntityDto<long> input);
        Task<PagedResultDto<SycEntityObjectTypeSycIdentifierDefinitionLookupTableDto>> GetAllSycIdentifierDefinitionForLookupTable(onetouch.SycIdentifierDefinitions.Dtos.GetAllForLookupTableInput input);

        Task<FileDto> GetSycIdentifierDefinitionsToExcel(GetAllSycIdentifierDefinitionsForExcelInput input);

    }
}