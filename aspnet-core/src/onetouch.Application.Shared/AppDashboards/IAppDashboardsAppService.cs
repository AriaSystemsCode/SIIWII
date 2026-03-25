using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AccountInfos.Dtos;
using onetouch.Accounts.Dtos;
using onetouch.AppContacts;
using onetouch.AppDashboards.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards
{
    public interface IAppDashboardsAppService : IApplicationService
    {
        Task<PagedResultDto<GetDashboardForViewDto>> GetAll(GetAllDashboardsInput input);
        
        Task<GetDashboardForViewDto> GetDashboardForView(long id, int resultCount);

        Task<GetDashboardForViewDto> GetDashboardForEdit(EntityDto<long> input);

        //Task<GetAccountInfoForEditOutput> CreateOrEditDashboard(CreateOrEditAccountInfoDto input);

        
        Task DeleteDashboard(EntityDto<long> input);

    }
}
