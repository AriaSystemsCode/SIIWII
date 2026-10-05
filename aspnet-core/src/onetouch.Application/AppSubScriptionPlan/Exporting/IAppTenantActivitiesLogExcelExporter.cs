using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public interface IAppTenantActivitiesLogExcelExporter
    {
        FileDto ExportToFile(List<GetAppTenantActivityLogForViewDto> appTenantActivitiesLog);
        Task<FileDto> ExportAppTenantActivitiesLogToExcel(
      List<GetAppTenantActivityLogForViewDto> appTenantActivitiesLog); 
    }
}