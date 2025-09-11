using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using onetouch.AppEvents;
using onetouch.AppEntities;

namespace onetouch.AppEventGuests
{
    [Table("AppEventGuests")]
    public class AppEventGuest : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        [StringLength(AppEventConsts.MaxCodeLength, MinimumLength = AppEventConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        public virtual int UserResponce { get; set; }

        public virtual long EventId { get; set; }

        [ForeignKey("EventId")]
        public virtual AppEvent EventFk { get; set; }

        public virtual long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }
    }
}