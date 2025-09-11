using System.Collections.Generic;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;

namespace onetouch.SystemObjects.Exporting
{
    public interface ISydObjectsExcelExporter
    {
        FileDto ExportToFile(List<GetSydObjectForViewDto> sydObjects);
    }
}