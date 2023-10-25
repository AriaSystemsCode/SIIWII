namespace onetouch.AppAdvertisements.Dtos
{
    public class GetAppAdvertisementForViewDto
    {
        public AppAdvertisementDto AppAdvertisement { get; set; }

        public string AppEntityName { get; set; }

        public string UserName { get; set; }
        public string TenantName { get; set; }
        public long AccountId { set; get; }
        public string Url { get; set; }
    }
}