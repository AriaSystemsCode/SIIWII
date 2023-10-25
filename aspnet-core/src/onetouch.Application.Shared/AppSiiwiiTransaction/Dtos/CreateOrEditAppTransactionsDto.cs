using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using onetouch.AppEntities.Dtos;

namespace onetouch.AppSiiwiiTransaction.Dtos
{
    public class CreateOrEditAppTransactionsDto : AppEntityDto // EntityDto<long?>
    {
        [StringLength(AppTransactionConst.MaxEnteredByUserRoleLength, MinimumLength = AppTransactionConst.MinEnteredByUserRoleLength)]
        public virtual string EnteredByUserRole { set; get; }
        public virtual long? BuyerId { set; get; }
        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string? BuyerName { set; get; }
        public long? SellerId { set; get; }
        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string? SellerName { set; get; }

        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string? BuyerEMailAddress { get; set; }

        public virtual long? LanguageId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string LanguageCode { get; set; }

        public virtual long? CurrencyId { get; set; }

        [StringLength(AppTransactionConst.MaxCodeLength, MinimumLength = AppTransactionConst.MinCodeLength)]
        public virtual string CurrencyCode { get; set; }
        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string? SellerEMailAddress { get; set; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string? BuyerPhoneNumber { get; set; }

        
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string? SellerPhoneNumber { get; set; }

        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string BuyerCompanyName { get; set; }

        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string SellerCompanyName { get; set; }
        public virtual string PriceLevel { get; set; }
        public virtual long? BuyerContactId { set; get; }
        
        public virtual string? BuyerContactName { set; get; }
        public virtual long? SellerContactId { set; get; }

        public virtual string? SellerContactName { set; get; }
        public virtual ICollection<AppTransactionsDetailDto> AppTransactionsDetails { get; set; }
    }
    public enum OrderCreatorRole
    { 
        SalesRep,
        IndependentSalesRep,
        Buyer
    }
    public class GetAccountInformationOutputDto
    {
        public long Id { set; get; }
        public string Name { set; get; }
    }
    public class GetContactInformationDto
    {
        public long Id { set; get; }
        public string Name{set;get;}
        public string Email { set; get; }
        public string Phone { set; get; }
    }
}
