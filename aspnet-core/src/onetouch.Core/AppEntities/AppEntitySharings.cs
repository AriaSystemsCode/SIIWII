using Abp.Auditing;
using Abp.Domain.Entities;
using onetouch.AppItems;
using onetouch.Authorization.Users;
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
    public class AppEntitySharings : Entity<long>
    {
        public virtual long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }
        public virtual long? SharedTenantId { get; set; }

        public virtual long? SharedUserId { get; set; }

        [ForeignKey("SharedUserId")]
        public User UserFk { get; set; }

        [StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MaxCodeLength)]
        public virtual string SharedUserEMail { get; set; }

    }
}
