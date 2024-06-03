using onetouch.AppEntities;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.AppMarketplaceContacts;
using onetouch.Helpers;
using Abp.Domain.Uow;
using Abp.Net.Mail;
using System.Net.Mail;
using onetouch.Mail;
using onetouch.AppEntities.Dtos;
using onetouch.AppMarketplaceContacts.Dtos;
using Abp.Collections.Extensions;
using Abp.UI;
using onetouch.AccountInfos.Dtos;
using onetouch.Common;
using Stripe.Checkout;
using AuthorizeNet.Api.Contracts.V1;
using AuthorizeNet.Api.Controllers.Bases;
using AuthorizeNet.Api.Controllers;
using Abp.UI;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;
using onetouch.SystemObjects;
using onetouch.SystemObjects.Dtos;
using System.Data;
using System.IO;
//using OfficeOpenXml;
using Bytescout.Spreadsheet;
using onetouch.AppItems.Dtos;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using onetouch.Authorization.Users;
using onetouch.SycIdentifierDefinitions;
using onetouch.Globals.Dtos;
using System.ComponentModel;
using System.Dynamic;
using onetouch.Globals;
using onetouch.Notifications;
using onetouch.Storage;
using onetouch.Sessions.Dto;
using AutoMapper;
using Stripe;
using Abp.Runtime.Session;
using onetouch.MultiTenancy;
using onetouch.AppMarketplaceAccountsPriceLevels;
using System.Diagnostics;
using Abp.EntityFrameworkCore.Uow;
using onetouch.EntityFrameworkCore;
using Twilio.Rest.Trunking.V1;
using NUglify.Helpers;
using onetouch.AppMarketplaceAccounts;
using onetouch.AppMarketplaceContacts;
using onetouch.AppMarketplaceContacts.Dtos;
using onetouch.Accounts.Dtos;
using onetouch.Accounts;
using onetouch.AppContacts;
using onetouch.AppContacts.Dtos;

namespace onetouch.MarketplaceAccounts
{
    [AbpAuthorize(AppPermissions.Pages_Accounts)]
    public class MarketplaceAccountsAppService : onetouchAppServiceBase, IMarketplaceAccountsAppService
    {
        private readonly TenantManager _tenantManager;
        private readonly IAccountsAppService _iAccountsAppService;
        private readonly ICreateMarketplaceAccount _iCreateMarketplaceAccount;
        private readonly IRepository<AppMarketplaceContact, long> _appContactRepository;

        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppMarketplaceAddress, long> _appAddressRepository;
        private readonly IRepository<AppMarketplaceContactAddress, long> _appContactAddressRepository;
        private readonly IEmailSender _emailSender;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IConfigurationRoot _appConfiguration;
       // private readonly IRepository<AppMarketplaceContactPaymentMethod, long> _appContactPaymentMethodRepository;
        private readonly ISycEntityObjectClassificationsAppService _sycEntityObjectClassificationsAppService;
        private readonly ISycEntityObjectCategoriesAppService _sycEntityObjectCategoriesAppService;
        private readonly ISycAttachmentCategoriesAppService _sSycAttachmentCategoriesAppService;
        private readonly Helper _helper;
        private readonly UserManager _userManager;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
        private readonly IAppNotifier _appNotifier;
        private readonly IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> _appMarketplaceAccountsPriceLevelsRepo;
        //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]
        //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[Start]
        private const int MaxProfilPictureBytes = 5242880;
        private readonly IBinaryObjectManager _binaryObjectManager;
        //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[End]
        private enum CardType
        {
            MasterCard, Visa, AmericanExpress, Discover, JCB
        };

