using Abp.Authorization.Users;
using Abp.Domain.Entities.Auditing;
using onetouch.AppEntities;
using onetouch.Message;
using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceMessages
{
    [Table("AppMarketplaceMessages")]
    public class AppMarketplaceMessage : FullAuditedEntity<long>
    {
        public long SenderId { get; set; }

        [ForeignKey("SenderId")]
        public virtual AbpUserBase SenderFk { get; set; }

        //[Required]
        //public virtual string To { get; set; }

       // public virtual string CC { get; set; }


       //public virtual string BCC { get; set; }

        [Required]
        [StringLength(SydObjectConsts.MaxNameLength, MinimumLength = SydObjectConsts.MinNameLength)]
        public virtual string Subject { get; set; }

        [Required]
        public virtual string Body { get; set; }

        [Required]
        public virtual string BodyFormat { get; set; }
        public virtual DateTime SendDate { get; set; }

        //public virtual DateTime ReceiveDate { get; set; }

        [Required]
        public long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public virtual AppEntity EntityFk { get; set; }

        [StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
        public virtual string EntityCode { get; set; }

        public long? ParentId { get; set; }

        public long? ThreadId { get; set; }

        [ForeignKey("ThreadId")]
        public virtual AppMarketplaceMessage ThreadFk { get; set; }

       // public long? UserId { get; set; }

       // [ForeignKey("UserId")]
       // public virtual AbpUserBase UserFk { get; set; }

        public long? OriginalMessageId { get; set; }

        [ForeignKey("ParentId")]
        public virtual ICollection<AppMarketplaceMessage> ParentFKList { get; set; }

    }
}
