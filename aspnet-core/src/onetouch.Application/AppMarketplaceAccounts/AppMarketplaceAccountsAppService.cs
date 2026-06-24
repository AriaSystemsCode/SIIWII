using onetouch.AppEntities;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.AppMarketplaceContacts;
using onetouch.Helpers;
using Abp.Domain.Uow;
using Abp.Net.Mail;
using onetouch.AppEntities.Dtos;
using onetouch.Configuration;
using onetouch.SystemObjects;
using System.Data;
using onetouch.Authorization.Users;
using onetouch.SycIdentifierDefinitions;
using onetouch.Notifications;
using onetouch.Storage;
using onetouch.MultiTenancy;

using onetouch.Accounts.Dtos;
using onetouch.Accounts;
using onetouch.AppContacts;
using Abp.EntityFrameworkCore.Repositories;
using onetouch.Migrations;
using onetouch.Attachments;
using onetouch.AppMarketplaceContacts.Dtos;
using System.Reflection.Metadata.Ecma335;
using onetouch.AccountInfos.Dtos;
using onetouch.Common;
using Abp.Collections.Extensions;
using Microsoft.Extensions.Configuration;
using NPOI.Util;
using Stripe;
using System.Reflection;
using onetouch.AppMarketplaceItems;
using onetouch.EntityFrameworkCore;
using Abp.EntityFrameworkCore.Uow;
using NUglify.Helpers;
using Microsoft.PowerShell.Commands;
using onetouch.AppItems.Dtos;
using onetouch.AppMarketplaceItems.Dtos;
using Microsoft.Identity.Client;
using Abp.Extensions;
using DocumentFormat.OpenXml.Drawing.Diagrams;
using ClosedXML.Excel;

namespace onetouch.AppMarketplaceAccounts
{
    [AbpAuthorize(AppPermissions.Pages_Accounts)]
    public class MarketplaceAccountsAppService : onetouchAppServiceBase, IMarketplaceAccountsAppService
    {
        private readonly TenantManager _tenantManager;
        private readonly IAccountsAppService _iAccountsAppService;
        private readonly ICreateMarketplaceAccount _iCreateMarketplaceAccount;
        private readonly IRepository<AppMarketplaceContact, long> _appMarketplaceContactRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly Helper _helper;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly UserManager _userManager;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        private readonly IAppNotifier _appNotifier;
        private readonly IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> _appMarketplaceAccountsPriceLevelsRepo;
        private const int MaxProfilPictureBytes = 5242880;
        private readonly IBinaryObjectManager _binaryObjectManager;
        //I40[Start]
        private readonly IRepository<AppContactRelationshipInfo, long> _appContactRelationshipInfoRepository;
        private readonly IRepository<SycEntityObjectType , long> _sycEntityObjectTypeRepository;
        //I40[End]

        public MarketplaceAccountsAppService(
              IRepository<AppMarketplaceContact, long> appMarketplaceContactRepository
            , IRepository<AppEntity, long> appEntityRepository
            , Helper helper, IRepository<AppMarketplaceAddress, long> appAddressRepository
            , IRepository<AppMarketplaceContactAddress, long> appContactAddressRepository
            , IEmailSender emailSender
            , IAppEntitiesAppService appEntitiesAppService
            , IAppConfigurationAccessor appConfigurationAccessor
            , ISycEntityObjectClassificationsAppService sycEntityObjectClassificationsAppService
            , ISycEntityObjectCategoriesAppService sycEntityObjectCategoriesAppService
            , ISycAttachmentCategoriesAppService sSycAttachmentCategoriesAppService
            , IRepository<AppEntityExtraData, long> appEntityExtraDataRepository, UserManager userManager
            , IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels
            , long> appMarketplaceAccountsPriceLevelsRepo
            , SycIdentifierDefinitionsAppService sycIdentifierDefinitionsAppService
            , IAppNotifier appNotifier, IBinaryObjectManager binaryObjectManager
            , TenantManager tenantManager
            , IAccountsAppService iAccountsAppService
            , ICreateMarketplaceAccount iCreateMarketplaceAccount
            , IRepository<AppContact, long> appContactRepository,
              IRepository<AppContactRelationshipInfo, long> appContactRelationshipInfoRepository,
              IRepository<SycEntityObjectType, long> sycEntityObjectTypeRepository
            )

