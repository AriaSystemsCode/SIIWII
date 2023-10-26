using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using onetouch.AppEntities;
using System.ComponentModel.DataAnnotations.Schema;
using onetouch.AppContacts;
using onetouch.AppItems;
using System.ComponentModel.DataAnnotations;
using onetouch.SystemObjects;
using Abp.Auditing;
using Microsoft.AspNetCore.Components.Web.Virtualization;

namespace onetouch.AppSiiwiiTransaction
{
    [Table("AppActiveTransaction")]
    [Audited]
    public class AppActiveTransaction : FullAuditedEntity<long>, IMustHaveTenant
    {
        public virtual long TransactionId { set; get; }
        public int TenantId { get; set; }

    }
}
