using Abp.Auditing;
using onetouch.AppEntities;
using onetouch.AppSiiwiiTransaction;
using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceTransactions
{
    [Table("AppMarketplaceTransactionHeaders")]
    [Audited]
    public class AppMarketplaceTransactionHeaders : AppEntity
    {
        [StringLength(AppTransactionConst.MaxEnteredByUserRoleLength, MinimumLength = AppTransactionConst.MinEnteredByUserRoleLength)]
        public virtual string EnteredUserByRole { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string? BuyerCompanySSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string? BuyerContactSSIN { set; get; }
 
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string? SellerCompanySSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string? SellerContactSSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string? SellerContactName { set; get; }
        

        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string BuyerContactEMailAddress { get; set; }

        //public virtual long? LanguageId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string LanguageCode { get; set; }

        //public virtual long? CurrencyId { get; set; }

        [StringLength(AppTransactionConst.MaxCodeLength, MinimumLength = AppTransactionConst.MinCodeLength)]
        public virtual string CurrencyCode { get; set; }
        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string SellerContactEMailAddress { get; set; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string BuyerContactPhoneNumber { get; set; }

        //[ForeignKey("LanguageId")]
        //public virtual AppEntity LanguageFk { get; set; }

       // [ForeignKey("CurrencyId")]
        //public virtual AppEntity CurrencyFk { get; set; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string SellerContactPhoneNumber { get; set; }

        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string BuyerCompanyName { get; set; }

        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string BuyerContactName { get; set; }

        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string SellerCompanyName { get; set; }
          public virtual ICollection<AppMarketplaceTransactionDetails> AppMarketplaceTransactionDetails { get; set; }
        public virtual DateTime CompleteDate { set; get; }
        //Iteration#36,1 MMT 08/16/2023 Check out and manage placed orders [Start]
        public virtual DateTime StartDate { set; get; }
        public virtual DateTime AvailableDate { set; get; }
        //public virtual long? ShipViaId { get; set; }
        //MMT - Iteration37[Start]
        public virtual string ShipViaName { set; get; }
        public virtual string PaymentTermsName { get; set; }
        //MMT - Iteration37[End]
        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string ShipViaCode { get; set; }
        //[ForeignKey("ShipViaId")]
       // public virtual AppEntity ShipViaFk { get; set; }
        //public virtual long? PaymentTermsId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string PaymentTermsCode { get; set; }
       // [ForeignKey("PaymentTermsId")]
        //public virtual AppEntity PaymentTermsFk { get; set; }
        [StringLength(AppTransactionConst.MaxBuyerDeptLength, MinimumLength = AppTransactionConst.MinBuyerDeptLength)]
        public virtual string BuyerDepartment { set; get; }
        public virtual string BuyerStore { set; get; }
        public virtual long TotalQuantity { set; get; }
        public virtual double TotalAmount { set; get; }
        public virtual decimal CurrencyExchangeRate { get; set; }
        public virtual ICollection<AppMarketplaceTransactionContacts> AppMarketplaceTransactionContacts { get; set; }
        //Iteration#36,1 MMT 08/16/2023 Check out and manage placed orders [End]
        //Iteration#42[Start]
        public virtual string? Reference { set; get; }
        public virtual DateTime EnteredDate { set; get; }
        //Iteration#42[End]
        //Iteration45[start]
        public virtual DateTime TimeStamp { get; set; }
        //Iteration45[End]

    }
}
