using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using onetouch.AppEntities;
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
    
    [Table("AppMarketplaceItemLists")]
    [Audited]
    public class AppMarketplaceItemLists : AppEntity
    {

        public virtual string Description { get; set; }

        public virtual byte SharingLevel { get; set; }

        public ICollection<AppMarketplaceItemsListDetails> AppItemsListDetails { get; set; }

        public ICollection<AppMarketplaceItemSharings> ItemSharingFkList { get; set; }
        public virtual DateTime TimeStamp { get; set; }
    }
}
