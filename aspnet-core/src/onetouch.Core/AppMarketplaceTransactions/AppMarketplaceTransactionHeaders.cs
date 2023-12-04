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
        public virtual long? LanguageId { get; set; }

        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string LanguageCode { get; set; }

        public virtual long? CurrencyId { get; set; }

        [StringLength(AppTransactionConst.MaxCodeLength, MinimumLength = AppTransactionConst.MinCodeLength)]
        public virtual string CurrencyCode { get; set; }

        [ForeignKey("LanguageId")]
        public virtual AppEntity LanguageFk { get; set; }

        [ForeignKey("CurrencyId")]
        public virtual AppEntity CurrencyFk { get; set; }
       
        public virtual string PriceLevel { get; set; }
        public virtual ICollection<AppMarketplaceTransactionDetails> AppTransactionDetails { get; set; }
        public virtual DateTime CompleteDate { set; get; }
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
        public virtual long TotalQuantity { set; get; }
        public virtual double TotalAmount { set; get; }
        public virtual decimal CurrencyExchangeRate { get; set; }
        public virtual ICollection<AppMarketplaceTransactionContacts> AppTransactionContacts { get; set; }
    }
}
