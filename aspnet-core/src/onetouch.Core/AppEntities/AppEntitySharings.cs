using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using onetouch.AppItems;
using onetouch.Authorization.Users;
using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppEntities
{
    [Table("AppEntitySharings")]
    [Audited]
    public class AppEntitySharings : FullAuditedEntity<long>
    {
        public virtual long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityIdFk { get; set; }

        public virtual long? SharedTenantId { get; set; }

        public virtual long? SharedUserId { get; set; }

        [ForeignKey("SharedUserId")]
        public User UserFk { get; set; }

        [StringLength(AppContactConsts.MaxEMailLength, MinimumLength = AppContactConsts.MinEMailLength)]
        public virtual string SharedUserEMail { get; set; }
    }
}
