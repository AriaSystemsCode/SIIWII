using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppMarketplaceContact.Dtos;
using onetouch.Dto;

namespace onetouch.AppMarketplaceContact
{
    public interface IAppMarketplaceAppContactsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppMarketplaceAppContactForViewDto>> GetAll(GetAllAppMarketplaceAppContactsInput input);

        Task<GetAppMarketplaceAppContactForEditOutput> GetAppMarketplaceAppContactForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAppMarketplaceAppContactDto input);

        Task Delete(EntityDto<long> input);

    }
}