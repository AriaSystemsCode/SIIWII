using System.Collections.Generic;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;

namespace onetouch.SystemObjects.Exporting
{
    public interface ISycEntityObjectClassificationsExcelExporter
    {
        FileDto ExportToFile(List<GetSycEntityObjectClassificationForViewDto> sycEntityObjectClassifications);
    }
}