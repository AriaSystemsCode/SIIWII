namespace onetouch.AppTenantsActivitiesLogs.Dtos
{
    public class GetAppTenantsActivitiesLogForViewDto
    {
        public AppTenantsActivitiesLogDto AppTenantsActivitiesLog { get; set; }

        public string SycServiceCode { get; set; }

        public string SycApplicationName { get; set; }

        public string AppTransactionCode { get; set; }

        public string SycPlanName { get; set; }

        public string TenancyName { get; set; }
        public string Notes { get; set; }
    }
}