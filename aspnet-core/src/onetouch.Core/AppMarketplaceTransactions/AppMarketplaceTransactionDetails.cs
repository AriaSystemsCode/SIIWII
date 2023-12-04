using Abp.Auditing;
using onetouch.AppEntities;
using onetouch.AppItems;
using onetouch.AppSiiwiiTransaction;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceTransactions
{
    [Table("AppMarketplaceTransactionDetails")]
    [Audited]
    public class AppMarketplaceTransactionDetails : AppEntity
    {
        public virtual long TransactionId { set; get; }
        [ForeignKey("TransactionId")]
        public virtual AppMarketplaceTransactionHeaders TransactionIdFk { get; set; }

        [StringLength(AppTransactionConst.MaxItemCodeLength, MinimumLength = AppTransactionConst.MinItemCodeLength)]
        public string TransactionCode { get; set; }

        public virtual int LineNo { set; get; }
        public virtual double Quantity { set; get; }
        [Column(TypeName = "decimal(15, 3)")]
        public virtual decimal GrossPrice { set; get; }
        [Column(TypeName = "decimal(15, 3)")]
        public virtual decimal NetPrice { set; get; }
        [Column(TypeName = "decimal(8, 3)")]
        public virtual decimal Discount { set; get; }
        [Column(TypeName = "decimal(17, 3)")]
        public virtual decimal Amount { set; get; }
        public virtual string ItemCode { set; get; }
        public virtual string ItemDescription { set; get; }

        public virtual string Note { set; get; }
        [StringLength(AppItemConsts.SSINLength, MinimumLength = AppItemConsts.SSINLength)]
        public virtual string ItemSSIN { get; set; }
        public virtual long? NoOfPrePacks { set; get; }
        public virtual long? ParentId { get; set; }
        [ForeignKey("ParentId")]
        public AppMarketplaceTransactionDetails ParentFk { get; set; }
        public ICollection<AppMarketplaceTransactionDetails> ParentFkList { get; set; }
    }
}
