using Abp.Auditing;
using onetouch.AppEntities;
using onetouch.AppMarketplaceItems;
using System;
using System.Collections.Generic;
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
        
        public virtual string EntityType { get; set; }
        public virtual string Filter { get; set; }
        //public virtual string XAxisField{ get; set; }
        //public virtual string XGroupByField { get; set; }
        //public virtual string YGroupByField { get; set; }
        //public virtual string SortByField { get; set; }
        //public virtual string YAxisField { get; set; }
        //public virtual string XTimeRange { get; set; }
        //public virtual string Aggregation { get; set; }
        //public virtual string AggregationField { get; set; }
        //public virtual string AggregationLabel { get; set; }
        public virtual decimal Height { get; set; }
        public virtual decimal Width{ get; set; }

        public virtual long XPosition{ get; set; }
        public virtual long YPosition { get; set; }
        //public virtual string XUnit{ get; set; }
        //public virtual string YUnit { get; set; }
        public virtual long AppDashboardId { get; set; }


        [ForeignKey("AppDashboardId")]
        public AppDashboard AppDashboardFk { get; set; }
    }
}
