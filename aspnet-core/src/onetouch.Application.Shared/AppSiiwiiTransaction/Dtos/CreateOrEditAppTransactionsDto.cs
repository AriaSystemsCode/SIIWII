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
using onetouch.Sessions.Dto;

namespace onetouch.AppSiiwiiTransaction.Dtos
{
    public class CreateOrEditAppTransactionsDto : AppEntityDto // EntityDto<long?>
    {
        [StringLength(AppTransactionConst.MaxEnteredByUserRoleLength, MinimumLength = AppTransactionConst.MinEnteredByUserRoleLength)]
        public virtual string EnteredByUserRole { set; get; }
        public virtual string? BuyerCompanySSIN { set; get; }
        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string? BuyerCompanyName { set; get; }
        public long? SellerId { set; get; }
        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string? SellerCompanyName { set; get; }

        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string? BuyerContactEMailAddress { get; set; }

        public virtual long? LanguageId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string LanguageCode { get; set; }
        
        public virtual long? CurrencyId { get; set; }
        
        [StringLength(AppTransactionConst.MaxCodeLength, MinimumLength = AppTransactionConst.MinCodeLength)]
        public virtual string CurrencyCode { get; set; }
        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string? SellerContactEMailAddress { get; set; }
        //[StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string? BuyerContactPhoneNumber { get; set; }

        
        //[StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string? SellerContactPhoneNumber { get; set; }

        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string BuyerContactName { get; set; }

        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string SellerContactName { get; set; }
        public virtual string PriceLevel { get; set; }
        public virtual string? BuyerContactSSIN { set; get; }
        
        public virtual string BuyerBranchSSIN { set; get; }
        public virtual string BuyerBranchName { set; get; }
        public virtual string SellerBranchSSIN { set; get; }
        public virtual string SellerBranchName { set; get; }
        public virtual string? SellerContactSSIN { set; get; }
        public virtual TransactionType TransactionType { set; get; }
        public string EntityStatusCode { set; get; }
        // virtual string? SellerContactName { set; get; }
        [Required]
        public DateTime CompleteDate { get; set; }
        public virtual string? SellerCompanySSIN { set; get; }
        [Required]
        public virtual DateTime StartDate { set; get; }
        [Required]
        public virtual DateTime AvailableDate { set; get; }
        public virtual long? ShipViaId { get; set; }
        
        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string ShipViaCode { get; set; }
       
        public virtual long? PaymentTermsId { get; set; }
       
        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string PaymentTermsCode { get; set; }
        [StringLength(AppTransactionConst.MaxBuyerDeptLength, MinimumLength = AppTransactionConst.MinBuyerDeptLength)]
        public virtual string BuyerDepartment { set; get; }
        public virtual ICollection<AppTransactionsDetailDto> AppTransactionsDetails { get; set; }
        public virtual ICollection<AppTransactionContactDto> AppTransactionContacts { get; set; }
        public virtual string BuyerStore { set; get; }
        public virtual long TotalQuantity { set; get; }
        public virtual double TotalAmount { set; get; }
        public virtual bool lFromPlaceOrder { set; get; } = false;
       
        public virtual decimal CurrencyExchangeRate { get; set; }
        //Iteration#42[Start]
        public virtual string? Reference { set; get; }
        public virtual DateTime EnteredDate { set; get; }
        //Iteration#42[End]
    }
    public enum OrderCreatorRole
    { 
        SalesRep,
        IndependentSalesRep,
        Buyer
    }
    public enum TransactionType
    {
        SalesOrder,
        PurchaseOrder
    }
    public class GetAccountInformationOutputDto
    {
        public long Id { set; get; }
        public string Name { set; get; }
        public string AccountSSIN { set; get; }
        public CurrencyInfoDto CurrencyCode { set; get; }
        public string Email { set; get; }
        public string Phone { set; get; }
        public long? PhoneTypeId { get; set; }
        public string PhoneTypeName { set; get; }
    }
    public class GetContactInformationDto
    {
        public long Id { set; get; }
        public string Name{set;get;}
        public string Email { set; get; }
        public string Phone { set; get; }
        public string SSIN { set; get; }
        public long? PhoneTypeId { get; set; }
        public string PhoneTypeName { set; get; }
        public List<PhoneNumberAndtype> PhoneList { get; set; }
    }
    public class PhoneNumberAndtype 
    { 
        public string PhoneNumber { set; get; }
        public long? PhoneTypeId { get; set; }
        public string PhoneTypeName { set; get; }
    }
}
