using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards.Dtos
{
    public class GetAllDashboardsInput : PagedAndSortedResultRequestDto
    {
        public string Name { get; set; }
    }
}
