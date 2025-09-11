using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.AutotaskQueues
{
    [Table("AutotaskQueues")]
    public class AutotaskQueue : Entity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        public virtual long RefQueueID { get; set; }

        public virtual string Name { get; set; }

    }
}