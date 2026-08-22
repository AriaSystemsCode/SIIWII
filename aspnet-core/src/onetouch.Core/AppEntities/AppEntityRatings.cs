using Abp.Auditing;
using Abp.Domain.Entities;
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
    [Table("AppEntityRatings")]
    [Audited]
    public class AppEntityRating : Entity<long>
    {
        public virtual long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }
        [StringLength(AppEntityConsts.SSINLength, MinimumLength = AppEntityConsts.SSINLength)]
        public virtual string UserSSIN { set; get; }
        [StringLength(AppEntityConsts.SSINLength, MinimumLength = AppEntityConsts.SSINLength)]
        public virtual string EntitySSIN { set; get; }
        public virtual int Rating { set; get; }
        public virtual long EntityObjectTypeId { get; set; }

        [ForeignKey("EntityObjectTypeId")]
        public SycEntityObjectType EntityObjectTypeFk { get; set; }
        public virtual string EntityObjectTypeCode { set; get; }

        public virtual string ObjectCode{ set; get; }
        public virtual long ObjectId { get; set; }

        [ForeignKey("ObjectId")]
        public SydObject ObjectFk { get; set; }
    }
}
