using System.Collections.Generic;
using onetouch.SycServices.Dtos;
using onetouch.Dto;

namespace onetouch.SycServices.Exporting
{
    public interface ISycServicesExcelExporter
    {
        FileDto ExportToFile(List<GetSycServiceForViewDto> sycServices);
    }
}