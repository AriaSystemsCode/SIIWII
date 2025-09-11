using Abp.Auditing;
using Abp.Configuration;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppMarketplaceAccountsPriceLevels
{
    [Table("AppMarketplaceAccountsPriceLevels")]
    [Audited]
    public class AppMarketplaceAccountsPriceLevels : FullAuditedEntity<long>
    {
        public string  AccountSSIN {set; get; }
        public string ConnectedAccountSSIN {set; get; }
        public string PriceLevel{ set; get; }

    }
}
