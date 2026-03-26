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
using System.Security.Policy;
using onetouch.AppEntities.Dtos;
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
                                     Name = dash.Name,
                                     CreatorUserId = long.Parse(dash.CreatorUserId.ToString()),
                                     LastUpdatedDate = dash.LastModificationTime!=null?
                                     DateTime.Parse(dash.LastModificationTime.ToString()).Date: DateTime.Parse(dash.CreationTime.ToString()).Date,

                                 };

            

            var dashboardsList = await dashboradQuery.ToListAsync();
            var totalCount = await dashboard.CountAsync();
            if (dashboardsList != null && dashboardsList.Count() >0)
            {
                foreach (var dashb in dashboardsList)
                {
                    var creatorUser = UserManager.GetUserById(dashb.CreatorUserId);
                    if (creatorUser != null)
                    {
                        dashb.CreatorUserName = creatorUser.UserName;
                        var profilePictureId = creatorUser.ProfilePictureId;
                        if (profilePictureId != null)
                        { dashb.CreatorUserProfilePictureId = (Guid)profilePictureId; }
                    }
                    var sharingObj = await _appEntitySharingRepository.GetAll().Where(z => z.EntityId == dashb.Id && z.SharedUserId == AbpSession.UserId).FirstOrDefaultAsync();
                    if (sharingObj != null)
                        dashb.ViewDate = sharingObj.LastViewDate != null ? sharingObj.LastViewDate.Date : dashb.LastUpdatedDate.Date;
                    else
                        dashb.ViewDate = dashb.LastUpdatedDate;

                    var sharingObjs = await _appEntitySharingRepository.GetAll().Where(z => z.EntityId == dashb.Id && z.SharedUserId != AbpSession.UserId).ToListAsync();
                    if (sharingObjs!=null && sharingObjs.Count > 0)
                    {
                        dashb.AppEntitySharings = new List<AppEntitySharingDto>(); ;
                        foreach (var sh in sharingObjs)
                        {
                            AppEntitySharingDto share = new AppEntitySharingDto();
                            share.Id = sh.Id;
                            share.SharedUserId= sh.SharedUserId;
                            
                            var userObj= UserManager.GetUserById(long.Parse(sh.SharedUserId.ToString()));
                            if (userObj != null )
                            {
                                share.SharedUserName = userObj.FullName;
                                if (userObj.ProfilePictureId != null)
                                    share.UserProfilePictureId = userObj.ProfilePictureId;
                            }
                            dashb.AppEntitySharings.Add(share);
                        }
                    }
                }
            }
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
        public async Task<bool> UpdateViewDate(long dashboardId)
        {
            var sharingObj = await _appEntitySharingRepository.GetAll().Where(z => z.EntityId == dashboardId && z.SharedUserId == AbpSession.UserId).FirstOrDefaultAsync();
            if (sharingObj != null)
            {
                sharingObj.LastViewDate = DateTime.Now;
                _appEntitySharingRepository.UpdateAsync(sharingObj);
            }
            else
            {
                AppEntitySharings entitySharing = new AppEntitySharings();
                entitySharing.EntityId = dashboardId;
                entitySharing.SharedTenantId = AbpSession.TenantId;
                entitySharing.SharedUserId = AbpSession.UserId;
                entitySharing.LastViewDate = DateTime.Now;
                _appEntitySharingRepository.InsertAsync(sharingObj);

            }
            await UnitOfWorkManager.Current.SaveChangesAsync();
            return true;
        }
        public Task<GetDashboardForViewDto> GetDashboardForEdit(EntityDto<long> input)
        {
            throw new NotImplementedException();
        }

        public async Task<GetDashboardForViewDto> GetDashboardForView(long id, int resultCount)
        {
            await UpdateViewDate(id);
            throw new NotImplementedException();
        }
        public async Task<bool> ShareDashboard(long dashboardId, List<long> users)
        {
            foreach (var user in users)
            {
                var sharingObj = await _appEntitySharingRepository.GetAll().Where(z => z.EntityId == dashboardId && z.SharedUserId == user).FirstOrDefaultAsync();
                if (sharingObj == null)
                {
                    var userObj = UserManager.GetUserById(user);
                    AppEntitySharings entitySharing = new AppEntitySharings();
                    entitySharing.EntityId = dashboardId;
                    entitySharing.SharedUserId = user;
                    if (userObj != null)
                    { 
                      entitySharing.SharedTenantId = userObj.TenantId;
                      entitySharing.SharedUserEMail = userObj.EmailAddress;
                    }
                    _appEntitySharingRepository.InsertAsync(entitySharing);
                }
               
            }
            await UnitOfWorkManager.Current.SaveChangesAsync();
            return true;
        }
    }
}
