using System.Threading.Tasks;
using Abp.Application.Services;
using onetouch.Configuration.Host.Dto;

namespace onetouch.Configuration.Host
{
    public interface IHostSettingsAppService : IApplicationService
    {
        Task<HostSettingsEditDto> GetAllSettings();

        Task UpdateAllSettings(HostSettingsEditDto input);

        Task SendTestEmail(SendTestEmailInput input);
    }
}
