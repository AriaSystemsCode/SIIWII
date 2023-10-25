using Castle.MicroKernel.SubSystems.Conversion;
using onetouch.AppEntities;
using onetouch.AppItems;
using onetouch.SycIdentifierDefinitions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Auditing;

namespace onetouch.AppMarketplaceItems
{
    [Table("AppMarketplaceItems")]
    [Audited]
    public class AppMarketplaceItem: AppEntity
    {
        
        public virtual string Description { get; set; }
        public virtual string Variations { get; set; }

        public virtual decimal Price { get; set; }
        public virtual long StockAvailability { get; set; }
        public virtual long? ParentId { get; set; }

       
        [ForeignKey("ParentId")]
        public AppMarketplaceItem ParentFk { get; set; }

        public virtual byte SharingLevel { get; set; }


        public ICollection<AppMarketplaceItem> ParentFkList { get; set; }

        public ICollection<AppMarketplaceItemSharing> ItemSharingFkList { get; set; }
      
        public ICollection<AppMarketplaceItemPrices> ItemPricesFkList { get; set; }
        public ICollection<AppMarketplaceItemSizeScalesHeader> ItemSizeScaleHeadersFkList { get; set; }
        public virtual DateTime TimeStamp { get; set; }
       
       
       

    }
}
