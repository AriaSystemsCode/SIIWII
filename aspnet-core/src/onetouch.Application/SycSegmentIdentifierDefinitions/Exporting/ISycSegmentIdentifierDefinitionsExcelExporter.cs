using System.Collections.Generic;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using onetouch.Dto;

namespace onetouch.SycSegmentIdentifierDefinitions.Exporting
{
    public interface ISycSegmentIdentifierDefinitionsExcelExporter
    {
        FileDto ExportToFile(List<GetSycSegmentIdentifierDefinitionForViewDto> sycSegmentIdentifierDefinitions);
    }
}