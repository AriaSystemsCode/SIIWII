using Abp.Auditing;
using onetouch.Configuration.Dto;

namespace onetouch.Configuration.Tenants.Dto
{
    public class TenantEmailSettingsEditDto : EmailSettingsEditDto
    {
        public bool UseHostDefaultEmailSettings { get; set; }
    }
}