        public MarketplaceAccountsAppService(IRepository<AppMarketplaceContact, long> appMarketplaceContactRepository
            , IRepository<AppEntity, long> appEntityRepository
            , Helper helper, IRepository<AppMarketplaceAddress, long> appAddressRepository
            , IRepository<AppMarketplaceContactAddress, long> appContactAddressRepository
            , IEmailSender emailSender
            , IAppEntitiesAppService appEntitiesAppService
            , IAppConfigurationAccessor appConfigurationAccessor
            //, IRepository<AppMarketplaceContactPaymentMethod, long> appContactPaymentMethodRepository
            , ISycEntityObjectClassificationsAppService sycEntityObjectClassificationsAppService
            , ISycEntityObjectCategoriesAppService sycEntityObjectCategoriesAppService
            , ISycAttachmentCategoriesAppService sSycAttachmentCategoriesAppService
            , IRepository<AppEntityExtraData, long> appEntityExtraDataRepository, UserManager userManager, IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> appMarketplaceAccountsPriceLevelsRepo,
              SycIdentifierDefinitionsAppService sycIdentifierDefinitionsAppService, IAppNotifier appNotifier, IBinaryObjectManager binaryObjectManager,
              TenantManager tenantManager,
              IAccountsAppService iAccountsAppService
            , ICreateMarketplaceAccount iCreateMarketplaceAccount)
        {
            _tenantManager = tenantManager;
            _iAccountsAppService = iAccountsAppService;
            _iCreateMarketplaceAccount = iCreateMarketplaceAccount;
            _appContactRepository = appMarketplaceContactRepository;
            _appEntityRepository = appEntityRepository;
            _appAddressRepository = appAddressRepository;
            _appContactAddressRepository = appContactAddressRepository;
            _helper = helper;
            _emailSender = emailSender;
            _appEntitiesAppService = appEntitiesAppService;
            _appConfiguration = appConfigurationAccessor.Configuration;
           // _appContactPaymentMethodRepository = appContactPaymentMethodRepository;
            _sycEntityObjectClassificationsAppService = sycEntityObjectClassificationsAppService;
            _sycEntityObjectCategoriesAppService = sycEntityObjectCategoriesAppService;
            _sSycAttachmentCategoriesAppService = sSycAttachmentCategoriesAppService;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            _userManager = userManager;
            _iAppSycIdentifierDefinitionsService = sycIdentifierDefinitionsAppService;
            //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
            _appNotifier = appNotifier;
            //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]
            //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[Start]
            _binaryObjectManager = binaryObjectManager;
            _appMarketplaceAccountsPriceLevelsRepo = appMarketplaceAccountsPriceLevelsRepo;
            //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[End]

        }

        public async Task<PagedResultDto<GetMarketplaceAccountForViewDto>> GetAll(GetAllAccountsInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                try
                {


                    //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[Start]
                    long cancelledStatusId = await _helper.SystemTables.GetEntityObjectStatusContactCancelled();
                    //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[End]
                    //var currPublishContact = _appContactRepository.GetAll().Include(x => x.PartnerFkList).FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.IsProfileData);
                    var filteredAccounts = _appContactRepository.GetAll()
                            .Include(e => e.AppContactAddresses).ThenInclude(a => a.AddressFk).ThenInclude(a => a.CountryFk)
                            .Include(encl => encl.EntityClassifications)
                            .Include(enca => enca.EntityCategories)
                            .Include(ena => ena.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                            /*.WhereIf(currPublishContact != null,
                                x => (x.SSIN != currPublishContact.Id))*///not current profile

                            .WhereIf(input.FilterType < 3 && input.FilterType != 6 && input.FilterType != 2,//if filtertype != manual then filter all published acounts only
                                x => (x.TenantId == null && !x.IsProfileData && x.ParentId == null))

                            .WhereIf(!string.IsNullOrEmpty(input.Filter),
                                x => x.Name.Contains(input.Filter) || x.TradeName.Contains(input.Filter))

                            .WhereIf(input.FilterType <= 1 && input.FilterType != 6,
                                x => (x.TenantId == null && !x.IsProfileData && x.ParentId == null && x.EntityObjectStatusId != cancelledStatusId))
                            .WhereIf(input.FilterType == 2 && input.FilterType != 6,
                                x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN!= null)
                                && (_appContactRepository.GetAll().Count(c => c.TenantId == null && c.SSIN == x.SSIN) > 0))
                            .WhereIf(input.FilterType >= 3 && input.FilterType != 6,
                                x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN == null))
                             .WhereIf(input.FilterType == 6,
                                x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN == null)
                                || (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.SSIN == null && x.SSIN != null)
                                && (_appContactRepository.GetAll().Count(c => c.TenantId == null && c.SSIN == x.SSIN) > 0))

                            .WhereIf(!string.IsNullOrEmpty(input.Name),
                                x => x.Name.Contains(input.Name) || x.TradeName.Contains(input.Name))
                            .WhereIf(input.Status != null && input.Status.Count(x => x == 1) > 0,
                                x => _appContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.SSIN == x.SSIN) > 0)

