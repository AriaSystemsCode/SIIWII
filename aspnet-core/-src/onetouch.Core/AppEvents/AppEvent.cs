using onetouch.AppEntities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using System.Collections.Generic;
using onetouch.AppEventGuests;

namespace onetouch.AppEvents
{
    [Table("AppEvents")]
    [Audited]
    public class AppEvent : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        public virtual bool IsOnLine { get; set; }
        public virtual bool IsPublished { get; set; }

        public virtual DateTime FromDate { get; set; }
        public virtual DateTime UTCFromDateTime { get; set; }
        public virtual DateTime UTCToDateTime { get; set; }
        public virtual DateTime ToDate { get; set; }

        public virtual DateTime FromTime { get; set; }

        public virtual DateTime ToTime { get; set; }

        public virtual bool Privacy { get; set; }

        public virtual bool GuestCanInviteFriends { get; set; }

        [StringLength(AppEventConsts.MaxNameLength, MinimumLength = AppEventConsts.MinNameLength)]
        public virtual string Name { get; set; }
        [StringLength(AppEventConsts.MaxCodeLength, MinimumLength = AppEventConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        public virtual string Description { get; set; }

        [StringLength(AppEventConsts.MaxTimeZoneLength, MinimumLength = AppEventConsts.MinTimeZoneLength)]
        public virtual string TimeZone { get; set; }


        [StringLength(AppEventConsts.MaxRegistrationLinkLength, MinimumLength = AppEventConsts.MinRegistrationLinkLength)]
        public virtual string RegistrationLink { get; set; }

        public virtual long? EntityId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }

        public IList<AppEventGuest> AppEventGuests { get; set; }


    }
}