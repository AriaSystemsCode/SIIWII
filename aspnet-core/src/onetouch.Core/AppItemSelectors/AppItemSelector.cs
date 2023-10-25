using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.AppItemSelectors
{
    [Table("AppItemSelectors")]
    public class AppItemSelector : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        public virtual Guid Key { get; set; }

        public virtual long SelectedId { get; set; }

    }
}