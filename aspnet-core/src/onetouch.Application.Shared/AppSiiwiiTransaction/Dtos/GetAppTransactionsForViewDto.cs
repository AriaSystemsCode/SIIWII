using Abp;
using Abp.Application.Services.Dto;
using Castle.MicroKernel.Registration;
using Newtonsoft.Json.Linq;
using onetouch.AppContacts;
using onetouch.AppEntities.Dtos;
using onetouch.AppItems.Dtos;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace onetouch.AppSiiwiiTransaction.Dtos
{
    public class ChargesDto
    {
        public string Name { get; set; }
        public Boolean IsEditable { get; set; }
        public decimal ChargeAmount { get; set; }
        public long TransactionDetailID { get; set; }

    }
    public class GetAppTransactionsForViewDto : CreateOrEditAppTransactionsDto
    {
        public virtual List<ChargesDto> Charges { set; get; }
        public virtual bool LastRecord { set; get; } = false;
        public virtual bool FirstRecord { set; get; } = false;
        // public virtual DateTime EnteredDate { set; get; }
        public long CreatorUserId { set; get; }
        public byte[] OrderConfirmationFile { set; get; }
        public virtual List<ContactInformationOutputDto> SharedWithUsers { set; get; }
        public virtual bool IsOwnedByMe { set; get; }
        public virtual string? CreatorTenantName { set; get; }
        //MMT - Performance[Start]
        public virtual bool IsOrderInformationValid { set; get; }
        public virtual bool IsBuyerContactInformationValid { set; get; }
        public virtual bool IsSellerContactInformationValid { set; get; }
        public virtual bool IsSalesRepInformationValid { set; get; }
        public virtual bool IsShippingInformationValid { set; get; }
        public virtual bool IsBillingInformationValid { set; get; }
        //MMT - Performance[End]
        //start
        public virtual PagedResultDto<string> EntityCategoriesNames { get; set; }
        public virtual PagedResultDto<string> EntityClassificationsNames { get; set; }
        //End
        //Iteration45[Start]
        public virtual bool ShowSync { set; get; } = false;
        public virtual DateTime LastModifiedDate { set; get; }
        public virtual string ShipViaName { set; get; }
        public virtual string PaymentTermsName { get; set; }
        //Iteration45[End]
        //P-SII-20241216.009,1 MMT 01/14/2025 Transaction creation date is incorrect[Start]
        public virtual DateTime CreationDate { set; get; }
        //P-SII-20241216.009,1 MMT 01/14/2025 Transaction creation date is incorrect[End]
        //I46[Start] 
        public List<ExtraDataAttrDto> ExtraDataAttributes { get; set; }
        // public List<ExtraDataAttrDto> Additional { get; set; }
        //I46[End]
    }

    //xx
    public enum TransactionPosition
    {
        Current,
        Previous,
        Next
    }
    //xx
    public class GetOrderDetailsForViewDto : CreateOrEditAppTransactionsDto
    {
        public decimal totalAmount { get; set; }
        public double totalQty { get; set; }
        public string Name { get; set; }
        public long OrderId { get; set; }
        public string OrderType { get; set; }

        public DateTime CreateDate { set; get; }
        public List<LookupLabelDto> Colors { set; get; }
        public List<LookupLabelDto> Sizes { set; get; }
        public List<DetailView> DetailsView { set; get; }

    }

    public class DataView
    {
        public string code { get; set; }
        public string ManufacturerCode { set; get; }
        public string name { get; set; }
        public double Qty { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }
        public string Image { get; set; }
        public long ParentId { get; set; }
        public long LineId { get; set; }

        public long ColorId { get; set; }
        public string ColorCode { get; set; }
        public long SizeId { get; set; }
        public string SizeCode { get; set; }
        public bool editQty { get; set; }
        public double NoOfPrePacks { get; set; }

        public double PrePackQty { get; set; }
        //1. parent has no variation
        //2. in size variation
        //3. in color variation(prepack)
        //=> Check product "By size" or "By prepack"
    }


    public class DetailView
    {
        public List<DetailView> Children { set; get; }
        public DataView Data { get; set; }
    }

    public class GetAllAppTransactionsForViewDto : GetAppTransactionsForViewDto
    {
        public DateTime CreationTime { get; set; }
        public string EntityObjectStatusCode { get; set; }
        public string SellerCode { get; set; }
        public string BuyerCode { get; set; }
        public decimal PaymentDiscount { set; get; }
        public int DiscountDays { set; get; }
        public int EomDays { set; get; }
        public bool Eom { set; get; }
        public int NetDueDays { set; get; }

    }

    public class ShoppingCartSummary
    {
        public long ShoppingCartId { get; set; }
        public string SellerLogo { get; set; }
        public string BuyerLogo { get; set; }

        public string SellerSSIN { get; set; }
        public string BuyerSSIN { get; set; }

        public long SellerId { get; set; }
        public long BuyerId { get; set; }

        public double Qty { get; set; }
        public decimal Amount { get; set; }

        public ValidateTransaction ValidateOrder { get; set; }
        public TransactionType OrderType { get; set; }
        public string CurrencyCode { set; get; }
        public string BuyerName { set; get; }
        public string SellerName { set; get; }

    }

    public enum ValidateTransaction
    {
        FoundShoppingCart,
        FoundInAnotherTransaction,
        NotFound,
        FoundShoppingCartForTemp,
        NotFoundShoppingCartForTemp
    }
    public class AccountBranchDto : EntityDto<long>
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public long? ParentId { get; set; }
        public int SubTotal { get; set; }
        public string SSIN { set; get; }
    }
    public enum ContactRoleEnum
    {
        Seller,
        Buyer,
        SalesRep1,
        SalesRep2,
        APContact,
        ARContact,
        ShipToContact,
        ShipFromContact,
        Creator,
        BuyingOffice
    }
    public class ContactAddressDto : AppAddressDto
    {
        public bool IsSelected { get; set; }
    }
    public class ContactInformationOutputDto
    {
        public long Id { set; get; }
        public string Email { set; get; }
        public string Name { set; get; }
        public long UserId { set; get; }
        public Guid? UserImage { set; get; }
        public string UserName { set; get; }
        public int TenantId { set; get; }
        public string TenantName { set; get; }
        public bool CanBeRemoved { set; get; } = true;
        public string Code { set; get; }
    }
    public class SharingTransactionOptions
    {
        public virtual long TransactionId { get; set; }

        public virtual string Message { get; set; }
        public virtual string Subject { get; set; }

        public IList<TransactionSharingDto> TransactionSharing { get; set; }

    }
    public class ShareTransactionByMessageResultDto
    {
        public bool Result { get; set; }
        public List<TenantTransactionInfo> TenantTransactionInfos { set; get; }
    }
    public class TenantTransactionInfo
    {
        public long TenantId { set; get; }
        public long TransactionId { set; get; }
        public string Code { set; get; }
        public string TransactionType { set; get; }
    }
    public class SharingTransactionEmail
    {
        public virtual long TransactionId { get; set; }

        public virtual string Message { get; set; }
        public virtual string Subject { get; set; }

        public IList<string> EmailAddresses { get; set; }
        public virtual bool IsBodyHtml { set; get; }

    }
    public class TransactionSharingDto : EntityDto<long>
    {

        public virtual long? SharedTenantId { get; set; }

        public virtual long? SharedUserId { get; set; }

        public virtual string SharedUserEMail { get; set; }

        public virtual string SharedUserName { get; set; }

        public virtual string SharedUserSureName { get; set; }

        public virtual string SharedUserTenantName { get; set; }
        public virtual string ContactSSIN { get; set; }
        public virtual string CompanySSIN { get; set; }

    }
    public class GetAppTransactionAttributesInput : PagedAndSortedResultRequestDto
    {

    }
    public class GetAppTransactionAttributesWithPagingInput : GetAppTransactionAttributesInput
    {
        public long TransactionId { get; set; }
    }
    //I45[start]
    public class TransactionDetailView
    {
        public TransactionType TransactionType { set; get; }
        public string TransactionNumber { get; set; }
        public string code { get; set; }
        public string ManufacturerCode { set; get; }
        public string name { get; set; }
        public double Qty { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }
        public string Image { get; set; }
        public long ParentId { get; set; }
        public int LineNo { get; set; }

    }
    //I45[end]
    //MMT-OC
    public class TenantContactRole
    {
        public string ContactRole { set; get; }
        public string ContactName { set; get; }
    }
    //MMT-OC
    //I49-ChReq[Start]
    public class ContactInfoDto
    { 
        public string ContactSSIN { set; get; }
        public string CompanySSIN { set; get; }
        public string UserName { set; get; }
        public long TenantId { set; get; }
    }
    //I49-ChReq[End]
}
