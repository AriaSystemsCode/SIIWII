using System.Collections.Generic;
using onetouch.SycPlanServices.Dtos;
using onetouch.Dto;

namespace onetouch.SycPlanServices.Exporting
{
    public interface ISycPlanServicesExcelExporter
    {
        FileDto ExportToFile(List<GetSycPlanServiceForViewDto> sycPlanServices);
    }
}