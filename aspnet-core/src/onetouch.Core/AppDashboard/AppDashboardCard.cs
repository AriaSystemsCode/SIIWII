using Abp.Auditing;
using onetouch.AppEntities;
using onetouch.AppMarketplaceItems;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboard
{

    [Table("AppDashboardCards")]
    [Audited]
    public class AppDashboardCard : AppEntity
    {
        [MaxLength(30)]
        public virtual string EntityType { get; set; }
        [MaxLength(250)]
        public virtual string Filter { get; set; }
        public virtual decimal Height { get; set; }
        public virtual decimal Width{ get; set; }

        public virtual long XPosition{ get; set; }
        public virtual long YPosition { get; set; }
        public virtual long AppDashboardId { get; set; }
        [ForeignKey("AppDashboardId")]
        public AppDashboard AppDashboardFk { get; set; }
    }
}
