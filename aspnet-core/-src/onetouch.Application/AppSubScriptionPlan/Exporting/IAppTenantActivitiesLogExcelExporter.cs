using System.Collections.Generic;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public interface IAppTenantActivitiesLogExcelExporter
    {
        FileDto ExportToFile(List<GetAppTenantActivityLogForViewDto> appTenantActivitiesLog);
    }
}