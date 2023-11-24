using onetouch.AppEventGuests.Dtos;

namespace onetouch.AppEvents.Dtos
{
    public class GetAppEventForViewDto
    {
        public AppEventDto AppEvent { get; set; }
        public ResponceType CurrentUserResponce { get; set; }

    }
}