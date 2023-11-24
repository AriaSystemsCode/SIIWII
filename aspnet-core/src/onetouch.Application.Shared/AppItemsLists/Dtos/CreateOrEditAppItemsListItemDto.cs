using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;
using onetouch.AppItems.Dtos;

namespace onetouch.AppItemsLists.Dtos
{
    public class AppItemsListItemDto : EntityDto<long>
    {
        public virtual long ItemsListId { get; set; }

        public virtual long ItemId { get; set; }

        [StringLength(AppItemsListConsts.MaxCodeLength, MinimumLength = AppItemsListConsts.MinCodeLength)]
        public virtual string ItemCode { get; set; }

        public virtual string ItemDescription { get; set; }

        [StringLength(AppItemsListConsts.MaxNameLength, MinimumLength = AppItemsListConsts.MinNameLength)]
        public virtual string ItemName { get; set; }

        public virtual string ImageURL { get; set; }

        public virtual StateEnum State { get; set; }
    }
    public class CreateOrEditAppItemsListItemDto : AppItemsListItemDto
    {
        public IList<AppItemsListItemVariationDto> AppItemsListItemVariations { get; set; }
    }

    public class AppItemsListItemVariationDto : AppItemsListItemDto
    {
        public AppItemVariationDto Variation { get; set; }

    }

    public enum StateEnum
    {
        ToBeAdded,
        ToBeRemoved,
        ActiveOrEmpty
    }
    public enum StatusEnum
    {
        HOLD,
        ACTIVE,
        CANCELLED,
        DRAFT
    }

}