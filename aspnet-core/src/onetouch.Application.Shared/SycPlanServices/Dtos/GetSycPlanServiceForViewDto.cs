namespace onetouch.SycPlanServices.Dtos
{
    public class GetSycPlanServiceForViewDto
    {
        public SycPlanServiceDto SycPlanService { get; set; }

        public string SycApplicationName { get; set; }

        public string SycPlanName { get; set; }

        public string SycServiceCode { get; set; }

    }
}