using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using onetouch.SystemObjects;

namespace onetouch.AppEntities
{
    [Table("AppEntityLog")]
    [Audited]
    public class AppEntityLog : FullAuditedEntity<long>
    {
        public virtual long EntityId { get; set; }
        [StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
        public virtual string EntityCode { get; set; }
        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }
        public virtual int TenantId { get; set; }
        public virtual long? EntityObjectStatusId { get; set; }

        [ForeignKey("EntityObjectStatusId")]
        public SycEntityObjectStatus EntityObjectStatusFk { get; set; }

        [StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
        public virtual string EntityObjectStatusCode { get; set; }
        public virtual DateTime SentDate { set; get; }
        public virtual string PartnerCode { set; get; }
        public virtual long EntityObjectTypeId { get; set; }

        [ForeignKey("EntityObjectTypeId")]
        public SycEntityObjectType EntityObjectTypeFk { get; set; }

        [StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
        public virtual string EntityObjectTypeCode { get; set; }
        public virtual long ObjectId { get; set; }

        [ForeignKey("ObjectId")]
        public SydObject ObjectFk { get; set; }

        [StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
        public virtual string ObjectCode { get; set; }
    }
}
