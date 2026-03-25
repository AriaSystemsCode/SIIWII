using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards.Dtos
{
    public class CreateOrEditDashboardInfoDto
    {
        public string Name { get; set; }
        public bool IsTemplate { get; set; }
        public long Id;
    }
}
