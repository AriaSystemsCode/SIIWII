using onetouch.AppEventGuests.Dtos;
using System;
using Abp.Timing;

namespace onetouch.AppEvents.Dtos
{
    public class GetAppEventForViewDto
    {
        public AppEventDto AppEvent { get; set; }
        public ResponceType CurrentUserResponce { get; set; }
        [DisableDateTimeNormalization]
        public DateTime currentFromDateTime { get; set; }
        [DisableDateTimeNormalization]
        public DateTime currentToDateTime { get; set; }
        
    }
}