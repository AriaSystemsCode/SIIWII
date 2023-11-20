using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using onetouch.AppEntities;
using onetouch.AppItems;

namespace onetouch.AppMarketplaceItems
{
    [Table("AppMarketplaceItemSizeScaleDetails")]
    [Audited]
    public class AppMarketplaceItemSizeScaleDetails : FullAuditedEntity<long>
    {
        public virtual string SizeCode { get; set; }
        public virtual long SizeScaleId { get; set; }
        public virtual int SizeRatio { get; set; }
        public virtual string D1Position { get; set; }
        public virtual string D2Position { get; set; }
        public virtual string D3Position { get; set; }
        public virtual long? SizeId { get; set; }
        public virtual string DimensionName { get; set; }
        [ForeignKey("SizeId")]
        public virtual AppEntity SizeFk { get; set; }
        [ForeignKey("SizeScaleId")]
        public virtual AppMarketplaceItemSizeScaleHeaders SizeScaleFK { get; set; }
    }
}
