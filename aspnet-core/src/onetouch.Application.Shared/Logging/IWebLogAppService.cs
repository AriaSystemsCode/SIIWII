using Abp.Application.Services;
using onetouch.Dto;
using onetouch.Logging.Dto;

namespace onetouch.Logging
{
    public interface IWebLogAppService : IApplicationService
    {
        GetLatestWebLogsOutput GetLatestWebLogs();

        FileDto DownloadWebLogs();
    }
}
