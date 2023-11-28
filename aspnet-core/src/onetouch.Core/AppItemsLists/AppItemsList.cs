using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;
using System.Collections.Generic;
using onetouch.AppItems;

namespace onetouch.AppItemsLists
{
    [Table("AppItemsLists")]
    [Audited]
    public class AppItemsList : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        [Required]
        [StringLength(AppItemsListConsts.MaxCodeLength, MinimumLength = AppItemsListConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        public virtual string Name { get; set; }

        public virtual string Description { get; set; }

        public virtual byte SharingLevel { get; set; }

        public virtual long EntityId { get; set; }

        [ForeignKey("EntityId")]
        public AppEntity EntityFk { get; set; }

        public ICollection<AppItemsListDetail> AppItemsListDetails { get; set; }

        public ICollection<AppItemSharing> ItemSharingFkList { get; set; }

    }
}