                            .WhereIf(input.Status != null && input.Status.Count(x => x == 2) > 0,
                                x => (_appContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.SSIN == x.SSIN) == 0)
                                )
                            .WhereIf(input.Classifications != null && input.Classifications.Count(x => x > 0) > 0,
                                x => _appEntityRepository.GetAll().Include(ec => ec.EntityClassifications).FirstOrDefault(e => e.Id == x.Id).EntityClassifications.Any(a => input.Classifications.Contains(a.EntityObjectClassificationId)))
                            .WhereIf(input.Categories != null && input.Categories.Count(x => x > 0) > 0,
                                x => _appEntityRepository.GetAll().Include(ec => ec.EntityCategories).FirstOrDefault(e => e.Id == x.Id).EntityCategories.Any(a => input.Categories.Contains(a.EntityObjectCategoryId)))

                            .WhereIf(!string.IsNullOrEmpty(input.City),
                                x => _appContactRepository.GetAll().Include(ca => ca.AppContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.AppContactAddresses.Any(a => a.AddressFk.City.Contains(input.City))) > 0)
                            .WhereIf(!string.IsNullOrEmpty(input.Address),
                                x => _appContactRepository.GetAll().Include(ca => ca.AppContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.AppContactAddresses.Any(a => a.AddressFk.AddressLine1.Contains(input.Address) || a.AddressFk.AddressLine2.Contains(input.Address))) > 0)
                            .WhereIf(!string.IsNullOrEmpty(input.State),
                                x => _appContactRepository.GetAll().Include(ca => ca.AppContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.AppContactAddresses.Any(a => a.AddressFk.State.Contains(input.State))) > 0)
                            .WhereIf(!string.IsNullOrEmpty(input.Postal),
                                x => _appContactRepository.GetAll().Include(ca => ca.AppContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.AppContactAddresses.Any(a => a.AddressFk.PostalCode.Contains(input.Postal))) > 0)
                            .WhereIf(input.Countries != null && input.Countries.Count(x => x > 0) > 0,
                                x => _appContactRepository.GetAll().Include(ca => ca.AppContactAddresses).ThenInclude(e => e.AddressFk).Count(c => c.Id == x.Id && c.AppContactAddresses.Any(a => input.Countries.Contains(a.AddressFk.CountryId))) > 0)

                            .WhereIf(input.Languages != null && input.Languages.Count(x => x > 0) > 0,
                                x => _appContactRepository.GetAll().Count(c => c.Id == x.Id && c.LanguageId != null && input.Languages.Contains((long)c.LanguageId)) > 0)

                            .WhereIf(input.Curruncies != null && input.Curruncies.Count(x => x > 0) > 0,
                                x => _appContactRepository.GetAll().Count(c => c.Id == x.Id && c.CurrencyId != null && input.Curruncies.Contains((long)c.CurrencyId)) > 0)
                            .WhereIf(!string.IsNullOrEmpty(input.SSIN), x => x.SSIN == input.SSIN)
                            .WhereIf(input.AccountTypeId != null && input.AccountTypeId > 0, x => x.EntityObjectTypeId == input.AccountTypeId)
                            .WhereIf(input.AccountType != null && !string.IsNullOrEmpty(input.AccountType), x => x.EntityObjectTypeCode == input.AccountType)
                            .WhereIf(input.AccountTypes != null && input.AccountTypes.Count(x => x > 0) > 0, x =>
                           input.AccountTypes.Length > 0 && input.AccountTypes.Contains(x.EntityObjectTypeId));

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
                                        AvaliableConnectionName = GetAction(o.EntityObjectTypeCode),
                                        ConnectionName = s1!=null && !s1.IsDeleted && s1.Id>0? GetAction(o.EntityObjectTypeCode) : "",
                                        Account = new AccountDto
                                        {
                                            AccountTypeString = o.EntityObjectTypeCode,
                                            AccountTypeId = o.EntityObjectTypeId,
                                            AccountType = o.EntityObjectTypeCode,
                                            SSIN = o.SSIN,
                                            //PriceLevel = o.PriceLevel,
                                            PriceLevel = "",
                                            Name = o.Name,
                                            City = o.AppContactAddresses.FirstOrDefault().AddressFk.City,
                                            State = o.AppContactAddresses.FirstOrDefault().AddressFk.State,
                                            ZipCode = o.AppContactAddresses.FirstOrDefault().AddressFk.PostalCode,
                                            AddressLine1 = o.AppContactAddresses.FirstOrDefault().AddressFk.AddressLine1,
                                            CountryName = o.AppContactAddresses.FirstOrDefault().AddressFk.CountryFk.Name,
                                            Status = input.FilterType != 1 ? (_appContactRepository.GetAll().Count(x => x.TenantId == null && x.SSIN == o.SSIN) > 0 || (o.TenantId != null && o.ParentId == null && o.SSIN == null)) :
                                            (_appContactRepository.GetAll().Count(x => x.TenantId == AbpSession.TenantId && x.SSIN == o.SSIN) > 0 || (o.TenantId != null && o.ParentId == null && o.SSIN == null)),
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
            var currentTenantEdition = TenantManager.GetById(((int)currentTenant)).Edition.Name;
            currentTenantEdition = currentTenantEdition == null ? "" : currentTenantEdition;
            string action = "";
            if (string.IsNullOrEmpty(accountTypeCode))
            {
                if (currentTenantEdition== "Personal" && accountTypeCode == "Personal") { action = "MPActionCONNECT"; }
                if (currentTenantEdition == "Personal" && accountTypeCode == "Business") { action = "MPActionFOLLOW"; }
                if (currentTenantEdition == "Personal" && accountTypeCode == "Group") { action = "MPActionJOIN"; }

                if (currentTenantEdition == "Business" && accountTypeCode == "Personal") { action = " MPActionEMPLOY"; }
                if (currentTenantEdition == "Business" && accountTypeCode == "Business") { action = "MPActionCONNECT"; }
                if (currentTenantEdition == "Business" && accountTypeCode == "Group") { action = "MPActionJOIN"; }

                if (currentTenantEdition == "Group" && accountTypeCode == "Personal") { action = "MPActionINVITE"; }
                if (currentTenantEdition == "Group" && accountTypeCode == "Business") { action = "MPActionINVITE"; }
                if (currentTenantEdition == "Group" && accountTypeCode == "Group") { action = ""; }


            }



            return action;
        }


    }

    public class CreateMarketplaceAccount : onetouchAppServiceBase, ICreateMarketplaceAccount
    {
        private readonly IRepository<AppMarketplaceContactAddress, long> _appContactAddressRepository;
        private readonly IRepository<AppMarketplaceContact, long> _appContactRepository;
        private readonly IRepository<AppMarketplaceAddress, long> _appAddressRepository;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly Helper _helper;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        public CreateMarketplaceAccount(IRepository<AppMarketplaceContact
            , long> appContactRepository
            , Helper helper
            , IRepository<AppEntity, long> appEntityRepository
            , IAppEntitiesAppService appEntitiesAppService
            , IRepository<AppMarketplaceContactAddress, long> appContactAddressRepository
            , IRepository<AppMarketplaceAddress, long> appAddressRepository)
        {
            _appContactRepository = appContactRepository;
            _helper = helper;
            _appEntityRepository = appEntityRepository;
            _appEntitiesAppService = appEntitiesAppService;
            _appContactAddressRepository = appContactAddressRepository;
            _appAddressRepository = appAddressRepository;
        }
        public async Task<long> CreateOrEditAccount(CreateOrEditAccountInfoDto input)
        {
            if (input.UseDTOTenant == false)
            {
                if (input.AccountLevel == AccountLevelEnum.Profile)
                    throw new UserFriendlyException("Ooppps! this function is not allowed...");
            }


            return await Update(input);
        }

        private async Task<long> Update(CreateOrEditAccountInfoDto input)
        {
            AppMarketplaceContact contactOriginal;
            if (input.AccountLevel == AccountLevelEnum.Profile)
            {
                contactOriginal = await _appContactRepository.FirstOrDefaultAsync(x => x.IsProfileData & x.ParentId == null);

                var tenantObj = TenantManager.GetById(int.Parse(AbpSession.TenantId.ToString()));
                if (tenantObj != null) { tenantObj.Name = input.Name; }

            }
            else
            {
                contactOriginal = await _appContactRepository.FirstOrDefaultAsync(x => x.Id == input.Id);
            }
            //temp solution to test 
            if (string.IsNullOrEmpty(input.Code))
                input.Code = System.Guid.NewGuid().ToString();



            var contactObjectId = await _helper.SystemTables.GetObjectContactId();

            var partnerEntityObjectTypeId = input.AccountTypeId;
            var partnerEntityObjectTypeCode = input.AccountType;
            if (partnerEntityObjectTypeId == null || input.AccountTypeId < 1)
            {
                var partnerEntityObjectType = await _helper.SystemTables.GetEntityObjectTypeParetner();
                partnerEntityObjectTypeId = partnerEntityObjectType.Id;
                partnerEntityObjectTypeCode = partnerEntityObjectType.Code;
            }


            AppEntityDto entity = new AppEntityDto();
            ObjectMapper.Map(input, entity);
            entity.Id = 0;
            entity.ObjectId = contactObjectId;
            entity.EntityObjectTypeId = partnerEntityObjectTypeId;
            entity.EntityObjectTypeCode = partnerEntityObjectTypeCode;
            entity.Name = input.Name;
            entity.Notes = input.Notes;
            if (input.UseDTOTenant)
            {
                entity.TenantId = input.TenantId;

            }
            else
            {
                entity.TenantId = AbpSession.TenantId;
            }

            entity.Code = input.Code;

            AppContactDto contact = new AppContactDto();
            //var contactSavedId = contact.Id;
            ObjectMapper.Map(input, contact);
            //contact.Id = contactSavedId;

            #region stop phone update from here as it overrider by saving in branch update method...
            if (contactOriginal != null)
            {
                contact.Phone1Ext = contactOriginal.Phone1Ext;
                contact.Phone1Number = contactOriginal.Phone1Number;
                contact.Phone1TypeId = contactOriginal.Phone1TypeId;

                contact.Phone2Ext = contactOriginal.Phone2Ext;
                contact.Phone2Number = contactOriginal.Phone2Number;
                contact.Phone2TypeId = contactOriginal.Phone2TypeId;

                contact.Phone3Ext = contactOriginal.Phone3Ext;
                contact.Phone3Number = contactOriginal.Phone3Number;
                contact.Phone3TypeId = contactOriginal.Phone3TypeId;
            }
            #endregion stop phone update from here as it overrider by saving in branch update method...

            //contact.AccountType = "";
            //if (input.AccountType.Count > 0)
            //  contact.AccountType = input.AccountType.JoinAsString(";");

            contact.IsProfileData = input.AccountLevel == AccountLevelEnum.Profile;

            if (input.UseDTOTenant)
            { contact.TenantId = input.TenantId; }
            else
            {
                contact.TenantId = AbpSession.TenantId;
            }

            entity.Id = contactOriginal == null ? 0 : contactOriginal.Id;

            contact.Id = contactOriginal == null ? 0 : contactOriginal.Id;


            var isManual = (contact.TenantId == AbpSession.TenantId && !contact.IsProfileData && contact.ParentId == null && contact.SSIN == null);
            if (string.IsNullOrEmpty(input.SSIN))
            {
                if (isManual)
                {
                    var profileSSIN = "";
                    var accountInfo = await _appContactRepository.GetAll().Include(e => e)
                  //MyAccount case
                  .WhereIf(input == null || input.Id == 0,
                      x => x.IsProfileData && x.ParentId == null && x.TenantId == AbpSession.TenantId)
                  .FirstOrDefaultAsync();

                    if (accountInfo != null)
                    {
                        profileSSIN = accountInfo.SSIN;
                        if (string.IsNullOrEmpty(accountInfo.SSIN))
                        {
                            AppEntityDto accountInfoEntity = new AppEntityDto();
                            ObjectMapper.Map(accountInfo, accountInfoEntity);
                            profileSSIN = await _helper.SystemTables.GenerateSSIN(contactObjectId, accountInfoEntity);
                        }

                        if (!string.IsNullOrEmpty(profileSSIN))
                        {
                            accountInfo.SSIN = profileSSIN;
                            await _appEntityRepository.UpdateAsync(accountInfo);
                            input.SSIN = profileSSIN + "-" + contact.Code;
                        }
                    }
                }
                else
                {
                    entity.IsHostRecord = true;
                    input.SSIN = await _helper.SystemTables.GenerateSSIN(contactObjectId, entity);
                    entity.IsHostRecord = false;
                }
            }
            contact.PriceLevel = input.PriceLevel;
            contact.SSIN = input.SSIN;
            entity.SSIN = input.SSIN;
            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);

            contact.Id = savedEntity;

            long newId = 0;
            if (input.ReturnId)
            { newId = await _appEntitiesAppService.SaveContact(contact); }
            else
            { await _appEntitiesAppService.SaveContact(contact); }

            //await CreateAdminContact();

            await CurrentUnitOfWork.SaveChangesAsync();
            // return await GetAccountForEdit(new EntityDto<long> { Id = newId });
            return newId;

        }


        public async Task<long> SaveContact(AppMarketplaceContactDto input)
        {
            AppMarketplaceContact contact;
            if (input.Id != 0)
            {
                contact = await _appContactRepository.GetAll()
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
                contact = await _appContactRepository.InsertAsync(contact);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return contact.Id;

        }


        [AbpAuthorize(AppPermissions.Pages_Accounts_Publish)]
        public async Task PublishProfile()
        {

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
 
                var contact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses)
                    .ThenInclude(x => x.AddressFk).AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.IsProfileData == true );
  
                if (contact != null)
                {
                    var entity = await _appEntityRepository.GetAll().AsNoTracking().Include(x => x.EntityCategories)
                                        .Include(x => x.EntityClassifications)
                                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contact.Id);

                    var publishContact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses)
                        .FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.SSIN == contact.SSIN);

                    AppEntityDto entityDto = new AppEntityDto();
                    ObjectMapper.Map(entity, entityDto);
                    entityDto.Id = 0;
                    entityDto.TenantId = null;

                    AppMarketplaceContactDto contactDto = new AppMarketplaceContactDto();
                    ObjectMapper.Map(contact, contactDto);

                    contactDto.SSIN = contact.SSIN;
                    contactDto.IsProfileData = false;
                    contactDto.TenantId = null;
                    contactDto.ContactAddresses = null;
                    contactDto.Id = 0;

                    if (publishContact != null)
                    {
                        contactDto.Id = publishContact.Id;
                        entityDto.Id = publishContact.Id;
                        //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[Start]
                        entityDto.EntityObjectStatusId = null;
                        //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[End]
                    }
                    // fix bug as per Mariam, 2022-08-14 entity tenant should be null 
                    entityDto.TenantId = null;
                    var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                    contactDto.Id = savedEntity;
                    contactDto.Id = await SaveContact(contactDto);

                    // Remove Addresses
                    if (publishContact != null)
                    {
                        var publishAddressesIds = publishContact.AppContactAddresses.Select(x => x.AddressId).ToArray();
                        var publishContactAddressesIds = publishContact.AppContactAddresses.Select(x => x.Id).ToArray();

                        await _appContactAddressRepository.DeleteAsync(x => x.ContactId == contactDto.Id); //  publishContactAddressesIds.Contains(x.Id));
                        await _appAddressRepository.DeleteAsync(x => publishAddressesIds.Contains(x.Id));
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }

                    // Add Addresses
                    var addressesIds = contact.AppContactAddresses.Select(x => x.AddressId).ToArray();

                    var addresses = _appAddressRepository.GetAll().Where(x => addressesIds.Contains(x.Id)).ToList();
                    
                    foreach (var contactAddress in contact.AppContactAddresses)
                    {
                        var savedAddress = await _appAddressRepository.FirstOrDefaultAsync(x => x.Id == contactAddress.AddressId);
                        if (savedAddress != null)
                        {
                            AppMarketplaceAddress address = new AppMarketplaceAddress();

                            AppMarketplaceAddress existedInPublish = null;

                            //if (contactDto.ContactAddresses != null)
                            existedInPublish = await _appAddressRepository.GetAll()
                                .Where(x => x.Code == contactAddress.AddressFk.Code && x.TenantId == null 
                                       && x.AccountId == contactDto.Id).FirstOrDefaultAsync();

                            ObjectMapper.Map(savedAddress, address);
                            if (existedInPublish == null)
                            {
                                //ObjectMapper.Map(savedAddress, address);
                                address.Id = 0;
                                address.AccountId = contactDto.Id;
                                address.TenantId = null;
                                address = await _appAddressRepository.InsertAsync(address);
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }
                            else
                            {
                                address.TenantId = null;
                                address.Id = existedInPublish.Id;
                                address.Code = existedInPublish.Code;
                                address.AccountId = contactDto.Id;
                                var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                                x.ChangeTracker.Clear();
                                await _appAddressRepository.UpdateAsync(address);
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }


                            AppMarketplaceContactAddress newContactAddress = new AppMarketplaceContactAddress();
                            //ObjectMapper.Map(contactAddress, newContactAddress);
                            newContactAddress.Id = 0;
                            newContactAddress.AddressId = address.Id;
                            newContactAddress.ContactId = contactDto.Id;
                            newContactAddress.AddressTypeId = contactAddress.AddressTypeId;
                            newContactAddress.AddressCode = contactAddress.AddressCode;
                            newContactAddress.AddressTypeCode = contactAddress.AddressTypeCode;
                            newContactAddress.ContactCode = contactAddress.ContactCode;
                            if (contactDto.ContactAddresses == null)
                                contactDto.ContactAddresses = new List<AppMarketplaceContactAddressDto>();
                            contactDto.ContactAddresses.Add(new AppMarketplaceContactAddressDto
                            {
                                AddressTypeId = contactAddress.AddressTypeId,
                                AddressTypeIdName = contactAddress.AddressTypeCode,
                                Code = address.Code,
                                AddressId = address.Id,
                                AccountId = contactDto.Id,
                                ContactId = contactDto.Id
                            });
                            //var aId = contact.AppContactAddresses.FirstOrDefault(x => x.AddressId == contactAddress.Id && x.ContactId ==);
                            //await _appContactAddressRepository.InsertAsync(new AppContactAddress { AddressId = address.Id, ContactId = contactDto.Id, AddressTypeId = aId.AddressTypeId });
                            await _appContactAddressRepository.InsertAsync(newContactAddress);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                    }

                    //Mariam -Publish Account related branches [Start]
                    var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                    var branchInfo = _appContactRepository.GetAll().Where(x => x.IsProfileData && x.SSIN == contact.SSIN &&
                                     x.ParentId == contact.Id && x.EntityObjectTypeId != presonEntityObjectTypeId).ToList(); // First level of branches

                    foreach (var branchObj in branchInfo)
                    {
                        await PublishBranch(branchObj.Id);
                    }
                    //Mariam -Publish Account related branches [End]
                    //Publish contacts
                    var contactInfo = _appContactRepository.GetAll().Where(x => x.IsProfileData && x.ParentId == contact.Id 
                    && x.SSIN == contact.SSIN && x.EntityObjectTypeId == presonEntityObjectTypeId).ToList();

                    foreach (var contactObj in contactInfo)
                    {
                        await PublishMember(contactObj.Id);
                    }
                    //End
                }
            }
        }
        //Mariam[start]
        private async Task<bool> PublishBranch(long branchId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var contact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses)
                    .ThenInclude(x => x.AddressFk).AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.IsProfileData == true && x.Id == branchId);

                var entity = await _appEntityRepository.GetAll().AsNoTracking()
                                   .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contact.Id);
                var parentContact2 = await _appContactRepository.GetAll().ToListAsync();

                var parentContact = await _appContactRepository.GetAll().AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contact.ParentId && x.IsProfileData == true);

                var publishedParentContact = await _appContactRepository.GetAll().AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == null && x.SSIN == parentContact.SSIN && x.IsProfileData == false);

                var publishContact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses)
                    .FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.SSIN == contact.SSIN);
                //Get branch Related Published record of Account 
                var publishedAccount = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null && x.SSIN == contact.SSIN && x.IsProfileData == false);
                //
                AppEntityDto entityDto = new AppEntityDto();
                ObjectMapper.Map(entity, entityDto);
                entityDto.Id = 0;

                AppMarketplaceContactDto contactDto = new AppMarketplaceContactDto();
                ObjectMapper.Map(contact, contactDto);

                contactDto.SSIN = contact.SSIN;
                contactDto.IsProfileData = false;
                contactDto.TenantId = null;
                contactDto.ContactAddresses = null;
                contactDto.Id = 0;
                contactDto.AccountId = publishedAccount.Id;
                contactDto.ParentId = publishedParentContact.Id;
                if (publishContact != null)
                {
                    contactDto.Id = publishContact.Id;
                    entityDto.Id = publishContact.Id;
                }
                // fix bug as per Mariam, 2022-08-14 entity tenant should be null 
                entityDto.TenantId = null;

                var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                contactDto.Id = savedEntity;
                contactDto.Id = await SaveContact(contactDto);

                // Remove Addresses
                if (publishContact != null)
                {
                    var publishAddressesIds = publishContact.AppContactAddresses.Select(x => x.AddressId).ToArray();
                    var publishContactAddressesIds = publishContact.AppContactAddresses.Select(x => x.Id).ToArray();

                    await _appContactAddressRepository.DeleteAsync(x => publishContactAddressesIds.Contains(x.Id));
                    await _appAddressRepository.DeleteAsync(x => publishAddressesIds.Contains(x.Id));
                }

                // Add Addresses
                var addressesIds = contact.AppContactAddresses.Select(x => x.AddressId).ToArray();

                var addresses = _appAddressRepository.GetAll().Where(x => addressesIds.Contains(x.Id)).ToList();

                foreach (var contactAddress in contact.AppContactAddresses)
                {
                    var savedAddress = await _appAddressRepository.FirstOrDefaultAsync(x => x.Id == contactAddress.AddressId);
                    AppMarketplaceAddress address = new AppMarketplaceAddress();

                      
                    if (savedAddress != null)
                    {
                        AppMarketplaceAddress existedInPublish = null;

                        existedInPublish = await _appAddressRepository.GetAll()
                            .Where(x => x.Code == contactAddress.AddressFk.Code && x.TenantId == null 
                            && x.AccountId == contactDto.Id).FirstOrDefaultAsync();

                        ObjectMapper.Map(savedAddress, address);
                        if (existedInPublish == null)
                        {
                            //ObjectMapper.Map(savedAddress, address);
                            address.Id = 0;
                            address.AccountId = contactDto.Id;
                            address.TenantId = null;
                            address = await _appAddressRepository.InsertAsync(address);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                        else
                        {
                            address.TenantId = null;
                            address.Id = existedInPublish.Id;
                            address.Code = existedInPublish.Code;
                            address.AccountId = contactDto.Id;
                            var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                            x.ChangeTracker.Clear();
                            await _appAddressRepository.UpdateAsync(address);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }

                        AppMarketplaceContactAddress newContactAddress = new AppMarketplaceContactAddress();
                        //ObjectMapper.Map(contactAddress, newContactAddress);
                        newContactAddress.Id = 0;
                        newContactAddress.AddressId = address.Id;
                        newContactAddress.ContactId = contactDto.Id;
                        newContactAddress.AddressTypeId = contactAddress.AddressTypeId;
                        newContactAddress.AddressCode = contactAddress.AddressCode;
                        newContactAddress.AddressTypeCode = contactAddress.AddressTypeCode;
                        newContactAddress.ContactCode = contactAddress.ContactCode;

                        if (contactDto.ContactAddresses == null)
                            contactDto.ContactAddresses = new List<AppMarketplaceContactAddressDto>();
                        // contactDto.ContactAddresses.Add(new AppContactAddressDto { Code = address.Code, AddressId = address.Id, AccountId = contactDto.Id, ContactId = contactDto.Id });
                        contactDto.ContactAddresses.Add(new AppMarketplaceContactAddressDto
                        {
                            AddressTypeId = contactAddress.AddressTypeId,
                            AddressTypeIdName = contactAddress.AddressTypeCode,
                            Code = address.Code,
                            AddressId = address.Id,
                            AccountId = contactDto.Id,
                            ContactId = contactDto.Id

                        });
                        //var aId = contact.AppContactAddresses.FirstOrDefault(x => x.AddressId == contactAddress.Id && x.ContactId ==);
                        //await _appContactAddressRepository.InsertAsync(new AppContactAddress { AddressId = address.Id, ContactId = contactDto.Id, AddressTypeId = aId.AddressTypeId });
                        await _appContactAddressRepository.InsertAsync(newContactAddress);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                //Mariam - Publish Account related contacts[Start]
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var contactInfo = _appContactRepository.GetAll().Where(x => x.IsProfileData && x.ParentId == contact.Id && x.SSIN == contact.SSIN && x.EntityObjectTypeId == presonEntityObjectTypeId).ToList();

                foreach (var contactObj in contactInfo)
                {
                    await PublishMember(contactObj.Id);
                }
                //var presonEntityObjectTypeId = = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var branchInfo = _appContactRepository.GetAll().Where(x => x.IsProfileData &&
                                 x.ParentId == contact.Id && x.EntityObjectTypeId != presonEntityObjectTypeId).ToList(); // First level of branches

                foreach (var branchObj in branchInfo)
                {
                    await PublishBranch(branchObj.Id);
                }
                //Mariam[End]

            }
            return true;
        }
        private async Task<bool> PublishMember(long contactId)
        {
            var contact = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId 
            && x.Id == contactId && x.IsProfileData == true);
            var entity = await _appEntityRepository.GetAll().AsNoTracking()
                                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                .Include(x => x.EntityExtraData)
                                .AsNoTracking()
                                .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contact.Id);
            //Get Contact Related Published records of Account and Branch
            var publishedAccount = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null 
            && x.SSIN == contact.SSIN && x.IsProfileData == false);
            var publishedBranch = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null 
            && x.SSIN == contact.SSIN && x.IsProfileData == false);
            //
            var publishContact = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null 
            && x.IsProfileData == false && x.SSIN == contact.SSIN);

            AppEntityDto entityDto = new AppEntityDto();
            ObjectMapper.Map(entity, entityDto);
            entityDto.Id = 0;
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            entity.EntityObjectTypeId = presonEntityObjectTypeId;

            AppMarketplaceContactDto contactDto = new AppMarketplaceContactDto();
            ObjectMapper.Map(contact, contactDto);

            contactDto.SSIN = contact.SSIN;
            contactDto.IsProfileData = false;
            contactDto.ParentId = publishedBranch.Id;
            contactDto.TenantId = null;
            contactDto.ContactAddresses = null;
            contactDto.Id = 0;
            contactDto.AccountId = publishedAccount.Id;

            if (publishContact != null)
            {
                contactDto.Id = publishContact.Id;
                entityDto.Id = publishContact.Id;
            }
            if (entity.EntityAttachments != null)
            {
                ObjectMapper.Map<IList<AppEntityAttachmentDto>>(entity.EntityAttachments);
            }
            //Extra Attributes[Start]
            if (entityDto.EntityExtraData != null)
            {
                foreach (var extraAtt in entityDto.EntityExtraData)
                {
                    //AppEntityExtraDataDto appEntityExtraDto = new AppEntityExtraDataDto();
                    //ObjectMapper.Map(extraAtt, appEntityExtraDto);
                    if (extraAtt.AttributeValueId == null) extraAtt.AttributeValueId = 0;
                    extraAtt.EntityObjectTypeId = presonEntityObjectTypeId;
                    extraAtt.Id = 0;
                    switch (extraAtt.AttributeId)
                    {
                        case 708: //Language ID
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                contactDto.LanguageId = null;
                                contactDto.LanguageCode = null;
                            }
                            break;
                        case 709: //Email Address
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                contactDto.EMailAddress = null;
                            }
                            break;
                        case 710: //Phone#1
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                contactDto.Phone1Ext = null;
                                contactDto.Phone1Number = null;
                                contactDto.Phone1TypeId = null;
                                contactDto.Phone1TypeName = null;
                            }
                            break;

                        case 711://Phone#2
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                contactDto.Phone2Ext = null;
                                contactDto.Phone2Number = null;
                                contactDto.Phone2TypeId = null;
                                contactDto.Phone2TypeName = null;
                            }
                            break;

                        case 712://Phone#3
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                contactDto.Phone3Ext = null;
                                contactDto.Phone3Number = null;
                                contactDto.Phone3TypeId = null;
                                contactDto.Phone3TypeName = null;
                            }
                            break;
                        case 713:  // Join DATE 
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                // entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 713));
                                entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue = null;
                            }

                            break;


                        case 714: //UserName
                            if (extraAtt.AttributeValue.ToLower() == "false")
                            {
                                //entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 714));
                                entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703).AttributeValue = null;
                            }
                            //entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703));
                            break;

                    }
                }
            }
            while (entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeValue == null) != null)
            {
                entityDto.EntityExtraData.Remove(entityDto.EntityExtraData.FirstOrDefault(x => x.AttributeValue == null));
            }
            //Extra Attributes[End]
            entityDto.TenantId = null;
            var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);
            contactDto.Id = savedEntity;
            contactDto.Id = await SaveContact(contactDto);
            await CurrentUnitOfWork.SaveChangesAsync();

            return (contactDto.Id != 0);
        }
        //Mariam[End]

    }

}