using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using onetouch.AppEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace onetouch.AppItems
{
    [Table("AppItemPrices")]
    [Audited]
    public class AppItemPrices : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        [StringLength(AppItemConsts.MaxCodeLength, MinimumLength = AppItemConsts.MinCodeLength)]
       // [Key, Column(Order = 1)]
        public virtual string Code { get; set; }
        public virtual decimal Price { get; set; }
       // [Key, Column(Order = 0)]
        public virtual long AppItemId { get; set; }
        public virtual string AppItemCode { get; set; }
        public virtual long? CurrencyId { get; set; }
       // [Key, Column(Order = 2)]
        public virtual string CurrencyCode { get; set; }

        [ForeignKey("CurrencyId")]
        public virtual AppEntity CurrencyFk { get; set; }
        [ForeignKey("AppItemId")]
        public virtual AppItem AppItemFk { get; set; }
        public virtual bool IsDefault { set; get; }
    }
}
