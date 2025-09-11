using System.Collections.Generic;
using onetouch.AppItems.Dtos;
using onetouch.Dto;

namespace onetouch.AppItems.Exporting
{
    public interface IAppItemsExcelExporter
    {
        FileDto ExportToFile(List<GetAppItemForViewDto> appItems);
    }
}