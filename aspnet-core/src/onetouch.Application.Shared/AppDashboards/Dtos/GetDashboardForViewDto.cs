using onetouch.AppEntities.Dtos;
using onetouch.AppItems.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace onetouch.AppDashboards.Dtos
{
    public class GetDashboardForViewDto
    {
       public long Id { get; set; }
       public string Name { get; set; }
       public bool IsTemplate { get; set; }
       public string CreatorUserName { set; get; }
       public long CreatorUserId { set; get; }
       public DateTime LastUpdatedDate { set; get; }
       public DateTime ViewDate { set; get; }
       public Guid CreatorUserProfilePictureId { get; set; }
       public List<AppEntitySharingDto> AppEntitySharings { get; set; }
       public List<GetDashboardCardForViewDto> AppDashboardCards{ get; set; }
    }
}
