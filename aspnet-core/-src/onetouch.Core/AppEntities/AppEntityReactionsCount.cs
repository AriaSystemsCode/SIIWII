using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace onetouch.AppEntities
{ 
    [Table("AppEntityInteractions")]
    [Audited]
    public class AppEntityReactionsCount : FullAuditedEntity<long>
    {
        public virtual long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }
        public long ReactionsCount { get; set; }
        public long EntityCommentsCount { get; set; }
        public long ViewersCount { get; set; }
        public int LikeCount { get; set; }
        public int CelebrateCount { get; set; }
        public int LoverCount { get; set; }
        public int InsightfulCount { get; set; }
        public int CuriousCount { get; set; }
      
    }
}
