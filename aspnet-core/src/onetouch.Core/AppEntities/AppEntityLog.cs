using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Auditing;
using Abp.Domain.Entities;
using onetouch.SystemObjects;

namespace onetouch.AppEntities
{
    [Table("AppEntityLog")]
    [Audited]
    public class AppEntityLog : Entity<long>
    {
        public virtual long EntityId { get; set; }
        [StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
        public virtual string EntityCode { get; set; }
        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }
        public virtual int TenantId { get; set; }
        public virtual bool ReadyToBeSent { set; get; }
        public virtual DateTime SentDate { set; get; }
        public virtual string PartnerCode { set; get; }
        public virtual long EntityObjectTypeId { get; set; }

        [ForeignKey("EntityObjectTypeId")]
        public SycEntityObjectType EntityObjectTypeFk { get; set; }

        [StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
        public virtual string EntityObjectTypeCode { get; set; }
    }
}
