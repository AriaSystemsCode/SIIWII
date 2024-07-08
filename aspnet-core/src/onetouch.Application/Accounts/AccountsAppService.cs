using onetouch.AppEntities;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.Accounts.Exporting;
using onetouch.Accounts.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.AppContacts;
using onetouch.Helpers;
using Abp.Domain.Uow;
using Abp.Net.Mail;
using System.Net.Mail;
using onetouch.Mail;
using onetouch.AppEntities.Dtos;
using onetouch.AppContacts.Dtos;
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
using onetouch.Migrations;

namespace onetouch.Accounts
{
    [AbpAuthorize(AppPermissions.Pages_Accounts)]
    public class AccountsAppService : onetouchAppServiceBase, IAccountsAppService, IExcelImporter<AccountExcelResultsDTO>
    {
        private readonly TenantManager _tenantManager;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<AppMarketplaceContact, long> _appMarketplaceContactRepository;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppAddress, long> _appAddressRepository;
        private readonly IRepository<AppContactAddress, long> _appContactAddressRepository;
        private readonly IEmailSender _emailSender;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly ICreateMarketplaceAccount _iCreateMarketplaceAccount;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IRepository<AppContactPaymentMethod, long> _appContactPaymentMethodRepository;
        private readonly ISycEntityObjectClassificationsAppService _sycEntityObjectClassificationsAppService;
        private readonly ISycEntityObjectCategoriesAppService _sycEntityObjectCategoriesAppService;
        private readonly ISycAttachmentCategoriesAppService _sSycAttachmentCategoriesAppService;
        private readonly Helper _helper;
        private readonly UserManager _userManager;
        private readonly SycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
        private readonly IAppNotifier _appNotifier;
        private readonly IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels,long> _appMarketplaceAccountsPriceLevelsRepo;
        //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]
        //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[Start]
        private const int MaxProfilPictureBytes = 5242880;
        private readonly IBinaryObjectManager _binaryObjectManager;
        //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[End]
        private enum CardType
        {
            MasterCard, Visa, AmericanExpress, Discover, JCB
        };

        public AccountsAppService(IRepository<AppContact, long> appContactRepository
            , IRepository<AppEntity, long> appEntityRepository
            , Helper helper, IRepository<AppAddress, long> appAddressRepository
            , IRepository<AppContactAddress, long> appContactAddressRepository
            , IEmailSender emailSender
            , IAppEntitiesAppService appEntitiesAppService
            , IAppConfigurationAccessor appConfigurationAccessor
            , IRepository<AppContactPaymentMethod, long> appContactPaymentMethodRepository
            , ISycEntityObjectClassificationsAppService sycEntityObjectClassificationsAppService
            , ISycEntityObjectCategoriesAppService sycEntityObjectCategoriesAppService
            , ISycAttachmentCategoriesAppService sSycAttachmentCategoriesAppService
            , IRepository<AppEntityExtraData, long> appEntityExtraDataRepository, UserManager userManager, IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> appMarketplaceAccountsPriceLevelsRepo,
              SycIdentifierDefinitionsAppService sycIdentifierDefinitionsAppService, IAppNotifier appNotifier, IBinaryObjectManager binaryObjectManager,
              TenantManager tenantManager
            , ICreateMarketplaceAccount iCreateMarketplaceAccount
            , IRepository<AppMarketplaceContact, long> appMarketplaceContactRepository)
        {
            _appMarketplaceContactRepository = appMarketplaceContactRepository;
            _tenantManager = tenantManager;
            _appContactRepository = appContactRepository;
            _appEntityRepository = appEntityRepository;
            _appAddressRepository = appAddressRepository;
            _appContactAddressRepository = appContactAddressRepository;
            _helper = helper;
            _emailSender = emailSender;
            _appEntitiesAppService = appEntitiesAppService;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appContactPaymentMethodRepository = appContactPaymentMethodRepository;
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
            _appMarketplaceAccountsPriceLevelsRepo= appMarketplaceAccountsPriceLevelsRepo;
            //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[End]
            _iCreateMarketplaceAccount = iCreateMarketplaceAccount;

        }

