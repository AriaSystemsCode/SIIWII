using System;
using Abp.Notifications;
using onetouch.Dto;

namespace onetouch.Notifications.Dto
{
    public class GetUserNotificationsInput : PagedInputDto
    {
        public UserNotificationState? State { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }
        //T-SII-20250730.0003,1 MMT 10/01/2025 - Home page - The notifications time on SIIWII Shows (8 hours ago) for a notification that the user  just received[Start]
        public string TimeZone {  get; set; }
        //T-SII-20250730.0003,1 MMT 10/01/2025 - Home page - The notifications time on SIIWII Shows (8 hours ago) for a notification that the user  just received[End]
    }
}