using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Linq.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using onetouch.AppContacts;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.AppPosts.Dtos;
using onetouch.AppPosts.Exporting;
using onetouch.Authorization;
using onetouch.Authorization.Users;
using onetouch.Authorization.Users.Profile;
using onetouch.Authorization.Users.Profile.Dto;
using onetouch.Configuration;
using onetouch.Dto;
using onetouch.Helpers;
using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using PuppeteerSharp;
using System.IO;
using System.Net;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Drawing;
using Abp.UI;
using System.Management.Automation.Language;
using NPOI.SS.Formula.Functions;
using Abp.Collections.Extensions;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Humanizer;

namespace onetouch.AppPosts
{
    [AbpAuthorize(AppPermissions.Pages_AppPosts)]
    public class AppPostsAppService : onetouchAppServiceBase, IAppPostsAppService
    {
        private readonly IRepository<AppContact, long> _lookup_appContactRepository;
        private readonly IRepository<AppEntity, long> _lookup_appEntityRepository;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IRepository<AppPost, long> _appPostRepository;
        private readonly IAppPostsExcelExporter _appPostsExcelExporter;
        private readonly IProfileAppService _iProfileAppService;
        private readonly ISycAttachmentCategoriesAppService _sSycAttachmentCategoriesAppService;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly Helper _helper;
        private readonly IRepository<AppEntityReactionsCount, long> _appEntityReactionsCount;
        private readonly IRepository<AppEntityUserReactions, long> _appEntityUserReactions;

