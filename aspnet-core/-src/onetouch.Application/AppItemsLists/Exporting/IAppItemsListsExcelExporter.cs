using System.Collections.Generic;
using onetouch.AppItemsLists.Dtos;
using onetouch.Dto;

namespace onetouch.AppItemsLists.Exporting
{
    public interface IAppItemsListsExcelExporter
    {
        FileDto ExportToFile(List<GetAppItemsListForViewDto> appItemsLists);
    }
}