using Abp.Auditing;
using onetouch.AppEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboard
{

    [Table("AppDashboards")]
    [Audited]
    public class AppDashboard: AppEntity
    {
        public virtual bool IsTemplate{ get; set; }
        public virtual int SharingLevel{ get; set; }
    }
}
