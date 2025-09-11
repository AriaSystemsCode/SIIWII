using System.Threading.Tasks;
using Abp.Application.Services;
using onetouch.Install.Dto;

namespace onetouch.Install
{
    public interface IInstallAppService : IApplicationService
    {
        Task Setup(InstallDto input);

        AppSettingsJsonDto GetAppSettingsJson();

        CheckDatabaseOutput CheckDatabase();
    }
}