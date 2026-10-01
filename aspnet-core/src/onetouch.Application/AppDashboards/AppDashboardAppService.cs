using Abp.Application.Services.Dto;
using Abp.Authorization.Users;

//using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Linq.Extensions;
using DocumentFormat.OpenXml.Bibliography;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using onetouch.AccountInfos.Dtos;
using onetouch.Accounts.Dtos;
using onetouch.AppDashboards.Dtos;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.Authorization.Users;
using onetouch.DashboardCustomization;
using onetouch.Helpers;
using onetouch.SycIdentifierDefinitions;
using Stripe;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppDashboards
{
    public class AppDashboardAppService : onetouchAppServiceBase, IAppDashboardAppService
    {
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        //private readonly IRepository<AbpUser<User>, long> _appUserRepository;
        private readonly IRepository<AppEntitySharings, long> _appEntitySharingRepository;
        private readonly Helper _helper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        public AppDashboardAppService(IRepository<AppEntity, long> appEntityRepository,
            Helper helper, IRepository<AppEntitySharings, long> appEntitySharingRepository,
            IAppEntitiesAppService appEntitiesAppService,
            //IRepository<AbpUser<User>, long> appUserRepository,
            SycIdentifierDefinitionsAppService iAppSycIdentifierDefinitionsService)
        {
            _appEntityRepository = appEntityRepository;
            _helper = helper;
            _appEntitySharingRepository = appEntitySharingRepository;
            _appEntitiesAppService = appEntitiesAppService;
            //_appUserRepository = appUserRepository;
            _iAppSycIdentifierDefinitionsService = iAppSycIdentifierDefinitionsService;
        }
        public async Task<PagedResultDto<GetDashboardForViewDto>> GetAll(GetAllDashboardsInput input)
        {
            var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();

            var filteredDashboard = _appEntityRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(input.Filter), a =>
                a.Name.ToUpper().Contains(input.Filter.ToUpper()))
                .Where(s => s.EntityObjectTypeId == dashboardObjectTypeId &&
                s.TenantId == AbpSession.TenantId &&
                (s.CreatorUserId == AbpSession.UserId ||
                _appEntitySharingRepository.GetAll().Count(z => z.EntityId == s.Id && z.SharedUserId == null) > 0 ||
                _appEntitySharingRepository.GetAll()
                .Count(z => z.EntityId == s.Id && z.SharedUserId == AbpSession.UserId) > 0));

            var pagedAndFilteredDashboards = filteredDashboard
                    //.OrderBy(input.Sorting ?? "name asc")
                    .PageBy(input);
            var _dashboards = from o in pagedAndFilteredDashboards
                              select new GetDashboardForViewDto
                              {
                                  Id = o.Id,
                                  Title = o.Name,
                                  LastModificationDate = o.LastModificationTime != null ?
                                  DateTime.Parse(o.LastModificationTime.ToString()) :
                                  null
                              };

            var dashboardsList = await _dashboards.ToListAsync();
            if (dashboardsList != null && dashboardsList.Count > 0)
            {

                var users =await UserManager.Users.Where(x => x.TenantId == AbpSession.TenantId).ToListAsync();
                    //await _appUserRepository.GetAll()
                    //.Where(z => z.TenantId == AbpSession.TenantId).ToListAsync();

                foreach (var dashboard in dashboardsList)
                {
                    var sharing  = await _appEntitySharingRepository.GetAll()
                .Where(z => z.EntityId == dashboard.Id &&
                z.SharedUserId == AbpSession.UserId).FirstOrDefaultAsync();
                    if (sharing != null)
                        dashboard.LastViewDate = sharing.LastViewDate;

                    var entitySharingList = await _appEntitySharingRepository.GetAll()
                        .Where(z => z.EntityId == dashboard.Id).ToListAsync();
                    if (entitySharingList != null && entitySharingList.Count > 0)
                    {
                        dashboard.SharedWithUsers = new List<onetouch.AppEntities.Dtos.UserInformationDto>();
                        if (entitySharingList.Count == 1 &&
                            entitySharingList.FirstOrDefault().SharedUserId == null)
                        {
                            foreach (var user in users)
                            {
                                dashboard.SharedWithUsers.
                                         Add(await _appEntitiesAppService.GetUserInformation(user.Id));

                            }
                        }
                        else
                        {
                            foreach (var user in entitySharingList)
                            {
                                if (user.SharedUserId != null)
                                {
                                    dashboard.SharedWithUsers.
                                        Add(await _appEntitiesAppService.GetUserInformation(long.Parse(user.SharedUserId.ToString())));
                                }
                            }
                        }
                    }

                }
            }
            var totalCount = await filteredDashboard.CountAsync();

            var x = new PagedResultDto<GetDashboardForViewDto>(
                        totalCount,
                        dashboardsList
                    );

            return x;
        }
        public async Task<bool> CreateOrEdit(CreateOrEditDashboard input)
        {
            if (input.Id == 0)
            {
                var dashboardObjectId = await _helper.SystemTables.GetObjectDashboardId();
                var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
                string sequance = await _helper.SystemTables.GetNextSequence("DASHBOARD");
                //string sequance = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("DASHBOARD", AbpSession.TenantId);
                AppEntityDto entity = new AppEntityDto();
                entity.ObjectId = dashboardObjectId;
                entity.Id = input.Id;
                entity.Code = sequance;
                entity.Name = input.Title;
                entity.Notes = input.Description;
                entity.TenantId = AbpSession.TenantId;
                entity.EntityObjectTypeId = dashboardObjectTypeId;
                var entityId = await _appEntitiesAppService.SaveEntity(entity);
                await CurrentUnitOfWork.SaveChangesAsync();
                await UpdateViewDate(entityId);

            }
            else
            {
                var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
                var dashboardObj = await _appEntityRepository.GetAll()
                    .Where(z => z.EntityObjectTypeId == dashboardObjectTypeId
                      && z.Id == input.Id).FirstOrDefaultAsync();
                if (dashboardObj != null)
                {
                    AppEntityDto entity = new AppEntityDto();
                    entity = ObjectMapper.Map<AppEntityDto>(dashboardObj);
                    entity.Name = input.Title;
                    entity.Notes = input.Description;
                    var entityId = await _appEntitiesAppService.SaveEntity(entity);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    await UpdateViewDate(entityId);
                }
            }
            return true;



        }
        public async Task UpdateViewDate(long dashboard)
        {
            
            var sharing = await _appEntitySharingRepository.GetAll().Where(z => z.SharedTenantId == AbpSession.TenantId
            && z.SharedUserId == AbpSession.UserId && z.EntityId == dashboard).FirstOrDefaultAsync();
            if (sharing != null)
            {
                sharing.LastViewDate = DateTime.Now;
                _appEntitySharingRepository.UpdateAsync(sharing);
            }
            else
            {
                var sharingAll = await _appEntitySharingRepository.GetAll().Where(z => z.SharedTenantId == AbpSession.TenantId
            && z.SharedUserId == null 
            && z.EntityId == dashboard).FirstOrDefaultAsync();
                var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
                var dashboardObj = await _appEntityRepository.GetAll()
                    .Where(z => z.EntityObjectTypeId == dashboardObjectTypeId
                      && z.Id == dashboard).FirstOrDefaultAsync();
                    
                sharing = new AppEntitySharings();
                sharing.SharedTenantId = AbpSession.TenantId;
                sharing.EntityId = dashboard;
                sharing.SharedUserId = AbpSession.UserId;
                sharing.LastViewDate = DateTime.Now;
                sharing.CanEdit = sharingAll != null ? sharingAll.CanEdit :
                    (dashboardObj != null && dashboardObj.CreatorUserId==AbpSession.UserId);
                await _appEntitySharingRepository.InsertAsync(sharing);
            }
            await CurrentUnitOfWork.SaveChangesAsync();
        }
        public async Task<bool> DeleteDashboard(long dashboard)
        {
            var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
            var dashboardObj = await _appEntityRepository.GetAll()
                   .Where(z => z.EntityObjectTypeId == dashboardObjectTypeId
                     && z.Id == dashboard).FirstOrDefaultAsync();
            if (dashboardObj != null)
            {
                if (dashboardObj.CreatorUserId == AbpSession.UserId)
                {
                    await _appEntitySharingRepository.DeleteAsync(z => z.EntityId == dashboard);
                    await _appEntityRepository.DeleteAsync(dashboardObj);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                else {
                    throw new Exception(L("DeleteDashboardbyOwner"));
                  
                }
            }
            return true;
        }
        //public async Task SaveSpreadSheetJson(long dashboardId, JObject spreadSheet)
        //{

        //    var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
        //    var dashboardObj = await _appEntityRepository.GetAll()
        //           .Where(z => z.EntityObjectTypeId == dashboardObjectTypeId
        //             && z.Id == dashboard).FirstOrDefaultAsync();
        //    if (dashboardObj != null) 
        //    {
        //        var folderPath = Path.Combine(
        //   AppDomain.CurrentDomain.BaseDirectory,
        //   "App_Data",
        //   "JsonFiles");

        //        Directory.CreateDirectory(folderPath);

        //        var filePath = Path.Combine(
        //            folderPath,
        //            "dashboard.json");

        //        var json = data.ToString(Formatting.Indented);

        //        await File.WriteAllTextAsync(
        //            filePath,
        //            json);
        //    }
        //}
    }
}
