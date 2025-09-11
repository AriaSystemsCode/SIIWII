using System.Collections.Generic;
using onetouch.SycPlans.Dtos;
using onetouch.Dto;

namespace onetouch.SycPlans.Exporting
{
    public interface ISycPlansExcelExporter
    {
        FileDto ExportToFile(List<GetSycPlanForViewDto> sycPlans);
    }
}