        {
            _appContactRelationshipInfoRepository = appContactRelationshipInfoRepository;
            _tenantManager = tenantManager;
            _appContactRepository = appContactRepository;
            _iAccountsAppService = iAccountsAppService;
            _iCreateMarketplaceAccount = iCreateMarketplaceAccount;
            _appMarketplaceContactRepository = appMarketplaceContactRepository;
            _helper = helper;
            _appEntityRepository = appEntityRepository;
            _userManager = userManager;
            _iAppSycIdentifierDefinitionsService = sycIdentifierDefinitionsAppService;
            _appNotifier = appNotifier;
            _binaryObjectManager = binaryObjectManager;
            _appMarketplaceAccountsPriceLevelsRepo = appMarketplaceAccountsPriceLevelsRepo;
            _sycEntityObjectTypeRepository = sycEntityObjectTypeRepository;
        }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<GetMarketplaceAccountForViewDto>> GetAll(GetAllAccountsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //I50[Start]
                IQueryable<AppMarketplaceContact> filteredContacts = null;
                if (!string.IsNullOrEmpty(input.FilterCondition))
                {
                    var contxt = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                    string jsonFilter = input.FilterCondition;

                    var filterCondition = Helper.ApplyJsonFilter<AppMarketplaceContact>(jsonFilter);//.ToList();
                    if (filterCondition != null)
                        filteredContacts = contxt.AppMarketplaceContacts.Where(filterCondition).Where(z => z.ParentId == null)
                            .OrderBy(input.Sorting ?? "name asc")
                            .Take(input.MaxResultCount);//.ToListAsync();

                }

                //var filters = JsonSerializer.Deserialize<dynamic>(input.FilterCondition);
                //foreach (var f in filters)
                //{
                //    filteredAppItems = filteredAppItems.Where(e => EF..Property(e, f.Field) == f.Value);

                //I50[End]
                // try
                //{
                    string currentTenatntAccountMarketplaceRole = "";
                    string currentTenantAccountSSIN = "";
                    long currentTenantAccountType = 0;
                    bool excludeGroupAccount = false;
                    long activeRelationshipStatusId = 0;
                    AppContact currentTenantAccountObj =  null;
                    if (AbpSession.TenantId != null)
                    {
                        var contactObjectid = await _helper.SystemTables.GetObjectContactId();
                         currentTenantAccountObj = _appContactRepository.GetAll().Include(e => e.EntityFk).ThenInclude(z=>z.EntityExtraData)
                        .FirstOrDefault(e => e.TenantId == AbpSession.TenantId && e.IsProfileData && e.ParentId == null);
                        if (currentTenantAccountObj != null)
                        {
                          currentTenantAccountSSIN = currentTenantAccountObj.SSIN;
                          currentTenantAccountType = currentTenantAccountObj.EntityFk.EntityObjectTypeId;
                          var extraDataRole = currentTenantAccountObj.EntityFk.EntityExtraData
                                        .Where(z => z.AttributeId == 610).FirstOrDefault();
                          if (extraDataRole != null)
                          {
                            currentTenatntAccountMarketplaceRole = extraDataRole.AttributeValue.Replace(".", "");
                          }
                    }
                        var groupAccountEntityObjectTypeId = await _sycEntityObjectTypeRepository.GetAll()
                        .FirstOrDefaultAsync(z => z.Code == "GROUP" && z.ObjectId == contactObjectid);
                        excludeGroupAccount = (currentTenantAccountType == groupAccountEntityObjectTypeId.Id);
                        activeRelationshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
                    }
                    
                    


                    //long cancelledStatusId = await _helper.SystemTables.GetEntityObjectStatusContactCancelled();
                    
                    var filteredAccounts = _appMarketplaceContactRepository.GetAll()
                            .Include(e => e.ContactAddresses).ThenInclude(e => e.AddressFk).ThenInclude(e => e.CountryFk)
                            .Include(e => e.EntityClassifications)
                            .Include(e => e.EntityCategories)
                            .Include(e => e.EntityAttachments).ThenInclude(e => e.AttachmentFk)
                           // .WhereIf(excludeGroupAccount, z => (z.EntityObjectTypeId != groupAccountEntityObjectTypeId.Id) ||
                           // (z.EntityObjectTypeId == groupAccountEntityObjectTypeId.Id && z.OwnerId==AbpSession.TenantId) )
                            .WhereIf(!string.IsNullOrEmpty(input.Filter),
                                x => x.Name.Contains(input.Filter) || x.TradeName.Contains(input.Filter))

                        //.WhereIf(input.FilterType <= 1 && input.FilterType != 6,
                        //    x => (x.TenantId == null && !x.IsProfileData && x.ParentId == null && x.EntityObjectStatusId != cancelledStatusId))
                        //.WhereIf(input.FilterType == 2 && input.FilterType != 6,
                        //    x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN != null)
                        //    && (_appMarketplaceContactRepository.GetAll().Count(c => c.TenantId == null && c.SSIN == x.SSIN) > 0))
                        //.WhereIf(input.FilterType >= 3 && input.FilterType != 6,
                        //    x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN == null))
                        // .WhereIf(input.FilterType == 6,
                        //    x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN == null)
                        //    || (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN != null)
                        //    && (_appMarketplaceContactRepository.GetAll().Count(c => c.TenantId == null && c.SSIN == x.SSIN) > 0))

                            .WhereIf(!string.IsNullOrEmpty(input.Name),
                                x => x.Name.Contains(input.Name) || x.TradeName.Contains(input.Name))
                            .WhereIf(AbpSession.TenantId != null && input.Status != null && input.Status.Count(x => x == 1) > 0,
                                 //I49[Start]
                                 //x => _appContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.SSIN == x.SSIN) > 0)
                                 x => _appContactRelationshipInfoRepository.GetAll().Count(
                                    z => ((z.RecipientContactSSIN == x.SSIN && z.RequesterContactSSIN == currentTenantAccountSSIN)
                                    || (z.RequesterContactSSIN == x.SSIN && z.RecipientContactSSIN == currentTenantAccountSSIN)) &&
                                    z.EntityObjectStatusId == activeRelationshipStatusId
                                    ) > 0)
                            //I49[End]
                            .WhereIf(AbpSession.TenantId != null && input.Status != null && input.Status.Count(x => x == 2) > 0,
                               // x => (//_appContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.SSIN == x.SSIN) == 0)
                                x => _appContactRelationshipInfoRepository.GetAll().Count(
                                    z => ((z.RecipientContactSSIN == x.SSIN && z.RequesterContactSSIN == currentTenantAccountSSIN)
                                    || (z.RequesterContactSSIN == x.SSIN && z.RecipientContactSSIN == currentTenantAccountSSIN)) &&
                                    z.EntityObjectStatusId == activeRelationshipStatusId
                                    )==0 )
                            .WhereIf(input.Classifications != null && input.Classifications.Count(x => x > 0) > 0,
                                x => _appEntityRepository.GetAll().Include(ec => ec.EntityClassifications).FirstOrDefault(e => e.Id == x.Id).EntityClassifications.Any(a => input.Classifications.Contains(a.EntityObjectClassificationId)))
                            .WhereIf(input.Categories != null && input.Categories.Count(x => x > 0) > 0,
                                x => _appEntityRepository.GetAll().Include(ec => ec.EntityCategories).FirstOrDefault(e => e.Id == x.Id).EntityCategories.Any(a => input.Categories.Contains(a.EntityObjectCategoryId)))

                        .WhereIf(!string.IsNullOrEmpty(input.City),
                            //x => _appMarketplaceContactRepository.GetAll().Include(z=>z.ContactAddresses).Where(z=> z.AccountId== x.Id && z.ContactAddresses.Any(x=>x.AddressFk.City.Contains(input.City))).Count()>0)
                            x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.AccountId == x.Id && c.ContactAddresses.Any(a => a.AddressFk.City.Contains(input.City))) > 0)
                        .WhereIf(!string.IsNullOrEmpty(input.Address),
                            x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.AccountId == x.Id && c.ContactAddresses.Any(a => a.AddressFk.AddressLine1.Contains(input.Address) || a.AddressFk.AddressLine2.Contains(input.Address))) > 0)
                        .WhereIf(!string.IsNullOrEmpty(input.State),
                            x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.AccountId == x.Id && c.ContactAddresses.Any(a => a.AddressFk.State.Contains(input.State))) > 0)
                        .WhereIf(!string.IsNullOrEmpty(input.Postal),
                            x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.AccountId == x.Id && c.ContactAddresses.Any(a => a.AddressFk.PostalCode.Contains(input.Postal))) > 0)
                        .WhereIf(input.Countries != null && input.Countries.Count(x => x > 0) > 0,
                            x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.AccountId == x.Id && c.ContactAddresses.Any(a => input.Countries.Contains(a.AddressFk.CountryId))) > 0)

                        .WhereIf(input.Languages != null && input.Languages.Count(x => x > 0) > 0,
                            x => _appMarketplaceContactRepository.GetAll().Count(c => c.Id == x.Id && c.LanguageId != null && input.Languages.Contains((long)c.LanguageId)) > 0)

                        .WhereIf(input.Curruncies != null && input.Curruncies.Count(x => x > 0) > 0,
                            x => _appMarketplaceContactRepository.GetAll().Count(c => c.Id == x.Id && c.CurrencyId != null && input.Curruncies.Contains((long)c.CurrencyId)) > 0)
                        .WhereIf(!string.IsNullOrEmpty(input.SSIN), x => x.SSIN == input.SSIN)
                        .WhereIf(input.AccountTypeId != null && input.AccountTypeId > 0, x => x.EntityObjectTypeId == input.AccountTypeId)
                        .WhereIf(input.AccountType != null && !string.IsNullOrEmpty(input.AccountType), x => x.EntityObjectTypeCode == input.AccountType)
                        .WhereIf(input.AccountTypes != null && input.AccountTypes.Count(x => x > 0) > 0, x =>
                       input.AccountTypes.Length > 0 && input.AccountTypes.Contains(x.EntityObjectTypeId))
                       //.Where(e => (e.SSIN != currentTenantAccountSSIN && e.IsProfileData && e.ParentId == null) && ((e.IsHidden != true) ));
                       .Where(e => ((e.SharingLevel == 1 && e.ParentId == null))); //&& e.SSIN != currentTenantAccountSSIN);

                //||  (_appContactRepository.GetAll().Where(x => x.TenantId == AbpSession.TenantId && x.SSIN == e.SSIN).Count() > 0)));

                var pagedAndFilteredAccounts = filteredAccounts
                .OrderBy(input.Sorting ?? "name asc")
                .PageBy(input);

                var logoCategory = await _helper.SystemTables.GetAttachmentCategoryLogoId();
                IQueryable<GetMarketplaceAccountForViewDto> _accounts = null;
                if (filteredContacts != null)
                {
                    _accounts = from o in pagedAndFilteredAccounts
                                join o1 in filteredContacts on o.Id equals o1.Id
                                //from s1 in j1.DefaultIfEmpty()
                                //where s1.TenantId == AbpSession.TenantId
                                //join o1 in _appEntityRepository.GetAll() on o.AppContactAddresses.FirstOrDefault().AddressFk.CountryId equals o1.Id into j1
                                //from s1 in j1.DefaultIfEmpty()

                                select new GetMarketplaceAccountForViewDto()
                                {
                                    IsPublished = (o.TenantOwner == AbpSession.TenantId ? true : false),
                                    //AvaliableConnectionName = GetAction(o.EntityObjectTypeCode),
                                    AvaliableConnectionName = "Follow",
                                    //ConnectionName = s1 != null && !s1.IsDeleted && s1.Id > 0 ? "Follow" : "",
                                    ConnectionName = "Follow",
                                    Account = new AccountDto
                                    {
                                        AccountTypeString = o.EntityObjectTypeCode,
                                        TenantId = o.TenantOwner,
                                        AccountTypeId = o.EntityObjectTypeId,
                                        AccountType = o.EntityObjectTypeCode,
                                        SSIN = o.SSIN,
                                        //PriceLevel = o.PriceLevel,
                                        PriceLevel = "",
                                        Name = o.Name,
                                        City = o.ContactAddresses.FirstOrDefault().AddressFk.City,
                                        State = o.ContactAddresses.FirstOrDefault().AddressFk.State,
                                        ZipCode = o.ContactAddresses.FirstOrDefault().AddressFk.PostalCode,
                                        AddressLine1 = o.ContactAddresses.FirstOrDefault().AddressFk.AddressLine1,
                                        CountryName = o.ContactAddresses.FirstOrDefault().AddressFk.CountryFk.Name,
                                        Status = input.FilterType != 1 ? (_appMarketplaceContactRepository.GetAll().Count(x => x.TenantId == null && x.SSIN == o.SSIN) > 0 || (o.TenantId != null && o.ParentId == null && o.SSIN == null)) :
                                        (_appMarketplaceContactRepository.GetAll().Count(x => x.TenantId == AbpSession.TenantId && x.SSIN == o.SSIN) > 0 || (o.TenantId != null && o.ParentId == null && o.SSIN == null)),
                                        Id = o.Id,
                                        IsManual = o.TenantId == AbpSession.TenantId && o.ParentId == null && o.SSIN == null,
                                        LogoUrl = string.IsNullOrEmpty(o.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                                         ""
                                         : "attachments/" + (o.TenantId == null ? "-1" : o.TenantId.ToString()) + "/" + o.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == logoCategory).AttachmentFk.Attachment,
                                        Classfications = o.EntityClassifications.Select(x => x.EntityObjectClassificationFk.Name).Take(5).ToArray(),
                                        Categories = o.EntityCategories.Select(x => x.EntityObjectCategoryFk.Name).Take(5).ToArray(),
                                        MarketplaceAccountRole = o.EntityExtraData.Where(z=>z.AttributeId==610).Select(z=>z.AttributeValue).FirstOrDefault()
                                        //,
                                        //PartnerId = o.SSIN
                                    },
                                    //AppEntityName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                                };
                }
                else
                {
                    _accounts = from o in pagedAndFilteredAccounts
                                    //join o1 in _appContactRepository.GetAll() on o.SSIN equals o1.SSIN into j1
                                    //from s1 in j1.DefaultIfEmpty()
                                    //where s1.TenantId == AbpSession.TenantId
                                    //join o1 in _appEntityRepository.GetAll() on o.AppContactAddresses.FirstOrDefault().AddressFk.CountryId equals o1.Id into j1
                                    //from s1 in j1.DefaultIfEmpty()

                                    select new GetMarketplaceAccountForViewDto ()
                                    {
                                        IsProfileData = o.IsProfileData,
                                        IsPublished = (o.TenantOwner == AbpSession.TenantId ? true : false),
                                        //AvaliableConnectionName = GetAction(o.EntityObjectTypeCode),
                                        AvaliableConnectionName = "Follow",
                                        //ConnectionName = s1 != null && !s1.IsDeleted && s1.Id > 0 ? "Follow" : "",
                                        ConnectionName = "Follow",
                                        Account = new AccountDto
                                        {
                                            AccountTypeString = o.EntityObjectTypeCode,
                                            TenantId = o.TenantOwner,
                                            AccountTypeId = o.EntityObjectTypeId,
                                            AccountType = o.EntityObjectTypeCode,
                                            SSIN = o.SSIN,
                                            //PriceLevel = o.PriceLevel,
                                            PriceLevel = "",
                                            Name = o.Name,
                                            City = o.ContactAddresses.FirstOrDefault().AddressFk.City,
                                            State = o.ContactAddresses.FirstOrDefault().AddressFk.State,
                                            ZipCode = o.ContactAddresses.FirstOrDefault().AddressFk.PostalCode,
                                            AddressLine1 = o.ContactAddresses.FirstOrDefault().AddressFk.AddressLine1,
                                            CountryName = o.ContactAddresses.FirstOrDefault().AddressFk.CountryFk.Name,
                                            Status = input.FilterType != 1 ? (_appMarketplaceContactRepository.GetAll().Count(x => x.TenantId == null && x.SSIN == o.SSIN) > 0 || (o.TenantId != null && o.ParentId == null && o.SSIN == null)) :
                                            (_appMarketplaceContactRepository.GetAll().Count(x => x.TenantId == AbpSession.TenantId && x.SSIN == o.SSIN) > 0 || (o.TenantId != null && o.ParentId == null && o.SSIN == null)),
                                            Id = o.Id,
                                            IsManual = o.TenantId == AbpSession.TenantId && o.ParentId == null && o.SSIN == null,
                                            LogoUrl = string.IsNullOrEmpty(o.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                                             ""
                                             : "attachments/" + (o.TenantId == null ? "-1" : o.TenantId.ToString()) + "/" + o.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == logoCategory).AttachmentFk.Attachment,
                                            Classfications = o.EntityClassifications.Select(x => x.EntityObjectClassificationFk.Name).Take(5).ToArray(),
                                            Categories = o.EntityCategories.Select(x => x.EntityObjectCategoryFk.Name).Take(5).ToArray(),
                                            MarketplaceAccountRole = o.EntityExtraData.Where(z => z.AttributeId == 610).Select(z => z.AttributeValue).FirstOrDefault()
                                            //,
                                            //PartnerId = o.SSIN
                                        },
                                        //AppEntityName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                                    };
                }
                    long marketplaceRelationshipSycEntityObjId=0, pendingRelationshipStatusId=0, inActiveRelationshipStatusId=0;
                    if (AbpSession.TenantId != null)
                    {
                         marketplaceRelationshipSycEntityObjId = await _helper.SystemTables.GetEntityObjectTypeMarketplaceRelationship();

                         pendingRelationshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipPending();
                         inActiveRelationshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipInActive();
                    }
                    string currentTenantAccount = "";
                    AppContact currentTenantAccountObject = currentTenantAccountObj;
                    if (AbpSession.TenantId != null)
                    {
                        //currentTenantAccountObject = _appContactRepository.GetAll().Include(e => e.EntityFk)
                         //   .FirstOrDefault(e => e.TenantId == AbpSession.TenantId && e.IsProfileData && e.ParentId == null);
                        currentTenantAccount = currentTenantAccountObject != null ? currentTenantAccountObject.EntityFk.EntityObjectTypeCode : null;
                    }
                    var accountsList = await _accounts.ToListAsync();

                if (AbpSession.TenantId != null)
                {
                    var relationShipLookups = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData)
                            .Where(z => z.EntityObjectTypeId == marketplaceRelationshipSycEntityObjId).ToListAsync();
                    var relationshipsListAll = await _appContactRelationshipInfoRepository.GetAll()
                                .Where(z => currentTenantAccountObject != null
                                && (((z.RecipientContactSSIN == currentTenantAccountObject.SSIN)
                                ||
                                (z.RequesterContactSSIN == currentTenantAccountObject.SSIN))
                                && z.EntityObjectStatusId != inActiveRelationshipStatusId)
                               ).OrderByDescending(z => z.CreationTime).ToListAsync();


                    foreach (var account in accountsList)
                    {
                        //I50[Start]
                        var relationshipsQuery = _appContactRelationshipInfoRepository.GetAll()
                        .Where(z => ((z.RequesterContactSSIN == account.Account.SSIN)
                         || (z.RecipientContactSSIN == account.Account.SSIN)) && z.EntityObjectStatusId == activeRelationshipStatusId &&
                        (z.SharingLevel == 1));

                        var relationshipQ = from b in _appMarketplaceContactRepository.GetAll().Where(z => z.SSIN != account.Account.SSIN && z.IsDeleted == false && z.SharingLevel == 1)
                                            from a in relationshipsQuery
                                            where (b.SSIN == a.RequesterContactSSIN || b.SSIN == a.RecipientContactSSIN)
                                            select new { obj = b.SSIN };

                        account.Account.Connections = await relationshipQ.Distinct().CountAsync();
                        //I50[End]
                        account.AvailableConnections = new List<ConnectionType>();
                        account.ConnectionName = "";
                        /*var accountConnection = _appContactRepository.GetAll()
                        .FirstOrDefault(e => e.TenantId == AbpSession.TenantId && e.SSIN == account.Account.SSIN);*/
                        //if (accountConnection != null && accountConnection.Id > 0)
                        if (account.Account.Id > 0)
                        { 
                             //if (accountConnection.IsProfileData)
                            if (account.IsProfileData)
                            {
                                account.DisConnectLabel = "";
                                account.ConnectionName = "";
                                account.AvaliableConnectionName = "";
                                account.AvailableConnections = new List<ConnectionType>();
                                continue;
                            }
                            /*var relationship = await _appContactRelationshipInfoRepository.GetAll()
                                .Where(z => currentTenantAccountObject != null && ((z.RecipientContactSSIN == currentTenantAccountObject.SSIN && z.RequesterContactSSIN == account.Account.SSIN)
                                || (z.RecipientContactSSIN == account.Account.SSIN && z.RequesterContactSSIN == currentTenantAccountObject.SSIN))
                               ).OrderByDescending(z => z.CreationTime).FirstOrDefaultAsync();*/
                            var relationshipsList = relationshipsListAll
                                .Where(z => currentTenantAccountObject != null 
                                && (((z.RequesterContactSSIN == account.Account.SSIN)
                                ||
                                (z.RecipientContactSSIN == account.Account.SSIN)) 
                                && z.EntityObjectStatusId != inActiveRelationshipStatusId)
                               ).OrderByDescending(z => z.CreationTime).ToList();
                            account.ConnectionsInfo = new List<ConnectionInfo>();
                            if (relationshipsList!=null && relationshipsList.Count>0)
                                //if (relationship != null)
                            {
                                foreach (var relationship in relationshipsList)
                                {
                                    //xx
                                    string relationshipCode = relationship.EntityObjectTypeCode; //currentTenantAccountObject.EntityFk.EntityObjectTypeCode.Substring(0, 1) + "T" +
                                    ConnectionInfo connInfo = new ConnectionInfo();
                                    connInfo.RelationEntityId = relationship.Id;
                                    connInfo.Visibility = relationship.SharingLevel == 1 ? "Public" : "Private";
                                    connInfo.ConnectionStatus = relationship.EntityObjectStatusCode;                                                         //account.Account.AccountType.Substring(0, 1);
                                    connInfo.RelationshipCode = relationship.EntityObjectTypeCode;                                                                                                            //xx
                                    connInfo.RequestorRole = relationship.RequesterMarketplaceRole;
                                    connInfo.RecipientRole = relationship.RecipientMarketplaceRole;
                                    var relationType = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData).Where(z => z.Code == relationshipCode).FirstOrDefaultAsync();
                                    if (relationType != null)
                                    {
                                        var extrDataDisconnect = relationType.EntityExtraData.Where(z => z.AttributeId == 602).FirstOrDefault();
                                        if (extrDataDisconnect != null)
                                        {
                                            connInfo.DisconnectLabel = "MPAction" + extrDataDisconnect.AttributeValue;
                                            //account.DisConnectLabel = "MPAction" + extrDataDisconnect.AttributeValue;
                                        }

                                        if (relationship.EntityObjectStatusId == activeRelationshipStatusId)
                                        {
                                            var extrDataSharing = relationType.EntityExtraData.Where(z => z.AttributeId == (relationship.RequesterContactSSIN == currentTenantAccountObject.SSIN ? 604 : 612)).FirstOrDefault();
                                            if (extrDataSharing != null)
                                            {
                                                connInfo.ConnectedLabel = "MPAction" + extrDataSharing.AttributeValue;
                                                //account.ConnectionName = "MPAction" + extrDataSharing.AttributeValue;
                                            }
                                        }
                                        else
                                        {
                                            if (relationship.EntityObjectStatusId == pendingRelationshipStatusId)
                                            {
                                                var extrDataSharing = relationType.EntityExtraData.Where(z => z.AttributeId == 603).FirstOrDefault();
                                                if (extrDataSharing != null)
                                                {
                                                    //account.ConnectionName = "MPAction" + extrDataSharing.AttributeValue;
                                                    connInfo.PendingLabel = "MPAction" + extrDataSharing.AttributeValue;
                                                }
                                            }
                                            else
                                            {
                                                if (relationship.EntityObjectStatusId == inActiveRelationshipStatusId)
                                                {
                                                    var extrDataSharing = relationType.EntityExtraData.Where(z => z.AttributeId == 602).FirstOrDefault();
                                                    if (extrDataSharing != null)
                                                    {
                                                        connInfo.ConnectedLabel = "MPAction" + extrDataSharing.AttributeValue;
                                                        //account.ConnectionName = "MPAction" + extrDataSharing.AttributeValue;
                                                    }
                                                }

                                            }
                                           
                                        }


                                    }
                                    account.ConnectionsInfo.Add(connInfo);
                                }
                            }
                            //I40[Start]
                            //else
                            {
                                account.ConnectionName = "";
                                foreach (var relationshipCodeLookup in relationShipLookups)
                                {
                                    if (account.ConnectionsInfo != null)
                                    {
                                        var existInconn = account.ConnectionsInfo.Where(z => z.RelationshipCode == relationshipCodeLookup.Code).FirstOrDefault();
                                        if (existInconn != null)
                                            continue;
                                        else
                                        {
                                            string requestorMarketplaceRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 610).Select(z => z.AttributeValue).FirstOrDefault();
                                            string recipientMarketplaceRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 611).Select(z => z.AttributeValue).FirstOrDefault();
                                            var oppositeRelation = account.ConnectionsInfo
                                                .Where(z => z.RecipientRole == requestorMarketplaceRole &&
                                                z.RequestorRole == recipientMarketplaceRole).FirstOrDefault();
                                            if (oppositeRelation != null)
                                                continue;
                                        }
                                    }
                                    if (account.AvailableConnections != null && account.AvailableConnections.Count > 0)
                                    {
                                        var exitsAvial = account.AvailableConnections
                                            .Where(z => z.ConnectionEntityId == relationshipCodeLookup.Id).FirstOrDefault();
                                        if (exitsAvial != null)
                                            continue;
                                    }

                                    var requestorType = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 606).FirstOrDefault();
                                    var requestorRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 610).FirstOrDefault();
                                    var recepientRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 611).FirstOrDefault();
                                    if ((currentTenantAccountObject != null && requestorType != null
                                        && requestorType.AttributeValue.TrimEnd().ToLower() ==
                                        currentTenantAccountObject.EntityFk.EntityObjectTypeCode.ToLower())
                                        && ((!string.IsNullOrEmpty(currentTenatntAccountMarketplaceRole)
                                        && requestorRole != null && !string.IsNullOrEmpty(requestorRole.AttributeValue)) ?
                                        currentTenatntAccountMarketplaceRole.ToLower().Contains(requestorRole.AttributeValue.ToLower().TrimEnd().Replace(".", ""))
                                        : true))
                                    {
                                        var responseType = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 607).FirstOrDefault();
                                        if ((responseType != null && 
                                            responseType.AttributeValue.TrimEnd().ToLower() == 
                                            account.Account.AccountTypeString.ToLower())
                                            && ((!string.IsNullOrEmpty(account.Account.MarketplaceAccountRole)
                                            && recepientRole!=null && !string.IsNullOrEmpty(recepientRole.AttributeValue)) ?
                                            account.Account.MarketplaceAccountRole.Replace(".", "").ToLower().Contains(recepientRole.AttributeValue.ToLower().TrimEnd().Replace(".", ""))
                                            : true))
                                        {
                                            var connectLabel = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 601).FirstOrDefault();
                                            if (connectLabel != null)
                                            {
                                                var sharingLevl = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 605).FirstOrDefault();

                                                account.AvailableConnections.Add(new ConnectionType
                                                {
                                                    ConnectionName = relationshipCodeLookup.Name,
                                                    ConnectionEntityId = relationshipCodeLookup.Id,
                                                    ConnectLabel = connectLabel.AttributeValue,
                                                    DefaultVisibility = sharingLevl != null && !string.IsNullOrEmpty(sharingLevl.AttributeValue) ? sharingLevl.AttributeValue : "Public"
                                                });
                                            }
                                        }

                                    }
                                }
                                if (currentTenantAccountObject != null)
                                {
                                    string relationshipCode = currentTenantAccountObject.EntityFk.EntityObjectTypeCode.Substring(0, 1) + "T" +
                                        account.Account.AccountType.Substring(0, 1);


                                    var relationType = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData)
                                        .Where(z => z.Code == relationshipCode).FirstOrDefaultAsync();
                                    if (relationType != null)
                                    {
                                        var extrDataSharing = relationType.EntityExtraData.Where(z => z.AttributeId == 601).FirstOrDefault();
                                        if (extrDataSharing != null)
                                        {
                                            account.AvaliableConnectionName = "MPAction" + extrDataSharing.AttributeValue;
                                        }
                                    }
                                }
                            }

                            //I40[End]
                            //account.ConnectionName = GetAction(account.Account.AccountType, currentTenantAccount, false);
                            //account.AvaliableConnectionName = "";
                        }
                        //else
                        {
                            account.ConnectionName = "";
                            foreach (var relationshipCodeLookup in relationShipLookups)
                            {
                                if (account.ConnectionsInfo != null)
                                {
                                    var existInconn = account.ConnectionsInfo.Where(z => z.RelationshipCode == relationshipCodeLookup.Code).FirstOrDefault();
                                    if (existInconn != null)
                                        continue;
                                    else {
                                        string requestorMarketplaceRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 610).Select(z => z.AttributeValue).FirstOrDefault();
                                        string recipientMarketplaceRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 611).Select(z => z.AttributeValue).FirstOrDefault();
                                        var oppositeRelation = account.ConnectionsInfo
                                            .Where(z => z.RecipientRole == requestorMarketplaceRole &&
                                            z.RequestorRole == recipientMarketplaceRole).FirstOrDefault();
                                        if (oppositeRelation != null)
                                            continue;
                                    }
                                }
                                if (account.AvailableConnections != null && account.AvailableConnections.Count > 0)
                                {
                                    var exitsAvial = account.AvailableConnections
                                        .Where(z => z.ConnectionEntityId == relationshipCodeLookup.Id).FirstOrDefault();
                                    if (exitsAvial != null)
                                        continue;
                                }    
                                var requestorType = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 606).FirstOrDefault();
                                var requestorRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 610).FirstOrDefault();
                                var recepientRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 611).FirstOrDefault();
                                if ((currentTenantAccountObject != null && requestorType != null &&
                                    requestorType.AttributeValue.TrimEnd().ToLower() == 
                                    currentTenantAccountObject.EntityFk.EntityObjectTypeCode.ToLower())
                                          && ((!string.IsNullOrEmpty(currentTenatntAccountMarketplaceRole)
                                        && requestorRole!= null && !string.IsNullOrEmpty(requestorRole.AttributeValue)) ?
                                        currentTenatntAccountMarketplaceRole.Replace(".", "").ToLower().Contains(requestorRole.AttributeValue.ToLower().TrimEnd())
                                        : true))
                                {
                                    var responseType = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 607).FirstOrDefault();
                                    if ((responseType != null && responseType.AttributeValue.TrimEnd().ToLower() ==
                                        account.Account.AccountTypeString.ToLower()) &&
                                        ((!string.IsNullOrEmpty(account.Account.MarketplaceAccountRole)
                                        && recepientRole!= null && !string.IsNullOrEmpty(recepientRole.AttributeValue)) ?
                                        account.Account.MarketplaceAccountRole.Replace(".", "").ToLower().Contains(recepientRole.AttributeValue.ToLower().TrimEnd())
                                        : true))
                                    {
                                        var connectLabel = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 601).FirstOrDefault();
                                        if (connectLabel != null)
                                        {
                                            var sharingLevl = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 605).FirstOrDefault();

                                            account.AvailableConnections.Add(new ConnectionType
                                            {
                                                ConnectionName = relationshipCodeLookup.Name,
                                                ConnectionEntityId = relationshipCodeLookup.Id,
                                                ConnectLabel = connectLabel.AttributeValue,
                                                DefaultVisibility = sharingLevl != null && !string.IsNullOrEmpty(sharingLevl.AttributeValue) ? sharingLevl.AttributeValue : "Public"
                                            });
                                        }
                                    }

                                }
                            }
                            if (currentTenantAccountObject != null)
                            {
                                string relationshipCode = currentTenantAccountObject.EntityFk.EntityObjectTypeCode.Substring(0, 1) + "T" +
                                    account.Account.AccountType.Substring(0, 1);


                                var relationType = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData)
                                    .Where(z => z.Code == relationshipCode).FirstOrDefaultAsync();
                                if (relationType != null)
                                {
                                    var extrDataSharing = relationType.EntityExtraData.Where(z => z.AttributeId == 601).FirstOrDefault();
                                    if (extrDataSharing != null)
                                    {
                                        account.AvaliableConnectionName = "MPAction" + extrDataSharing.AttributeValue;
                                    }
                                }
                            }
                        }
                    }
                }
                    var totalCount = await filteredAccounts.CountAsync();

                    // List<LookupLabelDto> tmpAccountType = await _appEntitiesAppService.GetAllAccountTypeForTableDropdown();

                    //foreach (var account in accountsList)
                    //{
                    //    List<string> Account_AccountType = GetLookUPLabels(account.Account.AccountTypeString, tmpAccountType);
                    //    account.Account.AccountType = Account_AccountType;
                    //}
                    var x = new PagedResultDto<GetMarketplaceAccountForViewDto>(
                        totalCount,
                        accountsList
                    );

                    return x;
                    //}
                    //catch (Exception ex)
                    //{

                    //  throw ex;
                    //}

                }
            }
        

        

        public string GetAction(string accountTypeCode, string currentTenantAccount, bool neeedAction = false)
        {


            int currentTenant = AbpSession.TenantId == null ? -1 : ((int)AbpSession.TenantId);
            var currentTenantEdition = currentTenantAccount;
            currentTenantEdition = currentTenantEdition == null ? "" : currentTenantEdition;
            string action = "";
            if (!string.IsNullOrEmpty(accountTypeCode))
            {
                if (currentTenantEdition.ToUpper() == "PERSONAL" && accountTypeCode.ToUpper() == "PERSONAL") { action = neeedAction ? "MPActionCONNECT" : "MPActionCONNECTED"; }
                if (currentTenantEdition.ToUpper() == "PERSONAL" && accountTypeCode.ToUpper() == "BUSINESS") { action = neeedAction ? "MPActionFOLLOW" : "MPActionFOLLOWED"; }
                if (currentTenantEdition.ToUpper() == "PERSONAL" && accountTypeCode.ToUpper() == "GROUP") { action = neeedAction ? "MPActionJOIN" : "MPActionJOINED"; }

                if (currentTenantEdition.ToUpper() == "BUSINESS" && accountTypeCode.ToUpper() == "PERSONAL") { action = neeedAction ? "MPActionEMPLOY" : " MPActionEMPLOYED"; }
                if (currentTenantEdition.ToUpper() == "BUSINESS" && accountTypeCode.ToUpper() == "BUSINESS") { action = neeedAction ? "MPActionCONNECT" : "MPActionCONNECTED"; }
                if (currentTenantEdition.ToUpper() == "BUSINESS" && accountTypeCode.ToUpper() == "GROUP") { action = neeedAction ? "MPActionJOIN" : "MPActionJOINED"; }

                if (currentTenantEdition.ToUpper() == "GROUP" && accountTypeCode.ToUpper() == "PERSONAL") { action = neeedAction ? "MPActionINVIT" : "MPActionINVITED"; }
                if (currentTenantEdition.ToUpper() == "GROUP" && accountTypeCode.ToUpper() == "BUSINESS") { action = neeedAction ? "MPActionINVIT" : "MPActionINVITED"; }
                if (currentTenantEdition.ToUpper() == "GROUP" && accountTypeCode.ToUpper() == "GROUP") { action = ""; }
            }

            return action;
        }

        public async Task<PagedResultDto<GetMemberForViewDto>> GetUserInformation(GetAllMembersInput input) // New class for contacts input called GetAllAccountContactsInput
        {

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var contactObjectId = await _helper.SystemTables.GetObjectContactId();
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("LOGO");

                var contactInfo = _appMarketplaceContactRepository.GetAll()
                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.EntityExtraData)
                .Include(x => x.ContactAddresses)
                .Include(x => x.ParentFk)
                .Where(x => x.EntityObjectTypeId == presonEntityObjectTypeId)
                .WhereIf(input.AccountId != null && input.FilterType == MemberFilterTypeEnum.Profile, x => x.TenantId == AbpSession.TenantId && x.AccountId == input.AccountId && x.IsProfileData)
                .WhereIf(input.AccountId != null && input.FilterType == MemberFilterTypeEnum.View, x => x.AccountId == input.AccountId)
                .WhereIf(input.AccountId == null && input.FilterType == MemberFilterTypeEnum.MarketPlace, x => x.TenantId == null && !x.IsProfileData)
                .WhereIf(!string.IsNullOrEmpty(input.Filter),
                                    x => x.Name.Contains(input.Filter));

                IQueryable<AppMarketplaceContact> pagedAndFilteredContacts = null;
                if (input.Sorting != null && input.Sorting.ToLower().Contains("lastname"))
                {
                    pagedAndFilteredContacts = contactInfo
                      .OrderBy(p => p.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702).AttributeValue).PageBy(input);
                }
                else
                {
                    pagedAndFilteredContacts = contactInfo
                          .OrderBy(input.Sorting ?? "name asc")
                          .PageBy(input);
                }

                DateTime jDate = DateTime.Now;
                var contacts = from o in pagedAndFilteredContacts
                               select new GetMemberForViewDto()
                               {
                                   Id = o.Id,
                                   FirstName = o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 701) == null ? "" : o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 701).AttributeValue,
                                   SurName = o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702) == null ? "" : o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702).AttributeValue,
                                   JobTitle = o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706) == null ? "" : o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706).AttributeValue,
                                   EMailAddress = o.EMailAddress == null ? "" : o.EMailAddress,
                                   AccountName = o.ParentFk.Name,

                                   JoinDate = o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707) == null ? DateTime.Now : (DateTime.TryParse(o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue, out jDate) ? DateTime.Parse(o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue) : DateTime.Now),
                                   IsActive = false,
                                   UserId = o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715) == null ? 0 : long.Parse(o.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715).AttributeValue),
                                   ImageUrl = string.IsNullOrEmpty(o.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                                            ""
                                            : "attachments/" + (o.TenantId == null ? "-1" : o.TenantId.ToString()) + "/" + o.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment
                               };


                var totalCount = await contactInfo.CountAsync();

                var contactList = await contacts.ToListAsync();

                foreach (var contactObj in contactList)
                {
                    if (contactObj.UserId != 0)
                    {
                        //contactObj.IsActive = await GetMemberStatus(contactObj.UserId);
                    }

                    if (contactObj.JoinDate == new DateTime(1, 1, 1))
                    {
                        contactObj.JoinDate = DateTime.Now;
                    }
                }


                var x = new PagedResultDto<GetMemberForViewDto>(
                    totalCount, contactList);

                return x;

            }
        }

        [AbpAllowAnonymous]
        public async Task<GetAccountForViewDto> GetAccountForView(long id, string ssin, int resultCount = 10)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //if(id==93619)
                //ssin = "Business-000000005537";
                var activeRelationshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
                if (!string.IsNullOrEmpty(ssin))
                {
                    var marketPlaceAccount = _appMarketplaceContactRepository.GetAll()
                        .Where(e => e.SSIN == ssin &&
                        e.IsProfileData &&
                        (e.ParentId == null || e.ParentId <= 0))
                        .FirstOrDefault();
                    if (marketPlaceAccount != null)
                    {
                        id = marketPlaceAccount.Id;
                    } else { return new GetAccountForViewDto(); }
                }
                //I40[Start]
                AppContact currentTenantAccount = null;
                string currentTenantAccountSSIN = "";
                string currentTenatntAccountMarketplaceRole = "";
                if (AbpSession.TenantId != null)
                {
                     currentTenantAccount = _appContactRepository.GetAll().Include(e => e.EntityFk)
                        .ThenInclude(z=>z.EntityExtraData)
                            .FirstOrDefault(e => e.TenantId == AbpSession.TenantId && e.IsProfileData && e.ParentId == null);
                    if (currentTenantAccount != null)
                    {
                        currentTenantAccountSSIN = currentTenantAccount.SSIN;
                        var extraDataRole = currentTenantAccount.EntityFk.EntityExtraData
                            .Where(z => z.AttributeId == 610).FirstOrDefault();
                        if (extraDataRole != null) 
                        {
                            currentTenatntAccountMarketplaceRole = extraDataRole.AttributeValue.Replace(".", "");
                        }
                    }
                }
                //I40[End]
                var account = await _appMarketplaceContactRepository.GetAll()
                 .Include (z=>z.EntityExtraData)
                .Include(x => x.ContactAddresses).ThenInclude(x => x.AddressFk).ThenInclude(x => x.CountryFk)
                .Include(z=>z.CurrencyFk)
                .FirstOrDefaultAsync(x => x.Id == id);
                
                var output = new GetAccountForViewDto();
                string marketplaceAccountRole = "";
                
                if (account != null)
                {
                    var accountExtrAttRole = account.EntityExtraData.Where(z => z.AttributeId == 610).FirstOrDefault();
                    if (accountExtrAttRole != null)
                    {
                        marketplaceAccountRole = accountExtrAttRole.AttributeValue;
                    }
                     var entity = await _appEntityRepository.GetAll()
                    .Include(x => x.EntityClassifications).ThenInclude(x => x.EntityObjectClassificationFk)
                    .Include(x => x.EntityCategories).ThenInclude(x => x.EntityObjectCategoryFk)
                    .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    .FirstOrDefaultAsync(x => x.Id == account.Id);

                    var accountDto = ObjectMapper.Map<AccountDto>(account);

                    #region prepare account types
                    //List<LookupLabelDto> tmpAccountType = await _appEntitiesAppService.GetAllAccountTypeForTableDropdown();
                    //accountDto.AccountType = GetLookUPLabels(account.AccountType, tmpAccountType);
                    #endregion prepare account ypes

                    #region I31 fill account type from entity type in AppEntities 
                    accountDto.SSIN = account.SSIN;
                    accountDto.PriceLevel = "";
                    accountDto.AccountTypeId = entity.EntityObjectTypeId;
                    accountDto.AccountType = entity.EntityObjectTypeCode;
                    accountDto.IsManual = (account.TenantId == AbpSession.TenantId && !account.IsProfileData && account.ParentId == null && account.Id == null);
                    accountDto.IsConnected = (account.TenantId == null && !account.IsProfileData && account.ParentId == null);
                    #endregion I31 fill account type from entity type in AppEntities 


                    accountDto.Description = entity.Notes;

                    accountDto.Categories = entity.EntityCategories.Select(x => x.EntityObjectCategoryFk.Name).Take(resultCount).ToArray();
                    accountDto.CategoriesTotalCount = entity.EntityCategories.Count();

                    accountDto.Classfications = entity.EntityClassifications.Select(x => x.EntityObjectClassificationFk.Name).Take(resultCount).ToArray();
                    accountDto.ClassificationsTotalCount = entity.EntityClassifications.Count();

                    accountDto.Status = (_appContactRepository.GetAll().Count(x => x.TenantId == AbpSession.TenantId && x.PartnerId == account.Id) > 0 || _appContactRepository.GetAll().Count(x => x.Id == account.Id && x.TenantId == null) > 0);
                    //I40
                    //accountDto.Connections = _appContactRepository.GetAll().Count(c => c.TenantId == entity.TenantId && c.PartnerId == id);
                    //int ConnectionCount = _appContactRepository.GetAll().Count(c => c.TenantId != entity.TenantId && c.SSIN == entity.SSIN && c.IsDeleted == false);
                    //var activeRelationshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
                    var relationships = _appContactRelationshipInfoRepository.GetAll()
                               .Where(z => ((z.RequesterContactSSIN == account.SSIN)
                               || (z.RecipientContactSSIN == account.SSIN)) && z.EntityObjectStatusId == activeRelationshipStatusId &&
                               (z.SharingLevel == 1 )).Count();
                     var relationshipsQuery = _appContactRelationshipInfoRepository.GetAll()
                             .Where(z => ((z.RequesterContactSSIN == account.SSIN)
                             || (z.RecipientContactSSIN == account.SSIN)) && z.EntityObjectStatusId == activeRelationshipStatusId &&
                             (z.SharingLevel == 1));

                    var relationshipQ = from b in _appMarketplaceContactRepository.GetAll().Where(z => z.SSIN != account.SSIN && z.IsDeleted == false && z.SharingLevel == 1)
                                        from a in relationshipsQuery
                                        where (b.SSIN == a.RequesterContactSSIN || b.SSIN == a.RecipientContactSSIN) 
                                        select new { obj = b.SSIN };

                    relationships = await relationshipQ.Distinct().CountAsync();
                    //.WhereIf(input.AccountTypeId != null && input.AccountTypeId > 0, x =>
                    //(x.RequesterContactSSIN == input.SSIN && x.RecipientContactTypeId == long.Parse(input.AccountTypeId.ToString())) ||
                    //(x.RecipientContactSSIN == input.SSIN && x.RequesterContactTypeId == long.Parse(input.AccountTypeId.ToString())));
                    accountDto.Connections = relationships;
                    //var currentAccount = await _appMarketplaceContactRepository.GetAll().Where(z => z.OwnerId == AbpSession.TenantId && z.IsProfileData && z.ParentId == null).FirstOrDefaultAsync();
                    //var relationshipObj = await _appContactRelationshipInfoRepository.GetAll()
                    //            .Where(z => ((z.RecipientContactSSIN == currentAccount.SSIN && z.RequesterContactSSIN == account.SSIN)
                    //            || (z.RecipientContactSSIN == account.SSIN && z.RequesterContactSSIN == currentAccount.SSIN))
                    //           ).OrderByDescending(z => z.CreationTime).FirstOrDefaultAsync();
                    //if (relationshipObj != null)
                    //{
                    //   string relationshipCode = relationshipObj.EntityObjectTypeCode;
                    //   var relationType = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData).Where(z => z.Code == relationshipCode).FirstOrDefaultAsync();
                    //   if (relationType != null)
                    //   {
                    //        var extrDataDisconnect = relationType.EntityExtraData.Where(z => z.AttributeId == 602).FirstOrDefault();
                    //        if (extrDataDisconnect != null)
                    //        {
                    //            accountDto.DisConnectLabel = "MPAction" + extrDataDisconnect.AttributeValue;
                    //        }

                    //    }
                    //}
                    //I40

                    int ConnectionCount = relationships;//_appContactRepository.GetAll().Count(c => c.TenantId != entity.TenantId && c.SSIN == entity.SSIN && c.IsDeleted == false);
                    accountDto.EntityId = entity.Id;
                    //I40[Start]
                    var branchEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeBranchId();
                    var firstAddressBranch = await _appMarketplaceContactRepository.GetAll().Include(z => z.ContactAddresses).ThenInclude(z => z.AddressFk).ThenInclude(z => z.CountryFk)
                        .Where(x => x.ParentId == id && x.EntityObjectTypeId == branchEntityObjectTypeId && x.Code == account.Code.TrimEnd() + "-MAIN").FirstOrDefaultAsync();
                    if (firstAddressBranch == null)
                    {
                        firstAddressBranch = await _appMarketplaceContactRepository.GetAll().Include(z => z.ContactAddresses).ThenInclude(z => z.AddressFk).ThenInclude(z => z.CountryFk)
                        .Where(x => x.ParentId == id && x.EntityObjectTypeId == branchEntityObjectTypeId).FirstOrDefaultAsync();
                    }
                    //I40[End]
                    if (firstAddressBranch != null)
                    {
                        var firstAddress = firstAddressBranch.ContactAddresses.FirstOrDefault();
                        if (firstAddressBranch.ContactAddresses.Count() > 0 && firstAddress.AddressFk != null)
                        {
                            accountDto.AddressLine1 = firstAddress.AddressFk.AddressLine1;
                            accountDto.AddressLine2 = firstAddress.AddressFk.AddressLine2;
                            accountDto.City = firstAddress.AddressFk.City;
                            accountDto.CountryId = firstAddress.AddressFk.CountryId;
                            accountDto.CountryName = firstAddress.AddressFk.CountryFk.Name;
                            accountDto.ZipCode = firstAddress.AddressFk.PostalCode;
                            accountDto.State = firstAddress.AddressFk.State;
                            accountDto.Phone1Number = firstAddressBranch.Phone1Number;
                        }
                    }
                    if (account.TenantOwner != null)
                        accountDto.TenantId = ((int)account.TenantOwner);

                    var branch = ObjectMapper.Map<BranchDto>(account);
                    BranchForViewDto branchForViewDto = new BranchForViewDto { Branch = branch, Id = branch.Id, SubTotal = 0 };
                    var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                    var mainBranchSubtotal = _appContactRepository.GetAll()
                                .Include(e => e.ParentFk)
                                .Include(e => e.ParentFkList)
                                //  .Where(x => x.IsProfileData)
                                .Where(e => e.ParentId != null && e.ParentId == branch.Id && e.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId).Count();
                    branchForViewDto.SubTotal = mainBranchSubtotal;
                    List<TreeNode<BranchForViewDto>> branches = new List<TreeNode<BranchForViewDto>>
                {
                    new TreeNode<BranchForViewDto>() { label = branch.Name, Data = branchForViewDto}
                };
                    accountDto.Branches = branches;

                    if (entity.EntityAttachments.Count() > 0)
                    {
                        var attCatId = await _helper.SystemTables.GetAttachmentCategoryLogoId();
                        var logo = entity.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attCatId);
                        accountDto.LogoUrl = logo == null ? null : logo.AttachmentFk.Attachment;

                        var attCoverId = await _helper.SystemTables.GetAttachmentCategoryCoverId();
                        var cover = entity.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attCoverId);
                        accountDto.CoverUrl = cover == null ? null : cover.AttachmentFk.Attachment;

                        accountDto.ImagesUrls = entity.EntityAttachments
                            //.Where(x => x.AttachmentCategoryId != (logo == null ? 0 : logo.AttachmentCategoryId))
                            .WhereIf(logo != null, x => x.AttachmentCategoryId != (logo == null ? 0 : logo.AttachmentCategoryId))
                            .WhereIf(cover != null, x => x.AttachmentCategoryId != (cover == null ? 0 : cover.AttachmentCategoryId))
                            .Select(x => x.AttachmentFk.Attachment).ToArray();
                    }

                    output = new GetAccountForViewDto { Account = accountDto, ConnectionCount = ConnectionCount };

                    if (output.Account.CountryId != null && output.Account.CountryId != 0)
                    {
                        var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.Account.CountryId);
                        output.AppEntityName = _lookupAppEntity?.Name?.ToString();
                    }

                    if (output.Account.ImagesUrls != null && output.Account.ImagesUrls.Length > 0)
                    {
                        for (int i = 0; i < output.Account.ImagesUrls.Length; i++)
                        {
                            output.Account.ImagesUrls[i] = @"attachments/" + (entity.TenantId == null ? -1 : entity.TenantId) + @"/" + output.Account.ImagesUrls[i];
                        }
                    }
                    if (output.Account.LogoUrl != null) output.Account.LogoUrl = @"attachments/" + (entity.TenantId == null ? -1 : entity.TenantId) + @"/" + output.Account.LogoUrl;
                    if (output.Account.CoverUrl != null) output.Account.CoverUrl = @"attachments/" + (entity.TenantId == null ? -1 : entity.TenantId) + @"/" + output.Account.CoverUrl;
                    //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[Start]
                    long cancelledStatusId = await _helper.SystemTables.GetEntityObjectStatusContactCancelled();
                    //var publishedRecord = await _appContactRepository.GetAll().Where(x => x.TenantId == null && x.PartnerId == account.Id &&
                    //!x.IsProfileData && x.AccountId == null && x.EntityFk.EntityObjectStatusId != cancelledStatusId).FirstOrDefaultAsync();
                    var publishedRecord = await _appMarketplaceContactRepository.GetAll()
                                      .AsNoTracking()
                                      .FirstOrDefaultAsync(x => x.TenantId == null
                                      && x.IsProfileData == true
                                      && x.SharingLevel == 1
                                      && x.TenantOwner == account.TenantId
                                      && x.SSIN == account.SSIN);
                    output.IsSync = false;
                    output.IsPublished = false;
                    if (publishedRecord != null)
                    {
                        output.IsSync = (publishedRecord.LastModificationTime != entity.LastModificationTime);
                    }
                    //P-SII-20251106.0006,1 MMT 11/17/2025 - I40 - Account profile Rating & reviews issues[Start]
                    if (account.TenantOwner == AbpSession.TenantId)
                        output.IsPublished = true;
                    //P-SII-20251106.0006,1 MMT 11/17/2025 - I40 - Account profile Rating & reviews issues[End]
                    output.AvailableConnections = new List<ConnectionType>();
                    //fill connection attrs
                    //var currentTenantAccount = _appContactRepository.GetAll().Include(e => e.EntityFk)
                      //      .FirstOrDefault(e => e.TenantId == AbpSession.TenantId && e.IsProfileData && e.ParentId == null);
                            //.EntityFk.EntityObjectTypeCode;
                    if(AbpSession.TenantId != null)
                    { 
                       var accountConnection = _appContactRepository.GetAll().Include(z=>z.EntityFk)
                        .FirstOrDefault(e => e.TenantId == AbpSession.TenantId && e.SSIN == output.Account.SSIN);
                        if (accountConnection != null && accountConnection.Id > 0)
                        {
                            var relationshipsList = await _appContactRelationshipInfoRepository.GetAll()
                                    .Where(z => ((z.RecipientContactSSIN == currentTenantAccount.SSIN && z.RequesterContactSSIN == accountConnection.SSIN)
                                    || (z.RecipientContactSSIN == accountConnection.SSIN && z.RequesterContactSSIN == currentTenantAccount.SSIN))
                                   ).OrderByDescending(z => z.CreationTime).ToListAsync();
                            if (relationshipsList != null && relationshipsList.Count>0)
                            {
                                output.ConnectionsInfo = new List<ConnectionInfo>();
                                foreach(var relationship in relationshipsList)
                                {
                                    ConnectionInfo connInfo = new ConnectionInfo();
                                    connInfo.RelationEntityId = relationship.Id;
                                    connInfo.Visibility = relationship.SharingLevel == 1 ? "Public" : "Private";
                                    connInfo.ConnectionStatus = relationship.EntityObjectStatusCode;
                                    connInfo.RelationshipCode = relationship.EntityObjectTypeCode;
                                    connInfo.RequestorRole = relationship.RequesterMarketplaceRole;
                                    connInfo.RecipientRole = relationship.RecipientMarketplaceRole;
                                    var relationshipCode = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData).Where(z => z.Code == relationship.EntityObjectTypeCode).FirstOrDefaultAsync();
                                    if (relationshipCode != null)
                                    {
                                        var extrDataDisconnect = relationshipCode.EntityExtraData.Where(z => z.AttributeId == 602).FirstOrDefault();
                                        if (extrDataDisconnect != null)
                                        {
                                            //output.DisConnectLabel = "MPAction" + extrDataDisconnect.AttributeValue;
                                            connInfo.DisconnectLabel = "MPAction" + extrDataDisconnect.AttributeValue;
                                        }
                                        if (relationship.EntityObjectStatusId == activeRelationshipStatusId)
                                        {
                                            var extrDataSharing = relationshipCode.EntityExtraData.Where(z => z.AttributeId == (relationship.RequesterContactSSIN == currentTenantAccount.SSIN ? 604 : 612)).FirstOrDefault();
                                            if (extrDataSharing != null)
                                            {
                                                //output.ConnectionName = "MPAction" + extrDataSharing.AttributeValue;
                                                connInfo.ConnectedLabel = "MPAction" + extrDataSharing.AttributeValue; 
                                            }
                                        }
                                        output.ConnectionsInfo.Add(connInfo);
                                    }
                                }
                            }
                            //output.ConnectionName = GetAction(output.Account.AccountType, currentTenantAccount, false);
                            output.AvaliableConnectionName = "";
                        }
                        //else
                        {
                            //account.ConnectionName = account.ConnectionName == "Follow" ? GetAction(account.Account.AccountType) : "";
                            //output.AvaliableConnectionName = GetAction(output.Account.AccountType, currentTenantAccount, true);
                            //output.ConnectionName = "";
                            var marketplaceRelationshipSycEntityObjId = await _helper.SystemTables.GetEntityObjectTypeMarketplaceRelationship();
                            var relationShipLookups = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData)
                                    .Where(z => z.EntityObjectTypeId == marketplaceRelationshipSycEntityObjId).ToListAsync();
                            foreach (var relationshipCodeLookup in relationShipLookups)
                            {
                                if (output.ConnectionsInfo != null)
                                {
                                    var existInconn = output.ConnectionsInfo.Where(z => z.RelationshipCode == relationshipCodeLookup.Code).FirstOrDefault();
                                    if (existInconn != null)
                                        continue;
                                    else {
                                        string requestorMarketplaceRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 610).Select(z => z.AttributeValue).FirstOrDefault();
                                        string recipientMarketplaceRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 611).Select(z => z.AttributeValue).FirstOrDefault();
                                        var oppositeRelation = output.ConnectionsInfo
                                            .Where(z => z.RecipientRole == requestorMarketplaceRole &&
                                            z.RequestorRole == recipientMarketplaceRole).FirstOrDefault();
                                        if (oppositeRelation != null)
                                            continue;
                                    }
                                }
                                var requestorRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 610).FirstOrDefault();
                                var recepientRole = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 611).FirstOrDefault();
                                var requestorType = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 606).FirstOrDefault();
                                if (requestorType != null && 
                                    requestorType.AttributeValue.TrimEnd().ToLower() == currentTenantAccount.EntityFk.EntityObjectTypeCode.ToLower() &&
                                    ((!string.IsNullOrEmpty(currentTenatntAccountMarketplaceRole)
                                    && requestorRole!=null && !string.IsNullOrEmpty(requestorRole.AttributeValue)) ?
                                    (currentTenatntAccountMarketplaceRole.ToLower().Replace(".", "").Contains(requestorRole.AttributeValue.ToLower().TrimEnd().Replace(".", ""))) : true))
                                {
                                    var responseType = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 607).FirstOrDefault();
                                    if (responseType != null &&
                                        responseType.AttributeValue.TrimEnd().ToLower() == output.Account.AccountType.ToLower()
                                        && ((!string.IsNullOrEmpty(marketplaceAccountRole)
                                        && recepientRole!=null && !string.IsNullOrEmpty(recepientRole.AttributeValue)) ?
                                        marketplaceAccountRole.ToLower().Replace(".", "").Contains(recepientRole.AttributeValue.ToLower().TrimEnd().Replace(".", ""))
                                        : true))
                                    {
                                        var connectLabel = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 601).FirstOrDefault();
                                        if (connectLabel != null)
                                        {
                                            var sharingLevl = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 605).FirstOrDefault();

                                            output.AvailableConnections.Add(new ConnectionType
                                            {
                                                ConnectionName = relationshipCodeLookup.Name,
                                                ConnectionEntityId = relationshipCodeLookup.Id,
                                                ConnectLabel = connectLabel.AttributeValue,
                                                DefaultVisibility = sharingLevl != null && !string.IsNullOrEmpty(sharingLevl.AttributeValue) ? sharingLevl.AttributeValue : "Public"
                                            });
                                        }
                                    }

                                }
                            }
                        }

                    }
                }
                //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[End]
                //I40[Start]
                output.Contact = new ContactDto();
                //output.Contact = ObjectMapper.Map<ContactDto>(account);
                if (account.EntityExtraData != null && account.EntityExtraData.Count > 0)
                {
                    output.Contact.FirstName = account.EntityExtraData.FirstOrDefault(x => x.AttributeId == 701) == null ? "" : account.EntityExtraData.FirstOrDefault(x => x.AttributeId == 701).AttributeValue;
                    output.Contact.LastName = account.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702) == null ? "" : account.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702).AttributeValue;
                    //if (output.ParentId != null)
                    //  {
                    //var joinDate = account.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707)?.AttributeValue;
                    output.Contact.JobTitle = (account.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706) != null &&
                                       account.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706).AttributeValue != null)
                                        ? account.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706).AttributeValue : "";
                }
                //I40[Start]
                output.Account.CurrencyId = account.CurrencyId;
                output.Account.CurrencyCode = account.CurrencyFk == null ? account.CurrencyCode : account.CurrencyFk.Code;
                output.Account.CurrencyName = account.CurrencyFk==null?"":account.CurrencyFk.Name;
                //I40[Start]
                var groupAccountEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeGroupId();
                var personId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var businessId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
                
                
                output.AvailableGroupConnections = await _appContactRelationshipInfoRepository.GetAll()
                           .Where(z => ((z.RequesterContactSSIN == account.SSIN)
                           || (z.RecipientContactSSIN == account.SSIN)) && z.EntityObjectStatusId == activeRelationshipStatusId &&
                           (z.SharingLevel == 1)
                           &&
                              _appMarketplaceContactRepository.GetAll().Count(x => x.SSIN == z.RecipientContactSSIN) > 0 &&
                              _appMarketplaceContactRepository.GetAll().Count(x => x.SSIN == z.RequesterContactSSIN) > 0
                           )// || (z.SharingLevel==4 && input.SSIN == currentTenantAccountSSIN)))
                           .Where(x =>
                           (x.RequesterContactSSIN == account.SSIN &&
                           x.RecipientContactTypeId == long.Parse(groupAccountEntityObjectTypeId.ToString())) ||
                           (x.RecipientContactSSIN == account.SSIN &&
                           x.RequesterContactTypeId == long.Parse(groupAccountEntityObjectTypeId.ToString()))).CountAsync();

                output.AvailableBusinessConnections = await _appContactRelationshipInfoRepository.GetAll()
                           .Where(z => ((z.RequesterContactSSIN == account.SSIN)
                           || (z.RecipientContactSSIN == account.SSIN)) && z.EntityObjectStatusId == activeRelationshipStatusId 
                           &&
                              _appMarketplaceContactRepository.GetAll().Count(x => x.SSIN == z.RecipientContactSSIN) > 0 &&
                              _appMarketplaceContactRepository.GetAll().Count(x => x.SSIN == z.RequesterContactSSIN) > 0 &&
                           (z.SharingLevel == 1))// || (z.SharingLevel==4 && input.SSIN == currentTenantAccountSSIN)))
                           .Where(x =>
                           (x.RequesterContactSSIN == account.SSIN && x.RecipientContactTypeId == long.Parse(businessId.ToString())) ||
                           (x.RecipientContactSSIN == account.SSIN && x.RequesterContactTypeId == long.Parse(businessId.ToString()))).CountAsync();
                output.AvailablePeopleConnections = await _appContactRelationshipInfoRepository.GetAll()
                   .Where(z => ((z.RequesterContactSSIN == account.SSIN)
                   || (z.RecipientContactSSIN == account.SSIN)) && z.EntityObjectStatusId == activeRelationshipStatusId &&
                              _appMarketplaceContactRepository.GetAll().Count(x => x.SSIN == z.RecipientContactSSIN) > 0 &&
                              _appMarketplaceContactRepository.GetAll().Count(x => x.SSIN == z.RequesterContactSSIN) > 0 &&
                   (z.SharingLevel == 1))// || (z.SharingLevel==4 && input.SSIN == currentTenantAccountSSIN)))
                   .Where(x =>
                   (x.RequesterContactSSIN == account.SSIN && x.RecipientContactTypeId == long.Parse(personId.ToString())) ||
                   (x.RecipientContactSSIN == account.SSIN && x.RequesterContactTypeId == long.Parse(personId.ToString()))).CountAsync();

                /*var relationshipsConut = await _appContactRelationshipInfoRepository.GetAll()
                              .Where(z => ((z.RequesterContactSSIN == account.SSIN)
                              || (z.RecipientContactSSIN == account.SSIN)) &&
                              _appMarketplaceContactRepository.GetAll().Count(x => x.SSIN == z.RecipientContactSSIN) > 0 &&
                              _appMarketplaceContactRepository.GetAll().Count(x => x.SSIN == z.RequesterContactSSIN) > 0 &&
                              z.EntityObjectStatusId == activeRelationshipStatusId &&
                              (z.SharingLevel == 1)).CountAsync();// || (z.SharingLevel==4 && input.SSIN == currentTenantAccountSSIN)))*/
                var relationships1 = _appContactRelationshipInfoRepository.GetAll()
                               .Where(z => ((z.RequesterContactSSIN == account.SSIN)
                               || (z.RecipientContactSSIN == account.SSIN)) && z.EntityObjectStatusId == activeRelationshipStatusId &&
                               (z.SharingLevel == 1)).Count();
                var relationshipsQuery1 = _appContactRelationshipInfoRepository.GetAll()
                        .Where(z => ((z.RequesterContactSSIN == account.SSIN)
                        || (z.RecipientContactSSIN == account.SSIN)) && z.EntityObjectStatusId == activeRelationshipStatusId &&
                        (z.SharingLevel == 1));

                var relationshipQ1 = from b in _appMarketplaceContactRepository.GetAll().Where(z => z.SSIN != account.SSIN && z.IsDeleted == false && z.SharingLevel == 1)
                                    from a in relationshipsQuery1
                                    where (b.SSIN == a.RequesterContactSSIN || b.SSIN == a.RecipientContactSSIN)
                                    select new { obj = b };

                var relationshipsConut = await relationshipQ1.CountAsync();

                output.ConnectionCount = relationshipsConut;
                //I40[End]
                return output;
            }
        }


    }

    public class CreateMarketplaceAccount : onetouchAppServiceBase, ICreateMarketplaceAccount
    {
        private readonly IRepository<AppMarketplaceContactAddress, long> _appContactAddressRepository;
        private readonly IRepository<AppMarketplaceContact, long> _appMarketplaceContactRepository;
        private readonly IRepository<AppMarketplaceAddress, long> _appAddressRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppEntityAttachment, long> _appEntityAttachmentsRepository;
        private readonly IRepository<AppAttachment, long> _appAttachmentsRepository;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly Helper _helper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IConfigurationRoot _appConfiguration;
        //I40[Start]
        private readonly IRepository<AppContactRelationshipInfo, long> _appContactRelationshipInfoRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectTypeRepository;
            //I40[End]
        // private readonly IRepository<AppMarketplaceItem, long> _appMarketplaceItemRepository;
        public CreateMarketplaceAccount(IRepository<AppMarketplaceContact
            , long> appMarketplaceContactRepository
            , Helper helper
            , IRepository<AppEntity, long> appEntityRepository
            , IAppEntitiesAppService appEntitiesAppService
            , IRepository<AppMarketplaceContactAddress, long> appContactAddressRepository
            , IRepository<AppMarketplaceAddress, long> appAddressRepository
            , IRepository<AppContact, long> appContactRepository
            , IRepository<AppEntityExtraData, long> appEntityExtraDataRepository
            , IRepository<AppEntityAttachment, long> appEntityAttachmentsRepository
            , IRepository<AppAttachment, long> appAttachmentsRepository
            , IAppConfigurationAccessor appConfigurationAccessor
            ,IRepository<AppContactRelationshipInfo, long> appContactRelationshipInfoRepository,
            IRepository<SycEntityObjectType, long> sycEntityObjectTypeRepository)
        {
            //I40[Start]
            _appContactRelationshipInfoRepository = appContactRelationshipInfoRepository;
            _sycEntityObjectTypeRepository = sycEntityObjectTypeRepository;
            //I40[End]
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appMarketplaceContactRepository = appMarketplaceContactRepository;
            _helper = helper;
            _appContactRepository = appContactRepository;
            _appEntityRepository = appEntityRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _appContactAddressRepository = appContactAddressRepository;
            _appAddressRepository = appAddressRepository;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            _appEntityAttachmentsRepository = appEntityAttachmentsRepository;
            _appAttachmentsRepository = appAttachmentsRepository;
            //I40[Start]
            //_appMarketplaceItemRepository = appMarketplaceItemRepository;
            //I40[End]
        }


        public async Task<bool> HideAccount(string SSIN)
        {
            try
            {

                var ret = await _appMarketplaceContactRepository.FirstOrDefaultAsync(e => e.TenantId == null && e.SSIN == SSIN);
                if (ret != null)
                {
                    ret.SharingLevel = 4;
                    var relatedContacts = await _appMarketplaceContactRepository.GetAll().Where(e => e.TenantId == null && e.AccountId == ret.Id).ToListAsync();
                    if (relatedContacts != null && relatedContacts.Count() > 0)
                        _appMarketplaceContactRepository.GetAll().Where(e => e.TenantId == null && e.AccountId == ret.Id).ForEach(z => z.SharingLevel = 4);


                    //I40[Start]
                    var itemObjectId = await _helper.SystemTables.GetObjectListingId();
                    onetouchDbContext dbContext = CurrentUnitOfWork.GetDbContext<onetouchDbContext>();
                    dbContext.AppMarketplaceItems.Where(z => z.TenantOwner == ret.TenantOwner && z.ObjectId == itemObjectId && z.SharingLevel != 4)
                        .ForEach(z => z.SharingLevel = 4);
                }
                //var marketplaceItems = await _appMarketplaceItemRepository.GetAll().Where(z => z.TenantOwner == AbpSession.TenantId && z.ObjectId == itemObjectId && z.SharingLevel !=4).ToListAsync();
                //if (marketplaceItems != null && marketplaceItems.Count() > 0)
                //{
                //    marketplaceItems.ForEach(z => z.SharingLevel = 4);
                //}
                //I40[End]
                return true;
            }
            catch (Exception ex)
            { return false; }
        }
        //I40-Mariam[Start]
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
        //I40-Mariam[End]
        public async Task<long> CreateOrEditMarketplaceAccount(CreateOrEditMarketplaceAccountInfoDto input, bool sync)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var mainAccountID = input.Id;
                var personEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var FoundPublishContact = await _appMarketplaceContactRepository.GetAll()
                                                  .AsNoTracking().Include(x => x.ContactAddresses).ThenInclude(e => e.AddressFk)
                                                  .FirstOrDefaultAsync(x => x.TenantId == null
                                                  && x.IsProfileData == true
                                                  && x.TenantOwner == input.TenantId
                                                  && (x.SSIN == input.SSIN));

                #region if sync remove old data
                if (FoundPublishContact != null)
                {
                    FoundPublishContact.SharingLevel = 1;
                    sync = true;
                }
                else
                {
                     FoundPublishContact = await _appMarketplaceContactRepository.GetAll()
                                                 .AsNoTracking().Include(x => x.ContactAddresses).ThenInclude(e => e.AddressFk)
                                                 .FirstOrDefaultAsync(x => x.TenantId == null
                                                 && x.IsProfileData == true
                                                 && x.TenantOwner == input.TenantId
                                                 && ((x.Name == input.Name && x.EntityObjectTypeId == input.AccountTypeId)));
                    if (FoundPublishContact != null)
                    {
                        input.SSIN = FoundPublishContact.SSIN;
                        FoundPublishContact.SharingLevel = 1;
                        sync = true;
                    }
                }
                if (sync)
                {
                    // if profile already published-and sync - delete old records
                    if (FoundPublishContact != null)
                    {
                        // first delete related persons
                        // Collect the related persons
                        var personsInfoDelete = _appMarketplaceContactRepository.GetAll().
                            Include(e => e.EntityExtraData)
                            .Include(e => e.EntityAttachments).ThenInclude(z=>z.AttachmentFk)
                        .Where(x => x.IsProfileData
                               && x.SSIN == FoundPublishContact.SSIN
                               && x.TenantId == null
                               && x.EntityObjectTypeId == personEntityObjectTypeId).ToList();

                        // delete related Persons
                        // delete extra data of related persons
                        foreach (var psrsonObj in personsInfoDelete)
                        {
                            //DeleteBehavior extra data
                            if (psrsonObj.EntityExtraData.Count() > 0)
                            {
                                _appEntityExtraDataRepository.RemoveRange(psrsonObj.EntityExtraData);
                            }

                            // Delete related persons attachments
                            if (psrsonObj.EntityAttachments.Count() > 0)
                            {  // DeleteBehavior attachments then entity attachments
                                var rangeToRemove = psrsonObj.EntityAttachments.Select(e => e.AttachmentFk).ToList();
                                _appAttachmentsRepository.RemoveRange(rangeToRemove);
                                _appEntityAttachmentsRepository.RemoveRange(psrsonObj.EntityAttachments);
                            };
                            // delete related person
                            _appEntityRepository.Delete(e => e.Id == psrsonObj.Id);
                            _appMarketplaceContactRepository.Delete(e => e.Id == psrsonObj.Id);
                        }
                        await CurrentUnitOfWork.SaveChangesAsync();


                        // 2nd delete related branches
                        // collect related branches
                        var branchInfoDelete = _appMarketplaceContactRepository.GetAll().
                           Include(e => e.ContactAddresses).ThenInclude(e => e.AddressFk)
                       .Where(x => x.IsProfileData
                              && x.AccountId == FoundPublishContact.Id
                              && x.TenantId == null
                              && x.EntityObjectTypeId != personEntityObjectTypeId).ToList().OrderByDescending(e => e.Id);

                        // delete related branches
                        foreach (var branchObj in branchInfoDelete)
                        {
                            if (branchObj.ContactAddresses.Count() > 0)
                            {
                                foreach (var contactAddress in branchObj.ContactAddresses)
                                {
                                    _appAddressRepository.Delete(e => e.Id == contactAddress.AddressId);
                                    _appMarketplaceContactRepository.Delete(e => e.Id == contactAddress.Id);
                                }
                            }
                            _appEntityRepository.Delete(e => e.Id == branchObj.Id);
                            _appMarketplaceContactRepository.Delete(e => e.Id == branchObj.Id);
                        }

                        //delete main market place contact
                        if (FoundPublishContact.ContactAddresses.Count() > 0)
                        {
                            foreach (var contactAddress in FoundPublishContact.ContactAddresses)
                            {
                                _appAddressRepository.Delete(e => e.Id == contactAddress.AddressId);
                                _appMarketplaceContactRepository.Delete(e => e.Id == contactAddress.Id);
                            }
                        }
                        _appEntityRepository.Delete(e => e.Id == FoundPublishContact.Id);
                        _appMarketplaceContactRepository.Delete(e => e.Id == FoundPublishContact.Id);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        // ****delete accounts published at appcontact table
                        // var personsAccountInfoDelete = _appContactRepository.GetAll()
                        //    .Include(e => e.EntityFk).ThenInclude(e => e.EntityExtraData)
                        //    .Include(e => e.EntityFk).ThenInclude(e => e.EntityAttachments)
                        //.Where(x => x.IsProfileData
                        //       && x.AccountId == FoundPublishContact.AccountId
                        //       && x.TenantId != FoundPublishContact.OwnerId
                        //       && x.EntityFk.EntityObjectTypeId == personEntityObjectTypeId).ToList();

                        // // First level of Persons
                        // foreach (var branchObj in personsInfoDelete)
                        // {
                        //     //DeleteBehavior extra data
                        //     if (branchObj.EntityExtraData.Count() > 0)
                        //     {
                        //         _appEntityExtraDataRepository.RemoveRange(branchObj.EntityExtraData);
                        //     }

                        //     // Delete attachments
                        //     if (branchObj.EntityAttachments.Count() > 0)
                        //     {  // DeleteBehavior attachments then entity attachments
                        //         _appAttachmentsRepository.RemoveRange(branchObj.EntityAttachments.Select(e => e.AttachmentFk));
                        //         _appEntityAttachmentsRepository.RemoveRange(branchObj.EntityAttachments);
                        //     };

                        //     _appEntityRepository.Delete(e => e.Id == branchObj.Id);
                        //     _appContactRepository.Delete(e => e.Id == branchObj.Id);
                        // }
                        // await CurrentUnitOfWork.SaveChangesAsync();


                    }
                }
                #endregion if sync remove old data

                var foundEntity = _appEntityRepository.GetAll().FirstOrDefault(e => e.Id == input.EntityId);
                AppMarketplaceContact appMarketplaceContact = new AppMarketplaceContact();

                var foundContactInfo = _appContactRepository.GetAll().Include(e=> e.EntityFk).ThenInclude(e=> e.EntityExtraData)
                    .Include(e => e.EntityFk).ThenInclude(z=>z.EntityAttachments).ThenInclude(z=>z.AttachmentFk)
                    .Include(e => e.EntityFk).ThenInclude(z => z.EntityCategories)
                    .Include(e => e.EntityFk).ThenInclude(z => z.EntityClassifications)
                    .FirstOrDefault(e => e.Id == input.Id);

                ObjectMapper.Map(input, appMarketplaceContact);
                appMarketplaceContact.Id = 0;
                appMarketplaceContact.LastModificationTime = foundContactInfo.LastModificationTime;
                appMarketplaceContact.AccountId = mainAccountID;
                appMarketplaceContact.IsProfileData = true;
                appMarketplaceContact.ObjectId = foundEntity.ObjectId;
                appMarketplaceContact.EntityObjectTypeId = foundEntity.EntityObjectTypeId;
                appMarketplaceContact.EntityObjectTypeCode = foundEntity.EntityObjectTypeCode;
                appMarketplaceContact.SharingLevel = 1;
                appMarketplaceContact.Name = input.Name;
                appMarketplaceContact.Notes = input.Notes;
                //appMarketplaceContact.TenantOwner = input.TenantOwner;
                appMarketplaceContact.TenantOwner = int.Parse(input.TenantId.ToString());
                appMarketplaceContact.TenantId = null;
                appMarketplaceContact.Code = input.SSIN;
                appMarketplaceContact.SSIN = input.SSIN;
                appMarketplaceContact.TimeStamp = DateTime .Now;
                foreach (var contactAddress in appMarketplaceContact.ContactAddresses)
                {
                    contactAddress.Id = 0;
                    contactAddress.ContactId = 0;
                    contactAddress.AddressId = 0;

                    contactAddress.AddressFk.Id = 0;
                    contactAddress.AddressFk.AccountId = 0;
                }

                appMarketplaceContact.EntityExtraData = new List<AppEntityExtraData>();
                foreach (var EntityExtraData in input.EntityExtraData)
                {
                    //I40[Start]
                    AppEntityExtraData ext = ObjectMapper.Map<AppEntityExtraData>(EntityExtraData);
                    ext.EntityId = 0;
                    ext.Id = 0;
                    ext.EntityFk = null;
                    //I40
                    //if (ext.AttributeId==715)
                    //{
                    //    ext.AttributeValue = "";
                    //}
                    //I40
                    appMarketplaceContact.EntityExtraData.Add(ext);
                }
                foreach (var EntityExtraData in input.EntityExtraData) 
                {
                    //I40[Start]

                    switch (EntityExtraData.AttributeId)
                    {
                        case 708: //Language ID
                            if (EntityExtraData.AttributeValue == null || EntityExtraData.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.LanguageId = null;
                                appMarketplaceContact.LanguageCode = null;
                            }
                            break;
                        case 709: //Email Address
                            if (EntityExtraData.AttributeValue == null || EntityExtraData.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.EMailAddress = null;
                            }
                            break;
                        case 710: //Phone#1
                            if (EntityExtraData.AttributeValue == null || EntityExtraData.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone1Ext = null;
                                appMarketplaceContact.Phone1Number = null;
                                appMarketplaceContact.Phone1TypeId = null;
                                appMarketplaceContact.Phone1TypeName = null;
                            }
                            break;

                        case 711://Phone#2
                            if (EntityExtraData.AttributeValue == null || EntityExtraData.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone2Ext = null;
                                appMarketplaceContact.Phone2Number = null;
                                appMarketplaceContact.Phone2TypeId = null;
                                appMarketplaceContact.Phone2TypeName = null;
                            }
                            break;

                        case 712://Phone#3
                            if (EntityExtraData.AttributeValue == null || EntityExtraData.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone3Ext = null;
                                appMarketplaceContact.Phone3Number = null;
                                appMarketplaceContact.Phone3TypeId = null;
                                appMarketplaceContact.Phone3TypeName = null;
                            }
                            break;
                        case 713:  // Join DATE 
                            if (EntityExtraData.AttributeValue == null || EntityExtraData.AttributeValue.ToLower() == "false")
                            {
                                // entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 713));
                                appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue = null;
                            }

                            break;


                        case 714: //UserName
                            if (EntityExtraData.AttributeValue == null || EntityExtraData.AttributeValue.ToLower() == "false")
                            {
                                //entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 714));
                                appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703).AttributeValue = null;
                            }
                            break;

                    }
                    
                    //I40[End]

                    //AppEntityExtraData appEntityExtraDto = new AppEntityExtraData();
                    //appEntityExtraDto.EntityId = appMarketplaceContact.Id;
                    //appEntityExtraDto.AttributeValueId = EntityExtraData.AttributeValueId;
                    //appEntityExtraDto.AttributeValue = EntityExtraData.AttributeValue;
                    //appEntityExtraDto.AttributeId = EntityExtraData.AttributeId;
                    //appEntityExtraDto.EntityObjectTypeId = EntityExtraData.EntityObjectTypeId;

                    //appMarketplaceContact.EntityExtraData.Add(appEntityExtraDto);
                }
                //I40 -MMT  -Account Attachment[Start]
                appMarketplaceContact.EntityAttachments = new List<AppEntityAttachment>();
                if (foundContactInfo.EntityFk.EntityAttachments != null)
                {
                    foreach (var parentAttachObj in foundContactInfo.EntityFk.EntityAttachments)
                    {
                        AppEntityAttachment parentAttach = new AppEntityAttachment();
                        Type type = typeof(AppEntityAttachment);
                        ConstructorInfo constructor = type.GetConstructors()[0];
                        PropertyInfo[] properties = type.GetProperties();
                        object[] constructorArgs = new object[properties.Length];
                        for (int i = 0; i < properties.Length; i++)
                        {
                            parentAttach.GetType().GetProperty(properties[i].Name).SetValue(parentAttach,properties[i].GetValue(parentAttachObj));
                        }
                       // parentAttach = (AppEntityAttachment)constructor.Invoke(constructorArgs);
                        parentAttach.Id = 0;
                        parentAttach.AttachmentId = 0;
                        //parentAttach.AttachmentFk.Id = 0;
                        parentAttach.EntityId = 0;
                        parentAttach.EntityFk = null;
                        parentAttach.AttachmentFk = new AppAttachment();
                        parentAttach.AttachmentFk.TenantId = null;
                        parentAttach.AttachmentFk.Attachment = parentAttachObj.AttachmentFk.Attachment;
                        parentAttach.AttachmentFk.Id = 0;
                        parentAttach.AttachmentFk.Code  = parentAttachObj.AttachmentFk.Code;
                        parentAttach.AttachmentFk.Name = parentAttachObj.AttachmentFk.Name;
                        MoveFile(parentAttach.AttachmentFk.Attachment, AbpSession.TenantId, -1);
                        appMarketplaceContact.EntityAttachments.Add(parentAttach);
                    }
                }
                if (foundContactInfo.EntityFk.EntityCategories != null)
                {
                    appMarketplaceContact.EntityCategories = new List<AppEntityCategory>();
                    foreach (var catg in foundContactInfo.EntityFk.EntityCategories)
                    {
                        AppEntityCategory category = new AppEntityCategory();
                        Type type = typeof(AppEntityCategory);
                        ConstructorInfo constructor = type.GetConstructors()[0];
                        PropertyInfo[] properties = type.GetProperties();
                        object[] constructorArgs = new object[properties.Length];
                        for (int i = 0; i < properties.Length; i++)
                        {
                            category.GetType().GetProperty(properties[i].Name).SetValue(category, properties[i].GetValue(catg));
                        }
                        category.Id = 0;
                        category.EntityCode = appMarketplaceContact.Code;
                        appMarketplaceContact.EntityCategories.Add(category);
                    }
                }
                if (foundContactInfo.EntityFk.EntityClassifications != null)
                {
                    appMarketplaceContact.EntityClassifications = new List<AppEntityClassification>();
                    foreach (var clas in foundContactInfo.EntityFk.EntityClassifications)
                    {
                        AppEntityClassification classification = new AppEntityClassification();
                        Type type = typeof(AppEntityClassification);
                        ConstructorInfo constructor = type.GetConstructors()[0];
                        PropertyInfo[] properties = type.GetProperties();
                        object[] constructorArgs = new object[properties.Length];
                        for (int i = 0; i < properties.Length; i++)
                        {
                            classification.GetType().GetProperty(properties[i].Name).SetValue(classification, properties[i].GetValue(clas));
                        }
                        classification.Id = 0;
                        classification.EntityCode = appMarketplaceContact.Code;
                        appMarketplaceContact.EntityClassifications.Add(classification);
                    }
                }
                //I40 -MMT  -Account Attachment[End]

                long newId = 0;
                { newId = await _appMarketplaceContactRepository.InsertAndGetIdAsync(appMarketplaceContact); }
                await CurrentUnitOfWork.SaveChangesAsync();


                //HIA - share Account related branches [Start]

                var branchInfo = _appContactRepository.GetAll()
                    .Where(x => //x.IsProfileData
                           //&&
                           x.AccountId == mainAccountID
                           && x.TenantId == AbpSession.TenantId
                           && x.ParentId == mainAccountID
                           && x.EntityFk.EntityObjectTypeId != personEntityObjectTypeId).ToList();
                // First level of branches
                foreach (var branchObj in branchInfo)
                {
                    await PublishBranch(branchObj.Id, newId, personEntityObjectTypeId, mainAccountID, newId);
                }
                //HIA - share Account related branches [End]

                //Publish contacts
                //if (personEntityObjectTypeId)
                /*var contactInfo = _appContactRepository.GetAll()
                    .Where(x => //x.IsProfileData 
                           x.TenantId == AbpSession.TenantId
                           && x.ParentId == mainAccountID
                           && x.EntityFk.EntityObjectTypeId == personEntityObjectTypeId).ToList();*/
                var activeRelationshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
                var contactInfo = _appContactRepository.GetAll().Include(z=>z.EntityFk)
                    .Where(x => //x.IsProfileData 
                           x.TenantId == AbpSession.TenantId &&
                            _appContactRelationshipInfoRepository.GetAll()
                           .Where(s => s.RecipientContactSSIN == x.SSIN && s.ConsiderAsTeamMember == true &&
                           s.RequesterContactSSIN == input.SSIN //&& s.SharingLevel == 1
                           && s.EntityObjectStatusId == activeRelationshipStatusId).Count() > 0
                           && (x.EntityFk.TenantOwner == AbpSession.TenantId || x.EntityFk.TenantOwner == 0)
                           //&& x.ParentId == mainAccountID
                           //&& x.EntityFk.EntityObjectTypeId == personEntityObjectTypeId
                           ).ToList();
               
                foreach (var contactObj in contactInfo)
                {
                    if (contactObj.EntityFk.TenantOwner!= foundContactInfo.TenantId)
                    {
                        continue;
                    }
                    await PublishMember(contactObj.Id, newId, personEntityObjectTypeId, mainAccountID, newId);
                    //await HideAccount(contactObj.SSIN);
                    await CreateOrEditMarketplaceContactRelationship(input.SSIN, contactObj.SSIN, false,null, null,null);
                }
                return newId;
            }

        }

        //I40 -MMT[Start]
        public async Task<string> CreateOrEditMarketplaceContactRelationship(string requesterSSIN, string recipientSSIN, bool? disconnect, 
            bool? isPublic, long? connectionTypeId, long? disconnectRelationId)
        {
            if (disconnect==true && disconnectRelationId!=null)
            {
                var relationshipObj = await _appContactRelationshipInfoRepository.GetAll().Where(z => z.Id == disconnectRelationId).FirstOrDefaultAsync();
                if (relationshipObj!=null)
                {
                    var inActiveRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipInActive();
                    relationshipObj.EntityObjectStatusId = inActiveRealtionshipStatusId;
                    relationshipObj.RelationshipEndDate = DateTime.Now;
                    await _appContactRelationshipInfoRepository.UpdateAsync(relationshipObj);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    return "";
                }
            }
            //
            if (disconnect == false && disconnectRelationId != null)
            {
                var relationEnty = await _appEntityRepository.GetAll()
                    .AsNoTracking().Where(z => z.Id == disconnectRelationId).FirstOrDefaultAsync();
                if (relationEnty!=null)
                {
                    var relationshipEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeMarketplaceRelationship();

                    var relationshipObject = await _appEntityRepository.GetAll()
                        .Where(z => z.Code == relationEnty.EntityObjectTypeCode &&
                        z.EntityObjectTypeId == relationshipEntityObjectTypeId)
                        .FirstOrDefaultAsync();
                    if (relationshipObject!= null)
                    {
                        connectionTypeId = relationshipObject.Id;
                    }
                }
            
            }
                //

            string returnLabel = "";
            var activeRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
            var requestContact = await _appMarketplaceContactRepository.GetAll().Where(z => z.SSIN == requesterSSIN).FirstOrDefaultAsync();
            var recipientContact = await _appMarketplaceContactRepository.GetAll().Where(z => z.SSIN == recipientSSIN).FirstOrDefaultAsync();
            var recipientType = await _sycEntityObjectTypeRepository.GetAll().Where(z => z.Id == recipientContact.EntityObjectTypeId).FirstOrDefaultAsync();
            var requesterType = await _sycEntityObjectTypeRepository.GetAll().Where(z => z.Id == requestContact.EntityObjectTypeId).FirstOrDefaultAsync();
            //var relation = await _appContactRelationshipInfoRepository.GetAll().Where(z => ((z.RecipientContactSSIN == recipientSSIN && z.RequesterContactSSIN == requesterSSIN) 
            ////||
            //        //(z.RecipientContactSSIN == requesterSSIN && z.RequesterContactSSIN == recipientSSIN)
            //        ) && z.EntityObjectStatusId == activeRealtionshipStatusId).FirstOrDefaultAsync();
            AppEntity relationshipLookup = null;
            if (connectionTypeId != null)
                relationshipLookup = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData).Where(z => z.Id == connectionTypeId).FirstOrDefaultAsync();
            var relation = await _appContactRelationshipInfoRepository.GetAll()
              .Where(z => ((z.RecipientContactSSIN == recipientSSIN &&
              z.RequesterContactSSIN == requesterSSIN)
                  //||
                  //(z.RecipientContactSSIN == requesterSSIN && z.RequesterContactSSIN == recipientSSIN)
                  ) && z.EntityObjectStatusId == activeRealtionshipStatusId)
              .WhereIf(connectionTypeId != null && relationshipLookup!=null, z => z.EntityObjectTypeCode == relationshipLookup.Code)
              .FirstOrDefaultAsync();
            if (relation != null)
            {
                if (disconnect == true)
                {
                    var inActiveRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipInActive();
                    relation.EntityObjectStatusId = inActiveRealtionshipStatusId;
                    relation.RelationshipEndDate = DateTime.Now;
                    await _appContactRelationshipInfoRepository.UpdateAsync(relation);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    return "";
                }
                else
                {
                    if (isPublic != null)
                    {
                        relation.SharingLevel = isPublic == true ? 1 : 4;
                       
                    }
                    relation.EntityObjectStatusId = activeRealtionshipStatusId;
                    await _appContactRelationshipInfoRepository.UpdateAsync(relation);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }
            else
            {
                

                if (recipientContact != null && requestContact != null)
                {
                    relation = new AppContactRelationshipInfo();
                    relation.RecipientContactSSIN = recipientSSIN;
                    relation.RequesterContactSSIN = requesterSSIN;
                    relation.CreationTime = DateTime.Now;
                    relation.RelationshipStartDate = DateTime.Now;
                    relation.EntityObjectStatusId = activeRealtionshipStatusId;
                    relation.RecipientContactName = recipientContact.Name;
                    relation.RequesterContactName = requestContact.Name;
                    if (connectionTypeId == null || connectionTypeId==0)
                    {
                        var marketplaceRelationshipSycEntityObjId = await _helper.SystemTables.GetEntityObjectTypeMarketplaceRelationship();
                        var relationShipLookups = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData)
                            .Where(z => z.EntityObjectTypeId == marketplaceRelationshipSycEntityObjId).ToListAsync();

                        foreach (var relationshipCodeLookup in relationShipLookups)
                        {
                            var requestorType = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 606).FirstOrDefault();
                            if (requestorType != null && requestorType.AttributeValue.TrimEnd().ToLower() == requesterType.Code.ToLower())
                            {
                                var responseType = relationshipCodeLookup.EntityExtraData.Where(z => z.AttributeId == 607).FirstOrDefault();
                                if (responseType != null && responseType.AttributeValue.TrimEnd().ToLower() == recipientType.Code.ToLower())
                                {
                                    connectionTypeId = relationshipCodeLookup.Id;
                                    break;
                                }

                            }
                        }
                    }
                    //var recipientType = await _sycEntityObjectTypeRepository.GetAll().Where(z => z.Id == recipientContact.EntityObjectTypeId).FirstOrDefaultAsync();
                    if (recipientType != null)
                        relation.RecipientContactTypeCode = recipientType.Code;
                    relation.RecipientContactTypeId = recipientContact.EntityObjectTypeId;

                    //var requesterType = await _sycEntityObjectTypeRepository.GetAll().Where(z => z.Id == requestContact.EntityObjectTypeId).FirstOrDefaultAsync();
                    if (requesterType != null)
                        relation.RequesterContactTypeCode = requesterType.Code;
                    relation.RequesterContactTypeId = requestContact.EntityObjectTypeId;
                    relation.SharingLevel = 1;
                    if (requesterType != null && recipientType != null)
                    {
                        //string relationshipCode = requesterType.Code.Substring(0, 1) + "T" + recipientType.Code.Substring(0, 1);
                        var relationshiplookup = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData).Where(z => z.Id == connectionTypeId).FirstOrDefaultAsync();
                        var relationshipEntityObjectType = await _sycEntityObjectTypeRepository.GetAll().Where(z => z.Code == relationshiplookup.Code).FirstOrDefaultAsync();
                        if (relationshipEntityObjectType != null)
                        {
                            relation.EntityObjectTypeCode = relationshipEntityObjectType.Code;
                            relation.EntityObjectTypeId = relationshipEntityObjectType.Id;
                        }
                        
                        if (relationshiplookup != null)
                        {
                            var extrDataConnect = relationshiplookup.EntityExtraData.Where(z => z.AttributeId == (relation.RequesterContactSSIN == requesterSSIN ? 604 : 612)).FirstOrDefault();
                            if (extrDataConnect != null)
                            {
                                returnLabel = "MPAction" + extrDataConnect.AttributeValue;
                            }
                            //I40 return disconnect label[Start]
                            var extrDataDisconnect = relationshiplookup.EntityExtraData.Where(z => z.AttributeId == 602).FirstOrDefault();
                            if (extrDataDisconnect != null)
                            {
                                returnLabel +=  "-MPAction" + extrDataDisconnect.AttributeValue;
                            }
                            //I40 return disconnect label[End]
                            var extrDataSharing = relationshiplookup.EntityExtraData.Where(z => z.AttributeId == 605).FirstOrDefault();
                            if (extrDataSharing != null)
                            {
                                relation.SharingLevel = extrDataSharing.AttributeValue == "Public" ? 1 : 3;
                            }
                            //member
                            var extrDataMember = relationshiplookup.EntityExtraData.Where(z => z.AttributeId == 609).FirstOrDefault();
                            if (extrDataMember != null)
                            {
                                relation.ConsiderAsTeamMember = extrDataMember.AttributeValue.ToUpper().TrimEnd() =="TRUE";
                            }
                            //member
                            //I49 ChangeRequest[Start]
                            var extrDataReqRole = relationshiplookup.EntityExtraData.Where(z => z.AttributeId == 610).FirstOrDefault();
                            if (extrDataReqRole != null)
                            {
                                relation.RequesterMarketplaceRole= extrDataReqRole.AttributeValue.TrimEnd();
                            }
                            var extrDataRecRole = relationshiplookup.EntityExtraData.Where(z => z.AttributeId == 611).FirstOrDefault();
                            if (extrDataRecRole != null)
                            {
                                relation.RecipientMarketplaceRole= extrDataRecRole.AttributeValue.TrimEnd() ;
                            }
                            //I49 ChangeRequest[End]
                            var extrDataConnectedLabel = relationshiplookup.EntityExtraData.Where(z => z.AttributeId == 601).FirstOrDefault();
                            if (extrDataConnectedLabel != null)
                                relation.Name = relation.RequesterContactName + " " + extrDataConnectedLabel.AttributeValue.TrimEnd() + " " + relation.RecipientContactName;
                        }
                    }
                    if (isPublic != null)
                    {
                        relation.SharingLevel = isPublic == true ? 1 : 4;
                    }

                    relation.ObjectId = await _helper.SystemTables.GetObjectMarketplaceContactRelationshipId();
                    relation.Code = await _helper.SystemTables.GetNextSequence("MARKETPLACECONTACTRELATIONSHIP");

                    #region iteration49-charges 
                    // get defaults from shipvia from current tenant else from host 
                    // get defaults from payment terms from current tenant else from host 
                    // update extra data of relationship with default payment terms, shipvia, taxable and price level values

                    relation.EntityExtraData = new List<AppEntityExtraData>();

                    var shipViaType = await _sycEntityObjectTypeRepository.GetAll().Where(z => z.Code=="SHIPVIA" && z.ObjectCode=="LOOKUP").FirstOrDefaultAsync();
                    var defaultShipVia = await _appEntityRepository.GetAll().Where(z => z.TenantId == AbpSession.TenantId && z.EntityObjectTypeId == shipViaType.Id && z.IsDefault).Include(e=> e.EntityExtraData).FirstOrDefaultAsync();
                    if (defaultShipVia == null)
                    {   //get Host defaults if tenant defaults not found
                        defaultShipVia = await _appEntityRepository.GetAll().Where(z => z.TenantId == null && z.EntityObjectTypeId == shipViaType.Id && z.IsDefault).Include(e => e.EntityExtraData).FirstOrDefaultAsync();
                    }

                    var paymentType = await _sycEntityObjectTypeRepository.GetAll().Where(z => z.Code == "PAYMENT-TERMS" && z.ObjectCode == "LOOKUP").FirstOrDefaultAsync();
                    var defaultPaymentType = await _appEntityRepository.GetAll().Where(z => z.TenantId == AbpSession.TenantId && z.EntityObjectTypeId == paymentType.Id && z.IsDefault).Include(e => e.EntityExtraData).FirstOrDefaultAsync();
                    if (defaultPaymentType == null)
                    {
                        //get Host defaults if tenant defaults not found
                        defaultPaymentType = await _appEntityRepository.GetAll().Where(z => z.TenantId == null && z.EntityObjectTypeId == paymentType.Id && z.IsDefault).Include(e => e.EntityExtraData).FirstOrDefaultAsync();
                    }

                    relation.EntityExtraData.Add(new AppEntityExtraData
                    {
                        EntityId = relation.Id,
                        EntityObjectTypeCode = paymentType.Code,
                        EntityObjectTypeName = paymentType.Name,
                        EntityObjectTypeId = paymentType.Id,

                        AttributeId = 910,
                        AttributeCode = "PAYMENT-TERMS",
                        AttributeValueId = defaultPaymentType != null? defaultPaymentType.Id: null,
                        AttributeValue = defaultPaymentType != null ? defaultPaymentType.Name : null // need to read default from default tenant payment terms
                    });

                    relation.EntityExtraData.Add(new AppEntityExtraData
                    {
                        EntityId = relation.Id,
                        AttributeId = 911,
                        AttributeValue = "false", // need to read default from default tenant shipvai
                        AttributeCode = "ISTAXABLE"
                    });

                    relation.EntityExtraData.Add(new AppEntityExtraData
                    {
                        AttributeCode = "PRICELEVEL",
                        AttributeId = 908,
                        EntityId = relation.Id,
                        AttributeValue = "MSRP" // need to read default from default tenant shipvai
                    });
                    
                    var shippingMinimumAmount = "0";
                    var shippingCharge = "0";
                    if (defaultShipVia != null)
                    {
                        var defaultShippingMinimumAmount = defaultShipVia.EntityExtraData.Where(z => z.AttributeId == 905).FirstOrDefault();
                        shippingMinimumAmount = defaultShippingMinimumAmount != null ? defaultShippingMinimumAmount.AttributeValue : "0";

                        var defaultShippingCharge = defaultShipVia.EntityExtraData.Where(z => z.AttributeId == 904).FirstOrDefault();
                        shippingCharge = defaultShippingCharge != null ? defaultShippingCharge.AttributeValue : "0";
                    }

                    relation.EntityExtraData.Add(new AppEntityExtraData
                    {
                        EntityId = relation.Id,
                        EntityObjectTypeCode = shipViaType.Code,
                        EntityObjectTypeName = shipViaType.Name,
                        EntityObjectTypeId = shipViaType.Id,

                        AttributeId = 909,
                        AttributeCode = "SHIPVIA",
                        AttributeValueId = defaultShipVia != null ? defaultShipVia.Id : null,
                        AttributeValue = defaultShipVia != null ? defaultShipVia.Name : null // need to read default from default tenant payment terms
                    });

                    relation.EntityExtraData.Add(new AppEntityExtraData
                    {
                        AttributeCode = "SHIPPINGMINIMUMAMOUNT",
                        AttributeId = 907,
                        EntityId = relation.Id,
                        AttributeValue = shippingMinimumAmount // need to read default from default tenant shipvai
                    });

                    relation.EntityExtraData.Add(new AppEntityExtraData
                    {
                        AttributeCode = "SHIPPINGCHARGE",
                        AttributeId = 906,
                        EntityId = relation.Id,
                        AttributeValue = shippingCharge // need to read default from default tenant shipvai
                    });
                    #endregion iteration49-charges 

                    await _appContactRelationshipInfoRepository.InsertAsync(relation);
                    await CurrentUnitOfWork.SaveChangesAsync();


                }
            }
            return returnLabel;
        }
        //I40 - MMT[End]
        //public async Task<long> DeleteMarketplaceAccount(long marketplaceAccount)
        //{
        //    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
        //    {
        //        var mainAccountID = marketplaceAccount;

        //        #region if sync remove old data

        //        {
        //            var FoundpublishContact = await _appMarketplaceContactRepository.GetAll()
        //                                           .AsNoTracking().Include(x => x.ContactAddresses).ThenInclude(e => e.AddressFk)
        //                                           .FirstOrDefaultAsync(x => x.TenantId == null
        //                                           &&x.i);

        //            // if profile already published-and sync - delete old records
        //            if (FoundpublishContact != null && sync)
        //            {
        //                var personsInfoDelete = _appMarketplaceContactRepository.GetAll().
        //                    Include(e => e.EntityExtraData)
        //                .Where(x => x.IsProfileData
        //                       && x.AccountId == FoundpublishContact.Id
        //                       && x.TenantId == null
        //                       && x.EntityObjectTypeId == personEntityObjectTypeId).ToList();
        //                // First level of Persons
        //                foreach (var branchObj in personsInfoDelete)
        //                {
        //                    if (branchObj.EntityExtraData.Count() > 0)
        //                        _appEntityExtraDataRepository.RemoveRange(branchObj.EntityExtraData);
        //                    _appEntityRepository.Delete(e => e.Id == branchObj.Id);
        //                    _appMarketplaceContactRepository.Delete(e => e.Id == branchObj.Id);
        //                }
        //                await CurrentUnitOfWork.SaveChangesAsync();

        //                var branchInfoDelete = _appMarketplaceContactRepository.GetAll().
        //                   Include(e => e.ContactAddresses).ThenInclude(e => e.AddressFk)
        //               .Where(x => x.IsProfileData
        //                      && x.AccountId == FoundpublishContact.Id
        //                      && x.TenantId == null

        //                      && x.EntityObjectTypeId != personEntityObjectTypeId).ToList();
        //                // First level of branches
        //                foreach (var branchObj in branchInfoDelete)
        //                {
        //                    if (branchObj.ContactAddresses.Count() > 0)
        //                    {
        //                        foreach (var contactAddress in branchObj.ContactAddresses)
        //                        {
        //                            _appAddressRepository.Delete(e => e.Id == contactAddress.AddressId);
        //                            _appMarketplaceContactRepository.Delete(e => e.Id == contactAddress.Id);
        //                        }
        //                    }
        //                    _appEntityRepository.Delete(e => e.Id == branchObj.Id);
        //                    _appMarketplaceContactRepository.Delete(e => e.Id == branchObj.Id);
        //                }

        //                //delete main market place conatact
        //                if (FoundpublishContact.ContactAddresses.Count() > 0)
        //                {
        //                    foreach (var contactAddress in FoundpublishContact.ContactAddresses)
        //                    {
        //                        _appAddressRepository.Delete(e => e.Id == contactAddress.AddressId);
        //                        _appMarketplaceContactRepository.Delete(e => e.Id == contactAddress.Id);
        //                    }
        //                }
        //                _appEntityRepository.Delete(e => e.Id == FoundpublishContact.Id);
        //                _appMarketplaceContactRepository.Delete(e => e.Id == FoundpublishContact.Id);
        //            }
        //        }
        //        #endregion if sync remove old data


        //        return 0;
        //    }

        //}

        private async Task<long> SaveContact(AppMarketplaceContactDto input)
        {
            AppMarketplaceContact contact;
            if (input.Id != 0)
            {
                contact = await _appMarketplaceContactRepository.GetAll()
                    .FirstOrDefaultAsync(x => x.Id == input.Id);
            }
            else
            {
                contact = new AppMarketplaceContact();
            }


            var contactSavedId = contact.Id;
            ObjectMapper.Map(input, contact);

            if (contact.Id == 0)
            {
                contact = await _appMarketplaceContactRepository.InsertAsync(contact);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return contact.Id;

        }


        [AbpAuthorize(AppPermissions.Pages_Accounts_Publish)]
        private async Task<bool> PublishBranch(long branchId, long parentId, long personEntityObjectTypeId, long? mainAccountID, long newAccountID)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var input = await _appContactRepository.GetAll().AsNoTracking()
                    .Include(x => x.AppContactAddresses)
                    .ThenInclude(x => x.AddressFk).AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId
                    //x.IsProfileData == true
                    && x.Id == branchId);

                var foundEntity = await _appEntityRepository.GetAll().AsNoTracking()
                                   .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId
                                   && x.Id == input.EntityId);


                AppMarketplaceContact appMarketplaceContact = new AppMarketplaceContact();
                ObjectMapper.Map(input, appMarketplaceContact);
                appMarketplaceContact.Id = 0;

                appMarketplaceContact.IsProfileData = true;
                appMarketplaceContact.ObjectId = foundEntity.ObjectId;
                appMarketplaceContact.EntityObjectTypeId = foundEntity.EntityObjectTypeId;
                appMarketplaceContact.EntityObjectTypeCode = foundEntity.EntityObjectTypeCode;
                appMarketplaceContact.ParentId = parentId;
                appMarketplaceContact.Name = input.Name;
                appMarketplaceContact.Notes = foundEntity.Notes;
                appMarketplaceContact.TenantOwner = int.Parse(input.TenantId.ToString());
                appMarketplaceContact.TenantId = null;
                appMarketplaceContact.Code = input.SSIN;
                appMarketplaceContact.SSIN = input.SSIN;
                appMarketplaceContact.AccountId = newAccountID;
                appMarketplaceContact.SharingLevel = 1;
                foreach (var contactAddress in appMarketplaceContact.ContactAddresses)
                {
                    contactAddress.Id = 0;
                    contactAddress.AddressFk.Id = 0;
                }

                long newId = 0;
                { newId = await _appMarketplaceContactRepository.InsertAndGetIdAsync(appMarketplaceContact); }
                await CurrentUnitOfWork.SaveChangesAsync();

                //var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                /*var contactInfo = _appContactRepository.GetAll()
                .Where(x => x.IsProfileData
                           && x.AccountId == mainAccountID
                           && x.TenantId == AbpSession.TenantId
                           && x.ParentId == input.Id
                           && x.EntityFk.EntityObjectTypeId == personEntityObjectTypeId).ToList();

                foreach (var contactObj in contactInfo)
                {
                    await PublishMember(contactObj.Id, newId, personEntityObjectTypeId, mainAccountID, newAccountID);
                }*/

                //publish sub branches
                var branchInfo = _appContactRepository.GetAll()
                .Where(x => x.IsProfileData
                           && x.AccountId == mainAccountID
                           && x.TenantId == AbpSession.TenantId
                           && x.ParentId == input.Id
                           && x.EntityFk.EntityObjectTypeId != personEntityObjectTypeId).ToList();

                foreach (var branchObj in branchInfo)
                {
                    await PublishBranch(branchObj.Id, newId, personEntityObjectTypeId, mainAccountID, newAccountID);
                }

            }
            return true;
        }

        public async Task<bool> PublishMember(long contactId, long parentId, long personEntityObjectTypeId, long? mainAccountID, long newAccountID)
        {
            var input = await _appContactRepository.GetAll().AsNoTracking()
                .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId
                                       // && x.AccountId == mainAccountID
                                        && x.Id == contactId );//&& x.IsProfileData == true
            var foundEntity = await _appEntityRepository.GetAll().AsNoTracking()
                                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                .Include(x => x.EntityExtraData)
                                .AsNoTracking()
                                .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId
                                && x.Id == input.EntityId);

            AppMarketplaceContact appMarketplaceContact = new AppMarketplaceContact();
            ObjectMapper.Map(input, appMarketplaceContact);
            appMarketplaceContact.Id = 0;
            appMarketplaceContact.EntityExtraData = foundEntity.EntityExtraData;
            appMarketplaceContact.IsProfileData = true;
            appMarketplaceContact.ObjectId = foundEntity.ObjectId;
            appMarketplaceContact.EntityObjectTypeId = foundEntity.EntityObjectTypeId;
            appMarketplaceContact.EntityObjectTypeCode = foundEntity.EntityObjectTypeCode;
            appMarketplaceContact.ParentId = parentId;
            appMarketplaceContact.Name = input.Name;
            appMarketplaceContact.Notes = foundEntity.Notes;
            appMarketplaceContact.TenantOwner =int.Parse(input.TenantId.ToString());
            appMarketplaceContact.TenantId = null;
            appMarketplaceContact.Code = input.SSIN;
            appMarketplaceContact.SSIN = input.SSIN;
            appMarketplaceContact.AccountId = newAccountID;
            appMarketplaceContact.SharingLevel = 1;
            appMarketplaceContact.ParentFk = null;
            foreach (var contactAddress in appMarketplaceContact.ContactAddresses)
            {
                contactAddress.Id = 0;
                contactAddress.AddressFk.Id = 0;
            }


            if (appMarketplaceContact.EntityAttachments != null)
            {
                ObjectMapper.Map<IList<AppEntityAttachmentDto>>(appMarketplaceContact.EntityAttachments);
            }
            //Extra Attributes[Start]
            if (appMarketplaceContact.EntityExtraData != null)
            {
                foreach (var extraAtt in appMarketplaceContact.EntityExtraData)
                {
                    //AppEntityExtraDataDto appEntityExtraDto = new AppEntityExtraDataDto();
                    //ObjectMapper.Map(extraAtt, appEntityExtraDto);
                    //if (extraAtt.AttributeValueId == null) extraAtt.AttributeValueId = 0;
                    extraAtt.EntityObjectTypeId = personEntityObjectTypeId;
                    extraAtt.Id = 0;
                    switch (extraAtt.AttributeId)
                    {
                        case 708: //Language ID
                            if (extraAtt.AttributeValue == null || extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.LanguageId = null;
                                appMarketplaceContact.LanguageCode = null;
                            }
                            break;
                        case 709: //Email Address
                            if (extraAtt.AttributeValue == null || extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.EMailAddress = null;
                            }
                            break;
                        case 710: //Phone#1
                            if (extraAtt.AttributeValue == null || extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone1Ext = null;
                                appMarketplaceContact.Phone1Number = null;
                                appMarketplaceContact.Phone1TypeId = null;
                                appMarketplaceContact.Phone1TypeName = null;
                            }
                            break;

                        case 711://Phone#2
                            if (extraAtt.AttributeValue == null || extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone2Ext = null;
                                appMarketplaceContact.Phone2Number = null;
                                appMarketplaceContact.Phone2TypeId = null;
                                appMarketplaceContact.Phone2TypeName = null;
                            }
                            break;

                        case 712://Phone#3
                            if (extraAtt.AttributeValue == null || extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone3Ext = null;
                                appMarketplaceContact.Phone3Number = null;
                                appMarketplaceContact.Phone3TypeId = null;
                                appMarketplaceContact.Phone3TypeName = null;
                            }
                            break;
                        case 713:  // Join DATE 
                            if (extraAtt.AttributeValue == null || extraAtt.AttributeValue.ToLower() == "false")
                            {
                                // entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 713));
                                if (appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707)!= null)
                                appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue = null;
                            }

                            break;


                        case 714: //UserName
                            if (extraAtt.AttributeValue == null || extraAtt.AttributeValue.ToLower() == "false")
                            {
                                //entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 714));
                                if (appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703) != null)
                                    appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703).AttributeValue = null;
                            }
                            //entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703));
                            break;

                    }
                }
            }
            while (appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeValue == null) != null)
            {
                appMarketplaceContact.EntityExtraData.Remove(appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeValue == null));
            }
            //Extra Attributes[End]
            long newId = 0;
            {
                var marketplaceRecord = await _appMarketplaceContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(z=>z.SSIN == appMarketplaceContact.SSIN &&
                z.Code== appMarketplaceContact.Code);
                if (marketplaceRecord==null)
                    newId = await _appMarketplaceContactRepository.InsertAndGetIdAsync(appMarketplaceContact);
                else
                {
                    try
                    {
                        appMarketplaceContact.Id = marketplaceRecord.Id;
                        await _appMarketplaceContactRepository.UpdateAsync(appMarketplaceContact);
                    }
                    catch { }
                }
            }
            await CurrentUnitOfWork.SaveChangesAsync();

            return (appMarketplaceContact.Id != 0);
        }

    }

}