using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using onetouch.AppEntities.Dtos;
using System.Collections.Generic;

namespace onetouch.AppEvents.Dtos
{
    public class CreateOrEditAppEventDto : EntityDto<long?>
    {
        //public virtual long Id { get; set; }

        public virtual long EntityId { get; set; }

        public virtual string Code { get; set; }

        public virtual bool IsOnLine { get; set; }

        [StringLength(AppEventConsts.MaxNameLength, MinimumLength = AppEventConsts.MinNameLength)]
        public virtual string Name { get; set; }

        public virtual string TimeZone { get; set; }

        public virtual DateTime FromDate { get; set; }

        public virtual DateTime ToDate { get; set; }

        public virtual DateTime FromTime { get; set; }

        public virtual DateTime ToTime { get; set; }

        public virtual bool Privacy { get; set; }

        public virtual bool GuestCanInviteFriends { get; set; }

        public AppEntityAddressDto Address { get; set; }

        public virtual string Description { get; set; }

        [StringLength(AppEventConsts.MaxRegistrationLinkLength, MinimumLength = AppEventConsts.MinRegistrationLinkLength)]
        public virtual string RegistrationLink { get; set; }

        public IList<AppEntityAttachmentDto> Attachments { get; set; }

        public long Status { get; set; }

        public bool IsPublished { get; set; }

        public virtual DateTime UTCFromDateTime { get; set; }

        public virtual DateTime UTCToDateTime { get; set; }

        public virtual Int32 FromHour { get; set; }
        public virtual Int32 ToHour { get; set; }
        public virtual Int32 FromMinute { get; set; }
        public virtual Int32 ToMinute { get; set; }
    }
}
