using Abp.Application.Services.Dto;
using System;

namespace onetouch.AppEvents.Dtos
{
    public class GetAllAppEventsInput : PagedAndSortedResultRequestDto
    {
        public EventsFilterTypesEnum FilterType { get; set; }

        public string Filter { get; set; }

        public bool? IsOnLineFilter { get; set; }
        public bool? IsPublishedFilter { get; set; }
        public virtual long? CreatorUserIdFilter { get; set; }
        public virtual long? IdFilter { get; set; }
        public virtual long? EntityIdFilter { get; set; }
        public virtual bool IncludeAttachments { get; set; }
        public string TimeZoneFilter { get; set; }
        public DateTime? MaxFromDateFilter { get; set; }
        public DateTime? MinFromDateFilter { get; set; }

        public DateTime? MaxToDateFilter { get; set; }
        public DateTime? MinToDateFilter { get; set; }

        public DateTime? MaxFromTimeFilter { get; set; }
        public DateTime? MinFromTimeFilter { get; set; }

        public DateTime? MaxToTimeFilter { get; set; }
        public DateTime? MinToTimeFilter { get; set; }

        public bool? PrivacyFilter { get; set; }

        public bool? GuestCanInviteFriendsFilter { get; set; }

        public string LocationFilter { get; set; }

        public string AppEntityNameFilter { get; set; }

        public string CityFilter { get; set; }

        public string StateFilter { get; set; }

        public string PostalFilter { get; set; }
    }
}