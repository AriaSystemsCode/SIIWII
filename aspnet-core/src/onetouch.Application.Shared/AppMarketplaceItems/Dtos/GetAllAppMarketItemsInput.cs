using Abp.Application.Services.Dto;
using onetouch.AppItems.Dtos;
using onetouch.MultiTenancy.Payments.Stripe.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceItems.Dtos
{
    public class GetAllAppMarketItemsInput : PagedAndSortedResultRequestDto
    {
        public string? AccountSSIN { set; get; }
        public int? TenantId { get; set; }
        public long? AppItemListId { get; set; }
        //public SelectorOptionsEnum? SelectorOption { get; set; }
        public bool? SelectorOnly { get; set; }
        public string Filter { get; set; }
       // public ItemsFilterTypesEnum FilterType { get; set; }
        public string LastKey { get; set; }
        public Guid? SelectorKey { get; set; }
        public IList<ArrtibuteFilter> ArrtibuteFilters { get; set; }

        public long[] departmentFilters { get; set; }

        public decimal? MinimumPrice { get; set; }

        public decimal? MaximumPrice { get; set; }

        public virtual SharingLevels SharingLevel { get; set; }

       // public virtual byte VisibilityStatus { get; set; }
        public virtual bool OnlyAvialbleStock { set; get; }
        public virtual DateTime SoldOutFromDate { set; get; }
        public virtual DateTime SoldOutToDate { set; get; }
        public virtual DateTime StartShipFromDate { set; get; }
        public virtual DateTime StartShipToDate { set; get; }
        //public virtual string MaterialContent{ set; get; }
        public virtual long[] Brands { set; get; }
        public virtual string CurrencyCode { set; get; }
    }
    public class GetAccountImagesOutputDto
    { 
        public virtual string LogoImage { set; get; }
        public virtual string BannerImage { set; get; }
        public virtual string Name { set; get; }
    }
    public enum SharingLevels
    { 
        Public,
        SharedWithMe,
        PublicAndSharedWithMe
    }
    public class GetAllMarketplaceItemListsOutputDto
    { 
        public long  Id { set; get; }
        public string Code { set; get; }
        public string Name { set; get; }
        public string SSIN { set; get; }
    }
    public class GetAllInputItemList : PagedAndSortedResultRequestDto
    {
        public long? TenantId { set; get; }
    }
}
