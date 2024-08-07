using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AppSubScriptionPlan.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppSubScriptionPlan.Exporting
{
    public class AppSubscriptionPlanDetailsExcelExporter : NpoiExcelExporterBase, IAppSubscriptionPlanDetailsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppSubscriptionPlanDetailsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAppSubscriptionPlanDetailForViewDto> appSubscriptionPlanDetails)
        {
            return CreateExcelPackage(
                "AppSubscriptionPlanDetails.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("AppSubscriptionPlanDetails"));

                    AddHeader(
                        sheet,
                        L("FeatureCode"),
                        L("FeatureName"),
                        L("Availability"),
                        L("FeatureLimit"),
                        L("RollOver"),
                        L("UnitPrice"),
                        L("FeaturePeriodLimit"),
                        L("Category"),
                        L("FeatureDescription"),
                        L("FeatureStatus"),
                        L("UnitOfMeasurementName"),
                        L("UnitOfMeasurmentCode"),
                        L("IsFeatureBillable"),
                        L("FeatureBillingCode"),
                        L("FeatureCategory"),
                        L("Trackactivity"),
                        (L("AppSubscriptionPlanHeader")) + L("")
                        );

                    AddObjects(
                        sheet, 2, appSubscriptionPlanDetails,
                        _ => _.AppSubscriptionPlanDetail.FeatureCode,
                        _ => _.AppSubscriptionPlanDetail.FeatureName,
                        _ => _.AppSubscriptionPlanDetail.Availability,
                        _ => _.AppSubscriptionPlanDetail.FeatureLimit,
                        _ => _.AppSubscriptionPlanDetail.RollOver,
                        _ => _.AppSubscriptionPlanDetail.UnitPrice,
                        _ => _.AppSubscriptionPlanDetail.FeaturePeriodLimit,
                        _ => _.AppSubscriptionPlanDetail.Category,
                        _ => _.AppSubscriptionPlanDetail.FeatureDescription,
                        _ => _.AppSubscriptionPlanDetail.FeatureStatus,
                        _ => _.AppSubscriptionPlanDetail.UnitOfMeasurementName,
                        _ => _.AppSubscriptionPlanDetail.UnitOfMeasurmentCode,
                        _ => _.AppSubscriptionPlanDetail.IsFeatureBillable,
                        _ => _.AppSubscriptionPlanDetail.FeatureBillingCode,
                        _ => _.AppSubscriptionPlanDetail.FeatureCategory,
                        _ => _.AppSubscriptionPlanDetail.Trackactivity,
                        _ => _.AppSubscriptionPlanHeader
                        );

                });
        }
    }
}