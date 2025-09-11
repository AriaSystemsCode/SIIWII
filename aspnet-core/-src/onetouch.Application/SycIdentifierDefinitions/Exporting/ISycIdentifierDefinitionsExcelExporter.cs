using System.Collections.Generic;
using onetouch.SycIdentifierDefinitions.Dtos;
using onetouch.Dto;

namespace onetouch.SycIdentifierDefinitions.Exporting
{
    public interface ISycIdentifierDefinitionsExcelExporter
    {
        FileDto ExportToFile(List<GetSycIdentifierDefinitionForViewDto> sycIdentifierDefinitions);
    }
}