        public AppPostsAppService(IRepository<AppPost, long> appPostRepository, 
            IAppPostsExcelExporter appPostsExcelExporter,
            IRepository<AppContact, long> lookup_appContactRepository, 
            IRepository<AppEntity, long> lookup_appEntityRepository,
            IProfileAppService iProfileAppService, Helper helper,
            IAppEntitiesAppService appEntitiesAppService,
            IAppConfigurationAccessor appConfigurationAccessor, 
            ISycAttachmentCategoriesAppService sSycAttachmentCategoriesAppService,
            IRepository<AppEntityReactionsCount, long> appEntityReactionsCount,
            IRepository<AppEntityUserReactions, long> appEntityUserReactions
            )
        {
            _lookup_appContactRepository = lookup_appContactRepository;
            _lookup_appEntityRepository = lookup_appEntityRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _appPostsExcelExporter = appPostsExcelExporter;
            _iProfileAppService = iProfileAppService;
            _appPostRepository = appPostRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _sSycAttachmentCategoriesAppService = sSycAttachmentCategoriesAppService;
            _helper = helper;
            _appEntityUserReactions = appEntityUserReactions;
            _appEntityReactionsCount = appEntityReactionsCount;
        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<GetAppPostForViewDto>> GetAll(GetAllAppPostsInput input)
        {
            //Iteration#29,1 MMT News Digest changes[Start]
            long? entityType = null;
            if (input.TypeFilter!=null)
               entityType = await _helper.SystemTables.GetEntityObjectTypePostTypeId(input.TypeFilter.ToString());

            //Iteration#29,1 MMT News Digest changes[Start]
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //"​/api​/services​/app​/Profile​/GetProfilePictureById"
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                var filteredAppPosts = _appPostRepository.GetAll()
                        .Include(e => e.AppContactFk)
                        .Include(e => e.AppEntityFk)
                        .Include(e => e.AppEntityFk).ThenInclude (e => e.AppEntityReactionsCount)
                        .WhereIf(input.PostId > 0, e=> e.Id== input.PostId)
                         //Iteration#29,1 MMT News Digest changes[Start]
                         //.WhereIf(!string.IsNullOrWhiteSpace(input.Filter),e => false || e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter))
                         .WhereIf(!string.IsNullOrWhiteSpace(input.Filter),
                        e => false || e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter) || e.AppEntityFk.Name.Contains(input.Filter))
                        //Iteration#29,1 MMT News Digest changes[Start]
                        .WhereIf (entityType!=null, x=> x.AppEntityFk.EntityObjectTypeId == entityType)
                        //.WhereIf(!string.IsNullOrEmpty(input.FromCreationDateFilter.ToString()) && !string.IsNullOrEmpty(input.ToCreationDateFilter.ToString())
                        //, x => x.CreationTime >= input.FromCreationDateFilter && x.CreationTime <= input.ToCreationDateFilter )
                        .WhereIf(!string.IsNullOrEmpty(input.FromCreationDateFilter.ToString())
                        , x => x.CreationTime >= input.FromCreationDateFilter )
                        .WhereIf(!string.IsNullOrEmpty(input.ToCreationDateFilter.ToString())
                        , x => x.CreationTime <= input.ToCreationDateFilter )
                        //Iteration#29,1 MMT News Digest changes[End]
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppContactNameFilter), e => e.AppContactFk != null && e.AppContactFk.Name == input.AppContactNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppEntityNameFilter), e => e.AppEntityFk != null && e.AppEntityFk.Name == input.AppEntityNameFilter);

                var pagedAndFilteredAppPosts = filteredAppPosts;

                //Iteration#29,1 MMT News Digest changes[Start]
                if (!string.IsNullOrEmpty(input.Sorting))//NewsDigestSortOptions.SORTBYDATEASC 
                {  
                    NewsDigestSortOptions result;
                    var res = Enum.TryParse<NewsDigestSortOptions>(input.Sorting, out result);
                    if (res)
                    {
                        switch (result)
                        {
                            case NewsDigestSortOptions.SORTBYDATEASC:
                                pagedAndFilteredAppPosts = filteredAppPosts
                                                      .OrderBy("CreationTime asc")
                                                      .PageBy(input);
                                break;
                            case NewsDigestSortOptions.SORTBYDATEDESC :
                                pagedAndFilteredAppPosts = filteredAppPosts
                                                      .OrderBy("CreationTime desc")
                                                      .PageBy(input);
                                break;
                            case NewsDigestSortOptions.SORTBYTITLE:
                                pagedAndFilteredAppPosts = filteredAppPosts
                                                      .OrderBy("Description asc")
                                                      .PageBy(input);
                                break;
                            case NewsDigestSortOptions.SORTBYVIEWSASC:
                                pagedAndFilteredAppPosts = filteredAppPosts
                                                      .OrderBy(a=>a.AppEntityFk.AppEntityReactionsCount.ViewersCount)
                                                      .PageBy(input);
                                break;
                            case NewsDigestSortOptions.SORTBYVIEWSDESC:
                                pagedAndFilteredAppPosts = filteredAppPosts
                                                      .OrderByDescending(a => a.AppEntityFk.AppEntityReactionsCount.ViewersCount)
                                                      .PageBy(input);
                                break;

                    

                        }
                    }
                    else
                    {
                        pagedAndFilteredAppPosts = filteredAppPosts
                        .OrderBy(input.Sorting ?? "id desc")
                        .PageBy(input);
                    }
                }
                else
                {
                    pagedAndFilteredAppPosts = filteredAppPosts
                    .OrderBy(input.Sorting ?? "id desc")
                    .PageBy(input);
                }
                //Iteration#29,1 MMT News Digest changes[Start]
                var appPosts = from o in pagedAndFilteredAppPosts
                               join o1 in _lookup_appContactRepository.GetAll() on o.AppContactId equals o1.Id into j1
                               from s1 in j1.DefaultIfEmpty()
                               join o2 in _lookup_appEntityRepository.GetAll() on o.AppEntityId equals o2.Id into j2
                               from s2 in j2.DefaultIfEmpty()
                               //xx
                               //join o3 in _appEntityReactionsCount.GetAll () on  o.AppEntityId equals o3.EntityId into j3 
                               //from s3 in j3.DefaultIfEmpty() orderby s3.ViewersCount  descending 
                                   //xx
                               select new GetAppPostForViewDto()
                               {
                                   AppPost = new AppPostDto
                                   {
                                       Id = o.Id,
                                       Code = o.Code,
                                       Description = o.Description,
                                       CreatorUserId = o.CreatorUserId,
                                       CreationDatetime = o.CreationTime,
                                       TenantId = o.TenantId,
                                       AppEntityId = o.AppEntityId,
                                       
                                   },
                                   UrlTitle = o.UrlTitle,
                                   EntityObjectTypeCode = s2 == null || s2.EntityObjectTypeCode == null ? "" : s2.EntityObjectTypeCode,
                                   AppContactName = s1 == null || s1.Name == null ? "" : s1.Name.ToString(),
                                   AppEntityName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                                   //AppEntityName = o.AppEntityFk.TenantId == null ? "-1" : o.AppEntityFk.TenantId.ToString(),
                                   CanEdit = (o.CreatorUserId == AbpSession.UserId),
                                   //AttachmentsURLs = s2.EntityAttachments.Select(r =>  r.AttachmentFk.Attachment).ToList(),
                                   AttachmentsURLs = s2.EntityAttachments.Select(r => imagesUrl + (o.TenantId == null ? "-1" : o.TenantId.ToString()) + @"/" + r.AttachmentFk.Attachment).ToList(),
                               };

                var totalCount = await filteredAppPosts.CountAsync();
                var dbList = await appPosts.ToListAsync();
                var results = new List<GetAppPostForViewDto>();

                foreach (var o in dbList)
                {
                    var currPublishContact = await _lookup_appContactRepository.GetAll().Include(x => x.PartnerFkList).FirstOrDefaultAsync(x => x.TenantId == null && !x.IsProfileData && x.ParentId == null & (x.PartnerFk != null ? x.PartnerFk.TenantId == o.AppPost.TenantId : false ));
                    if (currPublishContact != null) {
                        o.AppPost.AccountId = currPublishContact.Id;
                        o.AppPost.AccountName = currPublishContact.Name;
                    }
                    o.AppPost.UserName = UserManager.Users.FirstOrDefault(x => x.Id == o.AppPost.CreatorUserId && x.TenantId == o.AppPost.TenantId).FullName;
                    if (o.AppPost.AccountName == null) {
                        o.AppPost.AccountName = o.AppPost.TenantId == null ? "" : TenantManager.GetById((int)o.AppPost.TenantId).Name;
                    }
                    //o.AppPost.ProfilePictureId = Guid.Parse("7AE60C74-2523-EBAF-BDD5-39FE1E7099B0");
                    var profilePictureId = UserManager.Users.FirstOrDefault(x => x.Id == o.AppPost.CreatorUserId && x.TenantId == o.AppPost.TenantId).ProfilePictureId;
                    if (profilePictureId != null)
                    { o.AppPost.ProfilePictureId = (Guid)profilePictureId; }
                    //string tenant = imagesUrl + o.AppPost.TenantId == null ? "-1" : o.AppPost.TenantId.ToString() + @"/";
                    //o.AttachmentsURLs = o.AttachmentsURLs.Select(r => tenant + r).ToList();

                   // o.AppPost.UserImage = await _iProfileAppService.GetProfilePictureById(o.AppPost.ProfilePictureId);
                    try
                    {
                        o.Type = ((PostType)Enum.Parse(typeof(PostType), o.EntityObjectTypeCode));
                    }
                    catch (Exception ex)
                    {
                    }
                    results.Add(o);

                }

                return new PagedResultDto<GetAppPostForViewDto>(
                    totalCount,
                    results);
            }
        }

        //xx
        //Iteration#29,1 MMT News Digest changes[Start]
        [AbpAllowAnonymous]
        public async Task<List<GetAppPostForViewDto>> GetTopNewsDigest(int noOfPosts, int noOfDays)
        {
            long entityType = await _helper.SystemTables.GetEntityObjectTypePostTypeId(PostType.NEWSDIGEST.ToString ());
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //"​/api​/services​/app​/Profile​/GetProfilePictureById"
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                var filteredAppPosts = _appPostRepository.GetAll()
                        .Include(e => e.AppContactFk)
                        .Include(e => e.AppEntityFk)
                        .Where(x => x.AppEntityFk.EntityObjectTypeId == entityType &&
                         (x.CreationTime.Date  >= DateTime.Now.Date.AddDays(-1 * noOfDays)
                         && x.CreationTime.Date <= DateTime.Now.Date)).OrderByDescending  (a=>a.CreationTime).Take(noOfPosts);

                var appPosts = from o in filteredAppPosts
                               join o1 in _lookup_appContactRepository.GetAll() on o.AppContactId equals o1.Id into j1
                               from s1 in j1.DefaultIfEmpty()
                               join o2 in _lookup_appEntityRepository.GetAll() on o.AppEntityId equals o2.Id into j2
                               from s2 in j2.DefaultIfEmpty()
                               select new GetAppPostForViewDto()
                               {
                                   AppPost = new AppPostDto
                                   {
                                       Id = o.Id,
                                       Code = o.Code,
                                       Description = o.Description,
                                       CreatorUserId = o.CreatorUserId,
                                       CreationDatetime = o.CreationTime,
                                       TenantId = o.TenantId,
                                       AppEntityId = o.AppEntityId,
                                      
                                   },
                                  // TimePassedFromCreation = DateTime.UtcNow.AddMinutes(-1 * double.Parse((DateTime.UtcNow  - o.CreationTime.ToUniversalTime()).Minutes.ToString()))
                                  // .Humanize(null,null,System.Globalization.CultureInfo.CurrentCulture),//o.CreationTime.Date != DateTime.Now.Date ?
                                  // DateTime.UtcNow.AddDays(-1 * double.Parse((DateTime.Now.Date - o.CreationTime.Date).ToString())).Humanize() : "",
                                  // DateTime.UtcNow.AddMinutes(-1 * double.Parse((DateTime.Now - o.CreationTime).ToString())).Humanize(),
                                   UrlTitle = o.UrlTitle,
                                   EntityObjectTypeCode = s2 == null || s2.EntityObjectTypeCode == null ? "" : s2.EntityObjectTypeCode,
                                   AppContactName = s1 == null || s1.Name == null ? "" : s1.Name.ToString(),
                                   AppEntityName = s2 == null || s2.Name == null ? "" : s2.Name.ToString(),
                                   CanEdit = (o.CreatorUserId == AbpSession.UserId),
                                   AttachmentsURLs = s2.EntityAttachments.Select(r => imagesUrl + (o.TenantId == null ? "-1" : o.TenantId.ToString()) + @"/" + r.AttachmentFk.Attachment).ToList(),
                               };

                var dbList = await appPosts.ToListAsync();
                var results = new List<GetAppPostForViewDto>();

                foreach (var o in dbList)
                {
                    if (DateTime.UtcNow.Date == o.AppPost.CreationDatetime.ToUniversalTime().Date)
                    {
                        if (DateTime.UtcNow.Hour == o.AppPost.CreationDatetime.ToUniversalTime().Hour)
                            o.TimePassedFromCreation = DateTime.UtcNow.AddMinutes(-1 * double.Parse((DateTime.UtcNow - o.AppPost.CreationDatetime.ToUniversalTime()).Minutes.ToString()))
                                     .Humanize(null, null, System.Globalization.CultureInfo.CurrentCulture);
                        else
                        {
                            double hrs  = double.Parse((DateTime.UtcNow - o.AppPost.CreationDatetime.ToUniversalTime()).Hours.ToString());
                            double mins = double.Parse((DateTime.UtcNow - o.AppPost.CreationDatetime.ToUniversalTime()).Minutes.ToString());
                            o.TimePassedFromCreation = DateTime.UtcNow.AddMinutes(-1 * ((hrs * 60)+mins)).Humanize(null, null, System.Globalization.CultureInfo.CurrentCulture);
                        }
                    }
                    else
                        o.TimePassedFromCreation = DateTime.UtcNow.AddDays(-1 * double.Parse((DateTime.UtcNow.Date - o.AppPost.CreationDatetime.ToUniversalTime().Date).Days.ToString()))
                                     .Humanize(null, null, System.Globalization.CultureInfo.CurrentCulture);

                    var currPublishContact = await _lookup_appContactRepository.GetAll().Include(x => x.PartnerFkList).FirstOrDefaultAsync(x => x.TenantId == null && !x.IsProfileData && x.ParentId == null & (x.PartnerFk != null ? x.PartnerFk.TenantId == o.AppPost.TenantId : false));
                    if (currPublishContact != null)
                    {
                        o.AppPost.AccountId = currPublishContact.Id;
                        o.AppPost.AccountName = currPublishContact.Name;
                    }
                    o.AppPost.UserName = UserManager.Users.FirstOrDefault(x => x.Id == o.AppPost.CreatorUserId && x.TenantId == o.AppPost.TenantId).FullName;
                    if (o.AppPost.AccountName == null)
                    {
                        o.AppPost.AccountName = o.AppPost.TenantId == null ? "" : TenantManager.GetById((int)o.AppPost.TenantId).Name;
                    }
                    var profilePictureId = UserManager.Users.FirstOrDefault(x => x.Id == o.AppPost.CreatorUserId && x.TenantId == o.AppPost.TenantId).ProfilePictureId;
                    if (profilePictureId != null)
                    { o.AppPost.ProfilePictureId = (Guid)profilePictureId; }
                    try
                    {
                        o.Type = ((PostType)Enum.Parse(typeof(PostType), o.EntityObjectTypeCode));
                    }
                    catch (Exception ex)
                    {
                    }
                    results.Add(o);

                }

                return results;
            }
        
        }
        //Iteration#29,1 MMT News Digest changes[End]

        [AbpAllowAnonymous]
        public async Task<GetProfilePictureOutput> GetProfilePictureAllByID(Guid profilePictureId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                return await _iProfileAppService.GetProfilePictureById(profilePictureId);
            }
        }


        [AbpAuthorize(AppPermissions.Pages_AppPosts_Edit)]
        public async Task<GetAppPostForEditOutput> GetAppPostForEdit(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"\";
                var appPost = await _appPostRepository.FirstOrDefaultAsync(input.Id);
                var output = new GetAppPostForEditOutput { AppPost = ObjectMapper.Map<CreateOrEditAppPostDto>(appPost) };

                if (output.AppPost.AppContactId != null && output.AppPost.AppContactId > 0)
                {
                    var _lookupAppContact = await _lookup_appContactRepository.FirstOrDefaultAsync((long)output.AppPost.AppContactId);
                    output.AppContactName = _lookupAppContact?.Name?.ToString();
                }

                if (output.AppPost.AppEntityId != null && output.AppPost.AppEntityId > 0)
                {
                    var _lookupAppEntity = await _lookup_appEntityRepository.GetAll()
                    .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    .FirstOrDefaultAsync(x => x.Id == (long)output.AppPost.AppEntityId);

                    output.AppEntityName = _lookupAppEntity?.Name?.ToString();
                    if (_lookupAppEntity.EntityAttachments != null)
                    { output.AttachmentsURLs = _lookupAppEntity.EntityAttachments.Select(r => imagesUrl + r.AttachmentFk.Attachment).ToList();
                      //  output.Attachments = ObjectMapper.Map<IList<AttachmentInfoDto>>(_lookupAppEntity.EntityAttachments);
                    }
                    output.EntityObjectTypeCode = _lookupAppEntity.EntityObjectTypeCode;
                }

                output.AppPost.UserName = UserManager.Users.FirstOrDefault(x => x.Id == output.AppPost.CreatorUserId && x.TenantId == output.AppPost.TenantId).FullName;
                output.AppPost.TenantName = output.AppPost.TenantId == null ? "" : TenantManager.GetById((int)output.AppPost.TenantId).Name;
                output.AppPost.ProfilePictureId = (Guid)UserManager.Users.FirstOrDefault(x => x.Id == output.AppPost.CreatorUserId && x.TenantId == output.AppPost.TenantId).ProfilePictureId;

                try
                {
                    output.Type = ((PostType)Enum.Parse(typeof(PostType), output.EntityObjectTypeCode));
                }
                catch (Exception ex)
                {
                }

                output.CanEdit = (output.AppPost.CreatorUserId == AbpSession.UserId);
                
                return output;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppPosts_Edit)]
        public async Task<GetAppPostForViewOutput> GetAppPostForView(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var appPost = await _appPostRepository.FirstOrDefaultAsync(input.Id);
                var output = new GetAppPostForViewOutput { AppPost = ObjectMapper.Map<CreateOrEditAppPostDto>(appPost) };

                if (output.AppPost.AppContactId != null && output.AppPost.AppContactId > 0)
                {
                    var _lookupAppContact = await _lookup_appContactRepository.FirstOrDefaultAsync((long)output.AppPost.AppContactId);
                    output.AppContactName = _lookupAppContact?.Name?.ToString();
                }

                if (output.AppPost.AppEntityId != null && output.AppPost.AppEntityId > 0)
                {
                    var _lookupAppEntity = await _lookup_appEntityRepository.FirstOrDefaultAsync((long)output.AppPost.AppEntityId);
                    output.AppEntityName = _lookupAppEntity?.Name?.ToString();
                }

                return output;
            }
        }

        public async Task<GetAppPostForViewDto> CreateOrEdit(CreateOrEditAppPostDto input)
        {
            if (input.Id == null || input.Id == 0)
            {
                return await Create(input);
            }
            else
            {
                return await Update(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppPosts_Create)]
        protected virtual async Task<GetAppPostForViewDto> Create(CreateOrEditAppPostDto input)
        {
            bool AddFromAttachments = false;
            foreach (AppEntityAttachmentDto appEntityAttachmentDto in input.Attachments) 
            {
                if (appEntityAttachmentDto.Id>0)
                { AddFromAttachments = true; }
                appEntityAttachmentDto.AttachmentCategoryId = await _sSycAttachmentCategoriesAppService.GetSycAttachmentCategoryForViewByCode(appEntityAttachmentDto.AttachmentCategoryEnum.ToString());
            }

            var appPost = ObjectMapper.Map<AppPost>(input);

            if (AbpSession.TenantId != null)
            {
                appPost.TenantId = (int?)AbpSession.TenantId;
            }
            #region save entity
            var postObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePostTypeId(input.Type.ToString());
            var postObjectId = await _helper.SystemTables.GetObjectPostId();
            var postStatusId = await _helper.SystemTables.GetEntityObjectStatusItemActive();

            var entity = new AppEntityDto();
            entity.ObjectId = postObjectId;
            entity.EntityObjectStatusId = postStatusId;
            entity.EntityObjectTypeId = postObjectTypeId;
            entity.RelatedEntityId = input.RelatedEntityId;
            entity.AddFromAttachments = AddFromAttachments;
            entity.Name = "";
            if (string.IsNullOrEmpty(input.Code))
            {
                entity.Code = Guid.NewGuid().ToString();
            }
            else
            {
                entity.Code = input.Code;
            }
            if (input.Attachments != null && input.Attachments.Count() > 0)
            {
                entity.EntityAttachments = input.Attachments;
            }

            if (AbpSession.TenantId != null)
            {
                entity.TenantId = (int?)AbpSession.TenantId;
            }

            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
            appPost.AppEntityId = savedEntity;
            #endregion save entity
            //LOOK
            appPost.Code = "POST01";
            var newPostId = await _appPostRepository.InsertAndGetIdAsync(appPost);
             
            return GetAll(new GetAllAppPostsInput{ PostId = newPostId }).Result.Items.FirstOrDefault();
        }

        [AbpAuthorize(AppPermissions.Pages_AppPosts_Edit)]
        protected virtual async Task<GetAppPostForViewDto> Update(CreateOrEditAppPostDto input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var appPost = await _appPostRepository.FirstOrDefaultAsync((long)input.Id);
                // ObjectMapper.Map(input, appPost);
                appPost.Description = input.Description;
                 await _appPostRepository.UpdateAsync(appPost);
            }

            // return GetAll(new GetAllAppPostsInput { PostId = (long)input.Id }).Result.Items.FirstOrDefault();
            return new GetAppPostForViewDto();
        }

        [AbpAuthorize(AppPermissions.Pages_AppPosts_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            { 
                var entity = _appPostRepository.GetAll().Where(r => r.Id == input.Id).FirstOrDefault();
                EntityDto<long> xx = new EntityDto<long>();
                xx.Id = (long)entity.AppEntityId;

                await _appEntitiesAppService.Delete(xx);
                await _appPostRepository.DeleteAsync(input.Id);
                await _appEntityUserReactions.DeleteAsync(x => x.EntityId == entity.AppEntityId);
                await _appEntityReactionsCount.DeleteAsync(x => x.EntityId == entity.AppEntityId);
            }
        }

        public async Task<FileDto> GetAppPostsToExcel(GetAllAppPostsForExcelInput input)
        {

            var filteredAppPosts = _appPostRepository.GetAll()
                        .Include(e => e.AppContactFk)
                        .Include(e => e.AppEntityFk)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Description.Contains(input.Filter))
                        .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.DescriptionFilter), e => e.Description == input.DescriptionFilter)
                        //.WhereIf(!string.IsNullOrWhiteSpace(input.TypeFilter), e => e.Type == input.TypeFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppContactNameFilter), e => e.AppContactFk != null && e.AppContactFk.Name == input.AppContactNameFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.AppEntityNameFilter), e => e.AppEntityFk != null && e.AppEntityFk.Name == input.AppEntityNameFilter);

            var query = (from o in filteredAppPosts
                         join o1 in _lookup_appContactRepository.GetAll() on o.AppContactId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

                         join o2 in _lookup_appEntityRepository.GetAll() on o.AppEntityId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                         select new GetAppPostForViewDto()
                         {
                             AppPost = new AppPostDto
                             {
                                 Code = o.Code,
                                 Description = o.Description,
                                 //Type = ((PostType)Enum.Parse(typeof(PostType), s2.EntityObjectTypeCode)),
                                 Id = o.Id
                             },
                             Type = ((PostType)Enum.Parse(typeof(PostType), s2.EntityObjectTypeCode)),
                             AppContactName = s1 == null || s1.Name == null ? "" : s1.Name.ToString(),
                             AppEntityName = s2 == null || s2.Name == null ? "" : s2.Name.ToString()
                         });

            var appPostListDtos = await query.ToListAsync();

            return _appPostsExcelExporter.ExportToFile(appPostListDtos);
        }

        [AbpAuthorize(AppPermissions.Pages_AppPosts)]
        public async Task<PagedResultDto<AppPostAppContactLookupTableDto>> GetAllAppContactForLookupTable(onetouch.AppPosts.Dtos.GetAllForLookupTableInput input)
        {
            var query = _lookup_appContactRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => e.Name != null && e.Name.Contains(input.Filter)
               );

            var totalCount = await query.CountAsync();

            var appContactList = await query
                .PageBy(input)
                .ToListAsync();

            var lookupTableDtoList = new List<AppPostAppContactLookupTableDto>();
            foreach (var appContact in appContactList)
            {
                lookupTableDtoList.Add(new AppPostAppContactLookupTableDto
                {
                    Id = appContact.Id,
                    DisplayName = appContact.Name?.ToString()
                });
            }

            return new PagedResultDto<AppPostAppContactLookupTableDto>(
                totalCount,
                lookupTableDtoList
            );
        }

        [AbpAuthorize(AppPermissions.Pages_AppPosts)]
        public async Task<PagedResultDto<AppPostAppEntityLookupTableDto>> GetAllAppEntityForLookupTable(onetouch.AppPosts.Dtos.GetAllForLookupTableInput input)
        {
            var query = _lookup_appEntityRepository.GetAll().WhereIf(
                   !string.IsNullOrWhiteSpace(input.Filter),
                  e => e.Name != null && e.Name.Contains(input.Filter)
               );

            var totalCount = await query.CountAsync();

            var appEntityList = await query
                .PageBy(input)
                .ToListAsync();

            var lookupTableDtoList = new List<AppPostAppEntityLookupTableDto>();
            foreach (var appEntity in appEntityList)
            {
                lookupTableDtoList.Add(new AppPostAppEntityLookupTableDto
                {
                    Id = appEntity.Id,
                    DisplayName = appEntity.Name?.ToString()
                });
            }

            return new PagedResultDto<AppPostAppEntityLookupTableDto>(
                totalCount,
                lookupTableDtoList
            );
        }

        [HttpGet]
        public async Task<LinkPreviewResult> Preview(string url)
        {
            if(String.IsNullOrEmpty(url)) throw new UserFriendlyException("Please send a url");
            Browser browser = null;
            try
            {
                var screenShotDomains = new string[] {"docs.google", "vimeo.com", "youtube.com" };
                LinkPreviewResult result = new LinkPreviewResult();
                var options = new LaunchOptions
                {
                    Headless = true,
                    Args = new [] { 
                        "--no-sandbox"
                    }
                };

                var browserFetcher = new BrowserFetcher();

                await browserFetcher.DownloadAsync(BrowserFetcher.DefaultChromiumRevision);

                browser = await Puppeteer.LaunchAsync(options);

                var page = await browser.NewPageAsync();
                var navigationOptions = new NavigationOptions();
                navigationOptions.WaitUntil = new WaitUntilNavigation[2] { WaitUntilNavigation.DOMContentLoaded, WaitUntilNavigation.Load };
                navigationOptions.Timeout = 0;

                await page.GoToAsync(url, navigationOptions);

                var jsCode = @"() => {const selectors = Array.from(document.querySelectorAll('img')); return selectors.map( t=> {return { href: t.src, width: t.width,height:t.height,offsetWidth:t.offsetWidth,offsetHeight:t.offsetHeight}});}";
                ImgData[] results = await page.EvaluateFunctionAsync<ImgData[]>(jsCode);
                
                var tempAttachmentPath = _appConfiguration[$"Attachment:PathTemp"];
                string generatedFileName = Guid.NewGuid().ToString();
                string fileName = generatedFileName + ".png";
                string filePath = Path.Combine(tempAttachmentPath, AbpSession.TenantId.HasValue && AbpSession.TenantId > 0 ? AbpSession.TenantId.ToString() : "-1", fileName);

                var imgInDescOrder = results.OrderByDescending(s => s.height);

                var visibleImages = from p in imgInDescOrder
                                 where p.offsetHeight != 0
                                 where p.offsetWidth != 0
                                 select p;
                var takeScreenShot = screenShotDomains.Any(s => url.ToLower().Contains(s.ToLower())) || result == null;
                string title = await page.GetTitleAsync();
                if (takeScreenShot)
                {
                    await page.ScreenshotAsync(filePath);
                }
                else
                {
                    var downloaded  = DownloadBestImage(visibleImages?.ToArray(),0, filePath, fileName);
                    if(!downloaded) await page.ScreenshotAsync(filePath);
                }
                result.title = title;
                result.fileName = generatedFileName;
                result.image = filePath.Replace(_appConfiguration[$"Attachment:Omitt"], "");
                await browser.CloseAsync();
                return result;
            }
            catch (Exception ex)
            {
                if(browser != null) await browser.CloseAsync();
                throw ex;
            };
        }
        private bool DownloadBestImage(ImgData[] images, int index, string filePath,string fileName)
        {
            var bestImageSrc = images[index]?.href;
            try
            {

                var base64Regex = @"^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$";

                if (Regex.Match(bestImageSrc, base64Regex, RegexOptions.IgnoreCase).Success)
                {
                    byte[] bytes = Convert.FromBase64String(bestImageSrc);

                    Image image;
                    using (MemoryStream ms = new MemoryStream(bytes))
                    {
                        image = Image.FromStream(ms);
                    }
                    image.Save(filePath);
                }
                else
                {
                    WebClient client = new WebClient();
                    client.DownloadFile(bestImageSrc, filePath);
                }
                return true;
            }
            catch (Exception ex)
            {
                if (index + 1 >= images.Length) return false;
                return DownloadBestImage(images, ++index, filePath, fileName);
            }
        }
    }
}
