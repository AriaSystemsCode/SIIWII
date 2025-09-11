using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.MultiTenancy.Dto
{
    public class TenantInfoDto
    {
        public int? TenantId { get; set; }

        public string TenancyName { get; set; }
    }
}
