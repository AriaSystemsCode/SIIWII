using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SycCounters.Dtos;
using onetouch.Dto;

namespace onetouch.SycCounters
{
    public interface ISycCountersAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycCounterForViewDto>> GetAll(GetAllSycCountersInput input);

        Task<GetSycCounterForViewDto> GetSycCounterForView(long id);

        Task<GetSycCounterForEditOutput> GetSycCounterForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditSycCounterDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetSycCountersToExcel(GetAllSycCountersForExcelInput input);

        Task<PagedResultDto<SycCounterSycSegmentIdentifierDefinitionLookupTableDto>> GetAllSycSegmentIdentifierDefinitionForLookupTable(GetAllForLookupTableInput input);

    }
}