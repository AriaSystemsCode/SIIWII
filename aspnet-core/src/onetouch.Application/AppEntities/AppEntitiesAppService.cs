using onetouch.SystemObjects;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AppEntities.Exporting;
using onetouch.AppEntities.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.AppContacts;
using onetouch.Helpers;
using onetouch.Attachments;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;
using onetouch.AppContacts.Dtos;
using Abp.Domain.Uow;
using onetouch.AppItems.Dtos;
using onetouch.AppPosts;
using onetouch.AppEntities.Dtos;
using onetouch.Authorization.Users.Profile;
using Abp.UI;
using onetouch.Notifications;
using onetouch.Sessions.Dto;
using onetouch.AppPosts.Dtos;
using onetouch.Build;
using Microsoft.AspNetCore.SignalR;
using onetouch.AppEvents;
using onetouch.AppSiiwiiTransaction.Dtos;
using onetouch.AppSiiwiiTransaction;
using onetouch.AppMarketplaceTransactions;
using Twilio.Rest.Api.V2010.Account;
using NPOI.Util;
using Abp.Domain.Entities;
using NPOI.SS.Formula.Functions;
using NPOI.HPSF;
using System.IO;

namespace onetouch.AppEntities
{
    [AbpAuthorize(AppPermissions.Pages_AppEntities)]
    public class AppEntitiesAppService : onetouchAppServiceBase, IAppEntitiesAppService
    {
        private readonly IRepository<SycEntityObjectStatus, long> _lookup_sycEntityObjectStatusRepository;
        private readonly IRepository<AppEntitiesRelationship, long> _appEntitiesRelationshipRepository;
        private readonly IRepository<SycEntityObjectType, long> _lookup_sycEntityObjectTypeRepository;
        private readonly IRepository<AppEntityClassification, long> _appEntityClassificationRepository;
        private readonly IRepository<AppEntityAttachment, long> _appEntityAttachmentRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppEntityCategory, long> _appEntityCategoryRepository;
        private readonly IRepository<AppEntityAddress, long> _appEntityAddressRepository;
        private readonly IRepository<AppAttachment, long> _appAttachmentRepository;
        private readonly IRepository<SydObject, long> _lookup_sydObjectRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IAppEntitiesExcelExporter _appEntitiesExcelExporter;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IProfileAppService _iProfileAppService;
        private readonly IRepository<AppEntityState, long> _appEntityStateRepository;
        private readonly Helper _helper;
        
        //MMT
        private readonly IRepository<AppEntityReactionsCount, long> _appEntityReactionsCount;
        private readonly IRepository<AppEntityUserReactions, long> _appEntityUserReactions;
        private readonly IRepository<AppPost, long> _appPostRepository;
        //MMT
        //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
        private readonly IAppNotifier _appNotifier;
        private readonly IRepository<AppMarketplaceTransactionContacts, long> _appMarketplaceTransactionContactsRepository;
        private readonly IRepository<AppTransactionContacts, long> _appTransactionContactsRepository;
        //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]

        public AppEntitiesAppService(IRepository<AppEntity, long> appEntityRepository
            , IAppEntitiesExcelExporter appEntitiesExcelExporter
            , IRepository<SycEntityObjectType, long> lookup_sycEntityObjectTypeRepository
            , IRepository<SycEntityObjectStatus, long> lookup_sycEntityObjectStatusRepository
            , IRepository<SydObject, long> lookup_sydObjectRepository, Helper helper
            , IRepository<AppEntityCategory, long> appEntityCategoryRepository
            , IRepository<AppEntityClassification, long> appEntityClassificationRepository
            , IRepository<AppEntityAttachment, long> appEntityAttachmentRepository
            , IRepository<AppAttachment, long> appAttachmentRepository
            , IRepository<AppAddress, long> appAddressRepository
            , IRepository<AppContactAddress, long> appContactAddressRepository
            , IAppConfigurationAccessor appConfigurationAccessor
            , IRepository<AppContact, long> lookup_appContactRepository
            , IRepository<AppEntityExtraData, long> appEntityExtraDataRepository
            , IRepository<AppEntityAddress, long> appEntityAddressRepository
            , IRepository<AppEntitiesRelationship, long> appEntitiesRelationshipRepository,
            IRepository<AppEntityReactionsCount, long> appEntityReactionsCount,
            IRepository<AppEntityUserReactions, long> appEntityUserReactions,
            IRepository<AppPost, long> appPostRepository, IProfileAppService iProfileAppService, IAppNotifier appNotifier
            , IRepository<AppEntityState, long> appEntityStateRepository, IRepository<AppMarketplaceTransactionContacts, long> appMarketplaceTransactionContactsRepository
            , IRepository<AppTransactionContacts, long> appTransactionContactsRepository
            )
        {
             
            _iProfileAppService = iProfileAppService;
            _appEntityRepository = appEntityRepository;
            _appEntityAddressRepository = appEntityAddressRepository;
            _appEntitiesExcelExporter = appEntitiesExcelExporter;
            _lookup_sycEntityObjectTypeRepository = lookup_sycEntityObjectTypeRepository;
            _lookup_sycEntityObjectStatusRepository = lookup_sycEntityObjectStatusRepository;
            _lookup_sydObjectRepository = lookup_sydObjectRepository;
            _helper = helper;
            _appEntityUserReactions = appEntityUserReactions;
            _appEntityReactionsCount = appEntityReactionsCount;
            _appPostRepository = appPostRepository;
            _appEntityStateRepository = appEntityStateRepository;
            _appEntityCategoryRepository = appEntityCategoryRepository;
            _appEntityClassificationRepository = appEntityClassificationRepository;
            _appEntityAttachmentRepository = appEntityAttachmentRepository;
            _appAttachmentRepository = appAttachmentRepository;
            //_appAddressRepository = appAddressRepository;
            //_appContactAddressRepository = appContactAddressRepository;
            _appEntitiesRelationshipRepository = appEntitiesRelationshipRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appContactRepository = lookup_appContactRepository;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
            _appNotifier = appNotifier;
            _appMarketplaceTransactionContactsRepository = appMarketplaceTransactionContactsRepository;
            _appTransactionContactsRepository = appTransactionContactsRepository;
            //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]
        }

        public async Task<PagedResultDto<GetAppEntityForViewDto>> GetAll(GetAllAppEntitiesInput input)
        {

            var filteredAppEntities = _appEntityRepository.GetAll()
                        .Include(e => e.EntityObjectTypeFk)
                        .Include(e => e.EntityObjectStatusFk)
                        .Include(e => e.ObjectFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Notes == input.DescriptionFilter)
                        //.WhereIf(!string.IsNullOrWhiteSpace(input.ExtraDataFilter), e => e.ExtraData == input.ExtraDataFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectTypeNameFilter), e => e.EntityObjectTypeFk != null && e.EntityObjectTypeFk.Name == input.SycEntityObjectTypeNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectStatusNameFilter), e => e.EntityObjectStatusFk != null && e.EntityObjectStatusFk.Name == input.SycEntityObjectStatusNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                        .Where(x => x.EntityObjectTypeId == input.EntityObjectTypeId)
                        .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null)
                        ;

            var pagedAndFilteredAppEntities = filteredAppEntities
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appEntities = from o in pagedAndFilteredAppEntities
                              join o1 in _lookup_sycEntityObjectTypeRepository.GetAll() on o.EntityObjectTypeId equals o1.Id into j1
                              from s1 in j1.DefaultIfEmpty()

                              join o2 in _lookup_sycEntityObjectStatusRepository.GetAll() on o.EntityObjectStatusId equals o2.Id into j2
                              from s2 in j2.DefaultIfEmpty()

                              join o3 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o3.Id into j3
                              from s3 in j3.DefaultIfEmpty()

                              select new GetAppEntityForViewDto()
                              {
                                  AppEntity = new AppEntityDto
                                  {
                                      Name = o.Name,
                                      Code = o.Code,
                                      Notes = o.Notes,
                                      //ExtraData = o.ExtraData,
                                      Id = o.Id,
                                      IsHostRecord = o.TenantId == null
                                  },
                                  SycEntityObjectTypeName = s1 == null ? "" : s1.Name.ToString(),
                                  SycEntityObjectStatusName = s2 == null ? "" : s2.Name.ToString(),
                                  SydObjectName = s3 == null ? "" : s3.Name.ToString(),
                                  IsManual = s1.TenantId != null
                              };

            var totalCount = await filteredAppEntities.CountAsync();

            return new PagedResultDto<GetAppEntityForViewDto>(
                totalCount,
                await appEntities.ToListAsync()
            );
        }

        public bool checkArray(long[] ids, string names)
        {
            return false;
            //long[] ids;
            //string names="";
            //bool ret = false;
            //try
            //{
            //    string[] namesArray = names.Split(";");

            //    if (ids.Where(r => namesArray.Contains(r.ToString())).Count() > 0)
            //        return true;
            //}
            //catch (Exception ex) { }
            //return ret;
        }

        [AbpAllowAnonymous]
        public async Task<GetAppEntityForViewDto> GetAppEntityRelations(long id)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appEntity = _appEntityRepository.GetAll().Where(x => x.Id == id)
                    .Include(x => x.RelatedEntitiesRelationships).ThenInclude(x => x.RelatedEntityFk)
                    .Include(x => x.EntitiesRelationships).FirstOrDefault();

                var output = new GetAppEntityForViewDto { AppEntity = ObjectMapper.Map<AppEntityDto>(appEntity) };

                if (output.AppEntity.EntityObjectTypeId != null)
                {
                    var _lookupSycEntityObjectType = await _lookup_sycEntityObjectTypeRepository.FirstOrDefaultAsync((int)output.AppEntity.EntityObjectTypeId);
                    output.SycEntityObjectTypeName = _lookupSycEntityObjectType.Name.ToString();
                }

                if (output.AppEntity.EntityObjectStatusId != null)
                {
                    var _lookupSycEntityObjectStatus = await _lookup_sycEntityObjectStatusRepository.FirstOrDefaultAsync((int)output.AppEntity.EntityObjectStatusId);
                    output.SycEntityObjectStatusName = _lookupSycEntityObjectStatus.Name.ToString();
                }

