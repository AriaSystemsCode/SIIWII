using System.Collections.Generic;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public interface IAppSubscriptionPlanDetailsExcelExporter
    {
        FileDto ExportToFile(List<GetAppSubscriptionPlanDetailForViewDto> appSubscriptionPlanDetails);
    }
}