using Abp.Application.Services.Dto;
using onetouch.AppEntities.Dtos;
using onetouch.AppItems;
using onetouch.AppItems.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceItems.Dtos
{
    public class GetAppMarketItemForViewDto
    {
        public AppItemDto AppItem { get; set; }
        public bool Selected { get; set; }
    }
    public class GetAppMarketplaceItemDetailForViewDto
    {
        public AppMarketplaceItemForViewDto AppItem { get; set; }


    }
    public class GetAppMarketplaceItemWithPagedAttributesForViewInput : GetAppItemWithPagedAttributesInput
    {

        //public GetAppItemExtraAttributesInput GetAppItemAttributesInputForAttachments { get; set; }
        public GetAppItemExtraAttributesInput GetAppItemAttributesInputForExtraData { get; set; }
        //MMT
        public string CurrencyCode { get; set; }
        public string BuyerAccountSSIN { set; get; }
        public string SellerAccountSSIN { set; get; }

    }
    public class AppMarketplaceItemForViewDto : GetAppMarketplaceItemDto
    {
        public string Brand { set; get; }
        public string ProductLabel { set; get; }
        public DateOnly? StartShipDate { get; set; }
        public DateOnly? SoldOutDate { get; set; }
        public String MaterialContent { get; set; }

        public decimal MinMSRP{ get; set; }
        public decimal MaxMSRP { get; set; }

        public decimal? MinSpecialPrice { get; set; } = null;
        public decimal? MaxSpecialPrice { get; set; } = null;

        public int totalCategory { get; set; }

        public int totalClassification { get; set; }

        public int totalDepartment { get; set; }

        public virtual PagedResultDto<string> EntityCategoriesNames { get; set; }

        public virtual PagedResultDto<string> EntityDepartmentsNames { get; set; }

        public virtual PagedResultDto<string> EntityClassificationsNames { get; set; }

        //look to be removed if could handle performance
        public List<ExtraAttribute> extraAttributesVar { get; set; }
        public virtual bool OrderByPrePack { set; get; }
        
    }
    public class MarketplaceExtraDataAttrDto
    {
        public string extraAttrUsage { get; set; }

        public string extraAttrName { get; set; }
        public int selectedValuesTotalCount { get; set; }
        public string extraAttrDataType { get; set; } // Abdo added this
        public long extraAttributeId { get; set; }
        public List<MarketplaceExtraDataSelectedValues> selectedValues { get; set; }

    }
    public class MarketplaceExtraDataSelectedValues
    {
        public string value { get; set; }
        public int TotalCount { get; set; }
        public virtual List<AppEntityAttachmentDto> EntityAttachments { get; set; }
        public virtual AppEntityAttachmentDto DefaultEntityAttachment { get; set; }
        public virtual List<MarketplaceEDRestAttributes> EDRestAttributes { get; set; }
    }
    public class MarketplaceEDRestAttributes
    {
        public string ExtraAttrName { get; set; }
        public int TotalCount { get; set; }
        public long ExtraAttributeId { get; set; }
        public virtual List<MarketplaceLookupLabelDto> Values { get; set; }

    }
    public class MarketplaceLookupLabelDto
    {
        public long Value { get; set; }

        public string Label { get; set; }
        public string Code { get; set; }

        //mmt
        public long? StockAvailability { get; set; }
        //MMT
        public bool? IsHostRecord { get; set; }
        public long? OrderedQty { get; set; } = 0;
        public string SSIN { get; set; }
        public long? NoOfAvailablePrepacks { get; set; }
        public long? SizeRatio { get; set; }
        public long? OrderedPrePacks { get; set; } = 0;
        public decimal Price { set; get; }
    }
    public class GetAppMarketplaceItemDto : EntityDto<long>
    {

        [StringLength(AppItemConsts.MaxCodeLength, MinimumLength = AppItemConsts.MinCodeLength)]
        public string Code { get; set; }

        [StringLength(AppItemConsts.MaxNameLength, MinimumLength = AppItemConsts.MinNameLength)]
        public string Name { get; set; }

        public virtual long EntityId { get; set; }

        public string Description { get; set; }

        public decimal Price { get; set; }
        public long StockAvailability { get; set; }

        public string Status { get; set; }

        public long EntityObjectTypeId { get; set; }
        public string EntityObjectTypeName { get; set; }

        public virtual byte ItemType { get; set; }

        public virtual byte SharingLevel { get; set; }

        public long? ParentId { get; set; }

        public long? ListingItemId { get; set; }

        public bool Published { get; set; }

        public bool Listed { get; set; }

        public IList<ItemSharingDto> ItemSharing { get; set; }

        public virtual PagedResultDto<AppEntityCategoryDto> EntityCategories { get; set; }
        public virtual IList<AppEntityCategoryDto> EntityCategoriesAdded { get; set; }
        public virtual IList<AppEntityCategoryDto> EntityCategoriesRemoved { get; set; }

        public virtual PagedResultDto<AppEntityCategoryDto> EntityDepartments { get; set; }
        public virtual IList<AppEntityCategoryDto> EntityDepartmentsAdded { get; set; }
        public virtual IList<AppEntityCategoryDto> EntityDepartmentsRemoved { get; set; }


        public virtual PagedResultDto<AppEntityClassificationDto> EntityClassifications { get; set; }
        public virtual IList<AppEntityClassificationDto> EntityClassificationsAdded { get; set; }
        public virtual IList<AppEntityClassificationDto> EntityClassificationsRemoved { get; set; }

        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }

        public IList<AppEntityExtraDataDto> EntityExtraData { get; set; }

        public virtual IList<VariationItemDto> VariationItems { get; set; }

        public List<MarketplaceExtraDataAttrDto> ExtraDataAttr { get; set; }
        public List<MarketplaceExtraDataAttrDto> Recommended { get; set; }
        public List<MarketplaceExtraDataAttrDto> Additional { get; set; }
        public List<MarketplaceExtraDataAttrDto> variations { get; set; }
        //MMT
        public List<AppItemPriceInfo> AppItemPriceInfos { get; set; }
        public List<AppItemSizesScaleInfo> AppItemSizesScaleInfo { get; set; }
        public long? SycIdentifierId { get; set; }
        //MMT
    }
}
