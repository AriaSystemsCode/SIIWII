using Abp;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Linq.Extensions;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Hosting.StaticWebAssets;
using Microsoft.EntityFrameworkCore;
using Microsoft.PowerShell.Commands;
using Nito.AsyncEx;
using Nito.AsyncEx.Synchronous;
using NPOI.SS.Formula.Functions;
using NUglify.Helpers;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.AppMarketplaceMessages;
using onetouch.AppSiiwiiTransaction.Dtos;
using onetouch.Authorization;
using onetouch.Authorization.Users;
using onetouch.Authorization.Users.Dto;
using onetouch.Helpers;
using onetouch.Message.Dto;
using onetouch.Migrations;
using onetouch.MultiTenancy;
using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Management.Automation.Language;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using static Microsoft.ApplicationInsights.MetricDimensionNames.TelemetryContext;

namespace onetouch.Message
{


    [AbpAuthorize(AppPermissions.Pages_AppMessage)]
    public class MessageAppService : onetouchAppServiceBase, IMessageAppService
    {
        private readonly IRepository<AppMarketplaceMessage, long> _AppMarketplaceMessagesRepository;
        private readonly IRepository<AppMessage, long> _MessagesRepository;
        private readonly IRepository<AppMessage, long> _lookup_MessagesRepository;
        private readonly Helper _helper;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppEntityClassification, long> _appEntityClassificationRepository;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IRepository<AppEntityReactionsCount, long> _appEntityReactionsCount;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategory;
        public MessageAppService(IRepository<AppMessage, long> messagesRepository,
            IRepository<AppMessage, long> lookup_MessagesRepository,
            IRepository<AppEntity, long> appEntityRepository,
            Helper helper, IAppEntitiesAppService appEntitiesAppService,
            IRepository<AppEntityClassification, long> appEntityClassificationRepository,
            IRepository<AppEntityReactionsCount, long> appEntityReactionsCount, IRepository<SycEntityObjectCategory, long> sycEntityObjectCategory,
            IRepository<AppMarketplaceMessage, long> appMarketplaceMessagesRepository
            )
        {
            _MessagesRepository = messagesRepository;
            _lookup_MessagesRepository = lookup_MessagesRepository;
            _appEntityRepository = appEntityRepository;
            _helper = helper;
            _appEntitiesAppService = appEntitiesAppService;
            _appEntityClassificationRepository = appEntityClassificationRepository;
            _appEntityReactionsCount = appEntityReactionsCount;
            _sycEntityObjectCategory = sycEntityObjectCategory;
            _AppMarketplaceMessagesRepository = appMarketplaceMessagesRepository;
        }

        public async Task<MessagePagedResultDto> GetAll(GetAllMessagesInput input)
        {

           

            if (input.messageTypeIndex == 0)
                return null;

            IQueryable<AppMessage> filteredMessages = null;

            var entityObjectReadID = await _helper.SystemTables.GetEntityObjectStatusReadMessageID();
            var entityObjectStatusUnreadID = await _helper.SystemTables.GetEntityObjectStatusUnreadMessageID();
            var entityObjectArchiveID = await _helper.SystemTables.GetEntityObjectStatusArchivedMessageID();
            var ObjectStatusDeleted = await _helper.SystemTables.GetEntityObjectStatusDeletedMessageID();
            var entityObjectSentID = await _helper.SystemTables.GetEntityObjectStatusSentMessageID();
            var entityObjectClassStarred = await _helper.SystemTables.GetEntityObjectClassificationStarredMessageID();
            var entityObjectTypeComment = await _helper.SystemTables.GetEntityObjectTypeComment();
            var entityObjectTypeMessage = await _helper.SystemTables.GetEntityObjectTypeMessageID();
            

                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                filteredMessages = _MessagesRepository.GetAll()
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectStatusFk)
                                   .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
//xx
//.WhereIf(input.messageTypeIndex == 1 || input.messageTypeIndex == 3, x => x.EntityFk.EntityObjectStatusId == entityObjectStatusID || x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID)
.WhereIf(input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0, e => e.EntityFk.RelatedEntitiesRelationships.Where(ee => ee.EntityId == (long)input.MainComponentEntitlyId).Count() > 0)
.WhereIf(input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0, e => e.EntityFk.EntitiesRelationships.Where(ee => ee.EntityId == (long)input.MainComponentEntitlyId).Count() > 0)
.WhereIf(input.messageTypeIndex == 1 && (!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE"),
     x => x.UserId == AbpSession.UserId && (x.EntityFk.EntityObjectStatusId == entityObjectReadID ||
     x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID)
|| (((x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0
    || x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectReadID) > 0))
        &&
        (x.EntityFk.EntityObjectStatusId != entityObjectArchiveID &&
         x.EntityFk.EntityObjectStatusId != ObjectStatusDeleted))
)

.WhereIf(input.messageTypeIndex == 2 && (!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE"), x => x.SenderId == AbpSession.UserId && ((x.EntityFk.EntityObjectStatusId == entityObjectSentID)
|| (x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectSentID) > 0))
  &&
        (x.EntityFk.EntityObjectStatusId != entityObjectArchiveID &&
         x.EntityFk.EntityObjectStatusId != ObjectStatusDeleted))

//Iteration37-MMT[Start]
//.WhereIf(input.MessageCategoryFilter != null, x=>x.EntityFk.EntityCategories
//.Where(z=> z.EntityObjectCategoryCode.Replace("-",string.Empty) ==input.MessageCategoryFilter).Count()>0)
//Iteration37-MMT[End]
// Iteration 39 [Start]
.WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MENTION", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeComment)
.WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage)
.WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "THREAD", z => (z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage || z.EntityFk.EntityObjectTypeId == entityObjectTypeComment) &&
  (z.ParentFKList.Count > 0 || z.ParentId != null))
