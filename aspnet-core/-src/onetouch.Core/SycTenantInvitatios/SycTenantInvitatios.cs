using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.TenantInvitations
{
    [Table("SycTenantInvitatios")]
    public class SycTenantInvitatios : Entity<long>
    {
        public virtual long TenantId { get; set; }

        public virtual long PartnerId { get; set; }

        public virtual DateTime CreateDate { get; set; }

    }
}