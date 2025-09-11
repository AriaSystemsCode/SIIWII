using System.Collections.Generic;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public interface IAppSubscriptionPlanHeadersExcelExporter
    {
        FileDto ExportToFile(List<GetAppSubscriptionPlanHeaderForViewDto> appSubscriptionPlanHeaders);
    }
}