using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using onetouch.AppItems;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceItems
{
    [Table("AppMarketplaceItemSizeScaleHeaders")]
    [Audited]
    public class AppMarketplaceItemSizeScaleHeaders : FullAuditedEntity<long>
    {
        public virtual string SizeScaleCode { get; set; }
        public virtual int NoOfDimensions { get; set; }
        public virtual string SizeScaleName { get; set; }
        public virtual long? SizeScaleId { get; set; }
        public virtual string? Name { get; set; }
        public virtual string Dimesion1Name { get; set; }
        public virtual string Dimesion2Name { get; set; }
        public virtual string Dimesion3Name { get; set; }
        public long? ParentId { get; set; }
        
        [ForeignKey("SizeScaleId")]
        public virtual AppSizeScalesHeader SizeScaleFK { get; set; }
        [ForeignKey("ParentId")]
        public AppMarketplaceItemSizeScaleHeaders ItemSizeScaleFK { get; set; }
        public virtual ICollection<AppMarketplaceItemSizeScaleDetails> AppItemSizeScalesDetails { get; set; }
        public virtual long AppMarketplaceItemId { get; set; }
        public virtual string AppMarketplaceItemCode { get; set; }
        [ForeignKey("AppMarketplaceItemId")]
        public virtual AppMarketplaceItems AppItemFk { get; set; }
    }
}
