namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAppSubscriptionPlanDetailForViewDto
    {
        public AppSubscriptionPlanDetailDto AppSubscriptionPlanDetail { get; set; }

        public string AppSubscriptionPlanHeader { get; set; }

        public string AppFeatureDescription { get; set; }
        public long FeatureUsedQty { get; set; }
        public long FeatureCreditQty { get; set; }

    }
}