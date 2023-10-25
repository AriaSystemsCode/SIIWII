using System.Threading.Tasks;
using Abp.Application.Services;
using onetouch.Configuration.Tenants.Dto;

namespace onetouch.Configuration.Tenants
{
    public interface ITenantSettingsAppService : IApplicationService
    {
        Task<TenantSettingsEditDto> GetAllSettings();

        Task UpdateAllSettings(TenantSettingsEditDto input);

        Task ClearLogo();

        Task ClearCustomCss();
    }
}
