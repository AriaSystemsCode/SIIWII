using onetouch.AppEntities.Dtos;
using onetouch.AppItems.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards.Dtos
{
    public class GetDashboardForViewDto
    {
       public long Id { get; set; }
       public string Name { get; set; }
       public bool IsTemplate { get; set; }

       public List<AppEntitySharingDto> AppEntitySharings { get; set; }
       public List<GetDashboardCardForViewDto> AppDashboardCards{ get; set; }
    }
}