        public async Task<PagedResultDto<GetAccountForViewDto>> GetAll(GetAllAccountsInput input)
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
                            .Include(en => en.EntityFk).ThenInclude(encl => encl.EntityClassifications)
                            .Include(en => en.EntityFk).ThenInclude(enca => enca.EntityCategories)
                            .Include(en => en.EntityFk).ThenInclude(ena => ena.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                            /*.WhereIf(currPublishContact != null,
                                x => (x.PartnerId != currPublishContact.Id))*///not current profile

                            .WhereIf(input.FilterType < 3 && input.FilterType != 6 && input.FilterType != 2,//if filtertype != manual then filter all published acounts only
                                x => (x.TenantId == null && !x.IsProfileData && x.ParentId == null))

                            .WhereIf(!string.IsNullOrEmpty(input.Filter),
                                x => x.Name.Contains(input.Filter) || x.TradeName.Contains(input.Filter))

                            .WhereIf(input.FilterType <= 1 && input.FilterType != 6,
                                x => (x.TenantId == null && !x.IsProfileData && x.ParentId == null && x.EntityFk.EntityObjectStatusId != cancelledStatusId))
                            .WhereIf(input.FilterType == 2 && input.FilterType != 6,
                                x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.ParentId == null && x.PartnerId !=null)
                                && (_appContactRepository.GetAll().Count(c => c.TenantId == null && c.Id == x.PartnerId) > 0))
                            .WhereIf(input.FilterType >= 3 && input.FilterType != 6,
                                x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.ParentId == null && x.PartnerId == null))
                             .WhereIf(input.FilterType == 6,
                                x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.ParentId == null && x.PartnerId == null)
                                || (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.ParentId == null && x.PartnerId != null)
                                && (_appContactRepository.GetAll().Count(c => c.TenantId == null && c.Id == x.PartnerId) > 0))

                            .WhereIf(!string.IsNullOrEmpty(input.Name),
                                x => x.Name.Contains(input.Name) || x.TradeName.Contains(input.Name))
                            .WhereIf(input.Status != null && input.Status.Count(x => x == 1) > 0,
                                x => _appContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.PartnerId == x.Id) > 0)

                            .WhereIf(input.Status != null && input.Status.Count(x => x == 2) > 0,
                                x => (_appContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.PartnerId == x.Id) == 0)
                                )
                            .WhereIf(input.Classifications != null && input.Classifications.Count(x => x > 0) > 0,
                                x => _appEntityRepository.GetAll().Include(ec => ec.EntityClassifications).FirstOrDefault(e => e.Id == x.EntityId).EntityClassifications.Any(a => input.Classifications.Contains(a.EntityObjectClassificationId)))
                            .WhereIf(input.Categories != null && input.Categories.Count(x => x > 0) > 0,
                                x => _appEntityRepository.GetAll().Include(ec => ec.EntityCategories).FirstOrDefault(e => e.Id == x.EntityId).EntityCategories.Any(a => input.Categories.Contains(a.EntityObjectCategoryId)))

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
                            .WhereIf(input.AccountTypeId != null && input.AccountTypeId > 0, x => x.EntityFk.EntityObjectTypeId == input.AccountTypeId)
                            .WhereIf(input.AccountType != null && !string.IsNullOrEmpty(input.AccountType), x => x.EntityFk.EntityObjectTypeCode == input.AccountType)
                            .WhereIf(input.AccountTypes != null && input.AccountTypes.Count(x => x > 0) > 0,x=>
                           input.AccountTypes.Length > 0 && input.AccountTypes.Contains(x.EntityFk.EntityObjectTypeId))
                    //.WhereIf(input.AccountTypes != null && input.AccountTypes.Count(x => x > 0) > 0,
                    //    x =>
                    //    input.AccountTypes.Length > 0 && x.AccountType.Contains(input.AccountTypes[0].ToString()) ||
                    //    input.AccountTypes.Length > 1 && x.AccountType.Contains(input.AccountTypes[1].ToString()) ||
                    //    input.AccountTypes.Length > 2 && x.AccountType.Contains(input.AccountTypes[2].ToString()) ||
                    //    input.AccountTypes.Length > 3 && x.AccountType.Contains(input.AccountTypes[3].ToString()) ||
                    //    input.AccountTypes.Length > 4 && x.AccountType.Contains(input.AccountTypes[4].ToString()) ||
                    //    input.AccountTypes.Length > 5 && x.AccountType.Contains(input.AccountTypes[5].ToString()) ||
                    //    input.AccountTypes.Length > 6 && x.AccountType.Contains(input.AccountTypes[6].ToString()) ||
                    //    input.AccountTypes.Length > 7 && x.AccountType.Contains(input.AccountTypes[7].ToString()) ||
                    //    input.AccountTypes.Length > 8 && x.AccountType.Contains(input.AccountTypes[8].ToString()) ||
                    //    input.AccountTypes.Length > 9 && x.AccountType.Contains(input.AccountTypes[9].ToString()) ||
                    //    input.AccountTypes.Length > 10 && x.AccountType.Contains(input.AccountTypes[10].ToString()) ||
                    //    input.AccountTypes.Length > 11 && x.AccountType.Contains(input.AccountTypes[11].ToString()) ||
                    //    input.AccountTypes.Length > 12 && x.AccountType.Contains(input.AccountTypes[12].ToString()) ||
                    //    input.AccountTypes.Length > 13 && x.AccountType.Contains(input.AccountTypes[13].ToString()) ||
                    //    input.AccountTypes.Length > 14 && x.AccountType.Contains(input.AccountTypes[14].ToString()) ||
                    //    input.AccountTypes.Length > 15 && x.AccountType.Contains(input.AccountTypes[15].ToString()) ||
                    //    input.AccountTypes.Length > 16 && x.AccountType.Contains(input.AccountTypes[16].ToString()) ||
                    //    input.AccountTypes.Length > 17 && x.AccountType.Contains(input.AccountTypes[17].ToString()) ||
                    //    input.AccountTypes.Length > 18 && x.AccountType.Contains(input.AccountTypes[18].ToString()) ||
                    //    input.AccountTypes.Length > 19 && x.AccountType.Contains(input.AccountTypes[19].ToString())
                    //    )

                    ;


                    var pagedAndFilteredAccounts = filteredAccounts
                    .OrderBy(input.Sorting ?? "name asc")
                    .PageBy(input);

                    var logoCategory = await _helper.SystemTables.GetAttachmentCategoryLogoId();

                    var _accounts = from o in pagedAndFilteredAccounts
                                        //join o1 in _appEntityRepository.GetAll() on o.AppContactAddresses.FirstOrDefault().AddressFk.CountryId equals o1.Id into j1
                                        //from s1 in j1.DefaultIfEmpty()

                                    select new GetAccountForViewDto()
                                    {
                                        Account = new AccountDto
                                        {
                                            AccountTypeString = o.EntityFk.EntityObjectTypeCode,
                                            AccountTypeId = o.EntityFk.EntityObjectTypeId,
                                            AccountType =  o.EntityFk.EntityObjectTypeCode,
                                            SSIN = o.SSIN,
                                            PriceLevel = o.PriceLevel,
                                            Name = o.Name,
                                            City = o.AppContactAddresses.FirstOrDefault().AddressFk.City,
                                            State = o.AppContactAddresses.FirstOrDefault().AddressFk.State,
                                            ZipCode = o.AppContactAddresses.FirstOrDefault().AddressFk.PostalCode,
                                            AddressLine1 = o.AppContactAddresses.FirstOrDefault().AddressFk.AddressLine1,
                                            CountryName = o.AppContactAddresses.FirstOrDefault().AddressFk.CountryFk.Name,
                                            Status = input.FilterType != 1 ? (_appContactRepository.GetAll().Count(x => x.TenantId == null && x.Id == o.PartnerId) > 0 || (o.TenantId != null && o.ParentId == null && o.PartnerId == null)):
                                            (_appContactRepository.GetAll().Count(x => x.TenantId == AbpSession.TenantId && x.PartnerId == o.Id) > 0 || (o.TenantId != null && o.ParentId == null && o.PartnerId == null)),
                                            Id = o.Id,
                                            IsManual = o.TenantId == AbpSession.TenantId && o.ParentId == null && o.PartnerId == null,
                                            LogoUrl = string.IsNullOrEmpty(o.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                                             ""
                                             : "attachments/" + (o.EntityFk.TenantId == null ? "-1" : o.EntityFk.TenantId.ToString()) + "/" + o.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == logoCategory).AttachmentFk.Attachment,
                                            Classfications = o.EntityFk.EntityClassifications.Select(x => x.EntityObjectClassificationFk.Name).Take(5).ToArray(),
                                            Categories = o.EntityFk.EntityCategories.Select(x => x.EntityObjectCategoryFk.Name).Take(5).ToArray(),
                                            PartnerId = o.PartnerId
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
                    var x = new PagedResultDto<GetAccountForViewDto>(
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

        //public bool checkArray(long[] ids, string names)
        //{ bool ret = false;
        //    try
        //    {
        //        string[] namesArray = names.Split(";");

        //        if (ids.Where(r => namesArray.Contains(r.ToString())).Count() > 0)
        //            return true;
        //    }catch(Exception ex) { }
        //    return ret;
        //}

        public List<string> GetLookUPLabels(string Ids, List<LookupLabelDto> tmpAccountType)
        {
            List<string> ret = new List<string>();

            if (!string.IsNullOrEmpty(Ids))
            {
                string[] accounttypes = Ids.Split(";");

                ret = tmpAccountType.Where(r => accounttypes.Contains(r.Value.ToString())).Select(r => r.Label).ToList();
            }
            return ret;

        }
        //Mariam
        public async Task<IList<AppContactPaymentMethodDto>> GetAllPaymentMethods()
        {
            List<AppContactPaymentMethodDto> contactPaymentMethods = new List<AppContactPaymentMethodDto>();
            var contactPaymentMethodslist = await _appContactPaymentMethodRepository.GetAll().Where(x => x.TenantId == AbpSession.TenantId).ToListAsync();
            contactPaymentMethods = ObjectMapper.Map<List<AppContactPaymentMethodDto>>(contactPaymentMethodslist);
            return contactPaymentMethods;
        }

        //Mariam
        //Mariam[Start]
        public async Task<IReadOnlyList<TreeNode<BranchForViewDto>>> GetAllBranches(long parentId)
        {
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();

            TreeNode<BranchForViewDto> ret = new TreeNode<BranchForViewDto>();
            //Get Account Main Branches
            var filteredBranches = _appContactRepository.GetAll()
                      .Include(e => e.ParentFk)
                      .Include(e => e.ParentFkList)
                      .Where(x => x.IsProfileData)
                      .Where(x => x.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId)
                      .Where(e => e.ParentId != null && e.ParentId == parentId);



            var branches = from o in filteredBranches
                           join o2 in _appContactRepository.GetAll() on o.ParentId equals o2.Id into j2
                           from s2 in j2.DefaultIfEmpty()

                           select new TreeNode<BranchForViewDto>()
                           {
                               Data = new BranchForViewDto
                               {
                                   Branch = new BranchDto
                                   {
                                       Code = o.Code,
                                       Name = o.Name,
                                       Id = o.Id
                                   },
                                   SubTotal = o.ParentFkList.Count(),
                               },
                               Leaf = o.ParentFkList.Count() == 0,
                               label = o.Name,


                           };


            var totalCount = await filteredBranches.CountAsync();

            var x = await branches.ToListAsync();
            //
            foreach (var br in x)
            {
                br.Children = await GetAllBranches(br.Data.Branch.Id);
                br.totalChildrenCount = br.Children.Count;
            }
            //
            return x;
        }
        public async Task<PagedResultDto<GetMemberForViewDto>> GetAllMembers(GetAllMembersInput input) // New class for contacts input called GetAllAccountContactsInput
        {

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var contactObjectId = await _helper.SystemTables.GetObjectContactId();
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("LOGO");

                var contactInfo = _appContactRepository.GetAll()
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityExtraData)
                .Include(x => x.AppContactAddresses)
                .Include(x => x.AccountFk)
                .Where(x => x.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId)
                .WhereIf(input.AccountId != null && input.FilterType == MemberFilterTypeEnum.Profile, x => x.TenantId == AbpSession.TenantId && x.AccountId == input.AccountId && x.IsProfileData)
                .WhereIf(input.AccountId != null && input.FilterType == MemberFilterTypeEnum.View, x => x.AccountId == input.AccountId)
                .WhereIf(input.AccountId == null && input.FilterType == MemberFilterTypeEnum.MarketPlace, x => x.TenantId == null && !x.IsProfileData)
                .WhereIf(!string.IsNullOrEmpty(input.Filter),
                                    x => x.Name.Contains(input.Filter));

                //MMT - 08/18/2022 Sort my team members by Surname when there are no records, gives an error[Start]
                //var pagedAndFilteredContacts = contactInfo
                //       .OrderBy(input.Sorting ?? "name asc")
                //       .PageBy(input);

                IQueryable<AppContact> pagedAndFilteredContacts = null;
                if (input.Sorting != null && input.Sorting.ToLower().Contains("lastname"))
                {
                    pagedAndFilteredContacts = contactInfo
                      .OrderBy(p => p.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702).AttributeValue).PageBy(input);
                }
                else
                {
                    pagedAndFilteredContacts = contactInfo
                          .OrderBy(input.Sorting ?? "name asc")
                          .PageBy(input);
                }

                //MMT - 08/18/2022 Sort my team members by Surname when there are no records, gives an error[End]


                //MMT22
                DateTime jDate = DateTime.Now;
                //MMT22
                var contacts = from o in pagedAndFilteredContacts
                               select new GetMemberForViewDto()
                               {
                                   Id = o.Id,
                                   FirstName = o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 701) == null ? "" : o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 701).AttributeValue,
                                   SurName = o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702) == null ? "" : o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702).AttributeValue,
                                   JobTitle = o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706) == null ? "" : o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706).AttributeValue,
                                   EMailAddress = o.EMailAddress == null ? "" : o.EMailAddress,
                                   AccountName = o.AccountFk.Name,
                                   //MMT222
                                   //JoinDate = o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707) == null ? DateTime.Now : DateTime.Parse(o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue),
                                   JoinDate = o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707) == null ? DateTime.Now : (DateTime.TryParse(o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue, out jDate) ? DateTime.Parse(o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707).AttributeValue) : DateTime.Now),
                                   //MMT222
                                   //IsPublicJoinDate = o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeCode == "Join-Date-IsPublic") == null ? false : bool.Parse(o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeCode == "Join-Date-IsPublic").AttributeValue),
                                   IsActive = false,
                                   UserId = o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715) == null ? 0 : long.Parse(o.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715).AttributeValue),
                                   ImageUrl = string.IsNullOrEmpty(o.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                                            ""
                                            : "attachments/" + (o.EntityFk.TenantId == null ? "-1" : o.EntityFk.TenantId.ToString()) + "/" + o.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment
                               };


                var totalCount = await contactInfo.CountAsync();

                var contactList = await contacts.ToListAsync();

                foreach (var contactObj in contactList)
                {
                    if (contactObj.UserId != 0)
                    {
                        contactObj.IsActive = await GetMemberStatus(contactObj.UserId);
                    }
                    //MMT22
                    //MMT22
                    if (contactObj.JoinDate == new DateTime(1, 1, 1))
                    {
                        contactObj.JoinDate = DateTime.Now;
                    }
                    //MMT22
                    //MMT33
                }


                var x = new PagedResultDto<GetMemberForViewDto>(
                    totalCount, contactList);

                return x;

            }
        }
        private async Task<bool> GetMemberStatus(long userId)
        {
            var user = await UserManager.GetUserByIdAsync(userId);
            if (user == null)
                return false;
            return user.IsActive;

        }
        //Mariam[End]



        public List<long> GetLookUPIds(string Ids, List<LookupLabelDto> tmpAccountType)
        {
            List<long> ret = new List<long>();

            if (!string.IsNullOrEmpty(Ids))
            {
                string[] accounttypes = Ids.Split(";");

                ret = tmpAccountType.Where(r => accounttypes.Contains(r.Value.ToString())).Select(r => r.Value).ToList();
            }
            return ret;

        }


        public async Task<GetAccountForViewDto> GetAccountForView(long id, int resultCount = 10)
        {
            await CreateAdminContact();

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var account = await _appContactRepository.GetAll()
                .Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressFk).ThenInclude(x => x.CountryFk)
                .FirstOrDefaultAsync(x => x.Id == id);

                var entity = await _appEntityRepository.GetAll()
                    .Include(x => x.EntityClassifications).ThenInclude(x => x.EntityObjectClassificationFk)
                    .Include(x => x.EntityCategories).ThenInclude(x => x.EntityObjectCategoryFk)
                    .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                    .FirstOrDefaultAsync(x => x.Id == account.EntityId);

                var accountDto = ObjectMapper.Map<AccountDto>(account);

                #region prepare account types
                //List<LookupLabelDto> tmpAccountType = await _appEntitiesAppService.GetAllAccountTypeForTableDropdown();
                //accountDto.AccountType = GetLookUPLabels(account.AccountType, tmpAccountType);
                #endregion prepare account ypes

                #region I31 fill account type from entity type in AppEntities 
                accountDto.SSIN = account.SSIN;
                accountDto.PriceLevel = account.PriceLevel;
                accountDto.AccountTypeId = entity.EntityObjectTypeId;
                accountDto.AccountType = entity.EntityObjectTypeCode;
                accountDto.IsManual    = (account.TenantId == AbpSession.TenantId && !account.IsProfileData && account.ParentId == null && account.PartnerId == null);
                accountDto.IsConnected = (account.TenantId == null && !account.IsProfileData && account.ParentId == null);
                #endregion I31 fill account type from entity type in AppEntities 


                accountDto.Description = entity.Notes;

                accountDto.Categories = entity.EntityCategories.Select(x => x.EntityObjectCategoryFk.Name).Take(resultCount).ToArray();
                accountDto.CategoriesTotalCount = entity.EntityCategories.Count();

                accountDto.Classfications = entity.EntityClassifications.Select(x => x.EntityObjectClassificationFk.Name).Take(resultCount).ToArray();
                accountDto.ClassificationsTotalCount = entity.EntityClassifications.Count();

                accountDto.Status = (_appContactRepository.GetAll().Count(x => x.TenantId == AbpSession.TenantId && x.PartnerId == account.Id) > 0 || _appContactRepository.GetAll().Count(x => x.Id == account.PartnerId && x.TenantId == null) > 0);

                accountDto.Connections = _appContactRepository.GetAll().Count(c => c.TenantId == entity.TenantId && c.PartnerId == id);
                accountDto.EntityId = entity.Id;
                var firstAddress = account.AppContactAddresses.FirstOrDefault();
                if (account.AppContactAddresses.Count() > 0 && firstAddress.AddressFk != null)
                {
                    accountDto.AddressLine1 = firstAddress.AddressFk.AddressLine1;
                    accountDto.AddressLine2 = firstAddress.AddressFk.AddressLine2;
                    accountDto.City = firstAddress.AddressFk.City;
                    accountDto.CountryId = firstAddress.AddressFk.CountryId;
                    accountDto.CountryName = firstAddress.AddressFk.CountryFk.Name;
                    accountDto.ZipCode = firstAddress.AddressFk.PostalCode;
                    accountDto.State = firstAddress.AddressFk.State;
                }


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

                var output = new GetAccountForViewDto { Account = accountDto };

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
                var publishedRecord = await _appContactRepository.GetAll().Where(x => x.TenantId == null && x.PartnerId == account.Id &&
                !x.IsProfileData && x.AccountId == null && x.EntityFk.EntityObjectStatusId != cancelledStatusId).FirstOrDefaultAsync();
                if (publishedRecord != null)
                {
                    output.IsPublished = true;
                }
                //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[End]
                return output;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<GetAccountInfoForEditOutput> GetMyAccountForEdit()
        {
            var x = new EntityDto<long>();
            
            x.Id = 0;
            var contact = await DoGetAccountForEdit(x);

            var tenant = await _tenantManager.GetByIdAsync(AbpSession.GetTenantId());

            if(tenant != null && contact != null)
            { var types  = _appEntitiesAppService.GetAllAccountTypesForTableDropdown().Result.ToList();
                var Edition1 = _appConfiguration[$"Editions:"+ tenant.EditionId.ToString()];
                
                foreach (var type in types)
                {
                    if(type.Value.ToString() == Edition1)
                    {
                        contact.AccountInfo.AccountType = type.Label;
                        contact.AccountInfo.AccountTypeId = type.Value;
                        break;
                    }
                }
            
            }

            
            return contact;
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Edit)]
        public async Task<GetAccountInfoForEditOutput> GetAccountForEdit(EntityDto<long> input)
        {
            if (input.Id == 0)
                return new GetAccountInfoForEditOutput();

            return await DoGetAccountForEdit(input);
        }

        private async Task<GetAccountInfoForEditOutput> DoGetAccountForEdit(EntityDto<long> input)
        {
            var accountInfo = await _appContactRepository.GetAll()
                //MyAccount case
                .WhereIf(input == null || input.Id == 0,
                    x => x.IsProfileData && x.ParentId == null)
                //Other Account case
                .WhereIf(input != null && input.Id != 0,
                    x => x.Id == input.Id)
                //.Include(x => x.PartnerFkList)
                .Include(x => x.AppContactPaymentMethods)
                .FirstOrDefaultAsync();

            if (accountInfo == null)
                return new GetAccountInfoForEditOutput { AccountInfo = new CreateOrEditAccountInfoDto { EntityCategories = new List<AppEntityCategoryDto>(), EntityClassifications = new List<AppEntityClassificationDto>() } };
            var output = new GetAccountInfoForEditOutput { AccountInfo = ObjectMapper.Map<CreateOrEditAccountInfoDto>(accountInfo) };
            output.AccountInfo.ContactPaymentMethods = ObjectMapper.Map<IList<AppContactPaymentMethodDto>>(accountInfo.AppContactPaymentMethods);
            //using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            //{
            var entity = await _appEntityRepository.GetAll()
                .Include(x => x.EntityCategories).ThenInclude(x => x.EntityObjectCategoryFk)
                .Include(x => x.EntityClassifications).ThenInclude(x => x.EntityObjectClassificationFk)
                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .FirstOrDefaultAsync(x => x.Id == accountInfo.EntityId);

            output.AccountInfo.EntityCategories = ObjectMapper.Map<IList<AppEntityCategoryDto>>(entity.EntityCategories);
            output.AccountInfo.EntityClassifications = ObjectMapper.Map<IList<AppEntityClassificationDto>>(entity.EntityClassifications);
            output.AccountInfo.EntityAttachments = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(entity.EntityAttachments);
            output.AccountInfo.EntityId = entity.Id;

            #region I31 fill account type from entity type in AppEntities 
            output.AccountInfo.SSIN = accountInfo.SSIN;
            output.AccountInfo.PriceLevel = accountInfo.PriceLevel;
            output.AccountInfo.AccountTypeId = entity.EntityObjectTypeId;
            output.AccountInfo.AccountType = entity.EntityObjectTypeCode;
            #endregion I31 fill account type from entity type in AppEntities 

            #region prepare account types
            //List<LookupLabelDto> tmpAccountType = await _appEntitiesAppService.GetAllAccountTypeForTableDropdown();
            //output.AccountInfo.AccountType = GetLookUPIds(accountInfo.AccountType, tmpAccountType);
            #endregion prepare account ypes

            //}

            //output.AccountInfo.ContactAddresses = ObjectMapper.Map<IList<AppContactAddressDto>>(accountInfo.AppContactAddresses);


            var branch = ObjectMapper.Map<BranchDto>(accountInfo);
            BranchForViewDto branchForViewDto = new BranchForViewDto { Branch = branch, Id = branch.Id, SubTotal = 0 };
            List<TreeNode<BranchForViewDto>> branches = new List<TreeNode<BranchForViewDto>>
            {
                new TreeNode<BranchForViewDto>() { label = branch.Name, Data = branchForViewDto}
            };
            output.AccountInfo.Branches = branches;

            //var branch = await _appContactRepository.GetAll().Where(x => x.IsProfileData && x.ParentId == null).FirstOrDefaultAsync();
            //output.AccountInfo.Branches = ObjectMapper.Map<IList<BranchDto>>(branch);

            if (output.AccountInfo != null)
                output.AccountInfo.Notes = accountInfo.EntityFk.Notes;

            if (output.AccountInfo != null)
            {
                if (output.AccountInfo.Phone1TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.Phone1TypeId);
                    output.Phone1TypeName = _lookupAppEntity == null ? "" : _lookupAppEntity.Name.ToString();
                }

                if (output.AccountInfo.Phone2TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.Phone2TypeId);
                    output.Phone2TypeName = _lookupAppEntity == null ? "" : _lookupAppEntity.Name.ToString();
                }

                if (output.AccountInfo.Phone3TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.Phone3TypeId);
                    output.Phone3TypeName = _lookupAppEntity == null ? "" : _lookupAppEntity.Name.ToString();
                }

                if (output.AccountInfo.CurrencyId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.CurrencyId);
                    output.CurrencyName = _lookupAppEntity == null ? "" : _lookupAppEntity.Name.ToString();
                }

                if (output.AccountInfo.LanguageId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.AccountInfo.LanguageId);
                    output.LanguageName = _lookupAppEntity == null ? "" : _lookupAppEntity.Name.ToString();
                }
            }
            else
            {
                output.AccountInfo = new CreateOrEditAccountInfoDto();
            }

            foreach (var item in output.AccountInfo.EntityAttachments)
            {
                item.Url = @"attachments/" + (AbpSession.TenantId == null ? -1 : AbpSession.TenantId) + @"/" + item.FileName;
            }
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var publishedAccountInfo = await _appContactRepository.GetAll()
                //MyAccount case
                .Where(x => !x.IsProfileData && x.ParentId == null && x.PartnerId == accountInfo.Id)
                .FirstOrDefaultAsync();
                output.LastChangesIsPublished = publishedAccountInfo?.LastModificationTime > accountInfo.LastModificationTime;
            }
            return output;
        }

        public async Task Connect(long id)
        {


            AppContact originalContact;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                AppContact originalPublishContactFortCurrTenant = null;
                var originalContactFortCurrTenant = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.IsProfileData == true && x.ParentId == null);

                if (originalContactFortCurrTenant != null)
                    originalPublishContactFortCurrTenant = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk).FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == originalContactFortCurrTenant.Id);

                if (originalPublishContactFortCurrTenant == null)
                    throw new UserFriendlyException("Ooppps! please publish your account first.");

                originalContact = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                .FirstOrDefaultAsync(x => x.Id == id);

                if (originalContact != null && originalContact.TenantId != null)
                {
                    originalContact = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                .FirstOrDefaultAsync(x => x.TenantId == null && x.PartnerId == id);
                    id = originalContact.Id;
                }
                var existed = await _appContactRepository.GetAll()
                    .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.PartnerId == id);

                if (existed == null)
                {
                    //ORg
                    //var objectType = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
                    //var obj = await _helper.SystemTables.GetObjectContactId();

                    //var entityForCurrTenant = new AppEntity { Name = originalContact.Name, TenantId = AbpSession.TenantId, EntityObjectTypeId = objectType, ObjectId = obj };
                    //entityForCurrTenant = await _appEntityRepository.InsertAsync(entityForCurrTenant);
                    //await CurrentUnitOfWork.SaveChangesAsync();

                    //var contactForCurrTenant = new AppContact { PartnerId = id, TenantId = AbpSession.TenantId, Name = originalContact.Name, TradeName = originalContact.TradeName, EntityId = entityForCurrTenant.Id };
                    //await _appContactRepository.InsertAsync(contactForCurrTenant);

                    //var originalEntityFortOtherTenant = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.Id == originalContact.EntityId);


                    //var entityFortOtherTenant = new AppEntity { Name = originalPublishContactFortCurrTenant.Name, TenantId = originalEntityFortOtherTenant.TenantId, EntityObjectTypeId = objectType, ObjectId = obj };
                    //entityFortOtherTenant = await _appEntityRepository.InsertAsync(entityFortOtherTenant);
                    //await CurrentUnitOfWork.SaveChangesAsync();

                    //var contactFortOtherTenant = new AppContact { PartnerId = originalPublishContactFortCurrTenant.Id, TenantId = originalEntityFortOtherTenant.TenantId, Name = originalPublishContactFortCurrTenant.Name, TradeName = originalPublishContactFortCurrTenant.TradeName, EntityId = entityFortOtherTenant.Id };
                    //await _appContactRepository.InsertAsync(contactFortOtherTenant);
                    //oRG

                    //Mariam[Start]
                    AppContactDto contactDto = new AppContactDto();
                    //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                    var profileContactofOtherTenant = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.IsProfileData == true &&
                    x.ParentId == null && x.Id == originalContact.PartnerId);
                    if (profileContactofOtherTenant != null && profileContactofOtherTenant.TenantId != null)
                    {
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]

                        var entity = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.Id == originalPublishContactFortCurrTenant.EntityId);
                        AppEntityDto entityDto = new AppEntityDto();
                        ObjectMapper.Map(entity, entityDto);
                        entityDto.Id = 0;
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                        entityDto.TenantId = profileContactofOtherTenant.TenantId;
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                        var originalEntityFortOtherTenant = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.Id == originalContact.EntityId);
                       
                        ObjectMapper.Map(originalPublishContactFortCurrTenant, contactDto);

                        //MMT
                        contactDto.PriceLevel = "MSRP";
                        //MMT
                        contactDto.PartnerId = originalPublishContactFortCurrTenant.Id;
                        contactDto.IsProfileData = false;
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                        //contactDto.TenantId = originalEntityFortOtherTenant.TenantId;
                        contactDto.TenantId = profileContactofOtherTenant.TenantId;
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                        contactDto.ContactAddresses = null;
                        contactDto.Id = 0;

                        //temp solution to test 
                        entityDto.Code = System.Guid.NewGuid().ToString();

                        var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                        contactDto.EntityId = savedEntity;

                        //temp solution to test 
                        contactDto.Code = System.Guid.NewGuid().ToString();

                        contactDto.Id = await _appEntitiesAppService.SaveContact(contactDto);
                        //Copy Addresses[Start]
                        if (originalPublishContactFortCurrTenant.AppContactAddresses!=null && originalPublishContactFortCurrTenant.AppContactAddresses.Count>0)
                        {
                            foreach (var contactAddress in originalPublishContactFortCurrTenant.AppContactAddresses)
                            {
                                AppAddress address = new AppAddress();
                                var savedAddress = await _appAddressRepository.FirstOrDefaultAsync(x => x.Id == contactAddress.AddressId);
                                if (savedAddress != null)
                                {
                                    var addressCon = await _appAddressRepository.FirstOrDefaultAsync(z => z.TenantId == contactDto.TenantId &&
                                    z.AccountId == contactDto.Id && z.Code == savedAddress.Code);

                                    if (addressCon == null)
                                    {
                                        ObjectMapper.Map(savedAddress, address);
                                        address.Id = 0;
                                        address.AccountId = contactDto.Id;
                                        address.TenantId = contactDto.TenantId;
                                        address = await _appAddressRepository.InsertAsync(address);
                                        await CurrentUnitOfWork.SaveChangesAsync();
                                    }
                                    else
                                    {
                                        address = addressCon;
                                    }
                                    AppContactAddress newContactAddress = new AppContactAddress();
                                    newContactAddress.Id = 0;
                                    newContactAddress.AddressId = address.Id;
                                    newContactAddress.ContactId = contactDto.Id;
                                    newContactAddress.AddressTypeId = contactAddress.AddressTypeId;
                                    newContactAddress.AddressCode = contactAddress.AddressCode;
                                    newContactAddress.AddressTypeCode = contactAddress.AddressTypeCode;
                                    newContactAddress.ContactCode = contactAddress.ContactCode;

                                    if (contactDto.ContactAddresses == null)
                                    {
                                        contactDto.ContactAddresses = new List<AppContactAddressDto>();
                                    }
                                        contactDto.ContactAddresses.Add(new AppContactAddressDto
                                        {
                                            AddressTypeId = contactAddress.AddressTypeId,
                                            AddressTypeIdName = contactAddress.AddressTypeCode,
                                            Code = address.Code,
                                            AddressId = address.Id,
                                            AccountId = contactDto.Id,
                                            ContactId = contactDto.Id
                                        });
                                    
                                   
                                  //  contactDto.ContactAddresses.Add(new AppContactAddressDto { Code = address.Code, AddressId = address.Id, AccountId = contactDto.Id, ContactId = contactDto.Id });
                                    await _appContactAddressRepository.InsertAsync(newContactAddress);
                                    await CurrentUnitOfWork.SaveChangesAsync();
                                }
                            }
                        }
                        //Copy Addresses [End]
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                    }
                    //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                    // Add Data for the other Tenant
                    var entity2 = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.Id == originalContact.EntityId);
                    AppEntityDto entityDto2 = new AppEntityDto();
                    ObjectMapper.Map(entity2, entityDto2);
                    entityDto2.Id = 0;
                    //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                    entityDto2.TenantId = AbpSession.TenantId;
                    //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                    AppContactDto contactDto2 = new AppContactDto();
                    ObjectMapper.Map(originalContact, contactDto2);
                    contactDto2.PriceLevel = "MSRP";
                    contactDto2.PartnerId = originalContact.Id;
                    contactDto2.IsProfileData = false;
                    contactDto2.TenantId = AbpSession.TenantId;
                    contactDto2.ContactAddresses = null;
                    contactDto2.Id = 0;

                    //temp solution to test 
                    entityDto2.Code = System.Guid.NewGuid().ToString();

                    var savedEntity2 = await _appEntitiesAppService.SaveEntity(entityDto2);

                    contactDto2.EntityId = savedEntity2;

                    //temp solution to test 
                    contactDto2.Code = System.Guid.NewGuid().ToString();

                    contactDto2.Id = await _appEntitiesAppService.SaveContact(contactDto2);
                    //Copy Addresses[Start]
                    if (originalContact.AppContactAddresses != null && originalContact.AppContactAddresses.Count > 0)
                    {
                        foreach (var contactAddress in originalContact.AppContactAddresses)
                        {
                            AppAddress address = new AppAddress();
                            var savedAddress = await _appAddressRepository.FirstOrDefaultAsync(x => x.Id == contactAddress.AddressId);
                            if (savedAddress != null)
                            {
                                var addressCon = await _appAddressRepository.FirstOrDefaultAsync(z => z.TenantId == contactDto2.TenantId &&
                                z.AccountId == contactDto2.Id && z.Code == savedAddress.Code);

                                if (addressCon == null)
                                {
                                    ObjectMapper.Map(savedAddress, address);
                                    address.Id = 0;
                                    address.AccountId = contactDto2.Id;
                                    address.TenantId = contactDto2.TenantId;
                                    address = await _appAddressRepository.InsertAsync(address);
                                    await CurrentUnitOfWork.SaveChangesAsync();
                                }
                                else
                                {
                                    address = addressCon;
                                }
                                if (contactDto2.ContactAddresses == null)
                                    contactDto2.ContactAddresses = new List<AppContactAddressDto>();
                                AppContactAddress newContactAddress = new AppContactAddress();
                                newContactAddress.Id = 0;
                                newContactAddress.AddressId = address.Id;
                                newContactAddress.ContactId = contactDto2.Id;
                                newContactAddress.AddressTypeId = contactAddress.AddressTypeId;
                                newContactAddress.AddressCode = contactAddress.AddressCode;
                                newContactAddress.AddressTypeCode = contactAddress.AddressTypeCode;
                                newContactAddress.ContactCode = contactAddress.ContactCode;
                                
                                contactDto2.ContactAddresses.Add(new AppContactAddressDto
                                {
                                    AddressTypeId = contactAddress.AddressTypeId,
                                    AddressTypeIdName = contactAddress.AddressTypeCode,
                                    Code = address.Code,
                                    AddressId = address.Id,
                                    AccountId = contactDto2.Id,
                                    ContactId = contactDto2.Id
                                });

                                // contactDto.ContactAddresses.Add(new AppContactAddressDto { Code = address.Code, AddressId = address.Id, AccountId = contactDto2.Id, ContactId = contactDto2.Id });
                                await _appContactAddressRepository.InsertAsync(newContactAddress);
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }
                        }
                    }
                    //Copy Addresses [End]
                    //MMT33-3
                    // var myAccountProfile = await _appContactRepository.GetAll().Where(e => e.TenantId == AbpSession.TenantId && e.PartnerId == null && e.ParentId == null && e.IsProfileData == true).FirstOrDefaultAsync();
                    // if (myAccountProfile != null)
                    // {
                    //var myAccountPublish = await _appContactRepository.GetAll().Where(e => e.TenantId == null && e.PartnerId == myAccountProfile.Id && e.ParentId == null && e.IsProfileData == false).FirstOrDefaultAsync();
                    //if (myAccountPublish != null)
                    //  {
                    var publishedContactofOtherTenant = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.Id == id);
                    if (publishedContactofOtherTenant != null)
                    {
                        var marketplacePriceLevel = await _appMarketplaceAccountsPriceLevelsRepo.GetAll()
                                .FirstOrDefaultAsync(a => a.ConnectedAccountSSIN == publishedContactofOtherTenant.SSIN
                                && a.AccountSSIN == originalPublishContactFortCurrTenant.SSIN);
                        if (marketplacePriceLevel != null)
                        {
                            marketplacePriceLevel.PriceLevel = "MSRP";
                            await _appMarketplaceAccountsPriceLevelsRepo.UpdateAsync(marketplacePriceLevel);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                        else
                        {
                            AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels newPriceLevel = new AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels();
                            newPriceLevel.AccountSSIN = originalPublishContactFortCurrTenant.SSIN;
                            newPriceLevel.ConnectedAccountSSIN = publishedContactofOtherTenant.SSIN;
                            newPriceLevel.PriceLevel = "MSRP";
                            await _appMarketplaceAccountsPriceLevelsRepo.InsertAsync(newPriceLevel);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }

                        var marketplacePriceLevelRev = await _appMarketplaceAccountsPriceLevelsRepo.GetAll()
                                   .FirstOrDefaultAsync(a => a.ConnectedAccountSSIN == originalPublishContactFortCurrTenant.SSIN
                                   && a.AccountSSIN == publishedContactofOtherTenant.SSIN);
                        if (marketplacePriceLevelRev != null)
                        {
                            marketplacePriceLevelRev.PriceLevel = "MSRP";
                            await _appMarketplaceAccountsPriceLevelsRepo.UpdateAsync(marketplacePriceLevelRev);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                        else
                        {
                            AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels newPriceLevel = new AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels();
                            newPriceLevel.AccountSSIN = publishedContactofOtherTenant.SSIN;
                            newPriceLevel.ConnectedAccountSSIN = originalPublishContactFortCurrTenant.SSIN;
                            newPriceLevel.PriceLevel = "MSRP";
                            await _appMarketplaceAccountsPriceLevelsRepo.InsertAsync(newPriceLevel);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                    }
                    //MMT33-3

                    //Connect Current Account branches with the other account
                    await ConnectBranches(originalPublishContactFortCurrTenant.Id, id);
                    await ConnectBranches(id, originalPublishContactFortCurrTenant.Id);

                    //Mariam[End]
                    //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
                    if (profileContactofOtherTenant != null && profileContactofOtherTenant.TenantId != null)
                    {
                        var tenantObject = await TenantManager.GetByIdAsync(int.Parse(profileContactofOtherTenant.TenantId.ToString()));
                        if (tenantObject != null)
                        {
                            string tenancyName = tenantObject.TenancyName;
                            var adminUser = await _userManager.FindByNameAsync("admin@" + tenancyName);
                            if (adminUser != null)
                            {
                                var myTenantObject = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                                //T-SII-20220413.0001,1 MMT 05/15/2023 -The notification message Enhachment[Start]
                                string accProfileUrl = _appConfiguration["App:ClientRootAddress"] + "app/main/account/view/" + originalPublishContactFortCurrTenant.Id.ToString() + "?tab=ProfileView";
                                await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(profileContactofOtherTenant.TenantId, adminUser.Id),
                                    "Tenant <a href=\"" + accProfileUrl +"\">" + myTenantObject.Name + "</a> has been connected to you", 
                                    Abp.Notifications.NotificationSeverity.Info, new Abp.Domain.Entities.EntityIdentifier(typeof(AppContact), originalPublishContactFortCurrTenant.Id));
                                //T-SII-20220413.0001,1 MMT 05/15/2023 -The notification message Enhachment[End]
                            }
                        }
                    }
                    //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]
                    //Contact[start]
                     var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                    var contactsInfo = _appContactRepository.GetAll().Where(x => x.TenantId == null && !x.IsProfileData &&
                                 x.ParentId == id && x.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && x.PartnerId != null).ToList(); // First level of branches

                    foreach (var contactObj in contactsInfo)
                    {
                        var contactEntity = await _appEntityRepository.GetAll().AsNoTracking()
                                             .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                             .Include(x => x.EntityExtraData)
                                             .AsNoTracking()
                                             .FirstOrDefaultAsync(x => x.Id == contactObj.EntityId);
                        //AppEntityDto entityDto = new AppEntityDto();
                        AppEntityDto contactEntityDto = new AppEntityDto();
                        ObjectMapper.Map(contactEntity, contactEntityDto);
                        contactEntityDto.Id = 0;
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                        contactEntityDto.TenantId = AbpSession.TenantId;
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                        AppContactDto branchContactDto = new AppContactDto();
                        ObjectMapper.Map(contactObj, branchContactDto);

                        branchContactDto.PartnerId = contactObj.Id;
                        branchContactDto.IsProfileData = false;
                        branchContactDto.ParentId = contactDto2.Id;
                        branchContactDto.TenantId = AbpSession.TenantId;
                        branchContactDto.ContactAddresses = null;
                        branchContactDto.Id = 0;
                        branchContactDto.AccountId = contactDto2.Id;


                        if (contactEntity.EntityAttachments != null)
                        {
                            ObjectMapper.Map<IList<AppEntityAttachmentDto>>(contactEntity.EntityAttachments);
                        }
                        if (contactEntityDto.EntityExtraData != null)
                        {
                            contactEntityDto.EntityExtraData.ForEach(x => x.Id = 0);
                        }

                        //temp solution to test 
                        contactEntityDto.Code = System.Guid.NewGuid().ToString();

                        var savedContactEntity = await _appEntitiesAppService.SaveEntity(contactEntityDto);
                        branchContactDto.EntityId = savedContactEntity;

                        //temp solution to test 3e121212q   1
                        //branchContactDto.Code = System.Guid.NewGuid().ToString();

                        branchContactDto.Id = await _appEntitiesAppService.SaveContact(branchContactDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    //Contacts[End]
                    var contactsInfo2 = _appContactRepository.GetAll().Where(x => x.TenantId == null && !x.IsProfileData &&
                                 x.ParentId == originalPublishContactFortCurrTenant.Id && x.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && x.PartnerId != null).ToList(); // First level of branches

                    foreach (var contactObj in contactsInfo2)
                    {
                        var contactEntity = await _appEntityRepository.GetAll().AsNoTracking()
                                             .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                             .Include(x => x.EntityExtraData)
                                             .AsNoTracking()
                                             .FirstOrDefaultAsync(x => x.Id == contactObj.EntityId);
                       // AppEntityDto entityDto = new AppEntityDto();
                        AppEntityDto contactEntityDto = new AppEntityDto();
                        ObjectMapper.Map(contactEntity, contactEntityDto);
                        contactEntityDto.Id = 0;
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                        if (profileContactofOtherTenant != null)
                            contactEntityDto.TenantId = profileContactofOtherTenant.TenantId;
                        else
                            continue;
                        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                        AppContactDto branchContactDto = new AppContactDto();
                        ObjectMapper.Map(contactObj, branchContactDto);

                        branchContactDto.PartnerId = contactObj.Id;
                        branchContactDto.IsProfileData = false;
                        branchContactDto.ParentId = contactDto.Id;
                        if (profileContactofOtherTenant != null)
                            branchContactDto.TenantId = profileContactofOtherTenant.TenantId;
                        else
                            continue;
                        branchContactDto.ContactAddresses = null;
                        branchContactDto.Id = 0;
                        branchContactDto.AccountId = contactDto.Id;


                        if (contactEntity.EntityAttachments != null)
                        {
                            ObjectMapper.Map<IList<AppEntityAttachmentDto>>(contactEntity.EntityAttachments);
                        }
                        if (contactEntityDto.EntityExtraData != null)
                        {
                            contactEntityDto.EntityExtraData.ForEach(x => x.Id = 0);
                        }

                        //temp solution to test 
                        contactEntityDto.Code = System.Guid.NewGuid().ToString();

                        var savedContactEntity = await _appEntitiesAppService.SaveEntity(contactEntityDto);
                        branchContactDto.EntityId = savedContactEntity;

                        //temp solution to test 
                        //branchContactDto.Code = System.Guid.NewGuid().ToString();

                        branchContactDto.Id = await _appEntitiesAppService.SaveContact(branchContactDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }

                }
            }

        }
        //Mariam[Start]

        protected async Task ConnectBranches(long branchesAccountId, long connectAccountId)
        {
            // x.AccountId == branchesAccountId &&
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            var branchesPublishedParentContact = new AppContact();
            var branchesParentContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.Id == branchesAccountId);
            if (branchesParentContact.TenantId != null)
            {
                branchesPublishedParentContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.PartnerId == branchesAccountId
                && x.TenantId == null);
            }
            else
            {
                branchesPublishedParentContact = branchesParentContact;
            }

            int? connectTenant = null;
            var publishedConnectContact = new AppContact();
            var connectAccountContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.Id == connectAccountId);
            if (connectAccountContact.TenantId != null)
            {
                publishedConnectContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.PartnerId == connectAccountId
                && x.TenantId == null);
                //Mariam[Start]
                if (connectAccountContact != null)
                {
                    connectTenant = int.Parse(connectAccountContact.TenantId.ToString());
                }


                //Mariam[End]
            }
            else
            {
                var orginialConnectContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.Id == connectAccountContact.PartnerId &&
                x.TenantId != null && x.ParentId == null);
                //Mariam[Start]
                if (orginialConnectContact != null)
                {
                    connectTenant = int.Parse(orginialConnectContact.TenantId.ToString());
                }

                //Mariam[End]
                publishedConnectContact = connectAccountContact;
            }
            if (connectTenant == null)
                return;

            var connectMainAccountContact = new AppContact();
            //if (branchesPublishedParentContact.AccountId == null && branchesPublishedParentContact.ParentId ==null)
            //{
            //    publishAccountContact = branchesPublishedParentContact;
            //}
            //var publishAccountContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == null && 
            //x.Id == branchesPublishedParentContact.AccountId && x.ParentId == null);
            if (branchesPublishedParentContact == null )
            { return; }
            if ((branchesPublishedParentContact.AccountId == null && branchesPublishedParentContact.ParentId == null))
            {

                connectMainAccountContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == connectTenant &&
             x.PartnerId == branchesPublishedParentContact.Id && x.ParentId == null);
            }
            else
            {
                connectMainAccountContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == connectTenant &&
             x.PartnerId == branchesPublishedParentContact.AccountId && x.ParentId == null);

            }
            if (connectMainAccountContact == null && branchesPublishedParentContact.ParentId == null)
            {
                connectMainAccountContact = branchesPublishedParentContact;
            }
            var connectedBranchContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == connectTenant &&
            x.PartnerId == branchesPublishedParentContact.Id);

            var connectedParentContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == connectTenant &&
           x.PartnerId == branchesPublishedParentContact.ParentId);

            if (connectedBranchContact == null)
            {
                var entityBranch = await _appEntityRepository.GetAll().AsNoTracking()
                                  .FirstOrDefaultAsync(x => x.Id == branchesPublishedParentContact.EntityId);
                var objectType = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
                var obj = await _helper.SystemTables.GetObjectContactId();

                //mmm
                var contact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses)
                   .ThenInclude(x => x.AddressFk).AsNoTracking()
                   .FirstOrDefaultAsync(x => x.Id == branchesPublishedParentContact.Id);

                var entity = await _appEntityRepository.GetAll().AsNoTracking()
                                   .FirstOrDefaultAsync(x => x.Id == contact.EntityId);

                AppEntityDto entityDto = new AppEntityDto();
                ObjectMapper.Map(entity, entityDto);
                entityDto.Id = 0;
                //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                entityDto.TenantId = connectTenant;
                //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                AppContactDto contactDto = new AppContactDto();
                ObjectMapper.Map(contact, contactDto);

                contactDto.PartnerId = contact.Id;
                contactDto.IsProfileData = false;
                contactDto.TenantId = connectTenant;
                contactDto.ContactAddresses = null;
                contactDto.Id = 0;
                if (connectMainAccountContact != null)
                {
                    contactDto.AccountId = connectMainAccountContact.Id;
                }
                else { return; }

                contactDto.ParentId = connectedParentContact.Id;
                //if (publishContact != null)
                //{
                //    contactDto.Id = publishContact.Id;
                //    entityDto.Id = publishContact.EntityId;
                //}

                //temp solution to test 
                entityDto.Code = System.Guid.NewGuid().ToString();

                var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);
                await CurrentUnitOfWork.SaveChangesAsync();
                contactDto.EntityId = savedEntity;

                //temp solution to test 
                contactDto.Code = System.Guid.NewGuid().ToString();

                contactDto.Id = await _appEntitiesAppService.SaveContact(contactDto);

                // Remove Addresses
                //if (contact != null)
                //{
                //    var publishAddressesIds = publishContact.AppContactAddresses.Select(x => x.AddressId).ToArray();
                //    var publishContactAddressesIds = publishContact.AppContactAddresses.Select(x => x.Id).ToArray();

                //    await _appContactAddressRepository.DeleteAsync(x => publishContactAddressesIds.Contains(x.Id));
                //    await _appAddressRepository.DeleteAsync(x => publishAddressesIds.Contains(x.Id));
                //}

                // Add Addresses
                var addressesIds = contact.AppContactAddresses.Select(x => x.AddressId).Distinct().ToArray();

                var addresses = _appAddressRepository.GetAll().Where(x => addressesIds.Contains(x.Id)).ToList();
                //Copy Addresses[Start]
                if (contact.AppContactAddresses!= null && contact.AppContactAddresses.Count>0)
                {
                    foreach (var contactAddress in contact.AppContactAddresses)
                    {
                        var savedAddress = await _appAddressRepository.FirstOrDefaultAsync(x => x.Id == contactAddress.AddressId);
                        AppAddress address = new AppAddress();
                        if (savedAddress != null)
                        {
                            var addressCon = await _appAddressRepository.GetAll().FirstOrDefaultAsync(z=>z.Code== savedAddress.Code && z.TenantId == contactDto.TenantId && z.AccountId == contactDto.Id);
                            if (addressCon == null)
                            {
                                ObjectMapper.Map(savedAddress, address);
                                address.Id = 0;
                                address.AccountId = contactDto.Id;
                                address.TenantId = contactDto.TenantId;
                                address = await _appAddressRepository.InsertAsync(address);
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }
                            else {
                                address = addressCon;
                            }
                            AppContactAddress newContactAddress = new AppContactAddress();
                            newContactAddress.Id = 0;
                            newContactAddress.AddressId = address.Id;
                            newContactAddress.ContactId = contactDto.Id;
                            newContactAddress.AddressTypeId = contactAddress.AddressTypeId;
                            if (contactDto.ContactAddresses == null)
                                contactDto.ContactAddresses = new List<AppContactAddressDto>();
                            contactDto.ContactAddresses.Add(new AppContactAddressDto
                                {
                                    AddressTypeId = contactAddress.AddressTypeId,
                                    AddressTypeIdName = contactAddress.AddressTypeCode,
                                    Code = address.Code,
                                    AddressId = address.Id,
                                    AccountId = contactDto.Id,
                                    ContactId = contactDto.Id
                                });
                            // 
                           // contactDto.ContactAddresses.Add(new AppContactAddressDto { Code = address.Code, AddressId = address.Id, AccountId = contactDto.Id, ContactId = contactDto.Id });
                            await _appContactAddressRepository.InsertAsync(newContactAddress);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                    } 
                }
                //Copy Addresses [End]
                //foreach (var contactAddress in contact.AppContactAddresses)
                //{
                //    var savedAddress = await _appAddressRepository.FirstOrDefaultAsync(x => x.Id == contactAddress.AddressId);
                //    AppAddress address = new AppAddress();
                //    AppAddress existedInPublish = null;

                //   // if (contactDto.ContactAddresses != null)
                //        existedInPublish = await _appAddressRepository.FirstOrDefaultAsync(x => x.Code == contactAddress.AddressFk.Code && x.TenantId == connectTenant);

                //    if (existedInPublish == null)
                //    {
                //        ObjectMapper.Map(savedAddress, address);
                //        address.Id = 0;
                //        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                //        address.TenantId = connectTenant;
                //        //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                //        address = await _appAddressRepository.InsertAsync(address);
                //        await CurrentUnitOfWork.SaveChangesAsync();
                //    }
                //    else
                //    {
                //        address.Id = existedInPublish.Id;
                //        address.Code = existedInPublish.Code;
                //    }


                //    AppContactAddress newContactAddress = new AppContactAddress();
                //    //ObjectMapper.Map(contactAddress, newContactAddress);
                //    newContactAddress.Id = 0;
                //    newContactAddress.AddressId = address.Id;
                //    newContactAddress.ContactId = contactDto.Id;
                //    newContactAddress.AddressTypeId = contactAddress.AddressTypeId;
                //    if (contactDto.ContactAddresses == null)
                //        contactDto.ContactAddresses = new List<AppContactAddressDto>();
                    
                //    contactDto.ContactAddresses.Add(new AppContactAddressDto { Code = address.Code, AddressId = address.Id });
                //    //var aId = contact.AppContactAddresses.FirstOrDefault(x => x.AddressId == contactAddress.Id && x.ContactId ==);
                //    //await _appContactAddressRepository.InsertAsync(new AppContactAddress { AddressId = address.Id, ContactId = contactDto.Id, AddressTypeId = aId.AddressTypeId });
                //    await _appContactAddressRepository.InsertAsync(newContactAddress);

                //}
                await CurrentUnitOfWork.SaveChangesAsync();

                //Contact[start]
                var contactsInfo = _appContactRepository.GetAll().Where(x => x.TenantId == null && !x.IsProfileData &&
                             x.ParentId == branchesAccountId && x.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && x.PartnerId != null).ToList(); // First level of branches

                foreach (var contactObj in contactsInfo)
                {
                    var contactEntity = await _appEntityRepository.GetAll().AsNoTracking()
                                         .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                         .Include(x => x.EntityExtraData)
                                         .AsNoTracking()
                                         .FirstOrDefaultAsync(x => x.Id == contactObj.EntityId);

                    AppEntityDto contactEntityDto = new AppEntityDto();
                    ObjectMapper.Map(contactEntity, contactEntityDto);
                    entityDto.Id = 0;
                    //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[Start]
                    entityDto.TenantId = connectTenant;
                    //T-SII-20220920.0002, MMT 09/27/2022 - I see multiple occurrences (20 copies) of Brisco on the Marketplace / account[End]
                    AppContactDto branchContactDto = new AppContactDto();
                    ObjectMapper.Map(contactObj, branchContactDto);

                    branchContactDto.PartnerId = contactObj.Id;
                    branchContactDto.IsProfileData = false;
                    branchContactDto.ParentId = contactDto.Id;
                    branchContactDto.TenantId = connectTenant;
                    branchContactDto.ContactAddresses = null;
                    branchContactDto.Id = 0;
                    branchContactDto.AccountId = connectMainAccountContact.Id;


                    if (contactEntity.EntityAttachments != null)
                    {
                        ObjectMapper.Map<IList<AppEntityAttachmentDto>>(contactEntity.EntityAttachments);
                    }


                    //temp solution to test 
                    contactEntityDto.Code = System.Guid.NewGuid().ToString();

                    var savedContactEntity = await _appEntitiesAppService.SaveEntity(contactEntityDto);
                    branchContactDto.EntityId = savedContactEntity;

                    //temp solution to test 
                    branchContactDto.Code = System.Guid.NewGuid().ToString();

                    branchContactDto.Id = await _appEntitiesAppService.SaveContact(branchContactDto);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                //Contacts[End]


            }
            var branchInfo = _appContactRepository.GetAll().Where(x => x.TenantId == null && !x.IsProfileData &&
                           x.ParentId == branchesAccountId && x.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId && x.PartnerId != null).ToList(); // First level of branches

            foreach (var branchObj in branchInfo)
            {
                await ConnectBranches(branchObj.Id, connectAccountId);
            }



        }
        //Mariam[End]

        public async Task Disconnect(long id)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                long? otherTenantId = null;
                long? partnerId = null;
                var existed = await _appContactRepository.GetAll()
                .FirstOrDefaultAsync(x => x.PartnerId == id && x.TenantId==AbpSession.TenantId);
                if (existed == null)
                {
                    existed = await _appContactRepository.GetAll()
                .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == AbpSession.TenantId);

                }
                else
                { id = existed.Id; }

                if (existed != null)
                {
                    partnerId = existed.PartnerId;
                    var otherTenantPublished = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.ParentId == null && x.Id== existed.PartnerId);
                    if (otherTenantPublished != null)
                    {
                        var otherTenantOrgin= await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId != null && x.IsProfileData == true && x.ParentId == null && x.Id == otherTenantPublished.PartnerId);
                        if (otherTenantOrgin != null)
                            otherTenantId = otherTenantOrgin.TenantId;
                    }
                }
                else { return; }
                
                var originalContactFortCurrTenant = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.IsProfileData == true && x.ParentId == null);
                var originalPublishContactFortCurrTenant = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == originalContactFortCurrTenant.Id);
                var originalConnectRecordFortOtherTenant = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId== otherTenantId && x.PartnerId == originalPublishContactFortCurrTenant.Id);
                
                if (existed != null)
                {
                   
                    //Mariam[Start]
                    var contactsInfo = _appContactRepository.GetAll().Where(x => x.AccountId == existed.Id).ToList();
                    foreach (var contactRec in contactsInfo)
                    {
                        await _appEntityRepository.DeleteAsync(contactRec.EntityId);
                        await _appContactRepository.DeleteAsync(contactRec.Id);
                        await _appAddressRepository.DeleteAsync(z=>z.AccountId == existed.Id);
                    }
                    if (originalConnectRecordFortOtherTenant != null)
                    {
                        var otherContactsInfo = _appContactRepository.GetAll().Where(x => x.AccountId == originalConnectRecordFortOtherTenant.Id).ToList();
                        foreach (var contactRec in otherContactsInfo)
                        {
                            await _appEntityRepository.DeleteAsync(contactRec.EntityId);
                            await _appContactRepository.DeleteAsync(contactRec.Id);
                            await _appAddressRepository.DeleteAsync(z => z.AccountId == originalConnectRecordFortOtherTenant.Id);
                        }
                    }
                    //Mariam[End]



                    await _appEntityRepository.DeleteAsync(existed.EntityId);
                    await _appContactRepository.DeleteAsync(existed.Id);

                    if (originalConnectRecordFortOtherTenant != null)
                    {
                        await _appEntityRepository.DeleteAsync(originalConnectRecordFortOtherTenant.EntityId);
                        await _appContactRepository.DeleteAsync(originalConnectRecordFortOtherTenant.Id);
                    }
                    //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[Start]
                    var PublishContactFortDisconnectFromTenant = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.Id == partnerId);
                    if (PublishContactFortDisconnectFromTenant != null)
                    {
                        var profileContactofOtherTenant = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.Id == PublishContactFortDisconnectFromTenant.PartnerId);
                        if (profileContactofOtherTenant != null && profileContactofOtherTenant.TenantId != null)
                        {
                            var tenantObject = await TenantManager.GetByIdAsync(int.Parse(profileContactofOtherTenant.TenantId.ToString()));
                            if (tenantObject != null)
                            {
                                string tenancyName = tenantObject.TenancyName;
                                var adminUser = await _userManager.FindByNameAsync("admin@" + tenancyName);
                                if (adminUser != null)
                                {
                                    var myTenantObject = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                                    //T-SII-20220413.0001,1 MMT 05/15/2023 -The notification message Enhachment[Start]
                                    string accProfileUrl = _appConfiguration["App:ClientRootAddress"] + "app/main/account/view/" + originalPublishContactFortCurrTenant.Id.ToString() + "?tab=ProfileView";
                                    await _appNotifier.SendMessageAsync(new Abp.UserIdentifier(profileContactofOtherTenant.TenantId, adminUser.Id),
                                        "Tenant <a  href=\"" + accProfileUrl + "\">" + myTenantObject.Name + "</a>  has been disconnected from you",
                                        Abp.Notifications.NotificationSeverity.Info,
                                        new Abp.Domain.Entities.EntityIdentifier(typeof(AppContact), originalPublishContactFortCurrTenant.Id));
                                    //T-SII-20220413.0001,1 MMT 05/15/2023 -The notification message Enhachment[End]
                                }
                            }
                        }
                    }
                    //T-SII-20221013.0006,1 MMT 11/02/2022 Notify the destination tenant that another tenant connected to him[End]
                }

            }

        }


        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<GetAccountInfoForEditOutput> CreateOrEditMyAccount(CreateOrEditAccountInfoDto input)
        {
            if (input.AccountLevel != AccountLevelEnum.Profile)
                throw new UserFriendlyException("Ooppps! this function is not allowed...");

            return await Update(input);
        }

        public async Task<bool> UpdateConnectedAccountPriceLevel(long id, string priceLevel)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
               

                    var account = await _appContactRepository.GetAll().Where(e => e.Id == id).FirstOrDefaultAsync();
                if (account != null)
                {
                    if (!string.IsNullOrEmpty(priceLevel)) { account.PriceLevel = priceLevel; }
                    await _appContactRepository.UpdateAsync(account);
                }
                //MMT33-3
                var myAccountProfile = await _appContactRepository.GetAll().Where(e => e.TenantId == AbpSession.TenantId && e.PartnerId == null && e.ParentId == null && e.IsProfileData == true).FirstOrDefaultAsync();
                if (myAccountProfile != null)
                {
                    var myAccountPublish = await _appContactRepository.GetAll().Where(e => e.TenantId == null && e.PartnerId == myAccountProfile.Id && e.ParentId == null && e.IsProfileData == false).FirstOrDefaultAsync();
                    if (myAccountPublish != null)
                    {
                        
                        var marketplacePriceLevel = await _appMarketplaceAccountsPriceLevelsRepo.GetAll()
                            .FirstOrDefaultAsync(a => a.ConnectedAccountSSIN == account.SSIN && a.AccountSSIN == myAccountPublish.SSIN);
                        if (marketplacePriceLevel != null)
                        {
                            marketplacePriceLevel.PriceLevel = priceLevel;
                            await _appMarketplaceAccountsPriceLevelsRepo.UpdateAsync(marketplacePriceLevel);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                        else {
                            AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels newPriceLevel = new AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels();
                            newPriceLevel.AccountSSIN = myAccountPublish.SSIN;
                            newPriceLevel.ConnectedAccountSSIN = account.SSIN;
                            newPriceLevel.PriceLevel = priceLevel;
                            await _appMarketplaceAccountsPriceLevelsRepo.InsertAsync(newPriceLevel);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                    }
                }
                //MMT33-3
                return true;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<GetAccountInfoForEditOutput> CreateOrEditAccount(CreateOrEditAccountInfoDto input)
        {
            if (input.UseDTOTenant == false)
            {
                if (input.AccountLevel == AccountLevelEnum.Profile)
                    throw new UserFriendlyException("Ooppps! this function is not allowed...");
            }


            return await Update(input);
        }

        private async Task<GetAccountInfoForEditOutput> Update(CreateOrEditAccountInfoDto input)
        {
            AppContact contactOriginal;
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
            {  var  partnerEntityObjectType = await _helper.SystemTables.GetEntityObjectTypeParetner();
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

            entity.Id = contactOriginal == null ? 0 : contactOriginal.EntityId;

            contact.Id = contactOriginal == null ? 0 : contactOriginal.Id;


            var isManual = (contact.TenantId == AbpSession.TenantId && !contact.IsProfileData && contact.ParentId == null && contact.PartnerId == null);
            if (string.IsNullOrEmpty(input.SSIN))
            {if (isManual)
                {
                    var profileSSIN = "";
                    var accountInfo = await _appContactRepository.GetAll().Include(e=> e.EntityFk)
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
                            ObjectMapper.Map(accountInfo.EntityFk, accountInfoEntity);
                            profileSSIN = await _helper.SystemTables.GenerateSSIN(contactObjectId, accountInfoEntity); }

                        if (!string.IsNullOrEmpty(profileSSIN))
                        {
                            accountInfo.EntityFk.SSIN = profileSSIN;
                            await _appEntityRepository.UpdateAsync(accountInfo.EntityFk);
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

            contact.EntityId = savedEntity;

            long newId = 0;
            if (input.ReturnId)
            { newId = await _appEntitiesAppService.SaveContact(contact); }
            else
            { await _appEntitiesAppService.SaveContact(contact); }

            await CreateAdminContact();

            await CurrentUnitOfWork.SaveChangesAsync();
            return await GetAccountForEdit(new EntityDto<long> { Id = newId });

        }
        //MARIAM
        private async Task CreateAdminContact()
        {
            //MARIAM
            if (AbpSession.TenantId != null)
            {
                var tenantObj = TenantManager.GetById(int.Parse(AbpSession.TenantId.ToString()));
                if (tenantObj != null)
                {

                    var adminUser = await _userManager.FindByNameAsync("admin@" + tenantObj.TenancyName);
                    if (adminUser != null && adminUser.Id != 0)
                    {
                        var contactEntityExtraData = _appEntityExtraDataRepository.GetAll().FirstOrDefault(x => x.AttributeId == 715 && x.AttributeValue == adminUser.Id.ToString());
                        if (contactEntityExtraData == null)
                        {
                            if (AbpSession.TenantId != null && AbpSession.TenantId != 0)
                            {
                                var account = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.IsProfileData && x.ParentId == null && x.PartnerId == null && x.AccountId == null);
                                if (account != null)
                                {
                                    ContactDto contactDto = new ContactDto();
                                    contactDto.AccountId = account.Id;
                                    contactDto.FirstName = adminUser.Name;
                                    contactDto.LastName = adminUser.Surname;
                                    contactDto.EMailAddress = adminUser.EmailAddress;
                                    contactDto.UserId = adminUser.Id;
                                    contactDto.Name = adminUser.Name + " " + adminUser.Surname;
                                    contactDto.UserName = adminUser.UserName;
                                    contactDto.TradeName = "";
                                    contactDto.ParentId = account.Id;
                                    //temp solution to test 
                                    contactDto.Code = System.Guid.NewGuid().ToString();
                                    ContactDto savedContactDto = await CreateOrEditContact(contactDto);

                                }
                            }
                        }
                    }
                }
            }
            //MARIAM
        }
        //MARIAM
        //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[Start]
        [AbpAuthorize(AppPermissions.Pages_Accounts_Publish)]
        public async Task UnPublishProfile()
        {
            var contact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.IsProfileData && x.AccountId == null);
            if (contact != null)
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var publishedContact = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == contact.Id);
                    if (publishedContact != null)
                    {
                        var publishedContactEntity = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == null && x.Id == publishedContact.EntityId);
                        if (publishedContactEntity != null)
                        {

                            // publishedContactEntity.EntityObjectStatusCode = "CANCELLED";
                            publishedContactEntity.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusContactCancelled();
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                    }
                }
            }

        }
        //T-SII-20221004.0002, MMT 10.26.2022 Add unpublish option to Account Profile page[Start]

        [AbpAuthorize(AppPermissions.Pages_Accounts_Publish)]
        public async Task PublishProfile()
        {
            bool sync = false;

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var contact = await _appContactRepository.GetAll().AsNoTracking()
                    .Include(e => e.EntityFk)
                    .Include(x => x.AppContactAddresses)
                    .ThenInclude(x => x.AddressFk).AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId 
                                           && x.IsProfileData == true && x.AccountId == null);
                
                if (contact != null)
                { 
                    var publishContact = await _appMarketplaceContactRepository.GetAll()
                                                .AsNoTracking().Include(x => x.ContactAddresses)
                                                .FirstOrDefaultAsync(x => x.TenantId == null 
                                                && x.IsProfileData == true
                                                && x.OwnerId == contact.TenantId
                                                && x.SSIN == contact.SSIN);
                    
                    // if profile already published
                    if (publishContact != null && ! sync) return;
 
                    CreateOrEditMarketplaceAccountInfoDto createOrEditAccountInfoDto = new CreateOrEditMarketplaceAccountInfoDto();
                    ObjectMapper.Map(contact, createOrEditAccountInfoDto);
                    var appMarketplaceContact = await _iCreateMarketplaceAccount.CreateOrEditMarketplaceAccount(createOrEditAccountInfoDto, sync);
                }
            }
        }

        public async Task ApplyRelationOnProfile(long input)
        {

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var marketplaceContact = await _appMarketplaceContactRepository.GetAll()
                    .AsNoTracking()
                    .Include(x => x.ContactAddresses).ThenInclude(x => x.AddressFk).AsNoTracking()
                    .FirstOrDefaultAsync(x =>  
                    x.IsProfileData == true && x.Id == input);
                 
                if (marketplaceContact != null)
                {
                    var entity = await _appEntityRepository.GetAll().AsNoTracking().Include(x => x.EntityCategories)
                                        .Include(x => x.EntityClassifications)
                                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(x => x.TenantId == null 
                                         && x.Id == input);
                     
                    AppEntityDto entityDto = new AppEntityDto();
                    ObjectMapper.Map(entity, entityDto);
                    entityDto.Id = 0;
                    entityDto.Code = "";
                    entityDto.TenantId = AbpSession.TenantId;
                    var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                    AppContactDto contactDto = new AppContactDto();
                    ObjectMapper.Map(marketplaceContact, contactDto);
                    //contactDto.PartnerId = marketplaceContact.Id;
                    contactDto.IsProfileData = false;
                    contactDto.TenantId = AbpSession.TenantId; 
                    contactDto.Id = 0;
                    contactDto.EntityId = savedEntity;
                    
                    foreach (var contactAddress in contactDto.ContactAddresses)
                    {
                        contactAddress.Id = 0;
                        //contactAddress.AddressId = 0;
                        contactAddress.AccountId = 0;
                         
                        contactAddress.AddressFk.Id = 0;
                        //contactAddress.AddressFk.TenantId = AbpSession.TenantId;
                        contactAddress.AddressFk.AccountId = 0;
                         

                    }
                    var contactDto_Id = await _appEntitiesAppService.SaveContact(contactDto);
                   

                    // Publish Account related branches [Start]
                    var personEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();

                    var branchInfo = await _appMarketplaceContactRepository.GetAll()
                    .Include(x => x.ContactAddresses).ThenInclude(x => x.AddressFk)
                    .Where(x =>
                       x.IsProfileData == true
                    && x.AccountId == marketplaceContact.AccountId
                    && x.ParentId == marketplaceContact.Id
                    && x.EntityObjectTypeId != personEntityObjectTypeId).ToListAsync(); // First level of branches

                    foreach (var branchObj in branchInfo)
                    {
                        await ApplyRelationOnBranch(branchObj, contactDto_Id);
                    }

                    //Publish Account related members[End]
                    var contactInfo = await _appMarketplaceContactRepository.GetAll()
                   .Include(x => x.ContactAddresses).ThenInclude(x => x.AddressFk)
                   .Where(x =>
                      x.IsProfileData == true
                   && x.AccountId == marketplaceContact.AccountId
                   && x.ParentId == marketplaceContact.Id
                   && x.EntityObjectTypeId == personEntityObjectTypeId).ToListAsync(); // First level of branches

                    foreach (var contactObj in contactInfo)
                    {
                        await ApplyRelationOnMember(contactObj, contactDto_Id);
                    }
                    //End
                }
            }
        }
        public async Task ApplyRelationOnBranch(AppMarketplaceContact marketplaceContact, long accountId)
        {

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (marketplaceContact != null)
                {
                    var entity = await _appEntityRepository.GetAll().AsNoTracking().Include(x => x.EntityCategories)
                                        .Include(x => x.EntityClassifications)
                                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(x => x.TenantId == null
                                         && x.Id == marketplaceContact.Id);

                    AppEntityDto entityDto = new AppEntityDto();
                    ObjectMapper.Map(entity, entityDto);
                    entityDto.Id = 0;
                    entityDto.Code = "";
                    entityDto.TenantId = AbpSession.TenantId;
                    var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                    AppContactDto contactDto = new AppContactDto();
                    ObjectMapper.Map(marketplaceContact, contactDto);
                    //contactDto.PartnerId = marketplaceContact.Id;
                    contactDto.IsProfileData = false;
                    contactDto.TenantId = AbpSession.TenantId;
                    contactDto.Id = 0;
                    contactDto.EntityId = savedEntity;
                    contactDto.AccountId = accountId;
                    foreach (var contactAddress in contactDto.ContactAddresses)
                    {
                        contactAddress.Id = 0;
                        contactAddress.AccountId = 0;

                        contactAddress.AddressFk.Id = 0;
                        contactAddress.AddressFk.AccountId = 0; 
                    }
                    var contactDto_Id = await _appEntitiesAppService.SaveContact(contactDto);


                    // Publish Account related branches [Start]
                    var personEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();

                    var branchInfo = _appContactRepository.GetAll()
                        .Where(x => x.IsProfileData && x.AccountId == marketplaceContact.AccountId
                                 && x.ParentId == marketplaceContact.Id
                                 && x.EntityFk.EntityObjectTypeId != personEntityObjectTypeId).ToList(); // First level of branches

                    foreach (var branchObj in branchInfo)
                    {
                        var branchObjMarket = new AppMarketplaceContact();
                        ObjectMapper.Map(branchObj, branchObjMarket);
                        await ApplyRelationOnBranch(branchObjMarket, accountId );
                    }

                    //Publish Account related members[End]
                    var contactInfo = await _appMarketplaceContactRepository.GetAll()
                   .Include(x => x.ContactAddresses).ThenInclude(x => x.AddressFk)
                   .Where(x =>
                      x.IsProfileData == true
                   && x.AccountId == marketplaceContact.AccountId
                   && x.ParentId == marketplaceContact.Id
                   && x.EntityObjectTypeId == personEntityObjectTypeId).ToListAsync(); // First level of branches

                    foreach (var contactObj in contactInfo)
                    {
                        await ApplyRelationOnMember(contactObj, accountId);
                    }
                    //End

                }
            }
        }

        public async Task ApplyRelationOnMember(AppMarketplaceContact marketplaceContact, long accountId)
        {   using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var personEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                if (marketplaceContact != null)
                {
                    var entity = await _appEntityRepository.GetAll().AsNoTracking().Include(x => x.EntityCategories)
                                        .Include(x => x.EntityClassifications)
                                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync(x => x.TenantId == null
                                         && x.Id == marketplaceContact.Id);
                    
                    AppContactDto contactDto = new AppContactDto();
                    ObjectMapper.Map(marketplaceContact, contactDto);

                    AppEntityDto entityDto = new AppEntityDto();
                    ObjectMapper.Map(entity, entityDto);
                    entityDto.Id = 0;
                    entityDto.Code = "";
                    entityDto.TenantId = AbpSession.TenantId;

                    //88888888888888888888888888
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
                            extraAtt.EntityObjectTypeId = personEntityObjectTypeId;
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
                    //88888888888888888888888888

                    var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                    
                    //contactDto.PartnerId = marketplaceContact.Id;
                    contactDto.IsProfileData = false;
                    contactDto.TenantId = AbpSession.TenantId;
                    contactDto.Id = 0;
                    contactDto.EntityId = savedEntity;
                    contactDto.AccountId  = accountId;
                    foreach (var contactAddress in contactDto.ContactAddresses)
                    {
                        contactAddress.Id = 0;
                        //contactAddress.AddressId = 0;
                        contactAddress.AccountId = 0;

                        contactAddress.AddressFk.Id = 0;
                        //contactAddress.AddressFk.TenantId = AbpSession.TenantId;
                        contactAddress.AddressFk.AccountId = 0;


                    }
                    var contactDto_Id = await _appEntitiesAppService.SaveContact(contactDto);

                    // Publish Account related branches [Start]
                    
                    var branchInfo = _appContactRepository.GetAll()
                        .Where(x => x.IsProfileData && x.AccountId == marketplaceContact.AccountId
                                 && x.ParentId == marketplaceContact.Id
                                 && x.EntityFk.EntityObjectTypeId != personEntityObjectTypeId).ToList(); // First level of branches

                     
                }
            }
        }

        public async Task CloseRelation(long input)
        {

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var marketplaceContact = await _appMarketplaceContactRepository.GetAll().AsNoTracking()
                    .Include(x => x.ContactAddresses).ThenInclude(x => x.AddressFk).AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                    x.IsProfileData == true && x.Id == input);

                if (marketplaceContact != null)
                {
                    var AppContact = await  _appContactRepository.GetAll()
                       .FirstOrDefaultAsync(e => (e.SSIN == marketplaceContact.SSIN) && (e.TenantId == AbpSession.TenantId));

                     if(AppContact != null) {
                        var appContactAddress = _appContactAddressRepository.FirstOrDefault(e => e.ContactId == AppContact.Id);
                        if (appContactAddress != null)
                        {
                            await _appContactAddressRepository.DeleteAsync(e=> e.Id == appContactAddress.Id);
                            await _appAddressRepository.DeleteAsync(e => e.Id == appContactAddress.AddressId);
                        }

                        await _appContactRepository.DeleteAsync(AppContact);
                    }
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
                                   .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contact.EntityId);
                var parentContact2 = await _appContactRepository.GetAll().ToListAsync();

                var parentContact = await _appContactRepository.GetAll().AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contact.ParentId && x.IsProfileData == true);

                var publishedParentContact = await _appContactRepository.GetAll().AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TenantId == null && x.PartnerId == parentContact.Id && x.IsProfileData == false);

                var publishContact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses)
                    .FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == contact.Id);
                //Get branch Related Published record of Account 
                var publishedAccount = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null && x.PartnerId == contact.AccountId && x.IsProfileData == false);
                //
                AppEntityDto entityDto = new AppEntityDto();
                ObjectMapper.Map(entity, entityDto);
                entityDto.Id = 0;

                AppContactDto contactDto = new AppContactDto();
                ObjectMapper.Map(contact, contactDto);

                contactDto.PartnerId = contact.Id;
                contactDto.IsProfileData = false;
                contactDto.TenantId = null;
                contactDto.ContactAddresses = null;
                contactDto.Id = 0;
                contactDto.AccountId = publishedAccount.Id;
                contactDto.ParentId = publishedParentContact.Id;
                if (publishContact != null)
                {
                    contactDto.Id = publishContact.Id;
                    entityDto.Id = publishContact.EntityId;
                }
                // fix bug as per Mariam, 2022-08-14 entity tenant should be null 
                entityDto.TenantId = null;

                var savedEntity = await _appEntitiesAppService.SaveEntity(entityDto);

                contactDto.EntityId = savedEntity;
                contactDto.Id = await _appEntitiesAppService.SaveContact(contactDto);

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
                    AppAddress address = new AppAddress();

                    //AppContactAddressDto existedInPublish = null;

                    //if (contactDto.ContactAddresses != null)
                    //    existedInPublish = contactDto.ContactAddresses.FirstOrDefault(x => x.Code == contactAddress.AddressFk.Code);

                    //if (existedInPublish == null)
                    //{
                    //    ObjectMapper.Map(savedAddress, address);
                    //    address.Id = 0;
                    //    address.AccountId = publishedAccount.Id;
                    //    address = await _appAddressRepository.InsertAsync(address);
                    //    await CurrentUnitOfWork.SaveChangesAsync();
                    //}
                    //else
                    //{
                    //    address.Id = existedInPublish.AddressId;
                    //    address.Code = existedInPublish.Code;
                    //}
                    if (savedAddress != null)
                    {
                        AppAddress existedInPublish = null;

                        existedInPublish = await _appAddressRepository.GetAll()
                            .Where(x => x.Code == contactAddress.AddressFk.Code && x.TenantId == null && x.AccountId == contactDto.Id).FirstOrDefaultAsync();

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

                        AppContactAddress newContactAddress = new AppContactAddress();
                        //ObjectMapper.Map(contactAddress, newContactAddress);
                        newContactAddress.Id = 0;
                        newContactAddress.AddressId = address.Id;
                        newContactAddress.ContactId = contactDto.Id;
                        newContactAddress.AddressTypeId = contactAddress.AddressTypeId;
                        newContactAddress.AddressCode = contactAddress.AddressCode;
                        newContactAddress.AddressTypeCode = contactAddress.AddressTypeCode;
                        newContactAddress.ContactCode = contactAddress.ContactCode;

                        if (contactDto.ContactAddresses == null)
                            contactDto.ContactAddresses = new List<AppContactAddressDto>();
                        // contactDto.ContactAddresses.Add(new AppContactAddressDto { Code = address.Code, AddressId = address.Id, AccountId = contactDto.Id, ContactId = contactDto.Id });
                        contactDto.ContactAddresses.Add(new AppContactAddressDto
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
                var contactInfo = _appContactRepository.GetAll().Where(x => x.IsProfileData && x.ParentId == contact.Id && x.AccountId == contact.AccountId && x.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId).ToList();

                foreach (var contactObj in contactInfo)
                {
                    await PublishMember(contactObj.Id);
                }
                //var presonEntityObjectTypeId = = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var branchInfo = _appContactRepository.GetAll().Where(x => x.IsProfileData &&
                                 x.ParentId == contact.Id && x.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId).ToList(); // First level of branches

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
            var contact = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contactId && x.IsProfileData == true);
            var entity = await _appEntityRepository.GetAll().AsNoTracking()
                                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                .Include(x => x.EntityExtraData)
                                .AsNoTracking()
                                .FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contact.EntityId);
            //Get Contact Related Published records of Account and Branch
            var publishedAccount = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null && x.PartnerId == contact.AccountId && x.IsProfileData == false);
            var publishedBranch = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null && x.PartnerId == contact.ParentId && x.IsProfileData == false);
            //
            var publishContact = await _appContactRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == contact.Id);

            AppEntityDto entityDto = new AppEntityDto();
            ObjectMapper.Map(entity, entityDto);
            entityDto.Id = 0;
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            entity.EntityObjectTypeId = presonEntityObjectTypeId;

            AppContactDto contactDto = new AppContactDto();
            ObjectMapper.Map(contact, contactDto);

            contactDto.PartnerId = contact.Id;
            contactDto.IsProfileData = false;
            contactDto.ParentId = publishedBranch.Id;
            contactDto.TenantId = null;
            contactDto.ContactAddresses = null;
            contactDto.Id = 0;
            contactDto.AccountId = publishedAccount.Id;

            if (publishContact != null)
            {
                contactDto.Id = publishContact.Id;
                entityDto.Id = publishContact.EntityId;
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
            contactDto.EntityId = savedEntity;
            contactDto.Id = await _appEntitiesAppService.SaveContact(contactDto);
            await CurrentUnitOfWork.SaveChangesAsync();

            return (contactDto.Id != 0);
        }
        //Mariam[End]

        //[AbpAuthorize(AppPermissions.Pages_Accounts_Edit)]
        //public async Task<GetAccountForEditOutput> GetAccountForEdit(EntityDto<long> input)
        //{
        //    var account = await _appContactRepository.GetAll()
        //        .Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressFk)
        //        .Where(x => x.Id == input.Id).FirstOrDefaultAsync();

        //    var output = new GetAccountForEditOutput { Account = ObjectMapper.Map<CreateOrEditAccountDto>(account) };


        //    return output;
        //}

        [AbpAuthorize(AppPermissions.Pages_Accounts_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            var contact = await _appContactRepository.FirstOrDefaultAsync(x => x.Id == input.Id);
            //Mariam[Start]
            var contacts = _appContactRepository.GetAll().Where(x => x.AccountId == input.Id).ToList();
            foreach (var contactObj in contacts)
            {
                var publishContact = await _appContactRepository.FirstOrDefaultAsync(x => x.PartnerId == contactObj.Id);
                if (publishContact != null)
                {
                    await _appContactRepository.DeleteAsync(publishContact.Id);
                    await _appEntityRepository.DeleteAsync(publishContact.EntityId);

                }
                await _appContactRepository.DeleteAsync(contactObj.Id);
                await _appEntityRepository.DeleteAsync(contactObj.EntityId);
            }
            //Mariam[End]
            await _appContactRepository.DeleteAsync(input.Id);
            await _appEntityRepository.DeleteAsync(contact.EntityId);
        }

        //public async Task<FileDto> GetAccountsToExcel(GetAllAccountsForExcelInput input)
        //{

        //    var filteredAccounts = _appContactRepository.GetAll()
        //                //.Include(e => e.CountryFk)
        //                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter) || e.City.Contains(input.Filter) || e.State.Contains(input.Filter) || e.ZipCode.Contains(input.Filter) || e.Status.Contains(input.Filter))
        //                .WhereIf(!string.IsNullOrWhiteSpace(input.AppEntityNameFilter), e => e.CountryFk != null && e.CountryFk.Name == input.AppEntityNameFilter);

        //    var query = (from o in filteredAccounts
        //                 join o1 in _appEntityRepository.GetAll() on o.CountryId equals o1.Id into j1
        //                 from s1 in j1.DefaultIfEmpty()

        //                 select new GetAccountForViewDto()
        //                 {
        //                     Account = new AccountDto
        //                     {
        //                         Name = o.Name,
        //                         City = o.City,
        //                         State = o.State,
        //                         ZipCode = o.ZipCode,
        //                         Status = o.Status,
        //                         Id = o.Id
        //                     },
        //                     AppEntityName = s1 == null || s1.Name == null ? "" : s1.Name.ToString()
        //                 });


        //    var accountListDtos = await query.ToListAsync();

        //    return _accountsExcelExporter.ExportToFile(accountListDtos);
        //}

        [AbpAuthorize(AppPermissions.Pages_Accounts)]
        public async Task<List<AccountAppEntityLookupTableDto>> GetAllAppEntityForTableDropdown()
        {
            return await _appEntityRepository.GetAll()
                .Select(appEntity => new AccountAppEntityLookupTableDto
                {
                    Id = appEntity.Id,
                    DisplayName = appEntity == null || appEntity.Name == null ? "" : appEntity.Name.ToString()
                }).ToListAsync();
        }

        public async Task SendMessage(SendMailDto input)
        {
            await _emailSender.SendAsync(new MailMessage
            {
                To = { input.To },
                Subject = input.Subject,
                Body = input.Body.ToString(),
                IsBodyHtml = input.IsBodyHtml
            });
        }

        [AbpAllowAnonymous]
        public async Task<AccountSummaryDto> GetAccountSummary()
        {
            var accountInfo = await _appContactRepository.GetAll()
                .Where(x => x.IsProfileData && x.ParentId == null && x.AccountId == null)
                .Include(x => x.PartnerFkList)
                .Include(x => x.EntityFk).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .FirstOrDefaultAsync();

            var output = new AccountSummaryDto();
            output = ObjectMapper.Map<AccountSummaryDto>(accountInfo);

            if (accountInfo != null)
            {
                var attCatId = await _helper.SystemTables.GetAttachmentCategoryLogoId();
                var logo = accountInfo.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attCatId);
                if (logo != null)
                {
                    //output.LogoUrl = logo.AttachmentFk.Attachment;
                    output.LogoUrl = @"attachments/" + AbpSession.TenantId + @"/" + logo.AttachmentFk.Attachment;
                }
            }

            return output;
        }

        public async Task<List<GetAccountForDropdownDto>> GetAllAccountsForDropdown(string searchTerm)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var accounts = _appContactRepository.GetAll()
                            .WhereIf(!string.IsNullOrEmpty(searchTerm), x => x.Name.Contains(searchTerm))
                            .Where(x =>
                                ((!x.IsProfileData && x.ParentId == null) && (_appContactRepository.GetAll().Count(c => c.TenantId == AbpSession.TenantId && c.PartnerId == x.Id) > 0))
                                || (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.ParentId == null && x.PartnerId == null))
                            .Take(25)

                            .Select(x => new GetAccountForDropdownDto()
                            {
                                Id = x.Id,
                                Name = x.Name,
                                ImgURL = string.Empty,
                            });

                return await accounts.ToListAsync();
            }
        }

        #region Payment Methods

        #region Authorize.Net
        protected ANetApiResponse UpdatePaymentProfile(string cardNumber, string expirationDate, string cardCode, AppContact contact, string customerProfileId, string customerPaymentProfileId)
        {
            Console.WriteLine("Update Customer payment profile sample");

            var ApiLoginID = _appConfiguration[$"AuthorizeNet:ApiLoginID"];
            var ApiTransactionKey = _appConfiguration[$"AuthorizeNet:ApiTransactionKey"];


            ApiOperationBase<ANetApiRequest, ANetApiResponse>.RunEnvironment = AuthorizeNet.Environment.SANDBOX;
            // define the merchant information (authentication / transaction id)
            ApiOperationBase<ANetApiRequest, ANetApiResponse>.MerchantAuthentication = new merchantAuthenticationType()
            {
                name = ApiLoginID,
                ItemElementName = ItemChoiceType.transactionKey,
                Item = ApiTransactionKey,
            };

            var creditCard = new creditCardType
            {
                cardNumber = cardNumber,// "4111111111111111",
                expirationDate = expirationDate,// "1028"
                cardCode = cardCode
            };

            //===========================================================================
            // NOTE:  For updating just the address, not the credit card/payment data 
            //        you can pass the masked values returned from 
            //        GetCustomerPaymentProfile or GetCustomerProfile
            //        E.g.
            //                * literal values shown below
            //===========================================================================
            /*var creditCard = new creditCardType
            {
                cardNumber = "XXXX1111",
                expirationDate = "XXXX"
            };*/

            var paymentType = new paymentType { Item = creditCard };

            var paymentProfile = new customerPaymentProfileExType
            {
                billTo = new customerAddressType
                {
                    // change information as required for billing
                    email = contact.EMailAddress,
                    phoneNumber = contact.Phone1Number,
                },
                payment = paymentType,
                customerPaymentProfileId = customerPaymentProfileId
            };


            var billingAddress = contact.AppContactAddresses.FirstOrDefault(e => e.AddressTypeFk.Code == "BILLING");
            if (billingAddress != null)
            {
                paymentProfile.billTo.address = billingAddress.AddressFk.AddressLine1;
                paymentProfile.billTo.city = billingAddress.AddressFk.City;
                paymentProfile.billTo.zip = billingAddress.AddressFk.PostalCode;
                paymentProfile.billTo.state = billingAddress.AddressFk.State;
            }

            var request = new updateCustomerPaymentProfileRequest();
            request.customerProfileId = customerProfileId;
            request.paymentProfile = paymentProfile;
            request.validationMode = validationModeEnum.testMode;


            // instantiate the controller that will call the service
            var controller = new updateCustomerPaymentProfileController(request);
            controller.Execute();

            // get the response from the service (errors contained if any)
            var response = controller.GetApiResponse();

            if (response == null)
            {
                throw new UserFriendlyException("Authorize.net Null Response");
            }
            else if (response.messages.resultCode != messageTypeEnum.Ok)
            {
                throw new UserFriendlyException("Authorize.net Error Code=" + response.messages.message[0].code + " Text=" + response.messages.message[0].text);
            }

            //if (response != null && response.messages.resultCode == messageTypeEnum.Ok)
            //{
            //    Console.WriteLine(response.messages.message[0].text);
            //}
            //else if (response != null)
            //{
            //    Console.WriteLine("Error: " + response.messages.message[0].code + "  " +
            //                      response.messages.message[0].text);
            //}

            return response;
        }

        protected ANetApiResponse CreatePaymentProfile(string cardNumber, string expirationDate, string cardCode, AppContact contact, string customerProfileId)
        {
            Console.WriteLine("Create Customer Payment Profile Sample");

            var ApiLoginID = _appConfiguration[$"AuthorizeNet:ApiLoginID"];
            var ApiTransactionKey = _appConfiguration[$"AuthorizeNet:ApiTransactionKey"];

            // set whether to use the sandbox environment, or production enviornment
            ApiOperationBase<ANetApiRequest, ANetApiResponse>.RunEnvironment = AuthorizeNet.Environment.SANDBOX;

            // define the merchant information (authentication / transaction id)
            ApiOperationBase<ANetApiRequest, ANetApiResponse>.MerchantAuthentication = new merchantAuthenticationType()
            {
                name = ApiLoginID,
                ItemElementName = ItemChoiceType.transactionKey,
                Item = ApiTransactionKey,
            };

            //var bankAccount = new bankAccountType
            //{
            //    accountNumber = "01245524321",
            //    routingNumber = "000000204",
            //    accountType = bankAccountTypeEnum.checking,
            //    echeckType = echeckTypeEnum.WEB,
            //    nameOnAccount = "test",
            //    bankName = "Bank Of America"
            //};
            var creditCard = new creditCardType
            {
                cardNumber = cardNumber,// "4111111111111111",
                expirationDate = expirationDate,// "1028"
                cardCode = cardCode
            };

            paymentType cc = new paymentType { Item = creditCard };
            //paymentType echeck = new paymentType { Item = bankAccount };

            var billTo = new customerAddressType
            {
                email = contact.EMailAddress,
                phoneNumber = contact.Phone1Number,
            };

            var billingAddress = contact.AppContactAddresses.FirstOrDefault(e => e.AddressTypeFk.Code == "BILLING");
            if (billingAddress != null)
            {
                billTo.address = billingAddress.AddressFk.AddressLine1;
                billTo.city = billingAddress.AddressFk.City;
                billTo.zip = billingAddress.AddressFk.PostalCode;
                billTo.state = billingAddress.AddressFk.State;
            }

            customerPaymentProfileType ccPaymentProfile = new customerPaymentProfileType();
            ccPaymentProfile.payment = cc;
            ccPaymentProfile.billTo = billTo;

            var request = new createCustomerPaymentProfileRequest
            {
                customerProfileId = customerProfileId,
                paymentProfile = ccPaymentProfile,
                validationMode = validationModeEnum.testMode
            };

            // instantiate the controller that will call the service
            var controller = new createCustomerPaymentProfileController(request);
            controller.Execute();

            // get the response from the service (errors contained if any)
            createCustomerPaymentProfileResponse response = controller.GetApiResponse();

            if (response == null)
            {
                throw new UserFriendlyException("Authorize.net Null Response");
            }
            else if (response.messages.resultCode != messageTypeEnum.Ok)
            {
                throw new UserFriendlyException("Authorize.net Error Code=" + response.messages.message[0].code + " Text=" + response.messages.message[0].text);
            }

            //// validate response 
            //if (response != null)
            //{
            //    if (response.messages.resultCode == messageTypeEnum.Ok)
            //    {
            //        if (response.messages.message != null)
            //        {
            //            Console.WriteLine("Success! Customer Payment Profile ID: " + response.customerPaymentProfileId);
            //        }
            //    }
            //    else
            //    {
            //        Console.WriteLine("Customer Payment Profile Creation Failed.");
            //        Console.WriteLine("Error Code: " + response.messages.message[0].code);
            //        Console.WriteLine("Error message: " + response.messages.message[0].text);
            //        if (response.messages.message[0].code == "E00039")
            //        {
            //            Console.WriteLine("Duplicate Payment Profile ID: " + response.customerPaymentProfileId);
            //        }
            //    }
            //}
            //else
            //{
            //    if (controller.GetErrorResponse().messages.message.Length > 0)
            //    {
            //        Console.WriteLine("Customer Payment Profile Creation Failed.");
            //        Console.WriteLine("Error Code: " + response.messages.message[0].code);
            //        Console.WriteLine("Error message: " + response.messages.message[0].text);
            //    }
            //    else
            //    {
            //        Console.WriteLine("Null Response.");
            //    }
            //}

            return response;

        }

        protected ANetApiResponse CreateCustomerProfile(string cardNumber, string expirationDate, string cardCode, AppContact contact)
        {

            Console.WriteLine("Create Customer Profile Sample");

            var ApiLoginID = _appConfiguration[$"AuthorizeNet:ApiLoginID"];
            var ApiTransactionKey = _appConfiguration[$"AuthorizeNet:ApiTransactionKey"];

            // set whether to use the sandbox environment, or production enviornment
            ApiOperationBase<ANetApiRequest, ANetApiResponse>.RunEnvironment = AuthorizeNet.Environment.SANDBOX;

            // define the merchant information (authentication / transaction id)
            ApiOperationBase<ANetApiRequest, ANetApiResponse>.MerchantAuthentication = new merchantAuthenticationType()
            {
                name = ApiLoginID,
                ItemElementName = ItemChoiceType.transactionKey,
                Item = ApiTransactionKey,
            };

            var creditCard = new creditCardType
            {
                cardNumber = cardNumber,// "4111111111111111",
                expirationDate = expirationDate,// "1028"
                cardCode = cardCode
            };

            //var bankAccount = new bankAccountType
            //{
            //    accountNumber = "231323342",
            //    routingNumber = "000000224",
            //    accountType = bankAccountTypeEnum.checking,
            //    echeckType = echeckTypeEnum.WEB,
            //    nameOnAccount = "test",
            //    bankName = "Bank Of America"
            //};

            // standard api call to retrieve response
            paymentType cc = new paymentType { Item = creditCard };
            //paymentType echeck = new paymentType { Item = bankAccount };

            List<customerPaymentProfileType> paymentProfileList = new List<customerPaymentProfileType>();
            customerPaymentProfileType ccPaymentProfile = new customerPaymentProfileType();
            ccPaymentProfile.payment = cc;

            //customerPaymentProfileType echeckPaymentProfile = new customerPaymentProfileType();
            //echeckPaymentProfile.payment = echeck;

            paymentProfileList.Add(ccPaymentProfile);
            //paymentProfileList.Add(echeckPaymentProfile);

            customerAddressType homeAddress = new customerAddressType();
            homeAddress.email = contact.EMailAddress;
            homeAddress.phoneNumber = contact.Phone1Number;

            List<customerAddressType> addressInfoList = new List<customerAddressType>();
            var billingAddress = contact.AppContactAddresses.FirstOrDefault(e => e.AddressTypeFk.Code == "BILLING");
            if (billingAddress != null)
            {
                homeAddress.address = billingAddress.AddressFk.AddressLine1;
                homeAddress.city = billingAddress.AddressFk.City;
                homeAddress.zip = billingAddress.AddressFk.PostalCode;
                homeAddress.state = billingAddress.AddressFk.State;
                addressInfoList.Add(homeAddress);
            }


            customerProfileType customerProfile = new customerProfileType();
            //customerProfile.merchantCustomerId = "Test CustomerID";
            customerProfile.email = contact.EMailAddress;
            customerProfile.paymentProfiles = paymentProfileList.ToArray();
            customerProfile.shipToList = addressInfoList.ToArray();

            var request = new createCustomerProfileRequest { profile = customerProfile, validationMode = validationModeEnum.testMode };

            // instantiate the controller that will call the service
            var controller = new createCustomerProfileController(request);
            controller.Execute();

            // get the response from the service (errors contained if any)
            createCustomerProfileResponse response = controller.GetApiResponse();

            if (response == null)
            {
                throw new UserFriendlyException("Authorize.net Null Response");
            }
            else if (response.messages.resultCode != messageTypeEnum.Ok)
            {
                throw new UserFriendlyException("Authorize.net Error Code=" + response.messages.message[0].code + " Text=" + response.messages.message[0].text);
            }

            //// validate response 
            //if (response != null)
            //{
            //    if (response.messages.resultCode == messageTypeEnum.Ok)
            //    {
            //        if (response.messages.message != null)
            //        {
            //            Console.WriteLine("Success!");
            //            Console.WriteLine("Customer Profile ID: " + response.customerProfileId);
            //            Console.WriteLine("Payment Profile ID: " + response.customerPaymentProfileIdList[0]);
            //            Console.WriteLine("Shipping Profile ID: " + response.customerShippingAddressIdList[0]);
            //        }
            //    }
            //    else
            //    {
            //        Console.WriteLine("Customer Profile Creation Failed.");
            //        Console.WriteLine("Error Code: " + response.messages.message[0].code);
            //        Console.WriteLine("Error message: " + response.messages.message[0].text);
            //    }
            //}
            //else
            //{
            //    if (controller.GetErrorResponse().messages.message.Length > 0)
            //    {
            //        Console.WriteLine("Customer Profile Creation Failed.");
            //        Console.WriteLine("Error Code: " + response.messages.message[0].code);
            //        Console.WriteLine("Error message: " + response.messages.message[0].text);
            //    }
            //    else
            //    {
            //        Console.WriteLine("Null Response.");
            //    }
            //}

            return response;
        }
        //T-SII-20220831.0007, MMT 10.27.2022 User cannot add new payment method if Tenant all old payment methods are deleted[Start]
        protected ANetApiResponse DeleteCustomerProfile(string customerProfileId)
        {
            Console.WriteLine("DeleteCustomerProfile Sample");

            var ApiLoginID = _appConfiguration[$"AuthorizeNet:ApiLoginID"];
            var ApiTransactionKey = _appConfiguration[$"AuthorizeNet:ApiTransactionKey"];

            ApiOperationBase<ANetApiRequest, ANetApiResponse>.RunEnvironment = AuthorizeNet.Environment.SANDBOX;
            ApiOperationBase<ANetApiRequest, ANetApiResponse>.MerchantAuthentication = new merchantAuthenticationType()
            {
                name = ApiLoginID,
                ItemElementName = ItemChoiceType.transactionKey,
                Item = ApiTransactionKey,
            };

            //please update the subscriptionId according to your sandbox credentials
            var request = new deleteCustomerProfileRequest
            {
                customerProfileId = customerProfileId
            };

            //Prepare Request
            var controller = new deleteCustomerProfileController(request);
            controller.Execute();

            //Send Request to EndPoint
            deleteCustomerProfileResponse response = controller.GetApiResponse();
            if (response != null && response.messages.resultCode == messageTypeEnum.Ok)
            {
                if (response != null && response.messages.message != null)
                {
                    Console.WriteLine("Success, ResultCode : " + response.messages.resultCode.ToString());
                }
            }
            else if (response != null && response.messages.message != null)
            {
                Console.WriteLine("Error: " + response.messages.message[0].code + "  " + response.messages.message[0].text);
            }

            return response;
        }
        //T-SII-20220831.0007, MMT 10.27.2022 User cannot add new payment method if Tenant all old payment methods are deleted[End]
        protected ANetApiResponse DeletePaymentProfile(string customerProfileId, string customerPaymentProfileId)
        {
            Console.WriteLine("DeleteCustomerPaymentProfile Sample");

            var ApiLoginID = _appConfiguration[$"AuthorizeNet:ApiLoginID"];
            var ApiTransactionKey = _appConfiguration[$"AuthorizeNet:ApiTransactionKey"];

            ApiOperationBase<ANetApiRequest, ANetApiResponse>.RunEnvironment = AuthorizeNet.Environment.SANDBOX;
            ApiOperationBase<ANetApiRequest, ANetApiResponse>.MerchantAuthentication = new merchantAuthenticationType()
            {
                name = ApiLoginID,
                ItemElementName = ItemChoiceType.transactionKey,
                Item = ApiTransactionKey,
            };

            //please update the subscriptionId according to your sandbox credentials
            var request = new deleteCustomerPaymentProfileRequest
            {
                customerProfileId = customerProfileId,
                customerPaymentProfileId = customerPaymentProfileId

            };

            //Prepare Request
            var controller = new deleteCustomerPaymentProfileController(request);
            controller.Execute();

            //Send Request to EndPoint
            deleteCustomerPaymentProfileResponse response = controller.GetApiResponse();
            //if (response != null && response.messages.resultCode == messageTypeEnum.Ok)
            //{
            //    if (response != null && response.messages.message != null)
            //    {
            //        Console.WriteLine("Success, ResultCode : " + response.messages.resultCode.ToString());
            //    }
            //}
            //else if (response != null)
            //{
            //    Console.WriteLine("Error: " + response.messages.message[0].code + "  " + response.messages.message[0].text);
            //}

            return response;
        }

        #endregion
        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<AppContactPaymentMethodDto> CreateOrEditPaymentMethod(AppContactPaymentMethodDto input)
        {
            var contactOriginal = await _appContactRepository.GetAll()
                .Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressTypeFk)
                .Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressFk)
                .Include(x => x.AppContactPaymentMethods)
                .FirstOrDefaultAsync(x => x.IsProfileData);


            if (contactOriginal == null)
                throw new UserFriendlyException("Ooppps! Please Save My Profile First!");

            if (string.IsNullOrEmpty(contactOriginal.EMailAddress))
                throw new UserFriendlyException("Ooppps! Please Enter Valid Email in My Profile First!");

            AppContactPaymentMethod contactPaymentMethod;
            if (input.Id == 0)
                contactPaymentMethod = ObjectMapper.Map<AppContactPaymentMethod>(input);
            else
                contactPaymentMethod = await _appContactPaymentMethodRepository.FirstOrDefaultAsync(input.Id);

            contactPaymentMethod.ContactId = contactOriginal.Id;
            contactPaymentMethod.TenantId = (int)AbpSession.TenantId;

            //add the card in authorize.net first, and throw new exception if not succeed so it will be loged by the aspnetzero
            var billingAddress = contactOriginal.AppContactAddresses.FirstOrDefault(e => e.AddressTypeFk.Code == "BILLING");
            var firstCard = contactOriginal.AppContactPaymentMethods.FirstOrDefault(x => x.CardProfileToken != null);
            ANetApiResponse response;
            if (firstCard == null || (firstCard != null && string.IsNullOrEmpty(firstCard.CardProfileToken)))
            {
                response = CreateCustomerProfile(input.CardNumber, input.CardExpirationYear + input.CardExpirationMonth, input.SecurityCode, contactOriginal);
                contactPaymentMethod.CardProfileToken = ((createCustomerProfileResponse)response).customerProfileId;
                contactPaymentMethod.CardPaymentToken = ((createCustomerProfileResponse)response).customerPaymentProfileIdList[0];
            }
            else
            {
                if (input.Id == 0)
                {
                    response = CreatePaymentProfile(input.CardNumber, input.CardExpirationYear + input.CardExpirationMonth, input.SecurityCode, contactOriginal, firstCard.CardProfileToken);
                    contactPaymentMethod.CardProfileToken = ((createCustomerPaymentProfileResponse)response).customerProfileId;
                    contactPaymentMethod.CardPaymentToken = ((createCustomerPaymentProfileResponse)response).customerPaymentProfileId;
                }
                else
                {
                    var currCard = contactOriginal.AppContactPaymentMethods.FirstOrDefault(x => x.Id == input.Id);
                    response = UpdatePaymentProfile(input.CardNumber, input.CardExpirationYear + input.CardExpirationMonth, input.SecurityCode, contactOriginal, firstCard.CardProfileToken, currCard.CardPaymentToken);
                    contactPaymentMethod.CardProfileToken = currCard.CardProfileToken;
                    contactPaymentMethod.CardPaymentToken = currCard.CardPaymentToken;
                }
            }
            //*************************

            contactPaymentMethod.CardNumber = "************" + contactPaymentMethod.CardNumber.Right(4);
            //xxx
            //var existingCard = await _appContactPaymentMethodRepository.FirstOrDefaultAsync(x => x.CardNumber == contactPaymentMethod.CardNumber && x.CardProfileToken== contactPaymentMethod.CardProfileToken);
            //if (existingCard != null)
            //    throw new UserFriendlyException("This credit card number has been entered before!");
            //xxxx
            contactPaymentMethod.CardType = (byte)FindType(input.CardNumber);
            if (input.Id == 0)
                contactPaymentMethod = await _appContactPaymentMethodRepository.InsertAsync(contactPaymentMethod);

            await CurrentUnitOfWork.SaveChangesAsync();

            var result = ObjectMapper.Map<AppContactPaymentMethodDto>(contactPaymentMethod);

            return result;
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task DeletePaymentMethod(EntityDto input)
        {
            try
            {
                var payment = await _appContactPaymentMethodRepository.FirstOrDefaultAsync(x => x.Id == input.Id);

                await _appContactPaymentMethodRepository.DeleteAsync(input.Id);
                await CurrentUnitOfWork.SaveChangesAsync();

                DeletePaymentProfile(payment.CardProfileToken, payment.CardPaymentToken);
                //T-SII-20220831.0007, MMT 10.27.2022 User cannot add new payment method if Tenant all old payment methods are deleted[Start]
                var custProfileCards = await _appContactPaymentMethodRepository.FirstOrDefaultAsync(x => x.CardProfileToken == payment.CardProfileToken);
                if (custProfileCards == null)
                    DeleteCustomerProfile(payment.CardProfileToken);
                //T-SII-20220831.0007, MMT 10.27.2022 User cannot add new payment method if Tenant all old payment methods are deleted[End]
            }
            catch (Exception)
            {

            }



        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<AppContactPaymentMethodDto> GetPaymentMethodForEdit(long input)
        {
            var paymentMethod = await _appContactPaymentMethodRepository.GetAll()
                .Where(x => x.Id == input).FirstOrDefaultAsync();

            var output = new AppContactPaymentMethodDto();
            output = ObjectMapper.Map<AppContactPaymentMethodDto>(paymentMethod);

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public virtual async Task SetPaymentMethodDefault(EntityDto input)
        {
            var allcpm = await _appContactPaymentMethodRepository.GetAll().ToListAsync();
            foreach (var item in allcpm)
            {
                item.IsDefault = item.Id == input.Id;
            }

        }

        private CardType FindType(string cardNumber)
        {
            //https://www.regular-expressions.info/creditcard.html
            if (Regex.Match(cardNumber, @"^4[0-9]{12}(?:[0-9]{3})?$").Success)
            {
                return CardType.Visa;
            }

            if (Regex.Match(cardNumber, @"^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$").Success)
            {
                return CardType.MasterCard;
            }

            if (Regex.Match(cardNumber, @"^3[47][0-9]{13}$").Success)
            {
                return CardType.AmericanExpress;
            }

            if (Regex.Match(cardNumber, @"^6(?:011|5[0-9]{2})[0-9]{12}$").Success)
            {
                return CardType.Discover;
            }

            if (Regex.Match(cardNumber, @"^(?:2131|1800|35\d{3})\d{11}$").Success)
            {
                return CardType.JCB;
            }

            throw new Exception("Unknown card.");
        }

        #endregion

        #region Contact(Person)

        //[AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<ContactDto> GetContactForEdit(long input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var contact = await _appContactRepository.GetAll()
                .Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressFk).ThenInclude(x => x.CountryFk)
                .Include(x => x.CurrencyFk).Include(x => x.LanguageFk).Include(x => x.Phone1TypeFk).Include(x => x.Phone2TypeFk).Include(x => x.Phone3TypeFk)
                .Include(x => x.EntityFk)
                .Where(x => x.Id == input).FirstOrDefaultAsync();

                var output = new ContactDto();
                output = ObjectMapper.Map<ContactDto>(contact);

                return output;
            }
        }
        //Mariam[Start]
        //[AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<ContactForEditDto> GetContactForView(long input)
        {
            //MMT, 09/07/2022 T-SII-20220803.0003 Newly registered user does not have related Team member[Start]
            if (input == 0)
            {
                var account = _appContactRepository.GetAll().FirstOrDefault(x => x.TenantId == AbpSession.TenantId && x.IsProfileData && x.ParentId == null && x.PartnerId == null && x.AccountId == null);
                if (account != null)
                {
                    var user = await UserManager.GetUserByIdAsync(long.Parse(AbpSession.UserId.ToString()));
                    if (user != null)
                    {
                        ContactDto contactDto = new ContactDto();
                        contactDto.AccountId = account.Id;
                        contactDto.FirstName = user.Name;
                        contactDto.LastName = user.Surname;
                        contactDto.EMailAddress = user.EmailAddress;
                        contactDto.UserId = user.Id;
                        contactDto.Name = user.Name + " " + user.Surname;
                        contactDto.UserName = user.UserName;
                        contactDto.TradeName = "";
                        contactDto.ParentId = account.Id;
                        contactDto.Code = "";
                        string seq = await _iAppSycIdentifierDefinitionsService.GetNextEntityCode("TENANTCONTACT");
                        string tenentName = "";
                        if (AbpSession.TenantId != null)
                        {
                            var tenantObj = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                            if (tenantObj != null)
                                tenentName = tenantObj.TenancyName;
                        }
                        contactDto.Code = tenentName + "-C" + seq;
                        ContactDto savedContactDto = await CreateContact(contactDto);
                        if (savedContactDto.Id != 0)
                        {
                            input = savedContactDto.Id;
                        }
                    }
                }
            }
            //MMT, 09/07/2022 T-SII-20220803.0003 Newly registered user does not have related Team member[End]


            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var contact = await _appContactRepository.GetAll()
                .Include(x => x.EntityFk.EntityExtraData)
                .Include(x => x.EntityFk.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Where(x => x.Id == input).FirstOrDefaultAsync();

                var output = new ContactDto();
                output = ObjectMapper.Map<ContactDto>(contact);
                output.FirstName = contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 701) == null ? "" : contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 701).AttributeValue;
                output.LastName = contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702) == null ? "" : contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 702).AttributeValue;
                //if (output.ParentId != null)
                //  {
                var joinDate = contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 707)?.AttributeValue;
                output.JobTitle = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706) != null &&
                                   contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706).AttributeValue != null)
                                    ? contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 706).AttributeValue : "";
                //MMT22
                //if (!string.IsNullOrEmpty(joinDate)) output.JoinDate = DateTime.Parse(joinDate);
                DateTime jDate = DateTime.Now;
                if (!string.IsNullOrEmpty(joinDate) && DateTime.TryParse(joinDate, out jDate)) output.JoinDate = DateTime.Parse(joinDate);
                if (output.JoinDate == new DateTime(1, 1, 1)) output.JoinDate = DateTime.Now;
                //MMT22
                output.LanguageIsPublic = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 708) != null &&
                                          contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 708).AttributeValue != null)
                                          ? bool.Parse(contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 708).AttributeValue) : true;
                output.EmailAddressIsPublic = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 709) != null &&
                    contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 709).AttributeValue != null)
                    ? bool.Parse(contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 709).AttributeValue) : true;
                output.Phone1IsPublic = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 710) != null &&
                    contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 710).AttributeValue != null)
                    ? bool.Parse(contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 710).AttributeValue) : true;
                output.Phone2IsPublic = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 711) != null &&
                                contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 711).AttributeValue != null)
                                ? bool.Parse(contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 711).AttributeValue) : true;
                output.Phone3IsPublic = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 712) != null &&
                    contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 712).AttributeValue != null)
                    ? bool.Parse(contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 712).AttributeValue) : true;
                output.JoinDateIsPublic = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 713) != null &&
                    contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 713).AttributeValue != null)
                    ? bool.Parse(contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 713).AttributeValue) : true;
                //  }
                output.UserId = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715) != null &&
                    contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715).AttributeValue != null)
                    ? long.Parse(contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715).AttributeValue) : 0;
                if (output.UserId != 0)
                {
                    output.UserName = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703) != null &&
                        contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703).AttributeValue != null)
                        ? contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 703).AttributeValue : "";
                    output.UserNameIsPublic = (contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 714) != null &&
                        contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 714).AttributeValue != null) ? bool.Parse(contact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 714).AttributeValue) : true;
                }
                if (output.LanguageId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.LanguageId);
                    output.LanguageName = _lookupAppEntity.Name.ToString();
                }

                if (output.Phone1TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.Phone1TypeId);
                    output.Phone1TypeName = _lookupAppEntity.Name.ToString();
                }

                if (output.Phone2TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.Phone2TypeId);
                    output.Phone2TypeName = _lookupAppEntity.Name.ToString();
                }

                if (output.Phone3TypeId != null)
                {
                    var _lookupAppEntity = await _appEntityRepository.FirstOrDefaultAsync((long)output.Phone3TypeId);
                    output.Phone3TypeName = _lookupAppEntity.Name.ToString();
                }
                output.Notes = contact.EntityFk.Notes;
                output.EntityAttachments = ObjectMapper.Map<IList<AppEntityAttachmentDto>>(contact.EntityFk.EntityAttachments);

                var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("LOGO");
                var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId("BANNER");



                //if (output.PhotoImageUrl != null) output.PhotoImageUrl = @"attachments/" + (contact.TenantId == null ? -1 : contact.TenantId) + @"/" + output.PhotoImageUrl;
                //if (output.CoverImageUrl != null) output.CoverImageUrl = @"attachments/" + (contact.TenantId == null ? -1 : contact.TenantId) + @"/" + output.CoverImageUrl;
                ContactForEditDto outputObj = new ContactForEditDto();
                outputObj.Contact = output;
                //outputObj.CoverUrl = string.IsNullOrEmpty(contact.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                //                                        ""
                //                                        : "attachments/" + (contact.EntityFk.TenantId == null ? "-1" : contact.EntityFk.TenantId.ToString()) + "/" + contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attCoverId).AttachmentFk.Attachment;
                //outputObj.ImageUrl = string.IsNullOrEmpty(contact.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                //                                            ""
                //                                            : "attachments/" + (contact.EntityFk.TenantId == null ? "-1" : contact.EntityFk.TenantId.ToString()) + "/" + contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment;
                if (contact.EntityFk.EntityAttachments.Count() > 0)
                {
                    //var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("PHOTO");
                    var photo = contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId);
                    if (photo != null && photo.AttachmentFk != null)
                        outputObj.ImageUrl = string.IsNullOrEmpty(contact.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                                                ""
                                                : "attachments/" + (contact.EntityFk.TenantId == null ? "-1" : contact.EntityFk.TenantId.ToString()) + "/" + contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attPhotoId).AttachmentFk.Attachment;



                    // var attCoverId = await _helper.SystemTables.GetAttachmentCategoryCoverId();
                    var cover = contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attCoverId);
                    if (cover != null && cover.AttachmentFk != null)
                        outputObj.CoverUrl = string.IsNullOrEmpty(contact.EntityFk.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment) ?
                                                ""
                                                : "attachments/" + (contact.EntityFk.TenantId == null ? "-1" : contact.EntityFk.TenantId.ToString()) + "/" + contact.EntityFk.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attCoverId).AttachmentFk.Attachment;
                }
                if (output.ParentId != null)
                {
                    var branchContact = await _appContactRepository.GetAll()
                    .Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressFk).ThenInclude(x => x.CountryFk)
                    .Where(x => x.Id == output.ParentId).FirstOrDefaultAsync();

                    var branchAddress = branchContact.AppContactAddresses.FirstOrDefault();
                    if (branchContact != null)
                        outputObj.BranchName = branchContact.Name;
                    if (branchAddress != null && branchAddress.AddressFk != null)
                    {
                        outputObj.AddressLine1 = branchAddress.AddressFk.AddressLine1;
                        outputObj.AddressLine2 = branchAddress.AddressFk.AddressLine2;
                        outputObj.City = branchAddress.AddressFk.City;
                        outputObj.CountryId = branchAddress.AddressFk.CountryId;
                        outputObj.CountryName = branchAddress.AddressFk.CountryFk.Name;
                        outputObj.ZipCode = branchAddress.AddressFk.PostalCode;
                        outputObj.State = branchAddress.AddressFk.State;

                    }
                }
                return outputObj;

            }
        }
        //MAriam[End]

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        protected virtual async Task<ContactDto> CreateContact(ContactDto input)
        {
            var contactObjectId = await _helper.SystemTables.GetObjectContactId();
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();

            //var contactParent = _appContactRepository.FirstOrDefault((long)input.ParentId);
            //var entityParent = _appEntityRepository.FirstOrDefault(contactParent.EntityId);

            var entity = new AppEntityDto();
            //Mariam[Start] for attachment property
            ObjectMapper.Map(input, entity);
            //Mariam[End]
            entity.ObjectId = contactObjectId;
            //entity.EntityObjectTypeId = entityParent.EntityObjectTypeId;
            entity.EntityObjectTypeId = presonEntityObjectTypeId;
            entity.Code = input.Code;
            entity.Name = input.FirstName + " " + input.LastName;
            //entity.TenantId = AbpSession.TenantId;
            if (input.UseDTOTenant)
            { entity.TenantId = input.TenantId; }
            else
            {
                entity.TenantId = AbpSession.TenantId;
            }

            if (entity.EntityExtraData == null)
                entity.EntityExtraData = new List<AppEntityExtraDataDto>();

            if (!string.IsNullOrEmpty(input.FirstName))
            {
                AppEntityExtraDataDto appEntityExtraDto = new AppEntityExtraDataDto();
                appEntityExtraDto.EntityId = entity.Id;
                //appEntityExtraDto.EntityObjectTypeId = presonEntityObjectTypeId;
                //appEntityExtraDto.EntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                //appEntityExtraDto.EntityObjectTypeName = await _helper.SystemTables.GetEntityObjectTypePersonName();
                appEntityExtraDto.AttributeValueId = 0;
                appEntityExtraDto.AttributeValue = input.FirstName;
                appEntityExtraDto.AttributeId = 701;
                appEntityExtraDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraDto);
            }

            if (!string.IsNullOrEmpty(input.LastName))
            {
                AppEntityExtraDataDto appEntityExtraLNameDto = new AppEntityExtraDataDto();
                appEntityExtraLNameDto.EntityId = entity.Id;
                //appEntityExtraLNameDto.EntityObjectTypeId = presonEntityObjectTypeId;
                //appEntityExtraLNameDto.EntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                //appEntityExtraLNameDto.EntityObjectTypeName = await _helper.SystemTables.GetEntityObjectTypePersonName();
                appEntityExtraLNameDto.AttributeValueId = 0;
                appEntityExtraLNameDto.AttributeValue = input.LastName;
                appEntityExtraLNameDto.AttributeId = 702;
                appEntityExtraLNameDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraLNameDto);
            }

            if (input.TitleId != null && input.TitleId > 0)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                //appEntityExtraTitleDto.EntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                //appEntityExtraTitleDto.EntityObjectTypeName = await _helper.SystemTables.GetEntityObjectTypePersonName();

                appEntityExtraTitleDto.AttributeValueId = input.TitleId;
                appEntityExtraTitleDto.AttributeId = 705;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }

            //Mariam[Start] add ExtraData of the contact
            //MMT222
            //if (input.JoinDate != null)
            DateTime jDate = DateTime.Now;
            if (input.JoinDate != null && DateTime.TryParse(input.JoinDate.ToString(), out jDate))
            //MMT22
            {
                //MMT22
                if (input.JoinDate == new DateTime(1, 1, 1))
                {
                    input.JoinDate = DateTime.Now;
                }
                //MMT22
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.JoinDate.ToString();
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 707;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.JobTitle != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.JobTitle.ToString();
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 706;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.JoinDateIsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.JoinDateIsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 713;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.LanguageIsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.LanguageIsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 708;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.Phone1IsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.Phone1IsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 710;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.UserId != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.UserId.ToString();
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 715;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }

            if (input.Phone2IsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.Phone2IsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 711;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.Phone3IsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.Phone3IsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 712;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.EmailAddressIsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.EmailAddressIsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 709;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.UserName != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.UserName;
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 703;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.UserNameIsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.UserNameIsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 714;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            entity.Notes = input.Notes;
            //MMT37
            if (string.IsNullOrEmpty(entity.SSIN))
            {

                entity.EntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                entity.SSIN = await
                    _helper.SystemTables.GenerateSSIN(contactObjectId, ObjectMapper.Map<AppEntityDto>(entity));
               
            }
            //MMT37
            //Mariam[End]
            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
            var contact = ObjectMapper.Map<AppContact>(input);
            contact.EntityId = savedEntity;
            contact.IsProfileData = true;
            //MMT37
            contact.SSIN = entity.SSIN;
            //MMT37
            //contact.TenantId = AbpSession.TenantId;
            if (input.UseDTOTenant)
            { contact.TenantId = input.TenantId; }
            else
            {
                contact.TenantId = AbpSession.TenantId;
            }

            //Mariam[Start] use saveContact istead of Insert directly
            //contact = await _appContactRepository.InsertAsync(contact);
            contact.Name = input.FirstName + " " + input.LastName;
            contact.TradeName = "";
            var contactDto = ObjectMapper.Map<AppContactDto>(contact);

            contactDto.Id = await _appEntitiesAppService.SaveContact(contactDto);
            contact.Id = contactDto.Id;
            //Mariam[End]

            await CurrentUnitOfWork.SaveChangesAsync();


            var result = ObjectMapper.Map<ContactDto>(contact);
            if (input.UseDTOTenant == false)
            {
                //Publish Contact if the related Account is published
                if (contactDto.Id != 0 && input.ParentId != null && input.UserId != null && input.UserId != 0)
                {
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                    {
                        var publishContactAccount = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses).FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == input.AccountId);
                        if (publishContactAccount != null)
                        {
                            await PublishMember(contactDto.Id);
                        }
                    }
                }
            }
            return result;
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        protected virtual async Task<ContactDto> UpdateContact(ContactDto input)
        {
            var sydObject = await _appContactRepository.GetAll().Include(x => x.AppContactAddresses).Where(x => x.Id == input.Id).FirstOrDefaultAsync();
            ObjectMapper.Map(input, sydObject);

            //deleted removed addreses
            foreach (var item in sydObject.AppContactAddresses)
            {
                if (input.ContactAddresses.Count(x => x.AddressTypeId == item.AddressTypeId) == 0)
                {
                    await _appContactAddressRepository.DeleteAsync(item.Id);

                }
            }

            //add new and update existed
            foreach (var item in input.ContactAddresses)
            {
                if (sydObject.AppContactAddresses.Count(x => x.AddressTypeId == item.AddressTypeId) == 0)
                {
                    sydObject.AppContactAddresses.Add(new AppContactAddress { ContactId = item.ContactId, AddressTypeId = item.AddressTypeId, AddressId = item.AddressId });
                }
                else
                {
                    sydObject.AppContactAddresses.Where(x => x.AddressTypeId == item.AddressTypeId).FirstOrDefault().AddressId = item.AddressId;
                }
            }

            //Mariam[Start]
            //return input;
            var contactObjectId = await _helper.SystemTables.GetObjectContactId();
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            AppEntityDto entity = new AppEntityDto();
            ObjectMapper.Map(input, entity);
            entity.Id = 0;
            entity.ObjectId = contactObjectId;
            entity.EntityObjectTypeId = presonEntityObjectTypeId;
            entity.Name = input.FirstName + " " + input.LastName;
            entity.Notes = input.Notes;
            entity.Code = input.Code;
            entity.TenantId = AbpSession.TenantId;

            // AppContactDto contact = new AppContactDto();
            //ObjectMapper.Map(input, contact);
            var contact = ObjectMapper.Map<AppContact>(input);


            contact.TenantId = AbpSession.TenantId;

            entity.Id = sydObject == null ? 0 : sydObject.EntityId;

            if (entity.EntityExtraData == null)
                entity.EntityExtraData = new List<AppEntityExtraDataDto>();

            if (!string.IsNullOrEmpty(input.FirstName))
            {
                AppEntityExtraDataDto appEntityExtraDto = new AppEntityExtraDataDto();
                appEntityExtraDto.EntityId = entity.Id;
                //appEntityExtraDto.EntityObjectTypeId = presonEntityObjectTypeId;
                //appEntityExtraDto.EntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                //appEntityExtraDto.EntityObjectTypeName = await _helper.SystemTables.GetEntityObjectTypePersonName();
                appEntityExtraDto.AttributeValueId = 0;
                appEntityExtraDto.AttributeValue = input.FirstName;
                appEntityExtraDto.AttributeId = 701;
                appEntityExtraDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraDto);
            }

            if (!string.IsNullOrEmpty(input.LastName))
            {
                AppEntityExtraDataDto appEntityExtraLNameDto = new AppEntityExtraDataDto();
                appEntityExtraLNameDto.EntityId = entity.Id;
                //appEntityExtraLNameDto.EntityObjectTypeId = presonEntityObjectTypeId;
                //appEntityExtraLNameDto.EntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                //appEntityExtraLNameDto.EntityObjectTypeName = await _helper.SystemTables.GetEntityObjectTypePersonName();
                appEntityExtraLNameDto.AttributeValueId = 0;
                appEntityExtraLNameDto.AttributeValue = input.LastName;
                appEntityExtraLNameDto.AttributeId = 702;
                appEntityExtraLNameDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraLNameDto);
            }

            if (input.TitleId != null && input.TitleId > 0)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                //appEntityExtraTitleDto.EntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                //appEntityExtraTitleDto.EntityObjectTypeName = await _helper.SystemTables.GetEntityObjectTypePersonName();

                appEntityExtraTitleDto.AttributeValueId = input.TitleId;
                appEntityExtraTitleDto.AttributeId = 705;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }

            if (input.JoinDate != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.JoinDate.ToString();
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 707;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.JobTitle != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.JobTitle.ToString();
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 706;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.JoinDateIsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.JoinDateIsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 713;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.LanguageIsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.LanguageIsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 708;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.Phone1IsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.Phone1IsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 710;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }

            if (input.Phone2IsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.Phone2IsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 711;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.Phone3IsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.Phone3IsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 712;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.EmailAddressIsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.EmailAddressIsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 709;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.UserName != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.UserName;
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 703;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.UserNameIsPublic != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.UserNameIsPublic ? "True" : "False";
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 714;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
            }
            if (input.UserId != null)
            {
                AppEntityExtraDataDto appEntityExtraTitleDto = new AppEntityExtraDataDto();
                appEntityExtraTitleDto.EntityId = entity.Id;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                appEntityExtraTitleDto.AttributeValue = input.UserId.ToString();
                appEntityExtraTitleDto.AttributeValueId = 0;
                appEntityExtraTitleDto.AttributeId = 715;
                appEntityExtraTitleDto.EntityObjectTypeId = presonEntityObjectTypeId;
                entity.EntityExtraData.Add(appEntityExtraTitleDto);
                if (input.UserId != 0)
                {
                    var user = await UserManager.GetUserByIdAsync(long.Parse(input.UserId.ToString()));
                    user.Surname = input.LastName;
                    user.Name = input.FirstName;
                    user.EmailAddress = input.EMailAddress;
                    await UserManager.UpdateAsync(user);
                }
            }
            //MMT37
            if (string.IsNullOrEmpty(entity.SSIN))
            {
                entity.EntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                entity.SSIN = await
                    _helper.SystemTables.GenerateSSIN(contactObjectId, ObjectMapper.Map<AppEntityDto>(entity));
                contact.SSIN = entity.SSIN;
            }
            //MMT37
            var savedEntity = await _appEntitiesAppService.SaveEntity(entity);
            //
            //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[Start]
            if (input.EntityAttachments.Count > 0)
            {
                var attPhotoId = await _helper.SystemTables.GetAttachmentCategoryId("LOGO");
                var logoAttach = input.EntityAttachments.Where(x => x.AttachmentCategoryId == attPhotoId).FirstOrDefault();
                if (logoAttach != null && !string.IsNullOrEmpty(logoAttach.FileName))
                {
                    if (!string.IsNullOrEmpty(logoAttach.guid))
                    await UpdateProfilePicture(logoAttach.guid + "." + logoAttach.FileName.Split('.')[1], long.Parse(input.UserId.ToString()));
                    else
                        await UpdateProfilePicture( logoAttach.FileName, long.Parse(input.UserId.ToString()));
                }
            }
            //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[End]
            contact.EntityId = savedEntity;
            contact.IsProfileData = true;
            contact.TenantId = AbpSession.TenantId;
            //Mariam[Start] use saveContact istead of Insert directly
            //contact = await _appContactRepository.InsertAsync(contact);
            contact.Name = input.FirstName + " " + input.LastName;
            contact.TradeName = contact.Name;

            var contactDto = ObjectMapper.Map<AppContactDto>(contact);
            contactDto.Id = await _appEntitiesAppService.SaveContact(contactDto);
            contact.Id = contactDto.Id;
            //
            //contact.EntityId = savedEntity;
            //contact.Id = sydObject == null ? 0 : sydObject.Id;
            //await _appEntitiesAppService.SaveContact(contact);
            await CurrentUnitOfWork.SaveChangesAsync();
            var contactObject = await _appContactRepository.GetAll().Include(x => x.AppContactAddresses).Where(x => x.Id == contact.Id).FirstOrDefaultAsync();
            ContactDto contactDtoObj = new ContactDto();
            ObjectMapper.Map(contactObject, contactDtoObj);
            //Publish Contact if the related Account is published
            if (input.UserId != null && input.UserId != 0)
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var publishContactAccount = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.AppContactAddresses).FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == input.AccountId);
                    if (publishContactAccount != null)
                    {
                        await PublishMember(contact.Id);
                    }
                }
            }
            return contactDtoObj;
            //Mariam[End]


        }
        //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[Start]
        protected async Task UpdateProfilePicture(string inputFileToken, long userId)
        {
            byte[] byteArray;
            try
            {
                string fileName = _appConfiguration[$"Attachment:Path"] + @"\" + AbpSession.TenantId.ToString() + @"\" + inputFileToken;

                byteArray = System.IO.File.ReadAllBytes(fileName);
            }
            catch (Exception exp)
            {
                throw new UserFriendlyException("There is no such image file with the name: " + inputFileToken);
            }

            if (byteArray.Length == 0)
            {
                throw new UserFriendlyException("There is no such image file with the name: " + inputFileToken);
            }

            if (byteArray.Length > MaxProfilPictureBytes)
            {
                throw new UserFriendlyException(L("ResizedProfilePicture_Warn_SizeLimit", AppConsts.ResizedMaxProfilPictureBytesUserFriendlyValue));
            }

            var user = await UserManager.GetUserByIdAsync(userId);

            if (user.ProfilePictureId.HasValue)
            {
                await _binaryObjectManager.DeleteAsync(user.ProfilePictureId.Value);
            }

            var storedFile = new BinaryObject(AbpSession.TenantId, byteArray);
            await _binaryObjectManager.SaveAsync(storedFile);

            user.ProfilePictureId = storedFile.Id;
        }
        //T-SII-20220922.0002,1 MMT 11/10/2022 Update user's profile image from contact image[End]

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task DeleteContact(EntityDto input)
        {
            //MAriam[start]
            var contact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == input.Id);
            var entity = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == AbpSession.TenantId && x.Id == contact.EntityId);
            await _appEntityRepository.DeleteAsync(entity);
            //Mariam[End]

            await _appContactRepository.DeleteAsync(input.Id);

            //Mariam[start]
            var publishedContact = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == null && x.PartnerId == input.Id);
            if (publishedContact != null)
            {
                var publishedContactEntity = await _appEntityRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == null && x.Id == publishedContact.EntityId);
                await _appEntityRepository.DeleteAsync(publishedContactEntity);
                await _appContactRepository.DeleteAsync(publishedContact.Id);
            }
            //Mariam [End]
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<ContactDto> CreateOrEditContact(ContactDto input)
        {
            if (input.Id == null || input.Id == 0)
            {
                return await CreateContact(input);
            }
            else
            {
                return await UpdateContact(input);
            }
        }

        #endregion Contact(Person)

        #region Branch
        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<BranchDto> GetBranchForEdit(long input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var branch = await _appContactRepository.GetAll()
                .Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressFk).ThenInclude(x => x.CountryFk)
                .Include(x => x.CurrencyFk).Include(x => x.LanguageFk).Include(x => x.Phone1TypeFk).Include(x => x.Phone2TypeFk).Include(x => x.Phone3TypeFk)
                .Include(x => x.EntityFk)
                .Where(x => x.Id == input).FirstOrDefaultAsync();

                var output = new BranchDto();
                output = ObjectMapper.Map<BranchDto>(branch);

                //if (output.SycAttachmentCategory.ParentId != null)
                //{
                //    var _lookupSycAttachmentCategory = await _lookup_sycAttachmentCategoryRepository.FirstOrDefaultAsync((long)output.SycAttachmentCategory.ParentId);
                //    output.SycAttachmentCategoryName = _lookupSycAttachmentCategory.Name.ToString();
                //}

                return output;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        protected virtual async Task<BranchDto> CreateBranch(BranchDto input)
        {

            var contactParent = _appContactRepository.FirstOrDefault((long)input.ParentId);
            var entityParent = _appEntityRepository.FirstOrDefault(contactParent.EntityId);

            var entity = new AppEntity();
            entity.ObjectId = entityParent.ObjectId;
            entity.EntityObjectTypeId = entityParent.EntityObjectTypeId;
            entity.Name = input.Name;
            //entity.TenantId = AbpSession.TenantId;
            if (input.UseDTOTenant)
            { entity.TenantId = input.TenantId; }
            else
            {
                entity.TenantId = AbpSession.TenantId;
            }
            entity.Code = input.Code;
            //MMT37
            if (string.IsNullOrEmpty(entity.SSIN))
            {
                entity.EntityObjectTypeCode= entityParent.EntityObjectTypeCode;
                var contactObjectId = await _helper.SystemTables.GetObjectContactId();
                entity.SSIN = await
                    _helper.SystemTables.GenerateSSIN(contactObjectId, ObjectMapper.Map<AppEntityDto>(entity));

            }
            //MMT37
            entity = await _appEntityRepository.InsertAsync(entity);
            //await CurrentUnitOfWork.SaveChangesAsync();
            try
            {
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                //throw new UserFriendlyException("Code '" + entity.Code + "' Is Already Exists.");
                throw new UserFriendlyException(L("CodeIsAlreadyExists", entity.Code));

            }

            var contact = ObjectMapper.Map<AppContact>(input);
            contact.EntityId = entity.Id;
            contact.IsProfileData = true;
            //MMT37
            contact.SSIN = entity.SSIN;
            //MMT37
            //contact.TenantId = AbpSession.TenantId;
            if (input.UseDTOTenant)
            { contact.TenantId = input.TenantId; }
            else
            {
                contact.TenantId = AbpSession.TenantId;
            }
            //T-SII-20220926.0001,1 MMT 09/29/2022 Create Branch does save the related address[Start]
            contact.AppContactAddresses = new List<AppContactAddress>();
            foreach (var item in input.ContactAddresses)
            {
                if (contact.AppContactAddresses.Count(x => x.AddressTypeId == item.AddressTypeId) == 0)
                {
                    contact.AppContactAddresses.Add(new AppContactAddress { ContactId = input.Id, AddressTypeId = item.AddressTypeId, AddressId = item.AddressId,
                    AddressCode = item.Code,AddressTypeCode = item.AddressTypeIdName,ContactCode = input.Code
                });
                }
                else
                {
                    contact.AppContactAddresses.Where(x => x.AddressTypeId == item.AddressTypeId).FirstOrDefault().AddressId = item.AddressId;
                }
            }
            //T-SII-20220926.0001,1 MMT 09/29/2022 Create Branch does save the related address[End]

            contact = await _appContactRepository.InsertAsync(contact);
            await CurrentUnitOfWork.SaveChangesAsync();

            var result = ObjectMapper.Map<BranchDto>(contact);
            //MAriam
            if (input.UseDTOTenant == false)
            {
                if (contact.Id != 0)
                {
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                    {
                        var publishContactAccount = await _appContactRepository.GetAll().FirstOrDefaultAsync(x => x.TenantId == null && x.IsProfileData == false && x.PartnerId == input.AccountId);
                        if (publishContactAccount != null)
                        {
                            await PublishBranch(contact.Id);
                        }
                    }
                }
            }
            //Mariam
            return result;
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        protected virtual async Task<BranchDto> UpdateBranch(BranchDto input)
        {
            var sydObject = await _appContactRepository.GetAll().Include(x => x.AppContactAddresses).Where(x => x.Id == input.Id).FirstOrDefaultAsync();
            ObjectMapper.Map(input, sydObject);
            //deleted removed addreses
            foreach (var item in sydObject.AppContactAddresses)
            {
                if (input.ContactAddresses.Count(x => x.AddressTypeId == item.AddressTypeId) == 0)
                {
                    await _appContactAddressRepository.DeleteAsync(item.Id);

                }
            }

            //add new and update existed
            foreach (var item in input.ContactAddresses)
            {
                if (sydObject.AppContactAddresses.Count(x => x.AddressTypeId == item.AddressTypeId) == 0)
                {
                    sydObject.AppContactAddresses.Add(new AppContactAddress { ContactId = input.Id, AddressTypeId = item.AddressTypeId, AddressId = item.AddressId });
                }
                else
                {
                    sydObject.AppContactAddresses.Where(x => x.AddressTypeId == item.AddressTypeId).FirstOrDefault().AddressId = item.AddressId;
                }
            }


            return input;
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task DeleteBranch(EntityDto input)
        {
            await _appContactRepository.DeleteAsync(input.Id);
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task DeleteAddress(EntityDto input)
        {
            await _appAddressRepository.DeleteAsync(input.Id);
        }

        public async Task<int> IsAddressUsedByOtherBranch(long addressId, long currBranchId)
        {
            return await _appContactAddressRepository.GetAll().CountAsync(x => x.AddressId == addressId && x.ContactId != currBranchId);
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<BranchDto> CreateOrEditBranch(BranchDto input)
        {
            if (input.Id == null || input.Id == 0)
            {
                return await CreateBranch(input);
            }
            else
            {
                return await UpdateBranch(input);
            }
        }

        public async Task<IReadOnlyList<TreeNode<BranchForViewDto>>> GetBranchChilds(int parentId)
        {
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            var filteredBranches = _appContactRepository.GetAll()
                        .Include(e => e.ParentFk)
                        .Include(e => e.ParentFkList)                        //MMT
                        .Include(x => x.AppContactAddresses).ThenInclude(x => x.AddressFk).ThenInclude(x => x.CountryFk)
                        //MMT
                        //.Where(x => x.IsProfileData)
                        .Where(e => e.ParentId != null && e.ParentId == parentId && e.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId);
            var branches = from o in filteredBranches
                           join o2 in _appContactRepository.GetAll() on o.ParentId equals o2.Id into j2
                           from s2 in j2.DefaultIfEmpty()
                           select new TreeNode<BranchForViewDto>()
                           {
                               Data = new BranchForViewDto
                               {
                                   Branch = new BranchDto
                                   {
                                       Code = o.Code,
                                       Name = o.Name,
                                       Id = o.Id,
                                       ContactAddresses = new List<AppContactAddressDto> { ObjectMapper.Map<List<AppContactAddressDto>>(o.AppContactAddresses).FirstOrDefault() }
                                   },
                                   SubTotal = o.ParentFkList.Count(x => x.IsProfileData && x.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId),
                               },
                               Leaf = o.ParentFkList.Count() == 0,
                               label = o.Name
                           };
            var totalCount = await filteredBranches.CountAsync();
            var x = await branches.ToListAsync();
            return x;
        }
        #endregion

        #region Address
        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<IList<AppAddressDto>> GetAddresses()
        {
            var branch = await _appAddressRepository.GetAll().ToListAsync();
            ;

            var output = new List<AppAddressDto>();
            output = ObjectMapper.Map<List<AppAddressDto>>(branch);

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<IList<AppAddressDto>> GetAllAddresses()
        {
            var branch = await _appAddressRepository.GetAll().ToListAsync();


            var output = new List<AppAddressDto>();
            output = ObjectMapper.Map<List<AppAddressDto>>(branch);

            return output;
        }
        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<IList<AppAddressDto>> GetAllAccountAddresses(long accountId)
        {
            var branch = await _appAddressRepository.GetAll().Where(x => x.AccountId == accountId).ToListAsync();

            var output = new List<AppAddressDto>();
            output = ObjectMapper.Map<List<AppAddressDto>>(branch);

            return output;
        }
        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<AppAddressDto> CreateOrEditAddress(AppAddressDto input)
        {
            if (input.Id == null || input.Id == 0)
            {
                return await CreateAddress(input);
            }
            else
            {
                return await UpdateAddress(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        protected virtual async Task<AppAddressDto> CreateAddress(AppAddressDto input)
        {
            //input.TenantId = AbpSession.TenantId;
            if (input.UseDTOTenant)
            { input.TenantId = input.TenantId; }
            else
            {
                input.TenantId = AbpSession.TenantId;
            }


            var address = ObjectMapper.Map<AppAddress>(input);

            var value = await _appAddressRepository.InsertAsync(address);

            try
            {
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                //throw new UserFriendlyException("Code '" + input.Code + "' Is Already Exists.");
                throw new UserFriendlyException(L("CodeIsAlreadyExists", input.Code));

            }
            return ObjectMapper.Map<AppAddressDto>(value);
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        protected virtual async Task<AppAddressDto> UpdateAddress(AppAddressDto input)
        {
            var address = await _appAddressRepository.FirstOrDefaultAsync((int)input.Id);
            ObjectMapper.Map(input, address);

            return input;
        }

        [AbpAuthorize(AppPermissions.Pages_Accounts_Create)]
        public async Task<AppAddressDto> GetAddressForEdit(long input)
        {
            var address = await _appAddressRepository.GetAll()
                .Where(x => x.Id == input).FirstOrDefaultAsync();

            var output = new AppAddressDto();
            output = ObjectMapper.Map<AppAddressDto>(address);

            return output;
        }

        #endregion

        public long GetTypeId(string typeName, List<LookupLabelDto> lookupLabelDtos)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(typeName) == false)
                    value = lookupLabelDtos.Where(r => r.Code.ToUpper() == typeName.ToUpper()).First<LookupLabelDto>().Value;
            }
            catch (Exception ex) { }

            return value;
        }

        public long GetClassId(string className, PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(className) == false)
                    value = classIds.Items.Where(r => r.Data.SycEntityObjectClassification.Name == className).First().Data.SycEntityObjectClassification.Id;
            }
            catch (Exception ex) { }

            return value;
        }

        public long GetDepartmentId(string className, PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(className) == false)
                    value = departmentIds.Items.Where(r => r.Data.SycEntityObjectCategory.Name == className).First().Data.SycEntityObjectCategory.Id;
            }
            catch (Exception ex) { }

            return value;
        }
        //MMT22
        public async Task<AccountExcelResultsDTO> ValidateExcel(string guidFile, string[] imagesList)
        //public async Task<AccountExcelResultsDTO> ValidateAccountsExcel(string guidFile, string[] imagesList)
        //MMT22
        {

            //T - SII - 20221103.0001,1 MMT 11/24/2022 Add Validation on Excel version[Start]
            string currentExcelTemplateVersion = _appConfiguration[$"Templates:AccountExcelTemplateVersion:CurrentVersion"];
            string validExcelTemplates = _appConfiguration[$"Templates:AccountExcelTemplateVersion:SupportedVersions"];
            //T - SII - 20221103.0001,1 MMT 11/24/2022 Add Validation on Excel version[End]

            AccountExcelResultsDTO accountExcelResultsDTO = new AccountExcelResultsDTO();
            accountExcelResultsDTO.TotalRecords = 0;
            accountExcelResultsDTO.TotalPassedRecords = 0;
            accountExcelResultsDTO.TotalFailedRecords = 0;
            accountExcelResultsDTO.FilePath = "";
            accountExcelResultsDTO.ExcelRecords = new List<AccountExcelRecordDTO>() { };
            try
            {

                #region open the excel
                var tenantId = AbpSession.TenantId == null ? -1 : AbpSession.TenantId;
                var path = _appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\" + guidFile + ".xlsx";
                //var files = Directory.GetFiles(_appConfiguration[$"Attachment:PathTemp"] + @"\" + tenantId + @"\", "*.XLSX", SearchOption.AllDirectories);
                //if (files != null && files.Length > 0)
                {
                    var ds = _helper.ExcelHelper.GetExcelDataSet(path);

                    //T - SII - 20221103.0001,1 MMT 11/24/2022 Add Validation on Excel version[Start]
                    var validationRule = ds.Tables["Validation Rules"];
                    if (validationRule == null)
                        throw new UserFriendlyException("This Excel does not have Validation Rules sheet!.");

                    string version = ds.Tables["Validation Rules"].Rows[1].ItemArray[2].ToString();

                    if (version.ToString() != currentExcelTemplateVersion && !validExcelTemplates.Contains(version.ToString()))
                    {
                        throw new UserFriendlyException("This Excel version does not match any of the supported Excel versions");
                    }
                    //T - SII - 20221103.0001,1 MMT 11/24/2022 Add Validation on Excel version[End]

                    //rename columns
                    for (int icounter = 0; icounter < ds.Tables[0].Columns.Count; icounter++)
                    {
                        try
                        {
                            string fieldName = ds.Tables[0].Rows[0][icounter].ToString().Trim().Replace(" ", "").Replace(".", "");
                            ds.Tables[0].Columns[icounter].ColumnName = fieldName;
                        }
                        catch (Exception ex)
                        { var x = 0;
                            var y = 0;
                        }
                    }

                    // remove first row, as it contains the headers
                    ds.Tables[0].Rows.RemoveAt(0);
                    #endregion open the excel
                    List<LookupLabelDto> addressTypes = null;
                    IList<AppAddressDto> addresses = null;
                    PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds = null;
                    PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds = null;
                    List<LookupLabelDto> phoneTypes = null;
                    List<CurrencyInfoDto> currencyIds = null;
                    List<LookupLabelDto> languageIds = null;
                    List<LookupLabelDto> DeptIds = null;
                    List<LookupLabelDto> countries = null;
                    try
                    {
                        #region get lists
                        // get addresses
                        addresses = await GetAllAddresses();

                        // get Product Departments
                        departmentIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();

                        // get addresses types
                        addressTypes = await _appEntitiesAppService.GetAllAddressTypeForTableDropdown();

                        countries = await _appEntitiesAppService.GetAllCountryForTableDropdown();

                        //get classifications for contacts
                        classIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForContact();

                        //get phone types
                        phoneTypes = await _appEntitiesAppService.GetAllPhoneTypeForTableDropdown();

                        //get currency types
                        currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();

                        //get language types            
                        languageIds = await _appEntitiesAppService.GetAllLanguageForTableDropdown();

                        //get images types
                        //ImageTypesIds = await _appEntitiesAppService.

                        #endregion get lists
                    }
                    catch (Exception ex) { }
                    #region create mapper to middle layer AccountExcelDto list of objects
                    //create mapper to middle layer AccountExcelDto list of objects
                    MapperConfiguration configuration;
                    configuration = new MapperConfiguration(a => { a.AddProfile(new AccountExcelDtoProfile()); });
                    IMapper mapper;
                    mapper = configuration.CreateMapper();
                    List<AccountExcelDto> result;
                    result = mapper.Map<List<DataRow>, List<AccountExcelDto>>(new List<DataRow>(ds.Tables[0].Rows.OfType<DataRow>()));
                    #endregion create mapper to middle layer AccountExcelDto list of objects

                    #region Excel validateion rules only.
                    // 0.Record images array existance in the images array
                    // 1.Record duplicated in excel
                    // 2.Sheet.Code and Sheet.Name are not empty
                    // 3.Sheet.Email Address is not empty, then it has a valid email address
                    // 4.Sheet.Website is not empty, then it has a valid website
                    // 5.Sheet.RecordType shuold be either 'Account', 'Branch' or 'Contact'
                    // 6.Sheet.AccountType shuold be either 'Seller', 'Buyer' and 'Seller & Buyer'
                    Int32 rowNumber = 1;
                    foreach (var rec in result)
                    {
                        rowNumber++;
                        rec.rowNumber = rowNumber;
                    }
                    //MMT22
                    accountExcelResultsDTO.TotalRecords = result.Count();
                    accountExcelResultsDTO.TotalPassedRecords = 0;
                    accountExcelResultsDTO.TotalFailedRecords = 0;
                    accountExcelResultsDTO.FilePath = path;
                    accountExcelResultsDTO.ExcelRecords = new List<AccountExcelRecordDTO>() { };
                    //accountExcelResultsDTO.TotalAccounts = result.Count();
                    //accountExcelResultsDTO.TotalPassedRecords = 0;
                    //accountExcelResultsDTO.TotalFailedRecords = 0;
                    //accountExcelResultsDTO.FilePath = path;
                    //// accountExcelResultsDTO.ExcelRecords = new List<AccountExcelRecordDTO>() { };
                    //accountExcelRecordDto = new List<AccountExcelRecordDTO>() { };
                    //accountExcelResultsDTO.ExcelRecords = new List<ExpandoObject>() { };
                    //MMT22
                    List<string> RecordsCodes = result.Select(r => r.Code).ToList();
                    List<string> RecordsParentCodes = result.Select(r => r.ParentCode).ToList();
                    foreach (AccountExcelDto accountExcelDto in result)
                    {
                        AccountExcelRecordDTO accountExcelRecordErrorDTO = new AccountExcelRecordDTO();
                        accountExcelRecordErrorDTO.RecordType = accountExcelDto.RecordType;
                        accountExcelRecordErrorDTO.ParentCode = accountExcelDto.ParentCode;
                        accountExcelRecordErrorDTO.Code = accountExcelDto.Code;
                        accountExcelRecordErrorDTO.Name = accountExcelDto.Name;
                        accountExcelRecordErrorDTO.Status = ExcelRecordStatus.Passed.ToString();
                        accountExcelRecordErrorDTO.ErrorMessage = "";
                        accountExcelRecordErrorDTO.FieldsErrors = new List<string>() { };
                        accountExcelRecordErrorDTO.ExcelDto = accountExcelDto;
                        string recordErrorMEssage = "Wrong data in this " + accountExcelRecordErrorDTO.RecordType + ". check this record in the sheet and update";

                        #region check images
                        bool hasError = false;
                        if (imagesList != null)
                        {
                            if (!string.IsNullOrEmpty(accountExcelDto.Image1FileName) && !imagesList.Contains(accountExcelDto.Image1FileName.ToUpper()))
                            {
                                accountExcelRecordErrorDTO.FieldsErrors.Add("Image 1 File Name: Not found.");
                                hasError = true;
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image1Type))
                            {
                                var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image1Type.ToUpper().TrimEnd());
                                if (attCoverId == 0)
                                {
                                    accountExcelRecordErrorDTO.FieldsErrors.Add("Image 1 Type: Not found.");
                                    hasError = true;
                                }
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image2FileName) && !imagesList.Contains(accountExcelDto.Image2FileName.ToUpper()))
                            {
                                accountExcelRecordErrorDTO.FieldsErrors.Add("Image 2 File Name: Not found.");
                                hasError = true;
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image2Type))
                            {
                                var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image2Type.ToUpper().TrimEnd());
                                if (attCoverId == 0)
                                {
                                    accountExcelRecordErrorDTO.FieldsErrors.Add("Image 2 Type: Not found.");
                                    hasError = true;
                                }
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image3FileName) && !imagesList.Contains(accountExcelDto.Image3FileName.ToUpper()))
                            {
                                accountExcelRecordErrorDTO.FieldsErrors.Add("Image 3 File Name: Not found.");
                                hasError = true;
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image3Type))
                            {
                                var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image3Type.ToUpper().TrimEnd());
                                if (attCoverId == 0)
                                {
                                    accountExcelRecordErrorDTO.FieldsErrors.Add("Image 3 Type: Not found.");
                                    hasError = true;
                                }
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image4FileName) && !imagesList.Contains(accountExcelDto.Image4FileName.ToUpper()))
                            {
                                accountExcelRecordErrorDTO.FieldsErrors.Add("Image 4 File Name: Not found.");
                                hasError = true;
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image4Type))
                            {
                                var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image4Type.ToUpper().TrimEnd());
                                if (attCoverId == 0)
                                {
                                    accountExcelRecordErrorDTO.FieldsErrors.Add("Image 4 Type: Not found.");
                                    hasError = true;
                                }
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image5FileName) && !imagesList.Contains(accountExcelDto.Image5FileName.ToUpper()))
                            {

                                accountExcelRecordErrorDTO.FieldsErrors.Add("Image 5 File Name: Not found.");
                                hasError = true;
                            }

                            if (!string.IsNullOrEmpty(accountExcelDto.Image5Type))
                            {
                                var attCoverId = await _helper.SystemTables.GetAttachmentCategoryId(accountExcelDto.Image5Type.ToUpper().TrimEnd());
                                if (attCoverId == 0)
                                {
                                    accountExcelRecordErrorDTO.FieldsErrors.Add("Image 5 Type: Not found.");
                                    hasError = true;
                                }
                            }
                        }
                        #endregion check images

                        #region code, name, email and website validation    
                        if (RecordsCodes.Where(r => r == accountExcelDto.Code).ToList().Count() > 1)
                        {
                            accountExcelRecordErrorDTO.FieldsErrors.Add("Code: Should Exists Once."); hasError = true;
                            recordErrorMEssage = "Duplicated " + accountExcelRecordErrorDTO.RecordType;
                        }

                        AccountExcelRecordType accountExcelRecordType;
                        AccountExcelAccountType accountExcelAccountType;

                        if (string.IsNullOrEmpty(accountExcelDto.Code)) { accountExcelRecordErrorDTO.FieldsErrors.Add("Code: Should Have a Value."); hasError = true; }
                        if (string.IsNullOrEmpty(accountExcelDto.Name)) { accountExcelRecordErrorDTO.FieldsErrors.Add("Name: Should Have a Value."); hasError = true; }
                        if (!string.IsNullOrEmpty(accountExcelDto.Website) && !_helper.ExcelHelper.IsValidWebsite(accountExcelDto.Website))
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Website: Not Valid Website Value."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.EmailAddress) && !_helper.ExcelHelper.IsValidEmail(accountExcelDto.EmailAddress))
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Email Address: Not Valid Email Value."); hasError = true; }

                        #endregion code, name, email and website validation

                        #region check record type
                        if (string.IsNullOrEmpty(accountExcelDto.RecordType) && Enum.TryParse<AccountExcelRecordType>(accountExcelDto.RecordType, out accountExcelRecordType))
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Record Type: Should Be Account|Branch|Contact."); hasError = true; }

                        if (string.IsNullOrEmpty(accountExcelDto.RecordType) && Enum.TryParse<AccountExcelAccountType>(accountExcelDto.AccountType, out accountExcelAccountType))
                        {
                            accountExcelRecordErrorDTO.FieldsErrors.Add("Account Type: Should Be Seller|Buyer|Both."); hasError = true;
                        }
                        if (accountExcelDto.RecordType == AccountExcelRecordType.Branch.ToString() && result.Where(r => r.Code == accountExcelDto.ParentCode && r.RecordType == AccountExcelRecordType.Account.ToString()).ToList().Count() == 0)
                        {
                            accountExcelRecordErrorDTO.FieldsErrors.Add("Parent Code: Branch Parent Should Be Of Account Type."); hasError = true;
                        }

                        if (accountExcelDto.RecordType == AccountExcelRecordType.Contact.ToString() && result.Where(r => r.Code == accountExcelDto.ParentCode && r.RecordType == AccountExcelRecordType.Branch.ToString()).ToList().Count() == 0)
                        {
                            accountExcelRecordErrorDTO.FieldsErrors.Add("Parent Code: Contact Parent Should Be Of Branch Type."); hasError = true;
                        }
                        #endregion check record type

                        #region phone validation
                        if (!string.IsNullOrEmpty(accountExcelDto.Phone1Code) &&
                            !string.IsNullOrEmpty(accountExcelDto.Phone1Number) &&
                            !_helper.ExcelHelper.IsPhoneNumber(accountExcelDto.Phone1Code + accountExcelDto.Phone1Number))
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 1: Phone 1 Is Filled With a InValid Phone# and Code."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Phone1Type) && GetTypeId(accountExcelDto.Phone1Type, phoneTypes) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 1: Phone 1 Type is InValid."); hasError = true; }



                        if (!string.IsNullOrEmpty(accountExcelDto.Phone2Code) &&
                           !string.IsNullOrEmpty(accountExcelDto.Phone2Number) &&
                           !_helper.ExcelHelper.IsPhoneNumber(accountExcelDto.Phone2Code + accountExcelDto.Phone2Number))
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 2: Phone 2 Is Filled With a InValid Phone# and Code."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Phone1Type) && GetTypeId(accountExcelDto.Phone1Type, phoneTypes) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 2: Phone 2 Type is InValid."); hasError = true; }



                        if (!string.IsNullOrEmpty(accountExcelDto.Phone3Code) &&
                            !string.IsNullOrEmpty(accountExcelDto.Phone3Number) &&
                            !_helper.ExcelHelper.IsPhoneNumber(accountExcelDto.Phone3Code + accountExcelDto.Phone3Number))
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 3: Phone 3 Is Filled With a InValid Phone# and Code."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Phone3Type) && GetTypeId(accountExcelDto.Phone3Type, phoneTypes) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Phone 3: Phone 3 Type is InValid."); hasError = true; }


                        #endregion phone validation

                        #region check address 
                        bool AddressTypeFound = false;

                        if (!string.IsNullOrEmpty(accountExcelDto.Address1Type) && GetTypeId(accountExcelDto.Address1Type, addressTypes) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 1 Type: Address Type is InValid."); hasError = true; }
                        else
                        { AddressTypeFound = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Address2Type) && GetTypeId(accountExcelDto.Address2Type, addressTypes) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 2 Type: Address Type is InValid."); hasError = true; }
                        else
                        { AddressTypeFound = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Address3Type) && GetTypeId(accountExcelDto.Address3Type, addressTypes) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 3 Type: Address Type is InValid."); hasError = true; }
                        else
                        { AddressTypeFound = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Address4Type) && GetTypeId(accountExcelDto.Address4Type, addressTypes) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 4 Type: Address Type is InValid."); hasError = true; }
                        else
                        { AddressTypeFound = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Address1Country) && GetTypeId(accountExcelDto.Address1Country, countries) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 1 Country: Country Code is InValid."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Address2Country) && GetTypeId(accountExcelDto.Address2Country, countries) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 2 Country: Country Code is InValid."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Address3Country) && GetTypeId(accountExcelDto.Address3Country, countries) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 3 Country: Country Code is InValid."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Address4Country) && GetTypeId(accountExcelDto.Address4Country, countries) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 4 Country: Country Code is InValid."); hasError = true; }

                        if (!AddressTypeFound)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address Type: At Least One Address Type Should Be Valid."); hasError = true; }

                        if ((!string.IsNullOrEmpty(accountExcelDto.Address1City) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address1Code) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address1Country) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address1Line1) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address1Line2) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address1Name) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address1PostalCode) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address1State) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address1Type)) &&
                            (string.IsNullOrEmpty(accountExcelDto.Address1City) ||
                            string.IsNullOrEmpty(accountExcelDto.Address1Code) ||
                            string.IsNullOrEmpty(accountExcelDto.Address1Country) ||
                            string.IsNullOrEmpty(accountExcelDto.Address1Line1) ||
                            string.IsNullOrEmpty(accountExcelDto.Address1Line2) ||
                            string.IsNullOrEmpty(accountExcelDto.Address1Name) ||
                            string.IsNullOrEmpty(accountExcelDto.Address1PostalCode) ||
                            string.IsNullOrEmpty(accountExcelDto.Address1State) ||
                            string.IsNullOrEmpty(accountExcelDto.Address1Type))
                            )
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 1 : Address 1 Field Should be All Filled or Removed."); hasError = true; }

                        if ((!string.IsNullOrEmpty(accountExcelDto.Address2City) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Code) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Country) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Line1) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Line2) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Name) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2PostalCode) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2State) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Type)) &&
                            !(string.IsNullOrEmpty(accountExcelDto.Address2City) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Code) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Country) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Line1) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Line2) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Name) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2PostalCode) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2State) ||
                            !string.IsNullOrEmpty(accountExcelDto.Address2Type))
                            )
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 2 : Address 2 Field Should be All Filled or Removed."); hasError = true; }

                        if ((!string.IsNullOrEmpty(accountExcelDto.Address3City) ||
                                            !string.IsNullOrEmpty(accountExcelDto.Address3Code) ||
                                            !string.IsNullOrEmpty(accountExcelDto.Address3Country) ||
                                            !string.IsNullOrEmpty(accountExcelDto.Address3Line1) ||
                                            !string.IsNullOrEmpty(accountExcelDto.Address3Line2) ||
                                            !string.IsNullOrEmpty(accountExcelDto.Address3Name) ||
                                            !string.IsNullOrEmpty(accountExcelDto.Address3PostalCode) ||
                                            !string.IsNullOrEmpty(accountExcelDto.Address3State) ||
                                            !string.IsNullOrEmpty(accountExcelDto.Address3Type)) &&
                                            (string.IsNullOrEmpty(accountExcelDto.Address3City) ||
                                            string.IsNullOrEmpty(accountExcelDto.Address3Code) ||
                                            string.IsNullOrEmpty(accountExcelDto.Address3Country) ||
                                            string.IsNullOrEmpty(accountExcelDto.Address3Line1) ||
                                            string.IsNullOrEmpty(accountExcelDto.Address3Line2) ||
                                            string.IsNullOrEmpty(accountExcelDto.Address3Name) ||
                                            string.IsNullOrEmpty(accountExcelDto.Address3PostalCode) ||
                                            string.IsNullOrEmpty(accountExcelDto.Address3State) ||
                                            string.IsNullOrEmpty(accountExcelDto.Address3Type))
                                            )
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 3 : Address 3 Field Should be All Filled or Removed."); hasError = true; }

                        if ((!string.IsNullOrEmpty(accountExcelDto.Address4City) ||
                                       !string.IsNullOrEmpty(accountExcelDto.Address4Code) ||
                                       !string.IsNullOrEmpty(accountExcelDto.Address4Country) ||
                                       !string.IsNullOrEmpty(accountExcelDto.Address4Line1) ||
                                       !string.IsNullOrEmpty(accountExcelDto.Address4Line2) ||
                                       !string.IsNullOrEmpty(accountExcelDto.Address4Name) ||
                                       !string.IsNullOrEmpty(accountExcelDto.Address4PostalCode) ||
                                       !string.IsNullOrEmpty(accountExcelDto.Address4State) ||
                                       !string.IsNullOrEmpty(accountExcelDto.Address4Type)) &&
                                       (string.IsNullOrEmpty(accountExcelDto.Address4City) ||
                                       string.IsNullOrEmpty(accountExcelDto.Address4Code) ||
                                       string.IsNullOrEmpty(accountExcelDto.Address4Country) ||
                                       string.IsNullOrEmpty(accountExcelDto.Address4Line1) ||
                                       string.IsNullOrEmpty(accountExcelDto.Address4Line2) ||
                                       string.IsNullOrEmpty(accountExcelDto.Address4Name) ||
                                       string.IsNullOrEmpty(accountExcelDto.Address4PostalCode) ||
                                       string.IsNullOrEmpty(accountExcelDto.Address4State) ||
                                       string.IsNullOrEmpty(accountExcelDto.Address4Type))
                                       )
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Address 4 : Address 4 Field Should be All Filled or Removed."); hasError = true; }


                        #endregion check address 

                        #region currency && language validation
                        if (!string.IsNullOrEmpty(accountExcelDto.Language) && GetTypeId(accountExcelDto.Language, languageIds) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Language: Should Have a Valid Language Value."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Currency) && GetTypeId(accountExcelDto.Currency, ObjectMapper.Map<List<LookupLabelDto>>(currencyIds)) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Currency: Should Have a Valid Currency Value."); hasError = true; }
                        #endregion currency && language validation

                        #region Class && department validation
                        if (!string.IsNullOrEmpty(accountExcelDto.BusinessClassification1) && GetClassId(accountExcelDto.BusinessClassification1, classIds) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Business Classification 1: Should Have a Valid Business Classification  Value."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.BusinessClassification2) && GetClassId(accountExcelDto.BusinessClassification2, classIds) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Business Classification 2: Should Have a Valid Business Classification  Value."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.BusinessClassification3) && GetClassId(accountExcelDto.BusinessClassification3, classIds) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Business Classification 3: Should Have a Valid Business Classification  Value."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Department1) && GetDepartmentId(accountExcelDto.Department1, departmentIds) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Department 1: Should Have a Valid Product Department  Value."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Department2) && GetDepartmentId(accountExcelDto.Department2, departmentIds) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Department 2: Should Have a Valid Product Department  Value."); hasError = true; }

                        if (!string.IsNullOrEmpty(accountExcelDto.Department3) && GetDepartmentId(accountExcelDto.Department3, departmentIds) == 0)
                        { accountExcelRecordErrorDTO.FieldsErrors.Add("Department 3: Should Have a Valid Product Department  Value."); hasError = true; }
                        #endregion Class && department validation

                        if (hasError)
                        {
                            accountExcelRecordErrorDTO.Status = ExcelRecordStatus.Failed.ToString();
                            accountExcelRecordErrorDTO.ErrorMessage = recordErrorMEssage;
                        }
                        accountExcelRecordErrorDTO.image1 = accountExcelDto.Image1FileName;
                        accountExcelRecordErrorDTO.image1Type = accountExcelDto.Image1Type;
                        accountExcelRecordErrorDTO.image2 = accountExcelDto.Image2FileName;
                        accountExcelRecordErrorDTO.image2Type = accountExcelDto.Image2Type;
                        accountExcelRecordErrorDTO.image3 = accountExcelDto.Image3FileName;
                        accountExcelRecordErrorDTO.image3Type = accountExcelDto.Image3Type;
                        accountExcelRecordErrorDTO.image4 = accountExcelDto.Image4FileName;
                        accountExcelRecordErrorDTO.image4Type = accountExcelDto.Image4Type;
                        accountExcelRecordErrorDTO.image5 = accountExcelDto.Image5FileName;
                        accountExcelRecordErrorDTO.image5Type = accountExcelDto.Image5Type;
                        //MMT22
                        accountExcelResultsDTO.ExcelRecords.Add(accountExcelRecordErrorDTO);

                        //ExpandoObject expando = new ExpandoObject();
                        //foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(accountExcelRecordErrorDTO.GetType()))
                        //    expando.TryAdd(property.Name, property.GetValue(accountExcelRecordErrorDTO));

                        //accountExcelResultsDTO.ExcelRecords.Add(expando);
                        //MMT22
                    }

                    #region if parent failed then children are failed
                    List<AccountExcelRecordDTO> resultSorted = accountExcelResultsDTO.ExcelRecords.OrderBy(r => r.ParentCode).ThenBy(r => r.Code).ToList();
                    foreach (AccountExcelRecordDTO accountExcelRecord in resultSorted)
                    {
                        if (accountExcelRecord.Status == ExcelRecordStatus.Failed.ToString())
                        {
                            accountExcelResultsDTO.ExcelRecords.Where(r => r.ParentCode ==
                            accountExcelRecord.Code).ToList()
                            .ForEach(r => r.Status = ExcelRecordStatus.Failed.ToString());
                        }
                    }
                    #endregion if parent failed then children are failed

                    accountExcelResultsDTO.TotalPassedRecords = accountExcelResultsDTO.ExcelRecords.Where(r => r.Status == ExcelRecordStatus.Passed.ToString() || r.Status == ExcelRecordStatus.Warning.ToString()).Count();
                    accountExcelResultsDTO.TotalFailedRecords = accountExcelResultsDTO.ExcelRecords.Where(r => r.Status == ExcelRecordStatus.Failed.ToString()).Count();
                    #endregion Excel validateion rules only.

                    #region update the excel sheet with errors
                    // Create new Spreadsheet
                    accountExcelResultsDTO.CodesFromList = new List<string>();
                    accountExcelResultsDTO.FromList = new List<Int32>();
                    accountExcelResultsDTO.ToList = new List<Int32>();
                    Spreadsheet document = new Spreadsheet();
                    document.LoadFromFile(accountExcelResultsDTO.FilePath);

                    // Get worksheet by name
                    Worksheet Sheet = document.Workbook.Worksheets[0];
                    // Set current cell
                    Sheet.Cell("CB1").Value = "Processing Status";
                    Sheet.Cell("CC1").Value = "Processing Error Message";
                    Sheet.Cell("CD1").Value = "Processing Error Details";
                    rowNumber = 1;
                    int div = 0;
                    //accountExcelResultsDTO.FromList.Add(1);
                    foreach (AccountExcelRecordDTO logRecord in accountExcelResultsDTO.ExcelRecords)
                    {
                        rowNumber++;
                        if (Sheet.Cell("A" + rowNumber.ToString()).Value.ToString() == "Account")
                        {
                            if (rowNumber > 2)
                            {
                                div++;
                                if (int.DivRem(div, 50).Remainder == 0)
                                {
                                    accountExcelResultsDTO.ToList.Add(rowNumber - 1);
                                    accountExcelResultsDTO.FromList.Add(rowNumber);
                                }
                            }
                            else
                                accountExcelResultsDTO.FromList.Add(rowNumber);
                            //accountExcelResultsDTO.FromList.Add(rowNumber);
                            //T-SII-20230109.0003,1 MMT 01/11/2023 Incorrect failure reason in the Excel log file[Start]
                            //accountExcelResultsDTO.CodesFromList.Add(Sheet.Cell("D" + rowNumber.ToString()).Value.ToString());
                            try
                            {
                                if (int.DivRem(div, 50).Remainder == 0)
                                {
                                    if (Sheet.Cell("E" + rowNumber.ToString()).GetType().GetProperty("Value").GetValue(Sheet.Cell("D" + rowNumber.ToString())) != null)
                                        accountExcelResultsDTO.CodesFromList.Add(Sheet.Cell("D" + rowNumber.ToString()).Value.ToString());
                                }
                            }
                            catch (Exception exp)
                            { }
                            //T-SII-20230109.0003,1 MMT 01/11/2023 Incorrect failure reason in the Excel log file[end]
                        }
                        Sheet.Cell("CB" + rowNumber.ToString()).Value = logRecord.Status;
                        Sheet.Cell("CC" + rowNumber.ToString()).Value = logRecord.ErrorMessage;
                        //T-SII-20230109.0003,1 MMT 01/11/2023 Incorrect failure reason in the Excel log file[Start]
                        //Sheet.Cell("CC" + rowNumber.ToString()).Value = logRecord.FieldsErrors.ToString().JoinAsString(",");
                        Sheet.Cell("CD" + rowNumber.ToString()).Value = logRecord.FieldsErrors.JoinAsString(",");
                        //T-SII-20230109.0003,1 MMT 01/11/2023 Incorrect failure reason in the Excel log file[End]
                    }
                    accountExcelResultsDTO.ToList.Add(rowNumber);
                    //move to attachment folder and save
                    accountExcelResultsDTO.FilePath = accountExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:PathTemp"], _appConfiguration[$"Attachment:Path"]);
                    //accountExcelResultsDTO.FilePath = accountExcelResultsDTO.FilePath.ToString().ToUpper().Replace("XLSX", "XLS");

                    document.SaveAsXLSX(accountExcelResultsDTO.FilePath);

                    // Close document
                    document.Close();

                    accountExcelResultsDTO.ExcelLogDTO = new ExcelLogDto();

                    accountExcelResultsDTO.ExcelLogDTO.ExcelLogPath = accountExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:Omitt"].ToString(), "");
                    // accountExcelResultsDTO.AccountExcelLogDTO.AccountExcelLogPath = @"https://localhost:44301/" + accountExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:Omitt"].ToString().ToUpper(), "");
                    accountExcelResultsDTO.ExcelLogDTO.ExcelLogPath = accountExcelResultsDTO.ExcelLogDTO.ExcelLogPath.ToLower();
                    accountExcelResultsDTO.ExcelLogDTO.ExcelLogFileName = _appConfiguration[$"Templates:AccountExcelLogFileName"];

                    #endregion update the excel sheet with errors

                }
            }
            catch (Exception ex)
            {
                accountExcelResultsDTO.ErrorMessage = ex.Message.ToString();
            }

            return accountExcelResultsDTO;
        }

        public string GetAccountCopyCode(string code, long entityObjectTypeId)
        {

            for (int i = 1; i < 1000; i++)
            {
                string newCode = code + i.ToString();
                AppContact account = _appContactRepository.GetAll().Where(r =>r.EntityFk.EntityObjectTypeId == entityObjectTypeId && r.Code == newCode).FirstOrDefault();
                if (account != null && account.Code == newCode)
                { }
                else { return newCode; }
            }
            return code;

        }

        public async Task AddAddresses(List<AccountExcelDto> result, List<LookupLabelDto> countries)
        {

            foreach (AccountExcelDto src in result)
            {
                if (!string.IsNullOrEmpty(src.Address1Code))
                {
                    IList<AppAddressDto> addresses = await GetAllAddresses();

                    List<AppAddressDto> appAddressDto1 = addresses.Where(r => r.Code == src.Address1Code &&
                            r.Name.TrimEnd().ToUpper() == src.Address1Name.TrimEnd().ToUpper() &&
                            r.AddressLine1.TrimEnd().ToUpper() == src.Address1Line1.TrimEnd().ToUpper() &&
                            r.AddressLine2.TrimEnd().ToUpper() == src.Address1Line2.TrimEnd().ToUpper() &&
                            r.City.TrimEnd().ToUpper() == src.Address1City.TrimEnd().ToUpper() &&
                            r.State.TrimEnd().ToUpper() == src.Address1State.TrimEnd().ToUpper() &&
                            r.PostalCode.TrimEnd().ToUpper() == src.Address1PostalCode.TrimEnd().ToUpper() &&
                            r.CountryCode.TrimEnd().ToUpper() == src.Address1Country.TrimEnd().ToUpper()).ToList();

                    if (appAddressDto1.Count == 0)
                    {
                        AppAddressDto address = new AppAddressDto();
                        //address.Id = 0;
                        address.Name = src.Address1Name;
                        address.TenantId = AbpSession.TenantId;
                        address.AddressLine1 = src.Address1Line1;
                        address.AddressLine2 = src.Address1Line2;
                        address.Code = src.Address1Code;
                        address.City = src.Address1City;
                        address.State = src.Address1State;
                        address.PostalCode = src.Address1PostalCode;
                        address.CountryId = GetTypeId(src.Address1Country, countries);
                        address.CountryCode = src.Address1Country;
                        address = await CreateOrEditAddress(address);
                        //await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                if (!string.IsNullOrEmpty(src.Address2Code))
                {
                    IList<AppAddressDto> addresses = await GetAllAddresses();

                    List<AppAddressDto> appAddressDto2 = addresses.Where(r => r.Code == src.Address2Code &&
                            r.Name.TrimEnd().ToUpper() == src.Address2Name.TrimEnd().ToUpper() &&
                            r.AddressLine1.TrimEnd().ToUpper() == src.Address2Line1.TrimEnd().ToUpper() &&
                            r.AddressLine2.TrimEnd().ToUpper() == src.Address2Line2.TrimEnd().ToUpper() &&
                            r.City.TrimEnd().ToUpper() == src.Address2City.TrimEnd().ToUpper() &&
                            r.State.TrimEnd().ToUpper() == src.Address2State.TrimEnd().ToUpper() &&
                            r.PostalCode.TrimEnd().ToUpper() == src.Address2PostalCode.TrimEnd().ToUpper() &&
                            r.CountryCode.TrimEnd().ToUpper() == src.Address2Country.TrimEnd().ToUpper()).ToList();


                    if (appAddressDto2.Count == 0)
                    {
                        AppAddressDto address = new AppAddressDto();
                        //address.Id = 0;
                        address.Name = src.Address2Name;
                        address.TenantId = AbpSession.TenantId;
                        address.AddressLine1 = src.Address2Line1;
                        address.AddressLine2 = src.Address2Line2;
                        address.Code = src.Address2Code;
                        address.City = src.Address2City;
                        address.State = src.Address2State;
                        address.PostalCode = src.Address2PostalCode;
                        address.CountryId = GetTypeId(src.Address2Country, countries);
                        address.CountryCode = src.Address2Country;
                        address = await CreateOrEditAddress(address);
                        // await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                if (!string.IsNullOrEmpty(src.Address3Code))
                {
                    IList<AppAddressDto> addresses = await GetAllAddresses();


                    List<AppAddressDto> appAddressDto3 = addresses.Where(r => r.Code == src.Address3Code &&
                    r.Name.TrimEnd().ToUpper() == src.Address3Name.TrimEnd().ToUpper() &&
                    r.AddressLine1.TrimEnd().ToUpper() == src.Address3Line1.TrimEnd().ToUpper() &&
                    r.AddressLine2.TrimEnd().ToUpper() == src.Address3Line2.TrimEnd().ToUpper() &&
                    r.City.TrimEnd().ToUpper() == src.Address3City.TrimEnd().ToUpper() &&
                    r.State.TrimEnd().ToUpper() == src.Address3State.TrimEnd().ToUpper() &&
                    r.PostalCode.TrimEnd().ToUpper() == src.Address3PostalCode.TrimEnd().ToUpper() &&
                    r.CountryCode.TrimEnd().ToUpper() == src.Address3Country.TrimEnd().ToUpper()).ToList();


                    if (appAddressDto3.Count == 0)
                    {
                        AppAddressDto address = new AppAddressDto();
                        address.Id = 0;
                        address.Name = src.Address3Name;
                        address.TenantId = AbpSession.TenantId;
                        address.AddressLine1 = src.Address3Line1;
                        address.AddressLine2 = src.Address3Line2;
                        address.Code = src.Address3Code;
                        address.City = src.Address3City;
                        address.State = src.Address3State;
                        address.PostalCode = src.Address3PostalCode;
                        address.CountryId = GetTypeId(src.Address3Country, countries);
                        address.CountryCode = src.Address3Country;
                        address = await CreateOrEditAddress(address);
                        //await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                if (!string.IsNullOrEmpty(src.Address4Code))
                {
                    IList<AppAddressDto> addresses = await GetAllAddresses();
                    List<AppAddressDto> appAddressDto4 = addresses.Where(r => r.Code == src.Address4Code &&
                   r.Name.TrimEnd().ToUpper() == src.Address4Name.TrimEnd().ToUpper() &&
                   r.AddressLine1.TrimEnd().ToUpper() == src.Address4Line1.TrimEnd().ToUpper() &&
                   r.AddressLine2.TrimEnd().ToUpper() == src.Address4Line2.TrimEnd().ToUpper() &&
                   r.City.TrimEnd().ToUpper() == src.Address4City.TrimEnd().ToUpper() &&
                   r.State.TrimEnd().ToUpper() == src.Address4State.TrimEnd().ToUpper() &&
                   r.PostalCode.TrimEnd().ToUpper() == src.Address4PostalCode.TrimEnd().ToUpper() &&
                   r.CountryCode.TrimEnd().ToUpper() == src.Address4Country.TrimEnd().ToUpper()).ToList();

                    if (appAddressDto4.Count == 0)
                    {
                        AppAddressDto address = new AppAddressDto();
                        address.Id = 0;
                        address.Name = src.Address4Name;
                        address.TenantId = AbpSession.TenantId;
                        address.AddressLine1 = src.Address4Line1;
                        address.AddressLine2 = src.Address4Line2;
                        address.Code = src.Address4Code;
                        address.City = src.Address4City;
                        address.State = src.Address4State;
                        address.PostalCode = src.Address4PostalCode;
                        address.CountryId = GetTypeId(src.Address4Country, countries);
                        address.CountryCode = src.Address4Country;
                        address = await CreateOrEditAddress(address);
                        //await CurrentUnitOfWork.SaveChangesAsync();

                    }
                }
            }

        }

        public async Task<long> AddAddress(long AccountId, AppContactAddressDto address, List<LookupLabelDto> countries)
        {
            if (!string.IsNullOrEmpty(address.Code))
            {
                IList<AppAddressDto> addresses = await GetAllAccountAddresses(AccountId);

                List<AppAddressDto> appAddressDto = addresses.Where(r => r.Code == address.Code &&
                        r.Name.TrimEnd().ToUpper() == address.Name.TrimEnd().ToUpper() &&
                        r.AddressLine1.TrimEnd().ToUpper() == address.AddressLine1.TrimEnd().ToUpper() &&
                        r.AddressLine2.TrimEnd().ToUpper() == address.AddressLine2.TrimEnd().ToUpper() &&
                        r.City.TrimEnd().ToUpper() == address.City.TrimEnd().ToUpper() &&
                        r.State.TrimEnd().ToUpper() == address.State.TrimEnd().ToUpper() &&
                        r.PostalCode.TrimEnd().ToUpper() == address.PostalCode.TrimEnd().ToUpper() &&
                        GetTypeId(address.CountryIdName, countries) > 0).ToList();

                if (appAddressDto.Count == 0) //|| AccountId == 0)
                {
                    AppAddressDto addressDto = new AppAddressDto();
                    addressDto.Name = address.Name;
                    addressDto.TenantId = AbpSession.TenantId;
                    addressDto.AddressLine1 = address.AddressLine1;
                    addressDto.AddressLine2 = address.AddressLine2;
                    addressDto.Code = address.Code;
                    addressDto.City = address.City;
                    addressDto.State = address.State;
                    addressDto.PostalCode = address.PostalCode;
                    if (string.IsNullOrEmpty(address.CountryIdName)) address.CountryIdName = "USA";
                    var countryId = GetTypeId(address.CountryIdName, countries);
                    addressDto.CountryId = countryId == 0 ? null : countryId;
                    addressDto.AccountId = AccountId;
                    var appAddressDtoRet = await CreateOrEditAddress(addressDto);
                    address.AddressId = appAddressDtoRet.Id;
                    address.AccountId = AccountId;
                    return address.AddressId;
                    //await CurrentUnitOfWork.SaveChangesAsync();
                }
                else
                {
                    address.AddressId = appAddressDto[0].Id;
                    address.AccountId = AccountId;
                    return address.AddressId;
                }
            }
            return 0;

        }

        public async Task AddClassifications(List<AccountExcelDto> result)
        {
            long ObjectId = await _helper.SystemTables.GetObjectContactId();
            #region add classifications
            foreach (AccountExcelDto src in result)
            {
                if (!string.IsNullOrEmpty(src.BusinessClassification1))
                {
                    PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForContact();
                    List<GetSycEntityObjectClassificationForViewDto> getSycEntityObjectClassificationForViewDtos = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Name == src.BusinessClassification1).ToList();

                    if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                    {
                        CreateOrEditSycEntityObjectClassificationDto createOrEditSycEntityObjectClassificationDto = new CreateOrEditSycEntityObjectClassificationDto();
                        createOrEditSycEntityObjectClassificationDto.Code = src.BusinessClassification1;
                        createOrEditSycEntityObjectClassificationDto.Name = src.BusinessClassification1;
                        createOrEditSycEntityObjectClassificationDto.ObjectId = ((int)ObjectId);
                        await _sycEntityObjectClassificationsAppService.CreateOrEdit(createOrEditSycEntityObjectClassificationDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                if (!string.IsNullOrEmpty(src.BusinessClassification2))
                {
                    PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForContact();
                    List<GetSycEntityObjectClassificationForViewDto> getSycEntityObjectClassificationForViewDtos = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Name == src.BusinessClassification2).ToList();

                    if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                    {
                        CreateOrEditSycEntityObjectClassificationDto createOrEditSycEntityObjectClassificationDto = new CreateOrEditSycEntityObjectClassificationDto();
                        createOrEditSycEntityObjectClassificationDto.Code = src.BusinessClassification2;
                        createOrEditSycEntityObjectClassificationDto.Name = src.BusinessClassification2;
                        createOrEditSycEntityObjectClassificationDto.ObjectId = ((int)ObjectId);
                        await _sycEntityObjectClassificationsAppService.CreateOrEdit(createOrEditSycEntityObjectClassificationDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }

                if (!string.IsNullOrEmpty(src.BusinessClassification3))
                {
                    PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classesIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForContact();
                    List<GetSycEntityObjectClassificationForViewDto> getSycEntityObjectClassificationForViewDtos = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Name == src.BusinessClassification3).ToList();

                    if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                    {
                        CreateOrEditSycEntityObjectClassificationDto createOrEditSycEntityObjectClassificationDto = new CreateOrEditSycEntityObjectClassificationDto();
                        createOrEditSycEntityObjectClassificationDto.Code = src.BusinessClassification3;
                        createOrEditSycEntityObjectClassificationDto.Name = src.BusinessClassification3;
                        createOrEditSycEntityObjectClassificationDto.ObjectId = ((int)ObjectId);
                        await _sycEntityObjectClassificationsAppService.CreateOrEdit(createOrEditSycEntityObjectClassificationDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }

            }
            #endregion add classifications
        }


        public async Task AddCategories(List<AccountExcelDto> result)
        {
            long ObjectId = await _helper.SystemTables.GetObjectContactId();
            #region add classifications
            foreach (AccountExcelDto src in result)
            {
                if (!string.IsNullOrEmpty(src.Department1))
                {
                    PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();
                    List<GetSycEntityObjectCategoryForViewDto> getSycEntityObjectClassificationForViewDtos = departmentsIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Name == src.Department1).ToList();
                    if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                    {
                        CreateOrEditSycEntityObjectCategoryDto createOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();
                        createOrEditSycEntityObjectCategoryDto.Name = src.Department1;
                        createOrEditSycEntityObjectCategoryDto.ObjectId = ((int)ObjectId);
                        createOrEditSycEntityObjectCategoryDto.Code = src.Department1;
                        await _sycEntityObjectCategoriesAppService.CreateOrEdit(createOrEditSycEntityObjectCategoryDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }

                if (!string.IsNullOrEmpty(src.Department2))
                {
                    PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();
                    List<GetSycEntityObjectCategoryForViewDto> getSycEntityObjectClassificationForViewDtos = departmentsIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Name == src.Department2).ToList();
                    if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                    {
                        CreateOrEditSycEntityObjectCategoryDto createOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();
                        createOrEditSycEntityObjectCategoryDto.Name = src.Department2;
                        createOrEditSycEntityObjectCategoryDto.ObjectId = ((int)ObjectId);
                        createOrEditSycEntityObjectCategoryDto.Code = src.Department2;
                        await _sycEntityObjectCategoriesAppService.CreateOrEdit(createOrEditSycEntityObjectCategoryDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                if (!string.IsNullOrEmpty(src.Department3))
                {
                    PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentsIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();
                    List<GetSycEntityObjectCategoryForViewDto> getSycEntityObjectClassificationForViewDtos = departmentsIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Name == src.Department3).ToList();
                    if (getSycEntityObjectClassificationForViewDtos.Count == 0)
                    {
                        CreateOrEditSycEntityObjectCategoryDto createOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();
                        createOrEditSycEntityObjectCategoryDto.Name = src.Department3;
                        createOrEditSycEntityObjectCategoryDto.ObjectId = ((int)ObjectId);
                        createOrEditSycEntityObjectCategoryDto.Code = src.Department3;
                        await _sycEntityObjectCategoriesAppService.CreateOrEdit(createOrEditSycEntityObjectCategoryDto);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }

            }
            #endregion add classifications

        }


        public async Task AddTitles(List<AccountExcelDto> result)
        {
            var titleId = await _helper.SystemTables.GetEntityObjectTypeTitleId();
            List<LookupLabelDto> titleIds = await _appEntitiesAppService.GetAllTitlesForTableDropdown();

            List<AppEntitySycEntityObjectStatusLookupTableDto> statusIds = await _appEntitiesAppService.GetAllSycEntityObjectStatusForTableDropdown();

            #region add titles
            foreach (AccountExcelDto src in result)
            {
                if (!string.IsNullOrEmpty(src.Title) && src.RecordType == "Contact")
                {

                    List<LookupLabelDto> titlesList = titleIds.Where(r => r.Code.TrimEnd().ToUpper() == src.Title.TrimEnd().ToUpper()).ToList();
                    if (titlesList.Count == 0)
                    {
                        CreateOrEditAppEntityDto entity = new CreateOrEditAppEntityDto();
                        entity.Id = 0;
                        entity.Name = src.Title.TrimEnd();
                        entity.Code = src.Title.TrimEnd().ToUpper();
                        entity.EntityObjectStatusId = statusIds.Where(r => r.Code.TrimEnd().ToUpper() == "ACTIVE").FirstOrDefault().Id;
                        entity.EntityObjectTypeId = titleId;

                        await _appEntitiesAppService.CreateOrEdit(entity);
                        await CurrentUnitOfWork.SaveChangesAsync();

                    }
                }

            }
            #endregion add titles

        }

        //MMT
        //public async Task<AccountExcelLogDto> SaveAccountFromExcel(AccountExcelResultsDTO accountExcelResultsDTO)
        public async Task<ExcelLogDto> SaveFromExcel(AccountExcelResultsDTO accountExcelResultsDTO)
        //MMT2
        {
            #region get lists

            // get not failed recoreds
            List<AccountExcelDto> result = accountExcelResultsDTO.ExcelRecords.Where(r => r.Status !=
            ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AccountExcelDto>();

            List<LookupLabelDto> countries = await _appEntitiesAppService.GetAllCountryForTableDropdown();

            //await AddAddresses(result, countries);
            await AddClassifications(result.ToList<AccountExcelDto>());
            await AddCategories(result);
            //stopped as per Ahmed email and approved by Omar
            //await AddTitles(result);

            // get addresses
            //IList<AppAddressDto> addresses = await GetAllAddresses();
            IList<AppAddressDto> addresses = new List<AppAddressDto>();

            // get Product Departments
            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();

            // get addresses types
            List<LookupLabelDto> addressTypes = await _appEntitiesAppService.GetAllAddressTypeForTableDropdown();

            //get classifications for contacts
            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForContact();

            //get phone types
            List<LookupLabelDto> phoneTypes = await _appEntitiesAppService.GetAllPhoneTypeForTableDropdown();

            //get currency types
            List<CurrencyInfoDto> currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();

            //get language types            
            List<LookupLabelDto> languageIds = await _appEntitiesAppService.GetAllLanguageForTableDropdown();

            //get attachments category
            List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();

            //get titles
            //List<LookupLabelDto> titleIds = await _appEntitiesAppService.GetAllTitlesForTableDropdown();

            //get account types
            List<LookupLabelDto> accountTypes = await _appEntitiesAppService.GetAllAccountTypesForTableDropdown();
            #endregion get lists

            #region CreateOrEditAccountInfoDto Mapper - Save

            try
            {
                // Abdo to fix compiling issue - Start
                List<LookupLabelDto> _currencyIds = new List<LookupLabelDto>();
                ObjectMapper.Map<List<CurrencyInfoDto>, List<LookupLabelDto>>(currencyIds, _currencyIds);
                // Abdo to fix compiling issue - End
                //xx
                var contactObjectId = await _helper.SystemTables.GetObjectContactId();
                var partnerEntityObjectType = await _helper.SystemTables.GetEntityObjectTypeParetner();
                var partnerEntityObjectTypeId = partnerEntityObjectType.Id;
                var partnerEntityObjectTypeCode = partnerEntityObjectType.Code;
                //xx
                #region add accounts
                MapperConfiguration configurationAccount;
                configurationAccount = new MapperConfiguration(a =>
                {
                    a.AddProfile(new CreateOrEditAccountInfoDtoProfile(phoneTypes, _currencyIds, languageIds, classIds, addresses, addressTypes, AbpSession.TenantId.ToString(), departmentIds, attachmentsCategories, accountTypes));
                });
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var presonEntityObjectTypeCode = await _helper.SystemTables.GetEntityObjectTypePersonCode();
                IMapper mapperAccount;
                mapperAccount = configurationAccount.CreateMapper();
                List<AppContact> accountsList = new List<AppContact>();
                List<AppContact> accountsListUpdated = new List<AppContact>();
                List<AccountExcelDto> accountsResult = result.Where(r => r.RecordType == "Account" && string.IsNullOrEmpty(r.ParentCode)
                && r.rowNumber >= accountExcelResultsDTO.From && r.rowNumber <= accountExcelResultsDTO.To).ToList();
                List<CreateOrEditAccountInfoDto> resultAccount = mapperAccount.Map<List<AccountExcelDto>, List<CreateOrEditAccountInfoDto>>(accountsResult);
                //xx
                var accountList = (from o in _appContactRepository.GetAll().AsNoTracking().Where(r => r.EntityFk.EntityObjectTypeId == partnerEntityObjectTypeId).ToList()
                                   join s in resultAccount on o.Code equals s.Code select o).ToList();
                //xx
                foreach (CreateOrEditAccountInfoDto createOrEditAccountInfoDto in resultAccount)
                {
                    AppContact account = accountList.FirstOrDefault(a=>a.Code== createOrEditAccountInfoDto.Code);
                        //_appContactRepository.GetAll().AsNoTracking().Where(r => r.EntityFk.EntityObjectTypeId == partnerEntityObjectTypeId  && r.Code == createOrEditAccountInfoDto.Code).FirstOrDefault();
                    string code = createOrEditAccountInfoDto.Code;
                    string oldCode = createOrEditAccountInfoDto.Code;
                    long entId = 0;
                    if (account != null && account.Id > 0)
                    {
                        switch (accountExcelResultsDTO.RepreateHandler)
                        {
                            case ExcelRecordRepeateHandler.IgnoreDuplicatedRecords: //ignore
                                continue;
                            case ExcelRecordRepeateHandler.ReplaceDuplicatedRecords: // replace
                                createOrEditAccountInfoDto.Id = account.Id;
                                entId = account.EntityId;
                                break;
                            case ExcelRecordRepeateHandler.CreateACopy: // override
                                createOrEditAccountInfoDto.Code = GetAccountCopyCode(code, partnerEntityObjectTypeId);
                                createOrEditAccountInfoDto.Id = 0;
                                break;
                            default:
                                break;
                        }

                    }

                    //XXa
                    
                    AppContact accountContact = new AppContact();
                    accountContact.AccountId =null;
                    accountContact.Id = 0;
                    if (createOrEditAccountInfoDto.Id != null && createOrEditAccountInfoDto.Id > 0)
                    {
                        accountContact.AccountId = long.Parse(createOrEditAccountInfoDto.Id.ToString());
                        accountContact.Id = long.Parse(createOrEditAccountInfoDto.Id.ToString());
                    }
                    accountContact.ParentId = null;
                    accountContact.AccountType = createOrEditAccountInfoDto.AccountType;
                    accountContact.AccountTypeId = createOrEditAccountInfoDto.AccountTypeId;
                    accountContact.AppContactAddresses = ObjectMapper.Map<List<AppContactAddress>>(createOrEditAccountInfoDto.ContactAddresses);
                    // accountContact.AccountId = null;
                    accountContact.AppContactPaymentMethods = ObjectMapper.Map<List<AppContactPaymentMethod>>(createOrEditAccountInfoDto.ContactPaymentMethods);
                    accountContact.Code = createOrEditAccountInfoDto.Code;
                    accountContact.Name = createOrEditAccountInfoDto.Name;
                    accountContact.TradeName = createOrEditAccountInfoDto.TradeName;
                    accountContact.TenantId = AbpSession.TenantId;
                    accountContact.CurrencyId = createOrEditAccountInfoDto.CurrencyId;
                    accountContact.EMailAddress = createOrEditAccountInfoDto.EMailAddress;
                    accountContact.Phone2Number = createOrEditAccountInfoDto.Phone2Number;
                    accountContact.Phone1Number= createOrEditAccountInfoDto.Phone1Number;
                    accountContact.Phone3Number = createOrEditAccountInfoDto.Phone3Number;
                    accountContact.IsProfileData = createOrEditAccountInfoDto.AccountLevel == AccountLevelEnum.Profile;
                    accountContact.LanguageId = createOrEditAccountInfoDto.LanguageId;
                    accountContact.Phone1Ext = createOrEditAccountInfoDto.Phone1Ex;
                    accountContact.Phone2Ext = createOrEditAccountInfoDto.Phone2Ex;
                    accountContact.Phone3Ext = createOrEditAccountInfoDto.Phone3Ex;
                    accountContact.Phone1TypeId = createOrEditAccountInfoDto.Phone1TypeId == 0 ? null : createOrEditAccountInfoDto.Phone1TypeId; 
                    accountContact.Phone2TypeId = createOrEditAccountInfoDto.Phone2TypeId == 0 ? null : createOrEditAccountInfoDto.Phone2TypeId;
                    accountContact.Phone3TypeId = createOrEditAccountInfoDto.Phone3TypeId == 0 ? null : createOrEditAccountInfoDto.Phone3TypeId;
                    accountContact.PriceLevel = createOrEditAccountInfoDto.PriceLevel;
                    accountContact.Website = createOrEditAccountInfoDto.Website;
                    accountContact.EntityFk = new AppEntity();
                    accountContact.EntityFk.Id = entId;
                    accountContact.PartnerId = null;
                    accountContact.EntityFk.TenantId = AbpSession.TenantId;
                    accountContact.EntityFk.Code = createOrEditAccountInfoDto.Code;
                    accountContact.EntityFk.Name = createOrEditAccountInfoDto.Name;
                    accountContact.EntityFk.Notes = createOrEditAccountInfoDto.Notes;
                    accountContact.EntityFk.ObjectId =contactObjectId;
                    accountContact.EntityFk.EntityObjectTypeId = partnerEntityObjectTypeId ;
                    accountContact.EntityFk.EntityObjectTypeCode = partnerEntityObjectTypeCode;
                    accountContact.EntityFk.EntityObjectTypeFk = partnerEntityObjectType;
                    accountContact.EntityFk.EntityCategories = ObjectMapper.Map<List<AppEntityCategory>>(createOrEditAccountInfoDto.EntityCategories);
                    accountContact.EntityFk.EntityAttachments = ObjectMapper.Map<List<AppEntityAttachment>>(createOrEditAccountInfoDto.EntityAttachments);
                    //accountContact.EntityFk.EntityAddresses = createOrEditAccountInfoDto.ContactAddresses;
                    if (string.IsNullOrEmpty(createOrEditAccountInfoDto.SSIN))
                    {
                        accountContact.EntityFk.SSIN = await 
                            _helper.SystemTables.GenerateSSIN(contactObjectId, ObjectMapper.Map<AppEntityDto>(accountContact.EntityFk));
                        accountContact.SSIN = accountContact.EntityFk.SSIN;
                    }
                    //accountContact.EntityFk.EntityAddresses = ObjectMapper.Map<List<AppEntityAddress>>(createOrEditAccountInfoDto.ContactAddresses);
                    accountContact.ParentFkList = new List<AppContact>();
                    
                    //XXa
                    foreach (var address in createOrEditAccountInfoDto.ContactAddresses)
                    {
                        //address.AccountId = createOrEditAccountInfoDto.AccountId;
                        var addressId = await AddAddress(0, address, countries);
                        if (addressId != null)
                            address.AddressId = addressId;
                    }
                    List<AppContactAddress> accAddress = new List<AppContactAddress>();
                    accountContact.AppContactAddresses = new List<AppContactAddress>();
                    accAddress = ObjectMapper.Map<List<AppContactAddress>>(createOrEditAccountInfoDto.ContactAddresses);
                    foreach (var address in accAddress)
                    {
                        accountContact.AppContactAddresses.Add(new AppContactAddress
                        {
                            AddressFk =address.AddressFk,
                            ContactFk = accountContact,
                            AddressId = address.AddressId,
                            AddressCode = address.AddressCode,
                            ContactCode = accountContact.Code,
                            ContactId = accountContact.Id,
                            AddressTypeId = address.AddressTypeId
                        });
                    }
                    if (accountContact.Id > 0)
                        accountsListUpdated.Add(accountContact);
                    else
                        accountsList.Add(accountContact);

                    accountContact.ParentFkList = new List<AppContact>();
                    //XXB
                    MapperConfiguration configurationBranchAcc;
                    configurationBranchAcc = new MapperConfiguration(a => { a.AddProfile(new BranchDtoProfile(phoneTypes, _currencyIds, languageIds, classIds, addresses, addressTypes)); });
                    IMapper mapperBranchAcc;
                    mapperBranchAcc = configurationBranchAcc.CreateMapper();
                    List<AccountExcelDto> resultExcelAccBranch = accountExcelResultsDTO.ExcelRecords.Where(r => r.Status
                 != ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AccountExcelDto>();
                    List<AccountExcelDto> resultExcelAccBranchOnly = resultExcelAccBranch.Where(r => r.RecordType == "Branch"
                    && !string.IsNullOrEmpty(r.ParentCode) && r.ParentCode == oldCode
                    && r.rowNumber >= accountExcelResultsDTO.From && r.rowNumber <= accountExcelResultsDTO.To
                    ).OrderBy(r => r.ParentCode).ToList();

                    

                    foreach (var branch in resultExcelAccBranchOnly)
                    {
                        branch.ParentId = 0;
                        try
                        {
                            //var BranchParent = _appContactRepository.GetAll().AsNoTracking().Where(r => r.EntityFk.EntityObjectTypeId == partnerEntityObjectTypeId && r.Code == branch.ParentCode).FirstOrDefault();
                            var BranchParent = accountList.FirstOrDefault(r=>r.Code == branch.ParentCode);
                            if (BranchParent != null)
                            {
                                branch.ParentId = BranchParent.Id;
                                branch.AccountId = BranchParent.Id;

                                if (BranchParent.AccountId != null && BranchParent.AccountId > 0)
                                { branch.AccountId = BranchParent.AccountId; }
                            }
                        }
                        catch (Exception ex) { branch.ParentId = 0; }

                    }
                    List<BranchDto> resultBranchDtoA = mapperBranchAcc.Map<List<AccountExcelDto>, List<BranchDto>>(resultExcelAccBranchOnly);
                    //XXX
                    var accountBranchList = (from o in _appContactRepository.GetAll().AsNoTracking().Where(r => r.EntityFk.EntityObjectTypeId == partnerEntityObjectTypeId).ToList()
                                             join s in resultBranchDtoA on o.Code equals s.Code
                                             select o).ToList();
                    //XXX
                    foreach (BranchDto branchDto in resultBranchDtoA)
                    {
                        string oldSSIN = "";
                        if(true)// (branchDto.ParentId > 0)&& r.ParentCode== oldCode
                        {
                            AppContact accountA = accountBranchList.FirstOrDefault(r => r.Code == branchDto.Code); //_appContactRepository.GetAll().AsNoTracking().Include(z => z.EntityFk)
                                //.Where(r => r.Code == branchDto.Code && r.EntityFk.EntityObjectTypeId == partnerEntityObjectTypeId ).FirstOrDefault();
                            string codeA = branchDto.Code;
                            string oldBranchCode = branchDto.Code;
                            long? accountId = null;
                            long bEntityId = 0;
                            if (accountA != null && accountA.Id > 0)
                            {
                                oldSSIN = accountA.SSIN;
                                switch (accountExcelResultsDTO.RepreateHandler)
                                {
                                    case ExcelRecordRepeateHandler.IgnoreDuplicatedRecords: //ignore
                                        continue;
                                    case ExcelRecordRepeateHandler.ReplaceDuplicatedRecords: // replace
                                        branchDto.Id = accountA.Id;
                                        accountId = accountA.AccountId;
                                        bEntityId = accountA.EntityId;
                                        break;
                                    case ExcelRecordRepeateHandler.CreateACopy: // override
                                        branchDto.Code = GetAccountCopyCode(codeA, partnerEntityObjectTypeId);
                                        oldSSIN = "";
                                        break;
                                    default:
                                        break;
                                }
                            }
                            //branchDto.AccountId = branchDto.ParentId;
                            foreach (var address in branchDto.ContactAddresses)
                            { 
                                
                                address.AccountId =branchDto.AccountId!=null?(long)branchDto.AccountId:0;
                               // var addressObj = ObjectMapper.Map<AppAddress>(address);
                                
                                var addressId = await AddAddress(address.AccountId, address, countries);
                                if (addressId != null)
                                 address.AddressId = addressId;
                            }
                            //xxxxx
                           
                            //xxb
                            AppContact branchContact = new AppContact();
                            branchContact.SSIN = oldSSIN;
                            branchContact.AccountId = null;//accountContact.Id;
                            branchContact.ParentId = accountContact.Id; 
                            branchContact.AccountType = accountContact.AccountType;
                            branchContact.AccountTypeId = accountContact.AccountTypeId;
                            List<AppContactAddress> bAddress = new List<AppContactAddress>();
                            branchContact.AppContactAddresses = new List<AppContactAddress>();
                            bAddress = ObjectMapper.Map<List<AppContactAddress>>(branchDto.ContactAddresses);
                            foreach (var address in bAddress)
                            {
                                branchContact.AppContactAddresses.Add(new AppContactAddress
                                { AddressFk =  address.AddressFk ,ContactFk = branchContact,
                                    AddressId = address.AddressId, AddressCode = address.AddressCode, ContactCode = branchContact.Code,
                                    ContactId = branchContact.Id, AddressTypeId = address.AddressTypeId 
                                });
                            }
                            branchContact.AccountId = null;//accountContact.Id; 
                            branchContact.Id = 0;
                            if (branchDto.Id != null && branchDto.Id > 0)
                            {
                                branchContact.AccountId = accountId;
                                branchContact.Id = long.Parse(branchDto.Id.ToString());
                            }
                            branchContact.AppContactPaymentMethods = accountContact.AppContactPaymentMethods;
                            branchContact.Code = branchDto.Code;
                            branchContact.Name = branchDto.Name;
                            branchContact.TradeName = branchDto.TradeName;
                            branchContact.TenantId = AbpSession.TenantId;
                            branchContact.CurrencyId = string.IsNullOrEmpty(branchDto.CurrencyId.ToString()) || branchDto.CurrencyId ==0 ?  null : branchDto.CurrencyId;
                            branchContact.EMailAddress = branchDto.EMailAddress;
                            branchContact.Phone2Number = branchDto.Phone2Number;
                            branchContact.Phone1Number = branchDto.Phone1Number;
                            branchContact.Phone3Number = branchDto.Phone3Number;
                            branchContact.IsProfileData = true;
                            branchContact.LanguageId = branchDto.LanguageId;
                            branchContact.Phone1Ext = branchDto.Phone1Ext;
                            branchContact.Phone2Ext = branchDto.Phone2Ext;
                            branchContact.Phone3Ext = branchDto.Phone3Ext;
                            branchContact.Phone1TypeId = branchDto.Phone1TypeId == 0 ? null : branchDto.Phone1TypeId;
                            branchContact.Phone2TypeId = branchDto.Phone2TypeId == 0 ? null : branchDto.Phone2TypeId;
                            branchContact.Phone3TypeId = branchDto.Phone3TypeId == 0 ? null : branchDto.Phone3TypeId;
                            branchContact.PriceLevel = accountContact.PriceLevel;
                            branchContact.Website = branchDto.Website;
                            branchContact.EntityFk = new AppEntity();
                            branchContact.EntityFk.Id = bEntityId;
                            branchContact.EntityFk.TenantId = AbpSession.TenantId;
                            branchContact.PartnerId = null;
                            branchContact.EntityFk.Code = branchDto.Code;
                            branchContact.EntityFk.Name = branchDto.Name;
                            branchContact.EntityFk.Notes = accountContact.EntityFk.Notes;
                            branchContact.EntityFk.ObjectId = contactObjectId;
                            branchContact.EntityFk.EntityObjectTypeId = partnerEntityObjectTypeId;
                            branchContact.EntityFk.EntityObjectTypeCode = partnerEntityObjectTypeCode;
                            branchContact.EntityFk.EntityObjectTypeFk = partnerEntityObjectType;
                            branchContact.EntityFk.EntityCategories =accountContact.EntityFk.EntityCategories;
                            branchContact.EntityFk.EntityAttachments =accountContact.EntityFk.EntityAttachments;
                            //accountContact.EntityFk.EntityAddresses = createOrEditAccountInfoDto.ContactAddresses;
                            if (string.IsNullOrEmpty(branchContact.SSIN))
                            {
                                branchContact.EntityFk.SSIN = await
                                    _helper.SystemTables.GenerateSSIN(contactObjectId, ObjectMapper.Map<AppEntityDto>(branchContact.EntityFk));
                                branchContact.SSIN = branchContact.EntityFk.SSIN;
                            }
                           // branchContact.EntityFk.EntityAddresses = ObjectMapper.Map<List<AppEntityAddress>>(branchDto.ContactAddresses);
                           
                           
                            accountContact.ParentFkList.Add(branchContact);
                            branchContact.ParentFkList = new List<AppContact>();
                            //xxb
                            //xxTM
                            MapperConfiguration configurationContactAcc;
                            //stopped as per Ahmed email and approved by Omar
                            //configurationContact = new MapperConfiguration(a => { a.AddProfile(new ContactDtoProfile(phoneTypes, currencyIds, languageIds, classIds, addresses, addressTypes, titleIds)); });
                            configurationContactAcc = new MapperConfiguration(a => { a.AddProfile(new ContactDtoProfile(phoneTypes, ObjectMapper.Map<List<LookupLabelDto>>(currencyIds), languageIds, classIds, addresses, addressTypes)); });

                            IMapper mapperContactAcc;
                            mapperContactAcc = configurationContactAcc.CreateMapper();
                            List<AccountExcelDto> resultExcelPersonAcc = accountExcelResultsDTO.ExcelRecords.Where(r => r.Status
                            != ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AccountExcelDto>();
                            List<AccountExcelDto> contactsExcelOnlyResultAcc = resultExcelPersonAcc.Where(r => r.RecordType == "Contact"
                            && !string.IsNullOrEmpty(r.ParentCode) && r.ParentCode == oldBranchCode
                            && r.rowNumber >= accountExcelResultsDTO.From && r.rowNumber <= accountExcelResultsDTO.To
                            ).OrderBy(r => r.ParentCode).ToList<AccountExcelDto>();
                            foreach (AccountExcelDto personExcelDto in contactsExcelOnlyResultAcc)
                            {
                                personExcelDto.ParentId = 0;
                                try
                                {
                                    var BranchParent = _appContactRepository.GetAll().AsNoTracking().Where(r => r.Code == personExcelDto.ParentCode).FirstOrDefault();
                                    if (BranchParent != null)
                                    {
                                        personExcelDto.ParentId = BranchParent.Id;
                                        personExcelDto.AccountId = BranchParent.Id;

                                        if (BranchParent.AccountId != null && BranchParent.AccountId > 0)
                                        { personExcelDto.AccountId = BranchParent.AccountId; }
                                    }
                                }
                                catch (Exception ex) { personExcelDto.ParentId = 0; }
                            }

                            List<ContactDto> resultContactAcc = mapperContactAcc.Map<List<AccountExcelDto>, List<ContactDto>>(contactsExcelOnlyResultAcc);
                            //XXX
                            var accountContactTeamList = (from o in _appContactRepository.GetAll().AsNoTracking().Where(r => r.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId).ToList()
                                                     join s in resultContactAcc on o.Code equals s.Code
                                                     select o).ToList();
                            //XXX
                            foreach (ContactDto personDto in resultContactAcc)
                            {
                                string oldTMSSIN = "";
                                if (true)//(personDto.ParentId > 0) && r.ParentCode == oldBranchCode
                                {
                                    //AppContact account = _appContactRepository.GetAll().Where(r => r.Code == personDto.Code && r.ParentId == personDto.ParentId).FirstOrDefault();
                                    //AppContact accountTeam = _appContactRepository.GetAll().AsNoTracking().Include(z=>z.EntityFk)
                                    //  .Where(r => r.Code == personDto.Code &&
                                    //  r.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId ).FirstOrDefault();
                                    AppContact accountTeam = accountContactTeamList.FirstOrDefault(r => r.Code == personDto.Code);
                                    string codeT = personDto.Code;
                                    string oldPersonCode = personDto.Code;
                                    long entityId = 0;
                                    if (accountTeam!=null)
                                       oldTMSSIN = accountTeam.SSIN;

                                    if (accountTeam != null && accountTeam.Id > 0)
                                    {
                                        switch (accountExcelResultsDTO.RepreateHandler)
                                        {
                                            case ExcelRecordRepeateHandler.IgnoreDuplicatedRecords: //ignore
                                                continue;
                                            case ExcelRecordRepeateHandler.ReplaceDuplicatedRecords: // replace
                                                personDto.Id = accountTeam.Id;
                                                accountId = accountTeam.AccountId;
                                                entityId = accountTeam.EntityId;
                                                break;
                                            case ExcelRecordRepeateHandler.CreateACopy: // override
                                                personDto.Code = GetAccountCopyCode(codeT, presonEntityObjectTypeId);
                                                oldTMSSIN = "";
                                                break;
                                            default:
                                                break;
                                        }

                                    }
                                    foreach (var address in personDto.ContactAddresses)
                                    {
                                        address.AccountId = personDto.AccountId;
                                        var addressId = await AddAddress(personDto.AccountId, address, countries);
                                        if (addressId != null)
                                            address.AddressId = addressId;
                                    }

                                    AppContact teamContact = new AppContact();
                                    teamContact.AccountId = null;//accountContact.Id;
                                    teamContact.SSIN = oldTMSSIN;
                                    teamContact.ParentId = branchContact.Id;
                                    teamContact.AccountType = accountContact.AccountType;
                                    teamContact.AccountTypeId = accountContact.AccountTypeId;
                                    teamContact.AppContactAddresses = ObjectMapper.Map<List<AppContactAddress>>(personDto.ContactAddresses);
                                    if (personDto.Id != null && personDto.Id > 0)
                                    {
                                        teamContact.AccountId = accountId;
                                        teamContact.Id = long.Parse(personDto.Id.ToString());
                                    }
                                    teamContact.AppContactPaymentMethods = accountContact.AppContactPaymentMethods;
                                    teamContact.Code = personDto.Code;
                                    teamContact.Name = personDto.Name;
                                    teamContact.TradeName = personDto.TradeName;
                                    teamContact.TenantId = AbpSession.TenantId;
                                    teamContact.CurrencyId = string.IsNullOrEmpty(personDto.CurrencyId.ToString()) || personDto.CurrencyId==0 ? null : personDto.CurrencyId;
                                    teamContact.EMailAddress = personDto.EMailAddress;
                                    teamContact.Phone2Number = personDto.Phone2Number;
                                    teamContact.Phone1Number = personDto.Phone1Number;
                                    teamContact.Phone3Number = personDto.Phone3Number;
                                    teamContact.IsProfileData = true;
                                    teamContact.LanguageId = personDto.LanguageId;
                                    teamContact.Phone1Ext = personDto.Phone1Ext;
                                    teamContact.Phone2Ext = personDto.Phone2Ext;
                                    teamContact.Phone3Ext = personDto.Phone3Ext;
                                    teamContact.Phone1TypeId = personDto.Phone1TypeId == 0 ? null : personDto.Phone1TypeId;
                                    teamContact.Phone2TypeId = personDto.Phone2TypeId == 0 ? null : personDto.Phone2TypeId;
                                    teamContact.Phone3TypeId = personDto.Phone3TypeId == 0 ? null : personDto.Phone3TypeId;
                                    teamContact.PriceLevel = accountContact.PriceLevel;
                                    teamContact.Website = personDto.Website;
                                    teamContact.EntityFk = new AppEntity();
                                    teamContact.EntityFk.Id = entityId;
                                    teamContact.PartnerId = null;
                                    teamContact.EntityFk.TenantId = AbpSession.TenantId;
                                    teamContact.EntityFk.Code = personDto.Code;
                                    teamContact.EntityFk.Name = personDto.Name;
                                    teamContact.EntityFk.Notes = accountContact.EntityFk.Notes;
                                    teamContact.EntityFk.ObjectId = contactObjectId;
                                    teamContact.EntityFk.EntityObjectTypeId = presonEntityObjectTypeId;
                                    teamContact.EntityFk.EntityObjectTypeCode = presonEntityObjectTypeCode;
                                    teamContact.EntityFk.EntityObjectTypeFk = null;
                                    teamContact.EntityFk.EntityCategories = accountContact.EntityFk.EntityCategories;
                                    teamContact.EntityFk.EntityAttachments = accountContact.EntityFk.EntityAttachments;
                                    //accountContact.EntityFk.EntityAddresses = createOrEditAccountInfoDto.ContactAddresses;
                                    if (string.IsNullOrEmpty(teamContact.SSIN))
                                    {
                                        teamContact.EntityFk.SSIN = await
                                            _helper.SystemTables.GenerateSSIN(contactObjectId, ObjectMapper.Map<AppEntityDto>(teamContact.EntityFk));
                                        teamContact.SSIN = teamContact.EntityFk.SSIN;
                                    }
                                    List<AppContactAddress> teamAddress = new List<AppContactAddress>();
                                    teamContact.AppContactAddresses = new List<AppContactAddress>();
                                    teamAddress = ObjectMapper.Map<List<AppContactAddress>>(personDto.ContactAddresses);
                                    foreach (var address in teamAddress)
                                    {
                                        teamContact.AppContactAddresses.Add(new AppContactAddress
                                        {
                                            AddressFk = address.AddressFk,
                                            ContactFk = accountContact,
                                            AddressId = address.AddressId,
                                            AddressCode = address.AddressCode,
                                            ContactCode = accountContact.Code,
                                            ContactId = accountContact.Id,
                                            AddressTypeId = address.AddressTypeId
                                        });
                                    }
                                    //teamContact.EntityFk.EntityAddresses = ObjectMapper.Map<List<AppEntityAddress>>(branchDto.ContactAddresses);
                                    branchContact.ParentFkList.Add(teamContact);
                                    //var contact = await CreateOrEditContact(personDto);

                                }
                                else
                                {
                                    // add to log
                                }
                            }
                            //XXTM
                        }
                    }
                   
                            //XXXB
                    //        var retAccount = await CreateOrEditAccount(createOrEditAccountInfoDto);
                    //try
                    //{
                    //    var objContact = _appContactRepository.GetAll().Where(r => r.Code == createOrEditAccountInfoDto.Code).FirstOrDefault();
                    //    long newId = objContact.Id;
                    //    foreach (AccountExcelDto accountExcelDto in result.Where(r => r.ParentCode == oldCode))
                    //    {
                    //        accountExcelDto.ParentCode = createOrEditAccountInfoDto.Code;
                    //        accountExcelDto.ParentId = newId;
                    //    }
                    //    foreach (var address in createOrEditAccountInfoDto.ContactAddresses)
                    //    {
                    //        try
                    //        {
                    //            var appaddress = _appAddressRepository.GetAll().Where(r => r.Id == address.AddressId).First();
                    //            appaddress.AccountId = objContact.Id;
                    //            await _appAddressRepository.UpdateAsync(appaddress);
                    //            await CurrentUnitOfWork.SaveChangesAsync();
                    //        }
                    //        catch (Exception ex) { }
                    //    }
                    //}
                    //catch (Exception ex) { }

                }

                var con = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                // {
              //  var oldChange = con.ChangeTracker.AutoDetectChangesEnabled;
             //   con.ChangeTracker.AutoDetectChangesEnabled = false;
                    try
                    {
                        if (accountsList.Count > 0)
                            con.AppContacts.AddRange(accountsList);

                        if (accountsListUpdated.Count > 0)
                            con.AppContacts.UpdateRange(accountsListUpdated);

                        await con.SaveChangesAsync();

                    // accountsList.ForEach(s => s.ParentFkList.ForEach(a => a.AccountId = s.Id));
                    // accountsList.ForEach(s => s.ParentFkList.ForEach(a => a.ParentFkList.ForEach(e=>e.AccountId=s.Id)));

                    foreach (var acc in accountsList)
                    {
                        foreach (var br in acc.ParentFkList)
                        {
                            br.AccountId = acc.Id;
                            foreach (var cont in br.ParentFkList)
                            {
                                cont.AccountId = acc.Id;
                            }
                        }

                    }
                    con.AppContacts.UpdateRange(accountsList);
                        await con.SaveChangesAsync();
                        // accountContact

                    }
                    catch (Exception expt)
                    {
                        
                        using (var dbContextTransaction = con.Database.BeginTransaction())
                        {

                            //x.AppContacts.AddRange(accountsList);
                            if (accountsList.Count > 0)
                                con.AppContacts.AddRange(accountsList);

                            if (accountsListUpdated.Count > 0)
                                con.AppContacts.UpdateRange(accountsListUpdated);

                            await con.SaveChangesAsync();
                            foreach (var acc in accountsList)
                            {
                                foreach (var br in acc.ParentFkList)
                                {
                                    br.AccountId = acc.Id;
                                    foreach (var cont in br.ParentFkList)
                                    {
                                        cont.AccountId = acc.Id;
                                    }
                                }

                            }
                            con.AppContacts.UpdateRange(accountsList);
                            await con.SaveChangesAsync();
                            dbContextTransaction.Commit();
                        }
                   //  con.ChangeTracker.AutoDetectChangesEnabled= oldChange;
                    // }
                }
                return accountExcelResultsDTO.ExcelLogDTO; 
                #endregion add accounts

                #region add branchs
                MapperConfiguration configurationBranch;
                configurationBranch = new MapperConfiguration(a => { a.AddProfile(new BranchDtoProfile(phoneTypes, _currencyIds, languageIds, classIds, addresses, addressTypes)); });
                IMapper mapperBranch;
                mapperBranch = configurationBranch.CreateMapper();
                List<AccountExcelDto> resultExcelBranch = accountExcelResultsDTO.ExcelRecords.Where(r => r.Status
                != ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AccountExcelDto>();
                List<AccountExcelDto> resultExcelBranchOnly = resultExcelBranch.Where(r => r.RecordType == "Branch"
                && !string.IsNullOrEmpty(r.ParentCode)
                && r.rowNumber >= accountExcelResultsDTO.From && r.rowNumber <= accountExcelResultsDTO.To
                ).OrderBy(r => r.ParentCode).ToList();

                foreach (AccountExcelDto branchExcelDto in resultExcelBranchOnly)
                {
                    branchExcelDto.ParentId = 0;
                    try
                    {
                        var BranchParent = _appContactRepository.GetAll().Where(r => r.Code == branchExcelDto.ParentCode).FirstOrDefault();
                        branchExcelDto.ParentId = BranchParent.Id;
                        branchExcelDto.AccountId = BranchParent.Id;

                        if (BranchParent.AccountId != null && BranchParent.AccountId > 0)
                        { branchExcelDto.AccountId = BranchParent.AccountId; }

                    }
                    catch (Exception ex) { branchExcelDto.ParentId = 0; }
                }

                List<BranchDto> resultBranchDto = mapperBranch.Map<List<AccountExcelDto>, List<BranchDto>>(resultExcelBranchOnly);
                foreach (BranchDto branchDto in resultBranchDto)
                {
                    if (true)//(branchDto.ParentId > 0)
                    {
                        AppContact account = _appContactRepository.GetAll().Where(r => r.Code == branchDto.Code).FirstOrDefault();
                        string code = branchDto.Code;
                        string oldBranchCode = branchDto.Code;
                        if (account != null && account.Id > 0)
                        {
                            switch (accountExcelResultsDTO.RepreateHandler)
                            {
                                case ExcelRecordRepeateHandler.IgnoreDuplicatedRecords: //ignore
                                    continue;
                                case ExcelRecordRepeateHandler.ReplaceDuplicatedRecords: // replace
                                    branchDto.Id = account.Id;
                                    break;
                                case ExcelRecordRepeateHandler.CreateACopy: // override
                                  //  branchDto.Code = GetAccountCopyCode(code);
                                    break;
                                default:
                                    break;
                            }
                        }
                        //branchDto.AccountId = branchDto.ParentId;
                        foreach (var address in branchDto.ContactAddresses)
                        {
                            address.AccountId = (long)branchDto.AccountId;
                            await AddAddress((long)branchDto.AccountId, address, countries);
                        }
                      
                        var contact = await CreateOrEditBranch(branchDto);

                        try
                        {
                            long newId = _appContactRepository.GetAll().Where(r => r.Code == branchDto.Code).FirstOrDefault().Id;
                            foreach (AccountExcelDto accountExcelDto in result.Where(r => r.ParentCode == oldBranchCode))
                            {
                                accountExcelDto.ParentCode = branchDto.Code;
                                accountExcelDto.ParentId = newId;
                            }

                        }
                        catch (Exception ex) { }

                    }
                    else
                    { // add to log
                    }
                }


                #endregion add branchs

                #region add contacts
                MapperConfiguration configurationContact;
                //stopped as per Ahmed email and approved by Omar
                //configurationContact = new MapperConfiguration(a => { a.AddProfile(new ContactDtoProfile(phoneTypes, currencyIds, languageIds, classIds, addresses, addressTypes, titleIds)); });
                configurationContact = new MapperConfiguration(a => { a.AddProfile(new ContactDtoProfile(phoneTypes, ObjectMapper.Map<List<LookupLabelDto>>(currencyIds), languageIds, classIds, addresses, addressTypes)); });

                IMapper mapperContact;
                mapperContact = configurationContact.CreateMapper();
                List<AccountExcelDto> resultExcelPerson = accountExcelResultsDTO.ExcelRecords.Where(r => r.Status
                != ExcelRecordStatus.Failed.ToString()).Select(r => r.ExcelDto).ToList<AccountExcelDto>();
                List<AccountExcelDto> contactsExcelOnlyResult = resultExcelPerson.Where(r => r.RecordType == "Contact"
                && !string.IsNullOrEmpty(r.ParentCode)
                && r.rowNumber >= accountExcelResultsDTO.From && r.rowNumber <= accountExcelResultsDTO.To
                ).OrderBy(r => r.ParentCode).ToList<AccountExcelDto>();

                foreach (AccountExcelDto personExcelDto in contactsExcelOnlyResult)
                {
                    personExcelDto.ParentId = 0;
                    try
                    {
                        var BranchParent = _appContactRepository.GetAll().Where(r => r.Code == personExcelDto.ParentCode).FirstOrDefault();

                        personExcelDto.ParentId = BranchParent.Id;
                        personExcelDto.AccountId = BranchParent.Id;

                        if (BranchParent.AccountId != null && BranchParent.AccountId > 0)
                        { personExcelDto.AccountId = BranchParent.AccountId; }

                    }
                    catch (Exception ex) { personExcelDto.ParentId = 0; }
                }

                List<ContactDto> resultContact = mapperContact.Map<List<AccountExcelDto>, List<ContactDto>>(contactsExcelOnlyResult);
                foreach (ContactDto personDto in resultContact)
                {
                    if (personDto.ParentId > 0)
                    {
                        //AppContact account = _appContactRepository.GetAll().Where(r => r.Code == personDto.Code && r.ParentId == personDto.ParentId).FirstOrDefault();
                        AppContact account = _appContactRepository.GetAll().Where(r => r.Code == personDto.Code).FirstOrDefault();
                        string code = personDto.Code;
                        string oldPersonCode = personDto.Code;
                        if (account != null && account.Id > 0)
                        {
                            switch (accountExcelResultsDTO.RepreateHandler)
                            {
                                case ExcelRecordRepeateHandler.IgnoreDuplicatedRecords: //ignore
                                    continue;
                                case ExcelRecordRepeateHandler.ReplaceDuplicatedRecords: // replace
                                    personDto.Id = account.Id;
                                    break;
                                case ExcelRecordRepeateHandler.CreateACopy: // override
                                 //   personDto.Code = GetAccountCopyCode(code);
                                    break;
                                default:
                                    break;
                            }

                        }
                        foreach (var address in personDto.ContactAddresses)
                        {
                            address.AccountId = personDto.AccountId;
                            await AddAddress(personDto.AccountId, address, countries);
                        }
                        var contact = await CreateOrEditContact(personDto);
                    }
                    else
                    {
                        // add to log
                    }
                }
                #endregion add contacts
            }
            catch (Exception ex) { }

            #endregion CreateOrEditAccountInfoDto Mapper - Save

            //#region update the excel sheet with errors
            // Create new Spreadsheet
            //Spreadsheet document = new Spreadsheet();
            //document.LoadFromFile(accountExcelResultsDTO.FilePath);

            //// Get worksheet by name
            //Worksheet Sheet = document.Workbook.Worksheets[0];
            //// Set current cell
            //Sheet.Cell("CA1").Value = "Processing Status";
            //Sheet.Cell("CB1").Value = "Processing Error Message";
            //Sheet.Cell("CC1").Value = "Processing Error Details";
            //int rowNumber = 1;
            //foreach (AccountExcelRecordDTO logRecord in accountExcelResultsDTO.AccountExcelRecords)
            //{
            //    rowNumber++;
            //    Sheet.Cell("CA" + rowNumber.ToString()).Value = logRecord.Status;
            //    Sheet.Cell("CB" + rowNumber.ToString()).Value = logRecord.ErrorMessage;
            //    Sheet.Cell("CC" + rowNumber.ToString()).Value = logRecord.FieldsErrors.JoinAsString(",");
            //}
            ////move to attachment folder and save
            //accountExcelResultsDTO.FilePath = accountExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:PathTemp"], _appConfiguration[$"Attachment:Path"]);
            //accountExcelResultsDTO.FilePath = accountExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Attachment:PathTemp"], _appConfiguration[$"Attachment:Path"]);

            //string tempFileName = accountExcelResultsDTO.FilePath;

            //document.SaveAsXLSX(tempFileName.ToUpper().Replace(".XLSX", accountExcelResultsDTO.From.ToString() + ".XLSX"));

            //// Close document
            //document.Close();



            //#endregion update the excel sheet with errors


            //AccountExcelLogDto accountExcelLogDto = new AccountExcelLogDto();

            //accountExcelLogDto.AccountExcelLogPath = accountExcelResultsDTO.FilePath.Replace(_appConfiguration[$"Templates:ExcelTemplateOmitt"], "");
            //accountExcelLogDto.AccountExcelLogFileName = _appConfiguration[$"Templates:AccountExcelLogFileName"];


            //return accountExcelLogDto;
            return accountExcelResultsDTO.ExcelLogDTO;
        }
        //MMT22
        // public async Task<AccountExcelTemplateDto> GetAccountExcelTemplate()
        public async Task<ExcelTemplateDto> GetExcelTemplate(long? TypeId)
        {
            //MMT22
            //AccountExcelTemplateDto accountExcelTemplateDto = new AccountExcelTemplateDto();
            //accountExcelTemplateDto.AccountExcelTemplatePath = "";
            ExcelTemplateDto accountExcelTemplateDto = new ExcelTemplateDto();
            accountExcelTemplateDto.ExcelTemplatePath = "";
            ////MMT22
            try
            {
                #region get lookups

                // get countries
                List<LookupLabelDto> countries = await _appEntitiesAppService.GetAllCountryForTableDropdown();

                // get addresses
                IList<AppAddressDto> addresses = new List<AppAddressDto>();

                // get Product Departments
                PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds = await _sycEntityObjectCategoriesAppService.GetAllDepartmentsWithChildsForProduct();

                // get addresses types
                List<LookupLabelDto> addressTypes = await _appEntitiesAppService.GetAllAddressTypeForTableDropdown();

                //get classifications for contacts
                PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds = await _sycEntityObjectClassificationsAppService.GetAllWithChildsForContact();

                //get phone types
                List<LookupLabelDto> phoneTypes = await _appEntitiesAppService.GetAllPhoneTypeForTableDropdown();

                //get currency types
                List<CurrencyInfoDto> currencyIds = await _appEntitiesAppService.GetAllCurrencyForTableDropdown();

                //get language types            
                List<LookupLabelDto> languageIds = await _appEntitiesAppService.GetAllLanguageForTableDropdown();

                //get attachments category
                List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories = await _sSycAttachmentCategoriesAppService.GetAllSycAttachmentCategoryForTableDropdown();

                //get titles
                List<LookupLabelDto> titleIds = await _appEntitiesAppService.GetAllTitlesForTableDropdown();

                //get account types
                List<LookupLabelDto> accountTypes = await _appEntitiesAppService.GetAllAccountTypesForTableDropdown();
                #endregion get lookups

                string directory = _appConfiguration[$"Templates:ExcelTemplate"];
                if (!System.IO.Directory.Exists(directory))
                { System.IO.Directory.CreateDirectory(directory); }

                #region delete old files
                string[] listFiles = System.IO.Directory.GetFiles(directory);

                foreach (string file in listFiles)
                {

                    try
                    {
                        TimeSpan createdSince = (DateTime.Now - System.IO.File.GetCreationTime(file));
                        if (createdSince.TotalHours >= 1)
                        {
                            System.IO.File.Delete(file);
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }

                #endregion delete old files

                #region get new file name
                string templateFileName = _appConfiguration[$"Templates:AccountExcelTemplate"];
                string newFileName = Path.GetFileNameWithoutExtension(templateFileName) + DateTime.Now.ToString("yyyyMMddhhmmss") + Path.GetExtension(templateFileName);
                #endregion get new file name

                string newFilePath = directory + @"\" + newFileName;
                if (!System.IO.File.Exists(newFilePath))
                {
                    System.IO.File.Copy(System.IO.Directory.GetCurrentDirectory() + _appConfiguration[$"Templates:ExcelTemplatesAssets"], newFilePath);
                }
                //MMT22
                //accountExcelTemplateDto.AccountExcelTemplatePath = directory.Replace(_appConfiguration[$"Templates:ExcelTemplateOmitt"], "").Replace(@"\", "/");
                //accountExcelTemplateDto.AccountExcelTemplateFile = newFileName;
                //accountExcelTemplateDto.AccountExcelTemplateFullPath = accountExcelTemplateDto.AccountExcelTemplatePath + @"/" + accountExcelTemplateDto.AccountExcelTemplateFile;
                //accountExcelTemplateDto.AccountExcelTemplateVersion = _appConfiguration[$"Templates:AccountExcelTemplateVersion"];
                //accountExcelTemplateDto.AccountExcelTemplateDate = _appConfiguration[$"Templates:AccountExcelTemplateDate"];
                accountExcelTemplateDto.ExcelTemplatePath = directory.Replace(_appConfiguration[$"Templates:ExcelTemplateOmitt"], "").Replace(@"\", "/");
                accountExcelTemplateDto.ExcelTemplateFile = newFileName;
                accountExcelTemplateDto.ExcelTemplateFullPath = accountExcelTemplateDto.ExcelTemplatePath + @"/" + accountExcelTemplateDto.ExcelTemplateFile;
                accountExcelTemplateDto.ExcelTemplateVersion = _appConfiguration[$"Templates:AccountExcelTemplateVersion"];
                accountExcelTemplateDto.ExcelTemplateDate = _appConfiguration[$"Templates:AccountExcelTemplateDate"];
                //MMT22
                #region update the excel sheet with errors
                // Create new Spreadsheet
                Spreadsheet document = new Spreadsheet();
                document.LoadFromFile(newFilePath);

                #region fill accounts valid entries
                // Get worksheet by name [Accounts]
                Worksheet Sheet = document.Workbook.Worksheets.ByName("Accounts");
                // Set currecy "A"
                string column = "EA";
                int row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Currency";
                row = 3;
                foreach (var obj in currencyIds)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                }

                // Image Type  
                column = "EB";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Image Type";
                row = 3;
                foreach (var obj in attachmentsCategories)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Phone Type
                column = "EC";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Phone Type";
                row = 3;
                foreach (var obj in phoneTypes)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Language 
                column = "ED";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Language";
                row = 3;
                foreach (var obj in languageIds)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Country 
                column = "EE";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Country";
                row = 3;
                foreach (var obj in countries)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Business Classifications    
                column = "EF";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Business Classifications";
                row = 3;
                foreach (var obj in classIds.Items)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectClassification.Code;
                }
                // Address Type    
                column = "EG";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Address Type";
                row = 3;
                foreach (var obj in addressTypes)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Departments 
                column = "EH";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Departments";
                row = 3;
                foreach (var obj in departmentIds.Items)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectCategory.Code;
                }
                // Title
                column = "EJ";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Position";
                row = 3;
                foreach (var obj in titleIds)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                }

                // accountTypes
                column = "EI";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Account Types";
                row = 3;
                foreach (var obj in accountTypes)
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.Code;
                }

                // Price level
                column = "EK";
                row = 2;
                Sheet.Cell(column + row.ToString()).Value = "Price Level";
                row = 3;

                foreach (var obj in Enum.GetValues<AppContacts.Dtos.PriceLevel>())
                {
                    row++;
                    Sheet.Cell(column + row.ToString()).Value = obj.ToString();
                }

                #endregion fill accounts valid entries


                #region fill valid entries sheet
                // Get worksheet by name [Accounts]
                Worksheet Sheetvalid = document.Workbook.Worksheets.ByName("Valid Entries");
                // Set currecy "A"
                column = "A";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Currency";
                row = 3;
                foreach (var obj in currencyIds)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }

                // Image Type  
                column = "B";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Image Type";
                row = 3;
                foreach (var obj in attachmentsCategories)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Phone Type
                column = "C";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Phone Type";
                row = 3;
                foreach (var obj in phoneTypes)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Language 
                column = "D";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Language";
                row = 3;
                foreach (var obj in languageIds)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Country 
                column = "E";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Country";
                row = 3;
                foreach (var obj in countries)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Business Classifications    
                column = "F";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Business Classifications";
                row = 3;
                foreach (var obj in classIds.Items)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectClassification.Code;
                }
                // Address Type    
                column = "G";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Address Type";
                row = 3;
                foreach (var obj in addressTypes)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }
                // Departments 
                column = "H";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Departments";
                row = 3;
                foreach (var obj in departmentIds.Items)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Data.SycEntityObjectCategory.Code;
                }
                // Title
                column = "J";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Position";
                row = 3;
                foreach (var obj in titleIds)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }

                // accountTypes
                column = "I";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Account Types";
                row = 3;
                foreach (var obj in accountTypes)
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.Code;
                }

                // Price level
                column = "K";
                row = 2;
                Sheetvalid.Cell(column + row.ToString()).Value = "Price Level";
                row = 3;

                foreach (var obj in Enum.GetValues<AppContacts.Dtos.PriceLevel>())
                {
                    row++;
                    Sheetvalid.Cell(column + row.ToString()).Value = obj.ToString();
                }
                #endregion fill accounts valid entries

                // Save and Close document
                document.SaveAsXLSX(newFilePath);
                document.Close();

                #endregion update the excel sheet with errors

            }
            catch (Exception ex)
            {
                string xx = ex.Message;

            }

            return accountExcelTemplateDto;
        }

        public async Task<PagedResultDto<LookupAccountOrTenantDto>> GetTenantsWithManualAccounts(GetTenantsWithManualAccounts input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var tenants = from o in TenantManager.Tenants.Where(x => string.IsNullOrEmpty(input.TenantSearchable) ||
                              (string.IsNullOrEmpty(input.TenantSearchable) == false && (x.Name.ToUpper().Contains(input.TenantSearchable.ToUpper())
                                                                      || x.TenancyName.ToUpper().Contains(input.TenantSearchable.ToUpper()))))
                              join o2 in _appContactRepository.GetAll()
                            .Where(x => x.TenantId != null &&
                            !x.IsProfileData &&
                            x.ParentId == null &&
                            x.PartnerId == null).Select(x => x.TenantId).Distinct() on o.Id equals o2.Value

                              select new LookupAccountOrTenantDto()
                              {
                                  DisplayName = o.TenancyName,
                                  Id = o.Id
                              };

                var pagedAndFilteredAccounts = tenants
                    .OrderBy(input.Sorting ?? "DisplayName asc").PageBy(input).ToListAsync();

                var returnDtoList = await pagedAndFilteredAccounts;
                var tenantsCount = await tenants.CountAsync();
                var returnDto = new PagedResultDto<LookupAccountOrTenantDto>(
                       tenantsCount,
                       returnDtoList
                   );
                return returnDto;
            }
        }

        public async Task<PagedResultDto<LookupAccountOrTenantDto>> GetAccountByType(GetAccountsForDropdownInputDto input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var tenants = _appContactRepository.GetAll()
                            .Where(x => ((input.AccountType == SourceAccountEnum.Manual && x.TenantId == input.TenantId) ||
                            (input.AccountType == SourceAccountEnum.External && x.TenantId == null)) &&
                            !x.IsProfileData &&
                            x.ParentId == null &&
                            x.PartnerId == null &&
                            ((string.IsNullOrEmpty(input.AccountSearchable)) ||
                             (string.IsNullOrEmpty(input.AccountSearchable) == false && x.Name.ToUpper().Contains(input.AccountSearchable.ToUpper())))
                            ).
                              Select(o => new LookupAccountOrTenantDto()
                              {
                                  DisplayName = o.Name,
                                  Id = o.Id
                              });

                var pagedAndFilteredAccounts = tenants
                    .OrderBy(input.Sorting ?? "DisplayName asc").PageBy(input).ToListAsync();

                var returnDtoList = await pagedAndFilteredAccounts;
                var tenantsCount = await tenants.CountAsync();
                var returnDto = new PagedResultDto<LookupAccountOrTenantDto>(
                       tenantsCount,
                       returnDtoList
                   );
                return returnDto;
            }
        }

        public async Task<long> CreateOrUpdateAccountFromSourceAccount(CreateAccountsInputDto input)
        {
            long retId = 0;
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.TargetAccountType == TargetAccountEnum.External)
                { input.TargetTenantId = null; }

                if (input.SourceAccountId > 0 && input.TargetAccountId == 0)
                {
                    var newAccountId = CreateAccountFromSourceAccount(input.SourceAccountId, (int?)input.TargetTenantId, input.TargetAccountType).Result;
                    retId = newAccountId;

                }

                if (input.SourceAccountId > 0 && input.TargetAccountId > 0)
                {
                    var accountId = MergeAccountFromSourceAccount(input.SourceAccountId, input.TargetAccountId, (int?)input.TargetTenantId, input.TargetAccountType).Result;
                    retId = accountId;
                }

                if (input.DeleteSourceAccount)
                { await Delete(new EntityDto<long> { Id = input.SourceAccountId }); }

                // case external account from tenant, so we need to connect
                if (input.TargetAccountType == TargetAccountEnum.External && input.TargetTenantId == null
                    && input.SourceTenantId != null && input.SourceTenantId > 0
                    && AbpSession.TenantId != null && AbpSession.TenantId > 0
                    && AbpSession.TenantId == input.SourceTenantId)
                {
                    if (input.TargetAccountId > 0)
                    {  // be sure not connected before
                        var connectedAccount = _appContactRepository.GetAll().Where(e => e.PartnerId == input.TargetTenantId && e.TenantId != AbpSession.TenantId).FirstOrDefault();
                        if (connectedAccount != null && connectedAccount.Id > 0)
                        { return retId; }
                    }

                    await Connect(retId);
                }

                return retId;
            }
        }
        public async Task<long> MergeAccountFromSourceAccount(long sourceAccountId, long targetId, int? tenantId, TargetAccountEnum targetAccountEnum)
        {
            //
            long ret = targetId;
            var sourceAccount = await GetAccountForEdit(new EntityDto<long>() { Id = sourceAccountId });
            var target = await GetAccountForEdit(new EntityDto<long>() { Id = targetId });

            if (sourceAccount != null && sourceAccount.AccountInfo.Id > 0)
            {
                target.AccountInfo = ObjectMapper.Map<CreateOrEditAccountInfoDto>(sourceAccount.AccountInfo);

                var newTarget = await GetAccountForEdit(new EntityDto<long>() { Id = targetId });

                target.AccountInfo.Id = newTarget.AccountInfo.Id;
                target.AccountInfo.Code = newTarget.AccountInfo.Code;
                //target.AccountInfo.EntityId = newTarget.AccountInfo.EntityId;
                target.AccountInfo.EntityId = 0;
                target.AccountInfo.AttachmentSourceTenantId = sourceAccount.AccountInfo.TenantId;
                target.AccountInfo.TenantId = tenantId;
                target.AccountInfo.UseDTOTenant = true;
                foreach (var item in target.AccountInfo.EntityAttachments)
                { item.guid = item.FileName; }
                if (targetAccountEnum == TargetAccountEnum.External)
                {
                    target.AccountInfo.AccountLevel = AccountLevelEnum.External;
                }
                if (targetAccountEnum == TargetAccountEnum.Manual)
                {
                    target.AccountInfo.AccountLevel = AccountLevelEnum.Manual;
                }
                target.AccountInfo.ReturnId = true;

                newTarget = await CreateOrEditAccount(target.AccountInfo);
                ret = (long)newTarget.AccountInfo.Id;



                //addresses
                _appContactAddressRepository.Delete(e => e.ContactId == targetId);
                await CurrentUnitOfWork.SaveChangesAsync();
                var addresses = _appContactAddressRepository.GetAll().Where(x => x.ContactId == sourceAccountId)
                    .Include(x => x.AddressFk).ToList();
                if (addresses != null && addresses.Count > 0)
                {
                    foreach (var address in addresses)
                    {
                        var addressobject = await GetAddressForEdit(address.AddressFk.Id);

                        var addressExist = await _appAddressRepository.GetAll()
                                       .Where(x => x.AccountId == targetId && x.Code == "N" + addressobject.Code)
                                       .FirstOrDefaultAsync();
                        long addressId = 0;
                        if (addressExist != null && addressExist.Id > 0)
                        {
                            addressId = addressExist.Id;
                        }
                        else
                        {
                            addressobject.Id = 0;
                            addressobject.TenantId = tenantId;
                            addressobject.UseDTOTenant = true;
                            addressobject.AccountId = targetId;
                            addressobject.Code = "N" + addressobject.Code;
                            addressobject = await CreateAddress(addressobject);
                            addressId = addressobject.Id;
                        }
                        _appContactAddressRepository.Insert(new AppContactAddress { ContactId = targetId, AddressId = addressId, AddressTypeId = address.AddressTypeId });
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }


                //persons for target branch
                var partnerObjectId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
                var personsForTargetBranchList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == targetId && x.EntityFk.EntityObjectTypeId != partnerObjectId).ToList();

                //persons for source branch
                var childContactList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == sourceAccountId && x.EntityFk.EntityObjectTypeId != partnerObjectId).ToList();
                if (childContactList != null && childContactList.Count > 0)
                {
                    foreach (var child in childContactList)
                    {

                        var personsExistsList = personsForTargetBranchList.Where(w =>
                                    (w.Name.ToUpper().Trim() == child.Name.ToUpper().Trim()
                                    && w.TradeName.ToUpper().Trim() == child.TradeName.ToUpper().Trim())
                                    || w.Code == "N" + child.Code).ToList();

                        if (child != null && child.Id > 0)
                            if (personsExistsList != null && personsExistsList.Count() > 0)

                            {
                                var existsTargetContact = personsExistsList.First();
                                //var childContact = await GetContactForEdit(child.Id);
                                //var targetContact = await GetContactForEdit(existsTargetContact.Id);
                                //var newTargetContact = await GetContactForEdit(existsTargetContact.Id);
                                var childContact = GetContactForView(child.Id).Result.Contact;
                                var targetContact = GetContactForView(existsTargetContact.Id).Result.Contact;
                                var newTargetContact = GetContactForView(existsTargetContact.Id).Result.Contact;

                                targetContact = ObjectMapper.Map<ContactDto>(childContact);

                                targetContact.Id = newTargetContact.Id;
                                targetContact.Code = newTargetContact.Code;
                                //targetContact.EntityId = newTarget.EntityId;
                                targetContact.TenantId = newTargetContact.TenantId;
                                targetContact.AccountId = newTargetContact.AccountId;
                                targetContact.ParentId = newTargetContact.ParentId;
                                targetContact.AttachmentSourceTenantId = child.TenantId;
                                targetContact.UseDTOTenant = true;

                                await UpdateContact(targetContact);
                            }
                            else
                            {
                                //var childContact = GetContactForEdit(child.Id).Result;
                                var childContact = GetContactForView(child.Id).Result.Contact;
                                childContact.Id = 0;
                                childContact.TenantId = tenantId;
                                childContact.UseDTOTenant = true;
                                childContact.AttachmentSourceTenantId = child.TenantId;
                                childContact.AccountId = targetId;
                                childContact.Code = "N" + childContact.Code;
                                childContact.ParentId = targetId;

                                await CreateContact(childContact);
                            }
                    }
                }



                //Sub branches

                var targetBranchesList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => (x.ParentId == targetId || x.AccountId == targetId) && x.EntityFk.EntityObjectTypeId == partnerObjectId).ToList();

                var childSourceBranchesList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == sourceAccountId && x.EntityFk.EntityObjectTypeId == partnerObjectId).ToList();
                if (childSourceBranchesList != null && childSourceBranchesList.Count > 0)
                {
                    foreach (var child in childSourceBranchesList)
                    { await MergeAppBranchFromSourceAccount(child.Id, targetId, targetId, tenantId, targetBranchesList); }
                }
            }
            return ret;
        }
        public async Task<bool> MergeAppBranchFromSourceAccount(long sourceBranchId, long targetParentId, long targetAccountId, int? targetTenantId, List<AppContact> targetBranchesList)
        {

            Boolean ret = true;
            var partnerObjectId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
            BranchDto sourceBranch = await GetBranchForEdit(sourceBranchId);
            long sourceAccountId = (long)sourceBranch.AccountId;
            var existsList = targetBranchesList.Where(w =>
                (w.Name.ToUpper().Trim() == sourceBranch.Name.ToUpper().Trim()
                || w.TradeName.ToUpper().Trim() == sourceBranch.TradeName.ToUpper().Trim())
                || w.Code == "N" + sourceBranch.Code).ToList();

            if (sourceBranch != null && sourceBranch.Id > 0 && existsList != null && existsList.Count() > 0)
            {
                var targetBranch = existsList.First();
                BranchDto target = await GetBranchForEdit(targetBranch.Id);
                BranchDto newTarget = await GetBranchForEdit(targetBranch.Id);

                target = ObjectMapper.Map<BranchDto>(sourceBranch);

                target.Id = newTarget.Id;
                target.Code = newTarget.Code;
                //target.EntityId = newTarget.EntityId;
                target.AccountId = newTarget.AccountId;
                target.ParentId = newTarget.ParentId;
                target.TenantId = newTarget.TenantId;
                target.AttachmentSourceTenantId = sourceBranch.TenantId;
                target.UseDTOTenant = true;

                var newBranch = await UpdateBranch(target);

                //persons for target branch
                var personsForTargetBranchList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == targetBranch.Id && x.EntityFk.EntityObjectTypeId != partnerObjectId).ToList();

                //persons for source branch
                var childContactList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == sourceBranchId && x.EntityFk.EntityObjectTypeId != partnerObjectId).ToList();
                if (childContactList != null && childContactList.Count > 0)
                {
                    foreach (var child in childContactList)
                    {

                        var personsExistsList = personsForTargetBranchList.Where(w =>
                                    (w.Name.ToUpper().Trim() == child.Name.ToUpper().Trim()
                                    && w.TradeName.ToUpper().Trim() == child.TradeName.ToUpper().Trim())
                                    || w.Code == "N" + child.Code).ToList();

                        if (child != null && child.Id > 0)
                            if (personsExistsList != null && personsExistsList.Count() > 0)

                            {
                                var existsTargetContact = personsExistsList.First();
                                //var childContact = await GetContactForEdit(child.Id);
                                //var targetContact = await GetContactForEdit(existsTargetContact.Id);
                                //var newTargetContact = await GetContactForEdit(existsTargetContact.Id);
                                var childContact = GetContactForView(child.Id).Result.Contact;
                                var targetContact = GetContactForView(existsTargetContact.Id).Result.Contact;
                                var newTargetContact = GetContactForView(existsTargetContact.Id).Result.Contact;

                                targetContact = ObjectMapper.Map<ContactDto>(childContact);

                                targetContact.Id = newTargetContact.Id;
                                targetContact.Code = newTargetContact.Code;
                                //targetContact.EntityId = newTarget.EntityId;
                                targetContact.TenantId = newTargetContact.TenantId;
                                targetContact.AccountId = newTargetContact.AccountId;
                                targetContact.ParentId = newTargetContact.ParentId;
                                targetContact.AttachmentSourceTenantId = child.TenantId;
                                targetContact.UseDTOTenant = true;

                                await UpdateContact(targetContact);
                            }
                            else
                            {
                                //var childContact = GetContactForEdit(child.Id).Result;
                                var childContact = GetContactForView(child.Id).Result.Contact;
                                childContact.Id = 0;
                                childContact.TenantId = newTarget.TenantId;
                                childContact.UseDTOTenant = true;
                                childContact.AttachmentSourceTenantId = child.TenantId;
                                childContact.AccountId = targetAccountId;
                                childContact.Code = "N" + childContact.Code;
                                childContact.ParentId = newBranch.Id;

                                await CreateContact(childContact);
                            }
                    }
                }

                //addresses
                var addresses = _appContactAddressRepository.GetAll().Where(x => x.ContactId == sourceBranchId)
                    .Include(x => x.AddressFk).ToList();
                if (addresses != null && addresses.Count > 0)
                {
                    foreach (var address in addresses)
                    {
                        var addressobject = await GetAddressForEdit(address.AddressFk.Id);

                        var addressExist = await _appAddressRepository.GetAll()
                                       .Where(x => x.AccountId == targetAccountId && x.Code == "N" + addressobject.Code)
                                       .FirstOrDefaultAsync();
                        long addressId = 0;
                        if (addressExist != null && addressExist.Id > 0)
                        {
                            addressId = addressExist.Id;
                        }
                        else
                        {
                            addressobject.Id = 0;
                            addressobject.TenantId = newTarget.TenantId;
                            addressobject.UseDTOTenant = true;
                            addressobject.AccountId = targetAccountId;
                            addressobject.Code = "N" + addressobject.Code;
                            addressobject = await CreateAddress(addressobject);
                            addressId = addressobject.Id;
                        }
                        _appContactAddressRepository.Insert(new AppContactAddress { ContactId = newBranch.Id, AddressId = addressId, AddressTypeId = address.AddressTypeId });
                    }
                }
                //branch children branches
                var childBranchesList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.AccountId == sourceAccountId && x.ParentId == sourceBranchId && x.EntityFk.EntityObjectTypeId == partnerObjectId).ToList();
                if (childBranchesList != null && childBranchesList.Count > 0)
                {
                    foreach (var child in childBranchesList)
                    {// await UpdateAppBranchFromSourceAccount(child.Id, newBranch.Id, tenantId, accountId, accountId);
                        await MergeAppBranchFromSourceAccount(child.Id, newBranch.Id, targetAccountId, targetTenantId, targetBranchesList);
                    }
                }

            }
            else
            {
                // call create new branch
                await CreateAppBranchFromSourceAccount(sourceBranch.Id, targetParentId, targetTenantId, targetAccountId, targetBranchesList, true);

            }
            return ret;
        }

        public async Task<long> CreateAccountFromSourceAccount(long branchId, int? tenantId, TargetAccountEnum targetAccountEnum)
        {
            //
            long ret = 0;
            var branch = await GetAccountForEdit(new EntityDto<long>() { Id = branchId });
            if (branch != null && branch.AccountInfo.Id > 0)
            {
                branch.AccountInfo.Id = 0;
                //
                // check if exists before raise custom message 
                // "This Account <new code>, was created before from manual account"
                var checkCodeExists = _appContactRepository.GetAll()
                    .Where(w => w.Code == "N" + branch.AccountInfo.Code && w.TenantId == tenantId).FirstOrDefault();
                if (checkCodeExists != null && checkCodeExists.Id > 0)
                {
                    // throw new UserFriendlyException("Code '" + "N" + branch.AccountInfo.Code + "' Already Exists.");
                    throw new UserFriendlyException(L("CodeIsAlreadyExists", "N" + branch.AccountInfo.Code));
                }
                branch.AccountInfo.Code = "N" + branch.AccountInfo.Code;
                branch.AccountInfo.AttachmentSourceTenantId = branch.AccountInfo.TenantId;
                branch.AccountInfo.EntityId = 0;
                branch.AccountInfo.TenantId = tenantId;
                branch.AccountInfo.UseDTOTenant = true;


                if (targetAccountEnum == TargetAccountEnum.External)
                {
                    branch.AccountInfo.AccountLevel = AccountLevelEnum.External;
                }

                if (targetAccountEnum == TargetAccountEnum.NewTenant)
                {
                    branch.AccountInfo.AccountLevel = AccountLevelEnum.Profile;
                }

                branch.AccountInfo.ReturnId = true;

                var newTarget = await CreateOrEditAccount(branch.AccountInfo);
                ret = (long)newTarget.AccountInfo.Id;


                //persons
                var personObjectId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
                var childContactList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == branchId && x.EntityFk.EntityObjectTypeId != personObjectId).ToList();
                if (childContactList != null && childContactList.Count > 0)
                {
                    foreach (var child in childContactList)
                    {
                        var childContact = GetContactForView(child.Id).Result.Contact;
                        childContact.Id = 0;
                        childContact.AttachmentSourceTenantId = child.TenantId;
                        childContact.TenantId = tenantId;
                        childContact.UseDTOTenant = true;

                        childContact.AccountId = ret;
                        childContact.Code = "N" + childContact.Code;
                        childContact.ParentId = ret;

                        await CreateContact(childContact);
                    }
                }


                //addresses
                var addresses = _appContactAddressRepository.GetAll().Where(x => x.ContactId == branchId)
                    .Include(x => x.AddressFk).ToList();
                if (addresses != null && addresses.Count > 0)
                {
                    foreach (var address in addresses)
                    {
                        var addressobject = await GetAddressForEdit(address.AddressFk.Id);

                        var addressExist = await _appAddressRepository.GetAll()
                                       .Where(x => x.AccountId == ret && x.Code == "N" + addressobject.Code)
                                       .FirstOrDefaultAsync();
                        long addressId = 0;
                        if (addressExist != null && addressExist.Id > 0)
                        {
                            addressId = addressExist.Id;
                        }
                        else
                        {
                            addressobject.Id = 0;
                            addressobject.TenantId = tenantId;
                            addressobject.UseDTOTenant = true;
                            addressobject.AccountId = ret;
                            addressobject.Code = "N" + addressobject.Code;
                            addressobject = await CreateAddress(addressobject);
                            addressId = addressobject.Id;
                        }
                        _appContactAddressRepository.Insert(new AppContactAddress { ContactId = ret, AddressId = addressId, AddressTypeId = address.AddressTypeId });
                    }
                }

                //Sub branches
                //var personObjectId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
                var childBranchesList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == branchId && x.EntityFk.EntityObjectTypeId == personObjectId).ToList();
                if (childBranchesList != null && childBranchesList.Count > 0)
                {
                    foreach (var child in childBranchesList)
                    { await CreateAppBranchFromSourceAccount(child.Id, (long)newTarget.AccountInfo.Id, tenantId, (long)newTarget.AccountInfo.Id, new List<AppContact>(), false); }
                }

            }

            return ret;
        }

        public async Task<bool> CreateAppBranchFromSourceAccount(long branchId, long parentId, int? tenantId, long accountId, List<AppContact> targetBranchesList, bool merge)
        {
            //
            Boolean ret = true;
            BranchDto branch = await GetBranchForEdit(branchId);
            if (branch != null && branch.Id > 0)
            {
                branch.Id = 0;
                branch.AccountId = accountId;
                branch.Code = "N" + branch.Code;
                branch.TenantId = tenantId;
                branch.UseDTOTenant = true;

                if (parentId != null && parentId > 0)
                { branch.ParentId = parentId; }

                var newBranch = await CreateBranch(branch);

                //persons
                var personObjectId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
                var childContactList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == branchId && x.EntityFk.EntityObjectTypeId != personObjectId).ToList();
                if (childContactList != null && childContactList.Count > 0)
                {
                    foreach (var child in childContactList)
                    {
                        var childContact = GetContactForView(child.Id).Result.Contact;
                        childContact.Id = 0;
                        childContact.AttachmentSourceTenantId = child.TenantId;
                        childContact.TenantId = tenantId;
                        childContact.UseDTOTenant = true;

                        childContact.AccountId = accountId;
                        childContact.Code = "N" + childContact.Code;
                        childContact.ParentId = newBranch.Id;

                        await CreateContact(childContact);
                    }
                }

                //addresses
                var addresses = _appContactAddressRepository.GetAll().Where(x => x.ContactId == branchId)
                    .Include(x => x.AddressFk).ToList();
                if (addresses != null && addresses.Count > 0)
                {
                    foreach (var address in addresses)
                    {
                        var addressobject = await GetAddressForEdit(address.AddressFk.Id);

                        var addressExist = await _appAddressRepository.GetAll()
                                       .Where(x => x.AccountId == accountId && x.Code == "N" + addressobject.Code)
                                       .FirstOrDefaultAsync();
                        long addressId = 0;
                        if (addressExist != null && addressExist.Id > 0)
                        {
                            addressId = addressExist.Id;
                        }
                        else
                        {
                            addressobject.Id = 0;
                            addressobject.TenantId = tenantId;
                            addressobject.UseDTOTenant = true;
                            addressobject.AccountId = accountId;
                            addressobject.Code = "N" + addressobject.Code;
                            addressobject = await CreateAddress(addressobject);
                            addressId = addressobject.Id;
                        }
                        _appContactAddressRepository.Insert(new AppContactAddress { ContactId = newBranch.Id, AddressId = addressId, AddressTypeId = address.AddressTypeId });
                    }
                }


                //Sub branches
                var childBranchesList = _appContactRepository.GetAll().Include(x => x.EntityFk).Where(x => x.ParentId == branchId && x.EntityFk.EntityObjectTypeId == personObjectId).ToList();
                if (childBranchesList != null && childBranchesList.Count > 0)
                {
                    foreach (var child in childBranchesList)
                    {
                        if (!merge)
                        { await CreateAppBranchFromSourceAccount(child.Id, newBranch.Id, tenantId, accountId, targetBranchesList, merge); }
                        else
                        { await MergeAppBranchFromSourceAccount(child.Id, newBranch.Id, accountId, tenantId, targetBranchesList); }
                    }
                }

            }

            return ret;
        }

        public async Task<bool> DeleteAccountForSourceAccount(CreateAccountsInputDto input)
        {
            if (input.DeleteSourceAccount)
            {
                var idList = _appContactRepository.GetAll().Where(x => x.AccountId == input.SourceAccountId || x.Id == input.SourceAccountId)
                    .Select(x => x.Id).ToList();
                var entityIdList = _appContactRepository.GetAll().Where(x => x.AccountId == input.SourceAccountId || x.Id == input.SourceAccountId)
                    .Select(x => x.EntityId).ToList();

                _appContactAddressRepository.Delete(x => idList.Contains(x.ContactId));
                _appEntityRepository.Delete(x => entityIdList.Contains(x.Id));
                _appAddressRepository.Delete(x => x.AccountId == input.SourceAccountId);
                _appContactRepository.Delete(x => x.AccountId == input.SourceAccountId || x.Id == input.SourceAccountId);
            }
            return true;
        }


    }
    public sealed class AccountExcelDtoProfile : Profile
    {
        // This is the approach starting with version 5
        public AccountExcelDtoProfile()
        {
            IMappingExpression<DataRow, AccountExcelDto> mappingExpression;

            mappingExpression = CreateMap<DataRow, AccountExcelDto>()
            .ForMember(dest => dest.RecordType, act => act.MapFrom(src => src["RecordType"].ToString()))
            .ForMember(dest => dest.ParentCode, act => act.MapFrom(src => src["ParentCode"].ToString().TrimEnd()))
            .ForMember(dest => dest.ParentId, act => act.MapFrom(src => 0))
            .ForMember(dest => dest.Code, act => act.MapFrom(src => src["Code"].ToString().TrimEnd()))
            .ForMember(dest => dest.Name, act => act.MapFrom(src => src["Name"].ToString()))
            .ForMember(dest => dest.Language, act => act.MapFrom(src => src["Language"].ToString()))
            .ForMember(dest => dest.EmailAddress, act => act.MapFrom(src => src["EmailAddress"].ToString()))
            .ForMember(dest => dest.Phone1Type, act => act.MapFrom(src => src["Phone1Type"].ToString()))
            .ForMember(dest => dest.Phone1Code, act => act.MapFrom(src => src["Phone1Code"].ToString()))
            .ForMember(dest => dest.Phone1Number, act => act.MapFrom(src => src["Phone1Number"].ToString()))
            .ForMember(dest => dest.Phone1Ext, act => act.MapFrom(src => src["Phone1Ext"].ToString()))
            .ForMember(dest => dest.Phone2Type, act => act.MapFrom(src => src["Phone2Type"].ToString()))
            .ForMember(dest => dest.Phone2Code, act => act.MapFrom(src => src["Phone2Code"].ToString()))
            .ForMember(dest => dest.Phone2Number, act => act.MapFrom(src => src["Phone2Number"].ToString()))
            .ForMember(dest => dest.Phone2Ext, act => act.MapFrom(src => src["Phone2Ext"].ToString()))
            .ForMember(dest => dest.Phone3Type, act => act.MapFrom(src => src["Phone3Type"].ToString()))
            .ForMember(dest => dest.Phone3Code, act => act.MapFrom(src => src["Phone3Code"].ToString()))
            .ForMember(dest => dest.Phone3Number, act => act.MapFrom(src => src["Phone3Number"].ToString()))
            .ForMember(dest => dest.Phone3Ext, act => act.MapFrom(src => src["Phone3Ext"].ToString()))
            .ForMember(dest => dest.FirstName, act => act.MapFrom(src => src["FirstName"].ToString()))
            .ForMember(dest => dest.LastName, act => act.MapFrom(src => src["LastName"].ToString()))
            .ForMember(dest => dest.Title, act => act.MapFrom(src => src["Title"].ToString()))
            .ForMember(dest => dest.TradeName, act => act.MapFrom(src => src["TradeName"].ToString()))
            .ForMember(dest => dest.AccountType, act => act.MapFrom(src => src["AccountType"].ToString()))
            .ForMember(dest => dest.PriceLevel, act => act.MapFrom(src => src["PriceLevel"].ToString()))
            .ForMember(dest => dest.Aboutus, act => act.MapFrom(src => src["Aboutus"].ToString()))
            .ForMember(dest => dest.Currency, act => act.MapFrom(src => src["Currency"].ToString()))
            .ForMember(dest => dest.Website, act => act.MapFrom(src => src["Website"].ToString()))
            .ForMember(dest => dest.BusinessClassification1, act => act.MapFrom(src => src["BusinessClassification1"].ToString()))
            .ForMember(dest => dest.BusinessClassification2, act => act.MapFrom(src => src["BusinessClassification2"].ToString()))
            .ForMember(dest => dest.BusinessClassification3, act => act.MapFrom(src => src["BusinessClassification3"].ToString()))
            .ForMember(dest => dest.Department1, act => act.MapFrom(src => src["Department1"].ToString()))
            .ForMember(dest => dest.Department2, act => act.MapFrom(src => src["Department2"].ToString()))
            .ForMember(dest => dest.Department3, act => act.MapFrom(src => src["Department3"].ToString()))
            .ForMember(dest => dest.Address1Type, act => act.MapFrom(src => src["Address1Type"].ToString()))
            .ForMember(dest => dest.Address1Code, act => act.MapFrom(src => src["Address1Code"].ToString()))
            .ForMember(dest => dest.Address1Name, act => act.MapFrom(src => src["Address1Name"].ToString()))
            .ForMember(dest => dest.Address1Line1, act => act.MapFrom(src => src["Address1Line1"].ToString()))
            .ForMember(dest => dest.Address1Line2, act => act.MapFrom(src => src["Address1Line2"].ToString()))
            .ForMember(dest => dest.Address1City, act => act.MapFrom(src => src["Address1City"].ToString()))
            .ForMember(dest => dest.Address1State, act => act.MapFrom(src => src["Address1State"].ToString()))
            .ForMember(dest => dest.Address1PostalCode, act => act.MapFrom(src => src["Address1PostalCode"].ToString()))
            .ForMember(dest => dest.Address1Country, act => act.MapFrom(src => src["Address1Country"].ToString()))
            .ForMember(dest => dest.Address2Type, act => act.MapFrom(src => src["Address2Type"].ToString()))
            .ForMember(dest => dest.Address2Code, act => act.MapFrom(src => src["Address2Code"].ToString()))
            .ForMember(dest => dest.Address2Name, act => act.MapFrom(src => src["Address2Name"].ToString()))
            .ForMember(dest => dest.Address2Line1, act => act.MapFrom(src => src["Address2Line1"].ToString()))
            .ForMember(dest => dest.Address2Line2, act => act.MapFrom(src => src["Address2Line2"].ToString()))
            .ForMember(dest => dest.Address2City, act => act.MapFrom(src => src["Address2City"].ToString()))
            .ForMember(dest => dest.Address2State, act => act.MapFrom(src => src["Address2State"].ToString()))
            .ForMember(dest => dest.Address2PostalCode, act => act.MapFrom(src => src["Address2PostalCode"].ToString()))
            .ForMember(dest => dest.Address2Country, act => act.MapFrom(src => src["Address2Country"].ToString()))
            .ForMember(dest => dest.Address3Type, act => act.MapFrom(src => src["Address3Type"].ToString()))
            .ForMember(dest => dest.Address3Code, act => act.MapFrom(src => src["Address3Code"].ToString()))
            .ForMember(dest => dest.Address3Name, act => act.MapFrom(src => src["Address3Name"].ToString()))
            .ForMember(dest => dest.Address3Line1, act => act.MapFrom(src => src["Address3Line1"].ToString()))
            .ForMember(dest => dest.Address3Line2, act => act.MapFrom(src => src["Address3Line2"].ToString()))
            .ForMember(dest => dest.Address3City, act => act.MapFrom(src => src["Address3City"].ToString()))
            .ForMember(dest => dest.Address3State, act => act.MapFrom(src => src["Address3State"].ToString()))
            .ForMember(dest => dest.Address3PostalCode, act => act.MapFrom(src => src["Address3PostalCode"].ToString()))
            .ForMember(dest => dest.Address3Country, act => act.MapFrom(src => src["Address3Country"].ToString()))
            .ForMember(dest => dest.Address4Type, act => act.MapFrom(src => src["Address4Type"].ToString()))
            .ForMember(dest => dest.Address4Code, act => act.MapFrom(src => src["Address4Code"].ToString()))
            .ForMember(dest => dest.Address4Name, act => act.MapFrom(src => src["Address4Name"].ToString()))
            .ForMember(dest => dest.Address4Line1, act => act.MapFrom(src => src["Address4Line1"].ToString()))
            .ForMember(dest => dest.Address4Line2, act => act.MapFrom(src => src["Address4Line2"].ToString()))
            .ForMember(dest => dest.Address4City, act => act.MapFrom(src => src["Address4City"].ToString()))
            .ForMember(dest => dest.Address4State, act => act.MapFrom(src => src["Address4State"].ToString()))
            .ForMember(dest => dest.Address4PostalCode, act => act.MapFrom(src => src["Address4PostalCode"].ToString()))
            .ForMember(dest => dest.Address4Country, act => act.MapFrom(src => src["Address4Country"].ToString()))
            .ForMember(dest => dest.Image1Type, act => act.MapFrom(src => src["Image1Type"].ToString()))
            .ForMember(dest => dest.Image1FileName, act => act.MapFrom(src => src["Image1FileName"].ToString()))
            .ForMember(dest => dest.Image2Type, act => act.MapFrom(src => src["Image2Type"].ToString()))
            .ForMember(dest => dest.Image2FileName, act => act.MapFrom(src => src["Image2FileName"].ToString()))
            .ForMember(dest => dest.Image3Type, act => act.MapFrom(src => src["Image3Type"].ToString()))
            .ForMember(dest => dest.Image3FileName, act => act.MapFrom(src => src["Image3FileName"].ToString()))
            .ForMember(dest => dest.Image4Type, act => act.MapFrom(src => src["Image4Type"].ToString()))
            .ForMember(dest => dest.Image4FileName, act => act.MapFrom(src => src["Image4FileName"].ToString()))
            .ForMember(dest => dest.Image5Type, act => act.MapFrom(src => src["Image5Type"].ToString()))
            .ForMember(dest => dest.Image5FileName, act => act.MapFrom(src => src["Image5FileName"].ToString()));

        }
    }

    public sealed class CreateOrEditAccountInfoDtoProfile : Profile
    {
        // This is the approach starting with version 5
        public CreateOrEditAccountInfoDtoProfile(List<LookupLabelDto> phoneTypes,
                                                 List<LookupLabelDto> currencyIds,
                                                 List<LookupLabelDto> languageIds,
            PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds,
            IList<AppAddressDto> addresses,
            List<LookupLabelDto> addressTypes,
            string tenant,
            PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds,
            List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories,
            List<LookupLabelDto> accountTypes)
        {
            IMappingExpression<AccountExcelDto, CreateOrEditAccountInfoDto> mappingExpression;

            mappingExpression = CreateMap<AccountExcelDto, CreateOrEditAccountInfoDto>();

            mappingExpression.ForMember(dest => dest.Name, act => act.MapFrom(src => src.Name));
            mappingExpression.ForMember(dest => dest.TradeName, act => act.MapFrom(src => src.TradeName));
            mappingExpression.ForMember(dest => dest.AccountLevel, act => act.MapFrom(src => (string.IsNullOrEmpty(tenant) ? AccountLevelEnum.External : AccountLevelEnum.Manual)));
            mappingExpression.ForMember(dest => dest.Notes, act => act.MapFrom(src => src.Aboutus));
            mappingExpression.ForMember(dest => dest.PriceLevel, act => act.MapFrom(src => src.PriceLevel));
            mappingExpression.ForMember(dest => dest.AccountType, act => act.MapFrom(src => GetAccountTypeId(src.AccountType, accountTypes, true)));
            mappingExpression.ForMember(dest => dest.Website, act => act.MapFrom(src => src.Website));
            mappingExpression.ForMember(dest => dest.EMailAddress, act => act.MapFrom(src => src.EmailAddress));
            mappingExpression.ForMember(dest => dest.Code, act => act.MapFrom(src => src.Code));
            mappingExpression.ForMember(dest => dest.Phone1TypeId, act => act.MapFrom(src => GetTypeId(src.Phone1Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone1Number, act => act.MapFrom(src => src.Phone1Number));
            mappingExpression.ForMember(dest => dest.Phone1Ex, act => act.MapFrom(src => src.Phone1Ext));
            mappingExpression.ForMember(dest => dest.Phone2TypeId, act => act.MapFrom(src => GetTypeId(src.Phone2Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone2Number, act => act.MapFrom(src => src.Phone2Number));
            mappingExpression.ForMember(dest => dest.Phone2Ex, act => act.MapFrom(src => src.Phone2Ext));
            mappingExpression.ForMember(dest => dest.Phone3TypeId, act => act.MapFrom(src => GetTypeId(src.Phone3Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone3Number, act => act.MapFrom(src => src.Phone3Number));
            mappingExpression.ForMember(dest => dest.Phone3Ex, act => act.MapFrom(src => src.Phone3Ext));
            mappingExpression.ForMember(dest => dest.CurrencyId, act => act.MapFrom(src => GetTypeId(src.Currency, currencyIds, false)));
            mappingExpression.ForMember(dest => dest.LanguageId, act => act.MapFrom(src => GetTypeId(src.Language, languageIds, false)));
            mappingExpression.ForMember(dest => dest.EntityClassifications, act => act.MapFrom(src => GetClass(src, classIds)));
            mappingExpression.ForMember(dest => dest.EntityCategories, act => act.MapFrom(src => GetCategories(src, departmentIds)));
            mappingExpression.ForMember(dest => dest.ContactAddresses, act => act.MapFrom(src => GetAddresses(src, addresses, addressTypes)));
            mappingExpression.ForMember(dest => dest.EntityAttachments, act => act.MapFrom(src => GetAttachments(src, attachmentsCategories)));

        }

        public long GetTypeId(string typeName, List<LookupLabelDto> lookupLabelDtos, bool isDefaulted)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(typeName) == false)
                { value = lookupLabelDtos.Where(r => r.Code.ToUpper() == typeName.ToUpper()).FirstOrDefault<LookupLabelDto>().Value; }
                else
                {
                    if (isDefaulted && lookupLabelDtos.Count > 0)
                    {
                        value = lookupLabelDtos[0].Value;
                    }
                }
            }
            catch (Exception ex) { }

            return value;
        }

        public List<long> GetAccountTypeId(string typeName, List<LookupLabelDto> lookupLabelDtos, bool isDefaulted)
        {
            List<long> value = new List<long>();
            try
            {
                if (string.IsNullOrEmpty(typeName) == false)
                {
                    foreach (string accountType in typeName.Split(';').ToList())
                    {
                        var type = lookupLabelDtos.Where(r => r.Code.ToUpper() == accountType.ToUpper() || r.Label.ToUpper() == accountType.ToUpper()).FirstOrDefault<LookupLabelDto>();
                        if (type != null && type.Value > 0)
                        { value.Add(type.Value); }
                    }
                }
                else
                {
                    if (isDefaulted && lookupLabelDtos.Count > 0)
                    {
                        value.Add(lookupLabelDtos[0].Value);
                    }
                }
            }
            catch (Exception ex) { }

            return value;
        }



        public List<AppEntityClassificationDto> GetClass(AccountExcelDto src, PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classesIds)
        {
            List<AppEntityClassificationDto> EntityClassifications = new List<AppEntityClassificationDto>() { };
            if (!string.IsNullOrEmpty(src.BusinessClassification1))
            {
                List<GetSycEntityObjectClassificationForViewDto> getSycEntityObjectClassificationForViewDtos = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Code == src.BusinessClassification1).ToList();
                if (getSycEntityObjectClassificationForViewDtos.Count > 0)
                {
                    AppEntityClassificationDto appEntityClassificationDto = new AppEntityClassificationDto();
                    appEntityClassificationDto.EntityObjectClassificationCode = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Code;
                    appEntityClassificationDto.EntityObjectClassificationId = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Id;
                    appEntityClassificationDto.EntityObjectClassificationName = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Name;

                    EntityClassifications.Add(appEntityClassificationDto);
                }
            }
            if (!string.IsNullOrEmpty(src.BusinessClassification2))
            {
                List<GetSycEntityObjectClassificationForViewDto> getSycEntityObjectClassificationForViewDtos = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Code == src.BusinessClassification2).ToList();
                if (getSycEntityObjectClassificationForViewDtos.Count > 0)
                {
                    AppEntityClassificationDto appEntityClassificationDto = new AppEntityClassificationDto();
                    appEntityClassificationDto.EntityObjectClassificationCode = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Code;
                    appEntityClassificationDto.EntityObjectClassificationId = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Id;
                    appEntityClassificationDto.EntityObjectClassificationName = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Name;

                    EntityClassifications.Add(appEntityClassificationDto);
                }
            }
            if (!string.IsNullOrEmpty(src.BusinessClassification3))
            {
                List<GetSycEntityObjectClassificationForViewDto> getSycEntityObjectClassificationForViewDtos = classesIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectClassification.Code == src.BusinessClassification3).ToList();
                if (getSycEntityObjectClassificationForViewDtos.Count > 0)
                {
                    AppEntityClassificationDto appEntityClassificationDto = new AppEntityClassificationDto();
                    appEntityClassificationDto.EntityObjectClassificationCode = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Code;
                    appEntityClassificationDto.EntityObjectClassificationId = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Id;
                    appEntityClassificationDto.EntityObjectClassificationName = getSycEntityObjectClassificationForViewDtos[0].SycEntityObjectClassification.Name;

                    EntityClassifications.Add(appEntityClassificationDto);
                }
            }


            return EntityClassifications;





        }

        public List<AppEntityCategoryDto> GetCategories(AccountExcelDto src, PagedResultDto<TreeNode<GetSycEntityObjectCategoryForViewDto>> departmentIds)
        {
            List<AppEntityCategoryDto> EntityCategories = new List<AppEntityCategoryDto>() { };
            if (!string.IsNullOrEmpty(src.Department1))
            {
                List<GetSycEntityObjectCategoryForViewDto> getSycEntityObjectCategoryForViewDto = departmentIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Code == src.Department1).ToList();
                if (getSycEntityObjectCategoryForViewDto.Count > 0)
                {
                    AppEntityCategoryDto appEntityClassificationDto = new AppEntityCategoryDto();
                    appEntityClassificationDto.EntityObjectCategoryCode = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Code;
                    appEntityClassificationDto.EntityObjectCategoryId = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Id;
                    appEntityClassificationDto.EntityObjectCategoryName = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Name;

                    EntityCategories.Add(appEntityClassificationDto);
                }
            }
            if (!string.IsNullOrEmpty(src.Department2))
            {
                List<GetSycEntityObjectCategoryForViewDto> getSycEntityObjectCategoryForViewDto = departmentIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Code == src.Department2).ToList();
                if (getSycEntityObjectCategoryForViewDto.Count > 0)
                {
                    AppEntityCategoryDto appEntityClassificationDto = new AppEntityCategoryDto();
                    appEntityClassificationDto.EntityObjectCategoryCode = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Code;
                    appEntityClassificationDto.EntityObjectCategoryId = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Id;
                    appEntityClassificationDto.EntityObjectCategoryName = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Name;

                    EntityCategories.Add(appEntityClassificationDto);
                }
            }
            if (!string.IsNullOrEmpty(src.Department3))
            {
                List<GetSycEntityObjectCategoryForViewDto> getSycEntityObjectCategoryForViewDto = departmentIds.Items.Select(r => r.Data).Where(r => r.SycEntityObjectCategory.Code == src.Department3).ToList();
                if (getSycEntityObjectCategoryForViewDto.Count > 0)
                {
                    AppEntityCategoryDto appEntityClassificationDto = new AppEntityCategoryDto();
                    appEntityClassificationDto.EntityObjectCategoryCode = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Code;
                    appEntityClassificationDto.EntityObjectCategoryId = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Id;
                    appEntityClassificationDto.EntityObjectCategoryName = getSycEntityObjectCategoryForViewDto[0].SycEntityObjectCategory.Name;

                    EntityCategories.Add(appEntityClassificationDto);
                }
            }

            return EntityCategories;
        }

        public List<AppEntityAttachmentDto> GetAttachments(AccountExcelDto src, List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto> attachmentsCategories)
        {
            List<AppEntityAttachmentDto> appEntityAttachmentDtos = new List<AppEntityAttachmentDto>() { };
            if (!string.IsNullOrEmpty(src.Image1FileName) && !string.IsNullOrEmpty(src.Image1Guid))
            {
                AppEntityAttachmentDto appEntityAttachmentDto = new AppEntityAttachmentDto();
                appEntityAttachmentDto.FileName = src.Image1FileName;
                appEntityAttachmentDto.guid = src.Image1Guid;
                appEntityAttachmentDto.AttachmentCategoryId = 0;
                if (attachmentsCategories.Where(r => r.Code == src.Image1Type).Count() > 0)
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories.Where(r => r.Code == src.Image1Type).FirstOrDefault().Id;
                }
                else
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories[0].Id;
                }
                appEntityAttachmentDtos.Add(appEntityAttachmentDto);
            }

            if (!string.IsNullOrEmpty(src.Image2FileName) && !string.IsNullOrEmpty(src.Image2Guid))
            {
                AppEntityAttachmentDto appEntityAttachmentDto = new AppEntityAttachmentDto();
                appEntityAttachmentDto.FileName = src.Image2FileName;
                appEntityAttachmentDto.guid = src.Image2Guid;
                if (attachmentsCategories.Where(r => r.Code == src.Image2Type).Count() > 0)
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories.Where(r => r.Code == src.Image2Type).FirstOrDefault().Id;
                }
                else
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories[0].Id;
                }
                appEntityAttachmentDtos.Add(appEntityAttachmentDto);
            }

            if (!string.IsNullOrEmpty(src.Image3FileName) && !string.IsNullOrEmpty(src.Image3Guid))
            {
                AppEntityAttachmentDto appEntityAttachmentDto = new AppEntityAttachmentDto();
                appEntityAttachmentDto.FileName = src.Image3FileName;
                appEntityAttachmentDto.guid = src.Image3Guid;
                if (attachmentsCategories.Where(r => r.Code == src.Image3Type).Count() > 0)
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories.Where(r => r.Code == src.Image3Type).FirstOrDefault().Id;
                }
                else
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories[0].Id;
                }
                appEntityAttachmentDtos.Add(appEntityAttachmentDto);
            }

            if (!string.IsNullOrEmpty(src.Image4FileName) && !string.IsNullOrEmpty(src.Image4Guid))
            {
                AppEntityAttachmentDto appEntityAttachmentDto = new AppEntityAttachmentDto();
                appEntityAttachmentDto.FileName = src.Image4FileName;
                appEntityAttachmentDto.guid = src.Image4Guid;
                if (attachmentsCategories.Where(r => r.Code == src.Image4Type).Count() > 0)
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories.Where(r => r.Code == src.Image4Type).FirstOrDefault().Id;
                }
                else
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories[0].Id;
                }
                appEntityAttachmentDtos.Add(appEntityAttachmentDto);
            }

            if (!string.IsNullOrEmpty(src.Image5FileName))
            {
                AppEntityAttachmentDto appEntityAttachmentDto = new AppEntityAttachmentDto();
                appEntityAttachmentDto.FileName = src.Image5FileName;
                appEntityAttachmentDto.guid = src.Image5Guid;
                if (attachmentsCategories.Where(r => r.Code == src.Image5Type).Count() > 0)
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories.Where(r => r.Code == src.Image5Type).FirstOrDefault().Id;
                }
                else
                {
                    appEntityAttachmentDto.AttachmentCategoryId = attachmentsCategories[0].Id;
                }
                appEntityAttachmentDtos.Add(appEntityAttachmentDto);
            }
            return appEntityAttachmentDtos;
        }

        public List<AppContactAddressDto> GetAddresses(AccountExcelDto src, IList<AppAddressDto> addresses, List<LookupLabelDto> addressTypes)
        {

            List<AppContactAddressDto> appContactAddressDtos = new List<AppContactAddressDto>();

            #region check and add address 1
            if (!string.IsNullOrEmpty(src.Address1Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address1Name;
                    appContactAddressDto.AddressLine1 = src.Address1Line1;
                    appContactAddressDto.AddressLine2 = src.Address1Line2;
                    appContactAddressDto.Code = src.Address1Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address1Country;
                    appContactAddressDto.City = src.Address1City;
                    appContactAddressDto.State = src.Address1State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address1PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address1Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 1

            #region check and add address 2
            if (!string.IsNullOrEmpty(src.Address2Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address2Name;
                    appContactAddressDto.AddressLine1 = src.Address2Line1;
                    appContactAddressDto.AddressLine2 = src.Address2Line2;
                    appContactAddressDto.Code = src.Address2Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address2Country;
                    appContactAddressDto.City = src.Address2City;
                    appContactAddressDto.State = src.Address2State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address2PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address2Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 2


            #region check and add address 3
            if (!string.IsNullOrEmpty(src.Address3Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address3Name;
                    appContactAddressDto.AddressLine1 = src.Address3Line1;
                    appContactAddressDto.AddressLine2 = src.Address3Line2;
                    appContactAddressDto.Code = src.Address3Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address3Country;
                    appContactAddressDto.City = src.Address3City;
                    appContactAddressDto.State = src.Address3State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address3PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address3Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 3

            #region check and add address 4
            if (!string.IsNullOrEmpty(src.Address4Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address4Name;
                    appContactAddressDto.AddressLine1 = src.Address4Line1;
                    appContactAddressDto.AddressLine2 = src.Address4Line2;
                    appContactAddressDto.Code = src.Address4Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address4Country;
                    appContactAddressDto.City = src.Address4City;
                    appContactAddressDto.State = src.Address4State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address4PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address4Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 4

            return appContactAddressDtos;

        }
    }

    public sealed class BranchDtoProfile : Profile
    {
        // This is the approach starting with version 5
        public BranchDtoProfile(List<LookupLabelDto> phoneTypes, List<LookupLabelDto> currencyIds, List<LookupLabelDto> languageIds, PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds, IList<AppAddressDto> addresses, List<LookupLabelDto> addressTypes)
        {
            IMappingExpression<AccountExcelDto, BranchDto> mappingExpression;

            mappingExpression = CreateMap<AccountExcelDto, BranchDto>();

            mappingExpression.ForMember(dest => dest.Code, act => act.MapFrom(src => src.Code));
            mappingExpression.ForMember(dest => dest.AccountId, act => act.MapFrom(src => src.AccountId));
            mappingExpression.ForMember(dest => dest.Name, act => act.MapFrom(src => src.Name));
            mappingExpression.ForMember(dest => dest.TradeName, act => act.MapFrom(src => src.TradeName));
            mappingExpression.ForMember(dest => dest.ParentId, act => act.MapFrom(src => src.ParentId));
            mappingExpression.ForMember(dest => dest.Website, act => act.MapFrom(src => src.Website));
            mappingExpression.ForMember(dest => dest.EMailAddress, act => act.MapFrom(src => src.EmailAddress));
            mappingExpression.ForMember(dest => dest.Phone1CountryKey, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone2CountryKey, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone3CountryKey, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone1TypeName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone2TypeName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone3TypeName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.CurrencyName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.LanguageName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone1TypeId, act => act.MapFrom(src => GetTypeId(src.Phone1Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone1Number, act => act.MapFrom(src => src.Phone1Number));
            mappingExpression.ForMember(dest => dest.Phone1Ext, act => act.MapFrom(src => src.Phone1Ext));
            mappingExpression.ForMember(dest => dest.Phone2TypeId, act => act.MapFrom(src => GetTypeId(src.Phone2Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone2Number, act => act.MapFrom(src => src.Phone2Number));
            mappingExpression.ForMember(dest => dest.Phone2Ext, act => act.MapFrom(src => src.Phone2Ext));
            mappingExpression.ForMember(dest => dest.Phone3TypeId, act => act.MapFrom(src => GetTypeId(src.Phone3Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone3Number, act => act.MapFrom(src => src.Phone3Number));
            mappingExpression.ForMember(dest => dest.Phone3Ext, act => act.MapFrom(src => src.Phone3Ext));
            mappingExpression.ForMember(dest => dest.CurrencyId, act => act.MapFrom(src => GetTypeId(src.Currency, currencyIds, false)));
            mappingExpression.ForMember(dest => dest.LanguageId, act => act.MapFrom(src => GetTypeId(src.Language, languageIds, false)));
            //mappingExpression.ForMember(dest => dest.EntityClassifications, act => act.MapFrom(src => GetClass(src.BusinessClassification1, classIds)));
            mappingExpression.ForMember(dest => dest.ContactAddresses, act => act.MapFrom(src => GetAddresses(src, addresses, addressTypes)));

        }

        public long GetTypeId(string typeName, List<LookupLabelDto> lookupLabelDtos, bool isDefaulted)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(typeName) == false)
                { value = lookupLabelDtos.Where(r => r.Code.ToUpper() == typeName.ToUpper()).First<LookupLabelDto>().Value; }
                else
                {
                    if (isDefaulted)
                    {
                        value = lookupLabelDtos[0].Value;
                    }
                }
            }
            catch (Exception ex) { }

            return value;
        }

        public List<AppContactAddressDto> GetAddresses(AccountExcelDto src, IList<AppAddressDto> addresses, List<LookupLabelDto> addressTypes)
        {
            List<AppContactAddressDto> appContactAddressDtos = new List<AppContactAddressDto>();

            #region check and add address 1
            if (!string.IsNullOrEmpty(src.Address1Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address1Name;
                    appContactAddressDto.AddressLine1 = src.Address1Line1;
                    appContactAddressDto.AddressLine2 = src.Address1Line2;
                    appContactAddressDto.Code = src.Address1Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address1Country;
                    appContactAddressDto.City = src.Address1City;
                    appContactAddressDto.State = src.Address1State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address1PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address1Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 1

            #region check and add address 2
            if (!string.IsNullOrEmpty(src.Address2Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address2Name;
                    appContactAddressDto.AddressLine1 = src.Address2Line1;
                    appContactAddressDto.AddressLine2 = src.Address2Line2;
                    appContactAddressDto.Code = src.Address2Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address2Country;
                    appContactAddressDto.City = src.Address2City;
                    appContactAddressDto.State = src.Address2State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address2PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address2Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 2


            #region check and add address 3
            if (!string.IsNullOrEmpty(src.Address3Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address3Name;
                    appContactAddressDto.AddressLine1 = src.Address3Line1;
                    appContactAddressDto.AddressLine2 = src.Address3Line2;
                    appContactAddressDto.Code = src.Address3Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address3Country;
                    appContactAddressDto.City = src.Address3City;
                    appContactAddressDto.State = src.Address3State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address3PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address3Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 3

            #region check and add address 4
            if (!string.IsNullOrEmpty(src.Address4Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address4Name;
                    appContactAddressDto.AddressLine1 = src.Address4Line1;
                    appContactAddressDto.AddressLine2 = src.Address4Line2;
                    appContactAddressDto.Code = src.Address4Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address4Country;
                    appContactAddressDto.City = src.Address4City;
                    appContactAddressDto.State = src.Address4State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address4PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address4Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 4

            return appContactAddressDtos;

        }

    }

    public sealed class ContactDtoProfile : Profile
    {
        // This is the approach starting with version 5
        public ContactDtoProfile(List<LookupLabelDto> phoneTypes, List<LookupLabelDto> currencyIds, List<LookupLabelDto> languageIds, PagedResultDto<TreeNode<GetSycEntityObjectClassificationForViewDto>> classIds, IList<AppAddressDto> addresses, List<LookupLabelDto> addressTypes)
        {
            IMappingExpression<AccountExcelDto, ContactDto> mappingExpression;

            mappingExpression = CreateMap<AccountExcelDto, ContactDto>();

            mappingExpression.ForMember(dest => dest.Code, act => act.MapFrom(src => src.Code));
            mappingExpression.ForMember(dest => dest.Name, act => act.MapFrom(src => src.Name));
            mappingExpression.ForMember(dest => dest.AccountId, act => act.MapFrom(src => src.AccountId));
            mappingExpression.ForMember(dest => dest.TradeName, act => act.MapFrom(src => src.TradeName));
            mappingExpression.ForMember(dest => dest.FirstName, act => act.MapFrom(src => src.FirstName));
            mappingExpression.ForMember(dest => dest.LastName, act => act.MapFrom(src => src.LastName));
            //stopped as per Ahmed email and approved by Omar
            //mappingExpression.ForMember(dest => dest.TitleId, act => act.MapFrom(src => GetTypeId(src.Title, titles, false)));
            mappingExpression.ForMember(dest => dest.JobTitle, act => act.MapFrom(src => src.Title));
            mappingExpression.ForMember(dest => dest.ParentId, act => act.MapFrom(src => src.ParentId));
            mappingExpression.ForMember(dest => dest.Website, act => act.MapFrom(src => src.Website));
            mappingExpression.ForMember(dest => dest.EMailAddress, act => act.MapFrom(src => src.EmailAddress));
            mappingExpression.ForMember(dest => dest.Phone1CountryKey, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone2CountryKey, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone3CountryKey, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone1TypeName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone2TypeName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone3TypeName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.CurrencyName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.LanguageName, act => act.Ignore());
            mappingExpression.ForMember(dest => dest.Phone1TypeId, act => act.MapFrom(src => GetTypeId(src.Phone1Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone1Number, act => act.MapFrom(src => src.Phone1Number));
            mappingExpression.ForMember(dest => dest.Phone1Ext, act => act.MapFrom(src => src.Phone1Ext));
            mappingExpression.ForMember(dest => dest.Phone2TypeId, act => act.MapFrom(src => GetTypeId(src.Phone2Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone2Number, act => act.MapFrom(src => src.Phone2Number));
            mappingExpression.ForMember(dest => dest.Phone2Ext, act => act.MapFrom(src => src.Phone2Ext));
            mappingExpression.ForMember(dest => dest.Phone3TypeId, act => act.MapFrom(src => GetTypeId(src.Phone3Type, phoneTypes, true)));
            mappingExpression.ForMember(dest => dest.Phone3Number, act => act.MapFrom(src => src.Phone3Number));
            mappingExpression.ForMember(dest => dest.Phone3Ext, act => act.MapFrom(src => src.Phone3Ext));
            mappingExpression.ForMember(dest => dest.CurrencyId, act => act.MapFrom(src => GetTypeId(src.Currency, currencyIds, false)));
            mappingExpression.ForMember(dest => dest.LanguageId, act => act.MapFrom(src => GetTypeId(src.Language, languageIds, false)));
            //mappingExpression.ForMember(dest => dest.EntityClassifications, act => act.MapFrom(src => GetClass(src.BusinessClassification1, classIds)));
            mappingExpression.ForMember(dest => dest.ContactAddresses, act => act.MapFrom(src => GetAddresses(src, addresses, addressTypes)));

        }

        public long GetTypeId(string typeName, List<LookupLabelDto> lookupLabelDtos, bool isDefaulted)
        {
            long value = 0;
            try
            {
                if (string.IsNullOrEmpty(typeName) == false)
                { value = lookupLabelDtos.Where(r => r.Code.ToUpper() == typeName.ToUpper()).First<LookupLabelDto>().Value; }
                else
                {
                    if (isDefaulted)
                    {
                        value = lookupLabelDtos[0].Value;
                    }
                }
            }
            catch (Exception ex) { }

            return value;
        }

        public List<AppContactAddressDto> GetAddresses(AccountExcelDto src, IList<AppAddressDto> addresses, List<LookupLabelDto> addressTypes)
        {

            List<AppContactAddressDto> appContactAddressDtos = new List<AppContactAddressDto>();

            #region check and add address 1
            if (!string.IsNullOrEmpty(src.Address1Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address1Name;
                    appContactAddressDto.AddressLine1 = src.Address1Line1;
                    appContactAddressDto.AddressLine2 = src.Address1Line2;
                    appContactAddressDto.Code = src.Address1Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address1Country;
                    appContactAddressDto.City = src.Address1City;
                    appContactAddressDto.State = src.Address1State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address1PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address1Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 1

            #region check and add address 2
            if (!string.IsNullOrEmpty(src.Address2Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address2Name;
                    appContactAddressDto.AddressLine1 = src.Address2Line1;
                    appContactAddressDto.AddressLine2 = src.Address2Line2;
                    appContactAddressDto.Code = src.Address2Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address2Country;
                    appContactAddressDto.City = src.Address2City;
                    appContactAddressDto.State = src.Address2State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address2PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address2Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 2


            #region check and add address 3
            if (!string.IsNullOrEmpty(src.Address3Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address3Name;
                    appContactAddressDto.AddressLine1 = src.Address3Line1;
                    appContactAddressDto.AddressLine2 = src.Address3Line2;
                    appContactAddressDto.Code = src.Address3Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address3Country;
                    appContactAddressDto.City = src.Address3City;
                    appContactAddressDto.State = src.Address3State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address3PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address3Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 3

            #region check and add address 4
            if (!string.IsNullOrEmpty(src.Address4Code))
            {
                AppContactAddressDto appContactAddressDto = new AppContactAddressDto() { };
                {
                    appContactAddressDto.Name = src.Address4Name;
                    appContactAddressDto.AddressLine1 = src.Address4Line1;
                    appContactAddressDto.AddressLine2 = src.Address4Line2;
                    appContactAddressDto.Code = src.Address4Code;
                    appContactAddressDto.CountryId = 0;
                    appContactAddressDto.CountryIdName = src.Address4Country;
                    appContactAddressDto.City = src.Address4City;
                    appContactAddressDto.State = src.Address4State;
                    appContactAddressDto.AddressId = 0;
                    appContactAddressDto.PostalCode = src.Address4PostalCode;
                    var addressType = addressTypes.Where(r => r.Code.ToUpper() == src.Address4Type.ToUpper()).First<LookupLabelDto>();
                    appContactAddressDto.AddressTypeId = addressType.Value;
                    appContactAddressDto.AddressTypeIdName = addressType.Label;
                }
                appContactAddressDtos.Add(appContactAddressDto);
            }
            #endregion check and add address 4

            return appContactAddressDtos;

        }


    }

}