                if (output.AppEntity.ObjectId != null)
                {
                    var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.AppEntity.ObjectId);
                    output.SydObjectName = _lookupSydObject.Name.ToString();
                }

                return output;
            }
        }

        public async Task<string> GetAppEntityState(long id)
        {
            var obj = _appEntityStateRepository.FirstOrDefaultAsync(e => e.EntityId == id).Result;
            if (obj != null)
            { return obj.JsonString; }
            else
            { return ""; }

            return "";
        }

        public async Task SetAppEntityState(long id, string jsonString)
        {
            if (string.IsNullOrEmpty(jsonString))
            {   //delete record in appEntitiesState
                _appEntityStateRepository.Delete(e => e.EntityId == id);
                return;
            }

            var obj = _appEntityStateRepository.FirstOrDefaultAsync(e => e.EntityId == id).Result;
            if (obj != null)
            {   //update json 
                obj.JsonString = jsonString;
            }
            else
            {
                //add or update record in appEntitiesState
                _appEntityStateRepository.Insert(new AppEntityState { EntityId = id, JsonString = jsonString });

            }
        }


        public async Task<GetAppEntityForViewDto> GetAppEntityForView(long id)
        {
            var appEntity = await _appEntityRepository.FirstOrDefaultAsync(x => x.Id == id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

            var output = new GetAppEntityForViewDto { AppEntity = ObjectMapper.Map<AppEntityDto>(appEntity) };

            if (output.AppEntity.EntityObjectTypeId != null)
            {
                var _lookupSycEntityObjectType = await _lookup_sycEntityObjectTypeRepository.FirstOrDefaultAsync((int)output.AppEntity.EntityObjectTypeId);
                output.SycEntityObjectTypeName = _lookupSycEntityObjectType.Name.ToString();
            }

            if (output.AppEntity.EntityObjectStatusId != null)
            {
                var _lookupSycEntityObjectStatus = await _lookup_sycEntityObjectStatusRepository.FirstOrDefaultAsync((int)output.AppEntity.EntityObjectStatusId);
                output.SycEntityObjectStatusName = _lookupSycEntityObjectStatus.Name.ToString();
            }

            if (output.AppEntity.ObjectId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.AppEntity.ObjectId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_AppEntities_Edit)]
        public async Task<GetAppEntityForEditOutput> GetAppEntityForEdit(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appEntity = await _appEntityRepository.GetAll()
                .Include(x => x.EntityExtraData)
                .Include(x => x.EntityAttachments)
                .ThenInclude(x => x.AttachmentFk)
                .Include(x => x.EntityAddresses).ThenInclude(x => x.AddressFk)
                .FirstOrDefaultAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

                var output = new GetAppEntityForEditOutput { AppEntity = ObjectMapper.Map<CreateOrEditAppEntityDto>(appEntity) };
               
                    if (output.AppEntity.EntityObjectTypeId != null)
                    {
                        var _lookupSycEntityObjectType = await _lookup_sycEntityObjectTypeRepository.FirstOrDefaultAsync(int.Parse(output.AppEntity.EntityObjectTypeId.ToString()));
                        output.SycEntityObjectTypeName = _lookupSycEntityObjectType.Name.ToString();
                    }

                    if (output.AppEntity.EntityObjectStatusId != null)
                    {
                        var _lookupSycEntityObjectStatus = await _lookup_sycEntityObjectStatusRepository.FirstOrDefaultAsync(int.Parse(output.AppEntity.EntityObjectStatusId.ToString()));
                        output.SycEntityObjectStatusName = _lookupSycEntityObjectStatus.Name.ToString();
                    }

                    if (output.AppEntity.ObjectId != null)
                    {
                        var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync(int.Parse(output.AppEntity.ObjectId.ToString()));
                        output.SydObjectName = _lookupSydObject.Name.ToString();
                    }
                    output.AppEntity.EntityAttachments = ObjectMapper.Map<List<AppEntityAttachmentDto>>(appEntity.EntityAttachments);
                    foreach (var item in output.AppEntity.EntityAttachments)
                    {
                        item.Url = @"attachments/" + -1 + @"/" + item.FileName;
                    }
                
                return output;
            }
        }

        public async Task CreateOrEdit(CreateOrEditAppEntityDto input)
        {
            if (input.Id == null || input.Id == 0)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }
        }

        public async Task<List<LookupLabelDto>> GetAllAddressTypeForTableDropdown()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var addressTypeId = await _helper.SystemTables.GetEntityObjectTypeAddressTypeId();
                return await _appEntityRepository.GetAll().Where(x => x.EntityObjectTypeId == addressTypeId && (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                    .Select(appEntity => new LookupLabelDto
                    {
                        Value = appEntity.Id,
                        Label = appEntity.Name.ToString(),
                        Code = appEntity.Code,
                    }).ToListAsync();
            }

        }

        [AbpAuthorize(AppPermissions.Pages_AppEntities_Create)]
        protected virtual async Task Create(CreateOrEditAppEntityDto input)
        {
            if (input.EntityObjectTypeId == 0 && !string.IsNullOrEmpty(input.EntityObjectTypeCode))
            {
                var type = await _lookup_sycEntityObjectTypeRepository.FirstOrDefaultAsync(x => x.Code == input.EntityObjectTypeCode);
                input.EntityObjectTypeId = type.Id;
            }

            if (input.EntityObjectTypeId > 0 && string.IsNullOrEmpty(input.EntityObjectTypeCode))
            {
                var code = await _lookup_sycEntityObjectTypeRepository.FirstOrDefaultAsync(x => x.Id == input.EntityObjectTypeId);
                input.EntityObjectTypeCode = code.Code;
            }

            var appEntity = ObjectMapper.Map<AppEntity>(input);

            appEntity.ObjectId = await _helper.SystemTables.GetObjectLookupId();
            appEntity.TenantId = AbpSession.TenantId;


            await _appEntityRepository.InsertAsync(appEntity);
        }

        [AbpAuthorize(AppPermissions.Pages_AppEntities_Edit)]
        protected virtual async Task Update(CreateOrEditAppEntityDto input)
        {
            var appEntity = await _appEntityRepository.FirstOrDefaultAsync(x => x.Id == input.Id && x.TenantId == AbpSession.TenantId);
            ObjectMapper.Map(input, appEntity);
        }

        [AbpAuthorize(AppPermissions.Pages_AppEntities_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _appEntityAddressRepository.DeleteAsync(x => x.EntityId == input.Id);

            await _appEntityRepository.DeleteAsync(x => x.Id == input.Id && x.TenantId == AbpSession.TenantId);
        }

        public async Task<FileDto> GetAppEntitiesToExcel(GetAllAppEntitiesForExcelInput input)
        {

            var filteredAppEntities = _appEntityRepository.GetAll()
                        .Include(e => e.EntityObjectTypeFk)
                        .Include(e => e.EntityObjectStatusFk)
                        .Include(e => e.ObjectFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Notes == input.DescriptionFilter)
                        //.WhereIf(!string.IsNullOrWhiteSpace(input.ExtraDataFilter), e => e.ExtraData == input.ExtraDataFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectTypeNameFilter), e => e.EntityObjectTypeFk != null && e.EntityObjectTypeFk.Name == input.SycEntityObjectTypeNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectStatusNameFilter), e => e.EntityObjectStatusFk != null && e.EntityObjectStatusFk.Name == input.SycEntityObjectStatusNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                        .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null);


            var query = (from o in filteredAppEntities
                         join o1 in _lookup_sycEntityObjectTypeRepository.GetAll() on o.EntityObjectTypeId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         join o2 in _lookup_sycEntityObjectStatusRepository.GetAll() on o.EntityObjectStatusId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                         join o3 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o3.Id into j3
                         from s3 in j3.DefaultIfEmpty()

                         select new GetAppEntityForViewDto()
                         {
                             AppEntity = new AppEntityDto
                             {
                                 Name = o.Name,
                                 Code = o.Code,
                                 Notes = o.Notes,
                                 //ExtraData = o.ExtraData,
                                 Id = o.Id
                             },
                             SycEntityObjectTypeName = s1 == null ? "" : s1.Name.ToString(),
                             SycEntityObjectStatusName = s2 == null ? "" : s2.Name.ToString(),
                             SydObjectName = s3 == null ? "" : s3.Name.ToString()
                         });


            var appEntityListDtos = await query.ToListAsync();

            return _appEntitiesExcelExporter.ExportToFile(appEntityListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_AppEntities)]
        public async Task<List<AppEntitySycEntityObjectTypeLookupTableDto>> GetAllSycEntityObjectTypeForTableDropdown()
        {
            return await _lookup_sycEntityObjectTypeRepository.GetAll()
                .Select(sycEntityObjectType => new AppEntitySycEntityObjectTypeLookupTableDto
                {
                    Id = sycEntityObjectType.Id,
                    DisplayName = sycEntityObjectType.Name.ToString()
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_AppEntities)]
        public async Task<List<AppEntitySycEntityObjectStatusLookupTableDto>> GetAllSycEntityObjectStatusForTableDropdown()
        {
            return await _lookup_sycEntityObjectStatusRepository.GetAll()
                .Select(sycEntityObjectStatus => new AppEntitySycEntityObjectStatusLookupTableDto
                {
                    Id = sycEntityObjectStatus.Id,
                    DisplayName = sycEntityObjectStatus.Name.ToString(),
                    Code = sycEntityObjectStatus.Code
                }).ToListAsync();
        }

        [AbpAuthorize(AppPermissions.Pages_AppEntities)]
        public async Task<List<AppEntitySydObjectLookupTableDto>> GetAllSydObjectForTableDropdown()
        {
            return await _lookup_sydObjectRepository.GetAll()
                .Select(sydObject => new AppEntitySydObjectLookupTableDto
                {
                    Id = sydObject.Id,
                    DisplayName = sydObject.Name.ToString()
                }).ToListAsync();
        }

        public async Task<List<LookupLabelDto>> GetAllLanguageForTableDropdown()
        {
            var languageId = await _helper.SystemTables.GetEntityObjectTypeLanguageId();

            return await _appEntityRepository.GetAll().Where(x => x.EntityObjectTypeId == languageId && (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                .OrderBy("Name asc")
                .Select(appEntity => new LookupLabelDto
                {
                    Value = appEntity.Id,
                    Label = appEntity.Name.ToString(),
                    Code = appEntity.Code,
                })
                .ToListAsync();
        }

        //public async Task<List<LookupLabelDto>> GetAllAccountTypesForTableDropdown()
        //{
        //    var accountTypeId = await _helper.SystemTables.GetEntityObjectTypeAccountTypeId();
        //    return await _appEntityRepository.GetAll().Where(x => x.EntityObjectTypeId == accountTypeId && (x.TenantId == AbpSession.TenantId || x.TenantId == null))
        //        .OrderBy("Name asc")
        //        .Select(appEntity => new LookupLabelDto
        //        {
        //            Value = appEntity.Id,
        //            Label = appEntity.Name.ToString(),
        //            Code = appEntity.Code,
        //        })
        //        .ToListAsync();
        //}

        public async Task<List<LookupLabelDto>> GetAllAccountTypesForTableDropdown()
        {
            var accountTypeId = await _helper.SystemTables.GetObjectContactId();
           return  await _lookup_sycEntityObjectTypeRepository.GetAll().Where(e => e.ObjectId == accountTypeId && (e.ParentId < 1 || e.ParentId==null))
            .OrderBy("Name asc")
                .Select(sycEntityObjectType => new LookupLabelDto
                {
                    Value = sycEntityObjectType.Id,
                    Label = sycEntityObjectType.Name.ToString(),
                    Code = sycEntityObjectType.Code,
                })
                .ToListAsync();
        }

        public async Task<List<LookupLabelDto>> GetAllEntitiesByTypeCode(string code)
        {
            string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
            var languageId = await _helper.SystemTables.GetEntityObjectTypeLanguageId();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                return await _appEntityRepository.GetAll().Include(x => x.EntityAttachments).ThenInclude(z => z.AttachmentFk).Include(z => z.EntityExtraData)
                .Where(x => x.EntityObjectTypeCode == code && (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                .OrderBy("Name asc")
                .Select(appEntity => new LookupLabelDto
                {
                    Value = appEntity.Id,
                    Label = appEntity.Name.ToString(),
                    Code = appEntity.Code,
                    IsHostRecord = appEntity.TenantId == null,
                    HexaCode = (appEntity.EntityExtraData != null && appEntity.EntityExtraData.Where(z => z.AttributeId == 39).FirstOrDefault() != null) ? appEntity.EntityExtraData.Where(z => z.AttributeId == 39).FirstOrDefault().AttributeValue : "",
                    Image = (appEntity.EntityAttachments != null && appEntity.EntityAttachments.FirstOrDefault() != null && appEntity.EntityAttachments.FirstOrDefault().AttachmentFk != null) ?
                                  (imagesUrl + "-1" + @"/" + appEntity.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment.ToString()) : ""
                })
                .ToListAsync();
            }
        }
        //MMT30
        public async Task<List<LookupLabelDto>> GetMarketPlaceSizes()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var languageId = await _helper.SystemTables.GetEntityObjectTypeLanguageId();
                return await _appEntityRepository.GetAll().Where(x => x.EntityObjectTypeCode == "SIZE" && x.TenantId == null)
                .OrderBy("Name asc")
                .Select(appEntity => new LookupLabelDto
                {
                    Value = appEntity.Id,
                    Label = appEntity.Name.ToString(),
                    Code = appEntity.Code,
                    IsHostRecord = appEntity.TenantId == null
                })
                .ToListAsync();
            } 
        }
        //MMT30

        #region get all with paging
        public async Task<PagedResultDto<LookupLabelDto>> GetAllEntitiesByTypeCodeWithPaging(GetAllAppEntitiesInput input)
        {
            //var languageId = await _helper.SystemTables.GetEntityObjectTypeLanguageId(); *Abdo : Not used variable 
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredAppEntities = _appEntityRepository.GetAll().Include(x => x.EntityAttachments).ThenInclude(z=>z.AttachmentFk).Include(z=>z.EntityExtraData)
                .Where(x => x.EntityObjectTypeCode == input.SycEntityObjectTypeNameFilter &&
                (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), x => false || x.Name.Contains(input.NameFilter));// *Abdo : is added to filter by name "Red" as  example

            var pagedAndFilteredAppEntities = filteredAppEntities
              .OrderBy(input.Sorting ?? "Name asc")
              .PageBy(input);

            string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";

            var appEntities = from o in pagedAndFilteredAppEntities
                              select new LookupLabelDto()
                              {
                                  Value = o.Id,
                                  Label = o.Name.ToString(),
                                  Code = o.Code,
                                  IsHostRecord = o.TenantId == null,
                                  HexaCode = (o.EntityExtraData!=null && o.EntityExtraData.Where(z=>z.AttributeId ==39).FirstOrDefault()!=null) ? o.EntityExtraData.Where(z => z.AttributeId == 39).FirstOrDefault().AttributeValue:"",
                                  Image = (o.EntityAttachments!= null && o.EntityAttachments.FirstOrDefault() !=null && o.EntityAttachments.FirstOrDefault().AttachmentFk !=null) ? 
                                  (imagesUrl + "-1" + @"/" + o.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment.ToString()):""
        };


            var totalCount = await filteredAppEntities.CountAsync();

            return new PagedResultDto<LookupLabelDto>(
                totalCount,
                await appEntities.ToListAsync()
            );
                }
        }

        public async Task<List<LookupLabelDto>> GetLineSheetColorSort()
        {
            List<LookupLabelDto> ret = new List<LookupLabelDto>();

            ret.Add(new LookupLabelDto() { Code = "ColorName", Label = L("ColorName"), Value = 0 }); 
            ret.Add(new LookupLabelDto() { Code = "MaterialContent", Label = L("MaterialContent"), Value = 1 });

            return ret;

        }

         
        public async Task<List<LookupLabelDto>> GetLineSheetDetailPageSort()
        {
            List<LookupLabelDto> ret = new List<LookupLabelDto>();

            ret.Add(new LookupLabelDto() { Code = "Brand", Label = L("Brand"), Value = 0 });
            ret.Add(new LookupLabelDto() { Code = "ItemName", Label = L("ItemName"), Value = 1 });
            ret.Add(new LookupLabelDto() { Code = "MaterialContent", Label = L("MaterialContent"), Value = 2 });
            ret.Add(new LookupLabelDto() { Code = "StartShipDate", Label = L("StartShipDate"), Value = 3 });
            ret.Add(new LookupLabelDto() { Code = "EntityObjectTypeCode", Label = L("ProductType"), Value = 4 });
            return ret;
            
        }


        public async Task<PagedResultDto<LookupLabelWithAttachmentDto>> GetAllBackgroundWithPaging(GetAllAppEntitiesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredAppEntities = _appEntityRepository.GetAll()
               .Include(x => x.EntityAttachments)
               .ThenInclude(x => x.AttachmentFk)
               .Where(x => x.EntityObjectTypeCode == input.SycEntityObjectTypeNameFilter &&
                (x.TenantId == AbpSession.TenantId || x.TenantId == null));

                //var output = new GetAppEntityForEditOutput { AppEntity = ObjectMapper.Map<CreateOrEditAppEntityDto>(appEntity) };
                // as per Sam needs and requirments
                if(input.MaxResultCount ==null || input.MaxResultCount==0 || input.MaxResultCount == 10)
                { input.MaxResultCount = 1000; }

                var pagedAndFilteredAppEntities = filteredAppEntities
                 .OrderBy(input.Sorting ?? "Name asc")
                 .PageBy(input);

                var appEntities = from o in pagedAndFilteredAppEntities
                                  select new LookupLabelWithAttachmentDto()
                                  {
                                      Value = o.Id,
                                      Label = o.Name.ToString(),
                                      Code = o.Code,
                                      IsHostRecord = o.TenantId == null,
                                      AttachmentName = o.EntityAttachments != null && o.EntityAttachments.Count > 0 ? @"attachments/" + (o.EntityAttachments[0].AttachmentFk.TenantId!=null? o.EntityAttachments[0].AttachmentFk.TenantId.ToString():"-1") + @"/" + o.EntityAttachments[0].AttachmentFk.Attachment : ""
                                  };


                var totalCount = await filteredAppEntities.CountAsync();

                return new PagedResultDto<LookupLabelWithAttachmentDto>(
                    totalCount,
                    await appEntities.ToListAsync()
                );
            }
        }



        public async Task<PagedResultDto<LookupLabelDto>> GetAllCurrencyForTableDropdownWithPaging(GetAllAppEntitiesInput input)
        {
            input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeCurrencyId();
            return await GetAllEntityTypeForTableDropdown(input);
        }

        public async Task<PagedResultDto<LookupLabelDto>> GetAllLanguageForTableDropdownWithPaging(GetAllAppEntitiesInput input)
        {
            input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeLanguageId();
            return await GetAllEntityTypeForTableDropdown(input);
        }

        public async Task<PagedResultDto<LookupLabelDto>> GetAllCountryForTableDropdowWithPaging(GetAllAppEntitiesInput input)
        {
            input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeCountryId();
            return await GetAllEntityTypeForTableDropdown(input);
        }

        public async Task<PagedResultDto<LookupLabelDto>> GetAllAccountTypesForTableDropdownWithPaging(GetAllAppEntitiesInput input)
        {
            var objectContactId = await _helper.SystemTables.GetObjectContactId();

            var filteredContactTypes =  _lookup_sycEntityObjectTypeRepository.GetAll().Where(e => e.ObjectId == objectContactId && (e.ParentId < 1 || e.ParentId == null))
                 ;

            var pagedAndFilteredAppEntities = filteredContactTypes
               .OrderBy(input.Sorting ?? "Name asc")
               .PageBy(input);

            var appEntities = from o in pagedAndFilteredAppEntities
                              select new LookupLabelDto()
                              {
                                  Value = o.Id,
                                  Label = o.Name.ToString(),
                                  Code = o.Code,
                              };

            var totalCount = await filteredContactTypes.CountAsync();

            return new PagedResultDto<LookupLabelDto>(
                totalCount,
                await appEntities.ToListAsync()
            );
        }

        public async Task<List<LookupLabelDto>> GetAllAccountTypeForTableDropdown()
        {
            return await GetAllAccountTypesForTableDropdown();
            
        }

        public async Task<PagedResultDto<LookupLabelDto>> GetAllEntityTypeForTableDropdown(GetAllAppEntitiesInput input)
        {
            var filteredAppEntities = _appEntityRepository.GetAll()
                         .Include(e => e.EntityObjectTypeFk)
                         .Include(e => e.EntityObjectStatusFk)
                         .Include(e => e.ObjectFk)
                         .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.Notes.Contains(input.Filter))
                         .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
                         .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                         .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Notes == input.DescriptionFilter)
                         .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectTypeNameFilter), e => e.EntityObjectTypeFk != null && e.EntityObjectTypeFk.Name == input.SycEntityObjectTypeNameFilter)
                         .WhereIf(!string.IsNullOrWhiteSpace(input.SycEntityObjectStatusNameFilter), e => e.EntityObjectStatusFk != null && e.EntityObjectStatusFk.Name == input.SycEntityObjectStatusNameFilter)
                         .WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
                         .WhereIf(input.EntityObjectTypeId > 0, e => e.EntityObjectTypeId == input.EntityObjectTypeId)
                         .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null)
                         ;

            var pagedAndFilteredAppEntities = filteredAppEntities
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var appEntities = from o in pagedAndFilteredAppEntities
                              select new LookupLabelDto()
                              {
                                  Label = o.Name,
                                  Value = o.Id
                              };

            var totalCount = await filteredAppEntities.CountAsync();

            return new PagedResultDto<LookupLabelDto>(
                totalCount,
                await appEntities.ToListAsync()
            );
        }
        #endregion get all with paging

        public async Task<List<CurrencyInfoDto>> GetAllCurrencyForTableDropdown()
        {
            var currencyId = await _helper.SystemTables.GetEntityObjectTypeCurrencyId();
            return await _appEntityRepository.GetAll().Include(a => a.EntityExtraData).Where(x => x.EntityObjectTypeId == currencyId && (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                .OrderBy("Name asc")
                .Select(appEntity => new CurrencyInfoDto
                {
                    Value = appEntity.Id,
                    Label = appEntity.Name.ToString(),
                    Code = appEntity.Code,
                    Symbol = appEntity.EntityExtraData != null & appEntity.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41) != null ? appEntity.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : ""
                }).OrderBy(a=>a.Code)
                .ToListAsync();
        }
        public async Task<CurrencyInfoDto> GetCurrencyInfo(string currencyCode)
        {
            CurrencyInfoDto rertunObj = new CurrencyInfoDto();
            var currencyId = await _helper.SystemTables.GetEntityObjectTypeCurrencyId();
            var currencyObject = await _appEntityRepository.GetAll().Include(a => a.EntityExtraData).Where(x => x.EntityObjectTypeId == currencyId && x.Code == currencyCode).FirstOrDefaultAsync();
            if (currencyObject != null)
            {
                rertunObj.Value = currencyObject.Id;
                rertunObj.Label = currencyObject.Name.ToString();
                rertunObj.Code = currencyObject.Code;
                rertunObj.Symbol = currencyObject.EntityExtraData != null & currencyObject.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41) != null ? currencyObject.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : "";
            }
            return rertunObj;
        }

        public async Task<List<LookupLabelDto>> GetAllTitlesForTableDropdown()
        {
            var titleId = await _helper.SystemTables.GetEntityObjectTypeTitleId();
            return await _appEntityRepository.GetAll().Where(x => x.EntityObjectTypeId == titleId && (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                .Select(appEntity => new LookupLabelDto
                {
                    Value = appEntity.Id,
                    Label = appEntity.Name.ToString(),
                    Code = appEntity.Code,
                })
                .ToListAsync();
        }

        public async Task<List<LookupLabelDto>> GetAllCountryForTableDropdown()
        {
            var currencyId = await _helper.SystemTables.GetEntityObjectTypeCountryId();
            return await _appEntityRepository.GetAll().Where(x => x.EntityObjectTypeId == currencyId && (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                .OrderBy("Name asc")
                .Select(appEntity => new LookupLabelDto
                {
                    Value = appEntity.Id,
                    Label = appEntity.Name.ToString(),
                    Code = appEntity.Code,
                })
                .ToListAsync();
        }

        public async Task<List<LookupLabelDto>> GetAllPhoneTypeForTableDropdown()
        {
            var phoneId = await _helper.SystemTables.GetEntityObjectTypePhoneId();

            return await _appEntityRepository.GetAll().Where(x => x.EntityObjectTypeId == phoneId && (x.TenantId == AbpSession.TenantId || x.TenantId == null))
                .OrderBy("Name asc")
                .Select(appEntity => new LookupLabelDto
                {
                    Value = appEntity.Id,
                    Label = appEntity.Name.ToString(),
                    Code = appEntity.Code,
                })
                .ToListAsync();
        }

        public async Task<long> SaveEntity(AppEntityDto input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                AppEntity entity;
                if (input.Id != 0)
                {

                    entity = await _appEntityRepository.GetAll()
                        .Include(x => x.EntityCategories)
                        .Include(x => x.EntityClassifications)
                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                        .Include(x => x.EntityExtraData)
                        .Include(x => x.EntityAddresses).ThenInclude(x => x.AddressFk)
                        .FirstOrDefaultAsync(x => x.Id == input.Id);
                }
                else
                {
                    entity = new AppEntity();
                }

                //temp solution to test 
                if (string.IsNullOrEmpty(input.Code))
                    input.Code = System.Guid.NewGuid().ToString();
                //ObjectMapper.Map(input, entity);

                //------------------------------------------
                //var contactObjectId = await _helper.SystemTables.GetObjectContactId();
                //var partnerEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();

                entity.ObjectId = input.ObjectId;
                entity.EntityObjectStatusId = input.EntityObjectStatusId;
                
                if (entity.EntityObjectStatusId == null)
                    entity.EntityObjectStatusCode = null;

                entity.EntityObjectTypeId = input.EntityObjectTypeId;
                entity.Name = input.Name;
                entity.Code = input.Code;
                entity.Notes = input.Notes;
                //MMT30[Start]
                entity.SSIN = input.SSIN;
                entity.TenantOwner = int.Parse (input.TenantOwner.ToString ());
                //MMT30[Start]
                //entity.ExtraData = input.ExtraData;

                // I3-13 [Begin]
                if (string.IsNullOrEmpty(input.Code))
                { entity.Code = input.Code; }
                // I3-13 [End]

                //input.TenantID==-1 means not set and the backend must set it by the current seesion.TenantId
                entity.TenantId = input.TenantId == -1 ? AbpSession.TenantId : input.TenantId;
                //entity.TenantId = GetCurrentTenant().Id;


                if (entity.EntityAttachments == null)
                    entity.EntityAttachments = new List<AppEntityAttachment>();
                if (entity.EntityAddresses == null)
                    entity.EntityAddresses = new List<AppEntityAddress>();
                if (entity.EntityClassifications == null)
                    entity.EntityClassifications = new List<AppEntityClassification>();
                if (entity.EntityCategories == null)
                    entity.EntityCategories = new List<AppEntityCategory>();
                if (entity.EntityExtraData == null)
                    entity.EntityExtraData = new List<AppEntityExtraData>();


                #region entity addresses handler

                //deleted removed current addreses
                if (entity != null && entity.Id != 0 && entity.EntityAddresses != null && entity.EntityAddresses.Count() > 0)
                { await _appEntityAddressRepository.DeleteAsync(x => x.EntityId == entity.Id); }

                //add input list addresses
                if (input.EntityAddresses != null)
                {
                    foreach (var item in input.EntityAddresses)
                    {
                        if (entity.EntityAddresses.Count(x => x.AddressTypeId == item.AddressTypeId) == 0)
                        {
                            entity.EntityAddresses.Add(new AppEntityAddress { EntityId = entity.Id, AddressTypeId = item.AddressTypeId, AddressId = item.AddressId });
                        }
                        else
                        {
                            entity.EntityAddresses.Where(x => x.AddressTypeId == item.AddressTypeId).FirstOrDefault().AddressId = item.AddressId;
                        }
                    }
                }
                #endregion entity addresses handler

                //add new categories
                if (input.EntityCategories != null)
                {
                    foreach (var item in input.EntityCategories)
                    {
                        if (entity.EntityCategories.Count(x => x.EntityObjectCategoryId == item.EntityObjectCategoryId) == 0)
                        {
                            entity.EntityCategories.Add(new AppEntityCategory { EntityObjectCategoryId = (int)item.EntityObjectCategoryId, EntityId = entity.Id, EntityCode = input.Code, EntityObjectCategoryCode = item.EntityObjectCategoryCode });
                        }
                    }
                }
                //delete removed categories
                if (entity.EntityCategories != null)
                {
                    foreach (var item in entity.EntityCategories)
                    {
                        if (input.EntityCategories.Count(x => x.EntityObjectCategoryId == item.EntityObjectCategoryId) == 0)
                        {
                            await _appEntityCategoryRepository.DeleteAsync(item.Id);
                        }
                    }
                }

                //add new Classifications
                if (input.EntityClassifications != null)
                {
                    foreach (var item in input.EntityClassifications)
                    {
                        if (entity.EntityClassifications.Count(x => x.EntityObjectClassificationId == item.EntityObjectClassificationId) == 0)
                        {
                            entity.EntityClassifications.Add(new AppEntityClassification { EntityObjectClassificationId = (int)item.EntityObjectClassificationId, EntityId = entity.Id, EntityCode = input.Code, EntityObjectClassificationCode = item.EntityObjectClassificationCode });
                        }
                    }
                }

                //delete removed Classifications
                if (entity.EntityClassifications != null)
                {
                    foreach (var item in entity.EntityClassifications)
                    {
                        if (input.EntityClassifications.Count(x => x.EntityObjectClassificationId == item.EntityObjectClassificationId) == 0)
                        {
                            await _appEntityClassificationRepository.DeleteAsync(item.Id);
                        }
                    }
                }

                //add and update new extra data
                if (input.EntityExtraData != null)
                {
                    foreach (var item in input.EntityExtraData)
                    {
                        //add new case
                        if (item.Id == 0 || entity.EntityExtraData.Count(x => x.Id == item.Id) == 0)
                        {
                            AppEntityExtraData extraData;
                            extraData = ObjectMapper.Map<AppEntityExtraData>(item);
                            extraData.EntityId = entity.Id;
                            //mmt30
                            extraData.EntityCode =entity.Code;
                            //mmt30
                            if (extraData.AttributeValueId != 0 && extraData.AttributeValueId != null)
                            {
                                var type = await _appEntityRepository.FirstOrDefaultAsync(x => x.Id == extraData.AttributeValueId);
                                if (type!=null)
                                    extraData.EntityObjectTypeId = type.EntityObjectTypeId;

                            }
                            else
                            {
                                if (!string.IsNullOrEmpty(extraData.EntityObjectTypeCode))
                                {
                                    var type = await _appEntityRepository.FirstOrDefaultAsync(x => x.EntityObjectTypeCode == extraData.EntityObjectTypeCode);
                                    if (type != null)
                                        extraData.EntityObjectTypeId = type.EntityObjectTypeId;
                                }
                                else
                                extraData.EntityObjectTypeId = null;
                            }
                            if (extraData.AttributeValueId == 0) extraData.AttributeValueId = null;
                            entity.EntityExtraData.Add(extraData);
                        }
                        else
                        {
                            //update existed case
                            var ex = entity.EntityExtraData.FirstOrDefault(x => x.Id == item.Id);
                            ObjectMapper.Map(item, ex);
                            ex.EntityId = entity.Id;
                            if (ex.AttributeValueId == 0) ex.AttributeValueId = null;
                        }
                    }
                }

                //delete removed extra data
                if (entity.EntityExtraData != null)
                {
                    foreach (var item in entity.EntityExtraData)
                    {
                        if (input.EntityExtraData.Count(x => x.Id == item.Id) == 0)
                        {
                            await _appEntityExtraDataRepository.DeleteAsync(item.Id);
                        }
                    }
                }

                //delete removed attachments not in the input attachments
                if (entity.Id != 0 && input.EntityAttachments != null)
                {
                    var inputEntityAttachIds = input.EntityAttachments.Select(x => x.Id).ToArray();
                    var savedAttachIds = _appEntityAttachmentRepository.GetAll().Where(x => x.EntityId == entity.Id && !inputEntityAttachIds.Contains(x.Id)).Select(x => x.AttachmentId).ToArray();
                    await _appEntityAttachmentRepository.DeleteAsync(x => x.EntityId == entity.Id && !inputEntityAttachIds.Contains(x.Id));
                    await _appAttachmentRepository.DeleteAsync(x => !inputEntityAttachIds.Contains(x.Id) && savedAttachIds.Contains(x.Id));
                }

                //add new attachments
                if (input.EntityAttachments != null)
                {
                    foreach (var item in input.EntityAttachments)
                    {    //

                        if ((input.Id == null || input.Id == 0) && string.IsNullOrEmpty(item.guid))
                        { item.guid = item.FileName; }
                        //
                        string extension = "";
                        string filename = "";
                        if (item.FileName.Split(".").Length > 1)
                        {
                            extension = item.FileName.Split(".")[item.FileName.Split(".").Length - 1];
                        }
                        if (item.guid != null && !item.guid.EndsWith("." + extension))
                        {
                            filename = item.guid + (extension == "" ? "" : "." + extension);
                        }
                        else if (item.guid != null)
                        {
                            filename = item.guid;
                        }
                        else if (item.Id > 0 && string.IsNullOrEmpty(item.Url) && string.IsNullOrEmpty(item.guid))
                        {
                            filename = item.FileName;
                        }
                        else if (item.Id == 0 && !string.IsNullOrEmpty(item.FileName))
                        {
                            filename = item.FileName;
                        }
                        if (input.AddFromAttachments)
                        {
                            var appEntityAttachment = _appEntityAttachmentRepository.GetAll().Where(r => r.Id == item.Id).FirstOrDefault();

                            entity.EntityAttachments.Add(new AppEntityAttachment { AttachmentCategoryId = (int)item.AttachmentCategoryId, EntityId = entity.Id, AttachmentId = appEntityAttachment.AttachmentId, IsDefault = item.IsDefault, Attributes = item.Attributes });
                        }
                        else
                        {

                            if (!string.IsNullOrEmpty(filename))
                            {
                                bool newRecord = false;
                                if (entity.EntityAttachments != null && entity.EntityAttachments.Count(x => item.Id > 0 && x.Id == item.Id) == 0)
                                {
                                    newRecord = true;
                                }

                                if (newRecord)
                                {
                                    var att = new AppAttachment { Name = item.guid == null ? item.DisplayName : item.FileName, Attachment = filename, TenantId = input.TenantId };
                                    att = await _appAttachmentRepository.InsertAsync(att);
                                    await CurrentUnitOfWork.SaveChangesAsync();
                                    //entity.EntityAttachments.Add(new AppEntityAttachment { AttachmentCategoryId = (int)item.AttachmentCategoryId, EntityId = entity.Id, AttachmentId = att.Id });
                                    entity.EntityAttachments.Add(new AppEntityAttachment { AttachmentCategoryId = (int)item.AttachmentCategoryId, EntityId = entity.Id, AttachmentId = att.Id, IsDefault = item.IsDefault, Attributes = item.Attributes });
                                    //await CurrentUnitOfWork.SaveChangesAsync();
                                }
                                else
                                {
                                    //CASE#1
                                    var existed = entity.EntityAttachments.FirstOrDefault(x => x.Id == item.Id);
                                    existed.AttachmentFk.Name = item.DisplayName;
                                    existed.AttachmentFk.Attachment = filename;
                                    existed.IsDefault = item.IsDefault;
                                    existed.Attributes = item.Attributes;
                                }
                                if (input.AttachmentSourceTenantId != null && input.AttachmentSourceTenantId > -2)
                                { MoveFile(filename, input.AttachmentSourceTenantId, input.TenantId); }
                                else
                                { MoveFile(filename, AbpSession.TenantId, input.TenantId); }
                            }
                            else
                            {
                                //temperory code and need to be refactor for CASE#1
                                var existed = entity.EntityAttachments.FirstOrDefault(x => x.Id == item.Id);
                                if (existed != null)
                                {
                                    existed.AttachmentFk.Name = item.DisplayName;
                                    //existed.AttachmentFk.Attachment = filename;
                                    existed.IsDefault = item.IsDefault;
                                    existed.Attributes = item.Attributes;
                                }

                            }
                        }
                    }
                }


                //if (entity.Id != 0 && entity.EntityAttachments != null)
                //{
                //    //delete removed attachments
                //    //foreach (var item in entity.EntityAttachments)
                //    //{
                //    //    if (input.EntityAttachments.Count(x => x.Id == item.Id) == 0)
                //    //    {
                //    //        await _appEntityAttachmentRepository.DeleteAsync(item.Id);
                //    //        await _appAttachmentRepository.DeleteAsync(item.AttachmentId);
                //    //    }

                //    //}
                //    var arr = entity.EntityAttachments.Select(x => x.Id).ToArray();
                //    await _appEntityAttachmentRepository.DeleteAsync(x => x.EntityId == entity.Id && !arr.Contains(x.Id));
                //}

                if (entity.Id == 0)
                {
                    entity = await _appEntityRepository.InsertAsync(entity);

                    try
                    {
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        throw new UserFriendlyException("Code '" + entity.Code + "' Already Exists.");

                    }
                }
                if (entity.Id > 0 && input.RelatedEntityId != null && input.RelatedEntityId > 0)
                {
                    var relatedEntityFK = _appEntityRepository.GetAll().FirstOrDefault(r => r.Id == input.RelatedEntityId);

                    var entitiesRelationship = new AppEntitiesRelationship
                    {
                        EntityId = entity.Id,
                        EntityCode = entity.Code,
                        EntityTypeCode = entity.EntityObjectTypeFk.Code,
                        RelatedEntityId = (long)input.RelatedEntityId,
                        RelatedEntityTypeCode = relatedEntityFK.EntityObjectTypeCode,
                        RelatedEntityCode = relatedEntityFK.Code
                    };
                    entitiesRelationship = _appEntitiesRelationshipRepository.Insert(entitiesRelationship);
                }
                return entity.Id;
            }
        }

        public async Task<long> SaveContact(AppContactDto input)
        {
            AppContact contact;
            if (input.Id != 0)
            {
                contact = await _appContactRepository.GetAll()
                    .FirstOrDefaultAsync(x => x.Id == input.Id);
            }
            else
            {
                contact = new AppContact();
            }


            var contactSavedId = contact.Id;
            ObjectMapper.Map(input, contact);

            if (contact.Id == 0)
            {
                contact = await _appContactRepository.InsertAsync(contact);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return contact.Id;

        }

        private void MoveFile(string fileName, int? sourceTenantId, int? distinationTenantId)
        {
            if (sourceTenantId == null) sourceTenantId = -1;
            if (distinationTenantId == null) distinationTenantId = -1;

            var tmpPath = _appConfiguration[$"Attachment:PathTemp"] + @"\" + sourceTenantId + @"\" + fileName;
            var pathSource = _appConfiguration[$"Attachment:Path"] + @"\" + sourceTenantId + @"\" + fileName;
            var path = _appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId + @"\" + fileName;

            if (!System.IO.Directory.Exists(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId))
            {
                System.IO.Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId);
            }

            try
            {
                System.IO.File.Copy(tmpPath.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
            }
            catch (Exception ex)
            {
                try
                {
                    System.IO.File.Copy(pathSource.Replace(@"\", @"\"), path.Replace(@"\", @"\"), true);
                }
                catch (Exception ex1)
                {

                }
            }
        }

        #region get class/category/depts by page objects/names
        public async Task<PagedResultDto<AppEntityCategoryDto>> GetAppEntityCategoriesWithPaging(GetAppEntityAttributesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityId != 0)
                {
                    var categoriesFiltered = _appEntityCategoryRepository.GetAll().Include(r => r.EntityObjectCategoryFk).Where(r => r.EntityId == input.EntityId && r.EntityObjectCategoryFk.TenantId != null);

                    var categoriesOrderdPaged = categoriesFiltered.OrderBy(input.Sorting ?? "EntityObjectCategoryCode asc")
                    .PageBy(input);

                    var categoriesOrderdPagedDto = ObjectMapper.Map<IList<AppEntityCategoryDto>>(categoriesOrderdPaged);
                    return new PagedResultDto<AppEntityCategoryDto>(categoriesFiltered.Count(), categoriesOrderdPagedDto.ToList());
                }
                return new PagedResultDto<AppEntityCategoryDto>(0, new List<AppEntityCategoryDto>());
            }
        }

        public async Task<PagedResultDto<AppEntityClassificationDto>> GetAppEntityClassificationsWithPaging(GetAppEntityAttributesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityId != 0)
                {
                    var classificationsFiltered = _appEntityClassificationRepository.GetAll().Include(r => r.EntityObjectClassificationFk).Where(r => r.EntityId == input.EntityId);
                    var classificationsOrderdPaged = classificationsFiltered
                   .OrderBy(input.Sorting ?? "EntityObjectClassificationCode asc")
                   .PageBy(input);
                    var classificationsOrderdPagedDto = ObjectMapper.Map<IList<AppEntityClassificationDto>>(classificationsOrderdPaged);

                    return new PagedResultDto<AppEntityClassificationDto>(classificationsFiltered.Count(), classificationsOrderdPagedDto.ToList());
                }
                return new PagedResultDto<AppEntityClassificationDto>(0, new List<AppEntityClassificationDto>());
            }
        }

        public async Task<PagedResultDto<AppEntityCategoryDto>> GetAppEntityDepartmentsWithPaging(GetAppEntityAttributesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityId != 0)
                {
                    var categoriesFiltered = _appEntityCategoryRepository.GetAll().Include(r => r.EntityObjectCategoryFk).Where(r => r.EntityId == input.EntityId && r.EntityObjectCategoryFk.TenantId == null);
                    var categoriesOrderdPaged = categoriesFiltered
                   .OrderBy(input.Sorting ?? "EntityObjectCategoryCode asc")
                   .PageBy(input);
                    var categoriesOrderdPagedDto = ObjectMapper.Map<IList<AppEntityCategoryDto>>(categoriesOrderdPaged);

                    return new PagedResultDto<AppEntityCategoryDto>(categoriesFiltered.Count(), categoriesOrderdPagedDto.ToList());
                }
                return new PagedResultDto<AppEntityCategoryDto>(0, new List<AppEntityCategoryDto>());
            }
        }
       

        public async Task<PagedResultDto<string>> GetAppEntityCategoriesNamesWithPaging(GetAppEntityAttributesInput input)
        {
            var categoriesOrderdPaged = await GetAppEntityCategoriesWithPaging(input);
            if (categoriesOrderdPaged.TotalCount > 0)
            {
                return new PagedResultDto<string>(categoriesOrderdPaged.TotalCount, categoriesOrderdPaged.Items.Select(r => r.EntityObjectCategoryName).ToList());
            }
            return new PagedResultDto<string>(0, new List<string>());
        }

        public async Task<PagedResultDto<string>> GetAppEntityClassificationsNamesWithPaging(GetAppEntityAttributesInput input)
        {
            var classificationsOrderdPaged = await GetAppEntityClassificationsWithPaging(input);
            if (classificationsOrderdPaged.TotalCount > 0)
            {
                return new PagedResultDto<string>(classificationsOrderdPaged.TotalCount, classificationsOrderdPaged.Items.Select(r => r.EntityObjectClassificationName).ToList());
            }
            return new PagedResultDto<string>(0, new List<string>());
        }

        public async Task<PagedResultDto<string>> GetAppEntityDepartmentsNamesWithPaging(GetAppEntityAttributesInput input)
        {
            var categoriesOrderdPaged = await GetAppEntityDepartmentsWithPaging(input);
            if (categoriesOrderdPaged.TotalCount > 0)
            {
                return new PagedResultDto<string>(categoriesOrderdPaged.TotalCount, categoriesOrderdPaged.Items.Select(r => r.EntityObjectCategoryName).ToList());
            }
            return new PagedResultDto<string>(0, new List<string>());
        }

        #endregion get class/category/depts by page objects/names

        #region get attachments and extra data by page
        public async Task<PagedResultDto<AppEntityAttachmentDto>> GetAppEntityAttachmentsWithPaging(GetAppEntityAttributesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityId != 0)
                {
                    var entityFiltered = _appEntityRepository.GetAll().Where(r => r.Id == input.EntityId).FirstOrDefault();

                    var entityAttachmentsFiltered = _appEntityAttachmentRepository.GetAll().Include(r => r.AttachmentFk).Where(r => r.EntityId == input.EntityId);

                    var entityAttachmentsOrderdPaged = entityAttachmentsFiltered.OrderBy(input.Sorting ?? "IsDefault desc")
                    .PageBy(input);

                    var entityAttachmentOrderdPagedDto = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(entityAttachmentsOrderdPaged);

                    foreach (var item in entityAttachmentOrderdPagedDto)
                    {
                        item.Url = @"attachments/" + (entityFiltered.TenantId == null ? "-1" : entityFiltered.TenantId.ToString()) + @"/" + item.FileName;
                    }

                    return new PagedResultDto<AppEntityAttachmentDto>(entityAttachmentsFiltered.Count(), entityAttachmentOrderdPagedDto.ToList());
                }
                return new PagedResultDto<AppEntityAttachmentDto>(0, new List<AppEntityAttachmentDto>());
            }
        }

        public async Task<PagedResultDto<AppEntityAttachmentDto>> GetAppEntitysAttachmentsWithPaging(GetAppEntitysAttributesInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityIds != null && input.EntityIds.Count > 0)
                {
                    var entityAttachmentsFiltered = _appEntityAttachmentRepository.GetAll().Include(r => r.AttachmentFk)
                        .Where(r => input.EntityIds.Contains(r.EntityId) && (input.GetDefaultOnly == false || r.IsDefault == true));

                    var entityAttachmentsOrderdPaged = entityAttachmentsFiltered.OrderBy(input.Sorting ?? "IsDefault desc")
                    .PageBy(input);

                    var entityAttachmentOrderdPagedDto = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(entityAttachmentsOrderdPaged);
                    int? tenant = (input.TenantId == 0 ? (AbpSession.TenantId == null ? -1 : (int)AbpSession.TenantId) : input.TenantId);
                    foreach (var item in entityAttachmentOrderdPagedDto)
                    {
                        item.Url = @"attachments/" + (tenant.HasValue ? tenant.ToString() : "-1") + @"/" + item.FileName;
                    }

                    return new PagedResultDto<AppEntityAttachmentDto>(entityAttachmentsFiltered.Count(), entityAttachmentOrderdPagedDto.ToList());
                }
                return new PagedResultDto<AppEntityAttachmentDto>(0, new List<AppEntityAttachmentDto>());
            }
        }

        public async Task<PagedResultDto<AppEntityExtraDataDto>> GetAppEntityExtraWithPaging(GetAppEntityAttributesWithAttributeIdsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityId != 0)
                {
                    var entityExtraDataFiltered = _appEntityExtraDataRepository.GetAll()
                        .Include(x => x.EntityObjectTypeFk)
                        .Include(x => x.AttributeValueFk)
                        .Where(r => r.EntityId == input.EntityId && input.AttributeIds.Contains(r.AttributeId));

                    var entityExtraDataOrderdPaged = entityExtraDataFiltered.OrderBy(input.Sorting ?? "Id asc").PageBy(input);

                    var entityExtraDataOrderdPagedDto = ObjectMapper.Map<IList<AppEntityExtraDataDto>>(entityExtraDataOrderdPaged);

                    return new PagedResultDto<AppEntityExtraDataDto>(entityExtraDataFiltered.Count(), entityExtraDataOrderdPagedDto.ToList());
                }
                return new PagedResultDto<AppEntityExtraDataDto>(0, new List<AppEntityExtraDataDto>());
            }
        }

        public async Task<bool> UpdateEntityCommentsCount(long entitlyId, bool RemoveComment)
        {
            int factor = 1;
            if (RemoveComment) { factor = -1; }
            var countReactionObj = await _appEntityReactionsCount.GetAll().FirstOrDefaultAsync(x => x.EntityId == entitlyId);
            if (countReactionObj != null)
            {
                countReactionObj.EntityCommentsCount += factor;

                var countObj = await _appEntityReactionsCount.UpdateAsync(countReactionObj);
                await CurrentUnitOfWork.SaveChangesAsync();

            }
            else
            {
                AppEntityReactionsCount appReactionCount = new AppEntityReactionsCount();
                appReactionCount.EntityId = entitlyId;
                appReactionCount.EntityCommentsCount = factor;
                var countObj = await _appEntityReactionsCount.InsertAsync(appReactionCount);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return true;
        }

        public async Task<PagedResultDto<long>> GetAppEntityAttrDistinctWithPaging(GetAppEntityAttributesWithAttributeIdsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityId != 0)
                {
                    var entityExtraDataFiltered = _appEntityExtraDataRepository.GetAll()
                        .Include(x => x.EntityObjectTypeFk)
                        .Include(x => x.AttributeValueFk)
                        .Where(r => r.EntityId == input.EntityId && input.AttributeIds.Contains(r.AttributeId));

                    var entityExtraAttrFiltered = entityExtraDataFiltered.Select(r => new { AttributeId = r.AttributeId }).Distinct();
                    var entityExtraDataOrderdPaged = entityExtraAttrFiltered.OrderBy(input.Sorting ?? "AttributeId asc").PageBy(input);

                    return new PagedResultDto<long>(entityExtraDataFiltered.Count(), entityExtraDataOrderdPaged.Select(r => r.AttributeId).ToList());
                }
                return new PagedResultDto<long>(0, new List<long>());
            }
        }

        public async Task<PagedResultDto<AppEntityExtraDataDto>> GetAppEntityColorsWithPaging(GetAppEntitysColorsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.EntityIds != null && input.EntityIds.Count > 0)
                {
                    var entityExtraDataFiltered = _appEntityExtraDataRepository.GetAll()
                        .Where(r => input.EntityIds.Contains(r.EntityId) && r.EntityObjectTypeCode == input.Attr)
                        .Select(x => new { AttributeValue = x.AttributeValue, AttributeValueId = x.AttributeValueId }).Distinct();

                    var entityExtraDataOrderdPaged = entityExtraDataFiltered.OrderBy(input.Sorting ?? "AttributeValue asc").PageBy(input);
                    //look no need to this map use new dto
                    var entityExtraDataOrderdPagedDto = ObjectMapper.Map<IList<AppEntityExtraDataDto>>(entityExtraDataOrderdPaged);

                    return new PagedResultDto<AppEntityExtraDataDto>(entityExtraDataFiltered.Count(), entityExtraDataOrderdPagedDto.ToList());
                }
                return new PagedResultDto<AppEntityExtraDataDto>(0, new List<AppEntityExtraDataDto>());
            }
        }
        #endregion get attachments by page
        #region Reactions
        [AbpAllowAnonymous]
        public async Task CreateOrUpdateReaction(long entitlyId, int reaction)
        {

            int oldReaction = 0;
            var userId = long.Parse(AbpSession.UserId.ToString());

            #region user reaction part
            AppEntityUserReactions appEntityUserReaction = await _appEntityUserReactions.GetAll().FirstOrDefaultAsync(x => x.UserId == userId && x.EntityId == entitlyId && x.InteractionType == 'R');

            {
                if (appEntityUserReaction == null || appEntityUserReaction.Id == 0)
                {
                    appEntityUserReaction = new AppEntityUserReactions();
                    appEntityUserReaction.UserId = userId;
                    appEntityUserReaction.EntityId = entitlyId;
                    appEntityUserReaction.ReactionSelected = reaction;
                    appEntityUserReaction.ActionTime = DateTime.Now;
                    appEntityUserReaction.InteractionType = 'R';
                    if (AbpSession.TenantId != null)
                        appEntityUserReaction.TenantId = int.Parse(AbpSession.TenantId.ToString());

                    var userReaction = await _appEntityUserReactions.InsertAsync(appEntityUserReaction);
                    //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
                    var postObjectId = await _helper.SystemTables.GetObjectPostId();
                    var entityObject = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.Id == entitlyId);
                    if (entityObject != null && entityObject.ObjectId == postObjectId)
                    {
                        if (entityObject.TenantId != null && entityObject.CreatorUserId != null)
                        {
                            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                            {
                                var tenantObject = await TenantManager.GetByIdAsync(int.Parse(entityObject.TenantId.ToString()));
                                if (tenantObject != null)
                                {
                                    string tenancyName = tenantObject.TenancyName;
                                    var myUser = await UserManager.FindByIdAsync(AbpSession.UserId.ToString());
                                    var notifyUser = await UserManager.FindByIdAsync(entityObject.CreatorUserId.ToString());
                                    if (notifyUser != null)
                                    {
                                        var myTenantObject = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                                        //T-SII-20220413.0001,1 MMT 05/15/2023 -The notification message Enhachment[Start]
                                        var post = _appPostRepository.GetAll ().Where(x=>x.AppEntityId == entitlyId  ).FirstOrDefault ();
                                        if (post != null)
                                        {
                                            await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(entityObject.TenantId, long.Parse(notifyUser.Id.ToString())),
                                                "User " + myUser.FullName + "@" + myTenantObject.Name + " reacted to your <a> post </a>" +(post.Description.Length > 30 ? post.Description.Substring (0,30): post.Description), Abp.Notifications.NotificationSeverity.Info,
                                                new Abp.Domain.Entities.EntityIdentifier(typeof(AppPost), post.Id ));
                                        }
                                        else
                                        {
                                            //T-SII-20220413.0001,1 MMT 05/15/2023 -The notification message Enhachment[End]
                                            await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(entityObject.TenantId, long.Parse(notifyUser.Id.ToString())),
                                                "User " + myUser.FullName + "@" + myTenantObject.Name + " reacted to your post" + entityObject.Name, Abp.Notifications.NotificationSeverity.Info);
                                        }
                                    }
                                }
                            }
                        }

                    }
                    //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]
                }
                else
                {
                    oldReaction = appEntityUserReaction.ReactionSelected;
                    appEntityUserReaction.ReactionSelected = reaction;
                    appEntityUserReaction.ActionTime = DateTime.Now;
                    var userReaction = await _appEntityUserReactions.UpdateAsync(appEntityUserReaction);
                    //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
                    var postObjectId = await _helper.SystemTables.GetObjectPostId();
                    var entityObject = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.Id == entitlyId);
                    if (entityObject != null && entityObject.ObjectId == postObjectId)
                    {
                        if (entityObject.TenantId != null && entityObject.CreatorUserId != null)
                        {
                            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                            {
                                var tenantObject = await TenantManager.GetByIdAsync(int.Parse(entityObject.TenantId.ToString()));
                                if (tenantObject != null)
                                {
                                    string tenancyName = tenantObject.TenancyName;
                                    var notifyUser = await UserManager.FindByIdAsync(entityObject.CreatorUserId.ToString());
                                    var myUser = await UserManager.FindByIdAsync(AbpSession.UserId.ToString());
                                    if (notifyUser != null)
                                    {
                                        var myTenantObject = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));

                                        await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(entityObject.TenantId, long.Parse(notifyUser.Id.ToString())),
                                            "User " + myUser.FullName + "@" + myTenantObject.Name + " re-reacted to your post" + entityObject.Name, Abp.Notifications.NotificationSeverity.Info);
                                    }
                                }
                            }
                        }

                    }
                    //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]
                }
            }
            #endregion user reaction part

            #region fill interactions part
            AppEntityReactionsCount appReactionCount = await _appEntityReactionsCount.GetAll().FirstOrDefaultAsync(x => x.EntityId == entitlyId);
            if (appReactionCount == null || appReactionCount.Id == 0)
            {
                appReactionCount = new AppEntityReactionsCount();
                appReactionCount.EntityId = entitlyId;

                UpdateReactionsCount(appReactionCount, reaction, true);
                var countObj = await _appEntityReactionsCount.InsertAsync(appReactionCount);
            }
            else
            {

                UpdateReactionsCount(appReactionCount, reaction, true);

                if (oldReaction > 0)
                {
                    UpdateReactionsCount(appReactionCount, oldReaction, false);

                }

                var countObj = await _appEntityReactionsCount.UpdateAsync(appReactionCount);

            }
            #endregion fill interactions part

            await CurrentUnitOfWork.SaveChangesAsync();
        }
        [AbpAllowAnonymous]
        //MMT[Start]
        public async Task CreateUserView(long entitlyId)
        {
            var userId = long.Parse(AbpSession.UserId.ToString());


            AppEntityUserReactions appEntityUserView = await _appEntityUserReactions.GetAll().FirstOrDefaultAsync(x => x.UserId == userId && x.EntityId == entitlyId && x.InteractionType == 'V');

            if (appEntityUserView == null)  //|| appEntityUserView.Id == 0
            {
                #region user reaction part
                appEntityUserView = new AppEntityUserReactions();
                appEntityUserView.UserId = userId;
                appEntityUserView.EntityId = entitlyId;
                appEntityUserView.ActionTime = DateTime.Now;
                appEntityUserView.InteractionType = 'V';
                if (AbpSession.TenantId != null)
                    appEntityUserView.TenantId = int.Parse(AbpSession.TenantId.ToString());

                var userReaction = await _appEntityUserReactions.InsertAsync(appEntityUserView);
                #endregion fill interactions part

                #region fill interactions part
                AppEntityReactionsCount appReactionCount = await _appEntityReactionsCount.GetAll().FirstOrDefaultAsync(x => x.EntityId == entitlyId);
                if (appReactionCount == null)
                {
                    appReactionCount = new AppEntityReactionsCount();
                    appReactionCount.EntityId = entitlyId;
                    appReactionCount.ViewersCount = 1;
                    var countObj = await _appEntityReactionsCount.InsertAsync(appReactionCount);
                }
                else
                {

                    appReactionCount.ViewersCount += 1;
                    var countObj = await _appEntityReactionsCount.UpdateAsync(appReactionCount);

                }
                #endregion user reaction part
                await CurrentUnitOfWork.SaveChangesAsync();
            }






        }
        [AbpAllowAnonymous]
        //MMT[End]
        public async Task DeleteUserReaction(long id)
        {
            var reactionObj = await _appEntityUserReactions.GetAll().FirstOrDefaultAsync(x => x.Id == id);
            if (reactionObj != null)
            {
                var countReactionObj = await _appEntityReactionsCount.GetAll().FirstOrDefaultAsync(x => x.EntityId == reactionObj.EntityId);
                if (countReactionObj != null)
                {
                    UpdateReactionsCount(countReactionObj, reactionObj.ReactionSelected, false);

                    var countObj = await _appEntityReactionsCount.UpdateAsync(countReactionObj);
                }
                await _appEntityUserReactions.DeleteAsync(reactionObj);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }
        [AbpAllowAnonymous]
        private async Task<bool> UpdateEntityReactionsCount(long id, long entitlyId, int reaction, int? oldReaction)
        {
            if (id == 0)
            {
                AppEntityReactionsCount appReactionCount = new AppEntityReactionsCount();
                appReactionCount.EntityId = entitlyId;
                UpdateReactionsCount(appReactionCount, reaction, true);
                var countObj = await _appEntityReactionsCount.InsertAsync(appReactionCount);
                //  await CurrentUnitOfWork.SaveChangesAsync();
            }
            else
            {
                var countReactionObj = await _appEntityReactionsCount.GetAll().FirstOrDefaultAsync(x => x.EntityId == entitlyId && x.Id == id);
                if (countReactionObj != null)
                {
                    UpdateReactionsCount(countReactionObj, reaction, true);

                    if (oldReaction != null && oldReaction > 0)
                        UpdateReactionsCount(countReactionObj, int.Parse(oldReaction.ToString()), false);
                    var countObj = await _appEntityReactionsCount.UpdateAsync(countReactionObj);
                    //  await CurrentUnitOfWork.SaveChangesAsync();

                }
            }
            //await CurrentUnitOfWork.SaveChangesAsync();
            return true;
        }
        [AbpAllowAnonymous]
        private async Task<bool> UpdateEntityCommentsCount(long entitlyId)
        {
            var countReactionObj = await _appEntityReactionsCount.GetAll().FirstOrDefaultAsync(x => x.EntityId == entitlyId);
            if (countReactionObj != null)
            {
                countReactionObj.EntityCommentsCount += 1;

                var countObj = await _appEntityReactionsCount.UpdateAsync(countReactionObj);
                await CurrentUnitOfWork.SaveChangesAsync();

            }
            else
            {
                AppEntityReactionsCount appReactionCount = new AppEntityReactionsCount();
                appReactionCount.EntityId = entitlyId;
                appReactionCount.EntityCommentsCount = 1;
                var countObj = await _appEntityReactionsCount.InsertAsync(appReactionCount);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return true;
        }
        private void UpdateReactionsCount(AppEntityReactionsCount countObject, int reaction, bool increase)
        {
            int updateWith = increase ? 1 : -1;
            switch (reaction)
            {
                case (int)Reactions.Like:
                    countObject.LikeCount += updateWith;
                    break;
                case (int)Reactions.Celebrate:
                    countObject.CelebrateCount += updateWith;
                    break;
                case (int)Reactions.Love:
                    countObject.LoverCount += updateWith;
                    break;
                case (int)Reactions.Insightful:
                    countObject.InsightfulCount += updateWith;
                    break;
                case (int)Reactions.Curious:
                    countObject.CuriousCount += updateWith;
                    break;
            }
            countObject.ReactionsCount += updateWith;
        }
        [AbpAllowAnonymous]
        public async Task<AppEntityUserReactionDto> GetCurrentUserReaction(long entityId)
        {
            var userId = AbpSession.UserId;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var reactionObj = await _appEntityUserReactions.GetAll().FirstOrDefaultAsync(x => x.EntityId == entityId && x.UserId == userId && x.InteractionType == 'R');
                if (reactionObj != null)
                {
                    return ObjectMapper.Map<AppEntityUserReactionDto>(reactionObj);
                }
                else
                {
                    return null;
                }
            }
        }
        [AbpAllowAnonymous]
        public async Task<AppEntityUserReactionsCountDto> GetUsersReactionsCount(long entityId)
        {
           
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //MMT
                if (entityId != null && entityId != 0)
                {
                    var entity = await _appEntityRepository.GetAll().Where(z => z.Id == entityId).FirstOrDefaultAsync();
                    if (entity != null && (entity.EntityObjectTypeCode == "SALESORDER" || entity.EntityObjectTypeCode == "PURCHASEORDER"))
                    {
                        var transactionSSIN = entity.SSIN;
                        if (!string.IsNullOrEmpty(transactionSSIN))
                        {
                            var entityShared = await _appEntityRepository.GetAll().Where(z => z.SSIN == transactionSSIN && z.TenantId == null).FirstOrDefaultAsync();
                            if (entityShared != null)
                            {
                                entityId = entityShared.Id;
                            }
                        }
                    }
                }
                //MMT
                var countReactionObj = await _appEntityReactionsCount.GetAll().FirstOrDefaultAsync(x => x.EntityId == entityId);
                if (countReactionObj != null)
                {
                    return ObjectMapper.Map<AppEntityUserReactionsCountDto>(countReactionObj);
                }
                else
                { return null; }
            }
        }
        [AbpAllowAnonymous]
        public async Task<PagedResultDto<AppEntityUserReactionsDto>> GetAllUsersReactions(long entityId, int? reaction)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {


                var userReactionObj = _appEntityUserReactions.GetAll()
                    .Where(x => x.EntityId == entityId && x.InteractionType == 'R')
                    .Include(x => x.UserFk)
                    .WhereIf(reaction != null, x => x.ReactionSelected == reaction);


                var pagedAndFilteredContacts = userReactionObj.OrderBy("ActionTime desc").PageBy(new PagedAndSortedResultRequestDto());

                var userReactions = from o in pagedAndFilteredContacts
                                    select new AppEntityUserReactionsDto()
                                    {
                                        Id = o.Id,
                                        ReactionSelected = o.ReactionSelected,
                                        ActionTime = o.ActionTime,
                                        UserId = o.UserId,
                                        UserName = o.UserFk.UserName,
                                        //MMT, Iteration#22 changes[Start]
                                        FirstName = o.UserFk.Name,
                                        LastName = o.UserFk.Surname,
                                        TenantId = o.UserFk.TenantId,
                                        //MMT, Iteration#22 changes[End]
                                        ProfilePictureId = (Guid)o.UserFk.ProfilePictureId
                                    };


                var totalCount = await userReactionObj.CountAsync();

                var reactionList = await userReactions.ToListAsync();
                foreach (var reactionUser in reactionList)
                {
                    var userInfo = await GetUserInformation(reactionUser.UserId);
                    if (userInfo != null)
                    {
                        reactionUser.UserImage = userInfo.UserImage;
                        reactionUser.JobTitle = userInfo.JobTitle;
                        reactionUser.AccountName = userInfo.AccountName;
                    }
                    //MMT, Iteration#22 changes[Start]
                    if (reactionUser.TenantId != null)
                    {
                        var tenant = await TenantManager.FindByIdAsync(int.Parse(reactionUser.TenantId.ToString()));
                        if (tenant != null)
                            reactionUser.TenancyName = tenant.TenancyName;
                    }
                    else
                    {
                        reactionUser.TenancyName = "";
                    }
                    //MMT, Iteration#22 changes[End]

                }
                var x = new PagedResultDto<AppEntityUserReactionsDto>(
                        totalCount, reactionList);

                return x;
            }

        }
        private async Task<UserInformationDto> GetUserInformation(long userId)
        {
            var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("LOGO");
            var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().FirstOrDefault(x => x.AttributeId == 715 && x.AttributeValue == userId.ToString());
            if (contactEntityExtraData != null)
            {
                UserInformationDto userInformationDto = new UserInformationDto();
                var contact = _appContactRepository.GetAll().Include(x => x.AccountFk).Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                    .FirstOrDefault(x => x.EntityId == contactEntityExtraData.EntityId);
                if (contact != null)
                {
                    if (contact.EntityFk.EntityAttachments.Count > 0 && contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId) != null)
                        userInformationDto.UserImage = string.IsNullOrEmpty(contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment) ?
                                                 ""
                                                 : "attachments/" + (contact.EntityFk.TenantId == null ? "-1" : contact.EntityFk.TenantId.ToString()) + "/" + contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment;
                    userInformationDto.JobTitle = contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706) == null ? "" : contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706).AttributeValue;
                    userInformationDto.AccountName = contact.AccountFk.Name;
                    userInformationDto.UserName = contact.Name;
                }
                return userInformationDto;
            }
            else
            {
                return null;
            }
        }
        [AbpAllowAnonymous]
        #endregion Reactions
        #region Ranking functions
        /*
            Fetch top (n) of posts according to Rank ( No. of reactions and views ) in a specific date range
         */
        public async Task<List<TopPostDto>> GetTopPosts(int numberOfPosts, int numberOfDays)
        {
            // adjust Attachment Url
            string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
            var obJectPostId = await _helper.SystemTables.GetObjectPostId();
            // disabling auto filter with current tenant data to get all data regardless it is created by whom
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                // get top posts (entity ids) by ranks
                var topEntitiesReactions = await _appEntityUserReactions.GetAll()
                    .Include(x => x.UserFk)
                    .Include(x => x.EntityFk)
                    .AsNoTracking()
                    .Where(x => x.EntityFk.ObjectId == obJectPostId && x.TenantId > 0 && x.ActionTime.Date <= DateTime.Now.Date && x.ActionTime.Date >= DateTime.Now.Date.AddDays(-1 * numberOfDays))
                    .GroupBy(p => p.EntityId)
                    .Select(g => new { EntityId = g.Key, rank = g.Count() })
                    .OrderByDescending(x => x.rank)
                    .Take(numberOfPosts)
                    .ToListAsync();

                // get the post data of the fetched posts
                var topPosts = from te in topEntitiesReactions
                               join p in _appPostRepository.GetAll()
                                                            .Include(p => p.AppContactFk)
                                                            .Include(p => p.AppEntityFk)
                                                            .ThenInclude(e => e.EntityAttachments)
                                                            .ThenInclude(a => a.AttachmentFk)
                               on te.EntityId equals p.AppEntityId into mp
                               from tp in mp.DefaultIfEmpty()
                               select new TopPostDto()
                               {
                                   Id = tp.Id,
                                   AppPost = new AppPostDto
                                   {
                                       Id = tp.Id,
                                       Code = tp.Code,
                                       Description = tp.Description,
                                       CreatorUserId = tp.CreatorUserId,
                                       CreationDatetime = tp.CreationTime,
                                       TenantId = tp.TenantId,
                                       AppEntityId = tp.AppEntityId,

                                   },
                                   UserId = (long)tp.CreatorUserId,
                                   ImageUrl = tp.AppEntityFk.EntityAttachments.Count() == 0 ? "" : $"{imagesUrl}{(tp.TenantId == null ? -1 : tp.TenantId)}/{tp.AppEntityFk?.EntityAttachments.FirstOrDefault()?.AttachmentFk?.Attachment}",
                                   CreatedOn = tp.CreationTime.ToLongDateString(),
                                   UserName = UserManager.GetUserById((long)tp.CreatorUserId)?.FullName,
                                   Type = tp.AppEntityFk.EntityObjectTypeCode,
                                   Description = ((string.IsNullOrEmpty(tp.Description)) || (!string.IsNullOrEmpty(tp.Description) && tp.Description.Length < 20)) ? tp.Description : tp.Description.Substring(0, 20) + "....."
                               };
                List<TopPostDto> _topPosts = topPosts.ToList();

                return _topPosts;
            }

        }
        [AbpAllowAnonymous]
        /*
            Fetch Top (n) Users according to Rank ( No. of reactions and views ) in a specific date range
         */
        public async Task<List<UserInformationDto>> GetTopContributors(int numberOfUsers, int numberOfDays)
        {
            // disabling auto filter with current tenant data to get all data regardless it is created by whom
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                // initialize userslist
                List<UserInformationDto> usersList = new List<UserInformationDto>();
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"\";

                // fetch top interacted users ids
                var topUsersIds = await _appEntityUserReactions.GetAll()
                  .AsNoTracking()
                  .Where(x => x.TenantId > 0 && x.ActionTime.Date <= DateTime.Now.Date && x.ActionTime.Date >= DateTime.Now.Date.AddDays(-1 * numberOfDays))
                  .GroupBy(t => t.UserId)
                  .Select(t => new { UserId = t.Key, Rank = t.Count() })
                  .OrderByDescending(x => x.Rank)
                  .Take(numberOfUsers)
                  .ToListAsync();

                // load top users data 
                foreach (var user in topUsersIds)
                {
                    var userInfo = await GetUserInformation(user.UserId);
                    if (userInfo == null)
                    {
                        userInfo = new UserInformationDto();
                        userInfo.AccountId = 0;
                        var systemUser = UserManager.Users.FirstOrDefault(x => x.Id == user.UserId);
                        if (systemUser != null && systemUser.Id > 0)
                        {
                            userInfo.UserName = systemUser.FullName;
                            var profilePictureId = systemUser.ProfilePictureId;
                            if (profilePictureId != null)
                            {
                                userInfo.UserImage = "data:image/jpeg;base64," + _iProfileAppService.GetProfilePictureById((Guid)profilePictureId).Result.ProfilePicture;
                            }
                            else { userInfo.UserImage = "assets/common/images/default-profile-picture.png"; }
                        }

                    }
                    userInfo.Id = user.UserId;

                    var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().Include(r => r.EntityFk).FirstOrDefault(x => x.AttributeId == 715 && x.AttributeValue == user.UserId.ToString());
                    if (contactEntityExtraData != null)
                    {
                        var contact = _appContactRepository.GetAll().FirstOrDefault(x => x.EntityId == contactEntityExtraData.EntityId);
                        if (contact != null)
                        {
                            userInfo.AccountId = contact.Id;
                        }
                    }

                    usersList.Add(userInfo);
                }
                return usersList;
            }
        }

        [AbpAllowAnonymous]
        /*
            Fetch Top (n) Accounts according to Rank ( No. of reactions and views ) in a specific date range
         */
        public async Task<List<TopCompany>> GetTopCompanies(int numberOfCompanies, int numberOfDays)
        {
            // adjust Attachment Url
            string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
            // disabling auto filter with current tenant data to get all data regardless it is created by whom
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                // get account image category id
                var logoCategory = await _helper.SystemTables.GetAttachmentCategoryLogoId();
                //initialize company list
                List<TopCompany> companyList = new List<TopCompany>();
                //fetch top accounts (tenant ids)
                var topCompanies = await _appEntityUserReactions.GetAll()
              .AsNoTracking()
              .Where(x => x.TenantId > 0 && x.ActionTime.Date <= DateTime.Now.Date && x.ActionTime.Date >= DateTime.Now.Date.AddDays(-1 * numberOfDays))
              .GroupBy(p => p.TenantId)
              .Select(g => new { TenantId = g.Key, Rank = g.Count() })
              .OrderByDescending(x => x.Rank)
              .Take(numberOfCompanies)
              .ToListAsync();

                // get the account data of fetched tanant ids
                var query = from tc in topCompanies
                            join ac in _appContactRepository.GetAll()
                                                            .Where(x => x.IsProfileData && x.ParentId == null && x.PartnerId == null && x.AccountId == null)
                                                            .Include(c => c.EntityFk)
                                                            .ThenInclude(e => e.EntityAttachments)
                                                            .ThenInclude(a => a.AttachmentFk)
                                                            .DefaultIfEmpty()
                            on tc.TenantId equals ac.TenantId into abc
                            from a in abc.DefaultIfEmpty()
                            join lc in _appContactRepository.GetAll().Where(x => x.TenantId == null && x.IsProfileData == false && x.ParentId == null && x.AccountId == null)
                                                            .Include(c => c.EntityFk)
                                                            .ThenInclude(e => e.EntityAttachments)
                                                            .ThenInclude(a => a.AttachmentFk)
                                                            .DefaultIfEmpty()
                            on a?.Id equals lc?.PartnerId into mc
                            where a != null
                            from c in mc.DefaultIfEmpty()
                            where c != null
                            select new TopCompany
                            {
                                AccountId = (c == null ? (long)a.Id : (long)c.Id),
                                AccountName = (c == null ? a?.Name : c?.Name),
                                TenantId = (c != null ? (c.TenantId == null ? 0 : (long)c?.TenantId) : (a?.TenantId == null ? 0 : (long)a?.TenantId)),
                                LogoUrl = c != null ? (c?.EntityFk?.EntityAttachments?.FirstOrDefault(e => e.AttachmentCategoryId == logoCategory) == null ? "" : $"{imagesUrl}{(c.TenantId == null ? -1 : c.TenantId)}/{c.EntityFk?.EntityAttachments?.FirstOrDefault(e => e.AttachmentCategoryId == logoCategory)?.AttachmentFk?.Attachment}")
                                : (a?.EntityFk?.EntityAttachments?.FirstOrDefault(e => e.AttachmentCategoryId == logoCategory) == null ? "" : $"{imagesUrl}{(a.TenantId == null ? -1 : a.TenantId)}/{a.EntityFk?.EntityAttachments?.FirstOrDefault(e => e.AttachmentCategoryId == logoCategory)?.AttachmentFk?.Attachment}")
                            };
                companyList = query.ToList();
                return companyList;
            }
        }
        #endregion Ranking functions
        [AbpAuthorize(AppPermissions.Pages_AppEntities_Edit)]
        public async Task UpdateAppEntityNotes(long entityId, string notes)
        {
            var entityObj = await _appEntityRepository.GetAll().Where(x => x.Id == entityId).FirstOrDefaultAsync();
            if (entityObj != null)
            {
                entityObj.Notes = notes;
                await _appEntityRepository.UpdateAsync(entityObj);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }
        public async Task<string> GetAppEntityNotes(long entityId)
        {
            var entityObj = await _appEntityRepository.GetAll().Where(x => x.Id == entityId).FirstOrDefaultAsync();
            if (entityObj != null)
            {
                return entityObj.Notes;
                
            }
            return "";
        }
        public async Task<List<ContactInformationOutputDto>> GetContactsToMention(long entityId,string? filter)
        {

            List<ContactInformationOutputDto> outputList = new List<ContactInformationOutputDto>();
            var entity = await _appEntityRepository.GetAll().Where(a => a.Id == entityId).FirstOrDefaultAsync();
            if (entity != null)
            {
                if (entity.EntityObjectTypeCode.ToUpper() == "SALESORDER" || entity.EntityObjectTypeCode.ToUpper() == "PURCHASEORDER")
                {
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                    {
                        var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();

                        var transactionContacts = _appTransactionContactsRepository.GetAll().Where(z => z.TransactionId == entityId && z.CompanySSIN != null && z.ContactSSIN!=null); //&& z.CompanySSIN !=null

                        /*var appEntities = _appEntityRepository.GetAll().Include(z => z.EntityExtraData.Where(s => s.AttributeId == 715))
                                  .Where(z => z.TenantId == null && z.EntityObjectTypeId == presonEntityObjectTypeId && z.TenantOwner != null);*/

                        var contactsList = _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityExtraData.Where(s => s.AttributeId == 715))
                                  .Where(z => z.TenantId == null && z.ParentId != null && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId);


                        var contact = from t in transactionContacts
                                      join
                                      c in contactsList
                                      on t.ContactSSIN equals c.SSIN into j
                                      from e in j.DefaultIfEmpty()
                                      select new { e.AccountId };

                        var transactionContactsList =await  contact.Distinct().ToListAsync();
                        
                        /*var newContact = from x in contact
                                         join y in appEntities
                                         on x.contact.TenantOwner equals y.TenantOwner into j1
                                         from z in j1.DefaultIfEmpty()
                                         select new { contact = z };*/
                        foreach (var acc in transactionContactsList)
                        {
                            var contacts = await _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityExtraData.Where(s => s.AttributeId == 715))
                                .Where(z => z.TenantId == null &&  z.AccountId==acc.AccountId).ToListAsync();
                            //await newContact.WhereIf(!string.IsNullOrEmpty(filter), z => z.contact.Name.Contains(filter)).OrderBy(z => z.contact.Id).ToListAsync();

                            if (contacts != null && contacts.Count() > 0)
                            {

                                foreach (var con in contacts)
                                {
                                    if (con == null || con.EntityFk.EntityExtraData == null || con.EntityFk.EntityExtraData.Count == 0 || 
                                        con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue == null)

                                        continue;

                                    try
                                    {
                                        var user = UserManager.GetUserById(long.Parse(con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue));
                                        if (user != null)
                                        {
                                            //ContactRoleEnum role = (ContactRoleEnum)Enum.Parse(typeof(ContactRoleEnum), con.role);
                                            var tenantObj = TenantManager.GetById(int.Parse(user.TenantId.ToString()));
                                            if (outputList.FirstOrDefault(z => z.UserId == long.Parse(con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue)) == null)
                                                outputList.Add(new ContactInformationOutputDto
                                                {
                                                    Id = con.Id,
                                                    Email = con.EMailAddress,
                                                    Name = con.Name,
                                                    UserId = long.Parse(con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue),
                                                    UserImage = user != null && user.ProfilePictureId != null ? Guid.Parse(user.ProfilePictureId.ToString()) : null,
                                                    UserName = user.UserName,
                                                    TenantId = int.Parse(user.TenantId.ToString()),
                                                    TenantName = tenantObj != null ? tenantObj.TenancyName : "SIIWII"
                                                    // CanBeRemoved = (role == ContactRoleEnum.Creator || role == ContactRoleEnum.Seller || role == ContactRoleEnum.Buyer) ? false : true
                                                });

                                        }
                                    }
                                    catch { }
                                }
                            }
                        }
                    }
                }
                else
                {
                    var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                    var contacts = await _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityExtraData.Where(s => s.AttributeId == 715))
                 .WhereIf(!string.IsNullOrEmpty(filter), z => z.Name.Contains(filter))
                .Where(z => z.TenantId == AbpSession.TenantId && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId).ToListAsync();

                    if (contacts != null && contacts.Count() > 0)
                    {
                        foreach (var con in contacts)
                        {
                            if (con.EntityFk.EntityExtraData != null && con.EntityFk.EntityExtraData.FirstOrDefault() != null && con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue != null)
                            {
                                try
                                {
                                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                                    {
                                        var user = UserManager.GetUserById(long.Parse(con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue));
                                        if (user != null)
                                        {
                                            var tenantObj = TenantManager.GetById(int.Parse(user.TenantId.ToString()));
                                            outputList.Add(new ContactInformationOutputDto
                                            {
                                                Id = con.Id,
                                                Email = con.EMailAddress,
                                                Name = con.Name,
                                                UserId = long.Parse(con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue),
                                                UserImage = user != null && user.ProfilePictureId != null ? Guid.Parse(user.ProfilePictureId.ToString()) : null,
                                                UserName = user.UserName,
                                                TenantId = int.Parse(user.TenantId.ToString()),
                                                TenantName = tenantObj != null ? tenantObj.TenancyName : "SIIWII"
                                            });
                                        }
                                    }
                                }
                                catch (Exception ex)
                                { }
                            }
                        }

                    }
                }
            }
            return outputList;
        }
        public async Task<bool> IsCodeExisting(AppEntityDto input)
        {
            
            var entity = await _appEntityRepository.GetAll().Where(z => z.Code == input.Code && z.TenantId == AbpSession.TenantId && z.EntityObjectTypeId == input.EntityObjectTypeId &&
            z.ObjectId == input.ObjectId).FirstOrDefaultAsync();
            if (entity != null)
                return true;
            else
                return false;

        }
        public async Task<LookupLabelDto> ConvertAppEntityDtoToLookupLabelDto(AppEntityDto input)
        {
            string imagesUrl = _appConfiguration[$"Attachment:PathTemp"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
            LookupLabelDto returnObject = new LookupLabelDto();
            returnObject.Code = input.Code;
            returnObject.Label = input.Name;
            returnObject.Value = input.Id;
            returnObject.IsHostRecord = input.TenantId == null;
            returnObject.HexaCode = (input.EntityExtraData != null && input.EntityExtraData.Where(z => z.AttributeId == 39).FirstOrDefault() != null) ? input.EntityExtraData.Where(z => z.AttributeId == 39).FirstOrDefault().AttributeValue : "";
            returnObject.Image = (input.EntityAttachments != null && input.EntityAttachments.FirstOrDefault() != null && input.EntityAttachments.FirstOrDefault().guid != null) ?
                          (imagesUrl + input.TenantId.ToString() + @"/" + input.EntityAttachments.FirstOrDefault().guid.ToString()+"."+ input.EntityAttachments.FirstOrDefault().FileName.Split('.')[1]) : "";

            return returnObject;
        }
        public async Task<AppEntityDto> ConvertAppLookupLabelDtoToEntityDto(LookupLabelDto input)
        {
            AppEntityDto returnObject = new AppEntityDto();
            returnObject.Code = input.Code;
            returnObject.Id = input.Value;
            returnObject.Name = input.Label;
            if (!string.IsNullOrEmpty(input.Image))
            {
                returnObject.EntityAttachments = new List<AppEntityAttachmentDto>();
                AppEntityAttachmentDto attach = new AppEntityAttachmentDto();
                attach.FileName = Path.GetFileName(input.Image);
                attach.Url = input.Image;
                attach.guid =  Path.GetFileNameWithoutExtension(input.Image);
                returnObject.EntityAttachments.Add(attach);
            }
            if (!string.IsNullOrEmpty(input.HexaCode))
            {
                returnObject.EntityExtraData = new List<AppEntityExtraDataDto>();
                AppEntityExtraDataDto extra = new AppEntityExtraDataDto();
                extra.AttributeId = 39;
                extra.AttributeValue = input.HexaCode;
                returnObject.EntityExtraData.Add(extra);

            }
            return returnObject;
        }
    }
}