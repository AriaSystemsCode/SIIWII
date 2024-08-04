using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using onetouch.AppSiiwiiTransaction;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using onetouch.SystemObjects;
using onetouch.AppEntities;

namespace onetouch.AppMarketplaceTransactions
{
    
    [Table("AppMarketplaceTransactionContacts")]
    [Audited]
    public class AppMarketplaceTransactionContacts : FullAuditedEntity<long>
    {
        public virtual long TransactionId { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string ContactSSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSellerNameLength, MinimumLength = AppTransactionConst.MinSellerNameLength)]
        public virtual string ContactName { set; get; }
        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string CompanyName { set; get; }
        [StringLength(AppTransactionConst.MaxEMailLength, MinimumLength = AppTransactionConst.MinEMailLength)]
        public virtual string ContactEmail { set; get; }
        [StringLength(AppTransactionConst.MaxPhoneNumberLength, MinimumLength = AppTransactionConst.MinPhoneNumberLength)]
        public virtual string ContactPhoneNumber { set; get; }
        public virtual string ContactRole { set; get; }
        [StringLength(AppTransactionConst.MaxBuyerNameLength, MinimumLength = AppTransactionConst.MinBuyerNameLength)]
        public virtual string BranchName { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string CompanySSIN { set; get; }
        [StringLength(AppTransactionConst.MaxSSINLength, MinimumLength = AppTransactionConst.MinSSINLength)]
        public virtual string BranchSSIN { set; get; }
        [StringLength(AppContactConsts.MaxNameLength, MinimumLength = AppContactConsts.MinNameLength)]
        public virtual string ContactPhoneTypeName { get; set; }
        public virtual long? ContactPhoneTypeId { get; set; }
        [ForeignKey("ContactPhoneTypeId")]
        public virtual AppEntity ContactPhoneTypeFk { get; set; }
        //public virtual long? ContactAddressId { set; get; }
        //[ForeignKey("ContactAddressId")]
        //public virtual AppAddress ContactAddressFk { get; set; }
        [ForeignKey("TransactionId")]
        public virtual AppMarketplaceTransactionHeaders TransactionIdFK { set; get; }
        [StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
        public virtual string ContactAddressCode { set; get; }
        [StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
        public virtual string ContactAddressName { get; set; }

        [StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
        public virtual string ContactAddressLine1 { get; set; }

       // [StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
        public virtual string ContactAddressLine2 { get; set; }

        [StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
        public virtual string ContactAddressCity { get; set; }

        [StringLength(AppAddressConsts.MaxStateLength, MinimumLength = AppAddressConsts.MinStateLength)]
        public virtual string ContactAddressState { get; set; }

        [StringLength(AppAddressConsts.MaxStateLength, MinimumLength = AppAddressConsts.MinStateLength)]
        public virtual string ContactAddressPostalCode { get; set; }

        //public virtual long? ContactAddressCountryId { get; set; }

        [StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
        public virtual string ContactAddressCountryCode { get; set; }

        //[ForeignKey("ContactAddressCountryId")]
        //public virtual AppEntity ContactAddressCountryFk { get; set; }

    }
}