// Iteration 39 [End]
.WhereIf(input.messageTypeIndex == 3 && (!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE"), x => (x.EntityFk.EntityObjectStatusId != ObjectStatusDeleted) && (x.SenderId == AbpSession.UserId || x.UserId == AbpSession.UserId))
                                    //xx
                                    .WhereIf(input.messageTypeIndex == 3 && (!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE"), x => x.EntityFk.EntityClassifications.Count(x => x.EntityObjectClassificationId == entityObjectClassStarred) > 0)
                                    .WhereIf(input.messageTypeIndex == 4 && (!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE"), x => x.EntityFk.EntityObjectStatusId == entityObjectArchiveID && (x.SenderId == AbpSession.UserId || x.UserId == AbpSession.UserId))
                                    .WhereIf(input.messageTypeIndex == 5 && (!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE"), x => x.EntityFk.EntityObjectStatusId == ObjectStatusDeleted && (x.SenderId == AbpSession.UserId || x.UserId == AbpSession.UserId))
                                    .Where(e => e.ParentId == null)
                                    .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Body.ToUpper().Contains(input.Filter.ToUpper()) || e.Subject.ToUpper().Contains(input.Filter.ToUpper()) ||
                                     e.SenderFk.UserName.ToUpper().Contains(input.Filter.ToUpper()) || e.UserFk.UserName.ToUpper().Contains(input.Filter.ToUpper()))
                                     .WhereIf(!string.IsNullOrWhiteSpace(input.BodyFilter), e => e.Body == input.BodyFilter)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.SubjectFilter), e => e.Subject == input.SubjectFilter)
                        .Where(
                    x => x.TenantId == AbpSession.TenantId && ((x.UserId == AbpSession.UserId)                
                   ||
                   (x.SenderId == AbpSession.UserId)));

                //.Where(
                //    (x => x.TenantId == AbpSession.TenantId && (
                //    (("," + AbpSession.UserId + ",").Contains("," + x.To + ","))
                //    ||
                //   (("," + AbpSession.UserId + ",").Contains("," + x.CC + ","))
                //    ||
                //   (("," + AbpSession.UserId + ",").Contains("," + x.BCC + ","))
                //   ||
                //   (x.SenderId == AbpSession.UserId)
                //    )
                //        ));



                var pagedAndFilteredMessages = filteredMessages
                    .OrderBy(input.Sorting ?? "CreationTime desc")
                    .PageBy(input);
           
                var messages = from o in pagedAndFilteredMessages
                               join o1 in _lookup_MessagesRepository.GetAll() on o.ParentId equals o1.Id into j1
                               from s1 in j1.DefaultIfEmpty()


                               select new GetMessagesForViewDto()
                               {

                                   Messages = new MessagesDto
                                   {
                                       SenderId = o.SenderId,
                                       To = o.To,
                                       CC = o.CC,
                                       BCC = o.BCC,
                                       Subject = o.Subject,
                                       Body = o.Body,
                                       BodyFormat = o.BodyFormat,
                                       SendDate = o.CreationTime,
                                       ReceiveDate = o.CreationTime,
                                       EntityCode = o.EntityCode,
                                       Id = o.Id,
                                       SenderName = UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Name).FirstOrDefault().ToString()
                                       + "." + UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Surname).FirstOrDefault().ToString()
                                        + " @ "+
                                       (UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.TenantId).FirstOrDefault().Value  == null ?
                                       L("Onetouch") : TenantManager.Tenants.Where(x => x.Id ==(UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.TenantId).FirstOrDefault())).Select(x => x.TenancyName).FirstOrDefault().ToString()),
                                       ThreadId = o.ThreadId,
                                       ParentId = o.ParentId,
                                       //xxx
                                       EntityObjectStatusCode = (input.messageTypeIndex == 1) ?
                                       ((o.EntityFk.EntityObjectStatusId != entityObjectArchiveID && o.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0) ? "UNREAD" : (o.EntityFk.EntityObjectStatusCode))
                                           : (o.EntityFk.EntityObjectStatusCode),
                                       //xxx
                                       EntityObjectTypeCode = o.EntityFk.EntityObjectTypeCode,
                                       IsFavorite = o.EntityFk.EntityClassifications.Count(x => x.EntityObjectClassificationId == entityObjectClassStarred) > 0,
                                       MesasgeObjectType = o.EntityFk.EntityObjectTypeId == entityObjectTypeComment ? MesasgeObjectType.Comment :  MesasgeObjectType.Message,
                                       //RelatedEntityId = o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId | o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().RelatedEntityId
                                       RelatedEntityId = (o.EntityFk.EntitiesRelationships != null && o.EntityFk.EntitiesRelationships.Count > 0) ? o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId :
                                          ((o.EntityFk.RelatedEntitiesRelationships != null && o.EntityFk.RelatedEntitiesRelationships.Count > 0) ? o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().EntityId : 0),
                                       RelatedEntityObjectTypeCode = (o.EntityFk.EntitiesRelationships != null && o.EntityFk.EntitiesRelationships.Count > 0) ? o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityTypeCode   :
                                          ((o.EntityFk.RelatedEntitiesRelationships != null && o.EntityFk.RelatedEntitiesRelationships.Count > 0) ? o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().RelatedEntityTypeCode : "")
                                   },
                               };


                var totalCount = await filteredMessages.CountAsync();
                var unreadCount = 0;


                unreadCount = await _MessagesRepository.GetAll()
                    .WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MENTION", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeComment)
.WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage)
.WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "THREAD", z => (z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage || z.EntityFk.EntityObjectTypeId == entityObjectTypeComment) &&
  (z.ParentFKList.Count > 0 || z.ParentId != null))
                       .Where(x => (x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) || (x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0))
                       .Where(e => e.ParentId == null)
                       .Where(x => x.TenantId == AbpSession.TenantId && x.UserId == AbpSession.UserId).CountAsync();


                var listmessages = await messages.ToListAsync();

                foreach (var message in listmessages)
                {
                    message.Messages.RecipientsName = GetUsersNamesByID(message.Messages.To).ToString();
                    var profilePictureId = UserManager.Users.FirstOrDefault(y => y.Id == message.Messages.SenderId).ProfilePictureId;
                    if (profilePictureId != null)
                    { 
                        message.Messages.ProfilePictureId = (Guid)profilePictureId;
                    }
                    message.Messages.RelatedEntityObjectTypeCode = (message.Messages.RelatedEntityObjectTypeCode == "SALESORDER" || message.Messages.RelatedEntityObjectTypeCode == "PURCHASEORDER6+") ? "transaction": message.Messages.RelatedEntityObjectTypeCode;
                    if (message.Messages.EntityObjectTypeCode == "COMMENT")
                    {
                        var comment = await _AppMarketplaceMessagesRepository.GetAll().Where(z => z.Id == message.Messages.ThreadId).FirstOrDefaultAsync();
                        if (comment != null)
                        {
                            message.Messages.Body = comment.Body;
                            message.Messages.BodyFormat = comment.BodyFormat;
                        }
                    }
                }
                
                return new MessagePagedResultDto(
                    totalCount, unreadCount,
                    listmessages
                );
            }
        }
        [AbpAllowAnonymous]
        public async Task<MessagePagedResultDto> GetAllComments(GetAllMessagesInput input)
        {
            IQueryable<AppMarketplaceMessage> filteredMessages = null;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //MMT
                if (input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0)
                {
                    var entity = await _appEntityRepository.GetAll().Where(z => z.Id == input.MainComponentEntitlyId).FirstOrDefaultAsync();
                    if (entity != null && (entity.EntityObjectTypeCode == "SALESORDER" || entity.EntityObjectTypeCode == "PURCHASEORDER"))
                    {
                        var transactionSSIN = entity.SSIN;
                        if (!string.IsNullOrEmpty(transactionSSIN))
                        {
                            var entityShared = await _appEntityRepository.GetAll().Where(z => z.SSIN == transactionSSIN && z.TenantId == null).FirstOrDefaultAsync();
                            if (entityShared != null)
                            {
                                input.MainComponentEntitlyId = entityShared.Id;
                            }
                        }
                    }
                }
                //MMT
                filteredMessages = _AppMarketplaceMessagesRepository.GetAll()
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectStatusFk)
                                   .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                                   .Include(x => x.ParentFKList).ThenInclude(z => z.ParentFKList).Include(x => x.EntityFk)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
                            //Iteration37-MMT[Start]
                            //.WhereIf(input.MessageCategoryFilter != null, x => x.EntityFk.EntityCategories
                            //.Where(z => z.EntityObjectCategoryCode.Replace("-", string.Empty) ==  input.MessageCategoryFilter.ToString()).Count() > 0)
                            //Iteration37-MMT[End]

                            .WhereIf( input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0,
                                e => e.EntityFk.EntitiesRelationships.Where(ee => ee.RelatedEntityId == (long)input.MainComponentEntitlyId).Count() > 0 ||
                                     e.EntityFk.RelatedEntitiesRelationships.Where(ee => ee.EntityId == (long)input.MainComponentEntitlyId).Count() > 0)
                            .WhereIf(input.ParentId == null || input.ParentId == 0, e => e.ParentId == null)
                            .WhereIf(input.ParentId != null && input.ParentId >= 0, e => e.ParentId == input.ParentId)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Body.Contains(input.Filter) || e.Subject.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.BodyFilter), e => e.Body == input.BodyFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.SubjectFilter), e => e.Subject == input.SubjectFilter)
                            .WhereIf(input.ThreadId != null && input.ThreadId> 0, e => e.ThreadId == input.ThreadId)
                        .Where(
                                 x =>
                                 //x.EntityFk.EntityObjectTypeCode == MesasgeObjectType.Comment.ToString().ToUpper()  &&
                                 x.OriginalMessageId == x.Id  
                             );

                var pagedAndFilteredMessages = filteredMessages
                    .OrderBy(input.Sorting ?? "id desc")
                    .PageBy(input);
                var appComments = from o in pagedAndFilteredMessages
                                  select new
                                   GetMessagesForViewDto()
                                  {
                                      Messages = new MessagesDto
                                      {
                                          SenderId = o.SenderId,
                                         // To = o.To,
                                         // CC = o.CC,
                                         // BCC = o.BCC,
                                          Subject = o.Subject,
                                          Body = o.Body,
                                          BodyFormat = o.BodyFormat,
                                          SendDate = o.CreationTime,
                                          ReceiveDate = o.CreationTime,
                                          EntityCode = o.EntityCode,
                                          Id = o.Id,
                                          SenderName = UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Name).FirstOrDefault().ToString()
                                       + "." + UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Surname).FirstOrDefault().ToString()
                                        + " @ " + TenantManager.Tenants.Where(x => x.Id == (UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.TenantId).FirstOrDefault())).Select(x => x.TenancyName).FirstOrDefault().ToString(),
                                          ThreadId = o.ThreadId,
                                          ParentId = o.ParentId,
                                          EntityId = (int)o.EntityId,
                                          ParentFKList = o.ParentFKList == null || o.ParentFKList.Count == 0 ? new List<MessagesDto>() : ObjectMapper.Map<List<MessagesDto>>(o.ParentFKList.ToList()),
                                          HasChildren = o.ParentFKList == null || o.ParentFKList.Count == 0 ? false : true,
                                          EntityObjectTypeCode = o.EntityFk.EntityObjectTypeCode,
                                          RelatedEntityId = (o.EntityFk.EntitiesRelationships!=null && o.EntityFk.EntitiesRelationships.Count> 0) ? o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId :
                                          ((o.EntityFk.RelatedEntitiesRelationships != null && o.EntityFk.RelatedEntitiesRelationships.Count > 0) ? o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().EntityId : 0)
                                        },
                                  }
                                ;
                    
                var totalCount = await filteredMessages.CountAsync();
                var unreadCount = 0;

                var results = await appComments.ToListAsync();
                foreach(var x in results)
                {
                    var profilePictureId = UserManager.Users.FirstOrDefault(y => y.Id == x.Messages.SenderId).ProfilePictureId;
                    if (profilePictureId != null)
                    { x.Messages.ProfilePictureId = (Guid)profilePictureId; }
                    if (x.Messages.ParentFKList != null && x.Messages.ParentFKList.Count > 0)
                    {
                        x.Messages.ParentFKList.ForEach(z => z.HasChildren = (z.ParentFKList!=null && z.ParentFKList.Count >0) ?true: false);
                        foreach (var ch in x.Messages.ParentFKList)
                        {
                            if (ch.ParentFKList != null && ch.ParentFKList.Count > 0)
                            {
                                x.Messages.ParentFKList.ForEach(z => z.HasChildren = (z.ParentFKList != null && z.ParentFKList.Count > 0) ? true : false);
                            }

                        }
                    }
                    //x.Messages.ParentFKList.ForEach(z=>z.ParentFKList= appComments.Where(a=>a.Messages.Id==z.Id).Select(z => z.Messages.ParentFKList).FirstOrDefault());
                }
                return new MessagePagedResultDto(
                    totalCount, unreadCount,
                    results
                );
            }
        }


        public async Task Delete(long input)
        {
            var message = await _MessagesRepository.FirstOrDefaultAsync(input);
            var entity = await _appEntityRepository.FirstOrDefaultAsync(message.EntityId);
            var deleteStatus = await _helper.SystemTables.GetEntityObjectStatusDeletedMessageID();

            entity.EntityObjectStatusId = deleteStatus;
        }

        //xxxx
        public async Task HardDelete(long input)
        {
            var message = await _MessagesRepository.FirstOrDefaultAsync(input);
            await _MessagesRepository.DeleteAsync(message.Id);
            var entity = await _appEntityRepository.FirstOrDefaultAsync(message.EntityId);

            await _appEntityRepository.DeleteAsync(entity);
        }
        //xxxx

        public async Task Favorite(long input)
        {
            var message = await _MessagesRepository.FirstOrDefaultAsync(input);
            var entity = await _appEntityRepository.FirstOrDefaultAsync(message.EntityId);

            var deleteStatus = await _helper.SystemTables.GetEntityObjectClassificationStarredMessageID();

            var existed = await _appEntityClassificationRepository.FirstOrDefaultAsync(x => x.EntityId == entity.Id && x.EntityObjectClassificationId == deleteStatus);
            if (existed != null)
            {
                await _appEntityClassificationRepository.DeleteAsync(existed.Id);
            }
            else
            {
                AppEntityClassification x = new AppEntityClassification();
                x.EntityId = entity.Id;
                x.EntityObjectClassificationId = deleteStatus;
                await _appEntityClassificationRepository.InsertAsync(x);
            }


        }

        public async Task Archive(long input)
        {
            var message = await _MessagesRepository.FirstOrDefaultAsync(input);
            var entity = await _appEntityRepository.FirstOrDefaultAsync(message.EntityId);
            var archiveStatus = await _helper.SystemTables.GetEntityObjectStatusArchivedMessageID();

            if (entity.EntityObjectStatusId != archiveStatus)
            {
                entity.EntityObjectStatusId = archiveStatus;
            }
            else
            {
                var readStatus = await _helper.SystemTables.GetEntityObjectStatusReadMessageID();
                entity.EntityObjectStatusId = readStatus;
            }
        }

        public async Task Read(long input)
        {

            //var message = await _MessagesRepository.FirstOrDefaultAsync(input);

            var message = await _MessagesRepository.GetAll()
                 .Where(x => x.Id == input)
                  .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk).FirstOrDefaultAsync();
            var EntityObjectReadId = await _helper.SystemTables.GetEntityObjectStatusReadMessageID();
            var EntityObjectUnReadId = await _helper.SystemTables.GetEntityObjectStatusUnreadMessageID();


            if (message.EntityFk.EntityObjectStatusId == EntityObjectUnReadId)
            {
                var entity = await _appEntityRepository.FirstOrDefaultAsync(message.EntityId);
                entity.EntityObjectStatusId = EntityObjectReadId;
                entity.EntityObjectStatusCode = "READ";
            }


            var ChildMessages = message.ParentFKList.Where(x => x.EntityFk.EntityObjectStatusId == EntityObjectUnReadId).ToList();
            foreach (var msg in ChildMessages)
            {
                var entity = await _appEntityRepository.FirstOrDefaultAsync(msg.EntityId);
                entity.EntityObjectStatusId = EntityObjectReadId;
                entity.EntityObjectStatusCode = "READ";
            }


        }

        public List<GetMessagesForViewDto> GetMessagesForView(long id)
        {
            var entityObjectSent = _helper.SystemTables.GetEntityObjectStatusSentMessageID();
            var entityObjectSentID = long.Parse(entityObjectSent.Result.ToString());
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                long? threadId = _MessagesRepository.FirstOrDefault(x => x.Id == id).ThreadId;

                var messages = _MessagesRepository.GetAll()
                .Where(e => e.Id == id || 
                (threadId != null && (e.ThreadId == threadId && (e.UserId == AbpSession.UserId || (e.SenderId == AbpSession.UserId && e.EntityFk.EntityObjectStatusId ==  entityObjectSentID)))))
                .Where(x => x.TenantId == AbpSession.TenantId)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                .OrderBy("id asc").ToList();
                List<GetMessagesForViewDto> output = new List<GetMessagesForViewDto>();
                for (int i = 0; i < messages.Count(); i++)
                {

                    var m = ObjectMapper.Map<MessagesDto>(messages[i]);
                    //var entityObjectClassStarred = AsyncContext.Run(_helper.SystemTables.GetEntityObjectClassificationStarredMessageID()).Result;
                    var task = _helper.SystemTables.GetEntityObjectClassificationStarredMessageID();
                    var entityObjectClassStarred = task.WaitAndUnwrapException();

                    //xxxx
                    /* m.IsFavorite = _MessagesRepository.GetAll().Where(x => x.Id == m.Id)
                         .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                     .Count() > 0;*/

                    m.IsFavorite = _MessagesRepository.GetAll().Where(x => x.Id == m.Id)
                        .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                        .Where(x => x.EntityFk.EntityClassifications.Count > 0)
                    .Count() > 0;
                    //xxxx

                    var message = new GetMessagesForViewDto { Messages = m };
                    message.Messages.SenderName = GetUserNameByID(messages[i].SenderId);
                    message.Messages.ToName = GetUsersNamesByID(messages[i].To);
                    message.Messages.EntityAttachments = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(messages[i].EntityFk.EntityAttachments);
                    //Message.Messages.EntityAttachments = new List<AppEntityAttachmentDto>();
                    //var x1 = new AppEntityAttachmentDto();
                    //x1.FileName = "dfdfdf.doc";
                    //x1.AttachmentCategoryId = 4;
                    //Message.Messages.EntityAttachments.Add(x1);
                    //var x2 = new AppEntityAttachmentDto();
                    //x2.FileName = "cxcxcxcxcx.xls";
                    //x2.AttachmentCategoryId = 4;
                    //Message.Messages.EntityAttachments.Add(x2);
                    foreach (var item in message.Messages.EntityAttachments)
                    {
                        item.Url = @"attachments\" + AbpSession.TenantId + @"\" + item.FileName;
                    }
                    var profilePictureId = UserManager.Users.FirstOrDefault(y => y.Id == message.Messages.SenderId).ProfilePictureId;
                    if (profilePictureId != null)
                    {
                        message.Messages.ProfilePictureId = (Guid)profilePictureId;
                    }
                    output.Add(message);
                }
                return output;
            }
        }

        public List<GetUsersForMessageDto> GetAllUsers(string searchTerm)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var UserList = from o in UserManager.Users //.Where(x => x.TenantId != null)
                               join o1 in TenantManager.Tenants on o.TenantId equals o1.Id into j1

                               from s1 in j1.DefaultIfEmpty()
                               where s1.TenancyName.ToLower().Contains(searchTerm.ToLower()) || o.UserName.ToLower().Contains(searchTerm.ToLower())
                               || o.Name.ToLower().Contains(searchTerm.ToLower()) || o.Surname.ToLower().Contains(searchTerm.ToLower())

                               select new GetUsersForMessageDto()
                               {
                                   Users = new NameValue<string>()
                                   {
                                       Name = o.Name,
                                       Value = o.Id.ToString()
                                   },
                                   TenantId = o.TenantId,
                                   TenantName = o.TenantId ==null ? L("Onetouch") : s1.TenancyName,
                                   EmailAddress = o.EmailAddress,
                                   ProfilePictureId = o.ProfilePictureId,
                                   Surname = o.Surname
                               };

                return UserList.ToList();
            }
        }
        [AbpAllowAnonymous]
        public async Task<List<GetMessagesForViewDto>> CreateMessage(CreateMessageInput input)
        {
            //MMT39
            if (input.MesasgeObjectType == MesasgeObjectType.Comment)
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    string transactionSSIN = "";
                    if (input.RelatedEntityId != null)
                    {
                        var entity = await _appEntityRepository.GetAll().Where(z => z.Id == input.RelatedEntityId).FirstOrDefaultAsync();
                        if (entity != null && (entity.EntityObjectTypeCode == "SALESORDER" || entity.EntityObjectTypeCode == "PURCHASEORDER"))
                        {
                            transactionSSIN = entity.SSIN;
                            if (!string.IsNullOrEmpty(transactionSSIN))
                            {
                                var entityShared = await _appEntityRepository.GetAll().Where(z => z.SSIN == transactionSSIN && z.TenantId == null).FirstOrDefaultAsync();
                                if (entityShared != null)
                                {
                                    input.RelatedEntityId = entityShared.Id;
                                }
                            }
                        }
                    }
                    var comment = await CreateMarketplaceMessageForSenderUser(input);
                    if (input.RelatedEntityId != null && input.RelatedEntityId > 0)
                    {
                        await _appEntitiesAppService.UpdateEntityCommentsCount((long)input.RelatedEntityId, false);
                    }
                    if (input.ParentId != null && input.ParentId > 0 && input.MesasgeObjectType == MesasgeObjectType.Comment)
                    {

                        var parentEntityID = _AppMarketplaceMessagesRepository.GetAll()
                                         .Include(x => x.EntityFk).Where(e => e.Id == (long)input.ParentId).FirstOrDefault();
                        await _appEntitiesAppService.UpdateEntityCommentsCount((long)parentEntityID.EntityId, false);
                    }
                    
                    if (!string.IsNullOrEmpty(input.To))
                    {
                        var user = UserManager.GetUserById(long.Parse(input.To));
                        if (user != null)
                        {
                            if (input.MentionedUsers ==null)
                                input.MentionedUsers = new List<MentionedUserInfo>();

                            input.MentionedUsers.Add(new MentionedUserInfo { UserId = user.Id, TenantId =long.Parse( user.TenantId.ToString())});
                        }
                    }
                    /*input.MentionedUsers.Add(new MentionedUserInfo { UserId = 30702, TenantId = 2472 });
                    input.MentionedUsers.Add(new MentionedUserInfo { UserId = 30217, TenantId = 2154 });*/
                    if (input.MentionedUsers != null && input.MentionedUsers.Count > 0)
                    {
                        foreach (var userId in input.MentionedUsers)
                        {
                            CreateMessageForRecieversInput createMessageForRecieversInput = new CreateMessageForRecieversInput();
                            createMessageForRecieversInput.Messageid = comment.Id;
                            createMessageForRecieversInput.ThreadId = comment.ThreadId;
                            createMessageForRecieversInput.CreateMessageInput = input;
                            createMessageForRecieversInput.CreateMessageInput.To = userId.UserId.ToString();
                            string[] toList = new string[1];
                            toList[0] = userId.UserId.ToString();
                            createMessageForRecieversInput.UsersList = toList;
                            if (!string.IsNullOrEmpty(transactionSSIN) && userId.TenantId != null)
                            {
                                var entityTenant = await _appEntityRepository.GetAll().Where(z => z.SSIN == transactionSSIN && z.TenantId == userId.TenantId).FirstOrDefaultAsync();
                                if (entityTenant != null)
                                {
                                    createMessageForRecieversInput.CreateMessageInput.RelatedEntityId = entityTenant.Id;
                                }
                            }
                            await CreateMessageForRecieverUsers(createMessageForRecieversInput);
                        }
                    }

                    return GetCommentsForView(comment.Id);
                }
            }
            //MMT39
            //if (input.MessageCategory==null)
            //{
            //    input.MessageCategory = ((MessageCategory)Enum.Parse(typeof(MessageCategory), (MessageCategory.PRIMARYMESSAGE).ToString())).ToString() .ToString();
            //}
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var message = await CreateMessageForSenderUser(input);
                var toList = input.To.Split(',');
                var ccList = input.CC != null ? input.CC.Split(',') : new String[0];
                var bccList = input.BCC != null ? input.BCC.Split(',') : new String[0];


                CreateMessageForRecieversInput createMessageForRecieversInput = new CreateMessageForRecieversInput();
                createMessageForRecieversInput.Messageid = message.Id;
                createMessageForRecieversInput.ThreadId = message.ThreadId;
                createMessageForRecieversInput.CreateMessageInput = input;
                createMessageForRecieversInput.CreateMessageInput = input;
                if (toList.Length > 0 && !String.IsNullOrWhiteSpace(toList[0]))
                {
                    createMessageForRecieversInput.UsersList = toList;
                    await CreateMessageForRecieverUsers(createMessageForRecieversInput);
                }
                if (ccList.Length > 0 && !String.IsNullOrWhiteSpace(ccList[0]))
                {
                    createMessageForRecieversInput.UsersList = ccList;
                    await CreateMessageForRecieverUsers(createMessageForRecieversInput);
                }
                if (bccList.Length > 0 && !String.IsNullOrWhiteSpace(bccList[0]))
                {
                    createMessageForRecieversInput.UsersList = bccList;
                    await CreateMessageForRecieverUsers(createMessageForRecieversInput);
                }
                if (input.RelatedEntityId != null && input.RelatedEntityId > 0)
                { 
                    await _appEntitiesAppService.UpdateEntityCommentsCount((long)input.RelatedEntityId, false); 
                }
                if (input.ParentId != null && input.ParentId > 0 && input.MesasgeObjectType == MesasgeObjectType.Comment)
                {
                
                        var parentEntityID = _MessagesRepository.GetAll()
                                         .Include(x => x.EntityFk).Where(e => e.Id == (long)input.ParentId).FirstOrDefault();
                        await _appEntitiesAppService.UpdateEntityCommentsCount((long)parentEntityID.EntityId, false);
                }

                return GetMessagesForView(message.Id);
             }
        }
        [AbpAllowAnonymous]
        private async Task<AppMessage> CreateMessageForSenderUser(CreateMessageInput input)
        {
            
            AppEntityDto appEntity = new AppEntityDto();
            ObjectMapper.Map(input, appEntity);
            appEntity.Name = "Message";
            appEntity.Code = input.Code;
            //Iteration37,1 [Start]
            SycEntityObjectCategory messageCategory = null;
            if (input.MessageCategory != null)
            {
                messageCategory = _sycEntityObjectCategory.GetAll().Where(z => z.Code.Replace("-", string.Empty) == input.MessageCategory.ToString()).FirstOrDefault();
            }
            if (messageCategory != null)
            {
                appEntity.EntityCategories = new List<AppEntityCategoryDto>();
                appEntity.EntityCategories.Add(new AppEntityCategoryDto { EntityObjectCategoryCode= messageCategory.Code, EntityObjectCategoryId = messageCategory.Id, EntityObjectCategoryName= messageCategory.Name });
            }
            //Iteration37,1 [End]
            if (string.IsNullOrEmpty(input.Code))
            {
                appEntity.Code = Guid.NewGuid().ToString();
            }
            else
            {
                appEntity.Code = input.Code;
            }
            appEntity.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusSentMessageID();

            if (input.MesasgeObjectType == MesasgeObjectType.Comment)
            { appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeComment(); }
            else { appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeMessageID(); }

            appEntity.ObjectId = await _helper.SystemTables.GetsydObjectMessageID();
            appEntity.TenantId = AbpSession.TenantId;
            appEntity.RelatedEntityId = input.RelatedEntityId;
            var savedEntity = await _appEntitiesAppService.SaveEntity(appEntity);

            var message = ObjectMapper.Map<AppMessage>(input);
            message.EntityId = savedEntity;
            message.TenantId = AbpSession.TenantId ==null ? AbpSession.TenantId :(int)AbpSession.TenantId;
            message.SenderId = (int)AbpSession.UserId;
            message.To = input.To;
            message.CC = input.CC;
            message.BCC = input.BCC;
            message.Body = input.BodyFormat != null ? HtmlToPlainText(input.BodyFormat) : input.Body;
            message.ParentId = input.ParentId == 0 ? null : input.ParentId;
            message.ThreadId = null;
            long? threadId = null;
            if (input.ParentId > 0)
            {
                var originalParent = await _MessagesRepository.FirstOrDefaultAsync(x => x.Id == input.ParentId);
                if (originalParent != null)
                    threadId = originalParent.ThreadId;
                message.ThreadId = threadId;
            }

            //Insert record into AppMessages table [End]
            var savedMessage = await _MessagesRepository.InsertAsync(message);
            await CurrentUnitOfWork.SaveChangesAsync();

            //update threadId in case of no parent Thread
            if (threadId == null)
                savedMessage.ThreadId = savedMessage.Id;

            //update OriginalMessageId for the new message, becuase this field will be used in CreateMessageForReciever
            savedMessage.OriginalMessageId = savedMessage.Id;

            return savedMessage;
        }

        private async Task CreateMessageForRecieverUsers(CreateMessageForRecieversInput input)
        {
            var messageBody = HtmlToPlainText(input.CreateMessageInput.BodyFormat);
            for (int i = 0; i < input.UsersList.Length; i++)
            {
                int? tenantId = null;
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var id = (long)Convert.ToInt32(input.UsersList[i]);
                    tenantId = UserManager.Users.Where(x => x.Id == id).Select(x => x.TenantId).FirstOrDefault();
                }
                //Insert record into AppEntities table [Start]
                AppEntityDto appEntity = new AppEntityDto();
                ObjectMapper.Map(input, appEntity);
                appEntity.Name = "Message";
                //Iteration37,1 [Start]
                //SycEntityObjectCategory messageCategory = null;
                //if (input.CreateMessageInput.MessageCategory != null)
                //{
                //    messageCategory = _sycEntityObjectCategory.GetAll().Where(z => z.Code.Replace("-", string.Empty) ==  input.CreateMessageInput.MessageCategory.ToString()).FirstOrDefault();
                //}
                //if (messageCategory != null)
                //{
                //    appEntity.EntityCategories = new List<AppEntityCategoryDto>();
                //    appEntity.EntityCategories.Add(new AppEntityCategoryDto { EntityObjectCategoryCode = messageCategory.Code, EntityObjectCategoryId = messageCategory.Id, EntityObjectCategoryName = messageCategory.Name });
                //}
                //Iteration37,1 [End]

                //appEntity.Code = input.CreateMessageInput.Code;
                if (string.IsNullOrEmpty(input.CreateMessageInput.Code))
                {
                    appEntity.Code = Guid.NewGuid().ToString();
                }
                else
                {
                    appEntity.Code = input.CreateMessageInput.Code;
                }
                appEntity.RelatedEntityId = input.CreateMessageInput.RelatedEntityId;
                appEntity.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusUnreadMessageID();

                if (input.CreateMessageInput.MesasgeObjectType == MesasgeObjectType.Comment)
                { appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeComment(); }
                else { appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeMessageID(); }

                appEntity.ObjectId = await _helper.SystemTables.GetsydObjectMessageID();
                //appEntity.EntityAttachments = ObjectMapper.Map<List<AppEntityAttachment>>(input.EntityAttachments);
                //xx
                appEntity.EntityAttachments = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(input.CreateMessageInput.EntityAttachments);
                //xx
                appEntity.TenantId = tenantId;
                //appEntity = await _appEntityRepository.InsertAsync(appEntity);
                //await CurrentUnitOfWork.SaveChangesAsync();
                var savedEntity = await _appEntitiesAppService.SaveEntity(appEntity);

                //Insert record into AppMessages table [Start]
                AppMessage message = new AppMessage();
                message.Subject = input.CreateMessageInput.Subject;
                message.To = input.CreateMessageInput.To;
                message.CC = input.CreateMessageInput.CC;
                message.BCC = input.CreateMessageInput.BCC;
                message.Body = messageBody;
                message.BodyFormat = input.CreateMessageInput.BodyFormat;
                message.EntityId = savedEntity;
                //*comments
                if (tenantId != null)
                    message.TenantId = (int)tenantId;
                else
                {
                    message.TenantId = tenantId;
                }
                //MMT
                message.UserId = (long)Convert.ToInt32(input.UsersList[i]);
                //MMT
                message.SenderId = (int)AbpSession.UserId;
                message.OriginalMessageId = input.Messageid;

                if (input.CreateMessageInput.ParentId > 0)
                {
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                    {
                        var originalParentMessageForSessionTenant = await _MessagesRepository.FirstOrDefaultAsync(x => x.Id == input.CreateMessageInput.ParentId);
                        var originalParentMessageForCurrTenant = await _MessagesRepository.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.OriginalMessageId == originalParentMessageForSessionTenant.OriginalMessageId);
                        if (originalParentMessageForCurrTenant != null)
                        {
                            message.ParentId = originalParentMessageForCurrTenant.Id;
                        }
                    }
                }
                message.ThreadId = input.ThreadId;
                await _MessagesRepository.InsertAsync(message);
            }
        }

        private static string HtmlToPlainText(string html)
        {
            const string tagWhiteSpace = @"(>|$)(\W|\n|\r)+<";//matches one or more (white space or line breaks) between '>' and '<'
            const string stripFormatting = @"<[^>]*(>|$)";//match any character between '<' and '>', even when end tag is missing
            const string lineBreak = @"<(br|BR)\s{0,1}\/{0,1}>";//matches: <br>,<br/>,<br />,<BR>,<BR/>,<BR />
            var lineBreakRegex = new Regex(lineBreak, RegexOptions.Multiline);
            var stripFormattingRegex = new Regex(stripFormatting, RegexOptions.Multiline);
            var tagWhiteSpaceRegex = new Regex(tagWhiteSpace, RegexOptions.Multiline);
            var text = html;
            //Decode html specific characters
            text = System.Net.WebUtility.HtmlDecode(text);
            //Remove tag whitespace/line breaks
            text = tagWhiteSpaceRegex.Replace(text, "><");
            //Replace <br /> with line breaks
            text = lineBreakRegex.Replace(text, Environment.NewLine);
            //Strip formatting
            text = stripFormattingRegex.Replace(text, string.Empty);
            return text;
        }

        private string GetUserNameByID(long? userId)
        {
            var userName = UserManager.Users.Where(x => x.Id == (long)userId).Select(x => x.Name).FirstOrDefault().ToString();
            userName += "." + UserManager.Users.Where(x => x.Id == (long)userId).Select(x => x.Surname).FirstOrDefault().ToString();
            userName += " @ " + GetTenantNameByID(userId);
            return userName;
        }


        public string GetUsersNamesByID(string users)
        {
            string output = "";
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var arr = users.Split(',');
                for (int i = 0; i < arr.Length; i++)
                {
                    if (i != 0)
                        output = output + " , ";
                    //T-SII-20230213.0009,1 MMT 03/14/2023 BE Error in message scrolling[Start]
                    //var userName = UserManager.Users.Where(x => x.Id == long.Parse(arr[i])).Select(x => x.Name).FirstOrDefault().ToString();
                    //userName += "." + UserManager.Users.Where(x => x.Id == long.Parse(arr[i])).Select(x => x.Surname).FirstOrDefault().ToString();
                    //userName += "@" + GetTenantNameByID(long.Parse(arr[i]));
                    //output = output + userName;
                    var userObj= UserManager.Users.Where(x => x.Id == long.Parse(arr[i])).FirstOrDefault();
                    if (userObj != null)
                    {
                        var userName = userObj.Name.ToString();
                        userName += "." + userObj.Surname.ToString();
                        userName += "@" + GetTenantNameByID(long.Parse(arr[i]));
                        output = output + userName;
                    }
                    //T-SII-20230213.0009,1 MMT 03/14/2023 BE Error in message scrolling[End]

                }
            }
            return output;
        }


        private string GetTenantNameByID(long? userId)
        {
            var tenantId = UserManager.Users.Where(x => x.Id == (long)userId).Select(x => x.TenantId).FirstOrDefault();
            string tenantName = L("Onetouch");
            if (tenantId!= null)
            {
                //T-SII-20230304.0001,1 MMT 03/14/2023 - Error while open Message page[Start]
                //tenantName = TenantManager.Tenants.Where(x => x.Id == tenantId).Select(x => x.TenancyName).FirstOrDefault().ToString();
                var tenantObj = TenantManager.Tenants.Where(x => x.Id == tenantId).FirstOrDefault();
                if (tenantObj != null)
                    tenantName = tenantObj.TenancyName.ToString();
                //T-SII-20230304.0001,1 MMT 03/14/2023 - Error while open Message page[End]
            }

            return tenantName;
        }

        public List<NameValue<string>> GetMessageRecieversName(String usersIds)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                List<NameValue<string>> usersName = new List<NameValue<string>>();
                var userId = usersIds.Split(",");
                for (int i = 0; i < userId.Length; i++)
                {
                    var name = GetUserNameByID(long.Parse(userId[i]));
                    //  name += "@" + GetTenantNameByID(long.Parse(userId[i]));
                    NameValue<string> username = new NameValue<string>() { Name = name, Value = userId[i].ToString() };
                    usersName.Add(username);
                }
                return usersName;
            }
        }
        [AbpAllowAnonymous]
        public async Task<long> GetUnreadCounts(string? messageCategoryFilter)
        {
            if (string.IsNullOrEmpty(messageCategoryFilter))
                messageCategoryFilter = "MESSAGE";
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var entityObjectTypeComment = await _helper.SystemTables.GetEntityObjectTypeComment();
                var entityObjectTypeMessage = await _helper.SystemTables.GetEntityObjectTypeMessageID();
                var entityObjectStatusUnreadID = await _helper.SystemTables.GetEntityObjectStatusUnreadMessageID();
                var unreadCount = 0;
                unreadCount = await _MessagesRepository.GetAll()
                    //Iteration39[Start]
                    .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MENTION", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeComment)
                    .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage)
                    .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "THREAD", z => (z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage || z.EntityFk.EntityObjectTypeId == entityObjectTypeComment) &&
  (z.ParentFKList.Count > 0 || z.ParentId !=null ))
                             //Iteration39[End]
                             //.WhereIf(MessageCategoryFilter != null, x => x.EntityFk.EntityCategories
                             //.Where(z => z.EntityObjectCategoryCode.Replace("-", string.Empty) == ((MessageCategory)Enum.Parse(typeof(MessageCategory), MessageCategoryFilter)).ToString()).Count() > 0)
                       .Where(x => (x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) || (x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0))
                       .Where(e => e.ParentId == null)
                       .Where(x => x.TenantId == AbpSession.TenantId && (x.UserId == AbpSession.UserId)).CountAsync();

                return unreadCount;
            }
        }
        //MMT39
        [AbpAllowAnonymous]
        private async Task<AppMarketplaceMessage> CreateMarketplaceMessageForSenderUser(CreateMessageInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                AppEntityDto appEntity = new AppEntityDto();
                ObjectMapper.Map(input, appEntity);
                appEntity.Name = "COMMENT";
                appEntity.Code = input.Code;

                if (string.IsNullOrEmpty(input.Code))
                {
                    appEntity.Code = Guid.NewGuid().ToString();
                }
                else
                {
                    appEntity.Code = input.Code;
                }
                appEntity.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusSentMessageID();

                if (input.MesasgeObjectType == MesasgeObjectType.Comment)
                { appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeComment(); }
                else { appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeMessageID(); }

                appEntity.ObjectId = await _helper.SystemTables.GetsydObjectMessageID();
                appEntity.TenantId =null;
                appEntity.RelatedEntityId = input.RelatedEntityId;
                var savedEntity = await _appEntitiesAppService.SaveEntity(appEntity);

                var message = ObjectMapper.Map<AppMarketplaceMessage>(input);
                message.EntityId = savedEntity;
                //message.TenantId = AbpSession.TenantId == null ? AbpSession.TenantId : (int)AbpSession.TenantId;
                message.SenderId = (int)AbpSession.UserId;
                //message.To = input.To;
                //message.CC = input.CC;
                //message.BCC = input.BCC;
                message.Body = input.BodyFormat != null ? HtmlToPlainText(input.BodyFormat) : input.Body;
                message.ParentId = input.ParentId == 0 ? null : input.ParentId;
                message.ThreadId = null;
                long? threadId = null;
                if (input.ParentId > 0)
                {
                    var originalParent = await _AppMarketplaceMessagesRepository.FirstOrDefaultAsync(x => x.Id == input.ParentId);
                    if (originalParent != null)
                        threadId = originalParent.ThreadId;
                    message.ThreadId = threadId;
                }

                //Insert record into AppMessages table [End]
                var savedMessage = await _AppMarketplaceMessagesRepository.InsertAsync(message);
                await CurrentUnitOfWork.SaveChangesAsync();

                //update threadId in case of no parent Thread
                if (threadId == null)
                    savedMessage.ThreadId = savedMessage.Id;

                //update OriginalMessageId for the new message, becuase this field will be used in CreateMessageForReciever
                savedMessage.OriginalMessageId = savedMessage.Id;

                return savedMessage;
            }
        }
        public List<GetMessagesForViewDto> GetCommentsForView(long id)
        {
            var entityObjectSent = _helper.SystemTables.GetEntityObjectStatusSentMessageID();
            var entityObjectSentID = long.Parse(entityObjectSent.Result.ToString());
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                long? threadId = _AppMarketplaceMessagesRepository.FirstOrDefault(x => x.Id == id).ThreadId;

                var messages = _AppMarketplaceMessagesRepository.GetAll()
                .Where(e => e.Id == id ||
                (threadId != null && (e.ThreadId == threadId && ((e.SenderId == AbpSession.UserId && e.EntityFk.EntityObjectStatusId == entityObjectSentID)))))
                //.Where(x => x.TenantId == AbpSession.TenantId)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                .OrderBy("id asc").ToList();
                List<GetMessagesForViewDto> output = new List<GetMessagesForViewDto>();
                for (int i = 0; i < messages.Count(); i++)
                {

                    var m = ObjectMapper.Map<MessagesDto>(messages[i]);
                    //var entityObjectClassStarred = AsyncContext.Run(_helper.SystemTables.GetEntityObjectClassificationStarredMessageID()).Result;
                    var task = _helper.SystemTables.GetEntityObjectClassificationStarredMessageID();
                    var entityObjectClassStarred = task.WaitAndUnwrapException();

                    //xxxx
                    /* m.IsFavorite = _MessagesRepository.GetAll().Where(x => x.Id == m.Id)
                         .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                     .Count() > 0;*/

                    m.IsFavorite = _AppMarketplaceMessagesRepository.GetAll().Where(x => x.Id == m.Id)
                        .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                        .Where(x => x.EntityFk.EntityClassifications.Count > 0)
                    .Count() > 0;
                    //xxxx

                    var message = new GetMessagesForViewDto { Messages = m };
                    message.Messages.SenderName = GetUserNameByID(messages[i].SenderId);
                   // message.Messages.ToName = GetUsersNamesByID(messages[i].To);
                    message.Messages.EntityAttachments = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(messages[i].EntityFk.EntityAttachments);
                    //Message.Messages.EntityAttachments = new List<AppEntityAttachmentDto>();
                    //var x1 = new AppEntityAttachmentDto();
                    //x1.FileName = "dfdfdf.doc";
                    //x1.AttachmentCategoryId = 4;
                    //Message.Messages.EntityAttachments.Add(x1);
                    //var x2 = new AppEntityAttachmentDto();
                    //x2.FileName = "cxcxcxcxcx.xls";
                    //x2.AttachmentCategoryId = 4;
                    //Message.Messages.EntityAttachments.Add(x2);
                    foreach (var item in message.Messages.EntityAttachments)
                    {
                        item.Url = @"attachments\" + AbpSession.TenantId + @"\" + item.FileName;
                    }
                    var profilePictureId = UserManager.Users.FirstOrDefault(y => y.Id == message.Messages.SenderId).ProfilePictureId;
                    if (profilePictureId != null)
                    {
                        message.Messages.ProfilePictureId = (Guid)profilePictureId;
                    }
                    output.Add(message);
                }
                return output;
            }
        }
        //MMT39
    }
}