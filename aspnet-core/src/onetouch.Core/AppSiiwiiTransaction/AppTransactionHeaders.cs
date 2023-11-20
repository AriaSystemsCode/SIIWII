using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using onetouch.AppEntities;
using System.ComponentModel.DataAnnotations.Schema;
using onetouch.AppContacts;
using onetouch.AppItems;
using System.ComponentModel.DataAnnotations;
using onetouch.SystemObjects;
using Abp.Auditing;
using Microsoft.AspNetCore.Components.Web.Virtualization;

namespace onetouch.AppSiiwiiTransaction
{
    [Table("AppTransactionHeaders")]
    [Audited]
    public class AppTransactionHeaders : AppEntity
    {
        [StringLength(AppTransactionConst.MaxEnteredByUserRoleLength, MinimumLength = AppTransactionConst.MinEnteredByUserRoleLength)]
        public virtual string EnteredUserByRole { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string? BuyerCompanySSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string? BuyerContactSSIN { set; get; }
        //[StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        //public virtual string BuyerCompanyName { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string? SellerCompanySSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string? SellerContactSSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string? SellerContactName { set; get; }
        //[ForeignKey("SellerContactId")]
        //public virtual AppContact SellerContactFk { get; set; }
        //[ForeignKey("BuyerId")]
        //public virtual AppContact?  BuyerFk { get; set; }
        //[ForeignKey("BuyerContactId")]
        //public virtual AppContact BuyerContactFk { get; set; }
        //[ForeignKey("SellerId")]
        //public virtual AppContact? SellerFk { get; set; }

        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string BuyerContactEMailAddress { get; set; }

        public virtual long? LanguageId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string LanguageCode { get; set; }

        public virtual long? CurrencyId { get; set; }

        [StringLength(AppTransactionConst.MaxCodeLength, MinimumLength = AppTransactionConst.MinCodeLength)]
        public virtual string CurrencyCode { get; set; }
        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string SellerContactEMailAddress { get; set; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string BuyerContactPhoneNumber { get; set; }

        [ForeignKey("LanguageId")]
        public virtual AppEntity LanguageFk { get; set; }

        [ForeignKey("CurrencyId")]
        public virtual AppEntity CurrencyFk { get; set; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string SellerContactPhoneNumber { get; set; }

        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string BuyerCompanyName { get; set; }

        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string BuyerContactName { get; set; }

        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string SellerCompanyName { get; set; }
        public virtual string PriceLevel { get; set; }
        public virtual ICollection<AppTransactionDetails> AppTransactionDetails { get; set; }
        public virtual DateTime CompleteDate {set; get;}
        //Iteration#36,1 MMT 08/16/2023 Check out and manage placed orders [Start]
        public virtual DateTime StartDate { set; get; }
        public virtual DateTime AvailableDate { set; get; }
        public virtual long? ShipViaId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string ShipViaCode { get; set; }
        [ForeignKey("ShipViaId")]
        public virtual AppEntity ShipViaFk { get; set; }
        public virtual long? PaymentTermsId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string PaymentTermsCode { get; set; }
        [ForeignKey("PaymentTermsId")]
        public virtual AppEntity PaymentTermsFk { get; set; }
        [StringLength(AppTransactionConst.MaxBuyerDeptLength, MinimumLength = AppTransactionConst.MinBuyerDeptLength)]
        public virtual string BuyerDepartment { set; get; }
        public virtual string BuyerStore { set; get; }
        public virtual long TotalQuantity{ set; get; }
        public virtual double TotalAmount { set; get; }
        public virtual decimal CurrencyExchangeRate { get; set; }
        public virtual ICollection<AppTransactionContacts> AppTransactionContacts { get; set; }
        //Iteration#36,1 MMT 08/16/2023 Check out and manage placed orders [End]
    }
}
