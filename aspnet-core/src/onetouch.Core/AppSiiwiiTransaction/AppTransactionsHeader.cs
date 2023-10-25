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
    [Table("AppTransactionsHeader")]
    [Audited]
    public class AppTransactionsHeader : AppEntity
    {
        [StringLength(AppTransactionConst.MaxEnteredByUserRoleLength , MinimumLength = AppTransactionConst.MinEnteredByUserRoleLength)]
        public virtual string EnteredUserByRole { set; get; }
        public virtual long? BuyerId { set; get; }
        public virtual long? BuyerContactId { set; get; }
        [StringLength(AppTransactionConst.MaxBuyerNameLength , MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual  string BuyerName { set; get; }
        public long? SellerId { set; get; }
        public long? SellerContactId { set; get; }
        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string SellerName { set; get; }
        [ForeignKey("SellerContactId")]
        public virtual AppContact SellerContactFk { get; set; }
        [ForeignKey("BuyerId")]
        public virtual AppContact?  BuyerFk { get; set; }
        [ForeignKey("BuyerContactId")]
        public virtual AppContact BuyerContactFk { get; set; }
        [ForeignKey("SellerId")]
        public virtual AppContact? SellerFk { get; set; }

        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string BuyerEMailAddress { get; set; }

        public virtual long? LanguageId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string LanguageCode { get; set; }

        public virtual long? CurrencyId { get; set; }

        [StringLength(AppTransactionConst.MaxCodeLength, MinimumLength = AppTransactionConst.MinCodeLength)]
        public virtual string CurrencyCode { get; set; }
        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string SellerEMailAddress { get; set; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string BuyerPhoneNumber { get; set; }

        [ForeignKey("LanguageId")]
        public virtual AppEntity LanguageFk { get; set; }

        [ForeignKey("CurrencyId")]
        public virtual AppEntity CurrencyFk { get; set; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string SellerPhoneNumber { get; set; }

        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string BuyerCompanyName { get; set; }

        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string SellerCompanyName { get; set; }
        public virtual string PriceLevel { get; set; }
        public virtual ICollection<AppTransactionsDetail> AppTransactionsDetails { get; set; }

    }
}
