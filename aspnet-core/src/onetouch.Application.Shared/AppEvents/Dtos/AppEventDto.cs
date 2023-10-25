using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using onetouch.AppEntities.Dtos;

namespace onetouch.AppEvents.Dtos
{
    public class AppEventDto : EntityDto<long>
    {
        public long? EntityId { get; set; }
        public string UserName { get; set; }
        public long UserId { get; set; }
        public virtual bool IsOnLine { get; set; }
        public virtual bool IsPublished { get; set; }
        public virtual string LogoURL { get; set; }
        public virtual string BanarURL { get; set; }
        public virtual string Status { get; set; }


        public virtual int GuestsCount { get; set; }

        public virtual string Address1 { get; set; }
        public virtual string Address2 { get; set; }
        public virtual string City { get; set; }

        public virtual string State { get; set; }

        public virtual string Postal { get; set; }

        public virtual string Country { get; set; }

        public virtual DateTime FromDate { get; set; }
        public virtual DateTime UTCFromDateTime { get; set; }
        public virtual DateTime UTCToDateTime { get; set; }
        public virtual DateTime ToDate { get; set; }

        public virtual DateTime FromTime { get; set; }

        public virtual DateTime ToTime { get; set; }

        public virtual bool Privacy { get; set; }

        public virtual bool GuestCanInviteFriends { get; set; }

        public virtual string Name { get; set; }
        public virtual string Code { get; set; }

        public virtual string Description { get; set; }

        public virtual string TimeZone { get; set; }

        public virtual string RegistrationLink { get; set; }


        public IList<AppEntityAttachmentDto> Attachments { get; set; }

        public AppEntityAddressDto Address { get; set; }

    }
}