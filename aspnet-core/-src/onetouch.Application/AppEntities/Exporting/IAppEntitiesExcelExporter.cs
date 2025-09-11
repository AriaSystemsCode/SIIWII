using System.Collections.Generic;
using onetouch.AppEntities.Dtos;
using onetouch.Dto;

namespace onetouch.AppEntities.Exporting
{
    public interface IAppEntitiesExcelExporter
    {
        FileDto ExportToFile(List<GetAppEntityForViewDto> appEntities);
    }
}