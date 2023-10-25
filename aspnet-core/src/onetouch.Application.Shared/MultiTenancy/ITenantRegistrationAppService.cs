using System.Threading.Tasks;
using Abp.Application.Services;
using onetouch.Editions.Dto;
using onetouch.MultiTenancy.Dto;

namespace onetouch.MultiTenancy
{
    public interface ITenantRegistrationAppService: IApplicationService
    {
        Task<RegisterTenantOutput> RegisterTenant(RegisterTenantInput input);

        Task<EditionsSelectOutput> GetEditionsForSelect();

        Task<EditionSelectDto> GetEdition(int editionId);
    }
}