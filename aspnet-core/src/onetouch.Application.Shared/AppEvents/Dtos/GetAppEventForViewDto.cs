using onetouch.AppEventGuests.Dtos;
using System;

namespace onetouch.AppEvents.Dtos
{
    public class GetAppEventForViewDto
    {
        public AppEventDto AppEvent { get; set; }
        public ResponceType CurrentUserResponce { get; set; }
        public DateTime currentFromDateTime { get; set; }
        public DateTime currentToDateTime { get; set; }

    }
}