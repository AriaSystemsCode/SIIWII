using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppEvents.Dtos
{
    public class GetAllAppEventsForExcelInput
    {
        public string Filter { get; set; }

        public int? IsOnLineFilter { get; set; }

        public DateTime? MaxFromDateFilter { get; set; }
        public DateTime? MinFromDateFilter { get; set; }

        public DateTime? MaxToDateFilter { get; set; }
        public DateTime? MinToDateFilter { get; set; }

        public DateTime? MaxFromTimeFilter { get; set; }
        public DateTime? MinFromTimeFilter { get; set; }

        public DateTime? MaxToTimeFilter { get; set; }
        public DateTime? MinToTimeFilter { get; set; }

        public int? PrivacyFilter { get; set; }

        public int? GuestCanInviteFriendsFilter { get; set; }

        public string LocationFilter { get; set; }

        public string AppEntityNameFilter { get; set; }

    }
}