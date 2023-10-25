using System.Collections.Generic;
using onetouch.SycApplications.Dtos;
using onetouch.Dto;

namespace onetouch.SycApplications.Exporting
{
    public interface ISycApplicationsExcelExporter
    {
        FileDto ExportToFile(List<GetSycApplicationForViewDto> sycApplications);
    }
}