using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using onetouch.AppEntities.Dtos;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using onetouch.AppSizeScales.Dtos;

namespace onetouch.AppItems.Dtos
{
    public class CreateOrEditAppItemDto : EntityDto<long>
    {

        [StringLength(AppItemConsts.MaxCodeLength, MinimumLength = AppItemConsts.MinCodeLength)]
        public string Code { get; set; }
        public DateOnly ShipDate { get; set; }
        public DateOnly SoldOutDate { get; set; }
        public String MaterialContent { get; set; }



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

        public virtual IList<AppEntityCategoryDto> EntityCategories { get; set; }
        public virtual IList<AppEntityCategoryDto> EntityCategoriesAdded { get; set; }
        public virtual IList<AppEntityCategoryDto> EntityCategoriesRemoved { get; set; }
        
        public virtual IList<AppEntityCategoryDto> EntityDepartments { get; set; }
        public virtual IList<AppEntityCategoryDto> EntityDepartmentsAdded { get; set; }
        public virtual IList<AppEntityCategoryDto> EntityDepartmentsRemoved { get; set; }


        public virtual IList<AppEntityClassificationDto> EntityClassifications { get; set; }
        public virtual IList<AppEntityClassificationDto> EntityClassificationsAdded { get; set; }
        public virtual IList<AppEntityClassificationDto> EntityClassificationsRemoved { get; set; }

        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }

        public IList<AppEntityExtraDataDto> EntityExtraData { get; set; }

        public virtual IList<VariationItemDto> VariationItems { get; set; }

