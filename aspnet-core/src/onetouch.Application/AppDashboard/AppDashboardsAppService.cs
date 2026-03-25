using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using MimeKit.Cryptography;
using onetouch.Accounts.Dtos;
using onetouch.AppContacts;
using onetouch.AppDashboards;
using onetouch.AppDashboards.Dtos;
using onetouch.AppEntities;
using onetouch.Attachments;
using onetouch.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore.Repositories;
using Microsoft.EntityFrameworkCore;
using Abp.Linq.Extensions;
using System.Linq.Dynamic.Core;
using onetouch.AccountInfos.Dtos;
using onetouch.Helpers;
using DocumentFormat.OpenXml.Vml.Office;
namespace onetouch.AppDashboard
{
    [AbpAuthorize(AppPermissions.Pages_Dashboards)]
    public class AppDashboardsAppService : onetouchAppServiceBase, IAppDashboardsAppService
    {
        private readonly IRepository<AppDashboard, long> _appDashboardRepository;
        private readonly IRepository<AppEntitySharings, long> _appEntitySharingRepository;
        private readonly Helper _helper;
        public AppDashboardsAppService(IRepository<AppDashboard, long> appDashboardRepository,
            IRepository<AppEntitySharings, long> appEntitySharingRepository, Helper helper)
        {
            _helper = helper;
            _appEntitySharingRepository = appEntitySharingRepository;
            _appDashboardRepository = appDashboardRepository;

        }
        public Task DeleteDashboard(EntityDto<long> input)
        {
            throw new NotImplementedException();
        }

        public async Task<PagedResultDto<GetDashboardForViewDto>> GetAll(GetAllDashboardsInput input)
        {
            var dashboard = _appDashboardRepository.GetAll().Include(z=>z.EntityExtraData).Where(z => z.TenantId == AbpSession.TenantId &&
            (z.CreatorUserId == AbpSession.UserId || _appEntitySharingRepository.GetAll().Where(x => x.EntityId == z.Id && x.SharedUserId == AbpSession.UserId).Count() > 0))
                .WhereIf(!string.IsNullOrEmpty(input.Name),x=>x.Name.ToUpper().Contains(input.Name.ToUpper()));

            var pagedAndFilteredDashboards = dashboard
                   .OrderBy(input.Sorting ?? "id asc")
                   .PageBy(input);
            var dashboradQuery = from dash in pagedAndFilteredDashboards
                                 select new GetDashboardForViewDto()
                                 {
                                     Id = dash.Id,
                                     Name =dash.Name,
                                 };


            var dashboardsList = await dashboradQuery.ToListAsync();
            var totalCount = await dashboard.CountAsync();
            
            var x = new PagedResultDto<GetDashboardForViewDto>(
                        totalCount,
                        dashboardsList
                    );

            return x;
        }
        
        [AbpAuthorize(AppPermissions.Pages_Dashboards_Create), AbpAuthorize(AppPermissions.Pages_Dashboards_Edit)]
        public async Task<GetDashboardForViewDto> CreateOrEditDashboard(CreateOrEditDashboardInfoDto input)
        {
            if (input.Id == 0)
            {
                AppDashboard dashboard = new AppDashboard();
                dashboard.Name= input.Name;
                dashboard.IsTemplate= input.IsTemplate;
                dashboard.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboardId();
                dashboard.ObjectId =await  _helper.SystemTables.GetObjectDashboardId();
                dashboard.Code = await _helper.SystemTables.GetNextSequence("DASHBOARD");
                dashboard.TenantId = AbpSession.TenantId;
                var savedId = await _appDashboardRepository.InsertAndGetIdAsync(dashboard);
                //return await GetDashboardForView(savedId);
            }
            return new GetDashboardForViewDto();
        }
        public Task<GetDashboardForViewDto> GetDashboardForEdit(EntityDto<long> input)
        {
            throw new NotImplementedException();
        }

        public Task<GetDashboardForViewDto> GetDashboardForView(long id, int resultCount)
        {
            throw new NotImplementedException();
        }
    }
}
