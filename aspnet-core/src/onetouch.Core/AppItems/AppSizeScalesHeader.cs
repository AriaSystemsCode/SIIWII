using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using onetouch.AppEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace onetouch.AppItems
{
    [Table("AppSizeScalesHeader")]
    [Audited]
    public class AppSizeScalesHeader : FullAuditedEntity<long>, IMayHaveTenant
    {

        public int? TenantId { get; set; }
        public long EntityId { get; set; }
        public long? ParentId { get; set; }
        public virtual string Code { get; set; }
        public virtual int NoOfDimensions { get; set; }
        public virtual bool IsDefault { get; set; }
        public virtual string Name { get; set; }
        public virtual string Dimesion1Name { get; set; }
        public virtual string Dimesion2Name { get; set; }
        public virtual string Dimesion3Name { get; set; }
        [ForeignKey("EntityId")]
        public virtual AppEntity EntityFk { get; set; }

       // [ForeignKey("ParentId")]
        public virtual AppSizeScalesHeader AppSizeScalesHeaderFk { get; set; }

        public virtual ICollection<AppSizeScalesDetail> AppSizeScalesDetails { get; set;}
    }
}
