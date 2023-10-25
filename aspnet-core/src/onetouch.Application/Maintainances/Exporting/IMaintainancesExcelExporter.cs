using System.Collections.Generic;
using onetouch.Maintainances.Dtos;
using onetouch.Dto;

namespace onetouch.Maintainances.Exporting
{
    public interface IMaintainancesExcelExporter
    {
        FileDto ExportToFile(List<GetMaintainanceForViewDto> maintainances);
    }
}