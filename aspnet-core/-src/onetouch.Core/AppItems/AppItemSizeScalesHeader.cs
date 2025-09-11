using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppItems
{
    [Table("AppItemSizeScalesHeader")]
    [Audited]
    public class AppItemSizeScalesHeader : FullAuditedEntity<long>, IMayHaveTenant
    {
        public virtual string SizeScaleCode { get; set; }
        public virtual int NoOfDimensions { get; set; }
        public int? TenantId { get; set; }
        public long AppItemId { get; set; }
        public virtual string SizeScaleName { get; set; }
        public virtual long? SizeScaleId { get; set; }
        public virtual string? Name { get; set; }
        public virtual string Dimesion1Name { get; set; }
        public virtual string Dimesion2Name { get; set; }
        public virtual string Dimesion3Name { get; set; }
        public long? ParentId { get; set; }
        [ForeignKey("AppItemId")]
        public virtual AppItem AppItemFk { get; set; }
        [ForeignKey("SizeScaleId")]
        public virtual AppSizeScalesHeader SizeScaleFK { get; set; }
        [ForeignKey("ParentId")]
        public  AppItemSizeScalesHeader ItemSizeScaleFK { get; set; }
        public virtual ICollection<AppItemSizeScalesDetails> AppItemSizeScalesDetails { get; set; }
    }
}
