﻿using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;

namespace onetouch.AppItems.Dtos
{
    public class GetAppItemAttributesInput : PagedAndSortedResultRequestDto
    {
        
    }
    public class GetAppItemAttributesWithPagingInput : GetAppItemAttributesInput
    {
        public long ItemId { get; set; }
        public long ItemEntityId { get; set; }
    }
    public class GetAppItemExtraAttributesInput : GetAppItemAttributesWithPagingInput
    { 
        public long EntityObjectTypeId { get; set; }
        public RecommandedOrAdditional recommandedOrAdditional { get; set; }


    }

    public enum RecommandedOrAdditional
    {
        RECOMMENDED,
        ADDITIONAL

    }

    public class GetAppItemWithPagedAttributesInput : PagedAndSortedResultRequestDto
    {
        public long ItemId { get; set; }
        public GetAppItemAttributesInput GetAppItemAttributesInputForCategories { get; set; }
        public GetAppItemAttributesInput GetAppItemAttributesInputForClassifications { get; set; }
        public GetAppItemAttributesInput GetAppItemAttributesInputForDepartments { get; set; }
 
    }

    public class GetAppItemWithPagedAttributesForEditInput : GetAppItemWithPagedAttributesInput
    { 

    }
    public class GetAppItemWithPagedAttributesForViewInput : GetAppItemWithPagedAttributesInput
    {
       
        //public GetAppItemExtraAttributesInput GetAppItemAttributesInputForAttachments { get; set; }
        public GetAppItemExtraAttributesInput GetAppItemAttributesInputForExtraData { get; set; }
        //MMT
        public string CurrencyCode { get; set; }
        //MMT

    }

    public class GetAllAppItemsInput : PagedAndSortedResultRequestDto
    {
        public int? TenantId { get; set; }
        public long? AppItemListId { get; set; }
        //public SelectorOptionsEnum? SelectorOption { get; set; }
        public bool? SelectorOnly { get; set; }
        public string Filter { get; set; }
        public ItemsFilterTypesEnum FilterType { get; set; }
        public string LastKey { get; set; }
        public Guid? SelectorKey { get; set; }
        public long PriceListId { get; set; }

        public IList<ArrtibuteFilter> ArrtibuteFilters { get; set; }

        public long[] ClassificationFilters { get; set; }

        public long[] CategoryFilters { get; set; }

        public long[] departmentFilters { get; set; }
        public long EntityObjectTypeId { get; set; }

        public decimal MinimumPrice { get; set; }

        public decimal MaximumPrice { get; set; }

        public virtual byte ItemType { get; set; }

        public virtual byte ListingStatus { get; set; }

        public virtual byte PublishStatus { get; set; }

        public virtual byte VisibilityStatus { get; set; }

    }

    public class ArrtibuteFilter
    {
        public long ArrtibuteId { get; set; }

        public long ArrtibuteValueId { get; set; }

        public string KeyValue { get => ArrtibuteId.ToString() + ':' + ArrtibuteValueId.ToString(); }
    }

    public enum ItemsFilterTypesEnum
    {
        MyItems,  
        MyListing,
        SharedWithMe,
        Public,
        SharedWithMeAndPublic
    }

    public enum SelectorOptionsEnum
    {
        ALL,
        INVERT,
        NONE,
        SELECT
    }
}