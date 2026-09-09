using Abp.Application.Services;
using onetouch.AppItems.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppItems
{
    public interface IAppUpdateItemSSINAppService : IApplicationService
    {
        public void UpdateSSIN();
        Task<FixSSINMissingVariationsResultDto> FixSSINMissingVariations(int? tenantId, bool currentTenant);
    }
}
