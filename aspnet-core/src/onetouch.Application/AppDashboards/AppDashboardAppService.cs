using Abp.Application.Services.Dto;
using Abp.Authorization.Users;

//using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Linq.Extensions;
using DocumentFormat.OpenXml.Bibliography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NPOI.HPSF;
using onetouch.AccountInfos.Dtos;
using onetouch.Accounts.Dtos;
using onetouch.AppDashboards.Dtos;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.Authorization.Users;
using onetouch.Configuration;
using onetouch.DashboardCustomization;
using onetouch.Helpers;
using onetouch.SycIdentifierDefinitions;
using Stripe;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.ApplicationInsights.MetricDimensionNames.TelemetryContext;

namespace onetouch.AppDashboards
{
    public class AppDashboardAppService : onetouchAppServiceBase, IAppDashboardAppService
    {
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IRepository<AppEntitySharings, long> _appEntitySharingRepository;
        private readonly Helper _helper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        public AppDashboardAppService(IRepository<AppEntity, long> appEntityRepository,
            Helper helper, IRepository<AppEntitySharings, long> appEntitySharingRepository,
            IAppEntitiesAppService appEntitiesAppService,
            IAppConfigurationAccessor appConfigurationAccessor,
            SycIdentifierDefinitionsAppService iAppSycIdentifierDefinitionsService)
        {
            _appEntityRepository = appEntityRepository;
            _helper = helper;
            _appEntitySharingRepository = appEntitySharingRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _iAppSycIdentifierDefinitionsService = iAppSycIdentifierDefinitionsService;
        }
        public async Task<PagedResultDto<GetDashboardForViewDto>> GetAll(GetAllDashboardsInput input)
        {
            var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
            var fileCategory = await _helper.SystemTables.GetAttachmentCategoryId("FILE");
            var filteredDashboard = _appEntityRepository.GetAll()
                .Include(x=>x.EntityAttachments).ThenInclude(x=>x.AttachmentFk)
                .WhereIf(!string.IsNullOrEmpty(input.Filter), a =>
                a.Name.ToUpper().Contains(input.Filter.ToUpper()))
                .Where(s => s.EntityObjectTypeId == dashboardObjectTypeId &&
                s.TenantId == AbpSession.TenantId)
                .WhereIf(input.SharingLevel== DashboardFilterType.All, s=>s.CreatorUserId == AbpSession.UserId ||
                _appEntitySharingRepository.GetAll().Count(z => z.EntityId == s.Id && z.SharedUserId == null) > 0 ||
                _appEntitySharingRepository.GetAll()
                .Count(z => z.EntityId == s.Id && z.SharedUserId == AbpSession.UserId) > 0)
                .WhereIf(input.SharingLevel == DashboardFilterType.MyDashboards, s => s.CreatorUserId == AbpSession.UserId)
                .WhereIf(input.SharingLevel == DashboardFilterType.SharedWithMe, s => s.CreatorUserId != AbpSession.UserId &&
                (_appEntitySharingRepository.GetAll().Count(z => z.EntityId == s.Id && z.SharedUserId == null) > 0 ||
                _appEntitySharingRepository.GetAll()
                .Count(z => z.EntityId == s.Id && z.SharedUserId == AbpSession.UserId) > 0));

            var pagedAndFilteredDashboards = filteredDashboard
                    //.OrderBy(input.Sorting ?? "name asc")
                    .PageBy(input);
            var _dashboards = from o in pagedAndFilteredDashboards
                              select new GetDashboardForViewDto
                              {
                                  CreatorUserId = long.Parse(o.CreatorUserId.ToString()),
                                  Id = o.Id,
                                  Title = o.Name,
                                  LastModificationDate = o.LastModificationTime != null ?
                                  DateTime.Parse(o.LastModificationTime.ToString()) :
                                  null,
                                  SpreadsheetFilePath =o.EntityAttachments
                                  .FirstOrDefault(z=>z.AttachmentCategoryId== fileCategory)!=null?
                                  _appConfiguration[$"Attachment:Path"] + @"\"
+ AbpSession.TenantId.ToString() + @"\" + o.EntityAttachments
                                  .FirstOrDefault(z => z.AttachmentCategoryId == fileCategory).AttachmentFk.Attachment:"",
                                  IsTheOwner = o.CreatorUserId == AbpSession.UserId,
                                  
                              };

            var dashboardsList = await _dashboards.ToListAsync();
            if (dashboardsList != null && dashboardsList.Count > 0)
            {

                var users =await UserManager.Users.Where(x => x.TenantId == AbpSession.TenantId).ToListAsync();
                    //await _appUserRepository.GetAll()
                    //.Where(z => z.TenantId == AbpSession.TenantId).ToListAsync();

                foreach (var dashboard in dashboardsList)
                {
                    var userCreator = await UserManager.GetUserByIdAsync(dashboard.CreatorUserId);
                    if (userCreator != null)
                        dashboard.CreatorUserName = userCreator.FullName;

                    if (!string.IsNullOrEmpty(dashboard.SpreadsheetFilePath) &&
                        System.IO.File.Exists(dashboard.SpreadsheetFilePath))
                    {
                        var json = await System.IO.File.ReadAllTextAsync(dashboard.SpreadsheetFilePath);

                        dashboard.Spreadsheet= JObject.Parse(json);
                    }
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
                            if (entitySharingList.FirstOrDefault().CanEdit == true)
                            {
                                dashboard.IsEditable = true;
                            }
                            foreach (var user in users)
                            {
                                if (user.Id== AbpSession.UserId)
                                {
                                    continue;
                                }
                                dashboard.SharedWithUsers.
                                         Add(await _appEntitiesAppService.GetUserInformation(user.Id));
                                
                            }
                        }
                        else
                        {
                            foreach (var user in entitySharingList)
                            {
                                if (user.SharedUserId == AbpSession.UserId)
                                {
                                    if (user.CanEdit == true) { 
                                        dashboard.IsEditable = true;
                                        continue;
                                    }
                                }

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
        public async Task<GetDashboardForViewDto> GetDashboardForView(long input)
        {
            GetDashboardForViewDto dashboard = new GetDashboardForViewDto();
            var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
            var fileCategory = await _helper.SystemTables.GetAttachmentCategoryId("FILE");
            var filteredDashboard = _appEntityRepository.GetAll()
                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
               .Where(s => s.EntityObjectTypeId == dashboardObjectTypeId &&
                s.TenantId == AbpSession.TenantId && s.Id == input);
                
            
            var _dashboard = from o in filteredDashboard
                              select new GetDashboardForViewDto
                              {
                                  CreatorUserId = long.Parse(o.CreatorUserId.ToString()),
                                  Id = o.Id,
                                  Title = o.Name,
                                  LastModificationDate = o.LastModificationTime != null ?
                                  DateTime.Parse(o.LastModificationTime.ToString()) :
                                  null,
                                  SpreadsheetFilePath = o.EntityAttachments
                                  .FirstOrDefault(z => z.AttachmentCategoryId == fileCategory) != null ?
                                  _appConfiguration[$"Attachment:Path"] + @"\"
+ AbpSession.TenantId.ToString() + @"\" + o.EntityAttachments
                                  .FirstOrDefault(z => z.AttachmentCategoryId == fileCategory).AttachmentFk.Attachment : "",
                                  IsTheOwner = o.CreatorUserId == AbpSession.UserId,

                              };

            dashboard = await _dashboard.FirstOrDefaultAsync();
            if (dashboard != null)
            {

                var users = await UserManager.Users.Where(x => x.TenantId == AbpSession.TenantId).ToListAsync();
                
                //foreach (var dashboard in dashboardsList)
                {
                    var userCreator = await UserManager.GetUserByIdAsync(dashboard.CreatorUserId);
                    if (userCreator != null)
                        dashboard.CreatorUserName = userCreator.FullName;

                    if (!string.IsNullOrEmpty(dashboard.SpreadsheetFilePath) &&
                        System.IO.File.Exists(dashboard.SpreadsheetFilePath))
                    {
                        var json = await System.IO.File.ReadAllTextAsync(dashboard.SpreadsheetFilePath);

                        dashboard.Spreadsheet = JObject.Parse(json);
                    }
                    var sharing = await _appEntitySharingRepository.GetAll()
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
                            if (entitySharingList.FirstOrDefault().CanEdit == true)
                            {
                                dashboard.IsEditable = true;
                            }
                            foreach (var user in users)
                            {
                                if (user.Id == AbpSession.UserId)
                                {
                                    continue;
                                }
                                dashboard.SharedWithUsers.
                                         Add(await _appEntitiesAppService.GetUserInformation(user.Id));

                            }
                        }
                        else
                        {
                            foreach (var user in entitySharingList)
                            {
                                if (user.SharedUserId == AbpSession.UserId)
                                {
                                    if (user.CanEdit == true)
                                    {
                                        dashboard.IsEditable = true;
                                        continue;
                                    }
                                }

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



            return dashboard;
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
        public async Task SaveSpreadSheetJson(long dashboardId, JObject spreadSheet)
        {

            var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
            var dashboardObj = await _appEntityRepository.GetAll()
                   .Where(z => z.EntityObjectTypeId == dashboardObjectTypeId
                     && z.Id == dashboardId).FirstOrDefaultAsync();
            if (dashboardObj != null)
            {
                var fileCategory =  await _helper.SystemTables.GetAttachmentCategoryId("FILE");
                var fileName = dashboardId.ToString()+".json";
                var filePath = _appConfiguration[$"Attachment:PathTemp"] + @"\"
+ AbpSession.TenantId.ToString() + @"\" + fileName;
                var json = spreadSheet.ToString(Formatting.Indented);

                await System.IO.File.WriteAllTextAsync(
                    filePath,
                    json);

                AppEntityDto dashboardEntity = new AppEntityDto();
                dashboardEntity = ObjectMapper.Map<AppEntityDto>(dashboardObj);
                dashboardEntity.EntityAttachments = new List<AppEntityAttachmentDto>();
                dashboardEntity.EntityAttachments.Add(new AppEntityAttachmentDto { 
                    FileName= fileName,
                    guid= null,
                    DisplayName= fileName,
                    Url= filePath,
                    AttachmentCategoryId= fileCategory
                });
                await _appEntitiesAppService.SaveEntity(dashboardEntity);
                

               
            }
        }
    }
}
