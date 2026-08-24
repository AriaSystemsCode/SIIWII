using Abp.Application.Services.Dto;
using System;
using Abp.Timing;

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

        public bool? PrivacyFilter { get; set; }

        public bool? GuestCanInviteFriendsFilter { get; set; }

        public string LocationFilter { get; set; }

        public string AppEntityNameFilter { get; set; }

        public string CityFilter { get; set; }
        public string[] CountryCodeFilter { get; set; }
        public long[] CountryIDFilter { get; set; }
        public string StateFilter { get; set; }

        public string PostalFilter { get; set; }
        //I40-X527[Start]
        public long? TenantId { get; set; }
        public int? NoOfEventsToReturn { get; set; }
        //I40-X527[End]
        //I50[Start]
        public virtual string FilterCondition { set; get; }
        //I50[End]
    }
}