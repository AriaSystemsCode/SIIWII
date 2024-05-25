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


namespace onetouch.MarketplaceAccounts
{
    [AbpAuthorize(AppPermissions.Pages_Accounts)]
    public class MarketplaceAccountsAppService : onetouchAppServiceBase, IMarketplaceAccountsAppService
    {
        private readonly TenantManager _tenantManager;
        private readonly IRepository<AppMarketplaceContact, long> _appContactRepository;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly IRepository<AppMarketplaceAddress, long> _appAddressRepository;
        private readonly IRepository<AppMarketplaceContactAddress, long> _appContactAddressRepository;
        private readonly IEmailSender _emailSender;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IRepository<AppMarketplaceContactPaymentMethod, long> _appContactPaymentMethodRepository;
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

        public MarketplaceAccountsAppService(IRepository<AppMarketplaceContact, long> appContactRepository
            , IRepository<AppEntity, long> appEntityRepository
            , Helper helper, IRepository<AppMarketplaceAddress, long> appAddressRepository
            , IRepository<AppMarketplaceContactAddress, long> appContactAddressRepository
            , IEmailSender emailSender
            , IAppEntitiesAppService appEntitiesAppService
            , IAppConfigurationAccessor appConfigurationAccessor
            , IRepository<AppMarketplaceContactPaymentMethod, long> appContactPaymentMethodRepository
            , ISycEntityObjectClassificationsAppService sycEntityObjectClassificationsAppService
            , ISycEntityObjectCategoriesAppService sycEntityObjectCategoriesAppService
            , ISycAttachmentCategoriesAppService sSycAttachmentCategoriesAppService
            , IRepository<AppEntityExtraData, long> appEntityExtraDataRepository, UserManager userManager, IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> appMarketplaceAccountsPriceLevelsRepo,
              SycIdentifierDefinitionsAppService sycIdentifierDefinitionsAppService, IAppNotifier appNotifier, IBinaryObjectManager binaryObjectManager,
              TenantManager tenantManager)
        {
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
                                x => (x.TenantId == AbpSession.TenantId && !x.IsProfileData && x.ParentId == null && x.PartnerId != null)
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
                            .WhereIf(input.AccountTypes != null && input.AccountTypes.Count(x => x > 0) > 0, x =>
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
                                            AccountType = o.EntityFk.EntityObjectTypeCode,
                                            SSIN = o.SSIN,
                                            PriceLevel = o.PriceLevel,
                                            Name = o.Name,
                                            City = o.AppContactAddresses.FirstOrDefault().AddressFk.City,
                                            State = o.AppContactAddresses.FirstOrDefault().AddressFk.State,
                                            ZipCode = o.AppContactAddresses.FirstOrDefault().AddressFk.PostalCode,
                                            AddressLine1 = o.AppContactAddresses.FirstOrDefault().AddressFk.AddressLine1,
                                            CountryName = o.AppContactAddresses.FirstOrDefault().AddressFk.CountryFk.Name,
                                            Status = input.FilterType != 1 ? (_appContactRepository.GetAll().Count(x => x.TenantId == null && x.Id == o.PartnerId) > 0 || (o.TenantId != null && o.ParentId == null && o.PartnerId == null)) :
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

}