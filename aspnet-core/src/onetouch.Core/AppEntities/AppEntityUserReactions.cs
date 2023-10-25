using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using onetouch.Authorization.Users;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace onetouch.AppEntities
{
    [Table("AppEntityUserReactions")]
    [Audited]
    
    public class AppEntityUserReactions :  FullAuditedEntity<long>
    {
        public virtual long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }
        public virtual long UserId { get; set; }
        [ForeignKey("UserId")]
        public User UserFk { get; set; }
        public int ReactionSelected { get; set; }
        public DateTime ActionTime { get; set; }
        public char InteractionType { get; set; }
        public int TenantId { get; set; }
    }
}
