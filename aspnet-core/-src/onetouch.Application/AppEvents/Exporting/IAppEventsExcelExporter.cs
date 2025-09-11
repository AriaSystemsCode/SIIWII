using System.Collections.Generic;
using onetouch.AppEvents.Dtos;
using onetouch.Dto;

namespace onetouch.AppEvents.Exporting
{
    public interface IAppEventsExcelExporter
    {
        FileDto ExportToFile(List<GetAppEventForViewDto> appEvents);
    }
}