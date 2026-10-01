using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppDashboards.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards
{
    public interface IAppDashboardAppService : IApplicationService
    {
        Task<PagedResultDto<GetDashboardForViewDto>> GetAll(GetAllDashboardsInput input);
        Task<bool> CreateOrEdit(CreateOrEditDashboard input);
    }
}
