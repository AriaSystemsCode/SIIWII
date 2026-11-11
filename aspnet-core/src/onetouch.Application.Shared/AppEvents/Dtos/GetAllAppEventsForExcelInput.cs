using Abp.Application.Services.Dto;
using System;
using Abp.Timing;

namespace onetouch.AppEvents.Dtos
{
    public class GetAllAppEventsForExcelInput
    {
        public string Filter { get; set; }

        public int? IsOnLineFilter { get; set; }

        [DisableDateTimeNormalization]
        public DateTime? MaxFromDateFilter { get; set; }
        [DisableDateTimeNormalization]
        public DateTime? MinFromDateFilter { get; set; }

        [DisableDateTimeNormalization]
        public DateTime? MaxToDateFilter { get; set; }
        [DisableDateTimeNormalization]
        public DateTime? MinToDateFilter { get; set; }

        [DisableDateTimeNormalization]
        public DateTime? MaxFromTimeFilter { get; set; }
        [DisableDateTimeNormalization]
        public DateTime? MinFromTimeFilter { get; set; }

        [DisableDateTimeNormalization]
        public DateTime? MaxToTimeFilter { get; set; }
        [DisableDateTimeNormalization]
        public DateTime? MinToTimeFilter { get; set; }

        public int? PrivacyFilter { get; set; }

        public int? GuestCanInviteFriendsFilter { get; set; }

        public string LocationFilter { get; set; }

        public string AppEntityNameFilter { get; set; }

    }
}