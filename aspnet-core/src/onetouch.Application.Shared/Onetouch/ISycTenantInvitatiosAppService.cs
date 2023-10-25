using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Onetouch.Dtos;
using onetouch.Dto;

namespace onetouch.Onetouch
{
    public interface ISycTenantInvitatiosAppService : IApplicationService
    {
        Task<PagedResultDto<GetSycTenantInvitatiosForViewDto>> GetAll(GetAllSycTenantInvitatiosInput input);

        Task<GetSycTenantInvitatiosForViewDto> GetSycTenantInvitatiosForView(long id);

        Task<GetSycTenantInvitatiosForEditOutput> GetSycTenantInvitatiosForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditSycTenantInvitatiosDto input);

        Task Delete(EntityDto<long> input);

    }
}