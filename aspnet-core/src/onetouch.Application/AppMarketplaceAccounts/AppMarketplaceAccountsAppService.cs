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
using onetouch.AppMarketplaceContacts.Dtos;

using onetouch.Configuration;
using onetouch.SystemObjects;
using System.Data;
using onetouch.Authorization.Users;
using onetouch.SycIdentifierDefinitions;
using onetouch.Notifications;
using onetouch.Storage;
using onetouch.MultiTenancy;

using onetouch.AppMarketplaceAccounts;
using onetouch.Accounts.Dtos;
using onetouch.Accounts;
using onetouch.AppContacts;


namespace onetouch.MarketplaceAccounts
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
        private readonly UserManager _userManager;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        private readonly IAppNotifier _appNotifier;
        private readonly IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> _appMarketplaceAccountsPriceLevelsRepo;
        private const int MaxProfilPictureBytes = 5242880;
        private readonly IBinaryObjectManager _binaryObjectManager;

        public MarketplaceAccountsAppService(IRepository<AppMarketplaceContact, long> appMarketplaceContactRepository
            , IRepository<AppEntity, long> appEntityRepository
            , Helper helper, IRepository<AppMarketplaceAddress, long> appAddressRepository
            , IRepository<AppMarketplaceContactAddress, long> appContactAddressRepository
            , IEmailSender emailSender
            , IAppEntitiesAppService appEntitiesAppService
            , IAppConfigurationAccessor appConfigurationAccessor
           
            , ISycEntityObjectClassificationsAppService sycEntityObjectClassificationsAppService
            , ISycEntityObjectCategoriesAppService sycEntityObjectCategoriesAppService
            , ISycAttachmentCategoriesAppService sSycAttachmentCategoriesAppService
            , IRepository<AppEntityExtraData, long> appEntityExtraDataRepository, UserManager userManager, IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> appMarketplaceAccountsPriceLevelsRepo
              , SycIdentifierDefinitionsAppService sycIdentifierDefinitionsAppService, IAppNotifier appNotifier, IBinaryObjectManager binaryObjectManager
              , TenantManager tenantManager
              , IAccountsAppService iAccountsAppService
            , ICreateMarketplaceAccount iCreateMarketplaceAccount
              , IRepository<AppContact, long> appContactRepository)

        {
            _tenantManager = tenantManager;
            _appContactRepository = appContactRepository;
            _iAccountsAppService = iAccountsAppService;
            _iCreateMarketplaceAccount = iCreateMarketplaceAccount;
            _appMarketplaceContactRepository = appMarketplaceContactRepository;
           
            _helper = helper;
        
            
            _userManager = userManager;
            _iAppSycIdentifierDefinitionsService = sycIdentifierDefinitionsAppService;
          
            _appNotifier = appNotifier;
           
            _binaryObjectManager = binaryObjectManager;
            _appMarketplaceAccountsPriceLevelsRepo = appMarketplaceAccountsPriceLevelsRepo;
           

        }

        public async Task<PagedResultDto<GetMarketplaceAccountForViewDto>> GetAll(GetAllAccountsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                try
                {
                    long cancelledStatusId = await _helper.SystemTables.GetEntityObjectStatusContactCancelled();

                    var filteredAccounts = _appMarketplaceContactRepository.GetAll()
                            .Include(e => e.ContactAddresses).ThenInclude(e => e.AddressFk).ThenInclude(e => e.CountryFk)
                            .Include(e => e.EntityClassifications)
                            .Include(e => e.EntityCategories)
                            .Include(e => e.EntityAttachments).ThenInclude(e => e.AttachmentFk)
                           // .WhereIf(!string.IsNullOrEmpty(input.Filter),
                           //     x => x.Name.Contains(input.Filter) || x.TradeName.Contains(input.Filter))

                           // .WhereIf(input.FilterType <= 1 && input.FilterType != 6,
                           //     x => (x.TenantId == null && !x.IsProfileData && x.ParentId == null && x.EntityObjectStatusId != cancelledStatusId))
                           // .WhereIf(input.FilterType == 2 && input.FilterType != 6,
                           //     x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN != null)
                           //     && (_appMarketplaceContactRepository.GetAll().Count(c => c.TenantId == null && c.SSIN == x.SSIN) > 0))
                           // .WhereIf(input.FilterType >= 3 && input.FilterType != 6,
                           //     x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN == null))
                           //  .WhereIf(input.FilterType == 6,
                           //     x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN == null)
                           //     || (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN != null)
                           //     && (_appMarketplaceContactRepository.GetAll().Count(c => c.TenantId == null && c.SSIN == x.SSIN) > 0))

                           // .WhereIf(!string.IsNullOrEmpty(input.Name),
                           //     x => x.Name.Contains(input.Name) || x.TradeName.Contains(input.Name))
                           // .WhereIf(input.Status != null && input.Status.Count(x => x == 1) > 0,
                           //     x => _appMarketplaceContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.SSIN == x.SSIN) > 0)

                           // .WhereIf(input.Status != null && input.Status.Count(x => x == 2) > 0,
                           //     x => (_appMarketplaceContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.SSIN == x.SSIN) == 0)
                           //     )
                           // .WhereIf(input.Classifications != null && input.Classifications.Count(x => x > 0) > 0,
                           //     x => _appEntityRepository.GetAll().Include(ec => ec.EntityClassifications).FirstOrDefault(e => e.Id == x.Id).EntityClassifications.Any(a => input.Classifications.Contains(a.EntityObjectClassificationId)))
                           // .WhereIf(input.Categories != null && input.Categories.Count(x => x > 0) > 0,
                           //     x => _appEntityRepository.GetAll().Include(ec => ec.EntityCategories).FirstOrDefault(e => e.Id == x.Id).EntityCategories.Any(a => input.Categories.Contains(a.EntityObjectCategoryId)))

                           // .WhereIf(!string.IsNullOrEmpty(input.City),
                           //     x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.ContactAddresses.Any(a => a.AddressFk.City.Contains(input.City))) > 0)
                           // .WhereIf(!string.IsNullOrEmpty(input.Address),
                           //     x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.ContactAddresses.Any(a => a.AddressFk.AddressLine1.Contains(input.Address) || a.AddressFk.AddressLine2.Contains(input.Address))) > 0)
                           // .WhereIf(!string.IsNullOrEmpty(input.State),
                           //     x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.ContactAddresses.Any(a => a.AddressFk.State.Contains(input.State))) > 0)
                           // .WhereIf(!string.IsNullOrEmpty(input.Postal),
                           //     x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.ContactAddresses.Any(a => a.AddressFk.PostalCode.Contains(input.Postal))) > 0)
                           // .WhereIf(input.Countries != null && input.Countries.Count(x => x > 0) > 0,
                           //     x => _appMarketplaceContactRepository.GetAll().Include(ca => ca.ContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.ContactAddresses.Any(a => input.Countries.Contains(a.AddressFk.CountryId))) > 0)

                           // .WhereIf(input.Languages != null && input.Languages.Count(x => x > 0) > 0,
                           //     x => _appMarketplaceContactRepository.GetAll().Count(c => c.Id == x.Id && c.LanguageId != null && input.Languages.Contains((long)c.LanguageId)) > 0)

                           // .WhereIf(input.Curruncies != null && input.Curruncies.Count(x => x > 0) > 0,
                           //     x => _appMarketplaceContactRepository.GetAll().Count(c => c.Id == x.Id && c.CurrencyId != null && input.Curruncies.Contains((long)c.CurrencyId)) > 0)
                           // .WhereIf(!string.IsNullOrEmpty(input.SSIN), x => x.SSIN == input.SSIN)
                           // .WhereIf(input.AccountTypeId != null && input.AccountTypeId > 0, x => x.EntityObjectTypeId == input.AccountTypeId)
                           // .WhereIf(input.AccountType != null && !string.IsNullOrEmpty(input.AccountType), x => x.EntityObjectTypeCode == input.AccountType)
                           // .WhereIf(input.AccountTypes != null && input.AccountTypes.Count(x => x > 0) > 0, x =>
                           //input.AccountTypes.Length > 0 && input.AccountTypes.Contains(x.EntityObjectTypeId))
                           .Where(e => (e.IsProfileData && e.ParentId == null) && ((e.IsHidden != true) ||
                           (_appContactRepository.GetAll().Where(x => x.TenantId == AbpSession.TenantId && x.SSIN == e.SSIN).Count() > 0)));

                    var pagedAndFilteredAccounts = filteredAccounts
                    .OrderBy(input.Sorting ?? "name asc")
                    .PageBy(input);

                    var logoCategory = await _helper.SystemTables.GetAttachmentCategoryLogoId();

                    var _accounts = from o in pagedAndFilteredAccounts
                                    join o1 in _appContactRepository.GetAll() on o.SSIN equals o1.SSIN into j1
                                    from s1 in j1.DefaultIfEmpty()
                                    where s1.TenantId == AbpSession.TenantId
                                    //join o1 in _appEntityRepository.GetAll() on o.AppContactAddresses.FirstOrDefault().AddressFk.CountryId equals o1.Id into j1
                                    //from s1 in j1.DefaultIfEmpty()

                                    select new GetMarketplaceAccountForViewDto()
                                    {
                                        //AvaliableConnectionName = GetAction(o.EntityObjectTypeCode),
                                        AvaliableConnectionName = "Follow",
                                        //ConnectionName = s1 != null && !s1.IsDeleted && s1.Id > 0 ? "Follow" : "",
                                        ConnectionName = "Follow",
                                        Account = new AccountDto
                                        {
                                            AccountTypeString = o.EntityObjectTypeCode,
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
                                            Categories = o.EntityCategories.Select(x => x.EntityObjectCategoryFk.Name).Take(5).ToArray()
                                            //,
                                            //PartnerId = o.SSIN
                                        },
                                        //AppEntityName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
                                    };

                    var accountsList = await _accounts.ToListAsync();
                    foreach (var account in accountsList)
                    {
                        account.AvaliableConnectionName = GetAction(account.Account.AccountType);
                        account.ConnectionName = account.ConnectionName == "Follow" ? GetAction(account.Account.AccountType) : "";
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
                }
                catch (Exception ex)
                {

                    throw ex;
                }

            }
        }

        public string GetAction(string accountTypeCode)
        {

            int currentTenant = AbpSession.TenantId == null ? -1 : ((int)AbpSession.TenantId);
            var tenant = TenantManager.GetById(((int)currentTenant)).Edition;
            var currentTenantEdition = tenant == null ? "Personal" : tenant.Name;
            currentTenantEdition = currentTenantEdition == null ? "" : currentTenantEdition;
            string action = "";
            if (!string.IsNullOrEmpty(accountTypeCode))
            {
                if (currentTenantEdition.ToUpper() == "PERSONAL" && accountTypeCode.ToUpper() == "PERSONAL") { action = "MPActionCONNECT"; }
                if (currentTenantEdition.ToUpper() == "PERSONAL" && accountTypeCode.ToUpper() == "BUSINESS") { action = "MPActionFOLLOW"; }
                if (currentTenantEdition.ToUpper() == "PERSONAL" && accountTypeCode.ToUpper() == "GROUP") { action = "MPActionJOIN"; }

                if (currentTenantEdition.ToUpper() == "BUSINESS" && accountTypeCode.ToUpper() == "PERSONAL") { action = " MPActionEMPLOY"; }
                if (currentTenantEdition.ToUpper() == "BUSINESS" && accountTypeCode.ToUpper() == "BUSINESS") { action = "MPActionCONNECT"; }
                if (currentTenantEdition.ToUpper() == "BUSINESS" && accountTypeCode.ToUpper() == "GROUP") { action = "MPActionJOIN"; }

                if (currentTenantEdition.ToUpper() == "GROUP" && accountTypeCode.ToUpper() == "PERSONAL") { action = "MPActionINVITE"; }
                if (currentTenantEdition.ToUpper() == "GROUP" && accountTypeCode.ToUpper() == "BUSINESS") { action = "MPActionINVITE"; }
                if (currentTenantEdition.ToUpper() == "GROUP" && accountTypeCode.ToUpper() == "GROUP") { action = ""; }


            }



            return action;
        }


    }

    public class CreateMarketplaceAccount : onetouchAppServiceBase, ICreateMarketplaceAccount
    {
        private readonly IRepository<AppMarketplaceContactAddress, long> _appContactAddressRepository;
        private readonly IRepository<AppMarketplaceContact, long> _appMarketplaceContactRepository;
        private readonly IRepository<AppMarketplaceAddress, long> _appAddressRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;

        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly Helper _helper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        public CreateMarketplaceAccount(IRepository<AppMarketplaceContact
            , long> appMarketplaceContactRepository
            , Helper helper
            , IRepository<AppEntity, long> appEntityRepository
            , IAppEntitiesAppService appEntitiesAppService
            , IRepository<AppMarketplaceContactAddress, long> appContactAddressRepository
            , IRepository<AppMarketplaceAddress, long> appAddressRepository
            , IRepository<AppContact, long> appContactRepository)
        {
            _appMarketplaceContactRepository = appMarketplaceContactRepository;
            _helper = helper;
            _appContactRepository = appContactRepository;
            _appEntityRepository = appEntityRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _appContactAddressRepository = appContactAddressRepository;
            _appAddressRepository = appAddressRepository;
        }

        public async Task<bool> HideAccount(string SSIN)
        {
            try
            {

                var ret = await _appMarketplaceContactRepository.FirstOrDefaultAsync(e => e.TenantId == null && e.SSIN == SSIN);
                ret.IsHidden = true;
                return true;
            }
            catch (Exception ex)
            { return false; }
        }

        public async Task<long> CreateOrEditMarketplaceAccount(CreateOrEditMarketplaceAccountInfoDto input, bool sync)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var mainAccountID = input.Id;
                var foundEntity = _appEntityRepository.GetAll().FirstOrDefault(e => e.Id == input.EntityId);
                AppMarketplaceContact appMarketplaceContact = new AppMarketplaceContact();
                if (sync)
                {
                    appMarketplaceContact = await _appMarketplaceContactRepository.GetAll()
                            .AsNoTracking().Include(x => x.ContactAddresses)
                            .FirstOrDefaultAsync(x => x.TenantId == null
                            && x.IsProfileData == true
                            && x.OwnerId == AbpSession.TenantId
                            && x.SSIN == input.SSIN);
                    //should delete market place contact and its' children
                }

                ObjectMapper.Map(input, appMarketplaceContact);
                appMarketplaceContact.Id = 0;
                 
                appMarketplaceContact.IsProfileData = true;
                appMarketplaceContact.ObjectId = foundEntity.ObjectId;
                appMarketplaceContact.EntityObjectTypeId = foundEntity.EntityObjectTypeId;
                appMarketplaceContact.EntityObjectTypeCode = foundEntity.EntityObjectTypeCode;

                appMarketplaceContact.Name = input.Name;
                appMarketplaceContact.Notes = input.Notes;
                appMarketplaceContact.OwnerId = input.TenantId;
                appMarketplaceContact.TenantId = null;
                appMarketplaceContact.Code = input.SSIN;
                appMarketplaceContact.SSIN = input.SSIN;


                foreach (var contactAddress in appMarketplaceContact.ContactAddresses)
                { 
                    contactAddress.Id = 0;
                    contactAddress.ContactId = 0;
                    contactAddress.AddressId = 0;

                    contactAddress.AddressFk.Id = 0;
                    contactAddress.AddressFk.AccountId = 0;
                }

                long newId = 0;
                { newId = await _appMarketplaceContactRepository.InsertAndGetIdAsync(appMarketplaceContact); }
                await CurrentUnitOfWork.SaveChangesAsync();


                //HIA - share Account related branches [Start]
                var personEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var branchInfo = _appContactRepository.GetAll()
                    .Where(x => x.IsProfileData
                           && x.AccountId == mainAccountID
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
                var contactInfo = _appContactRepository.GetAll()
                    .Where(x => x.IsProfileData
                           && x.AccountId == mainAccountID
                           && x.TenantId == AbpSession.TenantId
                           && x.ParentId == mainAccountID
                           && x.EntityFk.EntityObjectTypeId == personEntityObjectTypeId).ToList();
                foreach (var contactObj in contactInfo)
                {    
                    await PublishMember(contactObj.Id, newId, personEntityObjectTypeId, mainAccountID, newId);
                }
                return newId;
            }

        }

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
        private async Task<bool> PublishBranch(long branchId, long parentId, long personEntityObjectTypeId, long? mainAccountID, long newAccountID )
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var input = await _appContactRepository.GetAll().AsNoTracking()
                    .Include(x => x.AppContactAddresses)
                    .ThenInclude(x => x.AddressFk).AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId &&
                    x.IsProfileData == true && x.Id == branchId);

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
                appMarketplaceContact.OwnerId = input.TenantId;
                appMarketplaceContact.TenantId = null;
                appMarketplaceContact.Code = input.SSIN;
                appMarketplaceContact.SSIN = input.SSIN;
                appMarketplaceContact.AccountId = newAccountID;

                foreach (var contactAddress in appMarketplaceContact.ContactAddresses)
                {
                    contactAddress.Id = 0;
                    contactAddress.AddressFk.Id = 0;
                }

                long newId = 0;
                { newId = await _appMarketplaceContactRepository.InsertAndGetIdAsync(appMarketplaceContact); }
                await CurrentUnitOfWork.SaveChangesAsync();

                //var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var contactInfo = _appContactRepository.GetAll()
                .Where(x => x.IsProfileData
                           && x.AccountId == mainAccountID
                           && x.TenantId == AbpSession.TenantId
                           && x.ParentId == input.Id
                           && x.EntityFk.EntityObjectTypeId == personEntityObjectTypeId).ToList();
                 
                foreach (var contactObj in contactInfo)
                {
                    await PublishMember(contactObj.Id, newId, personEntityObjectTypeId, mainAccountID, newAccountID);
                }

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

        private async Task<bool> PublishMember(long contactId, long parentId, long personEntityObjectTypeId, long? mainAccountID, long newAccountID)
        {
            var input = await _appContactRepository.GetAll().AsNoTracking()
                .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId 
                                        && x.AccountId == mainAccountID
                                        && x.Id == contactId && x.IsProfileData == true);
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
            appMarketplaceContact.OwnerId = input.TenantId;
            appMarketplaceContact.TenantId = null;
            appMarketplaceContact.Code = input.SSIN;
            appMarketplaceContact.SSIN = input.SSIN;
            appMarketplaceContact.AccountId = newAccountID;

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
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.LanguageId = null;
                                appMarketplaceContact.LanguageCode = null;
                            }
                            break;
                        case 709: //Email Address
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.EMailAddress = null;
                            }
                            break;
                        case 710: //Phone#1
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone1Ext = null;
                                appMarketplaceContact.Phone1Number = null;
                                appMarketplaceContact.Phone1TypeId = null;
                                appMarketplaceContact.Phone1TypeName = null;
                            }
                            break;

                        case 711://Phone#2
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone2Ext = null;
                                appMarketplaceContact.Phone2Number = null;
                                appMarketplaceContact.Phone2TypeId = null;
                                appMarketplaceContact.Phone2TypeName = null;
                            }
                            break;

                        case 712://Phone#3
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                appMarketplaceContact.Phone3Ext = null;
                                appMarketplaceContact.Phone3Number = null;
                                appMarketplaceContact.Phone3TypeId = null;
                                appMarketplaceContact.Phone3TypeName = null;
                            }
                            break;
                        case 713:  // Join DATE 
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                // entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 713));
                                appMarketplaceContact.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue = null;
                            }

                            break;


                        case 714: //UserName
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                //entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 714));
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
            { newId = await _appMarketplaceContactRepository.InsertAndGetIdAsync(appMarketplaceContact); }
            await CurrentUnitOfWork.SaveChangesAsync();

            return (appMarketplaceContact.Id != 0);
        }

    }

}