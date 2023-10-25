using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using onetouch.AppEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace onetouch.AppItems
{

    [Table("AppSizeScalesDetail")]
    [Audited]
    public  class AppSizeScalesDetail : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        public long SizeScaleId { get; set; }
        public virtual string SizeCode { get; set; }
        public virtual int SizeRatio { get; set; }
        public virtual string D1Position { get; set; }
        public virtual string D2Position { get; set; }
        public virtual string D3Position { get; set; }
        public virtual long? SizeId { get; set; }
        public virtual string DimensionName { get; set; }
        [ForeignKey("SizeId")]
        public virtual AppEntity SizeFk { get; set; }
        [ForeignKey("SizeScaleId")]
        public virtual AppSizeScalesHeader AppSizeScalesHeaderFk { get; set; }
    }
}
