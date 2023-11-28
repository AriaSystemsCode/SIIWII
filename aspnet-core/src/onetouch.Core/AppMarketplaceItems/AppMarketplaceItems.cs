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
    public class AppMarketplaceItems: AppEntity
    {
        
        public virtual string Description { get; set; }
        public virtual string Variations { get; set; }

        public virtual decimal Price { get; set; }
        public virtual long StockAvailability { get; set; }
        public virtual long? ParentId { get; set; }

       
        [ForeignKey("ParentId")]
        public AppMarketplaceItems ParentFk { get; set; }

        public virtual byte SharingLevel { get; set; }


        public ICollection<AppMarketplaceItems> ParentFkList { get; set; }

        public ICollection<AppMarketplaceItemSharings> ItemSharingFkList { get; set; }
      
        public ICollection<AppMarketplaceItemPrices> ItemPricesFkList { get; set; }
        public ICollection<AppMarketplaceItemSizeScaleHeaders> ItemSizeScaleHeadersFkList { get; set; }
        public virtual DateTime TimeStamp { get; set; }
       
       
       

    }
}
