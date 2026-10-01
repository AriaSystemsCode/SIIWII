using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards.Dtos
{
    public class GetDashboardForViewDto
    {
        public virtual long Id { get; set; }
        public virtual string Title { get; set; }
        public virtual string CreatorName { get; set; }
        public virtual DateTime? LastModificationDate { get; set; }
        public virtual DateTime? LastViewDate { get; set; }
        public virtual List<onetouch.AppEntities.Dtos.UserInformationDto> SharedWithUsers { get; set; }
    }
    public class GetAllDashboardsInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public int SharingLevel { get; set; } = 0;
    }
    public class CreateOrEditDashboard
    {
        public virtual long Id { get; set; }
        public virtual string Title { get; set; }
        public virtual string Description{ get; set; }

    }


}
