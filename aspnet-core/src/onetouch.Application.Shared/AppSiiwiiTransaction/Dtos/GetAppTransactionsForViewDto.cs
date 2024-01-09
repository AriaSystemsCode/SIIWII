using Abp;
using Abp.Application.Services.Dto;
using Castle.MicroKernel.Registration;
using Newtonsoft.Json.Linq;
using onetouch.AppContacts;
using onetouch.AppEntities.Dtos;
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
    public class GetAppTransactionsForViewDto:CreateOrEditAppTransactionsDto
    {
        public virtual bool LastRecord { set; get; } = false;
        public virtual bool FirstRecord { set; get; } = false;
        public virtual DateTime EnteredDate { set; get; }
        public long CreatorUserId { set; get; }
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
        public  string ManufacturerCode { set; get; }
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


    public class DetailView {
        public List<DetailView> Children { set; get; }
        public DataView Data {get; set;}
    }

    public class GetAllAppTransactionsForViewDto : GetAppTransactionsForViewDto
    {
        public DateTime CreationTime { get; set; }
        public string EntityObjectStatusCode { get; set;}
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
        public string BuyerLogo { get; set;}

        public string SellerSSIN { get; set; }
        public string BuyerSSIN { get; set; }

        public long SellerId { get; set; }
        public long BuyerId { get; set; }

        public double Qty  { get; set; }
        public decimal Amount { get; set; }

        public ValidateTransaction ValidateOrder { get; set; }
        public TransactionType OrderType { get; set; }
        public string CurrencyCode { set; get; }

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
        Creator
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
       public long UserId{ set; get; }
        public Guid? UserImage { set; get; }
    }
}
