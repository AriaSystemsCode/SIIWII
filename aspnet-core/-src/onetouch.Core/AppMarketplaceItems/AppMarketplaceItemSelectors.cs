using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceItems
{
    [Table("AppMarketplaceItemSelectors")]
    public class AppMarketplaceItemSelectors : FullAuditedEntity<long>
    {
        public virtual Guid Key { get; set; }

        public virtual long SelectedId { get; set; }
    }
}
