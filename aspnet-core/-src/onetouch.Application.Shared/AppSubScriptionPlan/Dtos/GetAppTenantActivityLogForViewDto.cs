namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAppTenantActivityLogForViewDto
    {
        public AppTenantActivityLogDto AppTenantActivityLog { get; set; }

    }
    public class AddOnsInputDto
    {
        public virtual string FeatureCode { get; set; }

        public virtual string FeatureName { get; set; }
        public decimal Price { get; set; }
        public int Qty { get; set; }
   }
}