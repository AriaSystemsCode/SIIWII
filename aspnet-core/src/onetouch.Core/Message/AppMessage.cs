using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.ComponentModel.DataAnnotations;
using onetouch.AppEntities;
using Microsoft.AspNetCore.Identity;
using onetouch.Authorization.Users;
using onetouch.SystemObjects;
using Abp.Authorization.Users;

namespace onetouch.Message
{

    [Table("AppMessages")]
    public class AppMessage : FullAuditedEntity<long>,IMayHaveTenant
    {
        public int? TenantId { get; set; }

        public long SenderId { get; set; }

        [ForeignKey("SenderId")]
        public virtual AbpUserBase SenderFk { get; set; }

        [Required]
        public virtual string To { get; set; }

        public virtual string CC { get; set; }

       
        public virtual string BCC { get; set; }

        [Required]
        [StringLength(SydObjectConsts.MaxNameLength, MinimumLength = SydObjectConsts.MinNameLength)]
        public virtual string Subject { get; set; }

        [Required]
        public virtual string Body { get; set; }

        [Required]
        public virtual string BodyFormat { get; set; }
        public virtual DateTime SendDate { get; set; }

        public virtual DateTime ReceiveDate { get; set; }

        [Required]
        public long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public virtual AppEntity EntityFk { get; set; }

        [StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
        public virtual string EntityCode { get; set; }

        public long? ParentId { get; set; }

        //[ForeignKey("ParentId")]
        //public virtual AppMessage ParentFk { get; set; }


        public long? ThreadId { get; set; }

        [ForeignKey("ThreadId")]
        public virtual AppMessage ThreadFk { get; set; }

        public long? UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual AbpUserBase UserFk { get; set; }

        public long? OriginalMessageId { get; set; }

        [ForeignKey("ParentId")]
        public virtual ICollection<AppMessage>  ParentFKList { get; set; }

    }
}