        public List<ExtraDataAttrDto> ExtraDataAttr { get; set; }
        public List<ExtraDataAttrDto> Recommended { get; set; }
        public List<ExtraDataAttrDto> Additional { get; set; }
        public List<ExtraDataAttrDto> variations { get; set; }
        //MMT
        public List<AppItemPriceInfo> AppItemPriceInfos { get; set; }
        public List<AppItemSizesScaleInfo> AppItemSizesScaleInfo { get; set;}
        public string OriginalCode { get; set; }
        public long? SycIdentifierId { get; set; }
        public string? SSIN { set; get; }
        //MMT
    }
    //MMT
    public class AppItemPriceInfo : EntityDto<long>
    {
        public virtual string Code { get; set; }
        public virtual decimal Price { get; set; }
        public virtual long CurrencyId { get; set; }
        public virtual string CurrencyCode { get; set; }
        public virtual string CurrencySymbol { get; set; }
        public virtual string CurrencyName { get; set; }
        public virtual bool IsDefault { set; get; }
    }
    public class AppItemSizesScaleInfo : AppSizeScaleDto
    {
        //public virtual string SizeScaleCode { get; set; }
        //public virtual int NoOfDimensions { get; set; }
        //public virtual string SizeScaleName { get; set; }
        public virtual long? SizeScaleId { get; set; }
        public virtual string Name { get; set; }
        //public virtual string Dimesion1Name { get; set; }
        //public virtual string Dimesion2Name { get; set; }
        //public virtual string Dimesion3Name { get; set; }
        //public long? ParentId { get; set; }
        //public virtual ICollection<AppItemSizesScaleDetailInfo> AppItemSizesScaleDetailInfo { get; set; }
    }
    //public class AppItemSizesScaleDetailInfo : EntityDto<long>
    //{
    //    public virtual string SizeCode { get; set; }
    //    public virtual long SizeScaleId { get; set; }
    //    public virtual int SizeRatio { get; set; }
    //    public virtual string Position { get; set; }
    //    public virtual long? SizeId { get; set; }
    //    public virtual string DimensionName { get; set; }
       
    //}
    //MMT

    public class ExtraDto
    {
        public long ParentId { get; set; }
        public long Id { get; set; }
        public string Value { get; set; }
    }

    public class GetAppItemDto : EntityDto<long>
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

        public List<ExtraDataAttrDto> ExtraDataAttr { get; set; }
        public List<ExtraDataAttrDto> Recommended { get; set; }
        public List<ExtraDataAttrDto> Additional { get; set; }
        public List<ExtraDataAttrDto> variations { get; set; }
        //MMT
        public List<AppItemPriceInfo> AppItemPriceInfos { get; set; }
        public List<AppItemSizesScaleInfo> AppItemSizesScaleInfo { get; set; }
        public long? SycIdentifierId { get; set; }
    //MMT
}

    public class AppItemForEditDto : GetAppItemDto
    {

    }

    public class AppItemForViewDto : GetAppItemDto
    {
        public DateOnly ShipDate { get; set; }
        public DateOnly SoldOutDate { get; set; }
        public String MaterialContent { get; set; }

        public decimal MaxPrice { get; set; }

        public decimal MinPrice { get; set; }

        
        public int totalCategory { get; set; }

        public int totalClassification { get; set; }

        public int totalDepartment { get; set; }

        public virtual PagedResultDto<string> EntityCategoriesNames { get; set; }

        public virtual PagedResultDto<string> EntityDepartmentsNames { get; set; }

        public virtual PagedResultDto<string> EntityClassificationsNames { get; set; }

        //look to be removed if could handle performance
        public List<ExtraAttribute> extraAttributesVar { get; set; }
        //MMT33-2
        public virtual bool ShowSync { set; get; }
        public virtual DateTime LastModifiedDate { set; get; }
        public virtual long NumberOfSubscribers { set; get; }
        //MMT33-2

    }


    public class ExtraDataAttrDto
    {
        public string extraAttrUsage { get; set; }

        public string extraAttrName { get; set; }
        public int selectedValuesTotalCount { get; set; }
        public string extraAttrDataType { get; set; } // Abdo added this
        public long extraAttributeId { get; set; }
        public List<ExtraDataSelectedValues> selectedValues { get; set; }
   
    }
    //MMT
    public class AppItemVariationsDto : GetAppItemDto
    {
        public List<AppItemPriceInfo> appItemPriceInfos { get; set; }
    }
    //MMT
    public class ExtraDataSelectedValues 
    {
        public string value { get; set; }
        public int TotalCount { get; set; }
        public virtual List<AppEntityAttachmentDto> EntityAttachments { get; set; }
        public virtual AppEntityAttachmentDto DefaultEntityAttachment { get; set; }
        public virtual List<EDRestAttributes> EDRestAttributes { get; set; }
    }

    public class ExtraDataFirstAttributeValuesDto
    {
        public string Value { get; set; }
        public virtual string DefaultEntityAttachment { get; set; }

    }

    public class ExtraDataFirstAttributeAttachmentsDto
    {
        public virtual string DefaultEntityAttachment { get; set; }

    }
    public class ExtraDataSecondAttributeValuesDto
    {
        public string Value { get; set; }

    }
    public class ExtraDataFirstAttributeValuesInput: PagedAndSortedResultRequestDto
    {
        public long ItemId { get; set; }
        public long AttributeId { get; set; }
        
    }
    public class ExtraDataSecondAttributeValuesInput : PagedAndSortedResultRequestDto
    {
        public long ItemId { get; set; }
        public long FirstAttributeId { get; set; }
        public long SecondAttributeId { get; set; }
        public string Value { get; set; }
    }
    public class ExtraDataFirstAttributeAttachmentsInput
    {
        public long ItemId { get; set; }
        public long FirstAttributeId { get; set; }
        public string Value { get; set; }
    }

    public class EDRestAttributes
    {
        public string ExtraAttrName { get; set; }
        public int TotalCount { get; set; }
        public long ExtraAttributeId { get; set; }
        public virtual List<LookupLabelDto> Values { get; set; }

    }
    public class VariationItemDto : EntityDto<long>
    {

        //public List<AttributeInfo> RowAttributes { get; set; }

        //public AttributeInfo ColAttribute { get; set; }

        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }

        public IList<AppEntityExtraDataDto> EntityExtraData { get; set; }

        public int Position { get; set; }

        public long? ParentId { get; set; }

        //public string VariationId { get; set; }

        public decimal Price { get; set; }
        public string Code { get; set; }

        public long? ListingItemId { get; set; }
        public long StockAvailability { get; set; }
        //MMT
        public List<AppItemPriceInfo> AppItemPriceInfos { get; set; }
        //MMT
        //MMT30
        public string SSIN { set; get; }
        //MMT30
    }

    //public class AttributeInfo
    //{

    //    public long EntityObjectTypeId { get; set; }

    //    public string EntityObjectTypeName { get; set; }

    //    public long AttributeOptionId { get; set; }

    //    public string AttributeOptionName { get; set; }

    //}

    public class AppEntityExtraDataDto : EntityDto<long>
    {
        public long EntityId { get; set; }

        public long? EntityObjectTypeId { get; set; }

        public string EntityObjectTypeCode { get; set; }

        public string EntityObjectTypeName { get; set; }

        public long? AttributeValueId { get; set; }

        public string AttributeValue { get; set; }

        public long AttributeId { get; set; }

        public string AttributeValueFkName { get; set; }
        public string AttributeValueFkCode { get; set; }
        public string AttributeCode { get; set; }

    }

    public class PublishItemOptions
    {
        public virtual long? ListingItemId { get; set; }

        public virtual long ItemListId { get; set; }


        public virtual byte SharingLevel { get; set; }

        public virtual string Message { get; set; }

        public IList<ItemSharingDto> ItemSharing { get; set; }

    }
    //mmt33-2
    public class SharingItemOptions
    {
        public virtual long AppItemId { get; set; }

        public virtual bool SyncProduct { get; set; } = false;


        public virtual byte SharingLevel { get; set; }

        public virtual string Message { get; set; }

        public IList<ItemSharingDto> ItemSharing { get; set; }

    }
    public class ShareItemListOptions
    {
        public virtual long? AppMarketplaceItemId { get; set; }

        public virtual long ItemListId { get; set; }


        public virtual byte SharingLevel { get; set; }

        public virtual string Message { get; set; }

        public IList<ItemSharingDto> ItemSharing { get; set; }
        public bool SyncProductList { set; get; } = false;
    }
    //mmt33-2
}