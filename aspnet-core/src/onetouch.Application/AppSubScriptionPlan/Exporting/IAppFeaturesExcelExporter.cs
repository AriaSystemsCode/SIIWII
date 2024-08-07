using System.Collections.Generic;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public interface IAppFeaturesExcelExporter
    {
        FileDto ExportToFile(List<GetAppFeatureForViewDto> appFeatures);
    }
}