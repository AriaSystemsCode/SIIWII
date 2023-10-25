using System.Collections.Generic;
using onetouch.SycCounters.Dtos;
using onetouch.Dto;

namespace onetouch.SycCounters.Exporting
{
    public interface ISycCountersExcelExporter
    {
        FileDto ExportToFile(List<GetSycCounterForViewDto> sycCounters);
    }
}