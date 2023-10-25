using Abp.Domain.Entities;
using onetouch.AppItems;
using onetouch.AppItemsLists;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using onetouch.AppMarketplaceItems;
namespace onetouch.AppMarketplaceItemLists
{
   
    [Table("AppMarketplaceItemsListDetail")]
    public class AppMarketplaceItemsListDetail : Entity<long>
    {
        public virtual long AppMarketplaceItemsListId { get; set; }

        [ForeignKey("AppMarketplaceItemsListId")]
        public AppMarketplaceItemList ItemsListFK { get; set; }

        [StringLength(AppItemsListConsts.MaxCodeLength, MinimumLength = AppItemsListConsts.MinCodeLength)]
        public virtual string ItemsListCode { get; set; }

        public virtual long AppMarketplaceItemId { get; set; }

        [ForeignKey("AppMarketplaceItemId")]
        public AppMarketplaceItem ItemFK { get; set; }

        [StringLength(AppItemsListConsts.MaxCodeLength, MinimumLength = AppItemsListConsts.MinCodeLength)]
        public virtual string ItemCode { get; set; }

        [StringLength(AppItemsListConsts.MaxStateLength, MinimumLength = AppItemsListConsts.MinStateLength)]
        public virtual string State { get; set; }
        //MMT30
        [StringLength(AppItemConsts.SSINLength, MinimumLength = AppItemConsts.SSINLength)]
        public virtual string AppMarketplaceItemSSIN { get; set; }
        //MMT30
    }
}
