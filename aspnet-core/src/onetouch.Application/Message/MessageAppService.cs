using Abp;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Net.Mail;
using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.ExtendedProperties;
using Humanizer;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Hosting.StaticWebAssets;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.PowerShell.Commands;
using Nito.AsyncEx;
using Nito.AsyncEx.Synchronous;
using NPOI.SS.Formula.Functions;
using NUglify.Helpers;
using onetouch.AppContacts;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using onetouch.AppMarketplaceContacts;
using onetouch.AppMarketplaceMessages;
using onetouch.AppMarketplaceTransactions;
using onetouch.AppPosts;
using onetouch.AppSiiwiiTransaction.Dtos;
using onetouch.Authorization;
using onetouch.Authorization.Roles;
using onetouch.Authorization.Users;
using onetouch.Authorization.Users.Dto;
using onetouch.Configuration;
using onetouch.Helpers;
using onetouch.Message.Dto;
using onetouch.Migrations;
using onetouch.MultiTenancy;
using onetouch.SystemObjects;
using Stripe;
using PayPalCheckoutSdk.Orders;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Management.Automation.Language;
using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Twilio.TwiML.Fax;
using static Microsoft.ApplicationInsights.MetricDimensionNames.TelemetryContext;
using static NPOI.HSSF.Util.HSSFColor;

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
        private readonly IRepository<AppPost, long> _appPostRepo;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppEntityRating, long> _appEntityRatingRepository;
        private readonly IRepository<AppEntitiesRelationship, long> _appEntitiesRelationshipRepository;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly RoleManager _roleManager;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<AppMarketplaceTransactionHeaders, long> _appMarketplaceTransactionHeaders;
        //I49[Start]
        private readonly IEmailSender _emailSender;
        //I49[End]
        public MessageAppService(IRepository<AppMessage, long> messagesRepository,
            IRepository<AppMessage, long> lookup_MessagesRepository,
            IRepository<AppEntity, long> appEntityRepository,
            IAppConfigurationAccessor appConfigurationAccessor,
            Helper helper, IAppEntitiesAppService appEntitiesAppService,
            IRepository<AppEntityClassification, long> appEntityClassificationRepository,
            IRepository<AppMarketplaceTransactionHeaders, long> appMarketplaceTransactionHeaders,
            IRepository<AppEntityReactionsCount, long> appEntityReactionsCount, IRepository<SycEntityObjectCategory, long> sycEntityObjectCategory,
            IRepository<AppMarketplaceMessage, long> appMarketplaceMessagesRepository, IRepository<AppPost, long> appPostRepo,
            IRepository<AppEntityExtraData, long> appEntityExtraDataRepository,
            IRepository<AppEntityRating, long> appEntityRatingRepository, RoleManager roleManager,
            IRepository<AppEntitiesRelationship, long> appEntitiesRelationshipRepository,
            IRepository<AppContact, long> appContactRepository,
            IEmailSender emailSender
            )
        {
            _roleManager = roleManager;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            _appEntityRatingRepository = appEntityRatingRepository;
            _appEntitiesRelationshipRepository = appEntitiesRelationshipRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appMarketplaceTransactionHeaders = appMarketplaceTransactionHeaders;
            _appContactRepository = appContactRepository;
            _roleManager = roleManager;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appEntityRatingRepository = appEntityRatingRepository;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            _MessagesRepository = messagesRepository;
            _lookup_MessagesRepository = lookup_MessagesRepository;
            _appEntityRepository = appEntityRepository;
            _helper = helper;
            _appEntitiesAppService = appEntitiesAppService;
            _appEntityClassificationRepository = appEntityClassificationRepository;
            _appEntityReactionsCount = appEntityReactionsCount;
            _sycEntityObjectCategory = sycEntityObjectCategory;
            _AppMarketplaceMessagesRepository = appMarketplaceMessagesRepository;
            _appPostRepo = appPostRepo;
            //I49[Start]
            _emailSender = emailSender;
            //I49[end]
        }

        public async Task<MessagePagedResultDto> GetAll(GetAllMessagesInput input)
        {
            if (string.IsNullOrEmpty(input.MessageCategoryFilter))
                input.MessageCategoryFilter = "MESSAGE";

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
            var entityObjectPost = await _helper.SystemTables.GetObjectPostId();

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
  (z.ParentFKList.Count > 0 || z.ParentId != null || (z.EntityFk.EntityObjectTypeId == entityObjectTypeComment &&  _MessagesRepository.GetAll().Count(x => (x.UserId == AbpSession.UserId) || (x.SenderId == AbpSession.UserId) &&
   x.ThreadId == z.ThreadId && x.EntityFk.EntityObjectTypeId == z.EntityFk.EntityObjectTypeId ) > 0))) // || _MessagesRepository.GetAll().Count(x => x.ThreadId == z.ThreadId) > 0
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
                         .WhereIf(string.IsNullOrEmpty(input.MessageCategoryFilter) || input.MessageCategoryFilter.ToUpper() != "THREAD", x => x.TenantId == AbpSession.TenantId && ((x.UserId == AbpSession.UserId)
           ||
           (x.SenderId == AbpSession.UserId)))
                         .WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "THREAD",x => (x.UserId == AbpSession.UserId) || (x.SenderId == AbpSession.UserId))
                         .Where(r => r.Id == _MessagesRepository.GetAll().Where(rr => rr.ThreadId == r.ThreadId).Max(rr => rr.Id));
                /*.Where(x => x.TenantId == AbpSession.TenantId && ((x.UserId == AbpSession.UserId)                
           ||
           (x.SenderId == AbpSession.UserId)));*/

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
                                       SenderName = UserManager.Users.Where(x => x.Id == (long)o.SenderId).FirstOrDefault() != null? UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Name).FirstOrDefault().ToString()
                                       + "." + UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Surname).FirstOrDefault().ToString()
                                        + " @ "+
                                       (UserManager.Users.Where(x => x.Id == (long)o.SenderId).FirstOrDefault() == null || UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.TenantId).FirstOrDefault().Value  == null ?
                                       L("Onetouch") : TenantManager.Tenants.Where(x => x.Id ==(UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.TenantId).FirstOrDefault())).Select(x => x.TenancyName).FirstOrDefault().ToString()):"",
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

                
                
                //var totalCount = await filteredMessages.GroupBy<AppMessage,long?>(z => z.ThreadId).CountAsync();
                var totalCount = await filteredMessages.CountAsync();
                var unreadCount = 0;


                unreadCount = await _MessagesRepository.GetAll()
                    .WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MENTION", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeComment)
.WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "MESSAGE", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage)
.WhereIf(!string.IsNullOrEmpty(input.MessageCategoryFilter) && input.MessageCategoryFilter.ToUpper() == "THREAD", z => (z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage || z.EntityFk.EntityObjectTypeId == entityObjectTypeComment) &&
  (z.ParentFKList.Count > 0 || z.ParentId != null || (z.EntityFk.EntityObjectTypeId == entityObjectTypeComment && _MessagesRepository.GetAll().Count(x => (x.UserId == AbpSession.UserId) || (x.SenderId == AbpSession.UserId) && x.ThreadId == z.ThreadId && x.EntityFk.EntityObjectTypeId == z.EntityFk.EntityObjectTypeId) > 0)))// || _MessagesRepository.GetAll().Count(x => x.ThreadId == x.ThreadId) > 0
                       .Where(x => (x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) || (x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0))
                       .Where(e => e.ParentId == null)
                       .Where(x => x.TenantId == AbpSession.TenantId && x.UserId == AbpSession.UserId).CountAsync();


                var listmessages = await messages.ToListAsync();
                var threads = listmessages.Select(z=>z.Messages.ThreadId).ToList();
                foreach (var th in threads)
                {
                    var frst = listmessages.Where(z=>z.Messages.ThreadId== th).FirstOrDefault();
                    if (frst!=null)
                    {      

                        listmessages.RemoveAll(z=>z.Messages.ThreadId==th && z.Messages.Id!= frst.Messages.Id);
                    }
                }
                //mm
                unreadCount = await filteredMessages.CountAsync(z=>z.EntityFk.EntityObjectStatusId== entityObjectStatusUnreadID
                || (input.MessageCategoryFilter.ToUpper() == "THREAD" && z.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0)); 
                //mm

                foreach (var message in listmessages)
                {
                    message.Messages.RecipientsName = GetUsersNamesByID(message.Messages.To).ToString();
                    var user = UserManager.Users.FirstOrDefault(y => y.Id == message.Messages.SenderId);
                    if (user != null)
                    {
                        var profilePictureId = user.ProfilePictureId;
                        if (profilePictureId != null)
                        {
                            message.Messages.ProfilePictureId = (Guid)profilePictureId;
                        }
                    }
                    message.Messages.RelatedEntityObjectTypeCode = (message.Messages.RelatedEntityObjectTypeCode == "SALESORDER" || message.Messages.RelatedEntityObjectTypeCode == "PURCHASEORDER") ? "transaction": message.Messages.RelatedEntityObjectTypeCode;
                    if (message.Messages.EntityObjectTypeCode == "COMMENT")
                    {
                        var comment = await _AppMarketplaceMessagesRepository.GetAll().Where(z => z.Id == message.Messages.ThreadId).FirstOrDefaultAsync();
                        if (comment != null)
                        {
                            message.Messages.Body = comment.Body;
                            message.Messages.BodyFormat = comment.BodyFormat;
                        }
                    }
                    //MM
                    if (message.Messages.RelatedEntityId != null)
                    {
                        var ent = await _appEntityRepository.GetAll().Where(z => z.Id == message.Messages.RelatedEntityId).FirstOrDefaultAsync();
                        if (ent != null)
                        {
                            if (ent.ObjectId == entityObjectPost)
                            {
                                var post = await _appPostRepo.GetAll().Where(z => z.AppEntityId == message.Messages.RelatedEntityId).FirstOrDefaultAsync();
                                if (post != null)
                                {
                                    message.Messages.RelatedEntityObjectTypeCode = "Post";
                                    message.Messages.RelatedEntityObjectTypeDescription = post.Description;
                                    var userObj = UserManager.Users.Where(x => x.Id == (long)post.CreatorUserId).FirstOrDefault();
                                    if (userObj != null)
                                    {
                                        message.Messages.RelatedEntityCreatorName = UserManager.Users.Where(x => x.Id == (long)post.CreatorUserId).Select(x => x.Name).FirstOrDefault().ToString()
                                           + "." + UserManager.Users.Where(x => x.Id == (long)post.CreatorUserId).Select(x => x.Surname).FirstOrDefault().ToString()
                                            + " @ " +
                                           (UserManager.Users.Where(x => x.Id == (long)post.CreatorUserId).Select(x => x.TenantId).FirstOrDefault().Value == null ?
                                           L("Onetouch") : TenantManager.Tenants.Where(x => x.Id == (UserManager.Users.Where(x => x.Id == (long)post.CreatorUserId).Select(x => x.TenantId).FirstOrDefault())).Select(x => x.TenancyName).FirstOrDefault().ToString());
                                    }
                                }
                            }
                            else {
                                if (ent.EntityObjectTypeCode.ToUpper() == "SALESORDER" || ent.EntityObjectTypeCode.ToUpper() == "PURCHASEORDER")
                                {
                                    message.Messages.RelatedEntityObjectTypeDescription = ent.Name;
                                    var userObj = UserManager.Users.Where(x => x.Id == (long)ent.CreatorUserId).FirstOrDefault();
                                    if (userObj != null)
                                    {
                                        message.Messages.RelatedEntityCreatorName = UserManager.Users.Where(x => x.Id == (long)ent.CreatorUserId).Select(x => x.Name).FirstOrDefault().ToString()
                                       + "." + UserManager.Users.Where(x => x.Id == (long)ent.CreatorUserId).Select(x => x.Surname).FirstOrDefault().ToString()
                                        + " @ " +
                                       (UserManager.Users.Where(x => x.Id == (long)ent.CreatorUserId).Select(x => x.TenantId).FirstOrDefault().Value == null ?
                                       L("Onetouch") : TenantManager.Tenants.Where(x => x.Id == (UserManager.Users.Where(x => x.Id == (long)ent.CreatorUserId).Select(x => x.TenantId).FirstOrDefault())).Select(x => x.TenancyName).FirstOrDefault().ToString());
                                    }
                                }
                            }
                        }
                    }
                    //MM
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
            //return new MessagePagedResultDto(0,0, new List<GetMessagesForViewDto>());
            var entityObjectTypeComment = await _helper.SystemTables.GetEntityObjectTypeComment();
            var entityObjectTypeMessage = await _helper.SystemTables.GetEntityObjectTypeMessageID();
            var orgComponentId = input.MainComponentEntitlyId;
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
                                   .AsNoTracking()
                                   .AsSplitQuery()
                                   .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                                   .Include(x => x.ParentFKList).ThenInclude(z => z.ParentFKList)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
                            //Iteration37-MMT[Start]
                            //.WhereIf(input.MessageCategoryFilter != null, x => x.EntityFk.EntityCategories
                            //.Where(z => z.EntityObjectCategoryCode.Replace("-", string.Empty) ==  input.MessageCategoryFilter.ToString()).Count() > 0)
                            //Iteration37-MMT[End]

                            .WhereIf(input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0,
                                e => e.EntityFk.EntitiesRelationships.Any(ee => ee.RelatedEntityId == (long)input.MainComponentEntitlyId) ||
                                     e.EntityFk.RelatedEntitiesRelationships.Any(ee => ee.EntityId == (long)input.MainComponentEntitlyId))

                            .WhereIf(input.ParentId == null || input.ParentId == 0, e => e.ParentId == null)
                            .WhereIf(input.ParentId != null && input.ParentId >= 0, e => e.ParentId == input.ParentId)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Body.Contains(input.Filter) || e.Subject.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.BodyFilter), e => e.Body == input.BodyFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.SubjectFilter), e => e.Subject == input.SubjectFilter)
                            .WhereIf(input.ThreadId != null && input.ThreadId > 0, e => e.ThreadId == input.ThreadId)
                        .Where(
                                 x =>
                                 //x.EntityFk.EntityObjectTypeCode == MesasgeObjectType.Comment.ToString().ToUpper()  &&
                                 x.OriginalMessageId == x.Id && (x.EntityFk.EntityObjectTypeId == entityObjectTypeMessage ? x.EntityFk.TenantId == AbpSession.TenantId : true)
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
                                          RelatedEntityId = (o.EntityFk.EntitiesRelationships != null && o.EntityFk.EntitiesRelationships.Count > 0) ? o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId :
                                          ((o.EntityFk.RelatedEntitiesRelationships != null && o.EntityFk.RelatedEntitiesRelationships.Count > 0) ? o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().EntityId : 0)
                                      },
                                  }
                                ;

                var totalCount = await filteredMessages.CountAsync();
                var unreadCount = 0;

                var results = await appComments.ToListAsync();
                //MMT
                if (orgComponentId != null && orgComponentId != 0 && orgComponentId != input.MainComponentEntitlyId)
                {
                    var filteredMessages2 = _MessagesRepository.GetAll()
                                                     .AsNoTracking()
                                                     .AsSplitQuery()
                                                     .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                                                     .Include(x => x.ParentFKList).ThenInclude(z => z.ParentFKList)
                                                     .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                                     .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
                                              .WhereIf(orgComponentId != null && orgComponentId != 0,
                                                  e => e.EntityFk.EntitiesRelationships.Any(ee => ee.RelatedEntityId == (long)orgComponentId) ||
                                                       e.EntityFk.RelatedEntitiesRelationships.Any(ee => ee.EntityId == (long)orgComponentId))

                                              .WhereIf(input.ParentId == null || input.ParentId == 0, e => e.ParentId == null)
                                              .WhereIf(input.ParentId != null && input.ParentId >= 0, e => e.ParentId == input.ParentId)
                                              .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Body.Contains(input.Filter) || e.Subject.Contains(input.Filter))
                                              .WhereIf(!string.IsNullOrWhiteSpace(input.BodyFilter), e => e.Body == input.BodyFilter)
                                              .WhereIf(!string.IsNullOrWhiteSpace(input.SubjectFilter), e => e.Subject == input.SubjectFilter)
                                              .WhereIf(input.ThreadId != null && input.ThreadId > 0, e => e.ThreadId == input.ThreadId)
                                          .Where(
                                                   x =>
                                                   //x.EntityFk.EntityObjectTypeCode == MesasgeObjectType.Comment.ToString().ToUpper()  &&
                                                   //x.OriginalMessageId == x.Id && (x.UserId == AbpSession.UserId || x.SenderId==AbpSession.UserId )
                                                   (x.UserId == AbpSession.UserId || x.SenderId == AbpSession.UserId)
                                                   && x.EntityFk.EntityObjectTypeId == entityObjectTypeMessage && x.TenantId == AbpSession.TenantId
                                               );

                    var pagedAndFilteredMessages2 = filteredMessages2
                        .OrderBy(input.Sorting ?? "id desc")
                        .PageBy(input);
                    var appComments2 = from o in pagedAndFilteredMessages2
                                       select new
                                        GetMessagesForViewDto()
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
                                             + " @ " + TenantManager.Tenants.Where(x => x.Id == (UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.TenantId).FirstOrDefault())).Select(x => x.TenancyName).FirstOrDefault().ToString(),
                                               ThreadId = o.ThreadId,
                                               ParentId = o.ParentId,
                                               EntityId = (int)o.EntityId,
                                               ParentFKList = o.ParentFKList == null || o.ParentFKList.Count == 0 ? new List<MessagesDto>() : ObjectMapper.Map<List<MessagesDto>>(o.ParentFKList.ToList()),
                                               HasChildren = o.ParentFKList == null || o.ParentFKList.Count == 0 ? false : true,
                                               EntityObjectTypeCode = o.EntityFk.EntityObjectTypeCode,
                                               RelatedEntityId = (o.EntityFk.EntitiesRelationships != null && o.EntityFk.EntitiesRelationships.Count > 0) ? o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId :
                                               ((o.EntityFk.RelatedEntitiesRelationships != null && o.EntityFk.RelatedEntitiesRelationships.Count > 0) ? o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().EntityId : 0)
                                           },
                                       }
                                    ;

                    //  totalCount += await filteredMessages2.CountAsync();

                    var results2 = await appComments2.ToListAsync();
                    foreach (var msg in results2)
                    {
                        if (msg.Messages.SenderId == AbpSession.UserId)
                        {
                            var messg = results.FirstOrDefault(z => z.Messages.Subject == msg.Messages.Subject &&
                               z.Messages.SenderId == msg.Messages.SenderId && z.Messages.Body == msg.Messages.Body);
                            if (messg == null)
                            {
                                msg.Messages.SenderName = GetUserNameByID(msg.Messages.SenderId);
                                msg.Messages.ToName = GetUsersNamesByID(msg.Messages.To);
                                results.Add(msg);
                                totalCount += 1;
                            }
                            else
                            {
                                if (msg.Messages.UserId != null && !messg.Messages.To.Contains(msg.Messages.UserId.ToString()))
                                    messg.Messages.To += "," + msg.Messages.UserId.ToString();

                                messg.Messages.SenderName = GetUserNameByID(messg.Messages.SenderId);
                                messg.Messages.ToName = GetUsersNamesByID(messg.Messages.To);
                            }

                        }
                        else
                        {
                            msg.Messages.SenderName = GetUserNameByID(msg.Messages.SenderId);
                            msg.Messages.ToName = GetUsersNamesByID(msg.Messages.To);
                            results.Add(msg);
                            totalCount += 1;
                        }
                    }


                    //results.AddRange(results2);
                }
                //MMT
                var senderIds = results
                    .Where(x => x.Messages.SenderId.HasValue)
                    .Select(x => x.Messages.SenderId.Value)
                    .Distinct()
                    .ToList();
                var profilePictureIds = await UserManager.Users
                    .AsNoTracking()
                    .Where(y => senderIds.Contains(y.Id))
                    .Select(y => new { y.Id, y.ProfilePictureId })
                    .ToDictionaryAsync(y => y.Id, y => y.ProfilePictureId);

                foreach (var x in results)
                {
                    if (x.Messages.SenderId.HasValue &&
                        profilePictureIds.TryGetValue(x.Messages.SenderId.Value, out var profilePictureId) &&
                        profilePictureId != null)
                    { x.Messages.ProfilePictureId = (Guid)profilePictureId; }
                    if (x.Messages.ParentFKList != null && x.Messages.ParentFKList.Count > 0)
                    {
                        x.Messages.ParentFKList.ForEach(z => z.HasChildren = (z.ParentFKList != null && z.ParentFKList.Count > 0) ? true : false);
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

            if (message != null)
            {
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


        }

        public  List<GetMessagesForViewDto> GetMessagesForView(long id)
        {
            var entityObjectTypeComment =  _helper.SystemTables.GetEntityObjectTypeComment();
            var entityObjectTypeCommentType = long.Parse(entityObjectTypeComment.Result.ToString());
            var entityObjectSent = _helper.SystemTables.GetEntityObjectStatusSentMessageID();
            var entityObjectSentID = long.Parse(entityObjectSent.Result.ToString());
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                long? threadId = _MessagesRepository.FirstOrDefault(x => x.Id == id).ThreadId;

                var messages = _MessagesRepository.GetAll()
                .Where(e => e.Id == id || 
                (threadId != null && (e.ThreadId == threadId && (e.UserId == AbpSession.UserId || (e.EntityFk.EntityObjectTypeId == entityObjectTypeCommentType) ||
                (e.SenderId == AbpSession.UserId && e.EntityFk.EntityObjectStatusId ==  entityObjectSentID)))))
                .Where(x => (x.TenantId == AbpSession.TenantId) || (x.EntityFk.EntityObjectTypeId == entityObjectTypeCommentType))
                .Include(z => z.EntityFk)
                .Include(z => z.EntityFk).ThenInclude(z => z.EntitiesRelationships)
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
                    //MMT2024
                    if (messages[i].EntityFk.EntityObjectTypeCode == "COMMENT")
                    {
                        var marketplaceMessage =  _AppMarketplaceMessagesRepository.GetAll().Include(z => z.EntityFk)
                            .ThenInclude(z => z.RelatedEntitiesRelationships)
                            .Include(z => z.EntityFk)
                            .ThenInclude(z => z.EntitiesRelationships)
                            .Where(z => z.Id == message.Messages.ThreadId).FirstOrDefault();
                        if (marketplaceMessage != null)
                            message.Messages.RelatedEntityId = (marketplaceMessage.EntityFk.EntitiesRelationships != null && marketplaceMessage.EntityFk.EntitiesRelationships.Count > 0) ? marketplaceMessage.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId :
                                                  ((marketplaceMessage.EntityFk.RelatedEntitiesRelationships != null && marketplaceMessage.EntityFk.RelatedEntitiesRelationships.Count > 0) ? marketplaceMessage.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().EntityId : 0);
                     }
                    //MMT2024
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
                    var user = UserManager.Users.FirstOrDefault(y => y.Id == message.Messages.SenderId);
                    if (user != null)
                    {
                        var profilePictureId = UserManager.Users.FirstOrDefault(y => y.Id == message.Messages.SenderId).ProfilePictureId;
                        if (profilePictureId != null)
                        {
                            message.Messages.ProfilePictureId = (Guid)profilePictureId;
                        }
                    }
                    //abc
                   
                    var messg = output.FirstOrDefault(z => z.Messages.Subject == messages[i].Subject &&
                           z.Messages.SenderId == messages[i].SenderId && z.Messages.Body == messages[i].Body);
                    if (messg == null)
                    {
                        output.Add(message);
                    }
                    //abc
                   
                }
                return output;
            }
        }

        public List<GetUsersForMessageDto> GetAllUsers(string searchTerm)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (searchTerm == null)
                    searchTerm = "";
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
            //I40-X27[Start]
            if (input.MesasgeObjectType == MesasgeObjectType.Review)
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    
                    var review = await CreateMarketplaceMessageForSenderUser(input);
                    if (input.To != null)
                    {
                        var wntityObj = await _appEntityRepository.GetAll().Where(z => z.Id == input.RelatedEntityId).FirstOrDefaultAsync();
                        if (wntityObj != null && wntityObj.TenantOwner != null && wntityObj.TenantOwner != 0)
                        {
                            var tenant = await TenantManager.GetByIdAsync(wntityObj.TenantOwner);
                            if (tenant != null)
                            {
                                string userName = "admin@" + tenant.TenancyName;
                                var adminUser = await UserManager.FindByNameAsync(userName);
                                if (adminUser != null)
                                    input.To = adminUser.Id.ToString();
                                //input.To
                            }
                        }
                    }
                    if (!string.IsNullOrEmpty(input.To))
                    {
                        var user = UserManager.GetUserById(long.Parse(input.To));
                        if (user != null)
                        {
                            if (input.MentionedUsers == null)
                                input.MentionedUsers = new List<MentionedUserInfo>();
                            if (input.MentionedUsers.FirstOrDefault(z => z.UserId == user.Id && z.TenantId == long.Parse(user.TenantId.ToString())) == null)
                                input.MentionedUsers.Add(new MentionedUserInfo { UserId = user.Id, TenantId = long.Parse(user.TenantId.ToString()) });
                        }
                    }
                    if (input.MentionedUsers != null && input.MentionedUsers.Count > 0)
                    {
                        foreach (var userId in input.MentionedUsers)
                        {
                            CreateMessageForRecieversInput createMessageForRecieversInput = new CreateMessageForRecieversInput();
                            createMessageForRecieversInput.Messageid = review.Id;
                            createMessageForRecieversInput.ThreadId = review.ThreadId;
                            createMessageForRecieversInput.CreateMessageInput = input;
                            createMessageForRecieversInput.CreateMessageInput.To = userId.UserId.ToString();
                            string[] toList = new string[1];
                            toList[0] = userId.UserId.ToString();
                            createMessageForRecieversInput.UsersList = toList;
                            await CreateMessageForRecieverUsers(createMessageForRecieversInput);
                        }
                    }

                    return GetCommentsForView(review.Id);
                }
            }
            //I40-X27[End]
            //I48[Start]
            if (input.MesasgeObjectType == MesasgeObjectType.Question)
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var review = await CreateMarketplaceMessageForSenderUser(input);
                    if (input.To != null)
                    {
                        var wntityObj = await _appEntityRepository.GetAll().Where(z => z.Id == input.RelatedEntityId).FirstOrDefaultAsync();
                        if (wntityObj != null && wntityObj.TenantOwner != null && wntityObj.TenantOwner != 0)
                        {
                            var tenant = await TenantManager.GetByIdAsync(wntityObj.TenantOwner);
                            if (tenant != null)
                            {
                                string userName = "admin@" + tenant.TenancyName;
                                var adminUser = await UserManager.FindByNameAsync(userName);
                                if (adminUser != null)
                                    input.To = adminUser.Id.ToString();
                                //input.To
                            }
                        }
                    }
                    if (!string.IsNullOrEmpty(input.To))
                    {
                        var user = UserManager.GetUserById(long.Parse(input.To));
                        if (user != null)
                        {
                            if (input.MentionedUsers == null)
                                input.MentionedUsers = new List<MentionedUserInfo>();
                            if (input.MentionedUsers.FirstOrDefault(z => z.UserId == user.Id && z.TenantId == long.Parse(user.TenantId.ToString())) == null)
                                input.MentionedUsers.Add(new MentionedUserInfo { UserId = user.Id, TenantId = long.Parse(user.TenantId.ToString()) });
                        }
                    }
                    if (input.MentionedUsers != null && input.MentionedUsers.Count > 0)
                    {
                        foreach (var userId in input.MentionedUsers)
                        {
                            CreateMessageForRecieversInput createMessageForRecieversInput = new CreateMessageForRecieversInput();
                            createMessageForRecieversInput.Messageid = review.Id;
                            createMessageForRecieversInput.ThreadId = review.ThreadId;
                            createMessageForRecieversInput.CreateMessageInput = input;
                            createMessageForRecieversInput.CreateMessageInput.To = userId.UserId.ToString();
                            string[] toList = new string[1];
                            toList[0] = userId.UserId.ToString();
                            createMessageForRecieversInput.UsersList = toList;
                            await CreateMessageForRecieverUsers(createMessageForRecieversInput);
                        }
                    }

                    return GetCommentsForView(review.Id);
                }
            }
            //I48[End]
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
                            if (input.MentionedUsers.FirstOrDefault(z=>z.UserId == user.Id && z.TenantId== long.Parse(user.TenantId.ToString())) == null)
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
                //I49[Start]
                string recipientTenantName = "";
                string recipientEmail = "";
                string recipientFirstName = "";
                //I49[End]
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var id = (long)Convert.ToInt32(input.UsersList[i]);
                    tenantId = UserManager.Users.Where(x => x.Id == id).Select(x => x.TenantId).FirstOrDefault();
                    recipientFirstName = UserManager.Users.Where(x => x.Id == id).Select(x => x.Name).FirstOrDefault();
                    var tenant = await TenantManager.GetByIdAsync(int.Parse(tenantId.ToString()));
                    if (tenant != null)
                        recipientTenantName = tenant.TenancyName;

                    recipientEmail = UserManager.Users.Where(x => x.Id == id).Select(x => x.EmailAddress).FirstOrDefault();
                }
                //Insert record into AppEntities table [Start]
                AppEntityDto appEntity = new AppEntityDto();
                ObjectMapper.Map(input, appEntity);
                appEntity.Name = "Message";
                //I48[Start]
                if (input.CreateMessageInput.MesasgeObjectType == MesasgeObjectType.Comment)
                    appEntity.Name = "COMMENT";
                else
                {
                    if (input.CreateMessageInput.MesasgeObjectType == MesasgeObjectType.Review)
                        appEntity.Name = "REVIEW";
                    else
                    {
                        if (input.CreateMessageInput.MesasgeObjectType == MesasgeObjectType.Question)
                            appEntity.Name = "Question";
                        else
                            appEntity.Name = "Message";
                    }
                }

                //I48[End]
                //MMT39
                string transactionSSIN = "";
                if (input.CreateMessageInput.RelatedEntityId != null)
                {
                    var entity = await _appEntityRepository.GetAll().Where(z => z.Id == input.CreateMessageInput.RelatedEntityId).FirstOrDefaultAsync();
                    if (entity != null && (entity.EntityObjectTypeCode == "SALESORDER" || entity.EntityObjectTypeCode == "PURCHASEORDER"))
                    {
                        transactionSSIN = entity.SSIN;
                        //if (!string.IsNullOrEmpty(transactionSSIN))
                        //{
                        //    var entityShared = await _appEntityRepository.GetAll().Where(z => z.SSIN == transactionSSIN && z.TenantId == null).FirstOrDefaultAsync();
                        //    if (entityShared != null)
                        //    {
                        //        input.CreateMessageInput.RelatedEntityId = entityShared.Id;
                        //    }
                        //}
                    }
                }
                if (!string.IsNullOrEmpty(transactionSSIN) && tenantId != null)
                {
                    var entityTenant = await _appEntityRepository.GetAll().Where(z => z.SSIN == transactionSSIN && z.TenantId == tenantId).FirstOrDefaultAsync();
                    if (entityTenant != null)
                    {
                        input.CreateMessageInput.RelatedEntityId = entityTenant.Id;
                    }
                }
                //MMT39
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
                //I40[Start]
                //if (input.CreateMessageInput.MesasgeObjectType == MesasgeObjectType.Comment)
                //{ appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeComment(); }
                //else { appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeMessageID(); }
                if (input.CreateMessageInput.MesasgeObjectType == MesasgeObjectType.Comment)
                { appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeComment(); }
                else
                {
                    if (input.CreateMessageInput.MesasgeObjectType == MesasgeObjectType.Review)
                    {
                        appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeReview();
                    }
                    else
                    {
                        if (input.CreateMessageInput.MesasgeObjectType == MesasgeObjectType.Question)
                        {
                            appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeQuestion();
                        }
                        else
                        {
                            appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeMessageID();
                        }
                    }
                }
                //I40[End]
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
                //I49[Start]
                string notificationSetting = await _appEntitiesAppService.GetTenantSettingValue(1232);
                if (notificationSetting.TrimEnd().ToLower()=="true" && (appEntity.Name == "Message" || appEntity.Name == "COMMENT") && !string.IsNullOrEmpty(recipientEmail))
                {
                    await _emailSender.SendAsync(new MailMessage
                    {
                        To = { recipientEmail },
                        Subject = message.Subject,
                        //Body = @"Hello "+ recipientFirstName+","+ Environment.NewLine+
                        //"You’ve received a new direct message in your " + recipientTenantName.TrimEnd() + " account.Please log in to view and respond."+ Environment.NewLine +
                        //"to view message open the following link: " + _appConfiguration["App:ClientRootAddress"]+ "/account/login" + Environment.NewLine +
                        //"Thank you for using" + recipientTenantName.TrimEnd()+"."+ Environment.NewLine +
                        //"— The " + recipientTenantName.TrimEnd()+" Team",
                        Body = "<!DOCTYPE html><html><head/><body><p>Hello " + recipientFirstName +
                        ",<br><br>You’ve received a new direct message in your "+ recipientTenantName.TrimEnd() +
                        " account.Please log in to view and respond.<br><br><a class=\"btn\"" +
                        " href=\""+_appConfiguration["App:ClientRootAddress"]+ @"/app/main/Messages"+ "\">"+
                        "<button  style=\r\n        \"background-color: #4A0D4A; \r\n        color: white;\" >Open Message</button></a>" +
                        "<br><br>Thank you for using " +"SIIWII" +//recipientTenantName.TrimEnd()+
                        ".<br><br> — The "+"SIIWII" + " Team</p></body></html>",//recipientTenantName.TrimEnd()
                        IsBodyHtml = true
                    });
                }
                //I49[End]
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
            string userName = "";
            var user= UserManager.Users.Where(x => x.Id == (long)userId).FirstOrDefault();
            if (user != null)
            { 
                userName = user.Name.ToString();
                userName += "." + user.Surname.ToString();
                userName += " @ " + GetTenantNameByID(userId);
            }
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
                var entityObjectReadID = await _helper.SystemTables.GetEntityObjectStatusReadMessageID();
                var entityObjectStatusUnreadID = await _helper.SystemTables.GetEntityObjectStatusUnreadMessageID();
                var entityObjectArchiveID = await _helper.SystemTables.GetEntityObjectStatusArchivedMessageID();
                var ObjectStatusDeleted = await _helper.SystemTables.GetEntityObjectStatusDeletedMessageID();
                var entityObjectSentID = await _helper.SystemTables.GetEntityObjectStatusSentMessageID();
                var entityObjectTypeComment = await _helper.SystemTables.GetEntityObjectTypeComment();
                var entityObjectTypeMessage = await _helper.SystemTables.GetEntityObjectTypeMessageID();
                //var entityObjectStatusUnreadID = await _helper.SystemTables.GetEntityObjectStatusUnreadMessageID();
                var unreadCount = 0;
                //mm
                //              unreadCount = await _MessagesRepository.GetAll()
                //                  //Iteration39[Start]
                //                  .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MENTION", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeComment)
                //                  .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage)
                //                  .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "THREAD", z => (z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage || z.EntityFk.EntityObjectTypeId == entityObjectTypeComment) &&
                //(z.ParentFKList.Count > 0 || z.ParentId !=null ))
                //                           //Iteration39[End]
                //                           //.WhereIf(MessageCategoryFilter != null, x => x.EntityFk.EntityCategories
                //                           //.Where(z => z.EntityObjectCategoryCode.Replace("-", string.Empty) == ((MessageCategory)Enum.Parse(typeof(MessageCategory), MessageCategoryFilter)).ToString()).Count() > 0)
                //                     .Where(x => (x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) || (x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0))
                //                    // .Where(e => e.ParentId == null)
                //                     .Where(x => x.TenantId == AbpSession.TenantId && (x.UserId == AbpSession.UserId))
                //                     .WhereIf(messageCategoryFilter.ToUpper() != "THREAD", x => x.TenantId == AbpSession.TenantId && ((x.UserId == AbpSession.UserId)
                //         ||
                //         (x.SenderId == AbpSession.UserId)))
                //                       .WhereIf(messageCategoryFilter.ToUpper() == "THREAD", x => (x.UserId == AbpSession.UserId) || (x.SenderId == AbpSession.UserId))
                //                     .Where(r => r.Id == _MessagesRepository.GetAll().Where(rr => rr.ThreadId == r.ThreadId).Max(rr => rr.Id))
                //                     .CountAsync();
                //mm
                //              var unreadCountQ = _MessagesRepository.GetAll()
                //                  //Iteration39[Start]
                //                  .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MENTION", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeComment)
                //                  .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage)
                //                  .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "THREAD", z => (z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage || z.EntityFk.EntityObjectTypeId == entityObjectTypeComment) &&
                //(z.ParentFKList.Count > 0 || z.ParentId != null))
                //                     //Iteration39[End]
                //                     //.WhereIf(MessageCategoryFilter != null, x => x.EntityFk.EntityCategories
                //                     //.Where(z => z.EntityObjectCategoryCode.Replace("-", string.Empty) == ((MessageCategory)Enum.Parse(typeof(MessageCategory), MessageCategoryFilter)).ToString()).Count() > 0)
                //                     .Where(x => (x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) || (messageCategoryFilter.ToUpper() == "THREAD" && x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0))
                //                     // .Where(e => e.ParentId == null)
                //                     .Where(x => x.TenantId == AbpSession.TenantId && (x.UserId == AbpSession.UserId))
                //                     .WhereIf(messageCategoryFilter.ToUpper() != "THREAD", x => x.TenantId == AbpSession.TenantId && ((x.UserId == AbpSession.UserId)
                //         ||
                //         (x.SenderId == AbpSession.UserId)))
                //                       .WhereIf(messageCategoryFilter.ToUpper() == "THREAD", x => (x.UserId == AbpSession.UserId) || (x.SenderId == AbpSession.UserId))
                //                     .Where(r => r.Id == _MessagesRepository.GetAll().Where(rr => rr.ThreadId == r.ThreadId).Max(rr => rr.Id));
                var unreadCountQ = _MessagesRepository.GetAll()
                                                //.Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                                               // .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectStatusFk)
                                                .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                                                //.Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                             //   .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
             //xx
             //.WhereIf(input.messageTypeIndex == 1 || input.messageTypeIndex == 3, x => x.EntityFk.EntityObjectStatusId == entityObjectStatusID || x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID)
             //.WhereIf(input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0, e => e.EntityFk.RelatedEntitiesRelationships.Where(ee => ee.EntityId == (long)input.MainComponentEntitlyId).Count() > 0)
            // .WhereIf(input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0, e => e.EntityFk.EntitiesRelationships.Where(ee => ee.EntityId == (long)input.MainComponentEntitlyId).Count() > 0)
             .WhereIf( (!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE"),
                  x => x.UserId == AbpSession.UserId && (x.EntityFk.EntityObjectStatusId == entityObjectReadID ||
                  x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID)
             || (((x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0
                 || x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectReadID) > 0))
                     &&
                     (x.EntityFk.EntityObjectStatusId != entityObjectArchiveID &&
                      x.EntityFk.EntityObjectStatusId != ObjectStatusDeleted))
             )

             .WhereIf((!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE"), x => x.SenderId == AbpSession.UserId && ((x.EntityFk.EntityObjectStatusId == entityObjectSentID)
             || (x.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectSentID) > 0))
               &&
                     (x.EntityFk.EntityObjectStatusId != entityObjectArchiveID &&
                      x.EntityFk.EntityObjectStatusId != ObjectStatusDeleted))

             //Iteration37-MMT[Start]
             //.WhereIf(input.MessageCategoryFilter != null, x=>x.EntityFk.EntityCategories
             //.Where(z=> z.EntityObjectCategoryCode.Replace("-",string.Empty) ==input.MessageCategoryFilter).Count()>0)
             //Iteration37-MMT[End]
             // Iteration 39 [Start]
             .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MENTION", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeComment)
             .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE", z => z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage)
             .WhereIf(!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "THREAD", z => (z.EntityFk.EntityObjectTypeId == entityObjectTypeMessage || z.EntityFk.EntityObjectTypeId == entityObjectTypeComment) &&
               (z.ParentFKList.Count > 0 || z.ParentId != null || (z.EntityFk.EntityObjectTypeId == entityObjectTypeComment && _MessagesRepository.GetAll().Count(x => (x.UserId == AbpSession.UserId) || (x.SenderId == AbpSession.UserId) &&
                x.ThreadId == z.ThreadId && x.EntityFk.EntityObjectTypeId == z.EntityFk.EntityObjectTypeId) > 0))) // || _MessagesRepository.GetAll().Count(x => x.ThreadId == z.ThreadId) > 0
                                                                                                                   // Iteration 39 [End]
             .WhereIf((!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE"), x => (x.EntityFk.EntityObjectStatusId != ObjectStatusDeleted) && (x.SenderId == AbpSession.UserId || x.UserId == AbpSession.UserId))
                                                 //xx
                                                 //.WhereIf((!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE"), x => x.EntityFk.EntityClassifications.Count(x => x.EntityObjectClassificationId == entityObjectClassStarred) > 0)
                                                 .WhereIf((!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE"), x => x.EntityFk.EntityObjectStatusId == entityObjectArchiveID && (x.SenderId == AbpSession.UserId || x.UserId == AbpSession.UserId))
                                                 .WhereIf((!string.IsNullOrEmpty(messageCategoryFilter) && messageCategoryFilter.ToUpper() == "MESSAGE"), x => x.EntityFk.EntityObjectStatusId == ObjectStatusDeleted && (x.SenderId == AbpSession.UserId || x.UserId == AbpSession.UserId))
                                                 .Where(e => e.ParentId == null)
                                                 //.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Body.ToUpper().Contains(input.Filter.ToUpper()) || e.Subject.ToUpper().Contains(input.Filter.ToUpper()) ||
                                                 // e.SenderFk.UserName.ToUpper().Contains(input.Filter.ToUpper()) || e.UserFk.UserName.ToUpper().Contains(input.Filter.ToUpper()))
                                                //  .WhereIf(!string.IsNullOrWhiteSpace(input.BodyFilter), e => e.Body == input.BodyFilter)
                                    // .WhereIf(!string.IsNullOrWhiteSpace(input.SubjectFilter), e => e.Subject == input.SubjectFilter)
                                      .WhereIf(messageCategoryFilter.ToUpper() != "THREAD", x => x.TenantId == AbpSession.TenantId && ((x.UserId == AbpSession.UserId)
                        ||
                        (x.SenderId == AbpSession.UserId)))
                                      .WhereIf(messageCategoryFilter.ToUpper() == "THREAD", x => (x.UserId == AbpSession.UserId) || (x.SenderId == AbpSession.UserId))
                                      .Where(r => r.Id == _MessagesRepository.GetAll().Where(rr => rr.ThreadId == r.ThreadId).Max(rr => rr.Id));
                //unreadCount = await unreadCountQ.CountAsync();
                unreadCount = await unreadCountQ.CountAsync(z => z.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID
                || (messageCategoryFilter.ToUpper() == "THREAD" && z.ParentFKList.Count(x => x.EntityFk.EntityObjectStatusId == entityObjectStatusUnreadID) > 0));
                //mm
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

                if (input.MesasgeObjectType == MesasgeObjectType.Comment)
                    appEntity.Name = "COMMENT";
                else
                {
                    if (input.MesasgeObjectType == MesasgeObjectType.Review)
                        appEntity.Name = "REVIEW";
                    else
                    { 
                        if (input.MesasgeObjectType == MesasgeObjectType.Question)
                            appEntity.Name = "Question";
                        else
                            appEntity.Name = "Message";
                    }
                }

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
                else 
                {
                    if (input.MesasgeObjectType == MesasgeObjectType.Review)
                    {
                        appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeReview();
                    }
                    else {
                        if (input.MesasgeObjectType == MesasgeObjectType.Question)
                        {
                            appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeQuestion();
                        }
                        else
                        {
                            appEntity.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeMessageID();
                        }
                    }
                }

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
                    //else
                    //{
                    //    threadId = input.ThreadId;
                    //}
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
        //I48[Start]
        [AbpAllowAnonymous]
        public async Task<double> GetAllReviewsCount(long input)
        {
            var reviewType = await _helper.SystemTables.GetEntityObjectTypeReview();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                double returnCount = 0;
                var filteredMessages = _AppMarketplaceMessagesRepository.GetAll()
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
                            .WhereIf(input != null && input != 0,
                                e => e.EntityFk.EntitiesRelationships.Where(ee => ee.RelatedEntityId == input).Count() > 0 ||
                                     e.EntityFk.RelatedEntitiesRelationships.Where(ee => ee.EntityId == input).Count() > 0)
                            .Where(e => e.ParentId == null && e.OriginalMessageId == e.Id 
                            && e.EntityFk.EntityObjectTypeId== reviewType);
                returnCount = await filteredMessages.CountAsync();
                return returnCount;
            }
        }

        [AbpAllowAnonymous]
        public async Task<List<MarketplaceItemReviewSummaryDto>> GetMarketplaceItemReviewSummaries(List<long> entityIds)
        {
            var itemIds = entityIds?.Distinct().ToList() ?? new List<long>();
            if (itemIds.Count == 0)
                return new List<MarketplaceItemReviewSummaryDto>();

            var reviewType = await _helper.SystemTables.GetEntityObjectTypeReview();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var reviewEntityIds = _AppMarketplaceMessagesRepository.GetAll()
                    .Where(message => message.ParentId == null &&
                                      message.OriginalMessageId == message.Id &&
                                      message.EntityFk.EntityObjectTypeId == reviewType)
                    .Select(message => message.EntityId);

                var directReviewCounts = await _appEntitiesRelationshipRepository.GetAll()
                    .Where(relationship => itemIds.Contains(relationship.RelatedEntityId) &&
                                           reviewEntityIds.Contains(relationship.EntityId))
                    .GroupBy(relationship => relationship.RelatedEntityId)
                    .Select(group => new { EntityId = group.Key, Count = group.Count() })
                    .ToListAsync();

                var inverseReviewCounts = await _appEntitiesRelationshipRepository.GetAll()
                    .Where(relationship => itemIds.Contains(relationship.EntityId) &&
                                           reviewEntityIds.Contains(relationship.RelatedEntityId))
                    .GroupBy(relationship => relationship.EntityId)
                    .Select(group => new { EntityId = group.Key, Count = group.Count() })
                    .ToListAsync();

                var reviewCounts = directReviewCounts.Concat(inverseReviewCounts)
                    .GroupBy(entry => entry.EntityId)
                    .ToDictionary(group => group.Key, group => group.Sum(entry => entry.Count));

                var ratings = await _appEntityRatingRepository.GetAll()
                    .Where(rating => itemIds.Contains(rating.EntityId))
                    .GroupBy(rating => rating.EntityId)
                    .Select(group => new
                    {
                        EntityId = group.Key,
                        AverageRating = group.Average(rating => (decimal)rating.Rating)
                    })
                    .ToListAsync();
                var ratingsByEntity = ratings.ToDictionary(entry => entry.EntityId, entry => entry.AverageRating);

                return itemIds.Select(entityId => new MarketplaceItemReviewSummaryDto
                {
                    EntityId = entityId,
                    NumberOfReviews = reviewCounts.TryGetValue(entityId, out var count) ? count : 0,
                    AverageRating = ratingsByEntity.TryGetValue(entityId, out var average) ? average : 0
                }).ToList();
            }
        }
        //I48[End]
        //I40-X527[Start]
        [AbpAllowAnonymous]
        public async Task<MessagePagedResultDto> GetAllReviews(GetAllMessagesInput input)
        {
           // return new MessagePagedResultDto(0, 0, new List<GetMessagesForViewDto>());
            var entityObjectTypeComment = await _helper.SystemTables.GetEntityObjectTypeReview();
            var entityObjectTypeMessage = await _helper.SystemTables.GetEntityObjectTypeMessageID();
            var orgComponentId = input.MainComponentEntitlyId;
            IQueryable<AppMarketplaceMessage> filteredMessages = null;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                ////MMT
                //if (input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0)
                //{
                //    var entity = await _appEntityRepository.GetAll().Where(z => z.Id == input.MainComponentEntitlyId).FirstOrDefaultAsync();
                //    if (entity != null && (entity.EntityObjectTypeCode == "SALESORDER" || entity.EntityObjectTypeCode == "PURCHASEORDER"))
                //    {
                //        var transactionSSIN = entity.SSIN;
                //        if (!string.IsNullOrEmpty(transactionSSIN))
                //        {
                //            var entityShared = await _appEntityRepository.GetAll().Where(z => z.SSIN == transactionSSIN && z.TenantId == null).FirstOrDefaultAsync();
                //            if (entityShared != null)
                //            {
                //                input.MainComponentEntitlyId = entityShared.Id;
                //            }
                //        }
                //    }
                //}
                ////MMT
                filteredMessages = _AppMarketplaceMessagesRepository.GetAll()
                                   //.Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                                   //.Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectStatusFk)
                                   .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                                   .Include(x => x.ParentFKList).ThenInclude(z => z.ParentFKList).Include(x => x.EntityFk)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                            //Iteration37-MMT[Start]
                            //.WhereIf(input.MessageCategoryFilter != null, x => x.EntityFk.EntityCategories
                            //.Where(z => z.EntityObjectCategoryCode.Replace("-", string.Empty) ==  input.MessageCategoryFilter.ToString()).Count() > 0)
                            //Iteration37-MMT[End]

                            .WhereIf(input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0,
                                e => e.EntityFk.EntitiesRelationships.Where(ee => ee.RelatedEntityId == (long)input.MainComponentEntitlyId).Count() > 0 ||
                                     e.EntityFk.RelatedEntitiesRelationships.Where(ee => ee.EntityId == (long)input.MainComponentEntitlyId).Count() > 0)

                            .WhereIf(input.ParentId == null || input.ParentId == 0, e => e.ParentId == null)
                            .WhereIf(input.ParentId != null && input.ParentId >= 0, e => e.ParentId == input.ParentId)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Body.Contains(input.Filter) || e.Subject.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.BodyFilter), e => e.Body == input.BodyFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.SubjectFilter), e => e.Subject == input.SubjectFilter)
                            .WhereIf(input.ThreadId != null && input.ThreadId > 0, e => e.ThreadId == input.ThreadId)
                        .Where(
                                 x =>
                                 //x.EntityFk.EntityObjectTypeCode == MesasgeObjectType.Comment.ToString().ToUpper()  &&
                                 x.OriginalMessageId == x.Id && x.EntityFk.EntityObjectTypeId == entityObjectTypeComment
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
                                          EntityAttachments = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(o.EntityFk.EntityAttachments),
                                          SenderName = UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Name).FirstOrDefault().ToString()
                                       + " " + UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Surname).FirstOrDefault().ToString(),
                                          //  + " @ " + TenantManager.Tenants.Where(x => x.Id == (UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.TenantId).FirstOrDefault())).Select(x => x.TenancyName).FirstOrDefault().ToString(),
                                          ThreadId = o.ThreadId,
                                          ParentId = o.ParentId,
                                          EntityId = (int)o.EntityId,
                                          ParentFKList = o.ParentFKList == null || o.ParentFKList.Count == 0 ? new List<MessagesDto>() : ObjectMapper.Map<List<MessagesDto>>(o.ParentFKList.ToList()),
                                          HasChildren = o.ParentFKList == null || o.ParentFKList.Count == 0 ? false : true,
                                          EntityObjectTypeCode = o.EntityFk.EntityObjectTypeCode,
                                          //RelatedEntityId = (o.EntityFk.EntitiesRelationships != null && o.EntityFk.EntitiesRelationships.Count > 0) ? o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId :
                                          //((o.EntityFk.RelatedEntitiesRelationships != null && o.EntityFk.RelatedEntitiesRelationships.Count > 0) ? o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().EntityId : 0)
                                      },
                                  }
                                ;

                var totalCount = await filteredMessages.CountAsync();
                var unreadCount = 0;

                var results = await appComments.ToListAsync();
                //MMT
                /*  if (orgComponentId != null && orgComponentId != 0 && orgComponentId != input.MainComponentEntitlyId)
                  {
                      var filteredMessages2 = _MessagesRepository.GetAll()
                                                       .Include(x => x.EntityFk).ThenInclude(x => x.EntityClassifications)
                                                       .Include(x => x.EntityFk).ThenInclude(x => x.EntityObjectStatusFk)
                                                       .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                                                       .Include(x => x.ParentFKList).ThenInclude(z => z.ParentFKList).Include(x => x.EntityFk)
                                                       .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                                       .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
                                                .WhereIf(orgComponentId != null && orgComponentId != 0,
                                                    e => e.EntityFk.EntitiesRelationships.Where(ee => ee.RelatedEntityId == (long)orgComponentId).Count() > 0 ||
                                                         e.EntityFk.RelatedEntitiesRelationships.Where(ee => ee.EntityId == (long)orgComponentId).Count() > 0)

                                                .WhereIf(input.ParentId == null || input.ParentId == 0, e => e.ParentId == null)
                                                .WhereIf(input.ParentId != null && input.ParentId >= 0, e => e.ParentId == input.ParentId)
                                                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Body.Contains(input.Filter) || e.Subject.Contains(input.Filter))
                                                .WhereIf(!string.IsNullOrWhiteSpace(input.BodyFilter), e => e.Body == input.BodyFilter)
                                                .WhereIf(!string.IsNullOrWhiteSpace(input.SubjectFilter), e => e.Subject == input.SubjectFilter)
                                                .WhereIf(input.ThreadId != null && input.ThreadId > 0, e => e.ThreadId == input.ThreadId)
                                            .Where(
                                                     x =>
                                                     //x.EntityFk.EntityObjectTypeCode == MesasgeObjectType.Comment.ToString().ToUpper()  &&
                                                     x.OriginalMessageId == x.Id && (x.UserId == AbpSession.UserId || x.SenderId == AbpSession.UserId)
                                                     && x.EntityFk.EntityObjectTypeId == entityObjectTypeMessage && x.TenantId == AbpSession.TenantId
                                                 );

                      var pagedAndFilteredMessages2 = filteredMessages2
                          .OrderBy(input.Sorting ?? "id desc")
                          .PageBy(input);
                      var appComments2 = from o in pagedAndFilteredMessages2
                                         select new
                                          GetMessagesForViewDto()
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
                                               + " @ " + TenantManager.Tenants.Where(x => x.Id == (UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.TenantId).FirstOrDefault())).Select(x => x.TenancyName).FirstOrDefault().ToString(),
                                                 ThreadId = o.ThreadId,
                                                 ParentId = o.ParentId,
                                                 EntityId = (int)o.EntityId,
                                                 ParentFKList = o.ParentFKList == null || o.ParentFKList.Count == 0 ? new List<MessagesDto>() : ObjectMapper.Map<List<MessagesDto>>(o.ParentFKList.ToList()),
                                                 HasChildren = o.ParentFKList == null || o.ParentFKList.Count == 0 ? false : true,
                                                 EntityObjectTypeCode = o.EntityFk.EntityObjectTypeCode,
                                                 RelatedEntityId = (o.EntityFk.EntitiesRelationships != null && o.EntityFk.EntitiesRelationships.Count > 0) ? o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId :
                                                 ((o.EntityFk.RelatedEntitiesRelationships != null && o.EntityFk.RelatedEntitiesRelationships.Count > 0) ? o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().EntityId : 0)
                                             },
                                         }
                                      ;

                      //  totalCount += await filteredMessages2.CountAsync();

                      var results2 = await appComments2.ToListAsync();
                      foreach (var msg in results2)
                      {
                          if (msg.Messages.SenderId == AbpSession.UserId)
                          {
                              var messg = results.FirstOrDefault(z => z.Messages.Subject == msg.Messages.Subject &&
                                 z.Messages.SenderId == msg.Messages.SenderId && z.Messages.Body == msg.Messages.Body);
                              if (messg == null)
                              {
                                  msg.Messages.SenderName = GetUserNameByID(msg.Messages.SenderId);
                                  msg.Messages.ToName = GetUsersNamesByID(msg.Messages.To);
                                  results.Add(msg);
                                  totalCount += 1;
                              }
                              else
                              {
                                  if (msg.Messages.UserId != null && !messg.Messages.To.Contains(msg.Messages.UserId.ToString()))
                                      messg.Messages.To += "," + msg.Messages.UserId.ToString();

                                  messg.Messages.SenderName = GetUserNameByID(messg.Messages.SenderId);
                                  messg.Messages.ToName = GetUsersNamesByID(messg.Messages.To);
                              }

                          }
                          else
                          {
                              msg.Messages.SenderName = GetUserNameByID(msg.Messages.SenderId);
                              msg.Messages.ToName = GetUsersNamesByID(msg.Messages.To);
                              results.Add(msg);
                              totalCount += 1;
                          }
                      }


                      //results.AddRange(results2);
                  }
                  //MMT */
                long? entityTenantId = null;
                var entity = await _appEntityRepository.GetAll().Where(z => z.Id == input.MainComponentEntitlyId).FirstOrDefaultAsync();
                if (entity != null)
                {
                    entityTenantId = entity.TenantOwner;
                }
                string myAccountSSIN = "";
                var myAccount = await _appContactRepository.GetAll()
                                   .Where(z => z.TenantId == AbpSession.TenantId && z.ParentId == null && z.PartnerId== null && z.IsProfileData == true).FirstOrDefaultAsync();
                if (myAccount != null)
                {
                    myAccountSSIN = myAccount.SSIN;
                }

                var logoCategory = await _helper.SystemTables.GetAttachmentCategoryLogoId();
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                foreach (var x in results)
                {
                    //
                    if (x.Messages.EntityAttachments != null && x.Messages.EntityAttachments.Count > 0)
                    {
                        foreach (var at in x.Messages.EntityAttachments)
                        {
                            at.Url = @"attachments\" + "-1" + @"\" + at.FileName;
                        }
                    }
                    //
                    bool llAdminUser = false;
                    long? userTeanantId = null;
                    string userCompanySSIN = "";
                    var user = UserManager.GetUserById(long.Parse(x.Messages.SenderId.ToString()));
                    if (user != null)
                    {
                        var adminRole = _roleManager.Roles.Single(r => r.TenantId == user.TenantId && r.Name == StaticRoleNames.Tenants.Admin);
                        var userRoles = await UserManager.GetRolesAsync(user);
                        if (userRoles != null && userRoles.Count > 0)
                        {
                            var userAdminRole = userRoles.FirstOrDefault(z => z == adminRole.Name);
                            if (userAdminRole != null)
                            {
                                llAdminUser = true;
                            }
                        }
                        userTeanantId = user.TenantId;
                        if (user.TenantId != null)
                        {
                            var tenant = await TenantManager.GetByIdAsync(int.Parse(user.TenantId.ToString()));
                            if (tenant != null)
                            {
                                var account = await _appContactRepository.GetAll().Include(z=>z.EntityFk).ThenInclude(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                                    .Where(z => z.TenantId == user.TenantId && z.ParentId == null && z.PartnerId==null && z.IsProfileData==true).FirstOrDefaultAsync();
                                if (account != null)
                                {
                                    userCompanySSIN = account.SSIN;
                                    x.Messages.SenderCompanyName = account.Name;
                                    if (account.EntityFk.EntityAttachments.Count() > 0)
                                    {
                                        var companyLogo = account.EntityFk.EntityAttachments.Where(z => z.AttachmentCategoryId == logoCategory).FirstOrDefault();
                                        if (companyLogo != null)
                                        {
                                            x.Messages.ProfilePictureUrl = imagesUrl + "-1" + @"/" + companyLogo.AttachmentFk.Attachment;
                                        }
                                    }
                                }
                                //x.Messages.ProfilePictureUrl =   tenant.LogoFileType
                            }
                        }
                        else
                        {
                            var account = await _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                                   .Where(z => z.Name == "SIIWII" && z.ParentId == null).FirstOrDefaultAsync();

                            if (account != null)
                            {
                                x.Messages.SenderCompanyName = account.Name;
                                if (account.EntityFk.EntityAttachments.Count() > 0)
                                {
                                    var companyLogo = account.EntityFk.EntityAttachments.Where(z => z.AttachmentCategoryId == logoCategory).FirstOrDefault();
                                    if (companyLogo != null)
                                    {
                                        x.Messages.ProfilePictureUrl = imagesUrl + "-1" + @"/" + companyLogo.AttachmentFk.Attachment;
                                    }
                                }
                            }
                        }
                        x.Rating = await GetUserEntityRating(long.Parse(x.Messages.RelatedEntityId.ToString()), long.Parse(x.Messages.SenderId.ToString()));

                        //if (!string.IsNullOrEmpty(myAccountSSIN) && !string.IsNullOrEmpty(userCompanySSIN))
                        {
                            if (entityTenantId == userTeanantId)
                            {
                                x.IsProfileOwner = true;
                                x.IsUserVerifiedPurchaser = false;
                                x.IsAccountAdmin = false;
                            }
                            else
                            {
                                if (llAdminUser)
                                {
                                    x.IsProfileOwner = false;
                                    x.IsUserVerifiedPurchaser = false;
                                    x.IsAccountAdmin = true;
                                }
                                else
                                {
                                    var trans = await _appMarketplaceTransactionHeaders.GetAll().Where(z => (z.SellerCompanySSIN == myAccountSSIN && z.BuyerCompanySSIN == userCompanySSIN) ||
                                    (z.BuyerCompanySSIN == myAccountSSIN && z.SellerCompanySSIN == userCompanySSIN)).FirstOrDefaultAsync();
                                    if (trans != null)
                                    {
                                        x.IsUserVerifiedPurchaser = true;
                                        x.IsProfileOwner = false;
                                        x.IsAccountAdmin = false;
                                    }
                                }
                            }
                        }
                    }

                    //var profilePictureId = UserManager.Users.FirstOrDefault(y => y.Id == x.Messages.SenderId).ProfilePictureId;
                    //if (profilePictureId != null)
                    //{ x.Messages.ProfilePictureId = (Guid)profilePictureId; }
                    if (x.Messages.ParentFKList != null && x.Messages.ParentFKList.Count > 0)
                    {
                        x.Messages.ParentFKList.ForEach(z => z.HasChildren = (z.ParentFKList != null && z.ParentFKList.Count > 0) ? true : false);
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
        public async Task<int> GetUserEntityRating(long entityId, long userId)
        {
            int returnValue = 0;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                string userSSIN = "";
                var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().Include(z => z.EntityFk).FirstOrDefault(x => //x.EntityFk.TenantId == null &&
                         x.AttributeId == 715 && x.AttributeValue == userId.ToString());
                if (contactEntityExtraData != null)
                {
                    userSSIN = contactEntityExtraData.EntityFk.SSIN;
                }
                string entitySSIN = "";
                var entity = await _appEntityRepository.GetAll().Where(z => z.Id == entityId).FirstOrDefaultAsync();
                if (entity != null)
                {
                    entitySSIN = entity.SSIN;
                }
                if (!string.IsNullOrEmpty(entitySSIN) && !string.IsNullOrEmpty(userSSIN))
                {
                    var existingRating = await _appEntityRatingRepository.GetAll().Where(z => z.UserSSIN == userSSIN && z.EntitySSIN == entitySSIN).FirstOrDefaultAsync();
                    if (existingRating != null)
                    {
                        returnValue = existingRating.Rating;
                    }
                }
            }
            return returnValue;
        }
        //Iteation40-X527,1 MMT 01/15/2025 Add API to check if the user reviewed this entity before or not[Start]
        public async Task<bool> IsUserReviewedEntityBefore(long entityId)
        {
            bool returnVal = false;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var entityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeReview();
                var objectId = await _helper.SystemTables.GetsydObjectMessageID();
                var entityReview = await _appEntityRepository.GetAll().Include(z => z.EntitiesRelationships).Where(z => z.CreatorUserId == AbpSession.UserId && z.TenantId == null &&
                z.ObjectId == objectId && z.EntityObjectTypeId == entityObjectTypeId &&
                z.EntitiesRelationships.Count(x => x.EntityId == entityId || x.RelatedEntityId == entityId) > 0).FirstOrDefaultAsync();
                // var entityReview = await entityReviewQ.ToListAsync();
                //string xx = "hello";
                if (entityReview != null) { return true; }

            }
            return returnVal;
        }
        //Iteation40-X527,1 MMT 01/15/2025 Add API to check if the user reviewed this entity before or not[End]
        public async Task<bool> CreateUserEntityRating(int ratingNumber, long entityId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var entity = await _appEntityRepository.GetAll().Where(z => z.Id == entityId).FirstOrDefaultAsync();
                if (entity != null)
                {
                    var user = UserManager.GetUserById(long.Parse(AbpSession.UserId.ToString()));
                    if (user != null)
                    {
                        if (user.TenantId != null)
                        {
                            var tenant = await TenantManager.GetByIdAsync(int.Parse(user.TenantId.ToString()));
                            if (tenant != null)
                            {
                               // var account = await _appMarketplaceAccounts.GetAll().Include(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                                 //   .Where(z => z.OwnerId == user.TenantId && z.ParentId == null).FirstOrDefaultAsync();
                            }
                        }
                    }
                    AppEntityRating rating = new AppEntityRating();
                    var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().Include(z => z.EntityFk).FirstOrDefault(x => //x.EntityFk.TenantId == AbpSession.TenantId &&
                             x.AttributeId == 715 && x.AttributeValue == AbpSession.UserId.ToString());
                    if (contactEntityExtraData != null)
                    {
                        if (AbpSession.TenantId != null && AbpSession.TenantId != 0)
                        {

                            rating.UserSSIN = contactEntityExtraData.EntityFk.SSIN;
                        }
                    }
                    rating.EntitySSIN = entity.SSIN;
                    rating.EntityId = entity.Id;
                    rating.EntityObjectTypeCode = entity.EntityObjectTypeCode;
                    rating.EntityObjectTypeId = entity.EntityObjectTypeId;
                    rating.ObjectId = entity.ObjectId;
                    rating.ObjectCode = entity.ObjectCode;
                    rating.Rating = ratingNumber;
                    if (!string.IsNullOrEmpty(rating.UserSSIN) && !string.IsNullOrEmpty(rating.EntitySSIN))
                    {
                        var existingRating = await _appEntityRatingRepository.GetAll().Where(z => z.UserSSIN == rating.UserSSIN && z.EntitySSIN == rating.EntitySSIN).FirstOrDefaultAsync();
                        if (existingRating != null)
                        {
                            existingRating.Rating = ratingNumber;
                            await _appEntityRatingRepository.UpdateAsync(existingRating);
                            return true;
                        }
                        else
                        {
                            await _appEntityRatingRepository.InsertAsync(rating);
                            return true;
                        }
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return false;
                }
            }
        }
        [AbpAllowAnonymous]
        public async Task<OverAllRatingDto> GetOverAllRatings(long entityId)
        {
            OverAllRatingDto ratingDto = new OverAllRatingDto();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                ratingDto.TotalNumberOfRating = await _appEntityRatingRepository.GetAll().CountAsync(z => z.EntityId == entityId);

                var oneTotal = await _appEntityRatingRepository.GetAll().CountAsync(z => z.EntityId == entityId && z.Rating == 1);
                var twoTotal = await _appEntityRatingRepository.GetAll().CountAsync(z => z.EntityId == entityId && z.Rating == 2);
                var threeTotal = await _appEntityRatingRepository.GetAll().CountAsync(z => z.EntityId == entityId && z.Rating == 3);
                var fourTotal = await _appEntityRatingRepository.GetAll().CountAsync(z => z.EntityId == entityId && z.Rating == 4);
                var fiveTotal = await _appEntityRatingRepository.GetAll().CountAsync(z => z.EntityId == entityId && z.Rating == 5);
                if (ratingDto.TotalNumberOfRating > 0)
                {
                    ratingDto.OneTotal = (decimal.Parse(oneTotal.ToString()) / decimal.Parse(ratingDto.TotalNumberOfRating.ToString()));
                    ratingDto.TwoTotal = (decimal.Parse(twoTotal.ToString()) / decimal.Parse(ratingDto.TotalNumberOfRating.ToString()));
                    ratingDto.ThreeTotal = (decimal.Parse(threeTotal.ToString()) / decimal.Parse(ratingDto.TotalNumberOfRating.ToString()));
                    ratingDto.FourTotal = (decimal.Parse(fourTotal.ToString()) / decimal.Parse(ratingDto.TotalNumberOfRating.ToString()));
                    ratingDto.FiveTotal = (decimal.Parse(fiveTotal.ToString()) / decimal.Parse(ratingDto.TotalNumberOfRating.ToString()));
                    var totalRating = (1 * decimal.Parse(oneTotal.ToString())) + (2 * decimal.Parse(twoTotal.ToString())) +
                        (3 * decimal.Parse(threeTotal.ToString())) + (4 * decimal.Parse(fourTotal.ToString())) +
                        (5 * decimal.Parse(fiveTotal.ToString()));
                    ratingDto.OverAllRating = totalRating / decimal.Parse(ratingDto.TotalNumberOfRating.ToString());
                }
                return ratingDto;
            }
        }
        //I40-X527[End]
        //I48[Start]
        [AbpAllowAnonymous]
        public async Task<MessagePagedResultDto> GetAllQuestions(GetAllMessagesInput input)
        {
           // return new MessagePagedResultDto(0, 0, new List<GetMessagesForViewDto>());
            var entityObjectTypeComment = await _helper.SystemTables.GetEntityObjectTypeQuestion();
            var entityObjectTypeMessage = await _helper.SystemTables.GetEntityObjectTypeMessageID();
            var orgComponentId = input.MainComponentEntitlyId;
            IQueryable<AppMarketplaceMessage> filteredMessages = null;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                
                filteredMessages = _AppMarketplaceMessagesRepository.GetAll()
                                   .Include(x => x.ParentFKList).ThenInclude(x => x.EntityFk)
                                   .Include(x => x.ParentFKList).ThenInclude(z => z.ParentFKList).Include(x => x.EntityFk)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntitiesRelationships)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.RelatedEntitiesRelationships)
                                   .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                            .WhereIf(input.MainComponentEntitlyId != null && input.MainComponentEntitlyId != 0,
                                e => e.EntityFk.EntitiesRelationships.Where(ee => ee.RelatedEntityId == (long)input.MainComponentEntitlyId).Count() > 0 ||
                                     e.EntityFk.RelatedEntitiesRelationships.Where(ee => ee.EntityId == (long)input.MainComponentEntitlyId).Count() > 0)

                            .WhereIf(input.ParentId == null || input.ParentId == 0, e => e.ParentId == null)
                            .WhereIf(input.ParentId != null && input.ParentId >= 0, e => e.ParentId == input.ParentId)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Body.Contains(input.Filter) || e.Subject.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.BodyFilter), e => e.Body == input.BodyFilter)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.SubjectFilter), e => e.Subject == input.SubjectFilter)
                            .WhereIf(input.ThreadId != null && input.ThreadId > 0, e => e.ThreadId == input.ThreadId)
                        .Where(
                                 x =>
                                 x.OriginalMessageId == x.Id && x.EntityFk.EntityObjectTypeId == entityObjectTypeComment
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
                                          Subject = o.Subject,
                                          Body = o.Body,
                                          BodyFormat = o.BodyFormat,
                                          SendDate = o.CreationTime,
                                          ReceiveDate = o.CreationTime,
                                          EntityCode = o.EntityCode,
                                          Id = o.Id,
                                          EntityAttachments = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(o.EntityFk.EntityAttachments),
                                          SenderName = UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Name).FirstOrDefault().ToString()
                                       + " " + UserManager.Users.Where(x => x.Id == (long)o.SenderId).Select(x => x.Surname).FirstOrDefault().ToString(),
                                          ThreadId = o.ThreadId,
                                          ParentId = o.ParentId,
                                          EntityId = (int)o.EntityId,
                                          ParentFKList = o.ParentFKList == null || o.ParentFKList.Count == 0 ? new List<MessagesDto>() : ObjectMapper.Map<List<MessagesDto>>(o.ParentFKList.ToList()),
                                          HasChildren = o.ParentFKList == null || o.ParentFKList.Count == 0 ? false : true,
                                          EntityObjectTypeCode = o.EntityFk.EntityObjectTypeCode,
                                          //RelatedEntityId = (o.EntityFk.EntitiesRelationships != null && o.EntityFk.EntitiesRelationships.Count > 0) ? o.EntityFk.EntitiesRelationships.FirstOrDefault().RelatedEntityId :
                                          //((o.EntityFk.RelatedEntitiesRelationships != null && o.EntityFk.RelatedEntitiesRelationships.Count > 0) ? o.EntityFk.RelatedEntitiesRelationships.FirstOrDefault().EntityId : 0)
                                      },
                                  }
                                ;

                var totalCount = await filteredMessages.CountAsync();
                var unreadCount = 0;

                var results = await appComments.ToListAsync();

                long? entityTenantId = null;
                var entity = await _appEntityRepository.GetAll().Where(z => z.Id == input.MainComponentEntitlyId).FirstOrDefaultAsync();
                if (entity != null)
                {
                    entityTenantId = entity.TenantOwner;
                }
                string myAccountSSIN = "";
                var myAccount = await _appContactRepository.GetAll()
                                   .Where(z => z.TenantId == AbpSession.TenantId && z.ParentId == null && z.PartnerId == null && z.IsProfileData == true).FirstOrDefaultAsync();
                if (myAccount != null)
                {
                    myAccountSSIN = myAccount.SSIN;
                }

                var logoCategory = await _helper.SystemTables.GetAttachmentCategoryLogoId();
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                foreach (var x in results)
                {
                    //
                    if (x.Messages.EntityAttachments != null && x.Messages.EntityAttachments.Count > 0)
                    {
                        foreach (var at in x.Messages.EntityAttachments)
                        {
                            at.Url = @"attachments\" + "-1" + @"\" + at.FileName;
                        }
                    }
                    //
                    bool llAdminUser = false;
                    long? userTeanantId = null;
                    string userCompanySSIN = "";
                    var user = UserManager.GetUserById(long.Parse(x.Messages.SenderId.ToString()));
                    if (user != null)
                    {
                        var adminRole = _roleManager.Roles.Single(r => r.TenantId == user.TenantId && r.Name == StaticRoleNames.Tenants.Admin);
                        var userRoles = await UserManager.GetRolesAsync(user);
                        if (userRoles != null && userRoles.Count > 0)
                        {
                            var userAdminRole = userRoles.FirstOrDefault(z => z == adminRole.Name);
                            if (userAdminRole != null)
                            {
                                llAdminUser = true;
                            }
                        }
                        userTeanantId = user.TenantId;
                        if (user.TenantId != null)
                        {
                            var tenant = await TenantManager.GetByIdAsync(int.Parse(user.TenantId.ToString()));
                            if (tenant != null)
                            {
                                var account = await _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                                    .Where(z => z.TenantId == user.TenantId && z.ParentId == null && z.PartnerId == null && z.IsProfileData == true).FirstOrDefaultAsync();
                                if (account != null)
                                {
                                    userCompanySSIN = account.SSIN;
                                    x.Messages.SenderCompanyName = account.Name;
                                    if (account.EntityFk.EntityAttachments.Count() > 0)
                                    {
                                        var companyLogo = account.EntityFk.EntityAttachments.Where(z => z.AttachmentCategoryId == logoCategory).FirstOrDefault();
                                        if (companyLogo != null)
                                        {
                                            x.Messages.ProfilePictureUrl = imagesUrl + "-1" + @"/" + companyLogo.AttachmentFk.Attachment;
                                        }
                                    }
                                }
                                //x.Messages.ProfilePictureUrl =   tenant.LogoFileType
                            }
                        }
                        else
                        {
                            var account = await _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                                   .Where(z => z.Name == "SIIWII" && z.ParentId == null).FirstOrDefaultAsync();

                            if (account != null)
                            {
                                x.Messages.SenderCompanyName = account.Name;
                                if (account.EntityFk.EntityAttachments.Count() > 0)
                                {
                                    var companyLogo = account.EntityFk.EntityAttachments.Where(z => z.AttachmentCategoryId == logoCategory).FirstOrDefault();
                                    if (companyLogo != null)
                                    {
                                        x.Messages.ProfilePictureUrl = imagesUrl + "-1" + @"/" + companyLogo.AttachmentFk.Attachment;
                                    }
                                }
                            }
                        }
                        x.Rating = await GetUserEntityRating(long.Parse(x.Messages.RelatedEntityId.ToString()), long.Parse(x.Messages.SenderId.ToString()));

                        //if (!string.IsNullOrEmpty(myAccountSSIN) && !string.IsNullOrEmpty(userCompanySSIN))
                        {
                            if (entityTenantId == userTeanantId)
                            {
                                x.IsProfileOwner = true;
                                x.IsUserVerifiedPurchaser = false;
                                x.IsAccountAdmin = false;
                            }
                            else
                            {
                                if (llAdminUser)
                                {
                                    x.IsProfileOwner = false;
                                    x.IsUserVerifiedPurchaser = false;
                                    x.IsAccountAdmin = true;
                                }
                                else
                                {
                                    var trans = await _appMarketplaceTransactionHeaders.GetAll().Where(z => (z.SellerCompanySSIN == myAccountSSIN && z.BuyerCompanySSIN == userCompanySSIN) ||
                                    (z.BuyerCompanySSIN == myAccountSSIN && z.SellerCompanySSIN == userCompanySSIN)).FirstOrDefaultAsync();
                                    if (trans != null)
                                    {
                                        x.IsUserVerifiedPurchaser = true;
                                        x.IsProfileOwner = false;
                                        x.IsAccountAdmin = false;
                                    }
                                }
                            }
                        }
                    }

                    //var profilePictureId = UserManager.Users.FirstOrDefault(y => y.Id == x.Messages.SenderId).ProfilePictureId;
                    //if (profilePictureId != null)
                    //{ x.Messages.ProfilePictureId = (Guid)profilePictureId; }
                    if (x.Messages.ParentFKList != null && x.Messages.ParentFKList.Count > 0)
                    {
                        x.Messages.ParentFKList.ForEach(z => z.HasChildren = (z.ParentFKList != null && z.ParentFKList.Count > 0) ? true : false);
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
        //I48[End]
    }
}
