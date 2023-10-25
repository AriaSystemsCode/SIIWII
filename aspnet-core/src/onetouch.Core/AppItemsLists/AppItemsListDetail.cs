using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppItems;

namespace onetouch.AppItemsLists
{
    [Table("AppItemsListDetails")]
    public class AppItemsListDetail : Entity<long>
    {
        public virtual long ItemsListId { get; set; }

        [ForeignKey("ItemsListId")]
        public AppItemsList ItemsListFK { get; set; }

        [StringLength(AppItemsListConsts.MaxCodeLength, MinimumLength = AppItemsListConsts.MinCodeLength)]
        public virtual string ItemsListCode { get; set; }

        public virtual long ItemId { get; set; }

        [ForeignKey("ItemId")]
        public AppItem ItemFK { get; set; }

        [StringLength(AppItemsListConsts.MaxCodeLength, MinimumLength = AppItemsListConsts.MinCodeLength)]
        public virtual string ItemCode { get; set; }

        [StringLength(AppItemsListConsts.MaxStateLength, MinimumLength = AppItemsListConsts.MinStateLength)]
        public virtual string State { get; set; }
        //MMT30
        [StringLength(AppItemConsts.SSINLength, MinimumLength = AppItemConsts.SSINLength)]
        public virtual string ItemSSIN { get; set; }
        //MMT30
    }
}