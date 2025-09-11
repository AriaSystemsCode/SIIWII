using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using onetouch.AppEntities;
using onetouch.AppItems;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceItems
{
    [Table("AppMarketplaceItemPrices")]
    [Audited]
    public  class AppMarketplaceItemPrices : FullAuditedEntity<long>
    {
        [StringLength(AppItemConsts.MaxCodeLength, MinimumLength = AppItemConsts.MinCodeLength)]
        public virtual string Code { get; set; }
        public virtual decimal Price { get; set; }
        
        public virtual long AppMarketplaceItemId { get; set; }
        public virtual string AppMarketplaceItemCode { get; set; }
        public virtual long? CurrencyId { get; set; }
        // [Key, Column(Order = 2)]
        public virtual string CurrencyCode { get; set; }

        [ForeignKey("CurrencyId")]
        public virtual AppEntity CurrencyFk { get; set; }
        [ForeignKey("AppMarketplaceItemId")]
        public virtual AppMarketplaceItems AppItemFk { get; set; }
        public virtual bool IsDefault { set; get; }
    }
}
