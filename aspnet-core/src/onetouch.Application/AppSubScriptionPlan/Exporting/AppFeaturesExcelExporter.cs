using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public class AppFeaturesExcelExporter : NpoiExcelExporterBase, IAppFeaturesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppFeaturesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppFeatureForViewDto> appFeatures)
        {
            return CreateExcelPackage(
                "AppFeatures.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppFeatures"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("Name"),
                        L("Description"),
                        L("UnitOfMeasurementCode"),
                        L("UnitOfMeasurementName"),
                        L("FeaturePeriodLimit"),
                        L("Billable"),
                        L("BillingCode"),
                        L("UnitPrice"),
                        L("Category"),
                        L("TrackActivity")
                        );

                    AddObjects(
                        sheet, 2, appFeatures,
                        _ => _.AppFeature.Code,
                        _ => _.AppFeature.Name,
                        _ => _.AppFeature.Description,
                        _ => _.AppFeature.UnitOfMeasurementCode,
                        _ => _.AppFeature.UnitOfMeasurementName,
                        _ => _.AppFeature.FeaturePeriodLimit,
                        _ => _.AppFeature.Billable,
                        _ => _.AppFeature.BillingCode,
                        _ => _.AppFeature.UnitPrice,
                        _ => _.AppFeature.Category,
                        _ => _.AppFeature.TrackActivity
                        );

                });
        }
    }
}