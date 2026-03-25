using onetouch.AppEntities.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards.Dtos
{
    public class GetDashboardCardForViewDto:AppEntityDto
    {
        public virtual string EntityType { get; set; }
        public virtual string Filter { get; set; }
        public virtual decimal Height { get; set; }
        public virtual decimal Width { get; set; }
        public virtual long XPosition { get; set; }
        public virtual long YPosition { get; set; }
    }
}
