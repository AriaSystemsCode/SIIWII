using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;
using System.Collections.Generic;
using onetouch.Authorization.Users;
using onetouch.AppItemsLists;

namespace onetouch.AppItems
{
    [Table("AppItemSharing")]
    public class AppItemSharing : Entity<long>
    {
        public virtual long? ItemId { get; set; }

        [ForeignKey("ItemId")]
        public AppItem ItemFk { get; set; }


        public virtual long? ItemListId { get; set; }

        [ForeignKey("ItemListId")]
        public AppItemsList ItemListFk { get; set; }

        public virtual long? SharedTenantId { get; set; }

        public virtual long? SharedUserId { get; set; }

        [ForeignKey("SharedUserId")]
        public User UserFk { get; set; }

        [StringLength(AppItemConsts.MaxNameLength, MinimumLength = AppItemConsts.MaxNameLength)]
        public virtual string SharedUserEMail { get; set; }

    }
}