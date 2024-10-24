using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;
using System.Collections.Generic;
using onetouch.SycIdentifierDefinitions;

namespace onetouch.AppItems
{
   
    [Table("AppItems")]
    [Audited]
    public class AppItem : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        [StringLength(AppItemConsts.MaxCodeLength, MinimumLength = AppItemConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        [StringLength(AppItemConsts.MaxNameLength, MinimumLength = AppItemConsts.MinNameLength)]
        public virtual string Name { get; set; }

        public virtual string Description { get; set; }
        public virtual string Variations { get; set; }
 
        public virtual long EntityId { get; set; }

        [Column(TypeName = "decimal(15, 3)")]
        public virtual decimal Price { get; set; }
        public virtual long StockAvailability { get; set; }
        public virtual long? ParentId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }

        [ForeignKey("ParentId")]
        public AppItem ParentFk { get; set; }

        public virtual long? ParentEntityId { get; set; }

        [ForeignKey("ParentEntityId")]
        public AppEntity ParentEntityFk { get; set; }

        public virtual long? ListingItemId { get; set; }

        [ForeignKey("ListingItemId")]
        public AppItem ListingItemFk { get; set; }

        public virtual long? PublishedListingItemId { get; set; }

        [ForeignKey("PublishedListingItemId")]
        public AppItem PublishedListingItemFk { get; set; }

        public virtual byte ItemType { get; set; }

        public virtual byte SharingLevel { get; set; }


        public ICollection<AppItem> ParentFkList { get; set; }

        public ICollection<AppItem> ListingItemFkList { get; set; }

        public ICollection<AppItem> PublishedListingItemFkList { get; set; }

        public ICollection<AppItemSharing> ItemSharingFkList { get; set; }
        //MMT
        public ICollection<AppItemPrices> ItemPricesFkList { get; set; }
        public ICollection<AppItemSizeScalesHeader> ItemSizeScaleHeadersFkList { get; set; }
        public virtual DateTime TimeStamp { get; set; }
        public virtual int TenantOwner { get; set; }

        [StringLength(AppItemConsts.SSINLength, MinimumLength = AppItemConsts.SSINLength)]
        public virtual string SSIN { get; set; }
        public virtual long? SycIdentifierId { get; set; }
       
        [ForeignKey("SycIdentifierId")]
        public SycIdentifierDefinition SycIdentifierIdFk { get; set; }
        //MMT
        //Iteration#45[Start]
        [StringLength(AppItemConsts.MaxCodeLength, MinimumLength = AppItemConsts.MinCodeLength)]
        public virtual string ManufacturerCode { get; set; }
        //Iteration#45[End]
        
    }
}