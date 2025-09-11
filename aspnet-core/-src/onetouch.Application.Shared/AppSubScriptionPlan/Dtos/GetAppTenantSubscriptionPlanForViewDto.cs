namespace onetouch.AppSubScriptionPlan.Dtos
{
    public class GetAppTenantSubscriptionPlanForViewDto
    {
        public AppTenantSubscriptionPlanDto AppTenantSubscriptionPlan { get; set; }

    }
    public class TenantInformation
    { 
        public string Name { get; set; }
        public long Id { get; set; }
}
}