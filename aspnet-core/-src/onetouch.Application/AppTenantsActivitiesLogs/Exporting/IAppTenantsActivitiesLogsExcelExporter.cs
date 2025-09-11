using System.Collections.Generic;
using onetouch.AppTenantsActivitiesLogs.Dtos;
using onetouch.Dto;

namespace onetouch.AppTenantsActivitiesLogs.Exporting
{
    public interface IAppTenantsActivitiesLogsExcelExporter
    {
        FileDto ExportToFile(List<GetAppTenantsActivitiesLogForViewDto> appTenantsActivitiesLogs);
    }
}