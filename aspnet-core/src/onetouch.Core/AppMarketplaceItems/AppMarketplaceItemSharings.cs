﻿using Abp.Domain.Entities;
using onetouch.AppItems;
using onetouch.AppItemsLists;
using onetouch.Authorization.Users;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using onetouch.AppMarketplaceItemLists ;

namespace onetouch.AppMarketplaceItems
{
   
    [Table("AppMarketplaceItemSharings")]
    public class AppMarketplaceItemSharings : Entity<long>
    {
        public virtual long? AppMarketplaceItemId { get; set; }

        [ForeignKey("AppMarketplaceItemId")]
        public AppMarketplaceItems AppMarketplaceItemIdFk { get; set; }


        public virtual long? AppMarketplaceItemListId { get; set; }

        [ForeignKey("AppMarketplaceItemListId")]
        public AppMarketplaceItemLists.AppMarketplaceItemLists ItemListFk { get; set; }

        public virtual long? SharedTenantId { get; set; }

        public virtual long? SharedUserId { get; set; }

        [ForeignKey("SharedUserId")]
        public User UserFk { get; set; }

        [StringLength(AppItemConsts.MaxNameLength, MinimumLength = AppItemConsts.MaxNameLength)]
        public virtual string SharedUserEMail { get; set; }

    }
}
