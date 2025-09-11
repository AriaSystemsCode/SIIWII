using System.Collections.Generic;
using onetouch.AppTenantPlans.Dtos;
using onetouch.Dto;

namespace onetouch.AppTenantPlans.Exporting
{
    public interface IAppTenantPlansExcelExporter
    {
        FileDto ExportToFile(List<GetAppTenantPlanForViewDto> appTenantPlans);
    }
}