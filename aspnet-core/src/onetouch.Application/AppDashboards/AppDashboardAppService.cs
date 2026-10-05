using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Authorization.Users;

//using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Abp.Linq.Extensions;
using DocumentFormat.OpenXml.Bibliography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Client;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NPOI.HPSF;
using onetouch.AccountInfos.Dtos;
using onetouch.Accounts.Dtos;
using onetouch.AppDashboards.Dtos;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.AppFields;
using onetouch.AppFields.Dto;
using onetouch.AppItems.Dtos;
using onetouch.Authorization;
using onetouch.Authorization.Users;
using onetouch.Configuration;
using onetouch.DashboardCustomization;
using onetouch.EntityFrameworkCore;
using onetouch.Helpers;
using onetouch.SycIdentifierDefinitions;
using onetouch.SystemObjects;
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
    
    [AbpAuthorize(AppPermissions.Pages_Dashboards)]
    public class AppDashboardAppService : onetouchAppServiceBase, IAppDashboardAppService
    {
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<SydObject, long> _sydObjectRepository;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IRepository<AppEntitySharings, long> _appEntitySharingRepository;
        private readonly Helper _helper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        private readonly IAppFieldManagerAppService _iAppFieldManagerAppService;
        public AppDashboardAppService(IRepository<AppEntity, long> appEntityRepository,
            Helper helper, IRepository<AppEntitySharings, long> appEntitySharingRepository,
            IAppEntitiesAppService appEntitiesAppService,
            IAppConfigurationAccessor appConfigurationAccessor,
            SycIdentifierDefinitionsAppService iAppSycIdentifierDefinitionsService,
            IAppFieldManagerAppService iAppFieldManagerAppService,
            IRepository<SydObject, long> sydObjectRepository)
        {
            _sydObjectRepository = sydObjectRepository;
            _appEntityRepository = appEntityRepository;
            _helper = helper;
            _appEntitySharingRepository = appEntitySharingRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _iAppSycIdentifierDefinitionsService = iAppSycIdentifierDefinitionsService;
            _iAppFieldManagerAppService = iAppFieldManagerAppService;
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
                            dashboard.SharingLevel = 1;
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
                            dashboard.SharingLevel = 2;
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
                            dashboard.SharingLevel = 1;
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
                            dashboard.SharingLevel = 2;
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
        [AbpAuthorize(AppPermissions.Pages_Dashboards_CreateOrEdit)]
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
        [AbpAuthorize(AppPermissions.Pages_Dashboards_Delete)]
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
        public async Task<List<SharingUserInfo>> GetTenantAllUser(long dashboardId)
        {
            List<SharingUserInfo> returnList = new List<SharingUserInfo>();
            var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
            var dashboardObj = await _appEntityRepository.GetAll()
                   .Where(z => z.EntityObjectTypeId == dashboardObjectTypeId
                     && z.Id == dashboardId).FirstOrDefaultAsync();
            if (dashboardObj != null)
            {
                var sharingList = await _appEntitySharingRepository.GetAll()
                .Where(z => z.EntityId == dashboardObj.Id &&
                z.SharedTenantId==AbpSession.TenantId).ToListAsync();
                
                var users = await UserManager.Users.Where(x => x.TenantId == AbpSession.TenantId).ToListAsync();
                foreach (var user in users)
                {

                    SharingUserInfo userToSharWith = new SharingUserInfo();
                    userToSharWith.UserId = user.Id;
                    UserInformationDto userToSharWithInfo = await _appEntitiesAppService.GetUserInformation(user.Id);

                    if (userToSharWithInfo != null)
                    {
                        userToSharWith.UserImage = userToSharWithInfo.UserImage;
                        userToSharWith.JobTitle = userToSharWithInfo.JobTitle;
                        userToSharWith.AccountName = userToSharWithInfo.AccountName;
                        userToSharWith.AccountId = userToSharWithInfo.AccountId;
                        userToSharWith.UserName = userToSharWithInfo.UserName;
                    }
                    if (string.IsNullOrEmpty(userToSharWith.UserName))
                    {
                        userToSharWith.UserName = user.FullName;
                    }
    
                    if (user.Id== dashboardObj.CreatorUserId)
                    {
                        userToSharWith.IsOwner = true;
                    }
                    if (sharingList != null && sharingList.Count() > 0)
                    {
                        if (sharingList.Count() == 1 &&
                            sharingList.FirstOrDefault(a=>a.SharedUserId==null)!=null)
                        {
                            var sharedWithAll = sharingList.FirstOrDefault(a => a.SharedUserId == null);
                            if (sharedWithAll != null) 
                            {
                                userToSharWith.CanView = true;
                                userToSharWith.CanEdit= sharedWithAll.CanEdit;

                            }

                        }
                        else {
                            var sharing = sharingList.Where(z => z.SharedUserId == user.Id).FirstOrDefault();
                            if (sharing != null)
                            {
                                userToSharWith.CanView = true;
                                userToSharWith.CanEdit = sharing.CanEdit ;
                            }
                        }
                    }
                    returnList.Add(userToSharWith);
                }

            }
            return returnList;
        }
        [AbpAuthorize(AppPermissions.Pages_Dashboards_Share)]
        public async Task ShareDashboard(ShareDashboardInfo ShareDashboardInfo)
        {
            var dashboardObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeDashboard();
            var dashboardObj = await _appEntityRepository.GetAll()
                   .Where(z => z.EntityObjectTypeId == dashboardObjectTypeId
                     && z.Id == ShareDashboardInfo.DashboardId).FirstOrDefaultAsync();
            if (dashboardObj != null)
            {
                if (ShareDashboardInfo.SharingLevel == 1)
                {
                    var sharingPublic = await _appEntitySharingRepository.GetAll()
                    .Where(z => z.EntityId == dashboardObj.Id &&
                    z.SharedTenantId == AbpSession.TenantId &&
                    z.SharedUserId == null).FirstOrDefaultAsync();
                    if (sharingPublic != null)
                    {
                        if (sharingPublic.CanEdit != ShareDashboardInfo.CanEdit)
                        {
                            sharingPublic.CanEdit = ShareDashboardInfo.CanEdit;
                            await _appEntitySharingRepository.UpdateAsync(sharingPublic);
                            await CurrentUnitOfWork.SaveChangesAsync();
                            var allUsersRecords = await _appEntitySharingRepository.GetAll()
                        .Where(z => z.EntityId == dashboardObj.Id &&
                        z.SharedTenantId == AbpSession.TenantId &&
                        z.SharedUserId != null &&
                        z.CanEdit != ShareDashboardInfo.CanEdit).ToListAsync();
                            if (allUsersRecords != null)
                            {
                                foreach (var user in allUsersRecords)
                                {
                                    user.CanEdit = ShareDashboardInfo.CanEdit;
                                    await _appEntitySharingRepository.UpdateAsync(user);
                                }
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }
                        }
                    }
                    else
                    {
                        //await _appEntitySharingRepository
                        //   .DeleteAsync(z=>z.EntityId== dashboardObj.Id && z.SharedUserId!=null);
                        var allUsersRecords = await _appEntitySharingRepository.GetAll()
                       .Where(z => z.EntityId == dashboardObj.Id &&
                       z.SharedTenantId == AbpSession.TenantId &&
                       z.SharedUserId != null &&
                       z.CanEdit != ShareDashboardInfo.CanEdit).ToListAsync();
                        if (allUsersRecords != null)
                        {
                            foreach (var user in allUsersRecords)
                            {
                                user.CanEdit = ShareDashboardInfo.CanEdit;
                                await _appEntitySharingRepository.UpdateAsync(user);
                            }
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                        await CurrentUnitOfWork.SaveChangesAsync();
                        sharingPublic = new AppEntitySharings();
                        sharingPublic.EntityId = dashboardObj.Id;
                        sharingPublic.CanEdit = ShareDashboardInfo.CanEdit;
                        sharingPublic.SharedTenantId = AbpSession.TenantId;
                        sharingPublic.SharedUserId = null;
                        await _appEntitySharingRepository.InsertAsync(sharingPublic);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                else
                {
                    if (ShareDashboardInfo.UsersList != null && 
                        ShareDashboardInfo.UsersList.Count > 0)
                    {
                        foreach (var user in ShareDashboardInfo.UsersList)
                        {
                            var userRecord = await _appEntitySharingRepository.GetAll()
                       .Where(z => z.EntityId == dashboardObj.Id &&
                       z.SharedTenantId == AbpSession.TenantId &&
                       z.SharedUserId == user.UserId).FirstOrDefaultAsync();
                            if (userRecord != null)
                            {
                                if (userRecord.CanEdit != user.CanEdit)
                                {
                                    userRecord.CanEdit = user.CanEdit;
                                    await _appEntitySharingRepository.UpdateAsync(userRecord);
                                }
                            }
                            else
                            {
                                AppEntitySharings sharingUser = new AppEntitySharings();
                                sharingUser.EntityId = dashboardObj.Id;
                                sharingUser.CanEdit = user.CanEdit;
                                sharingUser.SharedTenantId = AbpSession.TenantId;
                                sharingUser.SharedUserId = user.UserId;
                                await _appEntitySharingRepository.InsertAsync(sharingUser);
                            }
                            await CurrentUnitOfWork.SaveChangesAsync();

                        }
                    }

                }
            }

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
        public async Task<List<AppEntityExtraDataDto>> GetTableFieldsList(string tableName)
        {
            List<AppEntityExtraDataDto> returnList = new List<AppEntityExtraDataDto>();
            var sydobjct =await _sydObjectRepository.GetAll()
                .Where(z => z.Name == tableName).FirstOrDefaultAsync();
            if (sydobjct != null)
            {
                var fieldsList = await _iAppFieldManagerAppService.GetFields(new GetFieldsInput { 
                    SelectedObjectId= sydobjct.Id,AllFields= true
                    });
                if (fieldsList != null && fieldsList.TotalCount > 0)
                {
                    foreach (var field in fieldsList.Items)
                    {
                        AppEntityExtraDataDto fieldData = new AppEntityExtraDataDto();
                        fieldData.AttributeCode = field.FieldName;
                        fieldData.AttributeId= field.Id;
                        returnList.Add(fieldData);
                    }

                }
            }
            return  returnList ;
        }
        public async Task<onetouch.AppDashboards.Dtos.DynamicQueryResult> GetAllTableData(onetouch.AppDashboards.Dtos.DynamicQueryInput input)
        {
            DynamicQueryAppService dynamicQueryAppService = new DynamicQueryAppService(UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>());
            var returnResult = await dynamicQueryAppService.Query(input);
            return returnResult;
        }
        public async Task<List<string>> GetTablesList() 
        {
            List<string> returnList = new List<string>();
            var dataTree = await _iAppFieldManagerAppService.GetObjectTypeTree();
            if (dataTree != null && dataTree.Count() > 0)
            {
                foreach (var node in dataTree)
                {
                    var dataObjects = FindAllByNodeType(node, "DataObject");
                    if (dataObjects != null && dataObjects.Count > 0)
                    {
                        returnList.AddRange(dataObjects);
                    }
                }
            }
            return returnList;

        }
        public static List<string> FindAllByNodeType(
    ObjectTypeTreeNodeDto obj,
    string nodeType)
        {
            var results = new List<string>();

            if (obj == null)
                return results;

            if (obj.NodeType == nodeType)
                results.Add(obj.Name);

            foreach (var child in obj.Children)
            {
                results.AddRange(
                    FindAllByNodeType(child, nodeType));
            }

            return results;
        }
    }
}
