namespace onetouch.AppItems.Dtos
{
    public class GetAppItemForViewDto
    {
        public AppItemDto AppItem { get; set; }
        public bool Selected { get; set; }
    }

    public class GetAppItemDetailForViewDto
    {
        public AppItemForViewDto AppItem { get; set; }
       

    }
}