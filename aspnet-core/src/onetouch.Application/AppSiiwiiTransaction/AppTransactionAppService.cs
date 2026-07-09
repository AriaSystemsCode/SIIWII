using AuthorizeNet.Api.Contracts.V1;
using onetouch.AppSiiwiiTransaction.Dtos;
using onetouch.AppTransactions.Dtos;
using onetouch.Authorization;
using Abp.Authorization;
using System.Linq;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Abp.Domain.Uow;
using onetouch.SystemObjects;
using onetouch.SycCounters;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.AppContacts;
//using System.Collections.Generic;
//using Abp.Collections.Extensions;
using Abp.Application.Services.Dto;
using onetouch.Accounts.Dtos;
using System.Linq.Dynamic.Core;
using System.Collections.Generic;
using Abp.Linq.Extensions;
using onetouch.Helpers;
using onetouch.Sessions.Dto;
using Stripe;
using System;
using onetouch.AppEntities.Dtos;
using Abp.Collections.Extensions;
using NPOI.SS.Formula.Functions;
using Abp.Domain.Entities;
using onetouch.AppMarketplaceItems.Dtos;
using onetouch.Configuration;
using Microsoft.Extensions.Configuration;
using NPOI.POIFS.Properties;
using onetouch.AccountInfos.Dtos;
using onetouch.AppContacts.Dtos;
using onetouch.Common;
using Microsoft.AspNetCore.Mvc;
using onetouch.Migrations;
using onetouch.AppItems;
using onetouch.AppEntities;
using onetouch.EmailingTemplates;
using onetouch.AppMarketplaceItems;
using Abp.EntityFrameworkCore.Repositories;
using Microsoft.EntityFrameworkCore.Infrastructure.Internal;
using onetouch.EntityFrameworkCore;
using Abp.EntityFrameworkCore.Uow;
using System.Linq.Expressions;
using onetouch.Message.Dto;
using onetouch.Message;
using Abp.Authorization.Users;
using onetouch.AppItems.Dtos;
using onetouch.AppMarketplaceTransactions;
using AutoMapper.Internal.Mappers;
using Abp.EntityFrameworkCore.Extensions;
using MathNet.Numerics.LinearAlgebra;
using Twilio.Rest.Trunking.V1;
using System.Net.Mail;
using Abp.Net.Mail;
using onetouch.EntityFrameworkCore.Repositories;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using onetouch.Authorization.Accounts;
using onetouch.Accounts;
using onetouch.SycIdentifierDefinitions;
using PayPalCheckoutSdk.Orders;
using Castle.MicroKernel.Registration;
using onetouch.AppItemsLists;
using System.Diagnostics;
using Abp.AspNetZeroCore.Timing;
using System.Drawing.Imaging;
using Abp.AutoMapper;
using Namotion.Reflection;
using onetouch.Globals;
using MimeKit;
using onetouch.AppSubScriptionPlan;
using onetouch.SystemObjects.Dtos;
using onetouch.AppMarketplaceContacts;
using AuthorizeNet.APICore;
using MimeKit;
using DocumentFormat.OpenXml.Office2021.Drawing.SketchyShapes;
using DocumentFormat.OpenXml.Vml.Office;
using DocumentFormat.OpenXml.Drawing.Diagrams;
using Abp.Runtime.Session;
using DocumentFormat.OpenXml.ExtendedProperties;
using onetouch.Authorization.Roles;
using DocumentFormat.OpenXml.InkML;
using Abp.MultiTenancy;
using System.Globalization;
using onetouch.AppMarketplaceAccounts;


//using NUglify.Helpers;
//using NUglify.Helpers;
//using Abp.Collections.Extensions;

namespace onetouch.AppSiiwiiTransaction
{
    public class AppTransactionAppService : onetouchAppServiceBase, IAppTransactionAppService
    {
        private readonly Helper _helper;
        private readonly IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> _appMarketplaceAccountsPriceLevelsRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<AppAddress, long> _appAddressRepository;
        private readonly IRepository<SycSegmentIdentifierDefinition, long> _sycSegmentIdentifierDefinition;
        private readonly IRepository<SycCounter, long> _sycCounter;
        private readonly IRepository<SydObject, long> _sydObjectRepository;
        private readonly IRepository<AppTransactionHeaders, long> _appTransactionsHeaderRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectType;
        private readonly IRepository<AppActiveTransaction, long> _appShoppingCartRepository;
        private readonly IRepository<AppMarketplaceItems.AppMarketplaceItems, long> _appMarketplaceItem;
        private readonly IRepository<AppItem, long> _appItems;
        private readonly IRepository<AppEntity, long> _appEntity;
        private readonly IRepository<AppEntityClassification, long> _appEntityClassificationRepository;
        private readonly IRepository<AppEntityCategory, long> _appEntityCategoryRepository;
        private readonly IRepository<AppTransactionDetails, long> _appTransactionDetails;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IRepository<AppMarketplaceItemSizeScaleHeaders, long> _appMarketplaceItemSizeScaleHeadersRepository;
        private readonly IRepository<onetouch.AppItems.AppItemSizeScalesHeader, long> _appItemSizeScaleHeadersRepository;
        private readonly IRepository<AppMarketplaceItemPrices, long> _appMarketplaceItemPricesRepository;
        private readonly IRepository<AppTransactionContacts, long> _appTransactionContactsRepository;
        private readonly IRepository<AppMessage, long> _MessagesRepository;
        //MMT37[Start]
        private readonly IRepository<AppMarketplaceTransactions.AppMarketplaceTransactionHeaders, long> _appMarketplaceTransactionHeadersRepository;
        private readonly IRepository<AppMarketplaceTransactions.AppMarketplaceTransactionDetails, long> _appMarketplaceTransctionDetailsRepository;
        private readonly IRepository<AppMarketplaceTransactions.AppMarketplaceTransactionContacts, long> _appMarketplaceTransctionContactsRepository;
        private readonly IRepository<AppEntitySharings, long> _appEntitySharingsRepository;
        private readonly IMessageAppService _messageAppService;
        private readonly IRepository<AppEntityAttachment, long> _appEntityAttachment;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraData;
        
        private readonly IEmailSender _emailSender;
        private readonly IAppItemsAppService _appItemsAppService;
        private readonly ISycEntityObjectTypesAppService _SycEntityObjectTypesAppService;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategory;
        private readonly IRepository<SycEntityObjectClassification, long> _sycEntityObjectClassificationRepository;
        private readonly IAccountsAppService _accountAppService;
        private readonly ISycIdentifierDefinitionsAppService _sycIdentifierDefinitionsAppService;
        //MMT37[End]
        //MMT45
        private readonly IRepository<AppContactAddress, long> _appContactAddressRepository;
        private readonly IRepository<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates, long> _sycCurrencyExchangeRateRepository;
        private readonly TimeZoneInfoAppService _timeZoneInfoAppService;
        //MMT45
        //E-SII-20250428.0080,1 MMT 04/29/2025 add Entity log table to SIIWII[Start]
        private readonly IRepository<AppEntityLog, long> _appEntityLogRepository;
        //E-SII-20250428.0080,1 MMT 04/29/2025 add Entity log table to SIIWII[End]
        //I46[Start]
        private readonly IAppTenantActivitiesLogAppService _appTenantActivitiesLogAppService;
        private readonly IRepository<AppMarketplaceContact, long> _appMarketplaceContactRepository;
        //I46[End]
        //I40[Start]
        private readonly IRepository<AppContactRelationshipInfo, long> _appContactRelationshipInfoRepository;
        //I40[End]
        private readonly ICreateMarketplaceAccount _iCreateMarketplaceAccount;
        public AppTransactionAppService(IRepository<AppTransactionHeaders, long> appTransactionsHeaderRepository,
            IRepository<SydObject, long> sydObjectRepository, IRepository<SycEntityObjectType, long> sycEntityObjectType,
            IRepository<SycCounter, long> sycCounter, IRepository<AppContact, long> appContactRepository, IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> appMarketplaceAccountsPriceLevelsRepository,
            IRepository<SycSegmentIdentifierDefinition, long> sycSegmentIdentifierDefinition, Helper helper,
            IRepository<AppActiveTransaction, long> appShoppingCartRepository,
            IRepository<AppMarketplaceItems.AppMarketplaceItems, long> appMarketplaceItem,
            IAppConfigurationAccessor appConfigurationAccessor,
            IRepository<AppTransactionDetails, long> appTransactionDetails, IRepository<AppItem, long> appItems, IRepository<AppItemPrices, long> appItemPricesRepository,
            IRepository<AppEntity, long> appEntity, IRepository<AppMarketplaceItemPrices, long> appMarketplaceItemPricesRepository,
            IRepository<AppMarketplaceItemSizeScaleHeaders, long> appMarketplaceItemSizeScaleHeadersRepository,
             IRepository<onetouch.AppItems.AppItemSizeScalesHeader, long> appItemSizeScaleHeadersRepository,
             IRepository<AppTransactionContacts, long> appTransactionContactsRepository,
             IRepository<AppEntityClassification, long> appEntityClassificationRepository, IRepository<AppEntityCategory, long> appEntityCategoryRepository,
             IRepository<AppAddress, long> appAddressRepository, IRepository<AppMessage, long> messagesRepository,
             IRepository<AppMarketplaceTransactions.AppMarketplaceTransactionHeaders, long> appMarketplaceTransactionHeadersRepository,
             IRepository<AppMarketplaceTransactions.AppMarketplaceTransactionDetails, long> appMarketplaceTransctionDetailsRepository,
             IRepository<AppMarketplaceTransactions.AppMarketplaceTransactionContacts, long> appMarketplaceTransctionContactsRepository,
             IRepository<AppEntitySharings, long> appEntitySharingsRepository, IMessageAppService messageAppService, IRepository<AppEntityAttachment, long> appEntityAttachment,
             IRepository<AppEntityExtraData, long> appEntityExtraData, IEmailSender emailSender, IAppEntitiesAppService appEntitiesAppService,
             IRepository<SycEntityObjectCategory, long> sycEntityObjectCategory, IRepository<SycEntityObjectClassification, long> sycEntityObjectClassificationRepository, IAccountsAppService accountAppService,
             IAppItemsAppService appItemsAppService, ISycEntityObjectTypesAppService sycEntityObjectTypesAppService, ISycIdentifierDefinitionsAppService sycIdentifierDefinitionsAppService,
             IRepository<AppContactAddress, long> appContactAddressRepository, IRepository<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates, long> sycCurrencyExchangeRateRepository,
             TimeZoneInfoAppService timeZoneInfoAppService, IAppTenantActivitiesLogAppService appTenantActivitiesLogAppService,
             IRepository<AppEntityLog, long> appEntityLogRepository, IRepository<AppMarketplaceContact, long> appMarketplaceContactRepository,
             IRepository<AppContactRelationshipInfo, long> appContactRelationshipInfoRepository,
             ICreateMarketplaceAccount iCreateMarketplaceAccount
             )
        {
            _iCreateMarketplaceAccount = iCreateMarketplaceAccount;
            _sycIdentifierDefinitionsAppService = sycIdentifierDefinitionsAppService;
            _accountAppService = accountAppService;
            _sycEntityObjectClassificationRepository = sycEntityObjectClassificationRepository;
            _sycEntityObjectCategory = sycEntityObjectCategory;
            _appEntitiesAppService = appEntitiesAppService;
            _SycEntityObjectTypesAppService = sycEntityObjectTypesAppService;
            _MessagesRepository = messagesRepository;
            _appAddressRepository = appAddressRepository;
            _appEntityClassificationRepository = appEntityClassificationRepository;
            _appEntityCategoryRepository = appEntityCategoryRepository;
            _appTransactionContactsRepository = appTransactionContactsRepository;
            _appItemSizeScaleHeadersRepository = appItemSizeScaleHeadersRepository;
            _appMarketplaceItemSizeScaleHeadersRepository = appMarketplaceItemSizeScaleHeadersRepository;
            _appMarketplaceItemPricesRepository = appMarketplaceItemPricesRepository;
            //_appItemPricesRepository = appItemPricesRepository;
            _appEntity = appEntity;
            _appItems = appItems;
            _appContactRepository = appContactRepository;
            _appMarketplaceItem = appMarketplaceItem;
            _appTransactionsHeaderRepository = appTransactionsHeaderRepository;
            _sydObjectRepository = sydObjectRepository;
            _sycEntityObjectType = sycEntityObjectType;
            _sycSegmentIdentifierDefinition = sycSegmentIdentifierDefinition;
            _sycCounter = sycCounter;
            _helper = helper;
            _appMarketplaceAccountsPriceLevelsRepository = appMarketplaceAccountsPriceLevelsRepository;
            _appShoppingCartRepository = appShoppingCartRepository;
            _appTransactionDetails = appTransactionDetails;
            _appConfiguration = appConfigurationAccessor.Configuration;
            //MMT37[Start]
            _appMarketplaceTransactionHeadersRepository = appMarketplaceTransactionHeadersRepository;
            _appMarketplaceTransctionDetailsRepository = appMarketplaceTransctionDetailsRepository;
            _appMarketplaceTransctionContactsRepository = appMarketplaceTransctionContactsRepository;
            _appEntitySharingsRepository = appEntitySharingsRepository;
            _messageAppService = messageAppService;
            _appEntityAttachment = appEntityAttachment;
            _appEntityExtraData = appEntityExtraData;
            _emailSender = emailSender;
            _appItemsAppService = appItemsAppService;
            //MMT37[End]
            _appContactAddressRepository = appContactAddressRepository;
            _sycCurrencyExchangeRateRepository = sycCurrencyExchangeRateRepository;
            _timeZoneInfoAppService = timeZoneInfoAppService;
            //E-SII-20250428.0080,1 MMT 04/29/2025 add Entity log table to SIIWII[Start]
            _appEntityLogRepository = appEntityLogRepository;
            //E-SII-20250428.0080,1 MMT 04/29/2025 add Entity log table to SIIWII[End]
            //I46[Start]
            _appTenantActivitiesLogAppService = appTenantActivitiesLogAppService;
            _appMarketplaceContactRepository = appMarketplaceContactRepository;
            //I46{End}
            //E-SII-20250428.0080,1 MMT 04/29/2025 add Entity log table to SIIWII[Start]
            _appEntityLogRepository = appEntityLogRepository;
            //E-SII-20250428.0080,1 MMT 04/29/2025 add Entity log table to SIIWII[End]
            //I46{End}
            //I40[Start]
            _appContactRelationshipInfoRepository = appContactRelationshipInfoRepository;
            //I40[End]
           
        }
        //public async Task<long> CreateOrEditSalesOrder(CreateOrEditAppTransactionsDto input)
        //{
        //    input.Name = "Sales Order#" + input.Code.TrimEnd();
        //    input.TenantId = AbpSession.TenantId;
        //    input.ObjectId = await _helper.SystemTables.GetObjectTransactionId();
        //    input.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
        //    input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
        //    var currencyObject =await TenantManager.GetTenantCurrency();
        //    if (currencyObject != null)
        //    {
        //        input.CurrencyId = currencyObject.Value;
        //        input.CurrencyCode = currencyObject.Code;
        //    }
        //    var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == true &
        //        a.ParentId == null);
        //    if (account != null)
        //    {
        //        input.LanguageId = account.LanguageId;
        //        input.LanguageCode = account.LanguageCode;
        //        input.PriceLevel = account.PriceLevel;
        //    }

        //    return await CreateOrEdit(input);

        //}

        //public async Task<long> CreateOrEditPurchaseOrder(CreateOrEditAppTransactionsDto input)
        //{
        //    input.TenantId = AbpSession.TenantId;
        //    input.Name = "Purchase Order#"+input.Code.TrimEnd();
        //    input.ObjectId = await _helper.SystemTables.GetObjectTransactionId();
        //    input.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
        //    input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
        //    var currencyObject = await TenantManager.GetTenantCurrency();
        //    if (currencyObject != null)
        //    {
        //        input.CurrencyId = currencyObject.Value;
        //        input.CurrencyCode = currencyObject.Code;
        //    }
        //    var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == true &
        //        a.ParentId == null);
        //    if (account != null)
        //    {
        //        input.LanguageId = account.LanguageId;
        //        input.LanguageCode = account.LanguageCode;
        //        input.PriceLevel = account.PriceLevel;
        //    }

        //    return await CreateOrEdit(input);

        //}
        public async Task<long> CreateOrEditTransaction(GetAppTransactionsForViewDto input)
        {
            var createOrEditDto = ObjectMapper.Map<CreateOrEditAppTransactionsDto>(input);
            createOrEditDto.EnteredDate = input.EnteredDate;
            if (createOrEditDto != null)
            {
                return await CreateOrEdit(createOrEditDto);
            }
            return 0;
        }

        public async Task<string> GetTransactionOrderConfirmationUrl(long transactionId)
        {
            var transOrg = await _appTransactionsHeaderRepository.GetAll()
                    .Include(a => a.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                .Where(a => a.Id == transactionId).FirstOrDefaultAsync();
            if (transOrg != null)
            {
                if (transOrg.EntityAttachments != null && transOrg.EntityAttachments.Count > 0)
                {
                    string filePath = _appConfiguration[$"Attachment:Path"] + @"\" + (transOrg.TenantId == null ? "-1" : transOrg.TenantId.ToString()) + @"\" + transOrg.EntityAttachments[0].AttachmentFk.Attachment;
                    if (System.IO.File.Exists(filePath))
                    {
                        filePath = _appConfiguration["App:ServerRootAddress"] + _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"].ToString(), "") + @"\" + (transOrg.TenantId == null ? "-1" : transOrg.TenantId.ToString()) + @"\" + transOrg.EntityAttachments[0].AttachmentFk.Attachment;
                        return filePath;
                        //   viewTrans.EntityAttachments[0].Url = @"attachments/" + (viewTrans.TenantId == null ? -1 : viewTrans.TenantId) + @"/" + viewTrans.EntityAttachments[0].FileName;
                    }
                }
            }
            return "";
        }
        public async Task<long> CreateOrEdit(CreateOrEditAppTransactionsDto input)
        {
            long? buyerTenantId = null;
            if (!string.IsNullOrEmpty(input.BuyerCompanySSIN))
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var buyerAccountProfile = await _appMarketplaceContactRepository.GetAll().Where(z => z.TenantId == null && z.IsProfileData == true && z.SSIN == input.BuyerCompanySSIN).FirstOrDefaultAsync();
                    if (buyerAccountProfile != null)
                        buyerTenantId = buyerAccountProfile.TenantOwner;
                }
            }
            if (input.lFromPlaceOrder)
            {
                //I45
                if (input.TransactionType == TransactionType.SalesOrder)
                {
                    var buyerContact = input.AppTransactionContacts.FirstOrDefault(z => z.ContactRole == ContactRoleEnum.Buyer);
                    if (buyerContact != null && string.IsNullOrEmpty(buyerContact.CompanySSIN) && input.CreateManualAccount)
                    {
                        CreateOrEditAccountInfoDto accountInput = new CreateOrEditAccountInfoDto();
                        accountInput.PriceLevel = input.PriceLevel;
                        accountInput.CurrencyId = input.CurrencyId;
                        accountInput.LanguageId = input.LanguageId;
                        accountInput.Name = buyerContact.CompanyName;
                        accountInput.Phone1TypeId = buyerContact.ContactPhoneTypeId;
                        accountInput.Phone1Number = buyerContact.ContactPhoneNumber;
                        accountInput.TenantId = AbpSession.TenantId;
                        accountInput.ReturnId = true;
                        if (string.IsNullOrEmpty(buyerContact.CompanyCode))
                        {
                            var tenantObj = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                            if (tenantObj != null)
                            {
                                string sequance = await _sycIdentifierDefinitionsAppService.GetNextEntityCode("BUSINESS");
                                accountInput.Code = "M" + sequance; //tenantObj.TenancyName.Trim() +
                            }
                        }
                        else
                        {
                            accountInput.Code = buyerContact.CompanyCode;
                        }
                        accountInput.AccountLevel = AccountLevelEnum.Manual;
                        var businessType = await _helper.SystemTables.GetEntityObjectTypeParetner();
                        if (businessType != null)
                        {
                            accountInput.AccountTypeId = businessType.Id;
                            accountInput.AccountType = businessType.Code;
                        }
                        // var accountSSIN = await CreateManualAccount(accountInput);
                        var account = await _accountAppService.CreateOrEditAccount(accountInput);
                        if (account != null && account.AccountInfo != null && account.AccountInfo.Id != 0)
                        {
                            input.BuyerCompanySSIN = account.AccountInfo.SSIN;
                            buyerContact.CompanySSIN = account.AccountInfo.SSIN;
                            buyerContact.BranchSSIN = account.AccountInfo.SSIN;
                            // Add Address 
                            var ShpToContact = input.AppTransactionContacts.FirstOrDefault(z => z.ContactRole == ContactRoleEnum.ShipToContact);
                            if (ShpToContact != null)
                            {
                                ShpToContact.CompanySSIN = account.AccountInfo.SSIN;
                                ShpToContact.BranchSSIN = account.AccountInfo.SSIN;
                            }
                            if (ShpToContact != null && !string.IsNullOrEmpty(ShpToContact.ContactAddressCode) && !string.IsNullOrEmpty(ShpToContact.ContactAddressLine1))
                            {
                                var existimngAdd = await _appAddressRepository.GetAll().Where(z => z.Code == ShpToContact.ContactAddressCode && z.AccountId == account.AccountInfo.Id
                                && z.TenantId == AbpSession.TenantId)
                                    .FirstOrDefaultAsync();
                                AppAddressDto addReturn = new AppAddressDto();
                                if (existimngAdd == null)
                                {
                                    AppAddressDto address = new AppAddressDto();
                                    address.AddressLine1 = ShpToContact.ContactAddressLine1;
                                    address.AddressLine2 = ShpToContact.ContactAddressLine2;
                                    address.AccountId = long.Parse(account.AccountInfo.Id.ToString());
                                    address.Code = ShpToContact.ContactAddressCode;
                                    address.City = ShpToContact.ContactAddressCity;
                                    address.CountryCode = ShpToContact.ContactAddressCountryCode;
                                    address.CountryId = ShpToContact.ContactAddressCountryId;
                                    address.State = ShpToContact.ContactAddressState;
                                    address.PostalCode = ShpToContact.ContactAddressPostalCode;
                                    address.Name = ShpToContact.ContactAddressName;
                                    address.TenantId = AbpSession.TenantId;
                                    addReturn = await _accountAppService.CreateOrEditAddress(address);
                                }
                                else
                                {
                                    addReturn = ObjectMapper.Map<AppAddressDto>(existimngAdd);
                                }
                                if (addReturn != null && addReturn.Id != 0)
                                {
                                    AppContactAddress contactAdd = new AppContactAddress();
                                    contactAdd.AddressId = addReturn.Id;
                                    contactAdd.AddressCode = addReturn.Code;
                                    contactAdd.ContactCode = account.AccountInfo.Code;
                                    contactAdd.ContactId = long.Parse(account.AccountInfo.Id.ToString());
                                    contactAdd.AddressTypeCode = "DIRECT-SHIPPING";
                                    var addressType = await _appEntity.GetAll().Where(z => z.Code == "DIRECT-SHIPPING").FirstOrDefaultAsync();
                                    if (addressType != null)
                                    {
                                        contactAdd.AddressTypeId = addressType.Id;

                                    }

                                    var contactAddShip = await _appContactAddressRepository.InsertAsync(contactAdd);
                                    ShpToContact.ContactAddressId = contactAddShip.AddressId;
                                    ShpToContact.ContactSSIN = contactAddShip.ContactFk.SSIN;
                                    await CurrentUnitOfWork.SaveChangesAsync();
                                }

                            }
                            //Bill
                            var billToContact = input.AppTransactionContacts.FirstOrDefault(z => z.ContactRole == ContactRoleEnum.APContact);

                            if (billToContact != null)
                            {
                                billToContact.CompanySSIN = account.AccountInfo.SSIN;
                                billToContact.BranchSSIN = account.AccountInfo.SSIN;
                            }
                            if (billToContact != null && !string.IsNullOrEmpty(billToContact.ContactAddressCode) && !string.IsNullOrEmpty(billToContact.ContactAddressLine1))
                            {
                                var existimngAdd = await _appAddressRepository.GetAll().Where(z => z.Code == billToContact.ContactAddressCode && z.AccountId == account.AccountInfo.Id
                                && z.TenantId == AbpSession.TenantId).FirstOrDefaultAsync();
                                AppAddressDto addReturn = new AppAddressDto();
                                if (existimngAdd == null)
                                {
                                    AppAddressDto address = new AppAddressDto();
                                    address.AddressLine1 = billToContact.ContactAddressLine1;
                                    address.AddressLine2 = billToContact.ContactAddressLine2;
                                    address.AccountId = long.Parse(account.AccountInfo.Id.ToString());
                                    address.Code = billToContact.ContactAddressCode;
                                    address.City = billToContact.ContactAddressCity;
                                    address.CountryCode = billToContact.ContactAddressCountryCode;
                                    address.CountryId = billToContact.ContactAddressCountryId;
                                    address.State = billToContact.ContactAddressState;
                                    address.PostalCode = billToContact.ContactAddressPostalCode;
                                    address.Name = billToContact.ContactAddressName;
                                    address.TenantId = AbpSession.TenantId;
                                    addReturn = await _accountAppService.CreateOrEditAddress(address);
                                }
                                else
                                {
                                    addReturn = ObjectMapper.Map<AppAddressDto>(existimngAdd);
                                }
                                if (addReturn != null && addReturn.Id != 0)
                                {
                                    AppContactAddress contactAdd = new AppContactAddress();
                                    contactAdd.AddressId = addReturn.Id;
                                    contactAdd.AddressCode = addReturn.Code;
                                    contactAdd.ContactCode = account.AccountInfo.Code;
                                    contactAdd.ContactId = long.Parse(account.AccountInfo.Id.ToString());
                                    contactAdd.AddressTypeCode = "BILLING";
                                    var addressType = await _appEntity.GetAll().Where(z => z.Code == "BILLING").FirstOrDefaultAsync();
                                    if (addressType != null)
                                    {

                                        contactAdd.AddressTypeId = addressType.Id;
                                        var contactAddBill = await _appContactAddressRepository.InsertAsync(contactAdd);
                                        billToContact.ContactAddressId = contactAddBill.AddressId;
                                        billToContact.ContactSSIN = contactAddBill.ContactFk.SSIN;
                                        await CurrentUnitOfWork.SaveChangesAsync();
                                    }

                                }

                            }
                            //
                        }

                    }
                    if (buyerContact != null && !string.IsNullOrEmpty(buyerContact.CompanySSIN) && string.IsNullOrEmpty(buyerContact.ContactSSIN) && (input.CreateManualAccount || input.CreateManualContact))
                    {
                        var accountObj = await _appContactRepository.GetAll().Where(z => z.TenantId == AbpSession.TenantId && z.SSIN == input.BuyerCompanySSIN).FirstOrDefaultAsync();
                        ContactDto contactDto = new ContactDto();
                        contactDto.AccountId = accountObj.Id;
                        contactDto.Name = buyerContact.ContactName;
                        contactDto.FirstName = buyerContact.ContactName;
                        contactDto.LastName = "";//buyerContact.ContactName;
                        contactDto.EMailAddress = buyerContact.ContactEmail;
                        contactDto.UserId = null;
                        contactDto.UserName = null;
                        contactDto.TradeName = "";
                        contactDto.Phone1TypeId = buyerContact.ContactPhoneTypeId;
                        contactDto.Phone1Number = buyerContact.ContactPhoneNumber;
                        contactDto.TenantId = AbpSession.TenantId;
                        contactDto.ParentId = accountObj.Id;
                        if (string.IsNullOrEmpty(buyerContact.ContactCode))
                        {
                            var tenantObj = await TenantManager.GetByIdAsync(int.Parse(AbpSession.TenantId.ToString()));
                            if (tenantObj != null)
                            {
                                string sequance = await _sycIdentifierDefinitionsAppService.GetNextEntityCode("BUSINESS");
                                contactDto.Code = "C" + sequance;//tenantObj.TenancyName.Trim() + 
                            }
                        }
                        else
                        {
                            contactDto.Code = buyerContact.ContactCode;
                        }
                        ContactDto savedContactDto = await _accountAppService.CreateOrEditContact(contactDto);
                        if (savedContactDto != null)
                        {
                            //mm
                            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                            {
                                var publishContactAccount = await _appMarketplaceContactRepository.GetAll().AsNoTracking()
                                    //.Include(x => x.ContactAddresses)
                                    .FirstOrDefaultAsync(x => x.SSIN == accountObj.SSIN);
                                if (publishContactAccount != null && publishContactAccount.TenantOwner == AbpSession.TenantId)
                                {
                                    var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                                    //await PublishMember(contact.Id);
                                    await _iCreateMarketplaceAccount.PublishMember(savedContactDto.Id, publishContactAccount.Id, presonEntityObjectTypeId, null, publishContactAccount.Id);
                                    await _iCreateMarketplaceAccount.CreateOrEditMarketplaceContactRelationship(publishContactAccount.SSIN, savedContactDto.SSIN, false, null, null, null);
                                }
                            }
                            //mm
                            input.BuyerContactSSIN = savedContactDto.SSIN;
                            buyerContact.ContactSSIN = savedContactDto.SSIN;
                        }
                    }

                }
            }
            if (input.Id == 0)
            {
                if (input.TransactionType == TransactionType.SalesOrder)
                {
                    input.Name = "Sales Order#" + input.Code.TrimEnd();
                    input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
                }
                else
                {
                    input.Name = "Purchase Order#" + input.Code.TrimEnd();
                    input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
                }

                input.TenantId = AbpSession.TenantId;
                input.TenantOwner = long.Parse(AbpSession.TenantId.ToString());
                input.ObjectId = await _helper.SystemTables.GetObjectTransactionId();




                //            var addressType  = await _helper.SystemTables.GetEntityObjectTypeAddressTypeId();

                string sellerCurrency = "";
                string buyerCurrency = "";
                bool isBuyerManual = false;
                string buyerPrclvl = "MSRP";
                if (!string.IsNullOrEmpty(input.BuyerCompanySSIN))
                {

                    var buyerAccount = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.SSIN == input.BuyerCompanySSIN);
                    if (buyerAccount != null)
                    {
                        isBuyerManual = (buyerAccount.PartnerId == null ? true : false);
                        buyerPrclvl = buyerAccount.PriceLevel;
                        buyerCurrency = buyerAccount.CurrencyCode;
                        input.CurrencyId = buyerAccount.CurrencyId;
                        input.CurrencyCode = buyerAccount.CurrencyCode;

                    }

                }
                else
                {
                    isBuyerManual = true;
                    buyerPrclvl = "MSRP";
                    buyerCurrency = "";
                    if (input.CurrencyId == 0)
                    {
                        input.CurrencyId = null;
                        input.CurrencyCode = null;
                    }
                    else
                    {
                        var currencyEnt = await _appEntity.GetAll().Where(z => z.Id == input.CurrencyId).FirstOrDefaultAsync();
                        if (currencyEnt != null)
                        {
                            buyerCurrency = currencyEnt.Code;
                            input.CurrencyCode = currencyEnt.Code;
                        }
                    }
                }
                if (string.IsNullOrEmpty(input.PriceLevel))
                {
                    if (isBuyerManual)
                        input.PriceLevel = buyerPrclvl;
                    else
                    {
                        var priceLevel = await _appMarketplaceAccountsPriceLevelsRepository.GetAll().FirstOrDefaultAsync(a => a.AccountSSIN == input.SellerCompanySSIN && a.ConnectedAccountSSIN == input.BuyerCompanySSIN);
                        if (priceLevel != null)
                        {
                            input.PriceLevel = priceLevel.PriceLevel;
                        }
                        else { input.PriceLevel = "MSRP"; }
                    }
                }
                var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.SSIN == input.SellerCompanySSIN);
                if (account != null)
                {
                    sellerCurrency = account.CurrencyCode;
                    input.LanguageId = account.LanguageId;
                    input.LanguageCode = account.LanguageCode;
                    if (input.CurrencyId == 0)//(string.IsNullOrEmpty(input.CurrencyCode))
                    {
                        input.CurrencyCode = sellerCurrency;
                        //T-SII-20231221.0002,1 MMT 01/01/2024 Transactions-Temp Account issues[Start]
                        input.CurrencyId = account.CurrencyId;
                        //T-SII-20231221.0002,1 MMT 01/01/2024 Transactions-Temp Account issues[End]
                    }
                }

                if (input.CurrencyId == 0)
                {
                    var currencyObject = await TenantManager.GetTenantCurrency();
                    if (currencyObject != null)
                    {
                        input.CurrencyId = currencyObject.Value;
                        input.CurrencyCode = currencyObject.Code;
                    }
                }
                if (input.CurrencyId == 0)
                {
                    input.CurrencyCode = "USD";
                    //T-SII-20231221.0002,1 MMT 01/01/2024 Transactions-Temp Account issues[Start]
                    var currencyObj = _appEntity.GetAll().Where(z => z.Code == "USD" && z.TenantId == null).FirstOrDefault();
                    if (currencyObj != null)
                        input.CurrencyId = currencyObj.Id;
                    //T-SII-20231221.0002,1 MMT 01/01/2024 Transactions-Temp Account issues[End]
                }

                if (input.EnteredDate == new DateTime(1, 1, 1))
                    input.EnteredDate = DateTime.Now.Date;

                if (input.StartDate == new DateTime(1, 1, 1))
                    input.StartDate = DateTime.Now.Date;

                if (input.AvailableDate == new DateTime(1, 1, 1))
                    input.AvailableDate = input.StartDate.AddDays(30);

                if (input.CompleteDate == new DateTime(1, 1, 1))
                    input.CompleteDate = input.StartDate.AddDays(30);

                if (buyerCurrency == sellerCurrency)
                    input.CurrencyExchangeRate = 1;
                else
                {
                    if (!string.IsNullOrEmpty(buyerCurrency) && !string.IsNullOrEmpty(sellerCurrency))
                        input.CurrencyExchangeRate = _helper.SystemTables.GetExchangeRate(buyerCurrency, sellerCurrency);
                    else
                        input.CurrencyExchangeRate = 1;
                }

                input.CurrencyExchangeRate = input.CurrencyExchangeRate == 0 ? 1 : input.CurrencyExchangeRate;

                var appTrans = ObjectMapper.Map<AppTransactionHeaders>(input);
                //I46[Start]
                var accountDefaults = await _accountAppService.GetContactDefaults();
                //I46[End]
                //Iteration#37 -MMT [Start]
                #region read defaults for shipvia and payment terms from contact and account default
                if(input.SellerRelationId != null)
                {
                    var relationInfo = await _appContactRelationshipInfoRepository.GetAll().Include(e=> e.EntityExtraData).Where(z => z.Id == input.SellerRelationId).FirstOrDefaultAsync();
                    if (relationInfo != null)
                    {
                        if (relationInfo.EntityExtraData != null)
                        {    
                            var exrtaShipVia = relationInfo.EntityExtraData.Where(e=> e.AttributeId == 909).FirstOrDefault();
                            appTrans.ShipViaId = exrtaShipVia != null ? exrtaShipVia.AttributeValueId: appTrans.ShipViaId;

                            var exrtaPayment = relationInfo.EntityExtraData.Where(e => e.AttributeId == 910).FirstOrDefault();
                            appTrans.PaymentTermsId = exrtaPayment !=null ? exrtaPayment.AttributeValueId : appTrans.PaymentTermsId;

                            var exrtaPrice = relationInfo.EntityExtraData.Where(e => e.AttributeId == 908).FirstOrDefault();
                            appTrans.PriceLevel = exrtaPayment != null ? exrtaPrice.AttributeValue.ToString() : appTrans.PriceLevel;


                        }
                    }
                }   
                #endregion

                if (appTrans.ShipViaId != null)
                {
                    var ent = await _appEntity.GetAll().Where(z => z.Id == appTrans.ShipViaId).FirstOrDefaultAsync();
                    if (ent != null)
                        appTrans.ShipViaName = ent.Name;
                }
                else
                {
                    if (input.TransactionType == TransactionType.SalesOrder)
                    {
                        var appContact = await _appContactRepository.GetAll().Where(x => x.SSIN == input.BuyerCompanySSIN).FirstOrDefaultAsync();
                        if (appContact != null && appContact.ShipViaId != 0 && appContact.ShipViaId != null)
                        {
                            appTrans.ShipViaId = appContact.ShipViaId;
                            appTrans.ShipViaCode = appContact.ShipViaCode;
                            appTrans.ShipViaName = appContact.ShipViaName;
                        }
                        else
                        {
                            appTrans.ShipViaId = accountDefaults.ShipViaId;
                            appTrans.ShipViaCode = accountDefaults.ShipViaCode;
                            appTrans.ShipViaName = accountDefaults.ShipViaName;
                        }
                    }
                    else
                    {
                        var appContact = await _appContactRepository.GetAll().Where(x => x.SSIN == input.SellerCompanySSIN).FirstOrDefaultAsync();
                        if (appContact != null && appContact.ShipViaId != 0 && appContact.ShipViaId != null)
                        {
                            appTrans.ShipViaId = appContact.ShipViaId;
                            appTrans.ShipViaCode = appContact.ShipViaCode;
                            appTrans.ShipViaName = appContact.ShipViaName;
                        }
                        else
                        {
                            appTrans.ShipViaId = accountDefaults.ShipViaId;
                            appTrans.ShipViaCode = accountDefaults.ShipViaCode;
                            appTrans.ShipViaName = accountDefaults.ShipViaName;
                        }
                    }
                }
                if (appTrans.PaymentTermsId != null)
                {
                    var ent = await _appEntity.GetAll().Where(z => z.Id == appTrans.PaymentTermsId).FirstOrDefaultAsync();
                    if (ent != null)
                        appTrans.PaymentTermsName = ent.Name;
                }
                else
                {
                    if (input.TransactionType == TransactionType.SalesOrder)
                    {
                        var appContact = await _appContactRepository.GetAll().Where(x => x.SSIN == input.BuyerCompanySSIN).FirstOrDefaultAsync();
                        if (appContact != null && appContact.PaymentTermsId != 0 && appContact.PaymentTermsId != null)
                        {
                            appTrans.PaymentTermsId = appContact.PaymentTermsId;
                            appTrans.PaymentTermsCode = appContact.PaymentTermsCode;
                            appTrans.PaymentTermsName = appContact.PaymentTermsName;
                        }
                        else
                        {
                            appTrans.PaymentTermsId = accountDefaults.PaymentTermsId;
                            appTrans.PaymentTermsCode = accountDefaults.PaymentTermsCode;
                            appTrans.PaymentTermsName = accountDefaults.PaymentTermsName;
                        }
                    }
                    else
                    {
                        var appContact = await _appContactRepository.GetAll().Where(x => x.SSIN == input.SellerCompanySSIN).FirstOrDefaultAsync();
                        if (appContact != null && appContact.PaymentTermsId != 0 && appContact.PaymentTermsId != null)
                        {
                            appTrans.PaymentTermsId = appContact.PaymentTermsId;
                            appTrans.PaymentTermsCode = appContact.PaymentTermsCode;
                            appTrans.PaymentTermsName = appContact.PaymentTermsName;
                        }
                        else
                        {
                            appTrans.PaymentTermsId = accountDefaults.PaymentTermsId;
                            appTrans.PaymentTermsCode = accountDefaults.PaymentTermsCode;
                            appTrans.PaymentTermsName = accountDefaults.PaymentTermsName;
                        }
                    }
                }
                //Iteration#37 -MMT [End]
                if (input.lFromPlaceOrder)
                {
                    appTrans.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();

                }
                //I45
                else
                    appTrans.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();

                appTrans.EnteredUserByRole = input.EnteredByUserRole;
                appTrans.EnteredDate = input.EnteredDate.Date;
                appTrans.CompleteDate = input.CompleteDate.Date;
                appTrans.AvailableDate = input.AvailableDate.Date;
                appTrans.StartDate = input.StartDate.Date;
                //XX
                appTrans.AppTransactionContacts = new List<AppTransactionContacts>();
                if (string.IsNullOrEmpty(appTrans.SSIN))
                {
                    var transactionObjectId = await _helper.SystemTables.GetObjectTransactionId();
                    appTrans.SSIN = (input.TransactionType == TransactionType.SalesOrder ? "SO-" : "PO-") + await _helper.SystemTables.GenerateSSIN(transactionObjectId, ObjectMapper.Map<AppEntityDto>(appTrans));
                }
                long? phoneTypeSeller = null;
                string? phoneTypeNameSeller = null;
                long? sellerAddressId = null;
                string? sellerAddressCode = null;
                //MMT
                string? contactAddressCode = null;
                string? contactAddressCity = null;
                long? contactAddressCountryId = null;
                string? contactAddressCountryCode = null;
                AppEntity? contactAddressCountryFk = null;
                string? contactAddressLine1 = null;
                string? contactAddressLine2 = null;
                string? contactAddressName = null;
                string? contactAddressPostalCode = null;
                string? contactAddressState = null;
                //MMT
                if (!string.IsNullOrEmpty(input.SellerBranchSSIN))
                {
                    var accountSSIN = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk)
                        .Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk).Where(a => a.SSIN == input.SellerBranchSSIN).FirstOrDefaultAsync();
                    if (accountSSIN != null)
                    {

                        phoneTypeSeller = !string.IsNullOrEmpty(accountSSIN.Phone1Number) ? accountSSIN.Phone1TypeId :
                           (!string.IsNullOrEmpty(accountSSIN.Phone2Number) ? accountSSIN.Phone2TypeId :
                           (!string.IsNullOrEmpty(accountSSIN.Phone3Number) ? accountSSIN.Phone3TypeId : null));
                        phoneTypeNameSeller = !string.IsNullOrEmpty(accountSSIN.Phone1Number) ? accountSSIN.Phone1TypeName :
                            (!string.IsNullOrEmpty(accountSSIN.Phone2Number) ? accountSSIN.Phone2TypeName :
                            (!string.IsNullOrEmpty(accountSSIN.Phone3Number) ? accountSSIN.Phone3TypeName : null));
                        var sellerAddressObj = accountSSIN.AppContactAddresses.Where(z => z.AddressTypeFk.Code == "DIRECT-SHIPPING" || z.AddressTypeFk.Code == "DISTRIBUTION-CENTER").FirstOrDefault();
                        if (sellerAddressObj != null)
                        {
                            sellerAddressId = sellerAddressObj.AddressId;
                            sellerAddressCode = sellerAddressObj.AddressCode;
                            contactAddressCode = sellerAddressObj.AddressFk.Code;
                            contactAddressCity = sellerAddressObj.AddressFk.City;
                            contactAddressCountryId = sellerAddressObj.AddressFk.CountryId;
                            contactAddressCountryCode = sellerAddressObj.AddressFk.CountryCode;
                            contactAddressCountryFk = sellerAddressObj.AddressFk.CountryFk;
                            contactAddressLine1 = sellerAddressObj.AddressFk.AddressLine1;
                            contactAddressLine2 = sellerAddressObj.AddressFk.AddressLine2;
                            contactAddressName = sellerAddressObj.AddressFk.Name;
                            contactAddressPostalCode = sellerAddressObj.AddressFk.PostalCode;
                            contactAddressState = sellerAddressObj.AddressFk.State;
                        }
                    }
                }
                long? phoneTypeBuyer = null;
                string? phoneTypeNameBuyer = null;
                long? buyerAddressId = null;
                string? buyerAddressCode = null;
                //MMT
                string? contactBuyerAddressCode = null;
                string? contactBuyerAddressCity = null;
                long? contactBuyerAddressCountryId = null;
                string? contactBuyerAddressCountryCode = null;
                AppEntity? contactBuyerAddressCountryFk = null;
                string? contactBuyerAddressLine1 = null;
                string? contactBuyerAddressLine2 = null;
                string? contactBuyerAddressName = null;
                string? contactBuyerAddressPostalCode = null;
                string? contactBuyerAddressState = null;
                //MMT
                if (!string.IsNullOrEmpty(input.BuyerBranchSSIN))
                {
                    var accountSSIN = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk)
                        .Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                        .Where(a => a.SSIN == input.BuyerBranchSSIN).FirstOrDefaultAsync();
                    if (accountSSIN != null)
                    {
                        phoneTypeBuyer = !string.IsNullOrEmpty(accountSSIN.Phone1Number) ? accountSSIN.Phone1TypeId :
                            (!string.IsNullOrEmpty(accountSSIN.Phone2Number) ? accountSSIN.Phone2TypeId :
                            (!string.IsNullOrEmpty(accountSSIN.Phone3Number) ? accountSSIN.Phone3TypeId : null));
                        phoneTypeNameBuyer = !string.IsNullOrEmpty(accountSSIN.Phone1Number) ? accountSSIN.Phone1TypeName :
                            (!string.IsNullOrEmpty(accountSSIN.Phone2Number) ? accountSSIN.Phone2TypeName :
                            (!string.IsNullOrEmpty(accountSSIN.Phone3Number) ? accountSSIN.Phone3TypeName : null));
                        var buyerAddressObj = accountSSIN.AppContactAddresses.Where(z => z.AddressTypeFk.Code == "DIRECT-SHIPPING" || z.AddressTypeFk.Code == "DISTRIBUTION-CENTER").FirstOrDefault();
                        if (buyerAddressObj != null)
                        {
                            buyerAddressId = buyerAddressObj.AddressId;
                            buyerAddressCode = buyerAddressObj.AddressCode;
                            contactBuyerAddressCode = buyerAddressObj.AddressFk.Code;
                            contactBuyerAddressCity = buyerAddressObj.AddressFk.City;
                            contactBuyerAddressCountryId = buyerAddressObj.AddressFk.CountryId;
                            contactBuyerAddressCountryCode = buyerAddressObj.AddressFk.CountryCode;
                            contactBuyerAddressCountryFk = buyerAddressObj.AddressFk.CountryFk;
                            contactBuyerAddressLine1 = buyerAddressObj.AddressFk.AddressLine1;
                            contactBuyerAddressLine2 = buyerAddressObj.AddressFk.AddressLine2;
                            contactBuyerAddressName = buyerAddressObj.AddressFk.Name; ;
                            contactBuyerAddressPostalCode = buyerAddressObj.AddressFk.PostalCode;
                            contactBuyerAddressState = buyerAddressObj.AddressFk.State;

                        }
                    }
                }
                appTrans.AppTransactionContacts.Add(new AppTransactionContacts
                {
                    ContactName = input.SellerContactName,
                    ContactEmail = input.SellerContactEMailAddress,
                    ContactSSIN = input.SellerContactSSIN,
                    ContactPhoneTypeId = phoneTypeSeller,
                    ContactPhoneNumber = input.SellerContactPhoneNumber,
                    ContactPhoneTypeName = phoneTypeNameSeller,
                    ContactAddressId = null,
                    ContactAddressCode = null,
                    ContactRole = ContactRoleEnum.Seller.ToString(),
                    CompanySSIN = input.SellerCompanySSIN,
                    CompanyName = input.SellerCompanyName,
                    BranchName = input.SellerBranchName,
                    BranchSSIN = input.SellerBranchSSIN,
                    RelationId = input.SellerRelationId

                });


                appTrans.AppTransactionContacts.Add(new AppTransactionContacts
                {
                    ContactName = input.BuyerContactName,
                    ContactEmail = input.BuyerContactEMailAddress,
                    ContactSSIN = input.BuyerContactSSIN,
                    ContactPhoneTypeId = phoneTypeBuyer,
                    ContactPhoneTypeName = phoneTypeNameBuyer,
                    ContactPhoneNumber = input.BuyerContactPhoneNumber,
                    ContactAddressId = null,
                    ContactAddressCode = null,
                    ContactRole = ContactRoleEnum.Buyer.ToString(),
                    CompanySSIN = input.BuyerCompanySSIN,
                    CompanyName = input.BuyerCompanyName,
                    BranchName = input.BuyerBranchName,
                    BranchSSIN = input.BuyerBranchSSIN,
                    RelationId = input.BuyerRelationId
                });
                //
                var accountSSINBranchBuyer = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses)
                    .ThenInclude(z => z.AddressTypeFk)
                    .Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                    .Where(a => a.SSIN == input.BuyerBranchSSIN).FirstOrDefaultAsync();
                if (accountSSINBranchBuyer != null)
                {
                    var addressObj = accountSSINBranchBuyer.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk.Code == "DIRECT-SHIPPING" || x.AddressTypeFk.Code == "DISTRIBUTION-CENTER");
                    if (addressObj != null)
                    {
                        buyerAddressId = addressObj.AddressId;
                        buyerAddressCode = addressObj.AddressCode;
                        contactBuyerAddressCode = addressObj.AddressFk.Code;
                        contactBuyerAddressCity = addressObj.AddressFk.City;
                        contactBuyerAddressCountryId = addressObj.AddressFk.CountryId;
                        contactBuyerAddressCountryCode = addressObj.AddressFk.CountryCode;
                        contactBuyerAddressCountryFk = addressObj.AddressFk.CountryFk;
                        contactBuyerAddressLine1 = addressObj.AddressFk.AddressLine1;
                        contactBuyerAddressLine2 = addressObj.AddressFk.AddressLine2;
                        contactBuyerAddressName = addressObj.AddressFk.Name; ;
                        contactBuyerAddressPostalCode = addressObj.AddressFk.PostalCode;
                        contactBuyerAddressState = addressObj.AddressFk.State;
                    }
                }
                appTrans.AppTransactionContacts.Add(new AppTransactionContacts
                {
                    ContactName = input.BuyerContactName,
                    ContactEmail = input.BuyerContactEMailAddress,
                    ContactSSIN = input.BuyerContactSSIN,
                    ContactPhoneTypeId = phoneTypeBuyer,
                    ContactPhoneTypeName = phoneTypeNameBuyer,
                    ContactPhoneNumber = input.BuyerContactPhoneNumber,
                    ContactAddressId = buyerAddressId,
                    //ContactAddressCode = buyerAddressCode,
                    ContactRole = ContactRoleEnum.ShipToContact.ToString(),
                    CompanySSIN = input.BuyerCompanySSIN,
                    CompanyName = input.BuyerCompanyName,
                    BranchName = input.BuyerBranchName,
                    BranchSSIN = input.BuyerBranchSSIN,
                    ContactAddressCode = buyerAddressCode ==null?contactBuyerAddressCode: buyerAddressCode,
                    ContactAddressCity = contactBuyerAddressCity,
                    ContactAddressCountryId = contactBuyerAddressCountryId,
                    ContactAddressCountryCode = contactBuyerAddressCountryCode,
                    ContactAddressCountryFk = contactBuyerAddressCountryFk,
                    ContactAddressLine1 = contactBuyerAddressLine1,
                    ContactAddressLine2 = contactBuyerAddressLine2,
                    ContactAddressName = contactBuyerAddressName,
                    ContactAddressPostalCode = contactBuyerAddressPostalCode,
                    ContactAddressState = contactBuyerAddressState

                });
                var accountSSINBranchBuy = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk)
                    .Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                    .Where(a => a.SSIN == input.BuyerBranchSSIN).FirstOrDefaultAsync();
                if (accountSSINBranchBuy != null)
                {
                    var addressObj = accountSSINBranchBuy.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk.Code == "BILLING");
                    if (addressObj != null)
                    {
                        buyerAddressId = addressObj.AddressId;
                        buyerAddressCode = addressObj.AddressCode;
                        contactBuyerAddressCountryId = addressObj.AddressFk.CountryId;
                        contactBuyerAddressCountryCode = addressObj.AddressFk.CountryCode;
                        contactBuyerAddressCountryFk = addressObj.AddressFk.CountryFk;
                        contactBuyerAddressLine1 = addressObj.AddressFk.AddressLine1;
                        contactBuyerAddressLine2 = addressObj.AddressFk.AddressLine2;
                        contactBuyerAddressName = addressObj.AddressFk.Name; ;
                        contactBuyerAddressPostalCode = addressObj.AddressFk.PostalCode;
                        contactBuyerAddressState = addressObj.AddressFk.State;
                    }
                }
                appTrans.AppTransactionContacts.Add(new AppTransactionContacts
                {
                    ContactName = input.BuyerContactName,
                    ContactEmail = input.BuyerContactEMailAddress,
                    ContactSSIN = input.BuyerContactSSIN,
                    ContactPhoneTypeId = phoneTypeBuyer,
                    ContactPhoneTypeName = phoneTypeNameBuyer,
                    ContactPhoneNumber = input.BuyerContactPhoneNumber,
                    ContactAddressId = buyerAddressId,
                    ContactAddressCode = buyerAddressCode,
                    ContactRole = ContactRoleEnum.APContact.ToString(),
                    CompanySSIN = input.BuyerCompanySSIN,
                    CompanyName = input.BuyerCompanyName,
                    BranchName = input.BuyerBranchName,
                    BranchSSIN = input.BuyerBranchSSIN,
                    ContactAddressCity = contactBuyerAddressCity,
                    ContactAddressCountryId = contactBuyerAddressCountryId,
                    ContactAddressCountryCode = contactBuyerAddressCountryCode,
                    ContactAddressCountryFk = contactBuyerAddressCountryFk,
                    ContactAddressLine1 = contactBuyerAddressLine1,
                    ContactAddressLine2 = contactBuyerAddressLine2,
                    ContactAddressName = contactBuyerAddressName,
                    ContactAddressPostalCode = contactBuyerAddressPostalCode,
                    ContactAddressState = contactBuyerAddressState
                });
                var accountSSINBranch = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk)
                    .Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                    .Where(a => a.SSIN == input.SellerBranchSSIN).FirstOrDefaultAsync();
                if (accountSSINBranch != null)
                {
                    var sellerAddressObj = accountSSINBranch.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk.Code == "DIRECT-SHIPPING" || x.AddressTypeFk.Code == "DISTRIBUTION-CENTER");
                    if (sellerAddressObj != null)
                    {
                        sellerAddressId = sellerAddressObj.AddressId;
                        sellerAddressCode = sellerAddressObj.AddressCode;
                        contactAddressCode = sellerAddressObj.AddressFk.Code;
                        contactAddressCity = sellerAddressObj.AddressFk.City;
                        contactAddressCountryId = sellerAddressObj.AddressFk.CountryId;
                        contactAddressCountryCode = sellerAddressObj.AddressFk.CountryCode;
                        contactAddressCountryFk = sellerAddressObj.AddressFk.CountryFk;
                        contactAddressLine1 = sellerAddressObj.AddressFk.AddressLine1;
                        contactAddressLine2 = sellerAddressObj.AddressFk.AddressLine2;
                        contactAddressName = sellerAddressObj.AddressFk.Name;
                        contactAddressPostalCode = sellerAddressObj.AddressFk.PostalCode;
                        contactAddressState = sellerAddressObj.AddressFk.State;
                    }
                }
                appTrans.AppTransactionContacts.Add(new AppTransactionContacts
                {
                    ContactName = input.SellerContactName,
                    ContactEmail = input.SellerContactEMailAddress,
                    ContactSSIN = input.SellerContactSSIN,
                    ContactPhoneTypeId = phoneTypeSeller,
                    ContactPhoneNumber = input.SellerContactPhoneNumber,
                    ContactPhoneTypeName = phoneTypeNameSeller,
                    ContactAddressId = sellerAddressId,
                    ContactAddressCode = sellerAddressCode,
                    ContactRole = ContactRoleEnum.ShipFromContact.ToString(),
                    CompanySSIN = input.SellerCompanySSIN,
                    CompanyName = input.SellerCompanyName,
                    BranchName = input.SellerBranchName,
                    BranchSSIN = input.SellerBranchSSIN,
                    ContactAddressCity = contactAddressCity,
                    ContactAddressCountryId = contactAddressCountryId,
                    ContactAddressCountryCode = contactAddressCountryCode,
                    ContactAddressCountryFk = contactAddressCountryFk,
                    ContactAddressLine1 = contactAddressLine1,
                    ContactAddressLine2 = contactAddressLine2,
                    ContactAddressName = contactAddressName,
                    ContactAddressPostalCode = contactAddressPostalCode,
                    ContactAddressState = contactAddressState
                });
                var accountSSINBranchSeller = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk)
                    .Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                    .Where(a => a.SSIN == input.SellerBranchSSIN).FirstOrDefaultAsync();
                if (accountSSINBranchSeller != null)
                {
                    var addressObj = accountSSINBranchSeller.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk.Code == "BILLING");
                    if (addressObj != null)
                    {
                        sellerAddressId = addressObj.AddressId;
                        sellerAddressCode = addressObj.AddressFk.Code;
                        contactAddressCode = addressObj.AddressFk.Code;
                        contactAddressCity = addressObj.AddressFk.City;
                        contactAddressCountryId = addressObj.AddressFk.CountryId;
                        contactAddressCountryCode = addressObj.AddressFk.CountryCode;
                        contactAddressCountryFk = addressObj.AddressFk.CountryFk;
                        contactAddressLine1 = addressObj.AddressFk.AddressLine1;
                        contactAddressLine2 = addressObj.AddressFk.AddressLine2;
                        contactAddressName = addressObj.AddressFk.Name;
                        contactAddressPostalCode = addressObj.AddressFk.PostalCode;
                        contactAddressState = addressObj.AddressFk.State;
                    }
                }
                appTrans.AppTransactionContacts.Add(new AppTransactionContacts
                {
                    ContactName = input.SellerContactName,
                    ContactEmail = input.SellerContactEMailAddress,
                    ContactSSIN = input.SellerContactSSIN,
                    ContactPhoneTypeId = phoneTypeSeller,
                    ContactPhoneNumber = input.SellerContactPhoneNumber,
                    ContactPhoneTypeName = phoneTypeNameSeller,
                    ContactAddressId = sellerAddressId,
                    ContactAddressCode = sellerAddressCode,
                    ContactRole = ContactRoleEnum.ARContact.ToString(),
                    CompanySSIN = input.SellerCompanySSIN,
                    CompanyName = input.SellerCompanyName,
                    BranchName = input.SellerBranchName,
                    BranchSSIN = input.SellerBranchSSIN,
                    //ContactAddressCode = sellerAddressObj.Code,
                    ContactAddressCity = contactAddressCity,
                    ContactAddressCountryId = contactAddressCountryId,
                    ContactAddressCountryCode = contactAddressCountryCode,
                    ContactAddressCountryFk = contactAddressCountryFk,
                    ContactAddressLine1 = contactAddressLine1,
                    ContactAddressLine2 = contactAddressLine2,
                    ContactAddressName = contactAddressName,
                    ContactAddressPostalCode = contactAddressPostalCode,
                    ContactAddressState = contactAddressState
                });
                //
                if (AbpSession.UserId != null)
                {
                    //var user = UserManager.GetUserById(AbpSession.UserId);
                    var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                    var branchEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeBranchId();
                    var contact = await _appContactRepository.GetAll()
                        .Where(s => s.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && s.TenantId == AbpSession.TenantId
                        && s.EntityFk.EntityExtraData.Count(z => z.AttributeId == 715 && z.AttributeValue == AbpSession.UserId.ToString()) > 0).FirstOrDefaultAsync();

                    if (contact != null)
                    {
                        var contactCompany = await _appContactRepository.GetAll()
                        .Where(s => s.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId && s.TenantId == AbpSession.TenantId &&
                        s.ParentId == null && s.IsProfileData == true).FirstOrDefaultAsync();
                        var conactBranch = await _appContactRepository.GetAll()
                        .Where(s => s.EntityFk.EntityObjectTypeId == branchEntityObjectTypeId && s.TenantId == AbpSession.TenantId &&
                        s.ParentId == contactCompany.Id).FirstOrDefaultAsync();
                        
                        appTrans.AppTransactionContacts.Add(new AppTransactionContacts
                        {
                            ContactName = contact.Name,
                            ContactEmail = contact.EMailAddress,
                            ContactSSIN = contact.SSIN,
                            ContactPhoneTypeId = !string.IsNullOrEmpty(contact.Phone1Number) ? contact.Phone1TypeId :
                            (!string.IsNullOrEmpty(contact.Phone2Number) ? contact.Phone2TypeId :
                            (!string.IsNullOrEmpty(contact.Phone3Number) ? contact.Phone3TypeId : null)),
                            ContactPhoneTypeName = !string.IsNullOrEmpty(contact.Phone1Number) ? contact.Phone1TypeName :
                            (!string.IsNullOrEmpty(contact.Phone2Number) ? contact.Phone2TypeName :
                            (!string.IsNullOrEmpty(contact.Phone3Number) ? contact.Phone3TypeName : null)),
                            ContactPhoneNumber = !string.IsNullOrEmpty(contact.Phone1Number) ? contact.Phone1Number :
                            (!string.IsNullOrEmpty(contact.Phone2Number) ? contact.Phone2Number :
                            (!string.IsNullOrEmpty(contact.Phone3Number) ? contact.Phone3Number : null)),
                            ContactAddressId = null,
                            ContactAddressCode = null,
                            ContactRole = ContactRoleEnum.Creator.ToString(),
                            CompanySSIN = contactCompany != null ? contactCompany.SSIN : null,
                            CompanyName = contactCompany != null ? contactCompany.Name : null,
                            BranchName = conactBranch != null ? conactBranch.Name : null,
                            BranchSSIN = conactBranch != null ? conactBranch.SSIN : null
                        });
                        //MMT2024[start]
                        //MMT2024[End]
                        if (input.TransactionType == TransactionType.SalesOrder && input.EnteredByUserRole.Contains("Independent Sales Rep"))
                            appTrans.AppTransactionContacts.Add(new AppTransactionContacts
                            {
                                ContactName = contact.Name,
                                ContactEmail = contact.EMailAddress,
                                ContactSSIN = contact.SSIN,
                                ContactPhoneTypeId = !string.IsNullOrEmpty(contact.Phone1Number) ? contact.Phone1TypeId :
                               (!string.IsNullOrEmpty(contact.Phone2Number) ? contact.Phone2TypeId :
                               (!string.IsNullOrEmpty(contact.Phone3Number) ? contact.Phone3TypeId : null)),
                                ContactPhoneNumber = !string.IsNullOrEmpty(contact.Phone1Number) ? contact.Phone1Number :
                               (!string.IsNullOrEmpty(contact.Phone2Number) ? contact.Phone2Number :
                               (!string.IsNullOrEmpty(contact.Phone3Number) ? contact.Phone3Number : null)),
                                ContactPhoneTypeName = !string.IsNullOrEmpty(contact.Phone1Number) ? contact.Phone1TypeName :
                                (!string.IsNullOrEmpty(contact.Phone2Number) ? contact.Phone2TypeName :
                                (!string.IsNullOrEmpty(contact.Phone3Number) ? contact.Phone3TypeName : null)),
                                ContactAddressId = null,
                                ContactAddressCode = null,
                                ContactRole = ContactRoleEnum.SalesRep1.ToString(),
                                CompanySSIN = contactCompany != null ? contactCompany.SSIN : null,
                                CompanyName = contactCompany != null ? contactCompany.Name : null,
                                BranchName = conactBranch != null? conactBranch.Name:null,
                                BranchSSIN = conactBranch != null ? conactBranch.SSIN : null
                            });

                    }


                }
                //fix company code[start]
                if (appTrans.AppTransactionContacts != null && appTrans.AppTransactionContacts.Count > 0)
                {
                    foreach (var contact in appTrans.AppTransactionContacts)
                    {
                        if (!string.IsNullOrEmpty(contact.CompanySSIN) && string.IsNullOrEmpty(contact.CompanyCode))
                        {
                            var originalContact = await _appContactRepository.GetAll().Where(z => z.SSIN == contact.CompanySSIN).FirstOrDefaultAsync();
                            if (originalContact != null)
                            {
                                contact.CompanyCode = originalContact.Code;
                                contact.CompanyName = originalContact.Name;
                            }
                        }
                        if (!string.IsNullOrEmpty(contact.BranchSSIN) && string.IsNullOrEmpty(contact.BranchCode))
                        {
                            var originalContact = await _appContactRepository.GetAll().Where(z => z.SSIN == contact.BranchSSIN).FirstOrDefaultAsync();
                            if (originalContact != null)
                            {
                                contact.BranchCode = originalContact.Code;
                                contact.BranchName = originalContact.Name;
                            }
                        }
                        if (!string.IsNullOrEmpty(contact.ContactSSIN) && string.IsNullOrEmpty(contact.ContactCode))
                        {
                            var originalContact = await _appContactRepository.GetAll().Where(z => z.SSIN == contact.ContactSSIN).FirstOrDefaultAsync();
                            if (originalContact != null)
                            {
                                contact.ContactCode = originalContact.Code;
                                contact.ContactName = originalContact.Name;
                            }
                        }
                    }
                }
                //fix company code[End]
                appTrans.TotalQuantity = long.Parse(appTrans.AppTransactionDetails.Where(s => s.ParentId != null).Sum(s => s.Quantity).ToString());
                appTrans.TotalAmount = double.Parse(appTrans.AppTransactionDetails.Where(s => s.ParentId != null).Sum(s => s.Amount).ToString());
                if (string.IsNullOrEmpty(appTrans.SSIN))
                {
                    var transactionObject = await _helper.SystemTables.GetObjectTransactionId();
                    appTrans.SSIN = (input.TransactionType == TransactionType.SalesOrder ? "SO-" : "PO-") + await _helper.SystemTables.GenerateSSIN(transactionObject, ObjectMapper.Map<AppEntityDto>(appTrans));
                }
                AppTransactionHeaders obj = new AppTransactionHeaders();
                var header = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().Include(z => z.AppTransactionDetails).Where(s => s.Code == input.Code && s.TenantId == AbpSession.TenantId
                && s.EntityObjectStatusId == null && s.EntityObjectTypeId == input.EntityObjectTypeId).FirstOrDefaultAsync();
                if (header != null)
                {
                    if (input.lFromPlaceOrder)
                    {
                        await _appShoppingCartRepository.DeleteAsync(s => s.TransactionId == header.Id && s.TenantId == AbpSession.TenantId && s.CreatorUserId == AbpSession.UserId);
                        if (buyerTenantId != null)
                        {
                            foreach (var det in header.AppTransactionDetails.Where(z => z.ParentId == null))
                                await GetProductFromMarketplace(det.SSIN, int.Parse(AbpSession.TenantId.ToString()), header.Id);
                        }

                    }
                    //Iteration45[Start]
                    appTrans.TimeStamp = DateTime.UtcNow;
                    //Iteration45[End]

                    appTrans.Id = header.Id;
                    appTrans.EnteredDate = input.EnteredDate;
                    if (header.EntityObjectStatusId == null)
                        appTrans.CreatorUserId = AbpSession.UserId;

                    obj = await _appTransactionsHeaderRepository.UpdateAsync(appTrans);
                    UpdateAppEntityLog(obj.Id);
                }
                else
                {
                    //Iteration45[Start]
                    appTrans.TimeStamp = DateTime.UtcNow;
                    //Iteration45[End]
                    //XX
                    //var  AppTrans = Objmapper. ObjectMapper.Map<CreateOrEditAppTransactionDto,AppTransactionsHeader>(input);
                    //ObjectMapper..Map<CreateOrEditAppTransactionDto,AppTransactionsHeader>(input) ;
                    appTrans.EnteredDate = input.EnteredDate;
                    obj = await _appTransactionsHeaderRepository.InsertAsync(appTrans);
                    UpdateAppEntityLog(obj.Id);
                    // obj = await _appTransactionsHeaderRepository.UpdateAsync(obj);
                }
                //log[start]
                //var openStatus = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                //if (input.lFromPlaceOrder || (appTrans.EntityObjectStatusId == openStatus))
                //{
                //    var statusCodeNotSent = await _helper.SystemTables.GetEntityObjectStatusReadyToSendEntityLog();
                //    var logExist = await _appEntityLogRepository.GetAll().Where(z => z.EntityId == appTrans.Id &&
                //    z.TenantId == AbpSession.TenantId && z.EntityObjectTypeId == appTrans.EntityObjectTypeId &&
                //    z.EntityObjectStatusId == statusCodeNotSent
                //    ).FirstOrDefaultAsync();
                //    if (logExist != null)
                //    {

                //        //logExist.EntityObjectStatusId = statusCodeNotSent;
                //        //logExist.EntityObjectStatusCode = "Ready to be Sent";
                //        //await _appEntityLogRepository.UpdateAsync(logExist);
                //    }
                //    else
                //    {
                //        logExist = new AppEntityLog();
                //        //var statusCode = await _helper.SystemTables.GetEntityObjectStatusReadyToSendEntityLog();
                //        logExist.EntityObjectStatusId = statusCodeNotSent;
                //        logExist.EntityObjectStatusCode = "Ready to be Sent";
                //        logExist.EntityId = appTrans.Id;
                //        logExist.EntityCode = appTrans.Code;
                //        logExist.EntityObjectTypeId = appTrans.EntityObjectTypeId;
                //        logExist.EntityObjectTypeCode = appTrans.EntityObjectTypeCode;
                //        logExist.PartnerCode = "ARIAERP";
                //        logExist.TenantId =int.Parse(AbpSession.TenantId.ToString());
                //        logExist.ObjectId = appTrans.ObjectId;
                //        logExist.ObjectCode="TRANSACTION";
                //        await _appEntityLogRepository.InsertAsync(logExist);

                //    }
                //}
                //log[End]
                await CurrentUnitOfWork.SaveChangesAsync();
                return obj.Id;

            }
            else
            {
                var appTrans = ObjectMapper.Map<AppTransactionHeaders>(input);
                appTrans.EnteredUserByRole = input.EnteredByUserRole;
                appTrans.EnteredDate = input.EnteredDate.Date;
                appTrans.CompleteDate = input.CompleteDate.Date;
                appTrans.AvailableDate = input.AvailableDate.Date;
                appTrans.StartDate = input.StartDate.Date;
                if (input.lFromPlaceOrder)
                    appTrans.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                //MMT-Fix Status
                else
                {
                    if (appTrans.EntityObjectStatusId == null)
                        appTrans.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                }
                //MMT - Fix Status 
                //XX
                if (appTrans.AppTransactionContacts.Count() == 0)
                {
                    await _appTransactionContactsRepository.DeleteAsync(a => a.TransactionId == appTrans.Id);
                }
                else
                {
                    var contacts = await _appTransactionContactsRepository.GetAll().AsNoTracking().Where(a => a.TransactionId == appTrans.Id).ToListAsync();
                    if (contacts != null && contacts.Count() > 0)
                    {
                        foreach (var cont in contacts)
                        {
                            var appCont = appTrans.AppTransactionContacts.FirstOrDefault(a => a.Id == cont.Id);
                            if (appCont == null)
                                await _appTransactionContactsRepository.DeleteAsync(a => a.Id == cont.Id && a.TransactionId == appTrans.Id);
                            else
                            {
                                //Iteration37 - MMT [Start]
                                if (appCont.ContactAddressId != null)
                                {
                                    var addObj = _appAddressRepository.GetAll().Where(z => z.Id == appCont.ContactAddressId).FirstOrDefault();
                                    if (addObj != null)
                                    {
                                        appCont.ContactAddressCode = addObj.Code;
                                        appCont.ContactAddressCity = addObj.City;
                                        appCont.ContactAddressCountryId = addObj.CountryId;
                                        appCont.ContactAddressCountryCode = addObj.CountryCode;
                                        appCont.ContactAddressCountryFk = addObj.CountryFk;
                                        appCont.ContactAddressLine1 = addObj.AddressLine1;
                                        appCont.ContactAddressLine2 = addObj.AddressLine2;
                                        appCont.ContactAddressName = addObj.Name;
                                        appCont.ContactAddressPostalCode = addObj.PostalCode;
                                        appCont.ContactAddressState = addObj.State;
                                    }
                                    else
                                    {
                                        appCont.ContactAddressId = null;
                                        // appCont.ContactAddressCountryId = null;
                                    }
                                }
                                else
                                {
                                    // if (appCont.ContactAddressCode == null)
                                    // appCont.ContactAddressCountryId = null;
                                }
                                //I45
                                if (appCont.ContactAddressCountryId == 0)
                                    appCont.ContactAddressCountryId = null;
                                //I45
                                //Iteration37 - MMT [Start]
                                if (appCont.Id != 0)
                                    await _appTransactionContactsRepository.UpdateAsync(appCont);
                                else
                                {
                                    var saved = await _appTransactionContactsRepository.InsertAsync(appCont);
                                    if (saved != null)
                                        appCont.Id = saved.Id;
                                }
                            }
                        }
                    }
                    var appContSeller = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.Seller.ToString() && a.BranchName != null);
                    if (appContSeller != null)
                    {
                        var shipFromContact = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.ShipFromContact.ToString());
                        if (shipFromContact != null && (string.IsNullOrEmpty(shipFromContact.BranchName) || string.IsNullOrEmpty(shipFromContact.ContactAddressCode)))
                        {
                            string shipperBranch = string.IsNullOrEmpty(shipFromContact.BranchName) ? appContSeller.BranchName : shipFromContact.BranchName;
                            string shipperBranchSSIN = string.IsNullOrEmpty(shipFromContact.BranchSSIN) ? appContSeller.BranchSSIN : shipFromContact.BranchSSIN;
                            long? sellerAddressId = null;
                            string? sellerAddressCode = null;
                            if (!string.IsNullOrEmpty(shipperBranchSSIN))
                            {
                                var accountSSIN = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk).Where(a => a.SSIN == shipperBranchSSIN).FirstOrDefaultAsync();
                                if (accountSSIN != null)
                                {
                                    var sellerAddressObj = accountSSIN.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk.Code == "DIRECT-SHIPPING" || x.AddressTypeFk.Code == "DISTRIBUTION-CENTER");
                                    if (sellerAddressObj != null)
                                    {
                                        sellerAddressId = sellerAddressObj.AddressId;
                                        sellerAddressCode = sellerAddressObj.AddressCode;
                                    }
                                }
                            }
                            shipFromContact.BranchName = shipperBranch;
                            shipFromContact.BranchSSIN = shipperBranchSSIN;
                            shipFromContact.ContactAddressId = sellerAddressId;
                            shipFromContact.ContactAddressCode = sellerAddressCode;
                            /*var shipFromContactObj = new AppTransactionContacts
                            {
                                ContactName = appContSeller.ContactName,
                                ContactEmail = appContSeller.ContactEmail,
                                ContactSSIN = appContSeller.ContactSSIN,
                                ContactPhoneTypeId = appContSeller.ContactPhoneTypeId,
                                ContactPhoneNumber = appContSeller.ContactPhoneNumber,
                                ContactPhoneTypeName = appContSeller.ContactPhoneTypeName,
                                ContactAddressId = sellerAddressId,
                                ContactAddressCode = sellerAddressCode,
                                ContactRole = ContactRoleEnum.ShipFromContact.ToString(),
                                CompanySSIN = appContSeller.CompanySSIN,
                                CompanyName = appContSeller.CompanyName,
                                BranchName = appContSeller.BranchName,
                                BranchSSIN = appContSeller.BranchSSIN,
                                TransactionId = appContSeller.TransactionId
                            };*/
                            if (shipFromContact.ContactAddressId != null)
                            {
                                var addObj = _appAddressRepository.GetAll().Where(z => z.Id == shipFromContact.ContactAddressId).FirstOrDefault();
                                if (addObj != null)
                                {

                                    shipFromContact.ContactAddressCode = addObj.Code;
                                    shipFromContact.ContactAddressCity = addObj.City;
                                    shipFromContact.ContactAddressCountryId = addObj.CountryId;
                                    shipFromContact.ContactAddressCountryCode = addObj.CountryCode;
                                    shipFromContact.ContactAddressCountryFk = addObj.CountryFk;
                                    shipFromContact.ContactAddressLine1 = addObj.AddressLine1;
                                    shipFromContact.ContactAddressLine2 = addObj.AddressLine2;
                                    shipFromContact.ContactAddressName = addObj.Name;
                                    shipFromContact.ContactAddressPostalCode = addObj.PostalCode;
                                    shipFromContact.ContactAddressState = addObj.State;
                                }
                                else
                                {
                                    shipFromContact.ContactAddressId = null;
                                    // shipFromContact.ContactAddressCountryId = null;
                                }
                            }
                            else
                            {
                                //  if (shipFromContact.ContactAddressCode == null)
                                //   shipFromContact.ContactAddressCountryId = null;
                            }
                            //I45
                            if (shipFromContact.ContactAddressCountryId == 0)
                                shipFromContact.ContactAddressCountryId = null;
                            //I45
                            if (shipFromContact.Id != 0)
                                await _appTransactionContactsRepository.UpdateAsync(shipFromContact);
                            else
                            {
                                var saved = await _appTransactionContactsRepository.InsertAsync(shipFromContact);
                                if (saved != null)
                                    shipFromContact.Id = saved.Id;
                            }
                        }
                        //AR Contact [Start]
                        var arContact = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.ARContact.ToString());
                        if (arContact != null && (string.IsNullOrEmpty(arContact.BranchName) || string.IsNullOrEmpty(arContact.ContactAddressCode)))
                        {
                            string shipperBranch = string.IsNullOrEmpty(arContact.BranchName) ? appContSeller.BranchName : arContact.BranchName;
                            string shipperBranchSSIN = string.IsNullOrEmpty(arContact.BranchSSIN) ? appContSeller.BranchSSIN : arContact.BranchSSIN;
                            long? sellerAddressId = null;
                            string? sellerAddressCode = null;
                            if (!string.IsNullOrEmpty(shipperBranchSSIN))
                            {
                                var accountSSIN = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).Where(a => a.SSIN == shipperBranchSSIN).FirstOrDefaultAsync();
                                if (accountSSIN != null)
                                {
                                    var sellerAddressObj = accountSSIN.AppContactAddresses.FirstOrDefault(x => x.AddressTypeCode == "BILLING");
                                    if (sellerAddressObj != null)
                                    {
                                        sellerAddressId = sellerAddressObj.AddressId;
                                        // sellerAddressCode = sellerAddressObj.AddressCode;
                                    }
                                }
                            }
                            arContact.BranchName = shipperBranch;
                            arContact.BranchSSIN = shipperBranchSSIN;
                            arContact.ContactAddressId = sellerAddressId;
                            arContact.ContactAddressCode = sellerAddressCode;
                            /*var shipFromContactObj = new AppTransactionContacts
                            {
                                ContactName = appContSeller.ContactName,
                                ContactEmail = appContSeller.ContactEmail,
                                ContactSSIN = appContSeller.ContactSSIN,
                                ContactPhoneTypeId = appContSeller.ContactPhoneTypeId,
                                ContactPhoneNumber = appContSeller.ContactPhoneNumber,
                                ContactPhoneTypeName = appContSeller.ContactPhoneTypeName,
                                ContactAddressId = sellerAddressId,
                                ContactAddressCode = sellerAddressCode,
                                ContactRole = ContactRoleEnum.ShipFromContact.ToString(),
                                CompanySSIN = appContSeller.CompanySSIN,
                                CompanyName = appContSeller.CompanyName,
                                BranchName = appContSeller.BranchName,
                                BranchSSIN = appContSeller.BranchSSIN,
                                TransactionId = appContSeller.TransactionId
                            };*/
                            //Iteration37 - MMT [Start]
                            if (arContact.ContactAddressId != null)
                            {
                                var addObj = _appAddressRepository.GetAll().Where(z => z.Id == arContact.ContactAddressId).FirstOrDefault();
                                if (addObj != null)
                                {
                                    arContact.ContactAddressCode = addObj.Code;
                                    arContact.ContactAddressCity = addObj.City;
                                    arContact.ContactAddressCountryId = addObj.CountryId;
                                    arContact.ContactAddressCountryCode = addObj.CountryCode;
                                    arContact.ContactAddressCountryFk = addObj.CountryFk;
                                    arContact.ContactAddressLine1 = addObj.AddressLine1;
                                    arContact.ContactAddressLine2 = addObj.AddressLine2;
                                    arContact.ContactAddressName = addObj.Name;
                                    arContact.ContactAddressPostalCode = addObj.PostalCode;
                                    arContact.ContactAddressState = addObj.State;
                                }
                                else
                                {
                                    arContact.ContactAddressId = null;
                                    //   arContact.ContactAddressCountryId = null;
                                }
                            }
                            else
                            {
                                //if (arContact.ContactAddressCode == null)
                                //  arContact.ContactAddressCountryId = null;
                            }
                            //I45
                            if (arContact.ContactAddressCountryId == 0)
                                arContact.ContactAddressCountryId = null;
                            //I45
                            //Iteration37 - MMT [Start]
                            if (arContact.Id != 0)
                                await _appTransactionContactsRepository.UpdateAsync(arContact);
                            else
                            {
                                var saved = await _appTransactionContactsRepository.InsertAsync(arContact);
                                if (saved != null)
                                    arContact.Id = saved.Id;
                            }
                            //AR Contact [End]
                        }
                    }
                    //
                    var appContBuyer = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.Buyer.ToString() && a.BranchName != null);
                    if (appContBuyer != null)
                    {

                        var shiToContact = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.ShipToContact.ToString());
                        if (shiToContact != null && (string.IsNullOrEmpty(shiToContact.BranchSSIN) || string.IsNullOrEmpty(shiToContact.ContactAddressCode)))
                        {
                            string shipToBranch = string.IsNullOrEmpty(shiToContact.BranchName) ? appContBuyer.BranchName : shiToContact.BranchName;
                            string shipToBranchSSIN = string.IsNullOrEmpty(shiToContact.BranchSSIN) ? appContBuyer.BranchSSIN : shiToContact.BranchSSIN;
                            long? buyerAddressId = null;
                            string? buyerAddressCode = null;
                            if (!string.IsNullOrEmpty(shipToBranchSSIN))
                            {
                                var accountSSIN = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk).Where(a => a.SSIN == shipToBranchSSIN).FirstOrDefaultAsync();
                                if (accountSSIN != null)
                                {
                                    var buyerAddressObj = accountSSIN.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk.Code == "DIRECT-SHIPPING" || x.AddressTypeFk.Code == "DISTRIBUTION-CENTER");
                                    if (buyerAddressObj != null)
                                    {
                                        buyerAddressId = buyerAddressObj.AddressId;
                                        buyerAddressCode = buyerAddressObj.AddressCode;
                                    }
                                }
                            }
                            shiToContact.BranchName = shipToBranch;
                            shiToContact.BranchSSIN = shipToBranchSSIN;
                            shiToContact.ContactAddressId = buyerAddressId;
                            shiToContact.ContactAddressCode = (string.IsNullOrEmpty(shiToContact.ContactAddressCode) ? buyerAddressCode : shiToContact.ContactAddressCode);

                            /*var shipToContact = new AppTransactionContacts
                            {
                                ContactName = appContBuyer.ContactName,
                                ContactEmail = appContBuyer.ContactEmail,
                                ContactSSIN = appContBuyer.ContactSSIN,
                                ContactPhoneTypeId = appContBuyer.ContactPhoneTypeId,
                                ContactPhoneNumber = appContBuyer.ContactPhoneNumber,
                                ContactPhoneTypeName = appContBuyer.ContactPhoneTypeName,
                                ContactAddressId = buyerAddressId,
                                ContactAddressCode = buyerAddressCode,
                                ContactRole = ContactRoleEnum.ShipToContact.ToString(),
                                CompanySSIN = appContBuyer.CompanySSIN,
                                CompanyName = appContBuyer.CompanyName,
                                BranchName = appContBuyer.BranchName,
                                BranchSSIN = appContBuyer.BranchSSIN,
                                TransactionId= appContBuyer.TransactionId
                                
                           };*/
                            if (shiToContact.ContactAddressId != null)
                            {
                                var addObj = _appAddressRepository.GetAll().Where(z => z.Id == shiToContact.ContactAddressId).FirstOrDefault();
                                if (addObj != null)
                                {
                                    shiToContact.ContactAddressCode = addObj.Code;
                                    shiToContact.ContactAddressCity = addObj.City;
                                    shiToContact.ContactAddressCountryId = addObj.CountryId;
                                    shiToContact.ContactAddressCountryCode = addObj.CountryCode;
                                    shiToContact.ContactAddressCountryFk = addObj.CountryFk;
                                    shiToContact.ContactAddressLine1 = addObj.AddressLine1;
                                    shiToContact.ContactAddressLine2 = addObj.AddressLine2;
                                    shiToContact.ContactAddressName = addObj.Name;
                                    shiToContact.ContactAddressPostalCode = addObj.PostalCode;
                                    shiToContact.ContactAddressState = addObj.State;
                                }
                                else
                                {
                                    shiToContact.ContactAddressId = null;
                                    //  shiToContact.ContactAddressCountryId = null;
                                }
                            }
                            else
                            {
                                //if (shiToContact.ContactAddressCode == null)
                                //  shiToContact.ContactAddressCountryId = null;
                            }
                            //I45
                            if (shiToContact.ContactAddressCountryId == 0)
                                shiToContact.ContactAddressCountryId = null;
                            //I45
                            if (shiToContact.Id != 0)
                                await _appTransactionContactsRepository.UpdateAsync(shiToContact);
                            else
                            {
                                var saved = await _appTransactionContactsRepository.InsertAsync(shiToContact);
                                if (saved != null)
                                    shiToContact.Id = saved.Id;
                            }
                        }
                        //AP Contact[Start]
                        var apContact = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.APContact.ToString());
                        if (apContact != null && (string.IsNullOrEmpty(apContact.BranchSSIN) || string.IsNullOrEmpty(apContact.ContactAddressCode)))
                        {
                            string shipToBranch = string.IsNullOrEmpty(apContact.BranchName) ? appContBuyer.BranchName : apContact.BranchName;
                            string shipToBranchSSIN = string.IsNullOrEmpty(apContact.BranchSSIN) ? appContBuyer.BranchSSIN : apContact.BranchSSIN;
                            long? buyerAddressId = null;
                            string? buyerAddressCode = null;
                            if (!string.IsNullOrEmpty(shipToBranchSSIN))
                            {
                                var accountSSIN = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).Where(a => a.SSIN == shipToBranchSSIN).FirstOrDefaultAsync();
                                if (accountSSIN != null)
                                {
                                    var buyerAddressObj = accountSSIN.AppContactAddresses.FirstOrDefault(x => x.AddressTypeCode == "BILLING");
                                    if (buyerAddressObj != null)
                                    {
                                        buyerAddressId = buyerAddressObj.AddressId;
                                        buyerAddressCode = buyerAddressObj.AddressCode;
                                    }
                                }
                            }
                            apContact.BranchName = shipToBranch;
                            apContact.BranchSSIN = shipToBranchSSIN;
                            apContact.ContactAddressId = buyerAddressId;
                            apContact.ContactAddressCode = (string.IsNullOrEmpty(apContact.ContactAddressCode) ? buyerAddressCode : apContact.ContactAddressCode);

                            /*var shipToContact = new AppTransactionContacts
                            {
                                ContactName = appContBuyer.ContactName,
                                ContactEmail = appContBuyer.ContactEmail,
                                ContactSSIN = appContBuyer.ContactSSIN,
                                ContactPhoneTypeId = appContBuyer.ContactPhoneTypeId,
                                ContactPhoneNumber = appContBuyer.ContactPhoneNumber,
                                ContactPhoneTypeName = appContBuyer.ContactPhoneTypeName,
                                ContactAddressId = buyerAddressId,
                                ContactAddressCode = buyerAddressCode,
                                ContactRole = ContactRoleEnum.ShipToContact.ToString(),
                                CompanySSIN = appContBuyer.CompanySSIN,
                                CompanyName = appContBuyer.CompanyName,
                                BranchName = appContBuyer.BranchName,
                                BranchSSIN = appContBuyer.BranchSSIN,
                                TransactionId= appContBuyer.TransactionId

                           };*/
                            if (apContact.ContactAddressId != null)
                            {
                                var addObj = _appAddressRepository.GetAll().Where(z => z.Id == apContact.ContactAddressId).FirstOrDefault();
                                if (addObj != null)
                                {
                                    apContact.ContactAddressCode = addObj.Code;
                                    apContact.ContactAddressCity = addObj.City;
                                    apContact.ContactAddressCountryId = addObj.CountryId;
                                    apContact.ContactAddressCountryCode = addObj.CountryCode;
                                    apContact.ContactAddressCountryFk = addObj.CountryFk;
                                    apContact.ContactAddressLine1 = addObj.AddressLine1;
                                    apContact.ContactAddressLine2 = addObj.AddressLine2;
                                    apContact.ContactAddressName = addObj.Name;
                                    apContact.ContactAddressPostalCode = addObj.PostalCode;
                                    apContact.ContactAddressState = addObj.State;
                                }
                                else
                                {
                                    apContact.ContactAddressId = null;
                                    //apContact.ContactAddressCountryId = null;
                                }
                            }
                            else
                            {
                                //  if (apContact.ContactAddressCode == null)
                                //    apContact.ContactAddressCountryId = null;
                            }

                            //I45
                            if (apContact.ContactAddressCountryId == 0)
                                apContact.ContactAddressCountryId = null;
                            //I45

                            if (apContact.Id != 0)
                                await _appTransactionContactsRepository.UpdateAsync(apContact);
                            else
                            {
                                var saved = await _appTransactionContactsRepository.InsertAsync(apContact);
                                if (saved != null)
                                    apContact.Id = saved.Id;

                            }
                        }
                        //AP Contact[End]
                    }
                    //
                }
                //XX
                //XX
                if (appTrans.EntityClassifications.Count() == 0)
                {
                    await _appEntityClassificationRepository.DeleteAsync(a => a.EntityId == appTrans.Id);
                }
                else
                {
                    var classes = await _appEntityClassificationRepository.GetAll().AsNoTracking().Where(a => a.EntityId == appTrans.Id).ToListAsync();
                    if (classes != null && classes.Count() > 0)
                    {
                        foreach (var classi in classes)
                        {
                            var appClass = appTrans.EntityClassifications.FirstOrDefault(a => a.Id == classi.Id);
                            if (appClass == null)
                                await _appEntityClassificationRepository.DeleteAsync(a => a.Id == classi.Id && a.EntityId == appTrans.Id);
                            else
                                await _appEntityClassificationRepository.UpdateAsync(appClass);
                        }
                    }

                }
                if (appTrans.EntityCategories.Count() == 0)
                {
                    await _appEntityCategoryRepository.DeleteAsync(a => a.EntityId == appTrans.Id);
                }
                else
                {
                    var categories = await _appEntityCategoryRepository.GetAll().AsNoTracking().Where(a => a.EntityId == appTrans.Id).ToListAsync();
                    if (categories != null && categories.Count() > 0)
                    {
                        foreach (var cat in categories)
                        {
                            var appCat = appTrans.EntityCategories.FirstOrDefault(a => a.Id == cat.Id);
                            if (appCat == null)
                                await _appEntityCategoryRepository.DeleteAsync(a => a.Id == cat.Id && a.EntityId == appTrans.Id);
                            else
                                await _appEntityCategoryRepository.UpdateAsync(appCat);
                        }
                    }

                }

                //XX
                if (input.lFromPlaceOrder)
                {

                    await _appShoppingCartRepository.DeleteAsync(s => s.TransactionId == appTrans.Id && s.TenantId == AbpSession.TenantId && s.CreatorUserId == AbpSession.UserId);
                    //I46{Start}
                    await _appTenantActivitiesLogAppService.AddUsageActivityLog("PLACE-ORDER",
                        appTrans.Name, appTrans.Id, appTrans.EntityObjectTypeId, appTrans.EntityObjectTypeCode,
                        "Seller:" + appTrans.SellerCompanyName.Trim() + ",Buyer:" + appTrans.BuyerCompanyName.Trim(), 1);
                    //I46{End}
                    var entityObjectChargesId = await _helper.SystemTables.GetEntityObjectCharges();
                    //   if (buyerTenantId != null)
                    {
                        appTrans.AppTransactionDetails = _appTransactionDetails.GetAll().AsNoTracking()
                            .Where(z => z.TransactionId == appTrans.Id && z.ParentId == null && z.EntityObjectTypeId != entityObjectChargesId).ToList();
                        foreach (var det in appTrans.AppTransactionDetails.Where(z => z.ParentId == null))
                        {

                            await GetProductFromMarketplace(det.SSIN, int.Parse(AbpSession.TenantId.ToString()), appTrans.Id);
                            //I46[Start]
                            await _appTenantActivitiesLogAppService.AddUsageActivityLog("PLACE-ORDER-LINE",
                            appTrans.Name.Trim() + ", Line#" + det.LineNo.ToString().Trim(), det.Id, appTrans.EntityObjectTypeId, appTrans.EntityObjectTypeCode,
                            appTrans.Name.Trim() + "," + det.ManufacturerCode.Trim(), 1);
                            //I46[End]
                        }
                        #region Share transaction with invloved contacts

                        #endregion
                    }
                }
                foreach (var con in appTrans.AppTransactionContacts)
                {
                    if (con.ContactAddressCountryId == 0) con.ContactAddressCountryId = null;
                    if (!string.IsNullOrEmpty(con.CompanySSIN) && string.IsNullOrEmpty(con.CompanyCode))
                    {
                        var originalContact = await _appContactRepository.GetAll().Where(z => z.SSIN == con.CompanySSIN).FirstOrDefaultAsync();
                        if (originalContact != null)
                        {
                            con.CompanyCode = originalContact.Code;
                            con.CompanyName = originalContact.Name;
                        }
                    }
                    if (!string.IsNullOrEmpty(con.BranchSSIN) && string.IsNullOrEmpty(con.BranchCode))
                    {
                        var originalContact = await _appContactRepository.GetAll().Where(z => z.SSIN == con.BranchSSIN).FirstOrDefaultAsync();
                        if (originalContact != null)
                        {
                            con.BranchCode = originalContact.Code;
                            con.BranchName = originalContact.Name;
                        }
                    }
                    if (!string.IsNullOrEmpty(con.ContactSSIN) && string.IsNullOrEmpty(con.ContactCode))
                    {
                        var originalContact = await _appContactRepository.GetAll().Where(z => z.SSIN == con.ContactSSIN).FirstOrDefaultAsync();
                        if (originalContact != null)
                        {
                            con.ContactCode = originalContact.Code;
                            con.ContactName = originalContact.Name;
                        }
                    }
                }
                if (string.IsNullOrEmpty(appTrans.SSIN))
                {
                    var transactionObjectId = await _helper.SystemTables.GetObjectTransactionId();
                    appTrans.SSIN = (input.TransactionType == TransactionType.SalesOrder ? "SO-" : "PO-") + await _helper.SystemTables.GenerateSSIN(transactionObjectId, ObjectMapper.Map<AppEntityDto>(appTrans));
                }
                //Iteration45[Start]         
                appTrans.TimeStamp = DateTime.UtcNow;
                //Iteration45[End]
                if (appTrans.ShipViaId != null)
                {
                    var ent = await _appEntity.GetAll().Where(z => z.Id == appTrans.ShipViaId).FirstOrDefaultAsync();
                    if (ent != null)
                        appTrans.ShipViaName = ent.Name;
                }
                if (appTrans.PaymentTermsId != null)
                {
                    var ent = await _appEntity.GetAll().Where(z => z.Id == appTrans.PaymentTermsId).FirstOrDefaultAsync();
                    if (ent != null)
                        appTrans.PaymentTermsName = ent.Name;
                }
                //log[start]
                //var openStatus = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                //if (input.lFromPlaceOrder || (appTrans.EntityObjectStatusId == openStatus))
                //{
                //    var statusCode = await _helper.SystemTables.GetEntityObjectStatusReadyToSendEntityLog();
                //    var logExist = await _appEntityLogRepository.GetAll().Where(z => z.EntityId == appTrans.Id &&
                //    z.TenantId == AbpSession.TenantId && z.EntityObjectTypeId == appTrans.EntityObjectTypeId &&
                //    z.EntityObjectStatusId == statusCode
                //    ).FirstOrDefaultAsync();
                //    if (logExist != null)
                //    {

                //       // logExist.EntityObjectStatusId = statusCode;
                //       // logExist.EntityObjectStatusCode = "Ready to be Sent";
                //       // await _appEntityLogRepository.UpdateAsync(logExist);
                //    }
                //    else
                //    {
                //        logExist = new AppEntityLog();
                //       // var statusCode =await _helper.SystemTables.GetEntityObjectStatusReadyToSendEntityLog();
                //        logExist.EntityObjectStatusId  = statusCode;
                //        logExist.EntityObjectStatusCode= "Ready to be Sent";
                //        logExist.EntityId = appTrans.Id;
                //        logExist.EntityCode = appTrans.Code;
                //        logExist.EntityObjectTypeId = appTrans.EntityObjectTypeId;
                //        logExist.EntityObjectTypeCode = appTrans.EntityObjectTypeCode;
                //        logExist.PartnerCode = "ARIAERP";
                //        logExist.TenantId =int.Parse(AbpSession.TenantId.ToString());
                //        logExist.ObjectId = appTrans.ObjectId;
                //        logExist.ObjectCode = "TRANSACTION";
                //        await _appEntityLogRepository.InsertAsync(logExist);

                //    }
                //}
                //log[End]



                appTrans.EnteredDate = input.EnteredDate;
                var obj = await _appTransactionsHeaderRepository.UpdateAsync(appTrans);
                await CurrentUnitOfWork.SaveChangesAsync();
                UpdateAppEntityLog(obj.Id);

                #region calculate charges
                if (input.lFromPlaceOrder)
                {
                    await AddTransactionCharges(obj.Id);
                }
                #endregion
                if (input.lFromPlaceOrder)
                {
                    var returnUserList  = DefaultTransactionSharing(obj.Id);
                    if (returnUserList != null && returnUserList.Count > 0)
                    {
                        SharingTransactionOptions optionsDto = new SharingTransactionOptions
                        {
                            TransactionId = obj.Id,
                        };
                        optionsDto.TransactionSharing = new List<TransactionSharingDto>();
                        using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                        {
                            foreach (var user in returnUserList)
                            {
                                var userObj = await UserManager.GetUserByIdAsync(user);
                                if (userObj != null)
                                    optionsDto.TransactionSharing.Add(new TransactionSharingDto { SharedUserId = user, SharedTenantId = userObj.TenantId });
                            }
                        }
                        optionsDto.Message = "";
                        await ShareTransactionByMessage(optionsDto);
                    }
                }
                return obj.Id;
            }
            

        }

        public async Task<GetAppTransactionsForViewDto> __GetAppTransactionsForView(long transactionId, GetAllAppTransactionsInputDto? input, TransactionPosition? position)
        {

            //XX
            var transOrg = await _appTransactionsHeaderRepository.GetAll()
                .Where(a => a.Id == transactionId).FirstOrDefaultAsync();
            if (input != null)
            {
                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionContacts)
                .Include(a => a.AppTransactionDetails)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Name.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                            .WhereIf(input.FromCreationDateFilter != null, e => e.CreationTime >= input.FromCreationDateFilter)
                            .WhereIf(input.ToCreationDateFilter != null, e => e.CreationTime <= input.ToCreationDateFilter)
                            .WhereIf(input.FromCompleteDateFilter != null, e => e.CompleteDate >= input.FromCompleteDateFilter)
                            .WhereIf(input.ToCompleteDateFilter != null, e => e.CompleteDate <= input.ToCompleteDateFilter)
                            .WhereIf(input.StatusId > 0, e => e.EntityObjectStatusId == input.StatusId)
                            .WhereIf(input.EntityTypeIdFilter > 0, e => e.EntityObjectTypeId == input.EntityTypeIdFilter)
                            .WhereIf(!string.IsNullOrEmpty(input.BuyerSSIN), e => e.BuyerContactSSIN == input.BuyerSSIN)
                            .WhereIf(!string.IsNullOrEmpty(input.SellerSSIN), e => e.SellerContactSSIN == input.SellerSSIN)
                            .WhereIf(!string.IsNullOrEmpty(input.SellerName), e => e.SellerCompanyName.Contains(input.SellerName))
                            .WhereIf(!string.IsNullOrEmpty(input.BuyerName), e => e.BuyerCompanyName.Contains(input.BuyerName))
                            .Where(e => !(e.CreatorUserId != AbpSession.UserId && e.EntityObjectStatusId == entityObjectStatusId))
                            ;
                if ((input.Sorting ?? "Id") == "Id")
                {
                    var param = Expression.Parameter(typeof(AppTransactionHeaders));

                    var nextCondition =
                          Expression.Lambda<Func<AppTransactionHeaders, bool>>(
                              Expression.GreaterThan(
                                  Expression.Property(param, (input.Sorting ?? "Id")),
                                  Expression.Constant(transOrg.GetType().GetProperty(input.Sorting ?? "Id").GetValue(transOrg))),
                              param
                          ).Compile();

                    var PrevCondition =
                         Expression.Lambda<Func<AppTransactionHeaders, bool>>(
                             Expression.LessThan(
                                 Expression.Property(param, (input.Sorting ?? "Id")),
                                 Expression.Constant(transOrg.GetType().GetProperty(input.Sorting ?? "Id").GetValue(transOrg))),
                             param
                         ).Compile();
                    AppTransactionHeaders FilteredAppTransaction = null;
                    if (position == TransactionPosition.Next)

                        FilteredAppTransaction = filteredAppTransactions
                            .OrderBy(input.Sorting ?? "id asc")
                            .WhereIf(position != null && position == TransactionPosition.Next, nextCondition).FirstOrDefault();

                    if (position == TransactionPosition.Previous)
                        FilteredAppTransaction = filteredAppTransactions
                          .OrderBy(input.Sorting ?? "id asc")
                      .WhereIf(position != null && position == TransactionPosition.Previous, PrevCondition).LastOrDefault();


                    if (FilteredAppTransaction != null)
                    {
                        var viewTrans = ObjectMapper.Map<GetAppTransactionsForViewDto>(FilteredAppTransaction);
                        // var en = new System.Globalization.CultureInfo("en-US");
                        var PrevConditionA =
                        Expression.Lambda<Func<AppTransactionHeaders, bool>>(
                            Expression.LessThan(
                                Expression.Property(param, (input.Sorting ?? "Id")),
                                Expression.Constant(FilteredAppTransaction.GetType().GetProperty(input.Sorting ?? "Id").GetValue(FilteredAppTransaction))),
                            param
                        ).Compile();

                        var FilteredAppTransactionPrev = filteredAppTransactions
                       .OrderBy(input.Sorting ?? "id asc")
                       .Where(PrevConditionA).LastOrDefault();

                        if (FilteredAppTransactionPrev == null)
                            viewTrans.FirstRecord = true;

                        var nextConditionA =
                            Expression.Lambda<Func<AppTransactionHeaders, bool>>(
                                Expression.GreaterThan(
                                    Expression.Property(param, (input.Sorting ?? "Id")),
                                    Expression.Constant(FilteredAppTransaction.GetType().GetProperty(input.Sorting ?? "Id").GetValue(FilteredAppTransaction))),
                                param
                            ).Compile();

                        var FilteredAppTransactionNext = filteredAppTransactions
                       .OrderBy(input.Sorting ?? "id asc")
                       .Where(nextConditionA).FirstOrDefault();
                        if (FilteredAppTransactionNext == null)
                            viewTrans.LastRecord = true;

                        return viewTrans;
                    }

                }
                else
                {
                    //xx

                    AppTransactionHeaders FilteredAppTransaction = null;
                    if (position == TransactionPosition.Next)

                        FilteredAppTransaction = filteredAppTransactions
                            .OrderBy(input.Sorting ?? "id asc")
                            .WhereIf(position != null && position == TransactionPosition.Next,
                            x => x.GetType().GetProperty(input.Sorting ?? "Id").GetValue(x).ToString().CompareTo(
                            transOrg.GetType().GetProperty(input.Sorting ?? "Id").GetValue(transOrg).ToString()) < 0).FirstOrDefault();

                    //if (position == TransactionPosition.Previous)
                    // FilteredAppTransaction = filteredAppTransactions
                    //      .OrderBy(input.Sorting ?? "id asc")
                    //   .WhereIf(position != null && position == TransactionPosition.Previous, PrevCondition).LastOrDefault();

                    var param = Expression.Parameter(typeof(AppTransactionHeaders));

                    if (FilteredAppTransaction != null)
                    {
                        var viewTrans = ObjectMapper.Map<GetAppTransactionsForViewDto>(FilteredAppTransaction);
                        // var en = new System.Globalization.CultureInfo("en-US");
                        var PrevConditionA =
                        Expression.Lambda<Func<AppTransactionHeaders, bool>>(
                            Expression.LessThan(
                                Expression.Property(param, (input.Sorting ?? "Id")),
                                Expression.Constant(FilteredAppTransaction.GetType().GetProperty(input.Sorting ?? "Id").GetValue(FilteredAppTransaction))),
                            param
                        ).Compile();

                        var FilteredAppTransactionPrev = filteredAppTransactions
                       .OrderBy(input.Sorting ?? "id asc")
                       .Where(PrevConditionA).LastOrDefault();

                        if (FilteredAppTransactionPrev == null)
                            viewTrans.FirstRecord = true;

                        var nextConditionA =
                            Expression.Lambda<Func<AppTransactionHeaders, bool>>(
                                Expression.GreaterThan(
                                    Expression.Property(param, (input.Sorting ?? "Id")),
                                    Expression.Constant(FilteredAppTransaction.GetType().GetProperty(input.Sorting ?? "Id").GetValue(FilteredAppTransaction))),
                                param
                            ).Compile();

                        var FilteredAppTransactionNext = filteredAppTransactions
                       .OrderBy(input.Sorting ?? "id asc")
                       .Where(nextConditionA).FirstOrDefault();
                        if (FilteredAppTransactionNext == null)
                            viewTrans.LastRecord = true;

                        return viewTrans;

                        //xx
                    }
                }
                //else
                //  return null;
                //transactionId = 
            }
            //XX

            var trans = await _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionContacts)
                .Include(a => a.AppTransactionDetails).Where(a => a.Id == transactionId).FirstOrDefaultAsync();
            if (trans != null)
            {
                return ObjectMapper.Map<GetAppTransactionsForViewDto>(trans);
            }
            return null;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public async Task<string> GetNextOrderNumber(string tranType)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                string returnString = "";
                var objectRec = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == (tranType == "SO" ? "SALESORDER" : "PURCHASEORDER"));
                if (objectRec != null)
                {
                    //XX
                    var header = await _appTransactionsHeaderRepository.GetAll()
                        .Where(x => x.EntityObjectTypeId == objectRec.Id && x.EntityObjectStatusId == null && x.TenantId == AbpSession.TenantId &&
                        (AbpSession.UserId == x.CreatorUserId || (AbpSession.UserId != x.CreatorUserId && x.CreationTime.AddDays(1) <= DateTime.Now)))
                        .FirstOrDefaultAsync();
                    if (header != null)
                    {
                        return header.Code;
                    }
                    //XX
                    var Id = objectRec.SycIdentifierDefinitionId;
                    if (Id != null)
                    {
                        var sycSegmentIdentifierDefinitions = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == Id).OrderBy(x => x.SegmentNumber).ToList();
                        if (sycSegmentIdentifierDefinitions != null && sycSegmentIdentifierDefinitions.Count > 0)
                        {
                            foreach (var segment in sycSegmentIdentifierDefinitions)
                            {
                                if (segment.IsAutoGenerated && segment.SegmentType == "Sequence")
                                {
                                    var sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == AbpSession.TenantId).FirstOrDefault();
                                    if (sycCounter == null)
                                    {
                                        sycCounter = new SycCounter();
                                        sycCounter.SycSegmentIdentifierDefinitionId = segment.Id;
                                        sycCounter.Counter = segment.CodeStartingValue + 1;
                                        if (AbpSession.TenantId != null)
                                        {
                                            sycCounter.TenantId = (int?)AbpSession.TenantId;
                                        }
                                        await _sycCounter.InsertAsync(sycCounter);
                                        await CurrentUnitOfWork.SaveChangesAsync();
                                        //returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                        if (segment.SegmentLength > 0)
                                        { returnString += segment.CodeStartingValue.ToString().Trim(); } //.PadLeft(segment.SegmentLength, '0')
                                    }
                                    else
                                    {
                                        //returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                        if (segment.SegmentLength > 0)
                                        { returnString += sycCounter.Counter.ToString().Trim(); }//.PadLeft(segment.SegmentLength, '0')

                                        sycCounter.Counter += 1;
                                        await _sycCounter.UpdateAsync(sycCounter);
                                        await CurrentUnitOfWork.SaveChangesAsync();

                                    }
                                }
                                //else
                                //{
                                //    if (segment.SegmentType == "Field")
                                //    {
                                //        if (segment.LookOrFieldName.ToUpper() == "TENANTID")
                                //        {
                                //            returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";

                                //            string _segmentValue = AbpSession.TenantId.ToString();
                                //            if (segment.SegmentLength > 0)
                                //            { _segmentValue = _segmentValue.PadLeft(segment.SegmentLength, '0'); }
                                //            returnString += _segmentValue;

                                //            //returnString += AbpSession.TenantId.ToString().PadLeft(segment.SegmentLength, '0');
                                //        }
                                //        else
                                //        {
                                //            if (appEntity != null)
                                //            {
                                //                var prop = appEntity.GetType().GetProperty(segment.LookOrFieldName);
                                //                if (prop != null)
                                //                {
                                //                    returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                //                    string _segmentFieldValue = prop.GetValue(appEntity).ToString();
                                //                    if (segment.SegmentLength > 0)
                                //                    { _segmentFieldValue = _segmentFieldValue.PadLeft(segment.SegmentLength, '0'); }
                                //                    returnString += _segmentFieldValue;

                                //                }
                                //            }
                                //        }
                                //    }
                                //}
                                //}
                            }
                        }
                    }

                }
                //XX
                AppTransactionHeaders trans = new AppTransactionHeaders();
                if (tranType == "SO")
                {
                    trans.Name = "Sales Order#" + returnString.TrimEnd();
                    //input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
                }
                else
                {
                    trans.Name = "Purchase Order#" + returnString.TrimEnd();
                    //input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
                }
                trans.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                trans.ObjectId = await _helper.SystemTables.GetObjectTransactionId();
                trans.Id = 0;
                trans.Code = returnString;
                trans.TenantId = AbpSession.TenantId;
                trans.EntityObjectStatusId = null;
                trans.EntityObjectTypeId = objectRec.Id;
                var transactionObjectId = await _helper.SystemTables.GetObjectTransactionId();
                trans.SSIN = tranType + "-" + await _helper.SystemTables.GenerateSSIN(transactionObjectId, null);
                await _appTransactionsHeaderRepository.InsertAsync(trans);
                await CurrentUnitOfWork.SaveChangesAsync();
                //XX
                return returnString;
            }
        }

        public async Task<GetAccountInformationOutputDto> GetCurrentTenantAccountProfileInformation()
        {
            GetAccountInformationOutputDto returnObject = new GetAccountInformationOutputDto();
            var account = await _appContactRepository.GetAll().Include(a => a.CurrencyFk).ThenInclude(z => z.EntityExtraData).FirstOrDefaultAsync(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == true &
            a.ParentId == null);
            if (account != null)
            {
                returnObject.Id = account.Id;
                returnObject.Name = account.Name;
                returnObject.AccountSSIN = account.SSIN;
                returnObject.CurrencyCode = new CurrencyInfoDto
                {
                    Code = account.CurrencyFk != null ? account.CurrencyFk.Code : "",
                    Value = account.CurrencyId != null ? (long)account.CurrencyId : 0,
                    Label = account.CurrencyFk != null ? account.CurrencyFk.Name : "",
                    Symbol = (account.CurrencyFk != null && account.CurrencyFk.EntityExtraData != null) &&
                        account.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41) != null ?
                        account.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : ""
                };
                returnObject.Email = account.EMailAddress;
                returnObject.Phone = !string.IsNullOrEmpty(account.Phone1Number) ? account.Phone1Number :
                (!string.IsNullOrEmpty(account.Phone2Number) ? account.Phone2Number :
                (!string.IsNullOrEmpty(account.Phone3Number) ? account.Phone3Number : null));

                returnObject.PhoneTypeId = !string.IsNullOrEmpty(account.Phone1Number) ? account.Phone1TypeId :
                 (!string.IsNullOrEmpty(account.Phone2Number) ? account.Phone2TypeId :
                 (!string.IsNullOrEmpty(account.Phone3Number) ? account.Phone3TypeId : null));
                returnObject.PhoneTypeName = !string.IsNullOrEmpty(account.Phone1Number) ? account.Phone1TypeName :
                (!string.IsNullOrEmpty(account.Phone2Number) ? account.Phone2TypeName :
                (!string.IsNullOrEmpty(account.Phone3Number) ? account.Phone3TypeName : null));
            }
            return returnObject;

        }
        public async Task<List<GetContactInformationDto>> GetAccountRelatedContacts(long accountId, string filter)
        {
            var activeRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            List<GetContactInformationDto> returnObjectList = new List<GetContactInformationDto>();
            var accountObject = await _appContactRepository.GetAll().Where(z => z.Id == accountId).FirstOrDefaultAsync();
            var accountsList = _appContactRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(filter), a => a.Name.ToLower().Contains(filter.ToLower()))
                .Where(a => a.TenantId == AbpSession.TenantId //& a.ParentId != null
                 & a.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId
                & (//a.AccountId == accountId &&
                    _appContactRelationshipInfoRepository.GetAll().Count(z => z.RequesterContactSSIN == accountObject.SSIN &&
                    z.RecipientContactSSIN == a.SSIN && z.ConsiderAsTeamMember == true && z.EntityObjectStatusId == activeRealtionshipStatusId) > 0)
                );


            var pagedAndFilteredAccounts = accountsList.OrderBy("name asc");


            var _accounts = from o in pagedAndFilteredAccounts
                            select new GetContactInformationDto()
                            {
                                Code = o.Code,
                                Id = o.Id,
                                Name = o.Name,
                                Email = o.EMailAddress,
                                Phone = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1Number :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2Number :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3Number : null)),
                                SSIN = o.SSIN,
                                PhoneTypeId = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1TypeId :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2TypeId :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3TypeId : null)),
                                PhoneTypeName = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1TypeName :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2TypeName :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3TypeName : null))

                            };
            var accounts = await _accounts.ToListAsync();
            foreach (var con in accounts)
            {
                var acc = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.Id == con.Id);
                con.PhoneList = new List<PhoneNumberAndtype>();
                if (acc.Phone1TypeId != null)
                {
                    PhoneNumberAndtype phone = new PhoneNumberAndtype();
                    phone.PhoneNumber = acc.Phone1Number;
                    phone.PhoneTypeName = acc.Phone1TypeName;
                    phone.PhoneTypeId = acc.Phone1TypeId;
                    con.PhoneList.Add(phone);
                }
                if (acc.Phone2TypeId != null)
                {
                    PhoneNumberAndtype phone = new PhoneNumberAndtype();
                    phone.PhoneNumber = acc.Phone2Number;
                    phone.PhoneTypeName = acc.Phone2TypeName;
                    phone.PhoneTypeId = acc.Phone2TypeId;
                    con.PhoneList.Add(phone);

                }
                if (acc.Phone3TypeId != null)
                {
                    PhoneNumberAndtype phone = new PhoneNumberAndtype();
                    phone.PhoneNumber = acc.Phone3Number;
                    phone.PhoneTypeName = acc.Phone3TypeName;
                    phone.PhoneTypeId = acc.Phone3TypeId;
                    con.PhoneList.Add(phone);

                }
            }
            return accounts;

        }
        /*
        public async Task<PagedResultDto<GetAccountInformationOutputDto>> GetRelatedAccounts(GetAllAccountsInput accountFilter, bool? lExclueMyAcc = false, string? transactionType = null)
        {

            var partnerEntityObjectType = await _helper.SystemTables.GetEntityObjectTypeParetner();
            //T-SII-20240610.0002
            //var manualAccountEntityObjectType = await _helper.SystemTables.GetEntityObjectTypeManual();

            //T-SII-20240103.0001,1 MMT 01/04/2024 - Transactions - (Order info) and(Buyer / Seller Contact Info) accordions are not show the company information[Start]
            AppContact myAccount = null;
            if (lExclueMyAcc == true)
                //T-SII-20240103.0001,1 MMT 01/04/2024 -Transactions- (Order info) and ( Buyer/Seller Contact Info) accordions are not show the company information[End]
                //T-SII-20231110.0003,1 MMT 12/14/2023 - my tenant account is considered as manual account in the company dropdown in the transaction[Start]
                myAccount = await _appContactRepository.GetAll().Include(a => a.CurrencyFk)
                .ThenInclude(z => z.EntityExtraData).FirstOrDefaultAsync(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == true &
                 a.ParentId == null);
            //T-SII-20231110.0003,1 MMT 12/14/2023 - my tenant account is considered as manual account in the company dropdown in the transaction[End]
            List<GetAccountInformationOutputDto> returnObjectList = new List<GetAccountInformationOutputDto>();
            var accountsList = _appContactRepository.GetAll().Include(a => a.CurrencyFk).ThenInclude(z => z.EntityExtraData)
                .WhereIf(!string.IsNullOrEmpty(accountFilter.Filter), a => a.Name.ToLower().Contains(accountFilter.Filter.ToLower()))
                //T-SII-20231110.0003,1 MMT 12/14/2023 - my tenant account is considered as manual account in the company dropdown in the transaction[Start]
                .WhereIf(myAccount != null, z => z.Id != myAccount.Id)
                //T-SII-20231110.0003,1 MMT 12/14/2023 - my tenant account is considered as manual account in the company dropdown in the transaction[End]
                .Where(a => a.TenantId == AbpSession.TenantId & a.ParentId == null &&
                        ((string.IsNullOrEmpty(transactionType) || transactionType == "SO") ? (a.EntityFk.EntityObjectTypeId == partnerEntityObjectType.Id) :
                         (a.EntityFk.EntityObjectTypeId == partnerEntityObjectType.Id) && _appMarketplaceContactRepository.GetAll().Count(z => z.SSIN == a.SSIN) > 0));

            //&& (a.EntityFk.EntityObjectTypeId == partnerEntityObjectType.Id || ((string.IsNullOrEmpty(transactionType) || transactionType =="PO") ? false :a.EntityFk.EntityObjectTypeId == manualAccountEntityObjectType.Id)));


            var pagedAndFilteredAccounts = accountsList.OrderBy(accountFilter.Sorting ?? "name asc");
            // .PageBy(accountFilter);


            var _accounts = from o in pagedAndFilteredAccounts
                            select new GetAccountInformationOutputDto()
                            {
                                Id = o.Id,
                                Code = o.Code,
                                Name = o.Name.TrimEnd(),
                                CurrencyCode = new CurrencyInfoDto
                                {
                                    Code = o.CurrencyId != null ? o.CurrencyFk.Code : "",
                                    Value = o.CurrencyId != null ? (long)o.CurrencyId : 0,
                                    Label = o.CurrencyFk == null ? "" : o.CurrencyFk.Name,
                                    Symbol = (o.CurrencyFk != null && o.CurrencyFk.EntityExtraData != null) &&
                                o.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41) != null ?
                                o.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : ""
                                },
                                AccountSSIN = o.SSIN,
                                Email = o.EMailAddress,
                                Phone = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1Number :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2Number :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3Number : null)),
                                PhoneTypeId = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1TypeId :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2TypeId :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3TypeId : null)),
                                PhoneTypeName = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1TypeName :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2TypeName :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3TypeName : null))
                            };
            var accounts = await _accounts.ToListAsync();
            var totalCount = await accountsList.CountAsync();
            var x = new PagedResultDto<GetAccountInformationOutputDto>(
                totalCount,
                accounts
            );

            return x;

        }
        */

        public async Task<PagedResultDto<GetAccountInformationOutputDto>> GetRelatedAccounts(GetAllAccountsInput accountFilter, bool? lExclueMyAcc = false, string? transactionType = null, string? selectedAccountRole = null)
        {
            if (string.IsNullOrEmpty(selectedAccountRole))
            {
                if (!string.IsNullOrEmpty(transactionType) && transactionType == "PO")
                {
                    selectedAccountRole = "Buyer";
                }
                else
                {
                    selectedAccountRole = "Seller";
                }
            }
            else
            {
                if (selectedAccountRole.Contains("Buyer"))
                {
                    selectedAccountRole = "Buyer";
                }
                if (selectedAccountRole.Contains("Seller"))
                {
                    selectedAccountRole = "Seller";
                }
            }
            if (selectedAccountRole != "Seller" && selectedAccountRole != "Buyer")
            {
                selectedAccountRole = (!string.IsNullOrEmpty(transactionType) && transactionType == "SO") ? "Seller" : "Buyer";
            }
            transactionType = (!string.IsNullOrEmpty(transactionType) && transactionType == "PO") ? "Seller" : "Buyer";
            var activeRelationshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
            var currentAccount = await _appContactRepository.GetAll().Include(z => z.EntityFk)
                .Where(z => z.TenantId == AbpSession.TenantId
                && z.IsProfileData == true
                && z.ParentId == null && z.ParentId == null)
                .FirstOrDefaultAsync();

            var ssin = currentAccount?.SSIN ?? "";

            var relationships = _appContactRelationshipInfoRepository.GetAll()
                .Where(r => (r.RelationshipEndDate == null || r.RelationshipEndDate < DateTime.Now) &&
                r.EntityObjectStatusId== activeRelationshipStatusId &&
                (
                (r.RequesterContactSSIN == ssin &&
                ((selectedAccountRole == "Seller"|| selectedAccountRole == "Buyer") ? r.RequesterMarketplaceRole== selectedAccountRole: true)
                &&
                (r.RecipientMarketplaceRole == transactionType  
                )
                )
                  ||
                 (r.RecipientContactSSIN == ssin &&
                 ((selectedAccountRole == "Seller" || selectedAccountRole == "Buyer") ? r.RecipientMarketplaceRole == selectedAccountRole : true) 
                 && 
                 (r.RequesterMarketplaceRole == transactionType  
                 )
                 ))
                  );

            var relatedAccountsQuery = _appContactRepository.GetAll()
                .Include(z => z.EntityFk)
                .Include(a => a.CurrencyFk).ThenInclude(z => z.EntityExtraData)
                .Where(z => z.TenantId == AbpSession.TenantId && z.EntityFk.TenantOwner != AbpSession.TenantId)
                .Where(z => relationships.Any(r =>
                    (r.RequesterContactSSIN == ssin && r.RecipientContactSSIN == z.SSIN) ||
                    (r.RecipientContactSSIN == ssin && r.RequesterContactSSIN == z.SSIN)
                ));

            var results = await (from z in relatedAccountsQuery
                                 from r in relationships
                                 where (r.RequesterContactSSIN == ssin && r.RecipientContactSSIN == z.SSIN) ||
                                       (r.RecipientContactSSIN == ssin && r.RequesterContactSSIN == z.SSIN)
                                 select new GetAccountInformationOutputDto
                                 {
                                     Id = z.Id,
                                     RelationId = r.Id,
                                     Name = z.Name.TrimEnd(),
                                     AccountSSIN = z.SSIN,
                                     Code = z.Code,
                                     Role = (r.RequesterContactSSIN == ssin ? r.RecipientContactTypeCode : r.RequesterContactTypeCode),
                                     CurrencyCode = new CurrencyInfoDto
                                     {
                                         Code = z.CurrencyId != null ? z.CurrencyFk.Code : "",
                                         Value = z.CurrencyId != null ? (long)z.CurrencyId : 0,
                                         Label = z.CurrencyFk == null ? "" : z.CurrencyFk.Name,
                                         Symbol = (z.CurrencyFk != null && z.CurrencyFk.EntityExtraData != null) &&
                                                  z.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41) != null ?
                                                  z.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : ""
                                     },
                                     Email = z.EMailAddress,
                                     Phone = !string.IsNullOrEmpty(z.Phone1Number) ? z.Phone1Number :
                                             (!string.IsNullOrEmpty(z.Phone2Number) ? z.Phone2Number :
                                             (!string.IsNullOrEmpty(z.Phone3Number) ? z.Phone3Number : null)),
                                     PhoneTypeId = !string.IsNullOrEmpty(z.Phone1Number) ? z.Phone1TypeId :
                                                  (!string.IsNullOrEmpty(z.Phone2Number) ? z.Phone2TypeId :
                                                  (!string.IsNullOrEmpty(z.Phone3Number) ? z.Phone3TypeId : null)),
                                     PhoneTypeName = !string.IsNullOrEmpty(z.Phone1Number) ? z.Phone1TypeName :
                                                    (!string.IsNullOrEmpty(z.Phone2Number) ? z.Phone2TypeName :
                                                    (!string.IsNullOrEmpty(z.Phone3Number) ? z.Phone3TypeName : null))
                                 }).ToListAsync();

            return new PagedResultDto<GetAccountInformationOutputDto>(results.Count, results);
        }

        //tenantCurrencyInfoDto.Code = account.CurrencyFk.Code;
        //            tenantCurrencyInfoDto.Value = account.CurrencyFk.Id;
        //            tenantCurrencyInfoDto.Label = account.CurrencyFk.Name;
        //            tenantCurrencyInfoDto.Symbol = account.CurrencyFk != null & account.CurrencyFk.EntityExtraData != null & account.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41) != null ? account.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : "";

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<PagedResultDto<GetAllAppTransactionsForViewDto>> GetAll(GetAllAppTransactionsInputDto input)
        {
            
            var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
            if (input.fromExport)
            {
                if (input.StatusId == 0)
                {
                    input.StatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                }
                if (input.EntityTypeIdFilter == 0 || input.EntityTypeIdFilter == null)
                {
                    input.EntityTypeIdFilter = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
                }
                //log[Start]
                var statusCode = await _helper.SystemTables.GetEntityObjectStatusReadyToSendEntityLog();
                var notSentTransactions = _appEntityLogRepository.GetAll().Where(z => z.TenantId == AbpSession.TenantId &&
                z.EntityObjectTypeId == input.EntityTypeIdFilter && z.EntityObjectStatusId == statusCode);
                var idList = new List<string>();
                if (!string.IsNullOrEmpty(input.At_Id))
                {
                    idList = input.At_Id.Split(',').ToList();
                }

                //log[End]
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll()
                    .Include(x => x.AppTransactionContacts).ThenInclude(s => s.ContactAddressFk)
                    .Include(z => z.AppTransactionDetails.Where(x => input.hasParentItems == false ? x.ParentId != null : true))
                    .Include(z => z.PaymentTermsFk).ThenInclude(z => z.EntityExtraData)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Name.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                            .WhereIf(input.FromCreationDateFilter != null, e => e.CreationTime >= input.FromCreationDateFilter)
                            .WhereIf(input.ToCreationDateFilter != null, e => e.CreationTime <= input.ToCreationDateFilter)
                            .WhereIf(input.FromCompleteDateFilter != null, e => e.CompleteDate >= input.FromCompleteDateFilter)
                            .WhereIf(input.ToCompleteDateFilter != null, e => e.CompleteDate <= input.ToCompleteDateFilter)
                            .WhereIf(input.StatusId > 0, e => e.EntityObjectStatusId == input.StatusId)
                            .WhereIf(!string.IsNullOrEmpty(input.ReferenceFilter), z => z.Reference.Contains(input.ReferenceFilter))
                            .WhereIf(input.EntityTypeIdFilter > 0, e => e.EntityObjectTypeId == input.EntityTypeIdFilter)
                            .WhereIf(!string.IsNullOrEmpty(input.BuyerSSIN), e => e.BuyerContactSSIN == input.BuyerSSIN)
                            .WhereIf(!string.IsNullOrEmpty(input.SellerSSIN), e => e.SellerContactSSIN == input.SellerSSIN)
                            .WhereIf(!string.IsNullOrEmpty(input.SellerName), e => e.SellerCompanyName.Contains(input.SellerName))
                            .WhereIf(!string.IsNullOrEmpty(input.BuyerName), e => e.BuyerCompanyName.Contains(input.BuyerName))
                            // .WhereIf(input.Since_Id > 0, e => e.Id > input.Since_Id)
                            .Where(e => !(e.CreatorUserId != AbpSession.UserId && e.EntityObjectStatusId == entityObjectStatusId)
                                        && e.EntityObjectStatusId != null && e.TenantId == AbpSession.TenantId)
                            ;


                var pagedAndFilteredAppTransactions = filteredAppTransactions.Join(notSentTransactions, s => s.Id, sa => sa.EntityId,
                     (s, sa) => new { apptransaction = s, log = sa, id = s.Id })
                    .OrderBy(input.Sorting ?? "id asc")
                    .PageBy(input);

                //var appTransactions = from o in pagedAndFilteredAppTransactions
                //                      select new GetAllAppTransactionsForViewDto()
                //                      {
                //                          AppTransaction = new AppTransactionDto
                //                          {
                //                              Code = o.Code,
                //                              Date = o.Date,
                //                              AddDate = o.AddDate,
                //                              EndDate = o.EndDate,
                //                              Id = o.Id
                //                          }
                //                      };


                var pagedAndFilteredAppTransactionsRes = from e in pagedAndFilteredAppTransactions//.Include(z => z.apptransaction.AppTransactionContacts)
                                                                                                  // .ThenInclude(z => z.ContactAddressFk)
                                                                                                  //.Include(z => z.apptransaction.AppTransactionDetails
                                                                                                  //.Where(x => input.hasParentItems == false ? x.ParentId != null : true))
                                                         join
                                                         x in _appContactRepository.GetAll().Where(s => s.TenantId == AbpSession.TenantId) on
                                                         e.apptransaction.SellerCompanySSIN.Trim() equals x.SSIN.Trim()
                                                         join
                                                         s in _appContactRepository.GetAll().Where(s => s.TenantId == AbpSession.TenantId) on
                                                         e.apptransaction.BuyerCompanySSIN.Trim() equals s.SSIN.Trim() into j
                                                         from a in j.DefaultIfEmpty()
                                                         select new { Trans = e.apptransaction, TranSellerCode = x.Code, TranBuyerCode = a.Code, Log = e.log };



                //     var pagedAndFilteredAppTransactionsRes2 = pagedAndFilteredAppTransactionsRes.Join(_appContactRepository.GetAll().Where(s => s.TenantId == AbpSession.TenantId),
                //   x => x.trans.BuyerCompanySSIN.Trim(), sa => sa.SSIN.Trim(), (s, sa) => new { trans = s, buyerCode = sa.Code });
                var items = await pagedAndFilteredAppTransactionsRes.ToListAsync();
                var totalCount = items.DistinctBy(e => e.Trans).Count();
                var objList = items.DistinctBy(e => e.Trans).ToList();
                var statusSentCode = await _helper.SystemTables.GetEntityObjectStatusSentEntityLog();
                objList.ForEach(a => a.Log.EntityObjectStatusId = statusSentCode);
                objList.ForEach(a => a.Log.EntityObjectStatusCode = "Sent");
                objList.ForEach(a => a.Log.SentDate = DateTime.Now);
                // remove parent items from export based on parameter [Begin]
                if (input.hasParentItems == false)
                {
                    foreach (var transactions in objList)
                    {
                        //  transactions.Log.ReadyToBeSent = false;
                        // transactions.Log.SentDate = DateTime.Now;
                        var parentItems = transactions.Trans.AppTransactionDetails.Where(e => e.ParentId == null).ToList();
                        foreach (var parentItem in parentItems)
                        {
                            transactions.Trans.AppTransactionDetails.Remove(parentItem);

                        }
                    }
                }

                // remove parent items from export based on parameter [End]    

                var appTrans = objList.Select(x =>
                {
                    GetAllAppTransactionsForViewDto y = ObjectMapper.Map<GetAllAppTransactionsForViewDto>(x.Trans);
                    y.SellerCode = x.TranSellerCode;
                    y.BuyerCode = x.TranBuyerCode;
                    y.Eom = x.Trans.PaymentTermsFk != null && x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 32) != null ? (x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 32).AttributeValue.ToLower() == "true" ? true : false) : false;
                    y.PaymentDiscount = x.Trans.PaymentTermsFk != null && x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 30) != null ? decimal.Parse(x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 30).AttributeValue) : 0;
                    y.DiscountDays = x.Trans.PaymentTermsFk != null && x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 31) != null ? int.Parse(x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 31).AttributeValue) : 0;
                    y.EomDays = x.Trans.PaymentTermsFk != null && x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 33) != null ? int.Parse(x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 33).AttributeValue) : 0;
                    y.NetDueDays = x.Trans.PaymentTermsFk != null && x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 34) != null ? int.Parse(x.Trans.PaymentTermsFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 34).AttributeValue) : 0;
                    // y.AppTransactionContacts.ForEach(z => z.ContactAddressDetail.ContactEmail = z.ContactEmail);
                    // y.AppTransactionContacts.ForEach(z => z.ContactAddressDetail.ContactPhone = z.ContactPhoneNumber);
                    if (x.Trans.AppTransactionContacts != null)
                    {
                        foreach (var cnt in y.AppTransactionContacts)
                        {
                            var d = x.Trans.AppTransactionContacts.FirstOrDefault(z => z.Id == cnt.Id);
                            if (d != null && d.ContactAddressFk != null)
                            {
                                //             cnt.ContactAddressDetail = ObjectMapper.Map<ContactAppAddressDto>(d.ContactAddressFk);
                                cnt.ContactAddressDetail.ContactEmail = cnt.ContactEmail;
                                cnt.ContactAddressDetail.ContactPhone = cnt.ContactPhoneNumber;
                            }
                            //I40[Start]
                            if (true)//(cnt.BranchSSIN !=null && cnt.BranchName !="*Main*")
                            //I40[End]
                            {
                                var branch = _appContactRepository.GetAll().Where(z => z.SSIN == cnt.BranchSSIN && z.TenantId == AbpSession.TenantId).FirstOrDefault();
                                if (branch != null)
                                {
                                    cnt.BranchCode = branch.Code;
                                }
                            }

                        }
                    }
                    return y;
                }).ToList();

                // var appTrans = ObjectMapper.Map<List<GetAllAppTransactionsForViewDto>>(objList.Select(x => x.Trans).ToList());

                return new PagedResultDto<GetAllAppTransactionsForViewDto>(
                    totalCount,
                    appTrans
                );
            }
            else
            {
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(x => x.AppTransactionContacts)//.ThenInclude(s => s.ContactAddressFk)
                                         .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Name.Contains(input.Filter))
                                         .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter))
                                         .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter))
                                         .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                                         .WhereIf(input.FromCreationDateFilter != null, e => e.CreationTime >= input.FromCreationDateFilter)
                                         .WhereIf(input.ToCreationDateFilter != null, e => e.CreationTime <= input.ToCreationDateFilter)
                                         .WhereIf(input.FromCompleteDateFilter != null, e => e.CompleteDate >= input.FromCompleteDateFilter)
                                         .WhereIf(input.ToCompleteDateFilter != null, e => e.CompleteDate <= input.ToCompleteDateFilter)
                                         .WhereIf(input.StatusId > 0, e => e.EntityObjectStatusId == input.StatusId)
                                         .WhereIf(input.EntityTypeIdFilter > 0, e => e.EntityObjectTypeId == input.EntityTypeIdFilter)
                                         .WhereIf(!string.IsNullOrEmpty(input.ReferenceFilter), z => z.Reference.Contains(input.ReferenceFilter))
                                         .WhereIf(!string.IsNullOrEmpty(input.BuyerSSIN), e => e.BuyerContactSSIN == input.BuyerSSIN)
                                         .WhereIf(!string.IsNullOrEmpty(input.SellerSSIN), e => e.SellerContactSSIN == input.SellerSSIN)
                                         .WhereIf(!string.IsNullOrEmpty(input.SellerName), e => e.SellerCompanyName.Contains(input.SellerName))
                                         .WhereIf(!string.IsNullOrEmpty(input.BuyerName), e => e.BuyerCompanyName.Contains(input.BuyerName))
                                         .Where(e => !(e.CreatorUserId != AbpSession.UserId && e.EntityObjectStatusId == entityObjectStatusId) && e.EntityObjectStatusId != null && e.TenantId == AbpSession.TenantId)
                                         ;

                //MMT2026-06,1 Fix sort by creator Tenant issue[Start]
                //var pagedAndFilteredAppTransactions = filteredAppTransactions
                //    .OrderBy(input.Sorting ?? "id asc")
                //    .PageBy(input);
                IQueryable<AppTransactionHeaders> pagedAndFilteredAppTransactions = null;
                if (!string.IsNullOrEmpty(input.Sorting) && input.Sorting.ToLower().Contains("CreatorTenantName".ToLower()))
                {
                    //var dbContext = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>();
                    if (input.Sorting.ToLower().Contains(" desc".ToLower()))
                    {
                        pagedAndFilteredAppTransactions = filteredAppTransactions
                            .OrderByDescending(u => u.TenantOwnerFk.TenancyName
                            )
                    .PageBy(input);
                    }
                    else
                    {
                        pagedAndFilteredAppTransactions = filteredAppTransactions
                           .OrderBy(u => u.TenantOwnerFk.TenancyName
                                   )
                           .PageBy(input);
                    }
                }
                else
                {
                    pagedAndFilteredAppTransactions = filteredAppTransactions
                          .OrderBy(input.Sorting ?? "id asc")
                          .PageBy(input);
                }
                //MMT2026-06,1 Fix sort by creator Tenant issue[End]

                //var appTransactions = from o in pagedAndFilteredAppTransactions
                //                      select new GetAllAppTransactionsForViewDto()
                //                      {
                //                          AppTransaction = new AppTransactionDto
                //                          {
                //                              Code = o.Code,
                //                              Date = o.Date,
                //                              AddDate = o.AddDate,
                //                              EndDate = o.EndDate,
                //                              Id = o.Id
                //                          }
                //                      };

                var totalCount = await filteredAppTransactions.CountAsync();
                var objList = await pagedAndFilteredAppTransactions.ToListAsync();
                var appTrans = ObjectMapper.Map<List<GetAllAppTransactionsForViewDto>>(objList);
                foreach (var tran in appTrans)
                {
                    if (tran.TenantOwner != null)
                    {
                        try
                        {
                            var creatorTenant = await TenantManager.GetByIdAsync(int.Parse(tran.TenantOwner.ToString()));
                            tran.CreatorTenantName = creatorTenant.Name;
                        }
                        catch { }
                    }
                }
                return new PagedResultDto<GetAllAppTransactionsForViewDto>(
                    totalCount,
                    appTrans
                );
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<ShoppingCartSummary> GetCurrentUserActiveTransaction()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var filteredAppTransactions = _appShoppingCartRepository.GetAll().Where(e => e.TenantId == AbpSession.TenantId
            && e.CreatorUserId == AbpSession.UserId && e.TransactionId > 0).FirstOrDefault();

                ShoppingCartSummary objReturn = new ShoppingCartSummary()
                { Qty = 0, Amount = 0, ShoppingCartId = 0, SellerId = 0, BuyerId = 0, SellerLogo = "", BuyerLogo = "", BuyerSSIN = "", SellerSSIN = "", CurrencyCode = "" };


                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    var TransactionIdFk = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails).Where(e => e.Id == filteredAppTransactions.TransactionId).FirstOrDefault();
                    //var seller = _appContactRepository.GetAll().Where(e => e.SSIN == TransactionIdFk.SellerCompanySSIN).FirstOrDefault();
                    objReturn.ShoppingCartId = filteredAppTransactions.TransactionId;

                    //objReturn.Qty = TransactionIdFk.AppTransactionDetails.Sum(e => e.Quantity);
                    //objReturn.Amount = TransactionIdFk.AppTransactionDetails.Sum(e => e.Amount);
                    objReturn.Qty = TransactionIdFk.TotalQuantity;
                    objReturn.Amount = decimal.Parse(TransactionIdFk.TotalAmount.ToString());
                    objReturn.SellerSSIN = TransactionIdFk.SellerCompanySSIN;
                    //objReturn.SellerId = seller.Id;
                    objReturn.BuyerSSIN = TransactionIdFk.BuyerCompanySSIN;
                    objReturn.CurrencyCode = TransactionIdFk.CurrencyCode;
                    //I46[Start]
                    objReturn.BuyerName = TransactionIdFk.BuyerCompanyName;
                    objReturn.SellerName = TransactionIdFk.SellerCompanyName;
                    //I46[End]
                    TransactionType OrderTypeOut = TransactionType.SalesOrder;
                    objReturn.OrderType = OrderTypeOut;
                    var OrderType = TransactionIdFk.EntityObjectTypeCode;

                    if (!string.IsNullOrEmpty(OrderType) && Enum.TryParse<TransactionType>(OrderType, true, out OrderTypeOut))  // ignore cases
                    { objReturn.OrderType = OrderTypeOut; }

                    objReturn.BuyerLogo = "";
                    if (!string.IsNullOrEmpty(TransactionIdFk.BuyerCompanySSIN) && TransactionIdFk.BuyerCompanySSIN != "0")
                    {
                        var appContact = _appContactRepository.GetAll().Include(e => e.EntityFk).ThenInclude(e => e.EntityAttachments)
                            .ThenInclude(x => x.AttachmentFk)
                        .Where(e => e.SSIN == TransactionIdFk.BuyerCompanySSIN).FirstOrDefault();
                        var entity = appContact.EntityFk;
                        if (entity.EntityAttachments.Count() > 0)
                        {
                            var attCatId = await _helper.SystemTables.GetAttachmentCategoryLogoId();
                            var logo = entity.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attCatId);
                            objReturn.BuyerLogo = logo == null ? null : "attachments/" + (logo.AttachmentFk.TenantId.HasValue ? logo.AttachmentFk.TenantId : -1) + "/" + logo.AttachmentFk.Attachment;

                        }
                    }

                    objReturn.SellerLogo = "";
                    objReturn.SellerId = 0;
                    if (!string.IsNullOrEmpty(TransactionIdFk.SellerCompanySSIN) && TransactionIdFk.SellerCompanySSIN != "0")
                    {

                        var appContactSeller = _appContactRepository.GetAll().Include(e => e.EntityFk).ThenInclude(e => e.EntityAttachments)
                                .ThenInclude(x => x.AttachmentFk)
                         .Where(e => e.SSIN == TransactionIdFk.SellerCompanySSIN).FirstOrDefault();
                        //item?.appEvent?.nameobjReturn.SellerId = appContactSeller.Id;
                        var entitySeller = appContactSeller.EntityFk;
                        if (entitySeller.EntityAttachments.Count() > 0)
                        {
                            var attCatId = await _helper.SystemTables.GetAttachmentCategoryLogoId();
                            var logo = entitySeller.EntityAttachments.FirstOrDefault(x => x.AttachmentCategoryId == attCatId);
                            objReturn.SellerLogo = logo == null ? null : "attachments/" + (logo.AttachmentFk.TenantId.HasValue ? logo.AttachmentFk.TenantId : -1) + "/" + logo.AttachmentFk.Attachment;
                        }
                    }

                }


                return objReturn;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<bool> SetCurrentUserActiveTransaction(long OrderId)
        {

            var filteredAppTransactions = _appShoppingCartRepository.GetAll().Where(e => e.TenantId == AbpSession.TenantId
            && e.CreatorUserId == AbpSession.UserId && e.TransactionId > 0).FirstOrDefault();
            try
            {
                var TransactionIdFk = _appTransactionsHeaderRepository.GetAll().Where(e => e.Id == OrderId).FirstOrDefault();
                if (TransactionIdFk != null && TransactionIdFk.Id > 0)
                {
                    if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                    {

                        filteredAppTransactions.TransactionId = OrderId;
                        var obj = await _appShoppingCartRepository.UpdateAsync(filteredAppTransactions);
                        await CurrentUnitOfWork.SaveChangesAsync();

                    }
                    else
                    {
                        filteredAppTransactions = new AppActiveTransaction() { TransactionId = OrderId };
                        var obj = await _appShoppingCartRepository.InsertAsync(filteredAppTransactions);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }

                }
            }
            catch (Exception ex)
            {
                var x = ex.Message.ToString();
            }
            return true;
        }


        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<ShoppingCartSummary> GetBuyerSellerTransactions(string sellerSSIN, string buyerSSIN)
        {

            var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Where(e => e.TenantId == AbpSession.TenantId
            && e.CreatorUserId == AbpSession.UserId && e.EntityObjectStatusCode == "DRAFT"
            && e.SellerCompanySSIN == sellerSSIN && e.BuyerCompanySSIN == buyerSSIN).FirstOrDefault();

            ShoppingCartSummary objReturn = new ShoppingCartSummary()
            { Qty = 0, Amount = 0, ShoppingCartId = 0, SellerLogo = "", SellerId = 0, BuyerId = 0, BuyerLogo = "", SellerSSIN = "", BuyerSSIN = "" };


            if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
            {
                objReturn.ShoppingCartId = filteredAppTransactions.Id;
                //objReturn.Qty = filteredAppTransactions.AppTransactionDetails.Sum(e => e.Quantity);
                //objReturn.Amount = filteredAppTransactions.AppTransactionDetails.Sum(e => e.Amount);
                objReturn.Qty = filteredAppTransactions.TotalQuantity;
                objReturn.Amount = decimal.Parse(filteredAppTransactions.TotalAmount.ToString());
                objReturn.SellerSSIN = filteredAppTransactions.SellerCompanySSIN;
                objReturn.BuyerSSIN = filteredAppTransactions.BuyerCompanySSIN;
                objReturn.BuyerLogo = "";

            }


            return objReturn;
        }

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<ShoppingCartSummary> ValidateBuyerSellerTransaction(string sellerSSIN, string buyerSSIN,
          TransactionType orderType)
        {
            ShoppingCartSummary objReturn = new ShoppingCartSummary()
            { Qty = 0, Amount = 0, ShoppingCartId = 0, SellerLogo = "", SellerId = 0, BuyerId = 0, BuyerLogo = "", SellerSSIN = "", BuyerSSIN = "" };

            var myShoppingCart = await GetCurrentUserActiveTransaction();
            if (string.IsNullOrEmpty(sellerSSIN) || string.IsNullOrEmpty(buyerSSIN))
            {
                if (myShoppingCart != null && myShoppingCart.ShoppingCartId > 0)
                {
                    objReturn.ValidateOrder = ValidateTransaction.FoundShoppingCartForTemp;
                    return objReturn;
                }
                else
                {
                    objReturn.ValidateOrder = ValidateTransaction.NotFoundShoppingCartForTemp;
                    return objReturn;
                }
            }
            if (myShoppingCart != null && myShoppingCart.ShoppingCartId > 0 && myShoppingCart.SellerSSIN == sellerSSIN
                && myShoppingCart.BuyerSSIN == buyerSSIN)
            {
                objReturn = ObjectMapper.Map<ShoppingCartSummary>(myShoppingCart);
                objReturn.ValidateOrder = ValidateTransaction.FoundShoppingCart;

                return objReturn;
            }
            else
            {

                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId && e.EntityObjectStatusCode == "DRAFT"
                && e.SellerCompanySSIN == sellerSSIN && e.BuyerCompanySSIN == buyerSSIN && e.EntityObjectTypeCode.ToUpper() == orderType.ToString().ToUpper()).FirstOrDefault();

                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    objReturn.ShoppingCartId = filteredAppTransactions.Id;
                    if (filteredAppTransactions.AppTransactionDetails != null && filteredAppTransactions.AppTransactionDetails.Count() > 0)
                    {
                        //objReturn.Qty = filteredAppTransactions.AppTransactionDetails.Sum(e => e.Quantity);
                        //objReturn.Amount = filteredAppTransactions.AppTransactionDetails.Sum(e => e.Amount);
                        objReturn.Qty = filteredAppTransactions.TotalQuantity;
                        objReturn.Amount = decimal.Parse(filteredAppTransactions.TotalAmount.ToString());
                    }

                    objReturn.SellerSSIN = filteredAppTransactions.SellerCompanySSIN;
                    objReturn.BuyerSSIN = filteredAppTransactions.BuyerCompanySSIN;
                    objReturn.BuyerLogo = "";
                    objReturn.SellerLogo = "";
                    objReturn.ValidateOrder = ValidateTransaction.FoundInAnotherTransaction;
                    return objReturn;
                }
                else
                {
                    var createOrEditAppTransactionsDto = new CreateOrEditAppTransactionsDto();
                    createOrEditAppTransactionsDto.SellerCompanySSIN = sellerSSIN;
                    createOrEditAppTransactionsDto.BuyerCompanySSIN = buyerSSIN;

                    createOrEditAppTransactionsDto.TransactionType = orderType;

                    //var ret = await CreateOrEdit(createOrEditAppTransactionsDto);
                    objReturn.ShoppingCartId = 0;
                    objReturn.Qty = 0;
                    objReturn.Amount = 0;
                    objReturn.SellerSSIN = sellerSSIN;
                    objReturn.BuyerSSIN = buyerSSIN;
                    objReturn.BuyerLogo = "";
                    objReturn.SellerSSIN = "";
                    objReturn.ValidateOrder = ValidateTransaction.NotFound;
                    return objReturn;
                }
            }

        }




        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<bool> DeleteByProductSSIN(long orderId, long lineId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var entityOpenObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails).Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                && e.Id == orderId).FirstOrDefault();

                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    var itemMajor = filteredAppTransactions.AppTransactionDetails.Where(e => e.Id == lineId).FirstOrDefault();
                    if (itemMajor != null)
                    {

                        var itemsList = filteredAppTransactions.AppTransactionDetails.Where(e => e.ParentId == itemMajor.Id).Select(e => e.Id).ToList();

                        itemsList.ForEach(e => _appTransactionDetails.Delete(e));
                        _appTransactionDetails.Delete(itemMajor.Id);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails.Where(x => !x.IsDeleted)).Where(e => e.TenantId == AbpSession.TenantId
              && e.CreatorUserId == AbpSession.UserId
              && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
              && e.Id == orderId).FirstOrDefault();
                    filteredAppTransactions.TotalQuantity = long.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Quantity).ToString());
                    filteredAppTransactions.TotalAmount = double.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Amount).ToString());
                    //Iteration45[Start]
                    filteredAppTransactions.TimeStamp = DateTime.UtcNow;
                    //Iteration45[End]
                    await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[Start]
                    UpdateAppEntityLog(filteredAppTransactions.Id);
                    //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[End]
                }
                return true;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<bool> DeleteByProductSSINColor(long orderId, long parentId, string colorCode, long colorId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var entityOpenObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails)
                    .ThenInclude(e => e.EntityExtraData)
                    .Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                && e.Id == orderId).FirstOrDefault();

                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    var itemMajor = filteredAppTransactions.AppTransactionDetails.Where(e => e.Id == parentId).FirstOrDefault();
                    if (itemMajor != null)
                    {
                        var itemsList = filteredAppTransactions.AppTransactionDetails.Where(e => e.ParentId == itemMajor.Id
                        && e.EntityExtraData.Where(x => x.AttributeId == 101 &&
                        ((!string.IsNullOrEmpty(colorCode) && x.AttributeValue.ToUpper() == colorCode.ToUpper())
                        || (colorId > 0 && x.AttributeValueId == colorId))).Count() > 0)
                            .Select(e => e.Id).ToList();

                        itemsList.ForEach(e => _appTransactionDetails.Delete(e));
                        //_appTransactionDetails.Delete(itemMajor.Id);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails.Where(x => !x.IsDeleted))
                    .ThenInclude(e => e.EntityExtraData)
                    .Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                && e.Id == orderId).FirstOrDefault();

                    filteredAppTransactions.TotalQuantity = long.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Quantity).ToString());
                    filteredAppTransactions.TotalAmount = double.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Amount).ToString());
                    //Iteration45[Start]
                    filteredAppTransactions.TimeStamp = DateTime.UtcNow;
                    //Iteration45[End]
                    await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[Start]
                    UpdateAppEntityLog(filteredAppTransactions.Id);
                    //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[End]
                }
                return true;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<bool> DeleteByProductLineId(long orderId, long lineId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var entityOpenObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();

                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails).Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                && e.Id == orderId).FirstOrDefault();

                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    var itemMajor = filteredAppTransactions.AppTransactionDetails.Where(e => e.Id == lineId).FirstOrDefault();
                    if (itemMajor != null)
                    {
                        _appTransactionDetails.Delete(lineId);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails.Where(x => !x.IsDeleted)).Where(e => e.TenantId == AbpSession.TenantId
                                 && e.CreatorUserId == AbpSession.UserId
                                 && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                                 && e.Id == orderId).FirstOrDefault();
                    filteredAppTransactions.TotalQuantity = long.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Quantity).ToString());
                    filteredAppTransactions.TotalAmount = double.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Amount).ToString());
                    //Iteration45[Start]
                    filteredAppTransactions.TimeStamp = DateTime.UtcNow;
                    //Iteration45[End]
                    await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[Start]
                    UpdateAppEntityLog(filteredAppTransactions.Id);
                    //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[End]
                }

                return true;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<GetOrderDetailsForViewDto> GetOrderDetailsForView(long transactionId, bool ShowVariation, string colorCodeFilter, string sizeCodeFilter, string productCodeFilter)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (transactionId == null || transactionId <= 0)
                {
                    var filteredAppTransactions = _appShoppingCartRepository.GetAll().Where(e => e.TenantId == AbpSession.TenantId
                        && e.CreatorUserId == AbpSession.UserId && e.TransactionId > 0)
                        .FirstOrDefault();

                    if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                    {
                        transactionId = filteredAppTransactions.TransactionId;
                    }
                }
                if (transactionId != null && transactionId > 0)
                {
                    var trans = await _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionDetails)
                    .ThenInclude(e => e.EntityExtraData).Include(a => a.AppTransactionDetails)
                    .ThenInclude(e => e.EntityAttachments).ThenInclude(e => e.AttachmentFk)
                    .Where(a => a.Id == transactionId).FirstOrDefaultAsync();
                    if (trans != null)
                    {
                        var orderDetailsForViewDto = ObjectMapper.Map<GetOrderDetailsForViewDto>(trans);
                        orderDetailsForViewDto.CreateDate = trans.CreationTime.Date;
                        orderDetailsForViewDto.EntityStatusCode = trans.EntityObjectStatusCode;
                        orderDetailsForViewDto.Name = trans.Name;
                        orderDetailsForViewDto.OrderId = transactionId;
                        orderDetailsForViewDto.OrderType = trans.EntityObjectTypeCode;

                        var colorExtraData = trans.AppTransactionDetails.SelectMany(e => e.EntityExtraData).Where(e => e.AttributeId == 101).ToList();
                        var colorsList = colorExtraData.Select(e => new LookupLabelDto() { Code = e.EntityObjectTypeCode, Label = e.AttributeValue, Value = (e.AttributeValueId == null ? 0 : (long)e.AttributeValueId) }).DistinctBy(e => e.Label).ToList();

                        var sizeExtraData = trans.AppTransactionDetails.SelectMany(e => e.EntityExtraData).Where(e => e.AttributeId == 105).ToList();
                        var sizesList = sizeExtraData.Select(e => new LookupLabelDto() { Code = e.EntityObjectTypeCode, Label = e.AttributeValue, Value = (e.AttributeValueId == null ? 0 : (long)e.AttributeValueId) }).DistinctBy(e => e.Label).ToList();

                        orderDetailsForViewDto.Colors = colorsList;
                        orderDetailsForViewDto.Sizes = sizesList;

                        //orderDetailsForViewDto.totalAmount = trans.AppTransactionDetails.Sum(e => e.Amount);
                        //orderDetailsForViewDto.totalQty = trans.AppTransactionDetails.Sum(e => e.Quantity);
                        orderDetailsForViewDto.totalAmount = decimal.Parse(trans.TotalAmount.ToString());
                        orderDetailsForViewDto.totalQty = trans.TotalQuantity;
                        orderDetailsForViewDto.DetailsView = new List<DetailView>();
                        foreach (var line in trans.AppTransactionDetails.Where(e => e.ParentId == null || e.ParentId == 0)
                            .WhereIf(!string.IsNullOrEmpty(productCodeFilter), e => e.Code.Contains(productCodeFilter) || e.Name.Contains(productCodeFilter)))
                        {
                            // add major line
                            DetailView majorDetailView = new DetailView();
                            majorDetailView.Data = new DataView();
                            majorDetailView.Data.LineId = line.Id;
                            majorDetailView.Data.code = line.Code;
                            majorDetailView.Data.ManufacturerCode = line.ManufacturerCode;
                            majorDetailView.Data.name = line.Name;
                            majorDetailView.Data.Qty = 0;
                            majorDetailView.Data.Price = 0;
                            majorDetailView.Data.Amount = 0;
                            majorDetailView.Data.Image = "";
                            if (line.EntityAttachments.Count() > 0)
                            {
                                var lineAttachmentDefault = line.EntityAttachments.FirstOrDefault(x => x.IsDefault == true);
                                var lineAttachment = line.EntityAttachments.FirstOrDefault(x => x.IsDefault == true);
                                majorDetailView.Data.Image = (lineAttachmentDefault == null ?
                                           (lineAttachment == null ? "attachments/" + line.TenantId + "/" + lineAttachment.AttachmentFk.Attachment : "")
                                            : "attachments/" + (line.TenantId.HasValue ? line.TenantId : -1) + "/" +
                                            lineAttachmentDefault.AttachmentFk.Attachment);
                            }

                            majorDetailView.Data.ParentId = 0;
                            majorDetailView.Data.ColorId = 0;
                            majorDetailView.Data.ColorCode = "";
                            majorDetailView.Data.SizeId = 0;
                            majorDetailView.Data.SizeCode = "";
                            majorDetailView.Data.editQty = false;
                            majorDetailView.Children = new List<DetailView>();

                            //orderDetailsForViewDto.DetailsView.Add(majorDetailView);
                            //get colors
                            var lineVariations = trans.AppTransactionDetails.Where(e => e.ParentId == line.Id);
                            var lineColorExtraData = lineVariations.SelectMany(e => e.EntityExtraData).Where(e => e.AttributeId == 101)
                                .WhereIf(!string.IsNullOrEmpty(colorCodeFilter), e => e.AttributeValue == colorCodeFilter || (e.AttributeValueId != null && e.AttributeValueId.ToString() == colorCodeFilter))
                                .ToList();
                            var lineColorsList = lineColorExtraData.Select(e => new LookupLabelDto()
                            { Code = e.EntityObjectTypeCode, Label = e.AttributeValue, Value = (e.AttributeValueId == null ? 0 : (long)e.AttributeValueId) }).DistinctBy(e => e.Label).ToList();
                            foreach (var color in lineColorsList)
                            {  // add color line
                                DetailView colorDetailView = new DetailView();
                                colorDetailView.Data = new DataView();
                                colorDetailView.Data.LineId = line.Id;
                                colorDetailView.Data.code = line.Code;
                                colorDetailView.Data.name = line.Name;
                                colorDetailView.Data.Qty = 0;
                                colorDetailView.Data.Price = 0;
                                colorDetailView.Data.Amount = 0;
                                colorDetailView.Data.Image = majorDetailView.Data.Image;
                                colorDetailView.Data.ParentId = line.Id;
                                if (color.Value != null)
                                { colorDetailView.Data.ColorId = (long)color.Value; }
                                colorDetailView.Data.ColorCode = color.Label;
                                colorDetailView.Data.ManufacturerCode = line.ManufacturerCode + '-' + color.Label.ToUpper();
                                colorDetailView.Data.SizeId = 0;
                                colorDetailView.Data.SizeCode = "";
                                colorDetailView.Data.editQty = false;
                                colorDetailView.Children = new List<DetailView>();

                                foreach (var size in lineVariations)
                                {  // add size color line
                                    if (size.EntityExtraData.Where(e => e.AttributeValue == color.Label && e.AttributeId == 101)
                                        .Count() > 0)
                                    {
                                        var sSize = size.EntityExtraData.Where(e => e.AttributeId == 105)
                                            .WhereIf(!string.IsNullOrEmpty(sizeCodeFilter), e => e.AttributeValue == sizeCodeFilter || (e.AttributeValueId != null && e.AttributeValueId.ToString() == sizeCodeFilter))
                                            .ToList();
                                        if (sSize.Count > 0)
                                        {
                                            DetailView sizeColorDetailView = new DetailView();
                                            sizeColorDetailView.Data = new DataView();
                                            sizeColorDetailView.Data.LineId = size.Id;
                                            sizeColorDetailView.Data.code = size.Code;
                                            sizeColorDetailView.Data.ManufacturerCode = size.ManufacturerCode;
                                            sizeColorDetailView.Data.name = size.Name;
                                            sizeColorDetailView.Data.Qty = size.Quantity;
                                            sizeColorDetailView.Data.NoOfPrePacks = (size.NoOfPrePacks == null ? 0 : (long)size.NoOfPrePacks);

                                            sizeColorDetailView.Data.Price = size.NetPrice;
                                            sizeColorDetailView.Data.Amount = size.Amount;
                                            sizeColorDetailView.Data.Image = "";

                                            if (size.EntityAttachments.Count() > 0)
                                            {
                                                var lineAttachmentDefault = size.EntityAttachments.FirstOrDefault();
                                                var lineAttachment = size.EntityAttachments.FirstOrDefault();
                                                sizeColorDetailView.Data.Image = (lineAttachmentDefault == null ?
                                                           (lineAttachment != null ? "attachments/" + line.TenantId + "/" + lineAttachment.AttachmentFk.Attachment : "")
                                                            : "attachments/" + (line.TenantId.HasValue ? line.TenantId : -1) + "/" +
                                                            lineAttachmentDefault.AttachmentFk.Attachment);
                                            }
                                            //T-SII-20241108.0007,1 MMT 09/17/2024 - Transaction - Styles without images show with crash image[Start]
                                            if (string.IsNullOrEmpty(sizeColorDetailView.Data.Image))
                                            {
                                                sizeColorDetailView.Data.Image = majorDetailView.Data.Image;
                                            }
                                            //T-SII-20241108.0007,1 MMT 09/17/2024 - Transaction - Styles without images show with crash image[End]
                                            //I45
                                            if (!string.IsNullOrEmpty(sizeColorDetailView.Data.Image))
                                            {
                                                colorDetailView.Data.Image = sizeColorDetailView.Data.Image;
                                            }
                                            //I45
                                            sizeColorDetailView.Data.ParentId = line.Id;
                                            sizeColorDetailView.Data.ColorId = (long)color.Value;
                                            sizeColorDetailView.Data.ColorCode = color.Label;
                                            if (sSize[0].AttributeValueId != null)
                                            { sizeColorDetailView.Data.SizeId = (long)sSize[0].AttributeValueId; }
                                            sizeColorDetailView.Data.SizeCode = sSize[0].AttributeValue;

                                            sizeColorDetailView.Data.editQty = size.NoOfPrePacks > 0 ? false : true;
                                            colorDetailView.Children.Add(sizeColorDetailView);
                                        }
                                        colorDetailView.Data.Qty = colorDetailView.Data.Qty + size.Quantity;
                                        colorDetailView.Data.NoOfPrePacks = (size.NoOfPrePacks == null ? 0 : (long)size.NoOfPrePacks);//colorDetailView.Data.NoOfPrePacks +
                                        //colorDetailView.Data.Price = colorDetailView.Data.Price + size.NetPrice;
                                        colorDetailView.Data.Price = size.NetPrice;
                                        colorDetailView.Data.Amount = colorDetailView.Data.Amount + size.Amount;
                                    }
                                }
                                if (line.NoOfPrePacks > 0) colorDetailView.Data.editQty = true;
                                majorDetailView.Children.Add(colorDetailView);
                                majorDetailView.Data.Qty = colorDetailView.Data.Qty + majorDetailView.Data.Qty;
                                try
                                {
                                    colorDetailView.Data.PrePackQty = colorDetailView.Data.Qty / majorDetailView.Data.NoOfPrePacks;
                                }
                                catch (Exception ex) { }
                                majorDetailView.Data.NoOfPrePacks = colorDetailView.Data.NoOfPrePacks + colorDetailView.Data.NoOfPrePacks;
                                //majorDetailView.Data.Price = colorDetailView.Data.Price + majorDetailView.Data.Price;
                                majorDetailView.Data.Price = colorDetailView.Data.Price;
                                majorDetailView.Data.Amount = colorDetailView.Data.Amount + majorDetailView.Data.Amount;


                            }
                            if (lineColorsList.Count == 0)
                            { majorDetailView.Data.editQty = true; }
                            orderDetailsForViewDto.DetailsView.Add(majorDetailView);

                        }

                        if (trans != null)
                        {
                            return orderDetailsForViewDto;
                        }
                        return null;
                    }
                    return null;
                }
                return null;
            }
        }
        //MMT2025[Start]
        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<bool> UpdatePriceByProductLineId(long orderId, long lineId, decimal price)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var entityOpenObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();

                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails).Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                && e.Id == orderId).FirstOrDefault();

                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    var itemMajor = filteredAppTransactions.AppTransactionDetails.Where(e => e.Id == lineId).FirstOrDefault();
                    if (itemMajor != null)
                    {
                        itemMajor.NetPrice = price;
                        itemMajor.GrossPrice = price;
                        itemMajor.Amount = itemMajor.NetPrice * decimal.Parse(itemMajor.Quantity.ToString());
                        filteredAppTransactions.TotalAmount = double.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Amount).ToString());
                        filteredAppTransactions.TimeStamp = DateTime.UtcNow;
                        await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[Start]
                        UpdateAppEntityLog(filteredAppTransactions.Id);
                        //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[End]

                    }
                }

                return true;
            }
        }
        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<bool> UpdatePriceByProductSSINColor(long orderId, long parentId, string colorCode, long colorId, decimal price)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var entityOpenObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails)
                    .ThenInclude(e => e.EntityExtraData)
                    .Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                && e.Id == orderId).FirstOrDefault();

                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    var itemMajor = filteredAppTransactions.AppTransactionDetails.Where(e => e.Id == parentId).FirstOrDefault();
                    if (itemMajor != null)
                    {
                        var itemsList = filteredAppTransactions.AppTransactionDetails.Where(e => e.ParentId == itemMajor.Id
                        && e.EntityExtraData.Where(x => x.AttributeId == 101 &&
                        ((!string.IsNullOrEmpty(colorCode) && x.AttributeValue.ToUpper() == colorCode.ToUpper())
                        || (colorId > 0 && x.AttributeValueId == colorId))).Count() > 0)
                            .ToList();

                        foreach (var e in itemsList)
                        {

                            e.NetPrice = price;
                            e.GrossPrice = price;
                            e.Amount = e.NetPrice * decimal.Parse(e.Quantity.ToString());

                        };
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[Start]
                        UpdateAppEntityLog(filteredAppTransactions.Id);
                        //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[End]
                    }
                }
                filteredAppTransactions.TotalAmount = double.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Amount).ToString());
                filteredAppTransactions.TimeStamp = DateTime.UtcNow;
                await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                return true;
            }
        }

        //MMT2025[End]

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<bool> UpdateByProductLineId(long orderId, long lineId, Int32 qty)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var entityOpenObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();

                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails).Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                && e.Id == orderId).FirstOrDefault();

                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    var itemMajor = filteredAppTransactions.AppTransactionDetails.Where(e => e.Id == lineId).FirstOrDefault();
                    if (itemMajor != null)
                    {
                        itemMajor.Quantity = qty;
                        itemMajor.Amount = itemMajor.NetPrice * qty;
                        //T-SII-20240801.0002,1 MMT 08/22/2024 Adjust transaction total qty and amount after editing lines[Start]
                        filteredAppTransactions.TotalQuantity = long.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Quantity).ToString());
                        filteredAppTransactions.TotalAmount = double.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Amount).ToString());
                        //Iteration45[Start]
                        filteredAppTransactions.TimeStamp = DateTime.UtcNow;
                        //Iteration45[End]
                        await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                        //T-SII-20240801.0002,1 MMT 08/22/2024 Adjust transaction total qty and amount after editing lines[End]
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[Start]
                        UpdateAppEntityLog(filteredAppTransactions.Id);
                        //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[End]
                    }
                }

                return true;
            }
        }

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task<bool> UpdateByProductSSINColor(long orderId, long parentId, string colorCode, long colorId, Int32 qty)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var entityOpenObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails)
                    .ThenInclude(e => e.EntityExtraData)
                    .Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == entityObjectStatusId || e.EntityObjectStatusId == entityOpenObjectStatusId)
                && e.Id == orderId).FirstOrDefault();

                if (filteredAppTransactions != null && filteredAppTransactions.Id > 0)
                {
                    var itemMajor = filteredAppTransactions.AppTransactionDetails.Where(e => e.Id == parentId).FirstOrDefault();
                    if (itemMajor != null)
                    {
                        var itemsList = filteredAppTransactions.AppTransactionDetails.Where(e => e.ParentId == itemMajor.Id
                        && e.EntityExtraData.Where(x => x.AttributeId == 101 &&
                        ((!string.IsNullOrEmpty(colorCode) && x.AttributeValue.ToUpper() == colorCode.ToUpper())
                        || (colorId > 0 && x.AttributeValueId == colorId))).Count() > 0)
                            .ToList();
                        double oldQty = 0;
                        long orgNoOfPrepacks = 0;
                        foreach (var e in itemsList)
                        {
                            if ((long)e.NoOfPrePacks > 0)
                            {
                                // e.Quantity = qty / (e.Quantity / (long)e.NoOfPrePacks);
                                // e.NoOfPrePacks = qty;
                                oldQty += e.Quantity;
                                orgNoOfPrepacks = (long)e.NoOfPrePacks;
                            }
                        };
                        long? NewNoOfPrePack = qty / (((long?)oldQty) / orgNoOfPrepacks);
                        foreach (var e in itemsList)
                        {
                            if ((long)e.NoOfPrePacks > 0)
                            {
                                e.Quantity = (double)(NewNoOfPrePack * (e.Quantity / (long)e.NoOfPrePacks));
                                e.NoOfPrePacks = NewNoOfPrePack;
                                e.Amount = e.NetPrice * decimal.Parse(e.Quantity.ToString());
                            }
                        };
                        itemMajor.NoOfPrePacks = itemMajor.NoOfPrePacks + NewNoOfPrePack - orgNoOfPrepacks;
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                //T-SII-20240801.0002,1 MMT 08/22/2024 Adjust transaction total qty and amount after editing lines[Start]
                filteredAppTransactions.TotalQuantity = long.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Quantity).ToString());
                filteredAppTransactions.TotalAmount = double.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Amount).ToString());
                //Iteration45[Start]
                filteredAppTransactions.TimeStamp = DateTime.UtcNow;
                //Iteration45[End]
                await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                //T-SII-20240801.0002,1 MMT 08/22/2024 Adjust transaction total qty and amount after editing lines[End]
                //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[Start]
                await CurrentUnitOfWork.SaveChangesAsync();
                UpdateAppEntityLog(filteredAppTransactions.Id);
                //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[End]
                return true;
            }
        }
        //Iteration#42 08/20/2024 MMT Add new APIs to create transaction categories[Start]
        public async Task<bool> IsManualCompany(string companySSIN)
        {
            var contact = await _appContactRepository.GetAll().Where(z => z.SSIN == companySSIN).FirstOrDefaultAsync();
            if (contact != null)
            {
                if (!string.IsNullOrEmpty(contact.PartnerId.ToString()))
                    return false;
                else
                    return true;
            }
            else
            {
                return false;
            }
        }
        //Iteration#42 08/20/2024 MMT Add new APIs to create transaction categories[End]

        [AbpAuthorize(AppPermissions.Pages_AppSiiwiiTransactions)]
        public async Task AddTransactionDetails(GetAppMarketplaceItemDetailForViewDto input, string transactionId, string transactionType)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                long? tranTypeId = null;
                if (transactionType == "SO")
                {
                    tranTypeId = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
                }
                else
                {
                    tranTypeId = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
                }
                var header = await _appTransactionsHeaderRepository.GetAll().AsNoTracking()
                    .FirstOrDefaultAsync(a => a.Code == transactionId && a.TenantId == AbpSession.TenantId && a.EntityObjectTypeId == tranTypeId);
                if (header == null)
                    return;
                double colorQty = 0;
                decimal colorAmt = 0;
                AppTransactionDetails detParent = null;
                var lastLine = 0;
                try
                {
                    lastLine = await _appTransactionDetails.GetAll().AsNoTracking().Where(s => s.TransactionId == header.Id).DefaultIfEmpty().Select(a => a.LineNo).DefaultIfEmpty().MaxAsync();
                }
                catch { lastLine = 0; }

                lastLine = lastLine == 0 ? 0 : lastLine;
                List<AppTransactionDetails> details = new List<AppTransactionDetails>();
                if (input.AppItem.variations != null && input.AppItem.variations.Count() > 0)
                {
                    var orderQty = input.AppItem.variations.Sum(x => x.selectedValues.Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE").Sum(a => a.Values.Where(f => f.OrderedQty != null).Select(f => f.OrderedQty).Sum())));
                    var orderPrepacks = input.AppItem.variations.Sum(x => x.selectedValues
                    .Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE")
                    .Sum(a => a.Values.FirstOrDefault(f => f.OrderedPrePacks != null && f.OrderedPrePacks > 0) != null ? a.Values.FirstOrDefault(f => f.OrderedPrePacks != null && f.OrderedPrePacks > 0).OrderedPrePacks : 0)));
                    var orderAmt = input.AppItem.variations.Sum(x => x.selectedValues
                    .Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE")
                    .Sum(a => a.Values.Where(f => f.OrderedQty != null).Select(f => f.OrderedQty * f.Price).Sum())));

                    if (orderPrepacks > 0)
                    {

                        orderQty = input.AppItem.variations.Sum(x => x.selectedValues.Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE").Sum(a => a.Values.Where(f => f.OrderedPrePacks != null && f.OrderedPrePacks > 0).Select(f => f.SizeRatio * f.OrderedPrePacks).Sum())));
                        orderAmt = input.AppItem.variations.Sum(x => x.selectedValues
                          .Sum(z => z.EDRestAttributes.Where(ch => ch.ExtraAttrName == "SIZE")
                          .Sum(a => a.Values.Where(f => f.OrderedPrePacks != null && f.OrderedPrePacks > 0)
                          .Select(f => f.SizeRatio * f.OrderedPrePacks * f.Price).Sum())));
                    }
                    if (orderQty > 0 || orderPrepacks > 0)
                    {
                        var marketplaceItemMain = await _appMarketplaceItem.GetAll().AsNoTracking()
                            .Include(x => x.EntityCategories).AsNoTracking()
                            .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk).AsNoTracking()
                            .Include(a => a.EntityClassifications).AsNoTracking()
                            .Include(a => a.EntityExtraData).AsNoTracking().FirstOrDefaultAsync(a => a.SSIN == input.AppItem.Code);

                        if (marketplaceItemMain != null)
                        {
                            detParent = await _appTransactionDetails.GetAll().Include(z => z.ParentFkList).Where(z => z.TransactionId == header.Id &&
                            z.ItemSSIN == marketplaceItemMain.SSIN && z.SSIN == marketplaceItemMain.SSIN).FirstOrDefaultAsync();
                            if (detParent == null)
                            {
                                //MMT-F
                                //await GetProductFromMarketplace(marketplaceItemMain.SSIN);
                                //MMT-F
                                detParent = new AppTransactionDetails();
                                detParent = ObjectMapper.Map<AppTransactionDetails>(marketplaceItemMain);
                                detParent.Amount = decimal.Parse(orderAmt.ToString());
                                detParent.Quantity = double.Parse(orderQty.ToString());
                                detParent.NetPrice = decimal.Parse((orderAmt / orderQty).ToString());
                                detParent.GrossPrice = decimal.Parse((orderAmt / orderQty).ToString());
                                detParent.Discount = 0;
                                detParent.NoOfPrePacks = orderPrepacks;
                                detParent.SSIN = marketplaceItemMain.SSIN;
                                detParent.ItemSSIN = marketplaceItemMain.SSIN;
                                detParent.ItemDescription = marketplaceItemMain.Description;
                                detParent.Name = marketplaceItemMain.Name;
                                detParent.Id = 0;
                                detParent.TransactionId = header.Id;
                                lastLine++;
                                detParent.LineNo = lastLine;
                                detParent.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                                detParent.TenantId = int.Parse(AbpSession.TenantId.ToString());
                                detParent.TransactionCode = header.Code;
                                detParent.EntityObjectTypeId = header.EntityObjectTypeId;
                                detParent.EntityObjectTypeCode = header.EntityObjectTypeCode;
                                detParent.Note = "";
                                detParent.ItemCode = marketplaceItemMain.Code;
                                detParent.Code = header.TenantId.ToString().TrimEnd() + "-" + header.Code.TrimEnd() + "-" + detParent.LineNo.ToString() + "-" + detParent.Code.TrimEnd();
                                detParent.Notes = string.IsNullOrEmpty(marketplaceItemMain.Notes) ? "" : marketplaceItemMain.Notes;
                                detParent.ParentId = null;
                                if (detParent.EntityExtraData != null)
                                {
                                    detParent.EntityExtraData.ForEach(d => d.Id = 0);
                                    detParent.EntityExtraData.ForEach(d => d.EntityFk = null);
                                    detParent.EntityExtraData.ForEach(d => d.EntityCode = detParent.Code);
                                    detParent.EntityExtraData.ForEach(d => d.EntityId = 0);
                                }
                                if (detParent.EntityAttachments != null)
                                {
                                    detParent.EntityAttachments.ForEach(d => d.Id = 0);
                                    detParent.EntityAttachments.ForEach(d => d.EntityId = 0);
                                    detParent.EntityAttachments.ForEach(d => d.EntityCode = detParent.Code);
                                    detParent.EntityAttachments.ForEach(d => d.EntityFk = null);
                                }
                                if (detParent.EntityCategories != null)
                                {
                                    detParent.EntityCategories.ForEach(d => d.Id = 0);
                                    detParent.EntityCategories.ForEach(d => d.EntityFk = null);
                                    detParent.EntityCategories.ForEach(d => d.EntityCode = detParent.Code);
                                    detParent.EntityCategories.ForEach(d => d.EntityId = 0);
                                }
                                if (detParent.EntityClassifications != null)
                                {
                                    detParent.EntityClassifications.ForEach(d => d.EntityId = 0);
                                    detParent.EntityClassifications.ForEach(d => d.EntityFk = null);
                                    detParent.EntityClassifications.ForEach(d => d.EntityCode = detParent.Code);
                                    detParent.EntityClassifications.ForEach(d => d.Id = 0);
                                }
                                if (detParent.EntityAttachments != null)
                                {
                                    detParent.EntityAttachments.RemoveAll(z => z.IsDefault == false);
                                    foreach (var parentAttach in detParent.EntityAttachments)
                                    {

                                        parentAttach.Id = 0;
                                        parentAttach.EntityId = 0;
                                        parentAttach.EntityFk = null;
                                        parentAttach.AttachmentFk.TenantId = AbpSession.TenantId;
                                        if (marketplaceItemMain.TenantOwner == AbpSession.TenantId)
                                        {
                                            string fileName = System.Guid.NewGuid().ToString() + "." + parentAttach.AttachmentFk.Attachment.Split('.')[1];
                                            MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId, fileName);
                                            parentAttach.AttachmentFk.Attachment = fileName;
                                        }
                                        else
                                        {
                                            MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId, null);
                                        }
                                        parentAttach.AttachmentId = 0;
                                        parentAttach.AttachmentFk.Id = 0;
                                    }
                                }
                                detParent = await _appTransactionDetails.InsertAsync(detParent);
                            }
                            else
                            {
                                detParent.Amount += decimal.Parse(orderAmt.ToString());
                                detParent.Quantity += double.Parse(orderQty.ToString());
                                await _appTransactionDetails.UpdateAsync(detParent);
                            }
                        }

                    }
                    if (detParent == null) return;
                    foreach (var item in input.AppItem.variations)
                    {
                        foreach (var child in item.selectedValues)
                        {

                            foreach (var ch in child.EDRestAttributes)
                            {
                                if (ch.ExtraAttrName != "SIZE")
                                    continue;

                                foreach (var v in ch.Values)
                                {
                                    if (v.OrderedPrePacks != null && v.OrderedPrePacks > 0 ? ((v.OrderedPrePacks * v.SizeRatio) == 0) : (v.OrderedQty == 0 || v.OrderedQty == null)) continue;
                                    var ssin = v.SSIN;
                                    var marketplaceItem = await _appMarketplaceItem.GetAll().AsNoTracking().Include(x => x.EntityCategories)
                                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk).Include(a => a.EntityClassifications)
                                        .Include(a => a.EntityExtraData).FirstOrDefaultAsync(a => a.SSIN == ssin);
                                    if (marketplaceItem != null)
                                    {

                                        AppTransactionDetails det = new AppTransactionDetails();
                                        det = ObjectMapper.Map<AppTransactionDetails>(marketplaceItem);
                                        det.Quantity = v.OrderedPrePacks != null && v.OrderedPrePacks > 0 ? double.Parse((v.OrderedPrePacks * v.SizeRatio).ToString()) : double.Parse(v.OrderedQty.ToString());
                                        det.NetPrice = v.Price; //input.AppItem.MaxSpecialPrice != 0 ? input.AppItem.MaxSpecialPrice : input.AppItem.MaxMSRP;
                                        det.GrossPrice = v.Price; //input.AppItem.MaxSpecialPrice != 0 ? input.AppItem.MaxSpecialPrice : input.AppItem.MaxMSRP;
                                        det.Discount = 0;
                                        det.Amount = decimal.Parse((decimal.Parse(det.Quantity.ToString()) * det.NetPrice).ToString());
                                        det.Id = 0;
                                        det.TransactionId = header.Id;
                                        lastLine++;
                                        det.LineNo = lastLine;
                                        det.NoOfPrePacks = v.OrderedPrePacks;
                                        det.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                                        det.TenantId = int.Parse(AbpSession.TenantId.ToString());
                                        det.TransactionCode = header.Code;
                                        det.ItemCode = marketplaceItem.Code;
                                        det.ItemDescription = marketplaceItem.Description;
                                        det.ItemSSIN = marketplaceItem.SSIN;
                                        det.EntityObjectTypeId = header.EntityObjectTypeId;
                                        det.EntityObjectTypeCode = header.EntityObjectTypeCode;
                                        det.Note = "";
                                        det.Code = header.TenantId.ToString().TrimEnd() + "-" + header.Code.TrimEnd() + "-" + det.LineNo.ToString() + "-" + det.Code.TrimEnd();
                                        det.Notes = string.IsNullOrEmpty(marketplaceItem.Notes) ? "" : marketplaceItem.Notes;
                                        // det.EntityExtraData.ForEach(d => d.Id = 0);
                                        // det.EntityExtraData.ForEach(d=> d.EntityId = 0);
                                        //det.EntityExtraData.ForEach(d => d.EntityFk  = null);
                                        if (det.EntityExtraData != null)
                                        {
                                            det.EntityExtraData.ForEach(d => d.EntityCode = marketplaceItem.Code);
                                            det.EntityExtraData.ForEach(d => d.Id = 0);
                                            det.EntityExtraData.ForEach(d => d.EntityFk = null);
                                            det.EntityExtraData.ForEach(d => d.EntityCode = det.Code);
                                            det.EntityExtraData.ForEach(d => d.EntityId = 0);
                                        }
                                        if (det.EntityAttachments != null)
                                        {
                                            det.EntityAttachments.ForEach(d => d.Id = 0);
                                            det.EntityAttachments.ForEach(d => d.EntityId = 0);
                                            det.EntityAttachments.ForEach(d => d.EntityCode = det.Code);
                                            det.EntityAttachments.ForEach(d => d.EntityFk = null);
                                        }
                                        if (det.EntityCategories != null)
                                        {
                                            det.EntityCategories.ForEach(d => d.Id = 0);
                                            det.EntityCategories.ForEach(d => d.EntityFk = null);
                                            det.EntityCategories.ForEach(d => d.EntityCode = detParent.Code);
                                            det.EntityCategories.ForEach(d => d.EntityId = 0);
                                        }
                                        if (det.EntityClassifications != null)
                                        {
                                            det.EntityClassifications.ForEach(d => d.EntityId = 0);
                                            det.EntityClassifications.ForEach(d => d.EntityFk = null);
                                            det.EntityClassifications.ForEach(d => d.EntityCode = detParent.Code);
                                            det.EntityClassifications.ForEach(d => d.Id = 0);
                                        }
                                        if (det.EntityAttachments != null)
                                        {
                                            det.EntityAttachments.RemoveAll(z => z.IsDefault == false);
                                            foreach (var parentAttach in det.EntityAttachments)
                                            {

                                                parentAttach.Id = 0;

                                                parentAttach.EntityId = 0;
                                                parentAttach.EntityFk = null;
                                                parentAttach.AttachmentFk.TenantId = AbpSession.TenantId;
                                                //I40
                                                //MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId,null);
                                                if (marketplaceItem.TenantOwner == AbpSession.TenantId)
                                                {
                                                    string fileName = System.Guid.NewGuid().ToString() + "." + parentAttach.AttachmentFk.Attachment.Split('.')[1];
                                                    MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId, fileName);
                                                    parentAttach.AttachmentFk.Attachment = fileName;
                                                }
                                                else
                                                {
                                                    MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId, null);
                                                }
                                                //I40
                                                parentAttach.AttachmentId = 0;
                                                parentAttach.AttachmentFk.Id = 0;
                                            }
                                        }
                                        colorQty += det.Quantity;
                                        colorAmt += det.Amount;
                                        det.ParentId = detParent.Id;
                                        detParent.ParentFkList.Add(det);
                                        //det = await _appTransactionDetailsRepository.InsertAsync(det);

                                    }

                                }
                            }
                        }
                    }
                    //Iteration45[Start]
                    header.TimeStamp = DateTime.UtcNow;
                    //Iteration45[End]
                    header.TotalQuantity += long.Parse(colorQty.ToString());
                    header.TotalAmount += double.Parse(colorAmt.ToString());
                    await _appTransactionsHeaderRepository.UpdateAsync(header);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }
        }
        private void MoveFile(string fileName, int? sourceTenantId, int? distinationTenantId, string? newFileName)
        {
            if (sourceTenantId == null) sourceTenantId = -1;
            if (distinationTenantId == null) distinationTenantId = -1;

            if (string.IsNullOrEmpty(newFileName))
                newFileName = fileName;

            var tmpPath = _appConfiguration[$"Attachment:PathTemp"] + @"\" + sourceTenantId + @"\" + fileName;
            var pathSource = _appConfiguration[$"Attachment:Path"] + @"\" + sourceTenantId + @"\" + fileName;
            var path = _appConfiguration[$"Attachment:Path"] + @"\" + distinationTenantId + @"\" + newFileName;

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
        [HttpGet]
        public async Task<List<AccountBranchDto>> GetAccountBranches(string accountSSIN)
        {
            List<AccountBranchDto> returnList = new List<AccountBranchDto>();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                //I40[Start]
                //var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var branchEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeBranchId();
                //I40[End]
                var filteredParentId = _appContactRepository.GetAll().Where(z => z.SSIN == accountSSIN && z.TenantId == AbpSession.TenantId).FirstOrDefault();
                if (filteredParentId != null)
                {
                    var filteredBranches = _appContactRepository.GetAll()
                            .Include(e => e.ParentFk)
                            // .Include(e => e.ParentFkList)
                            .Where(e => e.ParentId != null && e.ParentId == filteredParentId.Id &&
                            //I40[Start]
                            e.EntityFk.EntityObjectTypeId == branchEntityObjectTypeId);
                    //I40[End]
                    var branches = from o in filteredBranches
                                       //join o2 in _appContactRepository.GetAll() on o.ParentId equals o2.Id into j2
                                       // from s2 in j2.DefaultIfEmpty()
                                   select new AccountBranchDto()
                                   {
                                       //Data = new AccountBranchDto
                                       //{
                                       Code = o.Code,
                                       Name = o.Name,
                                       Id = o.Id,
                                       SSIN = o.SSIN
                                       // },
                                       //SubTotal = o.ParentFkList.Count(),
                                       // Leaf = o.ParentFkList.Count() == 0

                                   };
                    var totalCount = await filteredBranches.CountAsync();
                    var x = await branches.ToListAsync();
                    //I40[Start]
                    //x.Add(new AccountBranchDto { Code = "Main", Name = @"*Main*", Id = filteredParentId.Id, SSIN = accountSSIN });
                    //I40[End]
                    var orderedList = x.OrderBy(z => z.Name).ToList();
                    return orderedList;
                }
                else
                {
                    return returnList;
                }
            }
        }
        public async Task<List<GetContactInformationDto>> GetAccountRelatedContactsList(string accountSSIN, string filter)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                List<GetContactInformationDto> returnList = new List<GetContactInformationDto>();
                var accountId = _appContactRepository.GetAll().Where(z => z.SSIN == accountSSIN && z.TenantId == AbpSession.TenantId).FirstOrDefault();
                if (accountId == null)
                {
                    return returnList;
                }
                var activeRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                List<GetContactInformationDto> returnObjectList = new List<GetContactInformationDto>();
                var accountsList = _appContactRepository.GetAll()
                    .WhereIf(!string.IsNullOrEmpty(filter), a => a.Name.ToLower().Contains(filter.ToLower()))
                    .Where(a => a.TenantId == AbpSession.TenantId //& a.ParentId != null 
                     & a.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId &
                     (//a.AccountId == accountId.Id &&
                    _appContactRelationshipInfoRepository.GetAll().Count(z => z.RequesterContactSSIN == accountSSIN &&
                    z.RecipientContactSSIN == a.SSIN && z.ConsiderAsTeamMember == true && z.EntityObjectStatusId == activeRealtionshipStatusId) > 0)
                    );


                var pagedAndFilteredAccounts = accountsList.OrderBy("name asc");


                var _accounts = from o in pagedAndFilteredAccounts
                                select new GetContactInformationDto()
                                {
                                    Code = o.Code,
                                    Id = o.Id,
                                    Name = o.Name,
                                    Email = o.EMailAddress,
                                    Phone = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1Number :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2Number :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3Number : null)),
                                    SSIN = o.SSIN,
                                    PhoneTypeId = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1TypeId :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2TypeId :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3TypeId : null)),
                                    PhoneTypeName = !string.IsNullOrEmpty(o.Phone1Number) ? o.Phone1TypeName :
                                (!string.IsNullOrEmpty(o.Phone2Number) ? o.Phone2TypeName :
                                (!string.IsNullOrEmpty(o.Phone3Number) ? o.Phone3TypeName : null))
                                };
                var accounts = await _accounts.ToListAsync();
                foreach (var con in accounts)
                {
                    var acc = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.Id == con.Id);
                    con.PhoneList = new List<PhoneNumberAndtype>();
                    if (acc.Phone1TypeId != null)
                    {
                        PhoneNumberAndtype phone = new PhoneNumberAndtype();
                        phone.PhoneNumber = acc.Phone1Number;
                        phone.PhoneTypeName = acc.Phone1TypeName;
                        phone.PhoneTypeId = acc.Phone1TypeId;
                        con.PhoneList.Add(phone);
                    }
                    if (acc.Phone2TypeId != null)
                    {
                        PhoneNumberAndtype phone = new PhoneNumberAndtype();
                        phone.PhoneNumber = acc.Phone2Number;
                        phone.PhoneTypeName = acc.Phone2TypeName;
                        phone.PhoneTypeId = acc.Phone2TypeId;
                        con.PhoneList.Add(phone);

                    }
                    if (acc.Phone3TypeId != null)
                    {
                        PhoneNumberAndtype phone = new PhoneNumberAndtype();
                        phone.PhoneNumber = acc.Phone3Number;
                        phone.PhoneTypeName = acc.Phone3TypeName;
                        phone.PhoneTypeId = acc.Phone3TypeId;
                        con.PhoneList.Add(phone);

                    }
                }
                return accounts;
            }
        }
        public async Task CancelTransaction(long transactionId)
        {
            var cancelStatusId = await _helper.SystemTables.GetEntityObjectStatusCancelledTransaction();
            var header = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(a => a.Id == transactionId);
            if (header != null)
            {
                //if (header.EntityObjectTypeId == soEntityObjectTypeId)
                {
                    header.EntityObjectStatusId = cancelStatusId;
                    await _appTransactionsHeaderRepository.UpdateAsync(header);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }

        }

        public async Task UnCancelTransaction(long transactionId)
        {
            var DraftStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
            var header = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(a => a.Id == transactionId);
            if (header != null)
            {
                //if (header.EntityObjectTypeId == soEntityObjectTypeId)
                {
                    header.EntityObjectStatusId = DraftStatusId;
                    await _appTransactionsHeaderRepository.UpdateAsync(header);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }

        }

        //xx
        public async Task DiscardTransaction(long transactionId)
        {

            var header = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(a => a.Id == transactionId);
            if (header != null)
            {
                //if (header.EntityObjectTypeId == soEntityObjectTypeId)
                {
                    header.EntityObjectStatusId = null;
                    header.EntityObjectStatusCode = null;
                    header.SellerCompanySSIN = "";
                    header.SellerCompanyName = "";
                    header.BuyerCompanyName = "";
                    header.BuyerCompanySSIN = "";
                    header.Notes = "";
                    //header.en
                    await _appTransactionsHeaderRepository.UpdateAsync(header);
                    //
                    var filteredMessages = await _MessagesRepository.GetAll()
                          .Where(e => (e.EntityFk.EntitiesRelationships.Where(ee => ee.RelatedEntityId == (long)header.Id).Count() > 0 ||
                                   e.EntityFk.RelatedEntitiesRelationships.Where(ee => ee.EntityId == (long)header.Id).Count() > 0)
                         && (e.EntityFk.EntityObjectTypeCode == MesasgeObjectType.Comment.ToString().ToUpper()
                               && e.OriginalMessageId == e.Id)).ToListAsync();
                    if (filteredMessages != null && filteredMessages.Count() > 0)
                    {
                        foreach (var message in filteredMessages)
                        {
                            await _MessagesRepository.DeleteAsync(message.Id);
                        }
                    }
                    //
                    await _appShoppingCartRepository.DeleteAsync(s => s.TransactionId == transactionId && s.TenantId == AbpSession.TenantId && s.CreatorUserId == AbpSession.UserId);
                    //
                    await _appTransactionContactsRepository.DeleteAsync(s => s.TransactionId == transactionId);
                    await _appTransactionDetails.DeleteAsync(s => s.TransactionId == transactionId);
                    await _appEntityCategoryRepository.DeleteAsync(z => z.EntityId == transactionId);
                    await _appEntityClassificationRepository.DeleteAsync(z => z.EntityId == transactionId);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }

        }
        //xx
        public async Task GetProductFromMarketplace(string productSSIN, int? tenantId, long transactionId)
        {
            if (tenantId == null || productSSIN==null)
                return;
            
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var appItem = await _appItems.GetAll().FirstOrDefaultAsync(x => x.TenantId == tenantId && x.SSIN == productSSIN);
                if (appItem == null)
                {
                    var marketplaceItem = await _appMarketplaceItem.GetAll()
                        // .Include(z=> z.ItemPricesFkList)
                        //.Include(z=>z.ItemSizeScaleHeadersFkList).ThenInclude(z => z.AppItemSizeScalesDetails)
                        .Include(z => z.EntityExtraData)
                        .Include(z => z.EntityAttachments).ThenInclude(s => s.AttachmentFk)
                        .Include(z => z.EntityClassifications).ThenInclude(z => z.EntityObjectClassificationFk)
                        .Include(z => z.EntityCategories).ThenInclude(z => z.EntityObjectCategoryFk)
                        .Include(z => z.ParentFkList).ThenInclude(z => z.ItemPricesFkList)
                        .Include(z => z.ParentFkList).ThenInclude(z => z.EntityExtraData)
                        .Include(z => z.ParentFkList).ThenInclude(z => z.EntityAttachments).ThenInclude(s => s.AttachmentFk)
                        .FirstOrDefaultAsync(s => s.SSIN == productSSIN);
                    //I49[Start]
                    string destinationAccSSIN = "";
                    string sourceAccSSIN = "";
                    long destinationAccRelationId = 0;
                    long sourceAccRelationId = 0;
                    string destinationRoleInTrans = "";
                    string sourceRoleInTrans = "";
                    string relationshipPriceLevel="";
                    var businessType = await _helper.SystemTables.GetEntityObjectTypeParetner();
                    if (marketplaceItem != null)
                    {
                        var destinationAccount = await _appMarketplaceContactRepository.GetAll()
                        .Where(z => z.EntityObjectTypeId == businessType.Id && z.IsProfileData == true && z.TenantOwner == tenantId && z.SharingLevel == 1)
                        .FirstOrDefaultAsync();
                        if (destinationAccount != null)
                        {
                            destinationAccSSIN = destinationAccount.SSIN;
                            
                        }
                        var sourceAccount = await _appMarketplaceContactRepository.GetAll()
                            .Where(z => z.EntityObjectTypeId == businessType.Id && z.IsProfileData == true && z.TenantOwner == marketplaceItem.TenantOwner && z.SharingLevel == 1)
                            .FirstOrDefaultAsync();
                        if (sourceAccount!=null)
                        {
                            sourceAccSSIN = sourceAccount.SSIN;
                        }
                    }
                    List<AppTransactionContacts> transactionContacts = null;
                    if (!string.IsNullOrEmpty(destinationAccSSIN) && !string.IsNullOrEmpty(sourceAccSSIN))
                    {
                        transactionContacts = await _appTransactionContactsRepository.GetAll().Where(z => z.TransactionId == transactionId).ToListAsync();
                        if (transactionContacts == null || transactionContacts.Count == 0)
                        {
                           var marketplaceTransactionContacts = await _appMarketplaceTransctionContactsRepository.GetAll().Where(z => z.TransactionId == transactionId).ToListAsync();
                            if (marketplaceTransactionContacts != null && marketplaceTransactionContacts.Count() > 0)
                            {
                                transactionContacts = ObjectMapper.Map<List<AppTransactionContacts>>(marketplaceTransactionContacts);
                            }
                        }
                        if (transactionContacts != null && transactionContacts.Count > 0)
                        {
                            var accRole = transactionContacts.Where(z => z.CompanySSIN == destinationAccSSIN).FirstOrDefault();
                            if (accRole != null)
                            {
                                destinationAccRelationId = accRole.Id; //Should be RelationshipId not Id
                                destinationRoleInTrans = accRole.ContactRole;
                            }
                            var accSrcRole = transactionContacts.Where(z => z.CompanySSIN == sourceAccSSIN).FirstOrDefault();
                            if (accSrcRole != null)
                            {
                                sourceAccRelationId = accSrcRole.Id;//Should be RelationshipId not Id
                                sourceRoleInTrans = accSrcRole.ContactRole;
                            }
                            var activeRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
                            var relationshipSellBuy = await _appContactRelationshipInfoRepository.GetAll()
                                .Where(z => (z.RequesterContactSSIN == sourceAccSSIN && z.RecipientContactSSIN == destinationAccSSIN &&
                                z.RequesterMarketplaceRole == sourceRoleInTrans &&
                                z.RecipientMarketplaceRole == destinationRoleInTrans) ||
                                (z.RecipientContactSSIN == sourceAccSSIN && z.RequesterContactSSIN == destinationAccSSIN &&
                                z.RecipientMarketplaceRole == sourceRoleInTrans &&
                                z.RequesterMarketplaceRole == destinationRoleInTrans) &&
                                z.EntityObjectStatusId == activeRealtionshipStatusId
                                ).Include(z=>z.EntityExtraData).FirstOrDefaultAsync();
                            if (relationshipSellBuy != null)
                            {
                                var priceLevelExtradata = relationshipSellBuy.EntityExtraData.Where(z => z.AttributeId == 908).FirstOrDefault();
                                if (priceLevelExtradata != null && !string.IsNullOrEmpty(priceLevelExtradata.AttributeValue))
                                    relationshipPriceLevel = priceLevelExtradata.AttributeValue;
                            }
                        }
                    }
                    //I49[End]
                    marketplaceItem.ItemPricesFkList = await _appMarketplaceItemPricesRepository.GetAll()
                        .Where(s => s.AppMarketplaceItemId == marketplaceItem.Id).ToListAsync();

                    marketplaceItem.ItemSizeScaleHeadersFkList = await _appMarketplaceItemSizeScaleHeadersRepository.GetAll()
                        .Include(s => s.AppItemSizeScalesDetails).Where(s => s.AppMarketplaceItemId == marketplaceItem.Id).ToListAsync();
                    // marketplaceItem.EntityAttachments = (await _appEntity.GetAll().
                    //    Include(z => z.EntityAttachments).ThenInclude(s => s.AttachmentFk).Where(d => d.Id == marketplaceItem.Id).FirstOrDefaultAsync()).EntityAttachments;
                    //MMT2024-04
                    string nextCode = "";
                    bool llNewCodeFound = false;
                    while (!llNewCodeFound)
                    {
                        nextCode = await _appItemsAppService.GenerateProductCode(int.Parse(marketplaceItem.EntityObjectTypeId.ToString()), true, tenantId);
                        if (!string.IsNullOrEmpty(nextCode))
                        {
                            var appItemExist = await _appItems.GetAll().Where(r => r.Code == nextCode && r.ItemType == 0 && r.TenantId == tenantId).FirstOrDefaultAsync();
                            if (appItemExist != null)
                            {
                                continue;
                            }
                            else
                            {
                                llNewCodeFound = true;
                            }
                        }
                        else
                        {
                            llNewCodeFound = true;
                        }

                    }
                    if (!llNewCodeFound || string.IsNullOrEmpty(nextCode))
                        nextCode = marketplaceItem.Code;
                    //MMT2024-04

                    AppEntity entityMain = new AppEntity();
                    entityMain = ObjectMapper.Map<AppEntity>(marketplaceItem);
                    entityMain.Id = 0;
                    //if (entityMain.EntityExtraData != null && entityMain.EntityExtraData.Count() > 0)
                    //{
                    //    foreach (var ext in entityMain.EntityExtraData)
                    //    {
                    //        ext.EntityId = 0;
                    //        ext.Id = 0;
                    //        ext.EntityFk = null;
                    //        ext.EntityCode = entityMain.Code;


                    //    }
                    //}
                    entityMain.EntityExtraData = null;
                    entityMain.EntityAttachments = null;

                    //entityMain.EntityCategories.ForEach(d => d.Id = 0);
                    //entityMain.EntityCategories.ForEach(d => d.EntityFk = null);
                    //entityMain.EntityCategories.ForEach(d => d.EntityCode = entityMain.Code);
                    //entityMain.EntityCategories.ForEach(d => d.EntityId = 0);
                    //entityMain.EntityClassifications.ForEach(d => d.EntityId = 0);
                    //entityMain.EntityClassifications.ForEach(d => d.EntityFk = null);
                    //entityMain.EntityClassifications.ForEach(d => d.EntityCode = entityMain.Code);
                    //entityMain.EntityClassifications.ForEach(d => d.Id = 0);
                    entityMain.EntityClassifications = null;
                    entityMain.EntityCategories = null;
                    entityMain.TenantId = tenantId;
                    entityMain.Code = nextCode;
                    entityMain.TenantOwner = marketplaceItem.TenantOwner;
                    //   var entityId = await _appEntity.InsertAsync(entityMain);
                    var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                    entityMain.ObjectId = itemObjectId;

                    AppItem item = new AppItem();
                    item.Code = nextCode;

                    item.Description = marketplaceItem.Description;
                    item.Name = entityMain.Name;
                    item.ParentId = null;
                    item.SSIN = marketplaceItem.SSIN;
                    item.TenantOwner = marketplaceItem.TenantOwner;
                    item.Id = 0;
                    item.Variations = marketplaceItem.Variations;
                    item.TenantId = tenantId;
                    item.Price = marketplaceItem.Price;
                    item.TimeStamp = marketplaceItem.TimeStamp;
                    item.ItemPricesFkList = null;
                    //item.ItemPricesFkList = ObjectMapper.Map<List<AppItemPrices>>(marketplaceItem.ItemPricesFkList);
                    //foreach (var itemPrice in item.ItemPricesFkList)
                    //{
                    //    itemPrice.Id = 0;
                    //    itemPrice.AppItemId = 0;
                    //    itemPrice.TenantId = AbpSession.TenantId;
                    //}
                    // item.ItemPricesFkList.ForEach(s=>s.Id=0);
                    item.ItemSizeScaleHeadersFkList = new List<AppItemSizeScalesHeader>();
                    //ObjectMapper.Map<List<AppItemSizeScalesHeader>>(marketplaceItem.ItemSizeScaleHeadersFkList);
                    //long parentScle = 0;
                    //foreach (var scaleHeader in marketplaceItem.ItemSizeScaleHeadersFkList.OrderByDescending(a=>a.ParentId))
                    //{
                    //    var itemSizeScaleHeader = ObjectMapper.Map<AppItemSizeScalesHeader>(scaleHeader);
                    //    itemSizeScaleHeader.Id = 0;
                    //    if (itemSizeScaleHeader.ParentId == null)
                    //        parentScle = itemSizeScaleHeader.Id;
                    //    else
                    //        itemSizeScaleHeader.ParentId =parentScle;

                    //    itemSizeScaleHeader.AppItemSizeScalesDetails = ObjectMapper.Map<List<AppItemSizeScalesDetails>>(scaleHeader.AppItemSizeScalesDetails);
                    //    foreach (var det in itemSizeScaleHeader.AppItemSizeScalesDetails)
                    //    {
                    //        det.Id = 0;
                    //        det.SizeScaleId = 0;
                    //    }
                    //   // itemSizeScaleHeader.AppItemSizeScalesDetails.ForEach(a=>a.Id=0);
                    //   // itemSizeScaleHeader.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = itemSizeScaleHeader.Id);
                    //    item.ItemSizeScaleHeadersFkList.Add(itemSizeScaleHeader);
                    IList<VariationItemDto> variationListOrg = ObjectMapper.Map<IList<VariationItemDto>>(marketplaceItem.ParentFkList);
                    foreach (var vari in variationListOrg)
                        vari.Id = 0;
                    var identifier = await GetProductTypeIdentifier(int.Parse(marketplaceItem.EntityObjectTypeId.ToString()), tenantId);
                    if (identifier == null)
                    {
                        var orgItem = await _appItems.GetAll().Where(z => z.SSIN == marketplaceItem.SSIN && z.TenantId == z.TenantOwner).FirstOrDefaultAsync();
                        identifier = orgItem.SycIdentifierId;
                    }
                    var variationList = await _appItemsAppService.GetVariationsCodes(long.Parse(identifier.ToString()), nextCode, variationListOrg, marketplaceItem.EntityObjectTypeId, tenantId);
                    item.SycIdentifierId = identifier;
                    //}
                    var customPrice = marketplaceItem.ItemPricesFkList.Where(z => z.BuyerSSIN == destinationAccSSIN).FirstOrDefault();
                    bool hasCustomPrice = (customPrice != null);
                    item.EntityFk = entityMain;
                    foreach (var variation in marketplaceItem.ParentFkList)
                    {
                        var itemVar = variationList.FirstOrDefault(z => z.SSIN == variation.SSIN);

                        AppItem varItem = new AppItem();
                        varItem.Code = itemVar.Code;
                        varItem.Description = variation.Description;
                        varItem.Name = variation.Name;
                        // item.ParentId = null;
                        varItem.SSIN = variation.SSIN;
                        varItem.TenantOwner = variation.TenantOwner;
                        varItem.Id = 0;
                        //item.EntityId = 0;
                        varItem.TenantId = tenantId;
                        varItem.Price = variation.Price;
                        varItem.TimeStamp = variation.TimeStamp;
                        varItem.ItemPricesFkList = null;
                        AppEntity entityVar = new AppEntity();
                        entityVar = ObjectMapper.Map<AppEntity>(variation);
                        entityVar.Id = 0;
                        entityVar.EntityExtraData = null;
                        entityVar.ObjectId = itemObjectId;
                        entityVar.Code = itemVar.Code;
                        entityVar.EntityAttachments = null;
                        entityVar.EntityClassifications = null;
                        entityVar.EntityCategories = null;
                        entityVar.TenantId = tenantId;
                        entityVar.TenantOwner = variation.TenantOwner;
                        varItem.EntityFk = entityVar;
                        varItem.ParentEntityFk = item.EntityFk;
                        varItem.ItemPricesFkList = new List<AppItemPrices>();
                        foreach (var itemPrice in variation.ItemPricesFkList)
                        {
                            if (itemPrice.Code == "MSRP" ||
                               (hasCustomPrice ? itemPrice.BuyerSSIN == destinationAccSSIN:(itemPrice.Code == relationshipPriceLevel)))
                            { 
                                var price = new AppItemPrices();
                                price.Id = 0;
                                price.AppItemCode = varItem.Code;
                                price.AppItemId = varItem.Id;
                                price.TenantId = tenantId;
                                price.AppItemFk = varItem;
                                price.Code = itemPrice.Code;
                                price.CurrencyCode = itemPrice.CurrencyCode;
                                price.CurrencyId = itemPrice.CurrencyId;
                                price.Price = itemPrice.Price;
                                if ((destinationRoleInTrans == ContactRoleEnum.Buyer.ToString() &&
                                     itemPrice.Code != "MSRP"))
                                {
                                    price.BuyerSSIN = itemPrice.BuyerSSIN;
                                    price.SellerSSIN = sourceAccSSIN;
                                }
                                varItem.ItemPricesFkList.Add(price);
                            }
                        }


                        if (item.ParentFkList == null)
                            item.ParentFkList = new List<AppItem>();
                        //MMTM
                        var variationExist = item.ParentFkList.Where(z => z.Code == varItem.Code).FirstOrDefault();
                        if (variationExist == null)
                            //MMTM
                            item.ParentFkList.Add(varItem);

                    }


                    // return;
                    item.ItemPricesFkList = new List<AppItemPrices>(); //ObjectMapper.Map<List<AppItemPrices>>(marketplaceItem.ItemPricesFkList);
                    
                   
                    foreach (var itemPrice in marketplaceItem.ItemPricesFkList)
                    {
                        if (itemPrice.Code == "MSRP" ||
                            (hasCustomPrice ? 
                            itemPrice.BuyerSSIN == destinationAccSSIN 
                            : (itemPrice.Code == relationshipPriceLevel)))
                        {
                            var price = new AppItemPrices();
                            price.Id = 0;
                            price.AppItemId = item.Id;
                            price.AppItemCode = item.Code;
                            price.TenantId = tenantId;
                            price.AppItemFk = item;
                            price.Code = itemPrice.Code;
                            price.CurrencyCode = itemPrice.CurrencyCode;
                            price.CurrencyId = itemPrice.CurrencyId;
                            price.Price = itemPrice.Price;
                            
                            if ((destinationRoleInTrans == ContactRoleEnum.Buyer.ToString() &&
                                itemPrice.Code != "MSRP"))
                            {
                                price.BuyerSSIN = itemPrice.BuyerSSIN;
                                price.SellerSSIN =sourceAccSSIN;
                            }
                            item.ItemPricesFkList.Add(price);
                        }
                    }


                    //I45 await _appItems.InsertAsync(item);
                    //I45 await CurrentUnitOfWork.SaveChangesAsync();
                    // return;
                    //item.ItemSizeScaleHeadersFkList = new List<AppItemSizeScalesHeader>();
                    //    //ObjectMapper.Map<List<AppItemSizeScalesHeader>>(marketplaceItem.ItemSizeScaleHeadersFkList);
                    //    long parentScle = 0;
                    //    foreach (var scaleHeader in marketplaceItem.ItemSizeScaleHeadersFkList.OrderByDescending(a => a.ParentId))
                    //    {
                    //        var itemSizeScaleHeader = ObjectMapper.Map<AppItemSizeScalesHeader>(scaleHeader);
                    //        itemSizeScaleHeader.Id = 0;
                    //        if (itemSizeScaleHeader.ParentId == null)
                    //            parentScle = itemSizeScaleHeader.Id;
                    //        else
                    //            itemSizeScaleHeader.ParentId = parentScle;

                    //        itemSizeScaleHeader.AppItemSizeScalesDetails = ObjectMapper.Map<List<AppItemSizeScalesDetails>>(scaleHeader.AppItemSizeScalesDetails);
                    //        foreach (var det in itemSizeScaleHeader.AppItemSizeScalesDetails)
                    //        {
                    //            det.Id = 0;
                    //            det.SizeScaleId = 0;
                    //        }
                    //        // itemSizeScaleHeader.AppItemSizeScalesDetails.ForEach(a=>a.Id=0);
                    //        // itemSizeScaleHeader.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = itemSizeScaleHeader.Id);
                    //        item.ItemSizeScaleHeadersFkList.Add(itemSizeScaleHeader);
                    //    }
                    // _appItemPricesRepository.InsertRange(item.ItemPricesFkList);
                    //  item.ItemPricesFkList = null;

                    //if (item.EntityFk.EntityAttachments != null && item.EntityFk.EntityAttachments.Count() > 0)
                    //{
                    //    foreach (var attch in item.EntityFk.EntityAttachments)
                    //    {
                    //        attch.Id = 0;

                    //        attch.EntityId = 0;
                    //        attch.EntityFk = null;
                    //        attch.AttachmentFk.TenantId = AbpSession.TenantId;
                    //        MoveFile(attch.AttachmentFk.Attachment, AbpSession.TenantId, -1);
                    //        attch.AttachmentId = 0;
                    //        attch.AttachmentFk.Id = 0;
                    //    }
                    //}
                    if (marketplaceItem.EntityAttachments != null && marketplaceItem.EntityAttachments.Count() > 0)
                    {
                        entityMain.EntityAttachments = new List<AppEntityAttachment>();
                        foreach (var attch in marketplaceItem.EntityAttachments)
                        {
                            AppEntityAttachment appAtt = new AppEntityAttachment();
                            appAtt.Id = 0;
                            appAtt.AttachmentCategoryCode = attch.AttachmentCategoryCode;
                            appAtt.AttachmentCategoryFk = attch.AttachmentCategoryFk;
                            appAtt.AttachmentCategoryId = attch.AttachmentCategoryId;
                            appAtt.AttachmentCode = attch.AttachmentCode;
                            appAtt.Attributes = attch.Attributes;
                            // appAtt.AttachmentFk = attch.AttachmentFk;
                            appAtt.EntityId = 0;
                            appAtt.EntityCode = entityMain.Code;
                            appAtt.EntityFk = null;
                            appAtt.AttachmentFk = new Attachments.AppAttachment();
                            appAtt.AttachmentFk.Attachment = attch.AttachmentFk.Attachment;
                            appAtt.AttachmentFk.TenantId = tenantId;
                            appAtt.AttachmentFk.Id = 0;
                            appAtt.AttachmentFk.Code = attch.AttachmentFk.Code;
                            appAtt.AttachmentFk.Name = attch.AttachmentFk.Name;
                            appAtt.AttachmentFk.Attributes = attch.AttachmentFk.Attributes;

                            MoveFile(attch.AttachmentFk.Attachment, -1, tenantId, null);
                            appAtt.AttachmentId = 0;
                            appAtt.IsDefault = attch.IsDefault;
                            entityMain.EntityAttachments.Add(appAtt);
                        }
                        //I45[start]
                        //saveItemDto.EntityAttachments = entityMain.EntityAttachments;
                        //I45[End]
                    }

                    if (marketplaceItem.EntityExtraData != null && marketplaceItem.EntityExtraData.Count() > 0)
                    {
                        item.EntityFk.EntityExtraData = new List<AppEntityExtraData>();
                        foreach (var ext in marketplaceItem.EntityExtraData)
                        {
                            AppEntityExtraData extr = new AppEntityExtraData();
                            extr.AttributeValue = ext.AttributeValue;
                            extr.AttributeValueFk = ext.AttributeValueFk;
                            extr.AttributeValueId = ext.AttributeValueId;
                            extr.AttributeId = ext.AttributeId;
                            extr.AttributeCode = ext.AttributeCode;
                            extr.EntityObjectTypeName = ext.EntityObjectTypeName;
                            extr.EntityObjectTypeId = ext.EntityObjectTypeId;
                            extr.EntityObjectTypeCode = ext.EntityObjectTypeCode;
                            extr.EntityObjectTypeFk = ext.EntityObjectTypeFk;
                            extr.EntityId = item.EntityFk.Id;
                            extr.Id = 0;
                            extr.EntityFk = null;
                            extr.EntityCode = entityMain.Code;
                            item.EntityFk.EntityExtraData.Add(extr);

                        }
                        //I45[start]
                        //saveItemDto.EntityExtraData = entityMain.EntityExtraData;
                        //I45[End]
                    }

                    {
                        if (marketplaceItem.EntityCategories != null)
                        {
                            item.EntityFk.EntityCategories = new List<AppEntityCategory>();
                            foreach (var cat in marketplaceItem.EntityCategories)
                            {
                                AppEntityCategory entCategory = new AppEntityCategory();
                                entCategory.EntityId = entityMain.Id;
                                entCategory.EntityCode = entityMain.Code;
                                entCategory.EntityObjectCategoryCode = cat.EntityObjectCategoryCode;
                                entCategory.EntityObjectCategoryId = cat.EntityObjectCategoryId;
                                entCategory.EntityObjectCategoryFk = cat.EntityObjectCategoryFk;
                                item.EntityFk.EntityCategories.Add(entCategory);
                            }
                            //I45[start]
                            //saveItemDto.EntityCategories = item.EntityFk.EntityCategories;
                            //I45[End]
                        }

                        if (marketplaceItem.EntityClassifications != null)
                        {
                            item.EntityFk.EntityClassifications = new List<AppEntityClassification>();
                            foreach (var cal in marketplaceItem.EntityClassifications)
                            {
                                AppEntityClassification entClass = new AppEntityClassification();
                                entClass.EntityId = entityMain.Id;
                                entClass.EntityCode = entityMain.Code;
                                entClass.EntityObjectClassificationCode = cal.EntityObjectClassificationCode;
                                entClass.EntityObjectClassificationId = cal.EntityObjectClassificationId;
                                entClass.EntityObjectClassificationFk = cal.EntityObjectClassificationFk; ;
                                item.EntityFk.EntityClassifications.Add(entClass);
                            }
                            //I45[start]
                            //saveItemDto.EntityClassifications = ObjectMapper.Map<List<AppEntityClassificationDto>>(item.EntityFk.EntityClassifications);
                            //I45[End]
                        }
                        //I45 _appEntity.UpdateAsync(item.EntityFk);

                        //item.ItemSizeScaleHeadersFkList = new List<AppItemSizeScalesHeader>();
                        ////ObjectMapper.Map<List<AppItemSizeScalesHeader>>(marketplaceItem.ItemSizeScaleHeadersFkList);
                        //long parentScle = 0;
                        //foreach (var scaleHeader in marketplaceItem.ItemSizeScaleHeadersFkList.OrderByDescending(a => a.ParentId))
                        //{
                        //    var itemSizeScaleHeader = ObjectMapper.Map<AppItemSizeScalesHeader>(scaleHeader);
                        //    itemSizeScaleHeader.Id = 0;
                        //    if (itemSizeScaleHeader.ParentId == null)
                        //        parentScle = itemSizeScaleHeader.Id;
                        //    else
                        //        itemSizeScaleHeader.ParentId = parentScle;

                        //    itemSizeScaleHeader.AppItemSizeScalesDetails = ObjectMapper.Map<List<AppItemSizeScalesDetails>>(scaleHeader.AppItemSizeScalesDetails);
                        //    foreach (var det in itemSizeScaleHeader.AppItemSizeScalesDetails)
                        //    {
                        //        det.Id = 0;
                        //        det.SizeScaleId = 0;
                        //    }
                        //    // itemSizeScaleHeader.AppItemSizeScalesDetails.ForEach(a=>a.Id=0);
                        //    // itemSizeScaleHeader.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = itemSizeScaleHeader.Id);
                        //    item.ItemSizeScaleHeadersFkList.Add(itemSizeScaleHeader);
                        //}
                        // await _appItems.UpdateAsync(item);
                        //    await CurrentUnitOfWork.SaveChangesAsync();
                        // await _appEntity.UpdateAsync(entityMain);
                        //return;
                        foreach (var variation in marketplaceItem.ParentFkList)
                        {
                            // var tenantVariation = await _appItems.GetAll().Include(S => S.EntityFk).FirstOrDefaultAsync(s => s.SSIN == variation.SSIN && s.TenantId == AbpSession.TenantId);
                            var tenantVariation = item.ParentFkList.FirstOrDefault(s => s.SSIN == variation.SSIN);
                            if (tenantVariation != null)
                            {
                                if (variation.EntityExtraData != null)
                                {
                                    tenantVariation.EntityFk.EntityExtraData = new List<AppEntityExtraData>();
                                    foreach (var ext in variation.EntityExtraData)
                                    {
                                        AppEntityExtraData extr = new AppEntityExtraData();
                                        extr.AttributeValue = ext.AttributeValue;
                                        extr.AttributeValueFk = ext.AttributeValueFk;
                                        extr.AttributeValueId = ext.AttributeValueId;
                                        extr.AttributeId = ext.AttributeId;
                                        extr.AttributeCode = ext.AttributeCode;
                                        extr.EntityObjectTypeName = ext.EntityObjectTypeName;
                                        extr.EntityObjectTypeId = ext.EntityObjectTypeId;
                                        extr.EntityObjectTypeCode = ext.EntityObjectTypeCode;
                                        extr.EntityObjectTypeFk = ext.EntityObjectTypeFk;
                                        extr.EntityId = tenantVariation.EntityFk.Id;
                                        extr.Id = 0;
                                        extr.EntityFk = null;
                                        extr.EntityCode = tenantVariation.Code;

                                        if (ext.AttributeId == 202 && !string.IsNullOrEmpty(ext.AttributeValue))
                                            MoveFile(ext.AttributeValue, -1, tenantId, null);

                                        tenantVariation.EntityFk.EntityExtraData.Add(extr);
                                    }
                                }
                                if (variation.EntityCategories != null)
                                {
                                    tenantVariation.EntityFk.EntityCategories = new List<AppEntityCategory>();
                                    foreach (var cat in variation.EntityCategories)
                                    {
                                        AppEntityCategory entCategory = new AppEntityCategory();
                                        entCategory.EntityId = tenantVariation.EntityFk.Id;
                                        entCategory.EntityCode = tenantVariation.Code;
                                        entCategory.EntityObjectCategoryCode = cat.EntityObjectCategoryCode;
                                        entCategory.EntityObjectCategoryId = cat.EntityObjectCategoryId;
                                        entCategory.EntityObjectCategoryFk = cat.EntityObjectCategoryFk;
                                        tenantVariation.EntityFk.EntityCategories.Add(entCategory);
                                    }
                                }
                                if (variation.EntityClassifications != null)
                                {
                                    tenantVariation.EntityFk.EntityClassifications = new List<AppEntityClassification>();
                                    foreach (var cal in variation.EntityClassifications)
                                    {
                                        AppEntityClassification entClass = new AppEntityClassification();
                                        entClass.EntityId = tenantVariation.EntityFk.Id;
                                        entClass.EntityCode = tenantVariation.Code;
                                        entClass.EntityObjectClassificationCode = cal.EntityObjectClassificationCode;
                                        entClass.EntityObjectClassificationId = cal.EntityObjectClassificationId;
                                        entClass.EntityObjectClassificationFk = cal.EntityObjectClassificationFk;
                                        tenantVariation.EntityFk.EntityClassifications.Add(entClass);
                                    }
                                }
                                if (variation.EntityAttachments != null && variation.EntityAttachments.Count() > 0)
                                {
                                    tenantVariation.EntityFk.EntityAttachments = new List<AppEntityAttachment>();
                                    foreach (var attch in variation.EntityAttachments)
                                    {
                                        AppEntityAttachment appAtt = new AppEntityAttachment();
                                        appAtt.Id = 0;
                                        appAtt.AttachmentCategoryCode = attch.AttachmentCategoryCode;
                                        appAtt.AttachmentCategoryFk = attch.AttachmentCategoryFk;
                                        appAtt.AttachmentCategoryId = attch.AttachmentCategoryId;
                                        appAtt.AttachmentCode = attch.AttachmentCode;
                                        appAtt.Attributes = attch.Attributes;
                                        appAtt.AttachmentFk = attch.AttachmentFk;
                                        appAtt.EntityId = 0;
                                        appAtt.EntityFk = null;
                                        appAtt.EntityCode = tenantVariation.EntityFk.Code;
                                        appAtt.AttachmentFk = new Attachments.AppAttachment();
                                        appAtt.AttachmentFk.Attachment = attch.AttachmentFk.Attachment;
                                        appAtt.AttachmentFk.TenantId = tenantId;
                                        appAtt.AttachmentFk.Id = 0;
                                        appAtt.AttachmentFk.Code = attch.AttachmentFk.Code;
                                        appAtt.AttachmentFk.Name = attch.AttachmentFk.Name;
                                        appAtt.AttachmentFk.Attributes = attch.AttachmentFk.Attributes;
                                        MoveFile(attch.AttachmentFk.Attachment, -1, tenantId, null);
                                        appAtt.AttachmentId = 0;
                                        appAtt.IsDefault = attch.IsDefault;
                                        tenantVariation.EntityFk.EntityAttachments.Add(appAtt);
                                    }
                                }
                                //I45   _appEntity.UpdateAsync(tenantVariation.EntityFk);
                                // tenantVariation.ItemPricesFkList = null;// new List<AppItemPrices>();
                                //foreach (var itemPrice in variation.ItemPricesFkList)
                                //{
                                //    var price = new AppItemPrices();
                                //    price.Id = 0;
                                //    price.AppItemId = tenantVariation.Id;
                                //    price.TenantId = AbpSession.TenantId;
                                //    price.AppItemFk = tenantVariation;
                                //    price.Code = itemPrice.Code;
                                //    price.CurrencyCode = itemPrice.CurrencyCode;
                                //    price.CurrencyId = itemPrice.CurrencyId;
                                //    price.Price = itemPrice.Price;
                                //    tenantVariation.ItemPricesFkList.Add(price);
                                //}
                                //await _appItems.UpdateAsync(tenantVariation);
                            }
                        }
                        // item.ItemPricesFkList = null;
                        //await _appItems.UpdateAsync(item);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        // return;
                        item.ItemSizeScaleHeadersFkList = new List<AppItemSizeScalesHeader>();
                        var x = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);


                        long parentScle = 0;
                        onetouch.AppItems.AppItemSizeScalesHeader parentScale = new AppItemSizeScalesHeader();
                        onetouch.AppItems.AppItemSizeScalesHeader itemSizeScaleHeader = new AppItemSizeScalesHeader();
                        var sizeScale = marketplaceItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId == null);
                        if (sizeScale != null)
                        {
                            itemSizeScaleHeader = ObjectMapper.Map<onetouch.AppItems.AppItemSizeScalesHeader>(sizeScale);
                            itemSizeScaleHeader.Id = 0;
                            itemSizeScaleHeader.AppItemId = item.Id;
                            itemSizeScaleHeader.AppItemFk = item;
                            itemSizeScaleHeader.SizeScaleId = null;
                            itemSizeScaleHeader.TenantId = tenantId;
                            itemSizeScaleHeader.AppItemSizeScalesDetails = ObjectMapper.Map<List<onetouch.AppItems.AppItemSizeScalesDetails>>(sizeScale.AppItemSizeScalesDetails);
                            foreach (var det in itemSizeScaleHeader.AppItemSizeScalesDetails)
                            {
                                det.Id = 0;
                                det.SizeScaleId = 0;
                                det.SizeScaleFK = null;
                            }
                            item.ItemSizeScaleHeadersFkList.Add(itemSizeScaleHeader);
                            //I45 await _appItemSizeScaleHeadersRepository.InsertAsync(itemSizeScaleHeader);
                            //I45 await CurrentUnitOfWork.SaveChangesAsync();
                            var sizeScaleRatio = marketplaceItem.ItemSizeScaleHeadersFkList.FirstOrDefault(z => z.ParentId != null);
                            if (sizeScaleRatio != null)
                            {
                                onetouch.AppItems.AppItemSizeScalesHeader sizeRatio = ObjectMapper.Map<onetouch.AppItems.AppItemSizeScalesHeader>(sizeScaleRatio);
                                sizeRatio.Id = 0;
                                sizeRatio.AppItemId = item.Id;
                                sizeRatio.AppItemFk = item;
                                sizeRatio.SizeScaleId = null;
                                sizeRatio.TenantId = tenantId;
                                sizeRatio.AppItemSizeScalesDetails = ObjectMapper.Map<List<onetouch.AppItems.AppItemSizeScalesDetails>>(sizeRatio.AppItemSizeScalesDetails);
                                foreach (var det in sizeRatio.AppItemSizeScalesDetails)
                                {
                                    det.Id = 0;
                                    det.SizeScaleId = 0;
                                    det.SizeScaleFK = null;
                                }
                                sizeRatio.ItemSizeScaleFK = itemSizeScaleHeader;
                                item.ItemSizeScaleHeadersFkList.Add(sizeRatio);
                                //I45 await _appItemSizeScaleHeadersRepository.InsertAsync(sizeRatio);
                                //I45 await CurrentUnitOfWork.SaveChangesAsync();
                            }


                        }

                        //item.ItemSizeScaleHeadersFkList.Add(itemSizeScaleHeader);
                        // await _appItems.UpdateAsync(item);




                        //foreach (var scaleHeader in marketplaceItem.ItemSizeScaleHeadersFkList.OrderBy(a => a.ParentId))
                        //{
                        //    itemSizeScaleHeader = ObjectMapper.Map<onetouch.AppItems.AppItemSizeScalesHeader>(scaleHeader);
                        //    itemSizeScaleHeader.Id = 0;
                        //    itemSizeScaleHeader.AppItemId = item.Id;
                        //    itemSizeScaleHeader.AppItemFk = item;
                        //    itemSizeScaleHeader.SizeScaleId = null;
                        //    itemSizeScaleHeader.TenantId = AbpSession.TenantId;
                        //    if (itemSizeScaleHeader.ParentId != null)
                        //    {
                        //        itemSizeScaleHeader.ParentId = parentScle;
                        //        itemSizeScaleHeader.ItemSizeScaleFK = itemSizeScaleHeader;
                        //    }
                        //    itemSizeScaleHeader.AppItemSizeScalesDetails = ObjectMapper.Map<List<onetouch.AppItems.AppItemSizeScalesDetails>>(scaleHeader.AppItemSizeScalesDetails);
                        //    foreach (var det in itemSizeScaleHeader.AppItemSizeScalesDetails)
                        //    {
                        //        det.Id = 0;
                        //        det.SizeScaleId = 0;
                        //        det.SizeScaleFK = null;
                        //    }

                        //    // x.Entry<AppItem>(item).State = EntityState.Unchanged;
                        //    // itemSizeScaleHeader.AppItemSizeScalesDetails.ForEach(a=>a.Id=0);
                        //    // itemSizeScaleHeader.AppItemSizeScalesDetails.ForEach(a => a.SizeScaleId = itemSizeScaleHeader.Id);
                        //    //item.ItemSizeScaleHeadersFkList.Add(itemSizeScaleHeader);

                        //    //item.ItemSizeScaleHeadersFkList.Add(itemSizeScaleHeader);
                        //    // x.ChangeTracker.Clear();
                        //    //  await _appItemSizeScaleHeadersRepository.InsertAsync(itemSizeScaleHeader);
                        //    //await CurrentUnitOfWork.SaveChangesAsync();

                        //    //if (itemSizeScaleHeader.ParentId == null)
                        //    //{
                        //    //    x.ChangeTracker.Clear();
                        //    await _appItems.UpdateAsync(item);
                        //       await CurrentUnitOfWork.SaveChangesAsync();
                        //       x.Entry<AppItem>(item).State = EntityState.Unchanged;
                        //    //}
                        //    //else
                        //    //{
                        //    //    //   await _appItems.UpdateAsync(item);
                        //    //   // x.Entry<AppItem>(item).State = EntityState.Unchanged;
                        //    //  //  await _appItemSizeScaleHeadersRepository.InsertAsync(itemSizeScaleHeader);
                        //    //}
                        //    if (itemSizeScaleHeader.ParentId == null)
                        //    {
                        //        parentScle = itemSizeScaleHeader.Id;
                        //        parentScale = itemSizeScaleHeader;
                        //    }

                        //}
                        //item.ItemSizeScaleHeadersFkList.Add(itemSizeScaleHeader);
                        //await _appItems.UpdateAsync(item);
                        //  await CurrentUnitOfWork.SaveChangesAsync();
                        //I45[Start]
                        CreateOrEditAppItemDto saveItemDto = new CreateOrEditAppItemDto();
                        saveItemDto = ObjectMapper.Map<CreateOrEditAppItemDto>(item);
                        saveItemDto.NonLookupValues = new List<LookupLabelDto>();
                        saveItemDto.ManufacturerCode = marketplaceItem.ManufacturerCode;
                        saveItemDto.Price = marketplaceItem.Price;
                        if (saveItemDto.VariationItems != null && saveItemDto.VariationItems.Count > 0)
                        {
                            foreach (var variation in saveItemDto.VariationItems)
                            {
                                var varItem = marketplaceItem.ParentFkList.Where(z => z.SSIN == variation.SSIN).FirstOrDefault();
                                if (varItem != null)
                                {
                                    variation.ManufacturerCode = varItem.ManufacturerCode;
                                    variation.Price = varItem.Price;
                                }
;
                            }
                        }
                        saveItemDto.OriginalCode = saveItemDto.Code;
                        await _appItemsAppService.CreateOrEdit(saveItemDto);
                        //145[End]
                    }
                }
            }
        }
        public async Task<Byte[]> GetTransactionOrderConfirmation(long transactionId)
        {
            Byte[] returnList = new Byte[1];
            var transOrg = await _appTransactionsHeaderRepository.GetAll()
                    .Include(a => a.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                .Where(a => a.Id == transactionId).FirstOrDefaultAsync();
            if (transOrg != null)
            {
                if (transOrg.EntityAttachments != null && transOrg.EntityAttachments.Count > 0)
                {
                    string filePath = _appConfiguration[$"Attachment:Path"] + @"\" + (transOrg.TenantId == null ? "-1" : transOrg.TenantId.ToString()) + @"\" + transOrg.EntityAttachments[0].AttachmentFk.Attachment;
                    if (System.IO.File.Exists(filePath))
                    {
                        returnList = System.IO.File.ReadAllBytes(filePath);
                        //   viewTrans.EntityAttachments[0].Url = @"attachments/" + (viewTrans.TenantId == null ? -1 : viewTrans.TenantId) + @"/" + viewTrans.EntityAttachments[0].FileName;
                    }
                }
            }
            return returnList;

        }
        //MMT-Show Sub Categories and classification[Start]
        public async Task<PagedResultDto<AppEntityCategoryDto>> GetAppTransactionCategoriesFullNamesWithPaging(GetAppTransactionAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (input.TransactionId != 0)
                {
                    // List<string> returnName = new List<string>();
                    var returnRes = await _appEntitiesAppService.GetAppEntityCategoriesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.TransactionId });
                    {
                        foreach (var cat in returnRes.Items)
                        {
                            cat.EntityObjectCategoryName = GetDepartmentName(cat.EntityObjectCategoryId);
                        }
                    }
                    return returnRes;
                }
                return new PagedResultDto<AppEntityCategoryDto>();
            }
        }
        private string GetDepartmentName(long departmentId)
        {
            string returnName = "";
            var categoriesFiltered = _sycEntityObjectCategory.GetAll().Include(a => a.ParentFk).FirstOrDefault(a => a.Id == departmentId);
            if (categoriesFiltered != null)
            {
                if (categoriesFiltered.ParentId != null)
                {
                    returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + GetDepartmentName(long.Parse(categoriesFiltered.ParentId.ToString()));
                }
                //else
                returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + categoriesFiltered.Name;
            }
            return returnName;

        }
        private async Task<PagedResultDto<AppEntityClassificationDto>> GetAppTransactionClassificationsFullNamesWithPaging(GetAppTransactionAttributesWithPagingInput input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                if (input.TransactionId != 0)
                {
                    //return await _appEntitiesAppService.GetAppEntityClassificationsNamesWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.ItemEntityId });
                    var returnRes = await _appEntitiesAppService.GetAppEntityClassificationsWithPaging(new GetAppEntityAttributesInput { MaxResultCount = input.MaxResultCount, SkipCount = input.SkipCount, Sorting = input.Sorting, EntityId = input.TransactionId });
                    if (returnRes != null && returnRes.Items.Count > 0)
                    {
                        foreach (var clss in returnRes.Items)
                        {
                            clss.EntityObjectClassificationName = GetClassName(clss.EntityObjectClassificationId);
                        }
                    }
                    return returnRes;
                }
                return new PagedResultDto<AppEntityClassificationDto>();
            }
        }
        private string GetClassName(long classId)
        {
            string returnName = "";
            var classFiltered = _sycEntityObjectClassificationRepository.GetAll().Include(a => a.ParentFk).FirstOrDefault(a => a.Id == classId);
            if (classFiltered != null)
            {
                if (classFiltered.ParentId != null)
                {
                    returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + GetClassName(long.Parse(classFiltered.ParentId.ToString()));
                }
                //else
                returnName += (string.IsNullOrEmpty(returnName) ? "" : "-") + classFiltered.Name;
            }
            return returnName;

        }
        //[End]
        public async Task<GetAppTransactionsForViewDto> GetAppTransactionsForView(long transactionId, GetAllAppTransactionsInputDto? input, TransactionPosition? position)
        {

            //XX
            var entityObjectChargesId = await _helper.SystemTables.GetEntityObjectCharges();
            if (input != null && position != null)
            {
                var transOrg = await _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionContacts)
                    .Include(z => z.EntityExtraData)
                    .Include(z => z.EntityCategories).ThenInclude(z => z.EntityObjectCategoryFk)
                    .Include(a => a.EntityClassifications).ThenInclude(z => z.EntityObjectClassificationFk)
                    .Include(a => a.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                .Where(a => a.Id == transactionId).FirstOrDefaultAsync();
                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionContacts)
                    .ThenInclude(s => s.ContactAddressFk).Include(z => z.EntityCategories)
                    .Include(a => a.EntityClassifications)
                    .Include(z => z.EntityExtraData)
                            // .Include(a => a.AppTransactionDetails)
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Name.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => e.Code.Contains(input.Filter))
                            .WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
                            .WhereIf(input.FromCreationDateFilter != null, e => e.CreationTime >= input.FromCreationDateFilter)
                            .WhereIf(input.ToCreationDateFilter != null, e => e.CreationTime <= input.ToCreationDateFilter)
                            .WhereIf(input.FromCompleteDateFilter != null, e => e.CompleteDate >= input.FromCompleteDateFilter)
                            .WhereIf(input.ToCompleteDateFilter != null, e => e.CompleteDate <= input.ToCompleteDateFilter)
                            .WhereIf(input.StatusId > 0, e => e.EntityObjectStatusId == input.StatusId)
                            .WhereIf(input.EntityTypeIdFilter > 0, e => e.EntityObjectTypeId == input.EntityTypeIdFilter)
                            .WhereIf(!string.IsNullOrEmpty(input.BuyerSSIN), e => e.BuyerContactSSIN == input.BuyerSSIN)
                            .WhereIf(!string.IsNullOrEmpty(input.SellerSSIN), e => e.SellerContactSSIN == input.SellerSSIN)
                            .WhereIf(!string.IsNullOrEmpty(input.SellerName), e => e.SellerCompanyName.Contains(input.SellerName))
                            .WhereIf(!string.IsNullOrEmpty(input.BuyerName), e => e.BuyerCompanyName.Contains(input.BuyerName))
                            .Where(e => !(e.CreatorUserId != AbpSession.UserId && e.EntityObjectStatusId == entityObjectStatusId) && e.EntityObjectStatusId != null && e.TenantId == AbpSession.TenantId)
                            ;
                var filterResult = await filteredAppTransactions
                        .OrderBy(input.Sorting ?? "id asc").ToListAsync();
                var index = filterResult.IndexOf(transOrg);
                AppTransactionHeaders FilteredAppTransaction = null;

                if (position == TransactionPosition.Current)
                    FilteredAppTransaction = transOrg;


                if (position == TransactionPosition.Next)

                    FilteredAppTransaction = filterResult.Skip(index + 1).FirstOrDefault();


                if (position == TransactionPosition.Previous)
                {
                    if (index >= 1)
                        FilteredAppTransaction = filterResult.Skip(index - 1).FirstOrDefault();
                    else
                        FilteredAppTransaction = null;
                }
                if (FilteredAppTransaction != null)
                {
                    var viewTrans = ObjectMapper.Map<GetAppTransactionsForViewDto>(FilteredAppTransaction);
                    viewTrans.EntityStatusCode = FilteredAppTransaction.EntityObjectStatusCode;
                    viewTrans.EnteredDate = FilteredAppTransaction.EnteredDate;
                    viewTrans.EnteredByUserRole = FilteredAppTransaction.EnteredUserByRole;
                    if (viewTrans.EntityAttachments != null && viewTrans.EntityAttachments.Count > 0)
                    {
                        string filePath = _appConfiguration[$"Attachment:Path"] + @"\" + (viewTrans.TenantId == null ? "-1" : viewTrans.TenantId.ToString()) + @"\" + viewTrans.EntityAttachments[0].FileName;
                        if (System.IO.File.Exists(filePath))
                        {
                            viewTrans.OrderConfirmationFile = System.IO.File.ReadAllBytes(filePath);
                            viewTrans.EntityAttachments[0].Url = @"attachments/" + (viewTrans.TenantId == null ? -1 : viewTrans.TenantId) + @"/" + viewTrans.EntityAttachments[0].FileName;
                        }
                    }
                    if (FilteredAppTransaction != null)
                    {
                        AppTransactionHeaders FilteredAppTransactionPrev = null;
                        index = filterResult.IndexOf(FilteredAppTransaction);
                        if (index >= 1)
                            FilteredAppTransactionPrev = filterResult.Skip(index - 1).LastOrDefault();


                        if (FilteredAppTransactionPrev == null)
                            viewTrans.FirstRecord = true;

                        var FilteredAppTransactionNext = filterResult.Skip(index + 1).FirstOrDefault();

                        if (FilteredAppTransactionNext == null)
                            viewTrans.LastRecord = true;
                        //MMT
                        //EntityAttachments
                        // try
                        //{
                        //    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                        //    {
                        //        var sharedUsersList = await _appEntitySharingsRepository.GetAll().Where(z => z.EntityId == viewTrans.Id).ToListAsync();
                        //        viewTrans.SharedWithUsers = new List<ContactInformationOutputDto>();

                        //        //if (sharedUsersList == null || (sharedUsersList!=null && sharedUsersList.Count == 0))
                        //        {
                        //            var contacts = _appTransactionContactsRepository.GetAll()
                        //                .Where(e => e.TransactionId == viewTrans.Id).ToList();
                        //            //.Where(e => e.TransactionId == viewTrans.Id && e.ContactRole == "Creator").ToList();

                        //            if (contacts != null && contacts.Count > 0)
                        //            {
                        //                var contactsSSIN = contacts.Select(e => e.ContactSSIN).Distinct().ToList();
                        //                var contactsRows = _appContactRepository.GetAll()
                        //                      .Where(e => contactsSSIN.Contains(e.SSIN)
                        //                      && e.IsDeleted == false && e.TenantId != viewTrans.TenantId)
                        //                      .ToList();
                        //                if (contactsRows != null && contactsRows.Count > 0)
                        //                {
                        //                    var contactsRowsEntities = contactsRows.Select(e => e.EntityId).ToList();
                        //                    var contactsUsers = _appEntityExtraData.GetAll().Where(e => contactsRowsEntities.Contains(e.EntityId) && e.AttributeId == 715).ToList();
                        //                    var contactsUserIds = contactsUsers.Where(e => e.AttributeValue != null).Select(e => e.AttributeValue).Distinct().ToList();
                        //                    if (contactsUserIds != null && contactsUserIds.Count > 0)
                        //                    {
                        //                        if (sharedUsersList != null && sharedUsersList.Count > 0)
                        //                        {
                        //                            var sharedUsersListIds = sharedUsersList.Select(e => e.SharedUserId.ToString()).ToList();
                        //                            contactsUserIds = contactsUserIds.Where(e => !sharedUsersListIds.Contains(e)).ToList();
                        //                        }

                        //                        foreach (var user in contactsUserIds)
                        //                        {
                        //                            try
                        //                            {
                        //                                if (!string.IsNullOrEmpty(user))
                        //                                {
                        //                                    var userObject = UserManager.GetUserById(long.Parse(user.ToString()));

                        //                                    AppEntitySharings shareWith = new AppEntitySharings();
                        //                                    shareWith.SharedUserId = userObject.Id;
                        //                                    shareWith.SharedTenantId = userObject.TenantId;
                        //                                    shareWith.EntityId = viewTrans.Id;
                        //                                    shareWith.SharedUserEMail = userObject.EmailAddress;
                        //                                    await _appEntitySharingsRepository.InsertAsync(shareWith);
                        //                                }
                        //                            }
                        //                            catch (Exception ex) { }
                        //                        }
                        //                    }
                        //                }
                        //            }
                        //        }


                        var sharedUsersList = await _appEntitySharingsRepository.GetAll().Where(z => z.EntityId == viewTrans.Id).ToListAsync();
                        if (sharedUsersList != null && sharedUsersList.Count > 0)
                        {
                            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                            {
                                viewTrans.SharedWithUsers = new List<ContactInformationOutputDto>();
                                foreach (var usr in sharedUsersList)
                                {
                                    //ContactInformationOutputDto contactDto = new ContactInformationOutputDto();
                                    //contactDto.UserId = usr.SharedUserId;
                                    //contactDto.Email = usr.SharedUserEMail;
                                    //contactDto.TenantId = usr.SharedTenantId;
                                    //contactDto.Id = usr.Id;
                                    string userName = "";
                                    bool canBeRemoved = true;
                                    var user = UserManager.GetUserById(long.Parse(usr.SharedUserId.ToString()));
                                    if (user != null)
                                    {
                                        var userCompany = await _appMarketplaceContactRepository
                                    .GetAll().Where(z => z.TenantOwner == user.TenantId &&
                                    z.SharingLevel == 1 && z.IsProfileData == true && z.ParentId == null).FirstOrDefaultAsync();
                                        if (userCompany != null)
                                        {
                                            var extraData = await _appEntityExtraData.GetAll()
                                                .Where(z => z.AttributeId == 715 && z.AttributeValue == usr.SharedUserId.ToString()).FirstOrDefaultAsync();
                                            if (extraData != null)
                                            {
                                                var contact = await _appContactRepository.GetAll().Where(z => z.EntityId == extraData.EntityId).FirstOrDefaultAsync();
                                                if (contact!=null)
                                                {
                                                    userName =contact.Name.TrimEnd()
                                .Replace(" ", "") + "@"+userCompany.Name.TrimEnd().Replace(" ", "");
                                                    var tranContact = await _appTransactionContactsRepository.GetAll()
                                            .Where(z => z.CompanySSIN == userCompany.SSIN && z.ContactSSIN == contact.SSIN
                                              && z.TransactionId == transactionId &&
                                             (z.ContactRole == ContactRoleEnum.Creator.ToString() ||
                                             z.ContactRole == ContactRoleEnum.Seller.ToString() ||
                                             z.ContactRole == ContactRoleEnum.Buyer.ToString())).FirstOrDefaultAsync();
                                                    if(tranContact!=null)
                                                        canBeRemoved = false;
                                                }
                                            }
                                        }

                                        
                                        viewTrans.SharedWithUsers.Add(new ContactInformationOutputDto
                                        {
                                            Id = usr.Id,
                                            Email = usr.SharedUserEMail,
                                            Name = user.Name,
                                            UserId = long.Parse(usr.SharedUserId.ToString()),
                                            UserImage = user != null && user.ProfilePictureId != null ? Guid.Parse(user.ProfilePictureId.ToString()) : null,
                                            UserName = (string.IsNullOrEmpty(userName)? user.UserName : userName) ,
                                            TenantId = int.Parse(user.TenantId.ToString()),
                                            CanBeRemoved = canBeRemoved
                                        });
                                    }
                                }
                            }
                        }
                    }
                    //MMT


                        viewTrans.IsOwnedByMe = (AbpSession.TenantId == viewTrans.TenantOwner);
                        viewTrans.TotalQuantity = transOrg.TotalQuantity;
                        viewTrans.TotalAmount = transOrg.TotalAmount;
                        viewTrans.TransactionType = transOrg.EntityObjectTypeCode == "SALESORDER" ? TransactionType.SalesOrder : TransactionType.PurchaseOrder;
                        //viewTrans.EntityStatusCode = transOrg.EntityObjectStatusCode;
                        if (viewTrans.AppTransactionContacts != null && viewTrans.AppTransactionContacts.Count > 0)
                        {
                            foreach (var cont in viewTrans.AppTransactionContacts)
                            {
                                cont.ContactAddressDetail = new ContactAppAddressDto();
                                cont.ContactAddressDetail.State = cont.ContactAddressState;
                                cont.ContactAddressDetail.City = cont.ContactAddressCity;
                                cont.ContactAddressDetail.CountryCode = cont.ContactAddressCountryCode;
                                cont.ContactAddressDetail.CountryId = cont.ContactAddressCountryId;
                                cont.ContactAddressDetail.AddressLine1 = cont.ContactAddressLine1;
                                cont.ContactAddressDetail.AddressLine2 = cont.ContactAddressLine2;
                                cont.ContactAddressDetail.ContactEmail = cont.ContactEmail;
                                cont.ContactAddressDetail.ContactPhone = cont.ContactPhoneNumber;
                                cont.ContactAddressDetail.PostalCode = cont.ContactAddressPostalCode;

                            }
                        }
                        //MMT-Performance[Start]
                        viewTrans.IsOrderInformationValid = false;
                        var creator = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.Creator).FirstOrDefault();
                        if (creator != null)
                            viewTrans.IsOrderInformationValid = (!string.IsNullOrEmpty(creator.CompanyName) && !string.IsNullOrEmpty(creator.BranchName)) &&
                                        !string.IsNullOrEmpty(viewTrans.CurrencyCode) && (viewTrans.CurrencyExchangeRate != 0) && viewTrans.AvailableDate != new DateTime(1, 1, 1) &&
                                        viewTrans.CompleteDate != new DateTime(1, 1, 1) && viewTrans.StartDate != new DateTime(1, 1, 1) &&
                                        viewTrans.EnteredDate != new DateTime(1, 1, 1);

                        viewTrans.IsSellerContactInformationValid = false;
                        var sellor = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.Seller).FirstOrDefault();
                        if (sellor != null)
                            viewTrans.IsSellerContactInformationValid = (!string.IsNullOrEmpty(sellor.CompanyName) && !string.IsNullOrEmpty(sellor.BranchName));


                        viewTrans.IsBuyerContactInformationValid = false;
                        var buyer = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.Buyer).FirstOrDefault();

                        if (buyer != null)
                            viewTrans.IsBuyerContactInformationValid = (!string.IsNullOrEmpty(buyer.CompanyName));
                        // && !string.IsNullOrEmpty(buyer.CompanySSIN));


                        viewTrans.IsSalesRepInformationValid = true;
                        var salesRep = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.SalesRep1).FirstOrDefault();
                        if (salesRep != null)
                            viewTrans.IsSalesRepInformationValid = viewTrans.IsSalesRepInformationValid && (!string.IsNullOrEmpty(salesRep.CompanyName) && !string.IsNullOrEmpty(salesRep.BranchName));

                        var salesRep2 = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.SalesRep2).FirstOrDefault();
                        if (salesRep2 != null)
                            viewTrans.IsSalesRepInformationValid = viewTrans.IsSalesRepInformationValid && (!string.IsNullOrEmpty(salesRep2.CompanyName) && !string.IsNullOrEmpty(salesRep2.BranchName));


                        viewTrans.IsShippingInformationValid = false;
                        var shipTo = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.ShipToContact).FirstOrDefault();
                        var shipFrom = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.ShipFromContact).FirstOrDefault();
                        if (shipTo != null && shipFrom != null)

                            viewTrans.IsShippingInformationValid = (!string.IsNullOrEmpty(shipTo.CompanyName)) && //!string.IsNullOrEmpty(shipTo.CompanySSIN)) &&

                                 (!string.IsNullOrEmpty(shipFrom.CompanyName) && !string.IsNullOrEmpty(shipFrom.BranchName)) &&
                                 !string.IsNullOrEmpty(shipTo.ContactAddressCode) && !string.IsNullOrEmpty(shipTo.ContactAddressLine1) &&
                                 !string.IsNullOrEmpty(shipFrom.ContactAddressCode) && !string.IsNullOrEmpty(shipFrom.ContactAddressLine1) && !string.IsNullOrEmpty(viewTrans.ShipViaName);


                        viewTrans.IsBillingInformationValid = false;
                        var apContact = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.APContact).FirstOrDefault();
                        var arContact = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.ARContact).FirstOrDefault();
                        if (shipTo != null && shipFrom != null)

                            viewTrans.IsBillingInformationValid = (!string.IsNullOrEmpty(apContact.CompanyName)) && // !string.IsNullOrEmpty(apContact.CompanySSIN)) &&
                                 (!string.IsNullOrEmpty(arContact.CompanyName) && !string.IsNullOrEmpty(arContact.BranchName)) &&
                                 !string.IsNullOrEmpty(arContact.ContactAddressCode) && !string.IsNullOrEmpty(arContact.ContactAddressLine1) &&
                                 !string.IsNullOrEmpty(apContact.ContactAddressCode) && !string.IsNullOrEmpty(apContact.ContactAddressLine1) && !string.IsNullOrEmpty(viewTrans.PaymentTermsName);
                        //MMT-Performance[End]
                        //MMT-show
                        viewTrans.EntityCategoriesNames = new PagedResultDto<string>
                        {
                            Items = (await GetAppTransactionCategoriesFullNamesWithPaging(new GetAppTransactionAttributesWithPagingInput
                            {
                                TransactionId = viewTrans.Id,
                                Sorting = "Id"
                            })).Items.Select(z => z.EntityObjectCategoryName).ToList()
                        };
                        viewTrans.EntityClassificationsNames = new PagedResultDto<string>
                        {
                            Items = (await GetAppTransactionClassificationsFullNamesWithPaging(new GetAppTransactionAttributesWithPagingInput
                            {
                                TransactionId = viewTrans.Id,
                                Sorting = "Id"
                            })).Items.Select(z => z.EntityObjectClassificationName).ToList()
                        };
                        //iteration#45[Start]
                        viewTrans.LastModifiedDate = (transOrg.LastModificationTime == null ? transOrg.CreationTime : DateTime.Parse(transOrg.LastModificationTime.ToString()));
                        //
                        if (viewTrans.LastModifiedDate != null && input != null && !string.IsNullOrEmpty(input.TimeZoneValue))
                        {
                            var currentTimeZone = TimeZone.CurrentTimeZone.StandardName.ToString();
                            var utcValue = _timeZoneInfoAppService.GetUTCDatetimeValue(viewTrans.LastModifiedDate, currentTimeZone);
                            viewTrans.LastModifiedDate = _timeZoneInfoAppService.GetDatetimeValueFromUTC(utcValue, input.TimeZoneValue);
                        }
                        if (transOrg.CreationTime != null && input != null && !string.IsNullOrEmpty(input.TimeZoneValue))
                        {
                            var currentTimeZone = TimeZone.CurrentTimeZone.StandardName.ToString();
                            var utcValue = _timeZoneInfoAppService.GetUTCDatetimeValue(transOrg.CreationTime, currentTimeZone);
                            viewTrans.CreationDate = _timeZoneInfoAppService.GetDatetimeValueFromUTC(utcValue, input.TimeZoneValue);
                        }
                        //
                        var marketplaceTransaction = await _appMarketplaceTransactionHeadersRepository.GetAll().AsNoTracking().Where(z => z.SSIN == transOrg.SSIN && z.TenantId == null).FirstOrDefaultAsync();
                        if (marketplaceTransaction == null)
                        {
                            viewTrans.ShowSync = false;
                        }
                        else
                        {
                            if (transOrg.TimeStamp > marketplaceTransaction.TimeStamp)
                            {
                                viewTrans.ShowSync = true;
                            }
                            else
                            {
                                viewTrans.ShowSync = false;
                            }

                        }
                        //Iteration#45[End]
                        //End
                        //I46[Start]
                        viewTrans.ExtraDataAttributes = new List<ExtraDataAttrDto>();
                        // viewTrans.Additional = new List<ExtraDataAttrDto>();
                        // var recommended = GetAppTransactionExtraDataWithPaging(transactionId,viewTrans.EntityObjectTypeId, RecommandedOrAdditional.RECOMMENDED).Result.Items.ToList();
                        //var additional= GetAppTransactionExtraDataWithPaging(transactionId, viewTrans.EntityObjectTypeId, RecommandedOrAdditional.ADDITIONAL).Result.Items.ToList();
                        viewTrans.ExtraDataAttributes = _appEntitiesAppService.GetAppEntityExtraDataWithPaging(transactionId, viewTrans.EntityObjectTypeId).Result.Items.ToList();
                        //I46[End]

                        #region fill charges
                        var transCharges = await _appTransactionDetails.GetAll()
                            .Where(a => a.TransactionId == transactionId && a.EntityObjectTypeId == entityObjectChargesId).ToListAsync();
                        viewTrans.Charges = new List<ChargesDto>();
                        if (transCharges != null)
                        {
                            foreach (var charge in transCharges)
                            {

                                viewTrans.Charges.Add(
                                    new ChargesDto()
                                    {
                                        Name = charge.Name,
                                        ChargeAmount = charge.Amount,
                                        IsEditable = charge.Note == "true" ? true : false,
                                        TransactionDetailID = charge.Id
                                    });
                            }
                        }
                        #endregion fill charges

                        return viewTrans;
                    }

                }

            

            var trans = await _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionContacts)
                .Include(a => a.AppTransactionDetails.Where(d => d.EntityObjectTypeId != entityObjectChargesId)).Where(a => a.Id == transactionId).FirstOrDefaultAsync();
            if (trans != null)
            {
                var retTrans = ObjectMapper.Map<GetAppTransactionsForViewDto>(trans);
                retTrans.EnteredDate = trans.EnteredDate;
                //P-SII-20241216.009,1 MMT 01/14/2025 Transaction creation date is incorrect[Start]

                retTrans.CreationDate = trans.CreationTime;
                if (retTrans.CreationDate != null && input != null && !string.IsNullOrEmpty(input.TimeZoneValue))
                {
                    var currentTimeZone = TimeZone.CurrentTimeZone.StandardName.ToString();
                    var utcValue = _timeZoneInfoAppService.GetUTCDatetimeValue(trans.CreationTime, currentTimeZone);
                    retTrans.CreationDate = _timeZoneInfoAppService.GetDatetimeValueFromUTC(utcValue, input.TimeZoneValue);
                }
                retTrans.LastModifiedDate = (trans.LastModificationTime == null ? trans.CreationTime : DateTime.Parse(trans.LastModificationTime.ToString()));
                if (retTrans.LastModifiedDate != null && input != null && !string.IsNullOrEmpty(input.TimeZoneValue))
                {
                    var currentTimeZone = TimeZone.CurrentTimeZone.StandardName.ToString();
                    var utcValue = _timeZoneInfoAppService.GetUTCDatetimeValue(retTrans.LastModifiedDate, currentTimeZone);
                    retTrans.LastModifiedDate = _timeZoneInfoAppService.GetDatetimeValueFromUTC(utcValue, input.TimeZoneValue);
                }
                //P-SII-20241216.009,1 MMT 01/14/2025 Transaction creation date is incorrect[End]
                if (retTrans.AppTransactionContacts != null && retTrans.AppTransactionContacts.Count > 0)
                {
                    foreach (var cont in retTrans.AppTransactionContacts)
                    {
                        cont.ContactAddressDetail = new ContactAppAddressDto();
                        cont.ContactAddressDetail.State = cont.ContactAddressState;
                        cont.ContactAddressDetail.City = cont.ContactAddressCity;
                        cont.ContactAddressDetail.CountryCode = cont.ContactAddressCountryCode;
                        cont.ContactAddressDetail.CountryId = cont.ContactAddressCountryId;
                        cont.ContactAddressDetail.AddressLine1 = cont.ContactAddressLine1;
                        cont.ContactAddressDetail.AddressLine2 = cont.ContactAddressLine2;
                        cont.ContactAddressDetail.ContactEmail = cont.ContactEmail;
                        cont.ContactAddressDetail.ContactPhone = cont.ContactPhoneNumber;
                        cont.ContactAddressDetail.PostalCode = cont.ContactAddressPostalCode;

                    }
                }

                #region fill charges
                var transCharges = await _appTransactionDetails.GetAll()
                    .Where(a => a.TransactionId == transactionId && a.EntityObjectTypeId == entityObjectChargesId).ToListAsync();
                retTrans.Charges = new List<ChargesDto>();
                if (transCharges != null)
                {
                    foreach (var charge in transCharges)
                    {

                        retTrans.Charges.Add(
                            new ChargesDto()
                            {
                                Name = charge.Name,
                                ChargeAmount = charge.Amount,
                                IsEditable = charge.Note == "true" ? true : false
                            });
                    }
                }
                #endregion fill charges
                return retTrans;

            }
            return null;
        }
        //Address APIs
        public async Task<List<ContactAddressDto>> GetCompanyAddresses(string companySSIN, string? filter)
        {
            List<ContactAddressDto> returnAddress = new List<ContactAddressDto>();
            //using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                var account = await _appContactRepository.GetAll().Where(s => s.SSIN == companySSIN && s.TenantId == AbpSession.TenantId).FirstOrDefaultAsync();
                if (account != null)
                {
                    var addressList = await _appAddressRepository.GetAll().Where(x => x.AccountId == account.Id && x.TenantId == AbpSession.TenantId)
                        .WhereIf(!string.IsNullOrEmpty(filter), s => s.AddressLine1.Contains(filter) ||
                        s.AddressLine2.Contains(filter) || s.City.Contains(filter) || s.CountryCode.Contains(filter)
                        || s.State.Contains(filter) || s.PostalCode.Contains(filter) || s.Code.Contains(filter))
                        .ToListAsync();

                    //var output = new List<AppAddressDto>();
                    returnAddress = ObjectMapper.Map<List<ContactAddressDto>>(addressList);

                }
            }
            return returnAddress;
        }

        //End
        //I46[Start]
        public async Task<bool> IsAccountConnected(string accountSSIN)
        {
            var account = await _appContactRepository.GetAll()
                .Where(z => z.TenantId == AbpSession.TenantId && z.SSIN == accountSSIN).FirstOrDefaultAsync();
            if (account == null)
            {
                return false;
            }
            else
            {
                return true;
            }
        }


        //I46[End]
        //MMT37[Start]
        public async Task<List<ContactInformationOutputDto>> GetAccountConnectedContacts(string filter)
        {
            List<ContactInformationOutputDto> output = new List<ContactInformationOutputDto>();
            //var transactionContacts = _appTransactionContactsRepository.GetAll()
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                //  .Where(z => z.TransactionId == tansactionId);
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                //var contact = //from t in transactionContacts
                //join c in
                //      _appContactRepository.GetAll().Where(z => z.TenantId == AbpSession.TenantId && z.ParentId != null && z.PartnerId != null)
                //   on t.CompanySSIN equals c.SSIN into j
                //    from e in j.DefaultIfEmpty()
                //  select new { TenantId = e.Id }; Tenants.Contains(long.Parse(z.PartnerId.ToString())) && 


            // var Tenants = (await contact.ToListAsync()).Where(z => z.TenantId != null).Select(z => z.TenantId).ToList();
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
                                var user = UserManager.GetUserById(long.Parse(con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue));
                                if (user != null)
                                {
                                    var tenantObj = TenantManager.GetById(int.Parse(user.TenantId.ToString()));
                                    output.Add(new ContactInformationOutputDto
                                    {
                                        Id = con.Id,
                                        Email = con.EMailAddress,
                                        Name = con.Name,
                                        UserId = long.Parse(con.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue),
                                        UserImage = user != null && user.ProfilePictureId != null ? Guid.Parse(user.ProfilePictureId.ToString()) : null,
                                        UserName = user.UserName,
                                        TenantId = int.Parse(user.TenantId.ToString()),
                                        TenantName = tenantObj != null ? tenantObj.TenancyName : "SIIWII",
                                        Code = con.Code
                                    });
                                }

                            }
                            catch (Exception ex)
                            { }
                        }
                    }

                }
            }
            return output;
        }
        //public async Task ShareTransaction(long TransactionId, List<> ShareWithUsers)
        //{ }
        //MMT37[End]
        //MMT37[Start]
        //public async Task<List<ContactInformationOutputDto>> GetTransactionContacts(long tansactionId, string filter)
        //{
        //    List<ContactInformationOutputDto> output = new List<ContactInformationOutputDto>();
        //    var transactionContacts = _appTransactionContactsRepository.GetAll()

        //        .Where(z => z.TransactionId == tansactionId);
        //    var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
        //    var contact = from t in transactionContacts
        //                  join
        //                  c in _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityExtraData.Where(s => s.AttributeId == 715))
        //                  .Where(z => z.TenantId == AbpSession.TenantId && z.ParentId != null && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId)
        //                  on t.ContactSSIN equals c.SSIN into j
        //                  from e in j.DefaultIfEmpty()
        //                  select new { contact = e, role = t.ContactRole };


        //    var contacts = await contact.WhereIf(!string.IsNullOrEmpty(filter), z => z.contact.Name.Contains(filter)).OrderBy(z => z.contact.Id).ToListAsync();
        //    //var contacts = await _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityExtraData.Where(s => s.AttributeId == 715))
        //    //.WhereIf(!string.IsNullOrEmpty(filter), z => z.Name.Contains(filter))
        //    //.Where(z => z.TenantId == AbpSession.TenantId &&
        //    //contactLists.Contains(long.Parse(z.Id.ToString())) && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId).ToListAsync();

        //    if (contacts != null && contacts.Count() > 0)
        //    {
        //        using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
        //        {
        //            foreach (var con in contacts)
        //            {
        //                if (con.contact == null || con.contact.EntityFk.EntityExtraData == null || con.contact.EntityFk.EntityExtraData.Count == 0 || con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue == null)
        //                    continue;

        //                try
        //                {
        //                    var user = UserManager.GetUserById(long.Parse(con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue));
        //                    if (user != null)
        //                    {
        //                        //T-SII-20240329.0013,1 MMT 05/07/2024 - Transactions - Transaction share with(users default list) shouldn't contain the transaction creator in this list and it cannot be added[Start]
        //                        var userId = long.Parse(con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue);
        //                        if (userId == AbpSession.UserId)
        //                        {
        //                            continue;
        //                        }
        //                        //T-SII-20240329.0013,1 MMT 05/07/2024 - Transactions - Transaction share with(users default list) shouldn't contain the transaction creator in this list and it cannot be added[End]
        //                        ContactRoleEnum role = (ContactRoleEnum)Enum.Parse(typeof(ContactRoleEnum), con.role);
        //                        var tenantObj = TenantManager.GetById(int.Parse(user.TenantId.ToString()));
        //                        if (output.FirstOrDefault(z => z.UserId == long.Parse(con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue)) == null)
        //                            output.Add(new ContactInformationOutputDto
        //                            {
        //                                Id = con.contact.Id,
        //                                Email = con.contact.EMailAddress,
        //                                Name = con.contact.Name,
        //                                UserId = long.Parse(con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue),
        //                                UserImage = user != null && user.ProfilePictureId != null ? Guid.Parse(user.ProfilePictureId.ToString()) : null,
        //                                UserName = user.UserName,
        //                                TenantId = int.Parse(user.TenantId.ToString()),
        //                                TenantName = tenantObj != null ? tenantObj.TenancyName : "SIIWII",
        //                                CanBeRemoved = (role == ContactRoleEnum.Creator || role == ContactRoleEnum.Seller || role == ContactRoleEnum.Buyer) ? false : true
        //                            });

        //                    }
        //                }
        //                catch { }
        //            }
        //        }
        //    }
        //    return output;
        //}

        public async Task<List<ContactInformationOutputDto>> GetTransactionContacts(
       long tansactionId,
       string filter)
        {
            var output = new List<ContactInformationOutputDto>();

            using (UnitOfWorkManager.Current.DisableFilter(
                AbpDataFilters.MustHaveTenant,
                AbpDataFilters.MayHaveTenant))
            {
                var personEntityObjectTypeId =
                    await _helper.SystemTables.GetEntityObjectTypePersonId();

                // -------------------------------------------------------
                // 1️⃣ Load transaction contacts
                // -------------------------------------------------------
                var transactionContacts = await _appTransactionContactsRepository
                    .GetAll()
                    .Where(z => z.TransactionId == tansactionId)
                    .ToListAsync();

                if (!transactionContacts.Any())
                    return output;

                // -------------------------------------------------------
                // 2️⃣ Get Company SSINs safely
                // -------------------------------------------------------
                var companySsins = transactionContacts
                    .Where(x => !string.IsNullOrEmpty(x.CompanySSIN))
                    .Select(x => x.CompanySSIN)
                    .Distinct()
                    .ToList();

                if (!companySsins.Any())
                    return output;

                // -------------------------------------------------------
                // 3️⃣ Get TenantOwner for each company
                // -------------------------------------------------------
                var tenantOwnerDict = await _appEntity.GetAll()
                    .Where(c =>
                        companySsins.Contains(c.SSIN) &&
                        c.TenantOwner != 0)
                    .GroupBy(c => c.SSIN)
                    .Select(g => new
                    {
                        SSIN = g.Key,
                        TenantOwner = g.First().TenantOwner
                    })
                    .ToDictionaryAsync(x => x.SSIN, x => x.TenantOwner);

                if (!tenantOwnerDict.Any())
                    return output;

                // -------------------------------------------------------
                // 4️⃣ Get Contact SSINs
                // -------------------------------------------------------
                var contactSsins = transactionContacts
                    .Where(x => !string.IsNullOrEmpty(x.ContactSSIN))
                    .Select(x => x.ContactSSIN)
                    .Distinct()
                    .ToList();

                if (!contactSsins.Any())
                    return output;

                // -------------------------------------------------------
                // 5️⃣ Load Contacts
                // -------------------------------------------------------
                var contacts = await _appContactRepository.GetAll()
                    .Include(z => z.EntityFk)
                        .ThenInclude(z => z.EntityExtraData)
                    .Where(z =>
                        contactSsins.Contains(z.SSIN) &&
                        //z.ParentId != null &&
                        z.EntityFk.EntityObjectTypeId == personEntityObjectTypeId)
                    .WhereIf(!string.IsNullOrEmpty(filter),
                        z => z.Name.Contains(filter))
                    .ToListAsync();

                var contactsBySsin = contacts
                    .GroupBy(c => c.SSIN)
                    .ToDictionary(g => g.Key, g => g.ToList());

                // -------------------------------------------------------
                // 6️⃣ Collect UserIds
                // -------------------------------------------------------
                var userIds = contacts
                    .Select(c => c.EntityFk?.EntityExtraData?
                        .FirstOrDefault(x => x.AttributeId == 715)?.AttributeValue)
                    .Where(v => long.TryParse(v, out _))
                    .Select(long.Parse)
                    .Distinct()
                    .ToList();

                if (!userIds.Any())
                    return output;

                // -------------------------------------------------------
                // 7️⃣ Load Users
                // -------------------------------------------------------
                var users = await UserManager.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToListAsync();

                var usersDict = users.ToDictionary(u => u.Id);

                // -------------------------------------------------------
                // 8️⃣ Load Tenants
                // -------------------------------------------------------
                var tenantIds = users
                    .Where(u => u.TenantId.HasValue)
                    .Select(u => u.TenantId.Value)
                    .Distinct()
                    .ToList();

                var tenants = await TenantManager.Tenants
                    .Where(t => tenantIds.Contains(t.Id))
                    .ToListAsync();

                var tenantsDict = tenants.ToDictionary(t => t.Id);

                // -------------------------------------------------------
                // 9️⃣ Build Output
                // -------------------------------------------------------
                foreach (var tc in transactionContacts)
                {
                    if (string.IsNullOrEmpty(tc.CompanySSIN))
                        continue;

                    if (!tenantOwnerDict.TryGetValue(tc.CompanySSIN, out var tenantOwner))
                        continue;

                    if (string.IsNullOrEmpty(tc.ContactSSIN))
                        continue;

                    if (!contactsBySsin.TryGetValue(tc.ContactSSIN, out var possibleContacts))
                        continue;

                    var contact = possibleContacts
                        .FirstOrDefault(c => c.TenantId == tenantOwner);

                    if (contact == null)
                        continue;

                    var attributeValue = contact.EntityFk?.EntityExtraData?
                        .FirstOrDefault(x => x.AttributeId == 715)?.AttributeValue;

                    if (!long.TryParse(attributeValue, out var userId))
                        continue;

                    if (userId == AbpSession.UserId)
                        continue;

                    if (output.Any(x => x.UserId == userId))
                        continue;

                    if (!usersDict.TryGetValue(userId, out var user))
                        continue;

                    if (!Enum.TryParse<ContactRoleEnum>(
                            tc.ContactRole,
                            out var role))
                        continue;

                    tenantsDict.TryGetValue(user.TenantId ?? 0, out var tenantObj);

                    output.Add(new ContactInformationOutputDto
                    {
                        Id = contact.Id,
                        Email = contact.EMailAddress,
                        Name = contact.Name,
                        UserId = userId,
                        UserImage = user.ProfilePictureId != null
                            ? Guid.Parse(user.ProfilePictureId.ToString())
                            : null,
                        UserName = user.UserName,
                        TenantId = user.TenantId ?? 0,
                        TenantName = tenantObj?.TenancyName ?? "SIIWII",
                        CanBeRemoved = !(role == ContactRoleEnum.Creator ||
                                         role == ContactRoleEnum.Seller ||
                                         role == ContactRoleEnum.Buyer)
                    });
                }
            }

            return output;
        }
        public async Task<bool> ShareTransactionByEmail(SharingTransactionEmail input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                // var sharedtransactionId = await ShareTransactionOnMarketplace(input.TransactionId);
                var sharedtransactionId = input.TransactionId;
                var marketplacetrans = await _appTransactionsHeaderRepository.GetAll().Include(z => z.EntityAttachments).ThenInclude(x => x.AttachmentFk).Where(z => z.Id == sharedtransactionId).FirstOrDefaultAsync();
                if (marketplacetrans != null)
                {
                    string filePath = "";
                    if (marketplacetrans.EntityAttachments != null && marketplacetrans.EntityAttachments.Count > 0 && marketplacetrans.EntityAttachments[0] != null &&
                        !string.IsNullOrEmpty(marketplacetrans.EntityAttachments[0].AttachmentFk.Attachment))
                    {
                        filePath = _appConfiguration[$"Attachment:Path"] + @"\" + (marketplacetrans.TenantId == null ? "-1" : marketplacetrans.TenantId.ToString()) + @"\" + marketplacetrans.EntityAttachments[0].AttachmentFk.Attachment;
                    }
                    //if (System.IO.File.Exists(filePath))
                    //{
                    //    viewTrans.OrderConfirmationFile = System.IO.File.ReadAllBytes(filePath);
                    //    viewTrans.EntityAttachments[0].Url = @"attachments/" + (viewTrans.TenantId == null ? -1 : viewTrans.TenantId) + @"/" + viewTrans.EntityAttachments[0].FileName;
                    //}
                    input.Subject = marketplacetrans.EntityObjectTypeCode.ToUpper() == "SALESORDER" ? ("Sales Order: " + marketplacetrans.Code + " (" + marketplacetrans.BuyerCompanyName + ")") : ("Purchase Order" + marketplacetrans.Code + "(" + marketplacetrans.SellerCompanyName + ")");
                    foreach (var email in input.EmailAddresses)
                    {
                        MailMessage mail = new MailMessage();
                        //mail.To = new MailAddressCollection();
                        mail.To.Add(email);
                        mail.Subject = input.Subject;
                        mail.Body = input.Message.ToString();
                        mail.IsBodyHtml = input.IsBodyHtml;
                        //mail.Attachments = new AttachmentCollection();
                        if (!string.IsNullOrEmpty(filePath) && System.IO.File.Exists(filePath))
                        {
                            Attachment at = new Attachment(filePath);
                            mail.Attachments.Add(at);
                        }
                        await _emailSender.SendAsync(mail);

                    }
                    return true;
                }
                return false;
            }
        }
        public async Task<ShareTransactionByMessageResultDto> ShareTransactionByMessage(SharingTransactionOptions input)
        {
            ShareTransactionByMessageResultDto shareTransactionByMessageResultDto = new ShareTransactionByMessageResultDto();
            shareTransactionByMessageResultDto.TenantTransactionInfos = new List<TenantTransactionInfo>();

            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var transContacts = _appTransactionContactsRepository.GetAll().Where(z => z.TransactionId == input.TransactionId);
                //var transTenants = from o in transContacts
                //                   join
                //                   a in _appContactRepository.GetAll().Where(z => z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && z.TenantId != null && z.PartnerId == null)
                //                   on o.ContactSSIN equals a.SSIN into j
                //                   from s in j.DefaultIfEmpty()
                //                   select new { TenantId = s.TenantId, Role = o.ContactRole };
                //T-SII-20250313.0001-Transaction-Creating orders without selecting contact name after sharing - the order type will be the same for the creator and recipient[Start]
                /*var transTenants = transContacts.Join(
                    _appContactRepository.GetAll().Where(z => z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && z.TenantId != null && z.PartnerId == null && z.IsProfileData),
                                                      x => x.ContactSSIN, z => z.SSIN,
                                                      (s, sa) => new { TenantId = sa.TenantId, Role = s.ContactRole });*/
                //            var transTenants = transContacts.Join(
                //_appContactRepository.GetAll().Where(z => z.TenantId != null && z.PartnerId == null && z.IsProfileData),
                //                                  x => (x.ContactSSIN == null ? x.CompanySSIN : x.ContactSSIN), z => z.SSIN,
                //                                  (s, sa) => new { TenantId = sa.TenantId, Role = s.ContactRole });
                var transTenants = transContacts.Join(
                    _appMarketplaceContactRepository .GetAll().Where (z => z.IsProfileData),
                    x => x.CompanySSIN, z => z.SSIN,
                                      //_appContactRepository.GetAll().Where(z => z.TenantId != null && z.PartnerId == null && z.IsProfileData),
                                      //x => (x.ContactSSIN == null ? x.CompanySSIN : x.ContactSSIN), z => z.SSIN,
                                      (s, sa) => new { TenantId = sa.TenantOwner, Role = s.ContactRole });
                //T-SII-20250313.0001-Transaction-Creating orders without selecting contact name after sharing - the order type will be the same for the creator and recipient[End]
                var transTenantsList = transTenants.ToList();



                var sharedtransactionId = await ShareTransactionOnMarketplace(input.TransactionId);
                if (sharedtransactionId != 0)
                {
                    if (input.TransactionSharing != null && input.TransactionSharing.Count > 0)
                    {
                        //MMT
                        var missingUserId = input.TransactionSharing.Where(z => z.SharedUserId == null || z.SharedUserId ==0).FirstOrDefault();
                        if (missingUserId != null)
                        {
                            foreach (var user in input.TransactionSharing)
                            {
                                if (user.SharedUserId == null || user.SharedUserId == 0)
                                {
                                    var appmarketplaceCompany = await _appMarketplaceContactRepository
                                        .GetAll().Where(z => z.SSIN == user.CompanySSIN).FirstOrDefaultAsync();
                                    if (appmarketplaceCompany != null)
                                    {
                                        var userContact = await _appContactRepository.GetAll().Include(z => z.EntityFk)
                                            .ThenInclude(z => z.EntityExtraData)
                                            .Where(z => z.TenantId == appmarketplaceCompany.TenantOwner
                                            && z.SSIN == user.ContactSSIN)
                                            .FirstOrDefaultAsync();
                                        if (userContact != null && userContact.EntityFk.EntityExtraData != null)
                                        {
                                            var userExtraData = userContact.EntityFk.EntityExtraData.Where(z => z.AttributeId == 715).FirstOrDefault();
                                            if (userExtraData != null && !string.IsNullOrEmpty(userExtraData.AttributeValue))
                                            {
                                                user.SharedUserId = long.Parse(userExtraData.AttributeValue);
                                                user.SharedTenantId = appmarketplaceCompany.TenantOwner;
                                            }

                                        }
                                    }
                                        
                                }
                            }
                        }
                        //MMT
                        var sharedWithList = await _appEntitySharingsRepository.GetAll().Where(x => x.EntityId == input.TransactionId).ToListAsync();
                        if (sharedWithList != null && sharedWithList.Count > 0)
                        {
                            foreach (var sh in sharedWithList)
                            {
                                var exist = input.TransactionSharing.FirstOrDefault(x => x.SharedUserId == sh.SharedUserId);
                                if (exist == null)
                                {
                                    await _appEntitySharingsRepository.DeleteAsync(x => x.EntityId == input.TransactionId && x.SharedUserId == sh.SharedUserId);
                                }
                            }
                        }
                        string toUserList = "";
                        List<string> tenantsRoles = new List<string>();
                        List<long> userToShare = new List<long>();
                        string transactionType = "";
                        var trans = await _appTransactionsHeaderRepository.GetAll()
                            .Where(z => z.Id == input.TransactionId).FirstOrDefaultAsync();
                        if (trans != null)
                        {
                            transactionType = trans.EntityObjectTypeCode;
                        }
                        foreach (var shar in input.TransactionSharing)
                        {
                            if (shar.SharedUserId == null || shar.SharedUserId == 0)
                                continue;

                            TransactionType? tranType = transactionType == "SALESORDER"? TransactionType.SalesOrder : TransactionType.PurchaseOrder;
                               
                            try
                            {
                                var user = UserManager.GetUserById(long.Parse(shar.SharedUserId.ToString()));
                                if (user != null && user.TenantId!= AbpSession.TenantId)
                                {
                                    var userTenant = transTenantsList.FirstOrDefault(z => z.TenantId == user.TenantId);
                                    if (userTenant != null && userTenant.Role != null)
                                    {
                                        ContactRoleEnum role = (ContactRoleEnum)Enum.Parse(typeof(ContactRoleEnum), userTenant.Role);
                                        if (role != ContactRoleEnum.Creator)// && role != ContactRoleEnum.SalesRep1 && role != ContactRoleEnum.SalesRep2)
                                        {
                                            if (role != ContactRoleEnum.SalesRep1 && role != ContactRoleEnum.SalesRep2)
                                                    {
                                                if (role == ContactRoleEnum.Buyer || role == ContactRoleEnum.ShipToContact
                                                || role == ContactRoleEnum.APContact)
                                                {
                                                    tranType = TransactionType.PurchaseOrder;
                                                }
                                                else
                                                {
                                                    tranType = TransactionType.SalesOrder;
                                                }
                                            }
                                            var tenantR = tenantsRoles.FirstOrDefault(z => z == tranType.ToString() + "," + user.TenantId.ToString());
                                            if (tenantR == null)
                                            {
                                                tenantsRoles.Add(tranType.ToString() + "," + user.TenantId.ToString());
                                            }
                                        }
                                    }
                                    else
                                    {
                                        var tenantR = tenantsRoles.FirstOrDefault(z => z == tranType.ToString() + "," + user.TenantId.ToString());
                                        if (tenantR == null)
                                        {
                                            tenantsRoles.Add(tranType.ToString() + "," + user.TenantId.ToString());
                                        }
                                    }

                                }
                            }
                            catch (Exception x)
                            { }

                            var sharedUser = await _appEntitySharingsRepository.GetAll().Where(x => x.EntityId == input.TransactionId && x.SharedUserId == shar.SharedUserId).FirstOrDefaultAsync();
                            if (sharedUser == null)
                            {
                                AppEntitySharings shareWith = new AppEntitySharings();
                                shareWith.SharedUserId = shar.SharedUserId;
                                shareWith.SharedTenantId = shar.SharedTenantId;
                                shareWith.EntityId = input.TransactionId;
                                shareWith.SharedUserEMail = shar.SharedUserEMail;
                                await _appEntitySharingsRepository.InsertAsync(shareWith);
                                toUserList += (string.IsNullOrEmpty(toUserList) ? "" : ",") + shar.SharedUserId.ToString();
                                userToShare.Add(long.Parse(shar.SharedUserId.ToString()));

                            }
                        }

                        List<string> tenantTrans = new List<string>();
                        foreach (var item in tenantsRoles)
                        {
                            string tranCode = "";

                            if (!string.IsNullOrEmpty(item.Split(",")[0].ToString()))
                            {
                                tranCode = await ShareTransactionWithTenant(sharedtransactionId, int.Parse(item.Split(",")[1].ToString()), (TransactionType)Enum.Parse(typeof(TransactionType), item.Split(",")[0].ToString()));
                                var tenantId = long.Parse(item.Split(",")[1].ToString());
                                var tranType = (item.Split(",")[0].ToString() == "SalesOrder" ? "SALESORDER" : "PURCHASEORDER");
                                var sharedTran = await _appTransactionsHeaderRepository.GetAll().Where(z => z.TenantId == tenantId
                                && z.Code == tranCode && z.EntityObjectTypeCode == tranType).FirstOrDefaultAsync();
                                if (sharedTran != null)
                                    shareTransactionByMessageResultDto.TenantTransactionInfos.Add(new TenantTransactionInfo
                                    {
                                        TenantId = tenantId,
                                        Code = tranCode,
                                        TransactionType = sharedTran.EntityObjectTypeCode,
                                        TransactionId = sharedTran.Id
                                    });
                            }
                            else
                            {
                                var marketplaceTransaction = await _appMarketplaceTransactionHeadersRepository.GetAll().AsNoTracking()
                                    .Where(z => z.Id == sharedtransactionId && z.TenantId == null).FirstOrDefaultAsync();
                                if (marketplaceTransaction != null)
                                {
                                    tranCode = await ShareTransactionWithTenant(sharedtransactionId, int.Parse(item.Split(",")[1].ToString()), null);
                                    var tenantId = long.Parse(item.Split(",")[1].ToString());
                                    var tranType = (item.Split(",")[0].ToString() == "SalesOrder" ? "SALESORDER" : "PURCHASEORDER");
                                    var sharedTran = await _appTransactionsHeaderRepository.GetAll().Where(z => z.TenantId == tenantId
                                    && z.Code == tranCode && z.EntityObjectTypeCode == tranType).FirstOrDefaultAsync();
                                    if (sharedTran != null)
                                        shareTransactionByMessageResultDto.TenantTransactionInfos.Add(new TenantTransactionInfo
                                        {
                                            TenantId = tenantId,
                                            Code = tranCode,
                                            TransactionType = marketplaceTransaction.EntityObjectTypeCode,
                                            TransactionId = sharedTran.Id
                                        });
                                }
                            }
                            string newItem = item + "," + tranCode;
                            tenantTrans.Add(newItem);
                        }
                        await CurrentUnitOfWork.SaveChangesAsync();
                        if (!string.IsNullOrEmpty(toUserList))
                        {
                            foreach (var shar in input.TransactionSharing)
                            {
                                string subject = "";
                                var userTenantInfo = shareTransactionByMessageResultDto.TenantTransactionInfos.FirstOrDefault(z => z.TenantId == shar.SharedTenantId);//z.Contains(shar.SharedTenantId.ToString()));
                                AppTransactionHeaders tran = null;
                                if (userTenantInfo != null)
                                {
                                    //var info = userTenantInfo.Split(',');
                                    tran = await _appTransactionsHeaderRepository.GetAll().Where(z => z.Code == userTenantInfo.Code && z.TenantId == shar.SharedTenantId && z.EntityObjectTypeCode == userTenantInfo.TransactionType).FirstOrDefaultAsync();
                                    if (tran != null)
                                    {
                                        if (!string.IsNullOrEmpty(userTenantInfo.Code))
                                            subject = userTenantInfo.TransactionType.ToUpper() == "SALESORDER" ? ("Sales Order: " + userTenantInfo.Code + " (" + tran.BuyerCompanyName + ")") : ("Purchase Order" + userTenantInfo.Code + " (" + tran.SellerCompanyName + ")");
                                        else
                                        {
                                            tran = await _appTransactionsHeaderRepository.GetAll().Where(z => z.Id == input.TransactionId).FirstOrDefaultAsync();
                                            if (tran != null)
                                                subject = tran.EntityObjectTypeCode.ToUpper() == "SALESORDER" ? ("Sales Order: " + tran.Code + " (" + tran.BuyerCompanyName + ")") : ("Purchase Order" + tran.Code + " (" + tran.SellerCompanyName + ")");
                                        }
                                    }
                                }
                                else
                                {
                                    // var info = userTenantInfo.Split(',');
                                    tran = await _appTransactionsHeaderRepository.GetAll().Where(z => z.Id == input.TransactionId).FirstOrDefaultAsync();
                                    if (tran != null)
                                        subject = tran.EntityObjectTypeCode.ToUpper() == "SALESORDER" ? ("Sales Order: " + tran.Code + " (" + tran.BuyerCompanyName + ")") : ("Purchase Order" + tran.Code + " (" + tran.SellerCompanyName + ")");
                                }
                                if (userToShare.Exists(z => z == long.Parse(shar.SharedUserId.ToString())))
                                    await _messageAppService.CreateMessage(new CreateMessageInput
                                    {
                                        To = shar.SharedUserId.ToString(),
                                        Body = input.Message,
                                        //MessageCategory = MessageCategory.UPDATEMESSAGE.ToString(),
                                        MesasgeObjectType = MesasgeObjectType.Message,
                                        RelatedEntityId = tran != null ? tran.Id : sharedtransactionId,
                                        BodyFormat = input.Message,
                                        SendDate = DateTime.Now.Date,
                                        ReceiveDate = DateTime.Now.Date,
                                        Subject = subject,
                                        SenderId = AbpSession.UserId,
                                        Code = null
                                    });
                            }
                        }
                    }
                }
            }
            shareTransactionByMessageResultDto.Result = true;
            return shareTransactionByMessageResultDto;
        }
        public async Task<string> ShareTransactionWithTenant(long marketplaceTransactionId, int tenantId, TransactionType? transactionType)
        {

            string returnTran = "";
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var objectId = await _helper.SystemTables.GetObjectTransactionId();
                var marketplaceTransaction = await _appMarketplaceTransactionHeadersRepository.GetAll().AsNoTracking().Include(z => z.EntityClassifications).Include(z => z.EntityCategories)
                .Include(z => z.AppMarketplaceTransactionDetails).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(z => z.AppMarketplaceTransactionDetails).ThenInclude(z => z.EntityCategories)
                .Include(z => z.AppMarketplaceTransactionDetails).ThenInclude(z => z.EntityClassifications)
                .Include(z => z.AppMarketplaceTransactionDetails).ThenInclude(z => z.EntityExtraData)
                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(z => z.AppMarketplaceTransactionContacts).AsNoTracking()
                .Include(z => z.EntityExtraData).Where(z => z.Id == marketplaceTransactionId && z.TenantId == null).FirstOrDefaultAsync();
                if (marketplaceTransaction != null)
                {

                    long soType = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
                    long poType = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
                    if (transactionType == null)
                    {
                        transactionType = marketplaceTransaction.EntityObjectTypeId == soType ? TransactionType.SalesOrder : TransactionType.PurchaseOrder;
                    }
                    AppTransactionHeaders tenantTransaction = new AppTransactionHeaders();
                    var tenantTransactionObj = await _appTransactionsHeaderRepository.GetAll().AsNoTracking()
                        .Where(z => z.TenantId == tenantId && z.SSIN == marketplaceTransaction.SSIN && z.ObjectId == objectId &&
                        z.EntityObjectTypeCode == (transactionType != null ? (transactionType == TransactionType.SalesOrder ? "SALESORDER" : "PURCHASEORDER") : marketplaceTransaction.EntityObjectTypeCode)).FirstOrDefaultAsync();
                    if (tenantTransactionObj == null)
                    {
                        tenantTransaction = ObjectMapper.Map<AppTransactionHeaders>(marketplaceTransaction);
                        if (transactionType == TransactionType.SalesOrder)
                        {

                            tenantTransaction.Code = await GetTenantNextOrderNumber("SO", tenantId);
                            tenantTransaction.Name = "Sales Order#" + tenantTransaction.Code.TrimEnd();
                            tenantTransaction.EntityObjectTypeId = soType;
                            tenantTransaction.EntityObjectTypeCode = "SALESORDER";
                        }
                        else
                        {
                            tenantTransaction.Code = await GetTenantNextOrderNumber("PO", tenantId);
                            tenantTransaction.Name = "Purchase Order#" + tenantTransaction.Code.TrimEnd();
                            tenantTransaction.EntityObjectTypeId = poType;
                            tenantTransaction.EntityObjectTypeCode = "PURCHASEORDER";
                        }

                        // AppTransactionHeaders tenantTransaction = new AppTransactionHeaders();
                        var existingTrand = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().Where(z => z.TenantId == tenantId && z.Code == tenantTransaction.Code && z.EntityObjectStatusId == null && z.EntityObjectTypeId == tenantTransaction.EntityObjectTypeId).FirstOrDefaultAsync();
                        if (existingTrand != null)
                        {
                            tenantTransaction.Id = existingTrand.Id;
                            //CurrentUnitOfWork.GetDbContext<onetouchDbContext>().ChangeTracker.Clear();
                            // await _appTransactionsHeaderRepository.UpdateAsync(tenantTransaction);
                        }
                        else
                        {


                            tenantTransaction.Id = 0;
                        }
                        tenantTransaction.TenantOwner = int.Parse(marketplaceTransaction.TenantOwner.ToString());
                        tenantTransaction.TenantId = tenantId;

                        tenantTransaction.EnteredDate = marketplaceTransaction.EnteredDate;
                        tenantTransaction.AppTransactionDetails = null;
                        tenantTransaction.AppTransactionContacts = null;
                        tenantTransaction.EntityCategories = null;
                        tenantTransaction.EntityClassifications = null;
                        tenantTransaction.EntityAttachments = null;


                        //
                        await ShareManualAccount(marketplaceTransaction.BuyerCompanySSIN, tenantId);
                        await ShareManualAccount(marketplaceTransaction.SellerCompanySSIN, tenantId);
                        //if (transactionType == TransactionType.SalesOrder)
                        //{

                        //    tenantTransaction.Code = await GetTenantNextOrderNumber("SO", tenantId);
                        //    tenantTransaction.Name = "Sales Order#" + tenantTransaction.Code.TrimEnd();
                        //    tenantTransaction.EntityObjectTypeId = soType;
                        //    tenantTransaction.EntityObjectTypeCode = "SALESORDER";
                        //}
                        //else
                        //{
                        //    tenantTransaction.Code = await GetTenantNextOrderNumber("PO", tenantId);
                        //    tenantTransaction.Name = "Purchase Order#" + tenantTransaction.Code.TrimEnd();
                        //    tenantTransaction.EntityObjectTypeId = poType;
                        //    tenantTransaction.EntityObjectTypeCode = "PURCHASEORDER";
                        //}

                        returnTran = tenantTransaction.Code;

                        //var existingTrand = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().Where(z => z.TenantId == tenantId && z.Code == tenantTransaction.Code && z.EntityObjectStatusId == null && z.EntityObjectTypeId == tenantTransaction.EntityObjectTypeId).FirstOrDefaultAsync();
                        //if (existingTrand != null)
                        //{
                        //    tenantTransaction.Id = existingTrand.Id;
                        //    //CurrentUnitOfWork.GetDbContext<onetouchDbContext>().ChangeTracker.Clear();
                        //   // await _appTransactionsHeaderRepository.UpdateAsync(tenantTransaction);
                        //    //await CurrentUnitOfWork.SaveChangesAsync();
                        //}



                        if (marketplaceTransaction.EntityCategories != null)
                        {
                            tenantTransaction.EntityCategories = new List<AppEntityCategory>();
                            foreach (var cat in marketplaceTransaction.EntityCategories)
                            {
                                var catg = new AppEntityCategory();
                                catg = ObjectMapper.Map<AppEntityCategory>(cat);
                                catg.Id = 0;
                                catg.EntityId = tenantTransaction.Id;
                                catg.EntityFk = tenantTransaction;
                                catg.EntityCode = tenantTransaction.Code;
                                tenantTransaction.EntityCategories.Add(catg);
                                //tenantTransaction.EntityCategories.Add(catg);
                                //_appEntityCategoryRepository.InsertAsync(catg);
                            }

                        }
                        if (marketplaceTransaction.EntityClassifications != null)
                        {
                            tenantTransaction.EntityClassifications = new List<AppEntityClassification>();
                            foreach (var cat in marketplaceTransaction.EntityClassifications)
                            {
                                var catg = new AppEntityClassification();
                                catg = ObjectMapper.Map<AppEntityClassification>(cat);
                                catg.Id = 0;
                                catg.EntityId = tenantTransaction.Id;
                                catg.EntityFk = tenantTransaction;
                                catg.EntityCode = tenantTransaction.Code;
                                //tenantTransaction.EntityClassifications.Add(catg);
                                // _appEntityClassificationRepository.InsertAsync(catg);
                                tenantTransaction.EntityClassifications.Add(catg);
                            }

                        }
                        // var existingTrand = _appTransactionsHeaderRepository.GetAll().Where(z => z.TenantId == tenantId && z.Code == tenantTransaction.Code && z.EntityObjectStatusId == null).FirstOrDefaultAsync();
                        //CurrentUnitOfWork.GetDbContext<onetouchDbContext>().ChangeTracker.Clear();
                        //if (tenantTransaction.Id == 0)
                        //     await _appTransactionsHeaderRepository.InsertAsync(tenantTransaction);
                        // else
                        //45
                        //await _appTransactionsHeaderRepository.UpdateAsync(tenantTransaction);

                        //await CurrentUnitOfWork.SaveChangesAsync();
                        //45
                        //MMT45
                        if (marketplaceTransaction.AppMarketplaceTransactionContacts != null && marketplaceTransaction.AppMarketplaceTransactionContacts.Count > 0)
                        {
                            tenantTransaction.AppTransactionContacts = new List<AppTransactionContacts>();
                            foreach (var cont in marketplaceTransaction.AppMarketplaceTransactionContacts)
                            {
                                AppTransactionContacts contact = new AppTransactionContacts();
                                contact = ObjectMapper.Map<AppTransactionContacts>(cont);
                                contact.Id = 0;
                                contact.TransactionId = tenantTransaction.Id;
                                contact.TransactionIdFK = tenantTransaction;
                                tenantTransaction.AppTransactionContacts.Add(contact);
                            }
                        }
                        GetAppTransactionsForViewDto saveDto = ObjectMapper.Map<GetAppTransactionsForViewDto>(tenantTransaction);
                        saveDto.EnteredByUserRole = tenantTransaction.EnteredUserByRole;
                        var tranNo = await CreateOrEditTransaction(saveDto);
                        if (tranNo != null && tranNo != 0)
                            tenantTransaction.Id = tranNo;
                        //await CurrentUnitOfWork.SaveChangesAsync();
                        CurrentUnitOfWork.GetDbContext<onetouchDbContext>().ChangeTracker.Clear();
                        //MMT45
                        if (marketplaceTransaction.EntityAttachments != null && marketplaceTransaction.EntityAttachments.Count > 0)
                        {
                            tenantTransaction.EntityAttachments = new List<AppEntityAttachment>();
                            foreach (var ext in marketplaceTransaction.EntityAttachments)
                            {
                                var newExt = new AppEntityAttachment();
                                newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                newExt.EntityId = tenantTransaction.Id;
                                newExt.Id = 0;
                                //newExt.EntityFk = tenantTransaction;
                                newExt.AttachmentFk.TenantId = tenantId;
                                MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId, null);
                                newExt.AttachmentId = 0;
                                newExt.AttachmentFk.Id = 0;
                                tenantTransaction.EntityAttachments.Add(newExt);

                            }
                        }
                        await _appTransactionsHeaderRepository.UpdateAsync(tenantTransaction);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        ;                        //returnId = marketplaceTransaction.Id;
                        //marketplaceTransaction.Code = transaction.SSIN;
                        if (marketplaceTransaction.AppMarketplaceTransactionDetails != null && marketplaceTransaction.AppMarketplaceTransactionDetails.Count > 0)
                        {
                            //marketplaceTransaction.AppMarketplaceTransactionDetails = new List<AppMarketplaceTransactionDetails>();
                            foreach (var det in marketplaceTransaction.AppMarketplaceTransactionDetails)
                            {
                                if (det.ParentId != null)
                                    continue;
                                //I45
                                await GetProductFromMarketplace(det.SSIN, int.Parse(tenantId.ToString()), marketplaceTransaction.Id);
                                //I45
                                AppTransactionDetails detail = new AppTransactionDetails();
                                detail = ObjectMapper.Map<AppTransactionDetails>(det);
                                detail.Id = 0;
                                detail.TenantOwner = int.Parse(det.TenantOwner.ToString());
                                detail.TenantId = tenantId;
                                detail.TransactionId = tenantTransaction.Id;
                                detail.TransactionIdFk = tenantTransaction;
                                detail.EntityObjectTypeId = tenantTransaction.EntityObjectTypeId;
                                detail.EntityObjectTypeCode = tenantTransaction.EntityObjectTypeCode;
                                detail.Code = tenantTransaction.TenantId.ToString().TrimEnd() + "-" +
                                    tenantTransaction.Code.TrimEnd() + "-" + 
                                    detail.LineNo.ToString() + "-" +
                                    (string.IsNullOrEmpty(detail.SSIN) ? detail.ItemSSIN :detail.SSIN.TrimEnd());
                                //marketplaceTransaction.AppMarketplaceTransactionDetails.Add(detail);
                                if (det.EntityExtraData != null && det.EntityExtraData.Count > 0)
                                {
                                    detail.EntityExtraData = new List<AppEntityExtraData>();
                                    foreach (var ext in det.EntityExtraData)
                                    {
                                        var newExt = new AppEntityExtraData();
                                        newExt = ObjectMapper.Map<AppEntityExtraData>(ext);
                                        newExt.EntityId = 0;
                                        newExt.Id = 0;
                                        newExt.EntityFk = null;
                                        detail.EntityExtraData.Add(newExt);
                                    }
                                }
                                if (det.EntityAttachments != null && det.EntityAttachments.Count > 0)
                                {
                                    detail.EntityAttachments = new List<AppEntityAttachment>();
                                    foreach (var ext in det.EntityAttachments)
                                    {
                                        var newExt = new AppEntityAttachment();
                                        newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                        newExt.EntityId = 0;
                                        newExt.Id = 0;
                                        newExt.EntityFk = null;
                                        newExt.AttachmentFk.TenantId = tenantId;
                                        MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId, null);
                                        newExt.AttachmentId = 0;
                                        newExt.AttachmentFk.Id = 0;
                                        detail.EntityAttachments.Add(newExt);
                                    }
                                }
                                if (det.EntityCategories != null)
                                {
                                    detail.EntityCategories = new List<AppEntityCategory>();
                                    foreach (var cat in det.EntityCategories)
                                    {
                                        var catg = new AppEntityCategory();
                                        catg = ObjectMapper.Map<AppEntityCategory>(cat);
                                        catg.Id = 0;
                                        catg.EntityId = 0;
                                        catg.EntityFk = null;
                                        catg.EntityCode = detail.Code;
                                        detail.EntityCategories.Add(catg);
                                    }

                                }
                                if (det.EntityClassifications != null)
                                {
                                    detail.EntityClassifications = new List<AppEntityClassification>();
                                    foreach (var cat in det.EntityClassifications)
                                    {
                                        var catg = new AppEntityClassification();
                                        catg = ObjectMapper.Map<AppEntityClassification>(cat);
                                        catg.Id = 0;
                                        catg.EntityId = 0;
                                        catg.EntityFk = null;
                                        catg.EntityCode = detail.Code;
                                        detail.EntityClassifications.Add(catg);
                                    }

                                }
                                await _appTransactionDetails.InsertAsync(detail);
                                await CurrentUnitOfWork.SaveChangesAsync();

                                var children = marketplaceTransaction.AppMarketplaceTransactionDetails.Where(z => z.ParentId == det.Id).ToList();
                                if (children != null && children.Count() > 0)
                                {
                                    foreach (var ch in children)
                                    {
                                        AppTransactionDetails detailch = new AppTransactionDetails();
                                        detailch = ObjectMapper.Map<AppTransactionDetails>(ch);
                                        detailch.Id = 0;
                                        detailch.TenantOwner = int.Parse(ch.TenantOwner.ToString());
                                        detailch.TenantId = tenantId;
                                        detailch.TransactionId = tenantTransaction.Id;
                                        detailch.TransactionIdFk = tenantTransaction;
                                        detailch.ParentId = detail.Id;
                                        detailch.EntityObjectTypeId = tenantTransaction.EntityObjectTypeId;
                                        detailch.EntityObjectTypeCode = tenantTransaction.EntityObjectTypeCode;
                                        detailch.Code = tenantTransaction.TenantId.ToString().TrimEnd() + "-" + tenantTransaction.Code.TrimEnd() + "-" + detailch.LineNo.ToString() + "-" + detailch.SSIN.TrimEnd();
                                        if (ch.EntityExtraData != null && ch.EntityExtraData.Count > 0)
                                        {
                                            detailch.EntityExtraData = new List<AppEntityExtraData>();
                                            foreach (var ext in ch.EntityExtraData)
                                            {
                                                var newExt = new AppEntityExtraData();
                                                newExt = ObjectMapper.Map<AppEntityExtraData>(ext);
                                                newExt.EntityId = 0;
                                                newExt.Id = 0;
                                                newExt.EntityFk = null;
                                                detailch.EntityExtraData.Add(newExt);
                                            }
                                        }
                                        if (ch.EntityAttachments != null && ch.EntityAttachments.Count > 0)
                                        {
                                            detailch.EntityAttachments = new List<AppEntityAttachment>();
                                            foreach (var ext in ch.EntityAttachments)
                                            {
                                                var newExt = new AppEntityAttachment();
                                                newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                                newExt.EntityId = 0;
                                                newExt.Id = 0;
                                                newExt.EntityFk = null;
                                                newExt.AttachmentFk.TenantId = null;
                                                MoveFile(ext.AttachmentFk.Attachment, detailch.TenantOwner, -1, null);
                                                newExt.AttachmentId = 0;
                                                newExt.AttachmentFk.Id = 0;
                                                detailch.EntityAttachments.Add(newExt);
                                            }
                                        }
                                        await _appTransactionDetails.InsertAsync(detailch);
                                    }
                                    await CurrentUnitOfWork.SaveChangesAsync();
                                }
                            }
                        }
                        //MM45
                        //if (marketplaceTransaction.AppMarketplaceTransactionContacts != null && marketplaceTransaction.AppMarketplaceTransactionContacts.Count > 0)
                        //{
                        //    //marketplaceTransaction.AppMarketplaceTransactionContacts = new List<AppMarketplaceTransactionContacts>();
                        //    foreach (var cont in marketplaceTransaction.AppMarketplaceTransactionContacts)
                        //    {
                        //        AppTransactionContacts contact = new AppTransactionContacts();
                        //        contact = ObjectMapper.Map<AppTransactionContacts>(cont);
                        //        contact.Id = 0;
                        //        contact.TransactionId = tenantTransaction.Id;
                        //        contact.TransactionIdFK = tenantTransaction;
                        //        await _appTransactionContactsRepository.InsertAsync(contact);
                        //    }
                        //}
                        //await CurrentUnitOfWork.SaveChangesAsync();
                        //MM45
                    }
                    else // If the transaction is shared with this Tenant before
                    {
                        if (tenantId == AbpSession.TenantId)
                        {
                            return tenantTransactionObj.Code;
                        }
                        //Update Existing[Start]
                        var id = tenantTransactionObj.Id;
                        string code = tenantTransactionObj.Code;
                        string name = tenantTransactionObj.Name;
                        long tranType = tenantTransactionObj.EntityObjectTypeId;
                        string tranTypeCode = tenantTransactionObj.EntityObjectTypeCode;
                        tenantTransactionObj = ObjectMapper.Map<AppTransactionHeaders>(marketplaceTransaction);
                        tenantTransactionObj.TenantOwner = int.Parse(marketplaceTransaction.TenantOwner.ToString());
                        tenantTransactionObj.TenantId = tenantId;
                        tenantTransactionObj.Id = id;
                        tenantTransactionObj.Code = code;
                        tenantTransactionObj.Name = name;
                        tenantTransactionObj.EntityObjectTypeId = tranType;
                        tenantTransactionObj.EntityObjectTypeCode = tranTypeCode;
                        tenantTransactionObj.AppTransactionDetails = null;
                        tenantTransactionObj.AppTransactionContacts = null;
                        tenantTransactionObj.EntityCategories = null;
                        tenantTransactionObj.EntityClassifications = null;
                        tenantTransactionObj.EntityExtraData = null;
                        tenantTransactionObj.EntityAttachments = null;
                        tenantTransactionObj.EnteredDate = marketplaceTransaction.EnteredDate;
                        returnTran = tenantTransactionObj.Code;
                        await _appEntityAttachment.DeleteAsync(z => z.EntityId == id);
                        await _appEntityCategoryRepository.DeleteAsync(z => z.EntityId == id);
                        await _appEntityClassificationRepository.DeleteAsync(z => z.EntityId == id);
                        await _appEntityExtraData.DeleteAsync(z => z.EntityId == id);
                        await _appTransactionContactsRepository.DeleteAsync(z => z.TransactionId == id);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //I45
                        //if (marketplaceTransaction.EntityAttachments != null && marketplaceTransaction.EntityAttachments.Count > 0)
                        //{
                        //    tenantTransactionObj.EntityAttachments = new List<AppEntityAttachment>();
                        //    foreach (var ext in marketplaceTransaction.EntityAttachments)
                        //    {
                        //        var newExt = new AppEntityAttachment();
                        //        newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                        //        newExt.EntityId = 0;
                        //        newExt.Id = 0;
                        //        newExt.EntityFk = null;
                        //        newExt.AttachmentFk.TenantId = tenantId;
                        //        MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId);
                        //        newExt.AttachmentId = 0;
                        //        newExt.AttachmentFk.Id = 0;
                        //        tenantTransactionObj.EntityAttachments.Add(newExt);
                        //    }
                        //}
                        //I45
                        if (marketplaceTransaction.EntityCategories != null)
                        {
                            tenantTransactionObj.EntityCategories = new List<AppEntityCategory>();
                            foreach (var cat in marketplaceTransaction.EntityCategories)
                            {
                                var catg = new AppEntityCategory();
                                catg = ObjectMapper.Map<AppEntityCategory>(cat);
                                catg.Id = 0;
                                catg.EntityId = 0;
                                catg.EntityFk = null;
                                catg.EntityCode = marketplaceTransaction.Code;
                                tenantTransactionObj.EntityCategories.Add(catg);
                            }

                        }
                        if (marketplaceTransaction.EntityClassifications != null)
                        {
                            tenantTransactionObj.EntityClassifications = new List<AppEntityClassification>();
                            foreach (var cat in marketplaceTransaction.EntityClassifications)
                            {
                                var catg = new AppEntityClassification();
                                catg = ObjectMapper.Map<AppEntityClassification>(cat);
                                catg.Id = 0;
                                catg.EntityId = 0;
                                catg.EntityFk = null;
                                catg.EntityCode = marketplaceTransaction.Code;
                                tenantTransactionObj.EntityClassifications.Add(catg);
                            }

                        }
                        //I45
                        //await _appTransactionsHeaderRepository.UpdateAsync(tenantTransactionObj);
                        //await CurrentUnitOfWork.SaveChangesAsync();
                        if (marketplaceTransaction.AppMarketplaceTransactionContacts != null && marketplaceTransaction.AppMarketplaceTransactionContacts.Count > 0)
                        {
                            tenantTransactionObj.AppTransactionContacts = null;
                            tenantTransactionObj.AppTransactionContacts = new List<AppTransactionContacts>();
                            foreach (var cont in marketplaceTransaction.AppMarketplaceTransactionContacts)
                            {
                                AppTransactionContacts contact = new AppTransactionContacts();
                                contact = ObjectMapper.Map<AppTransactionContacts>(cont);
                                contact.Id = 0;
                                contact.TransactionId = tenantTransactionObj.Id;
                                contact.TransactionIdFK = tenantTransactionObj;
                                //await _appTransactionContactsRepository.InsertAsync(contact);
                                tenantTransactionObj.AppTransactionContacts.Add(contact);
                            }
                        }
                        //await CurrentUnitOfWork.SaveChangesAsync();
                        GetAppTransactionsForViewDto saveDto = ObjectMapper.Map<GetAppTransactionsForViewDto>(tenantTransactionObj);
                        saveDto.EnteredByUserRole = tenantTransactionObj.EnteredUserByRole;
                        await CreateOrEditTransaction(saveDto);
                        CurrentUnitOfWork.GetDbContext<onetouchDbContext>().ChangeTracker.Clear();

                        tenantTransactionObj = await _appTransactionsHeaderRepository.GetAll().AsNoTracking()
                       .Where(z => z.TenantId == tenantId && z.SSIN == marketplaceTransaction.SSIN && z.ObjectId == objectId &&
                       z.EntityObjectTypeCode == (transactionType != null ? (transactionType == TransactionType.SalesOrder ? "SALESORDER" : "PURCHASEORDER") : marketplaceTransaction.EntityObjectTypeCode)).FirstOrDefaultAsync();

                        if (marketplaceTransaction.EntityAttachments != null && marketplaceTransaction.EntityAttachments.Count > 0)
                        {
                            tenantTransactionObj.EntityAttachments = new List<AppEntityAttachment>();
                            foreach (var ext in marketplaceTransaction.EntityAttachments)
                            {
                                var newExt = new AppEntityAttachment();
                                newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                newExt.EntityId = 0;
                                newExt.Id = 0;
                                newExt.EntityFk = null;
                                newExt.AttachmentFk.TenantId = tenantId;
                                MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId, null);
                                newExt.AttachmentId = 0;
                                newExt.AttachmentFk.Id = 0;
                                tenantTransactionObj.EntityAttachments.Add(newExt);
                            }
                        }
                        await _appTransactionsHeaderRepository.UpdateAsync(tenantTransactionObj);
                        //I45
                        //returnId = tenantTransactionObj.Id;
                        await _appTransactionDetails.DeleteAsync(z => z.TransactionId == id && z.ParentId != null);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        await _appTransactionDetails.DeleteAsync(z => z.TransactionId == id && z.ParentId == null);
                        //await _appTransactionContactsRepository.DeleteAsync(z => z.TransactionId == id);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        if (marketplaceTransaction.AppMarketplaceTransactionDetails != null && marketplaceTransaction.AppMarketplaceTransactionDetails.Count > 0)
                        {
                            //marketplaceTransaction.AppMarketplaceTransactionDetails = new List<AppMarketplaceTransactionDetails>();
                            foreach (var det in marketplaceTransaction.AppMarketplaceTransactionDetails)
                            {
                                if (det.ParentId != null)
                                    continue;
                                //I45
                                await GetProductFromMarketplace(det.SSIN, int.Parse(tenantId.ToString()), marketplaceTransaction.Id);
                                //I45
                                AppTransactionDetails detail = new AppTransactionDetails();
                                detail = ObjectMapper.Map<AppTransactionDetails>(det);
                                detail.Id = 0;
                                detail.TenantOwner = int.Parse(det.TenantOwner.ToString());
                                detail.TenantId = tenantId;
                                detail.TransactionId = tenantTransactionObj.Id;
                                detail.TransactionIdFk = tenantTransactionObj;
                                detail.EntityObjectTypeId = tranType;
                                detail.EntityObjectTypeCode = tranTypeCode;
                                detail.Code = tenantTransactionObj.TenantId.ToString().TrimEnd() + "-" + tenantTransactionObj.Code.TrimEnd() + "-" + detail.LineNo.ToString() + "-" + (string.IsNullOrEmpty(detail.SSIN) ?detail.ItemSSIN.TrimEnd() :detail.SSIN.TrimEnd());
                                if (det.EntityExtraData != null && det.EntityExtraData.Count > 0)
                                {
                                    detail.EntityExtraData = new List<AppEntityExtraData>();
                                    foreach (var ext in det.EntityExtraData)
                                    {
                                        var newExt = new AppEntityExtraData();
                                        newExt = ObjectMapper.Map<AppEntityExtraData>(ext);
                                        newExt.EntityId = 0;
                                        newExt.EntityFk = null;
                                        newExt.Id = 0;
                                        detail.EntityExtraData.Add(newExt);
                                    }
                                }
                                if (det.EntityAttachments != null && det.EntityAttachments.Count > 0)
                                {
                                    detail.EntityAttachments = new List<AppEntityAttachment>();
                                    foreach (var ext in det.EntityAttachments)
                                    {
                                        var newExt = new AppEntityAttachment();
                                        newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                        newExt.EntityId = 0;
                                        newExt.Id = 0;
                                        newExt.EntityFk = null;
                                        newExt.AttachmentFk.TenantId = tenantId;
                                        MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId, null);
                                        newExt.AttachmentId = 0;
                                        newExt.AttachmentFk.Id = 0;
                                        detail.EntityAttachments.Add(newExt);
                                    }
                                }
                                if (det.EntityCategories != null)
                                {
                                    detail.EntityCategories = new List<AppEntityCategory>();
                                    foreach (var cat in det.EntityCategories)
                                    {
                                        var catg = new AppEntityCategory();
                                        catg = ObjectMapper.Map<AppEntityCategory>(cat);
                                        catg.Id = 0;
                                        catg.EntityId = 0;
                                        catg.EntityFk = null;
                                        catg.EntityCode = detail.Code;
                                        detail.EntityCategories.Add(catg);
                                    }

                                }
                                if (det.EntityClassifications != null)
                                {
                                    detail.EntityClassifications = new List<AppEntityClassification>();
                                    foreach (var cat in det.EntityClassifications)
                                    {
                                        var catg = new AppEntityClassification();
                                        catg = ObjectMapper.Map<AppEntityClassification>(cat);
                                        catg.Id = 0;
                                        catg.EntityId = 0;
                                        catg.EntityFk = null;
                                        catg.EntityCode = detail.Code;
                                        detail.EntityClassifications.Add(catg);
                                    }

                                }
                                //marketplaceTransaction.AppMarketplaceTransactionDetails.Add(detail);
                                await _appTransactionDetails.InsertAsync(detail);
                                await CurrentUnitOfWork.SaveChangesAsync();

                                var children = marketplaceTransaction.AppMarketplaceTransactionDetails.Where(z => z.ParentId == det.Id).ToList();
                                if (children != null && children.Count() > 0)
                                {
                                    foreach (var ch in children)
                                    {
                                        AppTransactionDetails detailch = new AppTransactionDetails();
                                        detailch = ObjectMapper.Map<AppTransactionDetails>(ch);
                                        detailch.Id = 0;
                                        detailch.TenantOwner = int.Parse(ch.TenantOwner.ToString());
                                        detailch.TenantId = tenantId;
                                        detailch.TransactionId = tenantTransactionObj.Id;
                                        detailch.TransactionIdFk = tenantTransactionObj;
                                        detailch.ParentId = detail.Id;
                                        detailch.Code = tenantTransactionObj.TenantId.ToString().TrimEnd() + "-" + tenantTransactionObj.Code.TrimEnd() + "-" + detailch.LineNo.ToString() + "-" + detailch.SSIN.TrimEnd();
                                        if (ch.EntityExtraData != null && ch.EntityExtraData.Count > 0)
                                        {
                                            detailch.EntityExtraData = new List<AppEntityExtraData>();
                                            foreach (var ext in ch.EntityExtraData)
                                            {
                                                var newExt = new AppEntityExtraData();
                                                newExt = ObjectMapper.Map<AppEntityExtraData>(ext);
                                                newExt.EntityId = 0;
                                                newExt.Id = 0;
                                                newExt.EntityFk = null;
                                                detailch.EntityExtraData.Add(newExt);
                                            }
                                        }
                                        if (ch.EntityAttachments != null && ch.EntityAttachments.Count > 0)
                                        {
                                            detailch.EntityAttachments = new List<AppEntityAttachment>();
                                            foreach (var ext in ch.EntityAttachments)
                                            {
                                                var newExt = new AppEntityAttachment();
                                                newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                                newExt.EntityId = 0;
                                                newExt.Id = 0;
                                                newExt.EntityFk = null;
                                                newExt.AttachmentFk.TenantId = tenantId;
                                                MoveFile(ext.AttachmentFk.Attachment, -1, tenantId, null);
                                                newExt.AttachmentId = 0;
                                                newExt.AttachmentFk.Id = 0;
                                                detailch.EntityAttachments.Add(newExt);
                                            }
                                        }
                                        await _appTransactionDetails.InsertAsync(detailch);
                                    }
                                    await CurrentUnitOfWork.SaveChangesAsync();
                                }
                            }
                        }
                        //I45
                        //if (marketplaceTransaction.AppMarketplaceTransactionContacts != null && marketplaceTransaction.AppMarketplaceTransactionContacts.Count > 0)
                        //{
                        //    //marketplaceTransaction.AppMarketplaceTransactionContacts = new List<AppMarketplaceTransactionContacts>();
                        //    foreach (var cont in marketplaceTransaction.AppMarketplaceTransactionContacts)
                        //    {
                        //        AppTransactionContacts contact = new AppTransactionContacts();
                        //        contact = ObjectMapper.Map<AppTransactionContacts>(cont);
                        //        contact.Id = 0;
                        //        contact.TransactionId = tenantTransactionObj.Id;
                        //        contact.TransactionIdFK = tenantTransactionObj;
                        //        await _appTransactionContactsRepository.InsertAsync(contact);
                        //    }
                        //}
                        //await CurrentUnitOfWork.SaveChangesAsync();
                        //I45
                        //[End]
                    }
                }
            }
            return returnTran;
        }
        public async Task<long> ShareTransactionOnMarketplace(long input)
        {
                long returnId = 0;
            var objectId = await _helper.SystemTables.GetObjectTransactionId();


            var transaction = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().Include(z => z.EntityClassifications).Include(z => z.EntityCategories)
                .Include(z => z.AppTransactionDetails).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(z => z.AppTransactionDetails).ThenInclude(z => z.EntityCategories)
                .Include(z => z.AppTransactionDetails).ThenInclude(z => z.EntityClassifications)
                .Include(z => z.AppTransactionDetails).ThenInclude(z => z.EntityExtraData)
                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(z => z.AppTransactionContacts).AsNoTracking().Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(z => z.EntityExtraData)
                .Where(z => z.Id == input).FirstOrDefaultAsync();
            if (transaction != null)
            {
                var marketplaceTransaction = await _appMarketplaceTransactionHeadersRepository.GetAll().AsNoTracking().Where(z => z.SSIN == transaction.SSIN && z.ObjectId == objectId && z.TenantId == null).FirstOrDefaultAsync();
                if (marketplaceTransaction == null)
                {
                    marketplaceTransaction = new AppMarketplaceTransactionHeaders();
                    marketplaceTransaction = ObjectMapper.Map<AppMarketplaceTransactionHeaders>(transaction);
                    marketplaceTransaction.TenantOwner = int.Parse(transaction.TenantId.ToString());
                    marketplaceTransaction.TenantId = null;
                    marketplaceTransaction.Id = 0;
                    marketplaceTransaction.Code = marketplaceTransaction.TenantOwner.ToString().Trim() + "-" + marketplaceTransaction.Code.Trim();
                    marketplaceTransaction.AppMarketplaceTransactionDetails = null;
                    marketplaceTransaction.AppMarketplaceTransactionContacts = null;
                    marketplaceTransaction.EnteredDate = transaction.EnteredDate;
                    marketplaceTransaction.TimeStamp = transaction.TimeStamp;
                    //marketplaceTransaction.AppMarketplaceTransactionDetails = null;
                    //marketplaceTransaction.AppMarketplaceTransactionContacts = null;
                    marketplaceTransaction.EntityCategories = null;
                    marketplaceTransaction.EntityClassifications = null;

                    if (transaction.EntityAttachments != null && transaction.EntityAttachments.Count > 0)
                    {
                        marketplaceTransaction.EntityAttachments = new List<AppEntityAttachment>();
                        foreach (var ext in transaction.EntityAttachments)
                        {
                            var newExt = new AppEntityAttachment();
                            newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                            newExt.EntityId = 0;
                            newExt.Id = 0;
                            newExt.EntityFk = null;
                            newExt.AttachmentFk.TenantId = null;
                            MoveFile(newExt.AttachmentFk.Attachment, marketplaceTransaction.TenantOwner, -1, null);
                            newExt.AttachmentId = 0;
                            newExt.AttachmentFk.Id = 0;
                            marketplaceTransaction.EntityAttachments.Add(newExt);
                        }
                    }

                    if (transaction.EntityCategories != null)
                    {
                        marketplaceTransaction.EntityCategories = new List<AppEntityCategory>();
                        foreach (var cat in transaction.EntityCategories)
                        {
                            var catg = new AppEntityCategory();
                            catg = ObjectMapper.Map<AppEntityCategory>(cat);
                            catg.Id = 0;
                            catg.EntityId = 0;
                            catg.EntityFk = null;
                            catg.EntityCode = marketplaceTransaction.Code;
                            marketplaceTransaction.EntityCategories.Add(catg);
                        }

                    }
                    //Extra Data[start]
                    if (transaction.EntityExtraData != null)
                    {
                        marketplaceTransaction.EntityExtraData = new List<AppEntityExtraData>();
                        foreach (var ext in marketplaceTransaction.EntityExtraData)
                        {
                            var extra = new AppEntityExtraData();
                            extra = ObjectMapper.Map<AppEntityExtraData>(ext);
                            extra.Id = 0;
                            extra.EntityId = 0;
                            extra.EntityFk = null;
                            extra.EntityCode = marketplaceTransaction.Code;
                            marketplaceTransaction.EntityExtraData.Add(extra);
                        }

                    }
                    //Extra Data[end]
                    if (transaction.EntityClassifications != null)
                    {
                        marketplaceTransaction.EntityClassifications = new List<AppEntityClassification>();
                        foreach (var cat in transaction.EntityClassifications)
                        {
                            var catg = new AppEntityClassification();
                            catg = ObjectMapper.Map<AppEntityClassification>(cat);
                            catg.Id = 0;
                            catg.EntityId = 0;
                            catg.EntityFk = null;
                            catg.EntityCode = marketplaceTransaction.Code;
                            marketplaceTransaction.EntityClassifications.Add(catg);
                        }

                    }
                    _appMarketplaceTransactionHeadersRepository.Insert(marketplaceTransaction);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    returnId = marketplaceTransaction.Id;
                    //marketplaceTransaction.Code = transaction.SSIN;
                    if (transaction.AppTransactionDetails != null && transaction.AppTransactionDetails.Count > 0)
                    {
                        //marketplaceTransaction.AppMarketplaceTransactionDetails = new List<AppMarketplaceTransactionDetails>();
                        foreach (var det in transaction.AppTransactionDetails)
                        {
                            if (det.ParentId != null)
                                continue;
                            AppMarketplaceTransactionDetails detail = new AppMarketplaceTransactionDetails();
                            detail = ObjectMapper.Map<AppMarketplaceTransactionDetails>(det);
                            detail.Id = 0;
                            detail.TenantOwner = int.Parse(detail.TenantId.ToString());
                            detail.TenantId = null;
                            detail.TransactionId = marketplaceTransaction.Id;
                            detail.TransactionIdFk = marketplaceTransaction;
                            //marketplaceTransaction.AppMarketplaceTransactionDetails.Add(detail);
                            if (det.EntityExtraData != null && det.EntityExtraData.Count > 0)
                            {
                                detail.EntityExtraData = new List<AppEntityExtraData>();
                                foreach (var ext in det.EntityExtraData)
                                {
                                    var newExt = new AppEntityExtraData();
                                    newExt = ObjectMapper.Map<AppEntityExtraData>(ext);
                                    newExt.EntityId = 0;
                                    newExt.EntityFk = null;
                                    newExt.Id = 0;
                                    detail.EntityExtraData.Add(newExt);
                                }
                            }
                            if (det.EntityAttachments != null && det.EntityAttachments.Count > 0)
                            {
                                detail.EntityAttachments = new List<AppEntityAttachment>();
                                foreach (var ext in det.EntityAttachments)
                                {
                                    var newExt = new AppEntityAttachment();
                                    newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                    newExt.EntityId = 0;
                                    newExt.Id = 0;
                                    newExt.EntityFk = null;
                                    newExt.AttachmentFk.TenantId = null;
                                    MoveFile(newExt.AttachmentFk.Attachment, detail.TenantOwner, -1, null);
                                    newExt.AttachmentId = 0;
                                    newExt.AttachmentFk.Id = 0;
                                    detail.EntityAttachments.Add(newExt);
                                }
                            }
                            if (det.EntityCategories != null)
                            {
                                detail.EntityCategories = new List<AppEntityCategory>();
                                foreach (var cat in det.EntityCategories)
                                {
                                    var catg = new AppEntityCategory();
                                    catg = ObjectMapper.Map<AppEntityCategory>(cat);
                                    catg.Id = 0;
                                    catg.EntityId = 0;
                                    catg.EntityFk = null;
                                    catg.EntityCode = detail.Code;
                                    detail.EntityCategories.Add(catg);
                                }

                            }
                            if (det.EntityClassifications != null)
                            {
                                detail.EntityClassifications = new List<AppEntityClassification>();
                                foreach (var cat in det.EntityClassifications)
                                {
                                    var catg = new AppEntityClassification();
                                    catg = ObjectMapper.Map<AppEntityClassification>(cat);
                                    catg.Id = 0;
                                    catg.EntityId = 0;
                                    catg.EntityFk = null;
                                    catg.EntityCode = detail.Code;
                                    detail.EntityClassifications.Add(catg);
                                }

                            }
                            await _appMarketplaceTransctionDetailsRepository.InsertAsync(detail);
                            await CurrentUnitOfWork.SaveChangesAsync();

                            var children = transaction.AppTransactionDetails.Where(z => z.ParentId == det.Id).ToList();
                            if (children != null && children.Count > 0)
                            {
                                foreach (var ch in children)
                                {
                                    AppMarketplaceTransactionDetails detailch = new AppMarketplaceTransactionDetails();
                                    detailch = ObjectMapper.Map<AppMarketplaceTransactionDetails>(ch);
                                    detailch.Id = 0;
                                    detailch.TenantOwner = int.Parse(ch.TenantId.ToString());
                                    detailch.TenantId = null;
                                    detailch.TransactionId = marketplaceTransaction.Id;
                                    detailch.TransactionIdFk = marketplaceTransaction;
                                    detailch.ParentId = detail.Id;
                                    if (ch.EntityExtraData != null && ch.EntityExtraData.Count > 0)
                                    {
                                        detailch.EntityExtraData = new List<AppEntityExtraData>();
                                        foreach (var ext in ch.EntityExtraData)
                                        {
                                            var newExt = new AppEntityExtraData();
                                            newExt = ObjectMapper.Map<AppEntityExtraData>(ext);
                                            newExt.EntityId = 0;
                                            newExt.Id = 0;
                                            newExt.EntityFk = null;
                                            detailch.EntityExtraData.Add(newExt);
                                        }
                                    }
                                    if (ch.EntityAttachments != null && ch.EntityAttachments.Count > 0)
                                    {
                                        detailch.EntityAttachments = new List<AppEntityAttachment>();
                                        foreach (var ext in ch.EntityAttachments)
                                        {
                                            var newExt = new AppEntityAttachment();
                                            newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                            newExt.EntityId = 0;
                                            newExt.Id = 0;
                                            newExt.EntityFk = null;
                                            newExt.AttachmentFk.TenantId = null;
                                            MoveFile(ext.AttachmentFk.Attachment, detailch.TenantOwner, -1, null);
                                            newExt.AttachmentId = 0;
                                            newExt.AttachmentFk.Id = 0;
                                            detailch.EntityAttachments.Add(newExt);
                                        }
                                    }
                                    await _appMarketplaceTransctionDetailsRepository.InsertAsync(detailch);
                                }
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }
                        }
                    }
                    if (transaction.AppTransactionContacts != null && transaction.AppTransactionContacts.Count > 0)
                    {
                        //marketplaceTransaction.AppMarketplaceTransactionContacts = new List<AppMarketplaceTransactionContacts>();
                        foreach (var cont in transaction.AppTransactionContacts)
                        {
                            AppMarketplaceTransactionContacts contact = new AppMarketplaceTransactionContacts();
                            contact = ObjectMapper.Map<AppMarketplaceTransactionContacts>(cont);
                            contact.Id = 0;
                            contact.TransactionId = marketplaceTransaction.Id;
                            contact.TransactionIdFK = marketplaceTransaction;
                            await _appMarketplaceTransctionContactsRepository.InsertAsync(contact);
                        }
                    }
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                else
                {
                    var id = marketplaceTransaction.Id;
                    marketplaceTransaction = ObjectMapper.Map<AppMarketplaceTransactionHeaders>(transaction);
                    marketplaceTransaction.TenantOwner = int.Parse(transaction.TenantId.ToString());
                    marketplaceTransaction.TenantId = null;
                    marketplaceTransaction.Id = id;
                    marketplaceTransaction.TimeStamp = transaction.TimeStamp;
                    marketplaceTransaction.AppMarketplaceTransactionDetails = null;
                    marketplaceTransaction.AppMarketplaceTransactionContacts = null;
                    marketplaceTransaction.EntityCategories = null;
                    marketplaceTransaction.EntityClassifications = null;
                    marketplaceTransaction.EnteredDate = transaction.EnteredDate;
                    marketplaceTransaction.Code = marketplaceTransaction.TenantOwner.ToString().Trim() + "-" + marketplaceTransaction.Code.Trim();
                    await _appEntityAttachment.DeleteAsync(z => z.EntityId == id);
                    await _appEntityCategoryRepository.DeleteAsync(z => z.EntityId == id);
                    await _appEntityClassificationRepository.DeleteAsync(z => z.EntityId == id);
                    await _appEntityExtraData.DeleteAsync(z => z.EntityId == id);
                    //await CurrentUnitOfWork.SaveChangesAsync();
                    if (transaction.EntityAttachments != null && transaction.EntityAttachments.Count > 0)
                    {
                        marketplaceTransaction.EntityAttachments = new List<AppEntityAttachment>();
                        foreach (var ext in transaction.EntityAttachments)
                        {
                            var newExt = new AppEntityAttachment();
                            newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                            newExt.EntityId = 0;
                            newExt.Id = 0;
                            newExt.EntityFk = null;
                            newExt.AttachmentFk.TenantId = null;
                            MoveFile(newExt.AttachmentFk.Attachment, marketplaceTransaction.TenantOwner, -1, null);
                            newExt.AttachmentId = 0;
                            newExt.AttachmentFk.Id = 0;
                            marketplaceTransaction.EntityAttachments.Add(newExt);
                        }
                    }
                    if (transaction.EntityCategories != null)
                    {
                        marketplaceTransaction.EntityCategories = new List<AppEntityCategory>();
                        foreach (var cat in transaction.EntityCategories)
                        {
                            var catg = new AppEntityCategory();
                            catg = ObjectMapper.Map<AppEntityCategory>(cat);
                            catg.Id = 0;
                            catg.EntityId = 0;
                            catg.EntityFk = null;
                            catg.EntityCode = marketplaceTransaction.Code;
                            marketplaceTransaction.EntityCategories.Add(catg);
                        }

                    }
                    if (transaction.EntityClassifications != null)
                    {
                        marketplaceTransaction.EntityClassifications = new List<AppEntityClassification>();
                        foreach (var cat in transaction.EntityClassifications)
                        {
                            var catg = new AppEntityClassification();
                            catg = ObjectMapper.Map<AppEntityClassification>(cat);
                            catg.Id = 0;
                            catg.EntityId = 0;
                            catg.EntityFk = null;
                            catg.EntityCode = marketplaceTransaction.Code;
                            marketplaceTransaction.EntityClassifications.Add(catg);
                        }

                    }
                    await _appMarketplaceTransactionHeadersRepository.UpdateAsync(marketplaceTransaction);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    returnId = marketplaceTransaction.Id;
                    await _appMarketplaceTransctionDetailsRepository.DeleteAsync(z => z.TransactionId == id && z.ParentId != null);
                    await CurrentUnitOfWork.SaveChangesAsync();

                    await _appMarketplaceTransctionDetailsRepository.DeleteAsync(z => z.TransactionId == id && z.ParentId == null);
                    await _appMarketplaceTransctionContactsRepository.DeleteAsync(z => z.TransactionId == id);
                    await CurrentUnitOfWork.SaveChangesAsync();

                    if (transaction.AppTransactionDetails != null && transaction.AppTransactionDetails.Count > 0)
                    {
                        //marketplaceTransaction.AppMarketplaceTransactionDetails = new List<AppMarketplaceTransactionDetails>();
                        foreach (var det in transaction.AppTransactionDetails)
                        {
                            if (det.ParentId != null)
                                continue;
                            AppMarketplaceTransactionDetails detail = new AppMarketplaceTransactionDetails();
                            detail = ObjectMapper.Map<AppMarketplaceTransactionDetails>(det);
                            detail.Id = 0;
                            detail.TenantOwner = int.Parse(detail.TenantId.ToString());
                            detail.TenantId = null;
                            detail.TransactionId = marketplaceTransaction.Id;
                            detail.TransactionIdFk = marketplaceTransaction;

                            if (det.EntityExtraData != null && det.EntityExtraData.Count > 0)
                            {
                                detail.EntityExtraData = new List<AppEntityExtraData>();
                                foreach (var ext in det.EntityExtraData)
                                {
                                    var newExt = new AppEntityExtraData();
                                    newExt = ObjectMapper.Map<AppEntityExtraData>(ext);
                                    newExt.EntityId = 0;
                                    newExt.Id = 0;
                                    newExt.EntityFk = null;
                                    detail.EntityExtraData.Add(newExt);
                                }
                            }
                            if (det.EntityAttachments != null && det.EntityAttachments.Count > 0)
                            {
                                detail.EntityAttachments = new List<AppEntityAttachment>();
                                foreach (var ext in det.EntityAttachments)
                                {
                                    var newExt = new AppEntityAttachment();
                                    newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                    newExt.EntityId = 0;
                                    newExt.Id = 0;
                                    newExt.EntityFk = null;
                                    newExt.AttachmentFk.TenantId = null;
                                    MoveFile(newExt.AttachmentFk.Attachment, detail.TenantOwner, -1, null);
                                    newExt.AttachmentId = 0;
                                    newExt.AttachmentFk.Id = 0;
                                    detail.EntityAttachments.Add(newExt);
                                }
                            }
                            if (det.EntityCategories != null)
                            {
                                detail.EntityCategories = new List<AppEntityCategory>();
                                foreach (var cat in det.EntityCategories)
                                {
                                    var catg = new AppEntityCategory();
                                    catg = ObjectMapper.Map<AppEntityCategory>(cat);
                                    catg.Id = 0;
                                    catg.EntityId = 0;
                                    catg.EntityFk = null;
                                    catg.EntityCode = detail.Code;
                                    detail.EntityCategories.Add(catg);
                                }

                            }
                            if (det.EntityClassifications != null)
                            {
                                detail.EntityClassifications = new List<AppEntityClassification>();
                                foreach (var cat in det.EntityClassifications)
                                {
                                    var catg = new AppEntityClassification();
                                    catg = ObjectMapper.Map<AppEntityClassification>(cat);
                                    catg.Id = 0;
                                    catg.EntityId = 0;
                                    catg.EntityFk = null;
                                    catg.EntityCode = detail.Code;
                                    detail.EntityClassifications.Add(catg);
                                }

                            }
                            //marketplaceTransaction.AppMarketplaceTransactionDetails.Add(detail);
                            await _appMarketplaceTransctionDetailsRepository.InsertAsync(detail);
                            await CurrentUnitOfWork.SaveChangesAsync();

                            var children = transaction.AppTransactionDetails.Where(z => z.ParentId == det.Id).ToList();
                            if (children != null && children.Count > 0)
                            {
                                foreach (var ch in children)
                                {
                                    AppMarketplaceTransactionDetails detailch = new AppMarketplaceTransactionDetails();
                                    detailch = ObjectMapper.Map<AppMarketplaceTransactionDetails>(ch);
                                    detailch.Id = 0;
                                    detailch.TenantOwner = int.Parse(ch.TenantId.ToString());
                                    detailch.TenantId = null;
                                    detailch.TransactionId = marketplaceTransaction.Id;
                                    detailch.TransactionIdFk = marketplaceTransaction;
                                    detailch.ParentId = detail.Id;

                                    if (ch.EntityExtraData != null && ch.EntityExtraData.Count > 0)
                                    {
                                        detailch.EntityExtraData = new List<AppEntityExtraData>();
                                        foreach (var ext in ch.EntityExtraData)
                                        {
                                            var newExt = new AppEntityExtraData();
                                            newExt = ObjectMapper.Map<AppEntityExtraData>(ext);
                                            newExt.EntityId = 0;
                                            newExt.Id = 0;
                                            newExt.EntityFk = null;
                                            detailch.EntityExtraData.Add(newExt);
                                        }
                                    }
                                    if (ch.EntityAttachments != null && ch.EntityAttachments.Count > 0)
                                    {
                                        detailch.EntityAttachments = new List<AppEntityAttachment>();
                                        foreach (var ext in ch.EntityAttachments)
                                        {
                                            var newExt = new AppEntityAttachment();
                                            newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                            newExt.EntityId = 0;
                                            newExt.Id = 0;
                                            newExt.EntityFk = null;
                                            newExt.AttachmentFk.TenantId = null;
                                            MoveFile(ext.AttachmentFk.Attachment, detailch.TenantOwner, -1, null);
                                            newExt.AttachmentId = 0;
                                            newExt.AttachmentFk.Id = 0;
                                            detailch.EntityAttachments.Add(newExt);
                                        }
                                    }
                                    await _appMarketplaceTransctionDetailsRepository.InsertAsync(detailch);
                                }
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }
                        }
                    }
                    if (transaction.AppTransactionContacts != null && transaction.AppTransactionContacts.Count > 0)
                    {
                        //marketplaceTransaction.AppMarketplaceTransactionContacts = new List<AppMarketplaceTransactionContacts>();
                        foreach (var cont in transaction.AppTransactionContacts)
                        {
                            AppMarketplaceTransactionContacts contact = new AppMarketplaceTransactionContacts();
                            contact = ObjectMapper.Map<AppMarketplaceTransactionContacts>(cont);
                            contact.Id = 0;
                            contact.TransactionId = marketplaceTransaction.Id;
                            contact.TransactionIdFK = marketplaceTransaction;
                            await _appMarketplaceTransctionContactsRepository.InsertAsync(contact);
                        }
                    }
                    await CurrentUnitOfWork.SaveChangesAsync();

                }
            }
            return returnId;
        }
        public async Task<string> GetTenantNextOrderNumber(string tranType, long tenantId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {

                string returnString = "";
                var objectRec = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == (tranType == "SO" ? "SALESORDER" : "PURCHASEORDER"));
                if (objectRec != null)
                {
                    //XX
                    var header = await _appTransactionsHeaderRepository.GetAll().AsNoTracking()
                        .Where(x => x.EntityObjectTypeId == objectRec.Id && x.EntityObjectStatusId == null && x.TenantId == tenantId).FirstOrDefaultAsync();
                    if (header != null)
                    {
                        return header.Code;
                    }
                    //XX
                    var Id = objectRec.SycIdentifierDefinitionId;
                    if (Id != null)
                    {
                        var sycSegmentIdentifierDefinitions = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == Id).OrderBy(x => x.SegmentNumber).ToList();
                        if (sycSegmentIdentifierDefinitions != null && sycSegmentIdentifierDefinitions.Count > 0)
                        {
                            foreach (var segment in sycSegmentIdentifierDefinitions)
                            {
                                if (segment.IsAutoGenerated && segment.SegmentType == "Sequence")
                                {
                                    var sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == tenantId).FirstOrDefault();
                                    if (sycCounter == null)
                                    {
                                        sycCounter = new SycCounter();
                                        sycCounter.SycSegmentIdentifierDefinitionId = segment.Id;
                                        sycCounter.Counter = segment.CodeStartingValue + 1;
                                        if (AbpSession.TenantId != null)
                                        {
                                            sycCounter.TenantId = (int?)tenantId;
                                        }
                                        await _sycCounter.InsertAsync(sycCounter);
                                        await CurrentUnitOfWork.SaveChangesAsync();
                                        //returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                        if (segment.SegmentLength > 0)
                                        { returnString += segment.CodeStartingValue.ToString().Trim(); } //.PadLeft(segment.SegmentLength, '0')
                                    }
                                    else
                                    {
                                        //returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                        if (segment.SegmentLength > 0)
                                        { returnString += sycCounter.Counter.ToString().Trim(); }//.PadLeft(segment.SegmentLength, '0')

                                        sycCounter.Counter += 1;
                                        await _sycCounter.UpdateAsync(sycCounter);
                                        await CurrentUnitOfWork.SaveChangesAsync();

                                    }
                                }

                            }
                        }
                    }

                }
                //XX
                AppTransactionHeaders trans = new AppTransactionHeaders();
                if (tranType == "SO")
                {
                    trans.Name = "Sales Order#" + returnString.TrimEnd();
                    //input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
                }
                else
                {
                    trans.Name = "Purchase Order#" + returnString.TrimEnd();
                    //input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
                }
                trans.TenantOwner = int.Parse(tenantId.ToString());
                trans.ObjectId = await _helper.SystemTables.GetObjectTransactionId();
                trans.Id = 0;
                trans.Code = returnString;
                trans.TenantId = int.Parse(tenantId.ToString());
                trans.EntityObjectStatusId = null;
                trans.EntityObjectTypeId = objectRec.Id;
                await _appTransactionsHeaderRepository.InsertAsync(trans);
                await CurrentUnitOfWork.SaveChangesAsync();
                CurrentUnitOfWork.GetDbContext<onetouchDbContext>().ChangeTracker.Clear();
                //XX
                return returnString;
            }
        }
        //MMT37[End]
        //Iteration39[Start]
        public async Task<string> GetUserDefaultRole(string transType)
        {
            string returnRole = "";
            if (transType == "SO")
                returnRole = "I'm a Seller";
            else
                returnRole = "I'm a Buyer";

            var cont = await _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityClassifications).ThenInclude(z => z.EntityObjectClassificationFk)
                    .Where(z => z.IsProfileData && z.ParentId == null && z.PartnerId == null).FirstOrDefaultAsync();
            if (cont != null && cont.EntityFk != null && cont.EntityFk.EntityClassifications != null)
            {
                foreach (var clss in cont.EntityFk.EntityClassifications)
                {
                    if (transType == "SO")
                    {
                        var rep = cont.EntityFk.EntityClassifications.Where(z => z.EntityObjectClassificationFk.Name == "Independent Sales Rep").FirstOrDefault();
                        if (rep != null)
                            returnRole = rep.EntityObjectClassificationFk.Name;
                    }
                    else
                    {
                        var office = cont.EntityFk.EntityClassifications.Where(z => z.EntityObjectClassificationFk.Name == "Independent Buying Office").FirstOrDefault();
                        if (office != null)
                            returnRole = office.EntityObjectClassificationFk.Name;
                    }
                }
            }
            return returnRole;

        }
        //Iteration39[End]
        //Get Product Type Related Identifier
        private async Task<long?> GetProductTypeIdentifier(int productTypeId, long? tenantId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                bool entityIdentifierFound = false;
                long? returnCode = null;
                if (productTypeId > 0)
                {
                    var productType = await _SycEntityObjectTypesAppService.GetSycEntityObjectTypeForView(productTypeId);
                    if (productType != null)
                    {
                        var identifierId = productType.SycEntityObjectType.SycIdentifierDefinitionId;
                        if (identifierId != null)
                        {
                            returnCode = identifierId;
                            entityIdentifierFound = true;
                        }
                    }
                    if (entityIdentifierFound == false)
                    {
                        //var itemObjectId = await _helper.SystemTables.GetObjectItemId();
                        var sydobject = _sydObjectRepository.FirstOrDefault(x => x.Code == "ITEM");
                        if (sydobject != null)
                        {
                            var identifierId = sydobject.SycDefaultIdentifierId;
                            returnCode = identifierId;
                            entityIdentifierFound = true;
                        }
                    }
                }
                return returnCode;
            }
        }
        //MMT-OC[Start]
        public async Task<TenantContactRole> GetTenantRoleInTransaction(long transactionId, long? tenantId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                if (tenantId == null)
                    tenantId = AbpSession.TenantId;

                TenantContactRole returnObj = new TenantContactRole();
                var myAccount = await _appContactRepository.GetAll().Where(a => a.TenantId == tenantId & a.IsProfileData == true &
                    a.ParentId == null).FirstOrDefaultAsync();
                if (myAccount != null)
                {
                    var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                    var transactionContacts = await _appTransactionContactsRepository.GetAll().Where(z => z.TransactionId == transactionId).ToListAsync();
                    var contacts = await _appContactRepository.GetAll().Include(z => z.EntityFk)
                                   .Where(z => z.TenantId == tenantId && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && z.AccountId == myAccount.Id).ToListAsync();

                    //from o in _appTransactionContactsRepository.GetAll().Where(z => z.TransactionId == transactionId)
                    //           join c in _appContactRepository.GetAll().Include(z => z.EntityFk)
                    //         .Where(z => z.TenantId == AbpSession.TenantId && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && z.AccountId == myAccount.Id)
                    //       on o.ContactSSIN equals c.SSIN into j
                    //     from s in j.DefaultIfEmpty()
                    /*  select new TenantContactRole
                      {
                          ContactName = o.ContactName,
                          ContactRole = o.ContactRole
                      };*/
                    var joined = transactionContacts.Join(contacts, Z => Z.ContactSSIN, web => web.SSIN,
                                (Z, web) => new TenantContactRole
                                {
                                    ContactName = Z.ContactName,
                                    ContactRole = Z.ContactRole
                                });

                    //join b in  on a.ContactSSIN equals b.SSIN into j
                    //select new TenantContactRole
                    // {

                    // };

                    var contList = joined.ToList();
                    if (contList != null && contList.Count() > 0)
                    {
                        foreach (var cont in contList)
                        {
                            if (cont.ContactRole == ContactRoleEnum.Buyer.ToString() || cont.ContactRole == ContactRoleEnum.Seller.ToString() ||
                                cont.ContactRole == ContactRoleEnum.SalesRep1.ToString() || cont.ContactRole == ContactRoleEnum.SalesRep2.ToString())
                            {
                                returnObj = cont;
                                break;
                            }
                        }
                    }
                }
                return returnObj;
            }
        }
        //MMT-OC[End]
        //Iteration45[Start]
        public async Task<PagedResultDto<TransactionDetailView>> GetllTransactionVariationsDetail(VariationInputDto input)
        {
            long? transactionType = null;
            long soType = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
            long poType = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
            if (input.TransactionTypeFilter != null)
            {
                if (input.TransactionTypeFilter == TransactionType.SalesOrder)
                {
                    transactionType = soType;
                }
                else
                {
                    transactionType = poType;
                }
            }
            List<DataView> returnList = new List<DataView>();
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var transDetail = _appTransactionDetails.GetAll().Include(x => x.TransactionIdFk).Include(e => e.EntityAttachments).ThenInclude(e => e.AttachmentFk)
                  .Where(a => a.ParentId != null && a.TenantId == AbpSession.TenantId)
                  .WhereIf(input.TransactionTypeFilter != null, z => z.TransactionIdFk.EntityObjectTypeId == transactionType)
                  .WhereIf(!string.IsNullOrEmpty(input.TransactionNumberFilter), z => z.TransactionCode == input.TransactionNumberFilter)
                  .WhereIf(!string.IsNullOrEmpty(input.NameFilter!), z => z.Name.ToUpper().Contains(input.NameFilter.ToUpper()))
                  .WhereIf(input.MinPrice != null, z => z.NetPrice >= input.MinPrice)
                  .WhereIf(input.MaxPrice != null, z => z.NetPrice <= input.MaxPrice)
                  .WhereIf(input.MinAmount != null, z => z.Amount >= input.MinAmount)
                  .WhereIf(input.MaxAmount != null, z => z.Amount <= input.MaxAmount)
                  .WhereIf(!string.IsNullOrEmpty(input.VariationCodeFilter), z => z.ManufacturerCode.ToUpper().Contains(input.VariationCodeFilter.ToUpper()));

                var tranDetail = from o in transDetail
                                 select new TransactionDetailView
                                 {
                                     LineNo = o.LineNo,
                                     code = o.Code,
                                     ManufacturerCode = o.ManufacturerCode,
                                     name = o.Name,
                                     Qty = o.Quantity,
                                     TransactionNumber = o.TransactionCode,
                                     TransactionType = o.TransactionIdFk.EntityObjectTypeId == soType ? TransactionType.SalesOrder : TransactionType.PurchaseOrder,
                                     Price = o.NetPrice,
                                     Amount = o.Amount,
                                     Image = (o.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null) ?
                                       ((o.EntityAttachments.FirstOrDefault(x => x.IsDefault != true) != null) ? ("attachments/" + o.TenantId + "/" + (o.EntityAttachments.FirstOrDefault(x => x.IsDefault != true).AttachmentFk.Attachment)) : "")
                                        : "attachments/" + (o.TenantId.HasValue ? o.TenantId : -1) + "/" +
                                        (o.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment)
                                 };

                //    if (transDetail != null && transDetail.Count() > 0)
                //    {
                //        foreach (var variation in transDetail)
                //        {
                //            DataView sizeColorDetailView = new DataView();
                //            sizeColorDetailView.LineId = variation.Id;
                //            sizeColorDetailView.code = variation.Code;
                //            sizeColorDetailView.ManufacturerCode = variation.ManufacturerCode;
                //            sizeColorDetailView.name = variation.Name;
                //            sizeColorDetailView.Qty = variation.Quantity;
                //            sizeColorDetailView.NoOfPrePacks = (variation.NoOfPrePacks == null ? 0 : (long)variation.NoOfPrePacks);

                //            sizeColorDetailView.Price = variation.NetPrice;
                //            sizeColorDetailView.Amount = variation.Amount;
                //            sizeColorDetailView.Image = "";

                //            if (variation.EntityAttachments.Count() > 0)
                //            {
                //                var lineAttachmentDefault = variation.EntityAttachments.FirstOrDefault(x => x.IsDefault == true);
                //                var lineAttachment = variation.EntityAttachments.FirstOrDefault(x => x.IsDefault == true);
                //                sizeColorDetailView.Image = (lineAttachmentDefault == null ?
                //                           (lineAttachment != null ? "attachments/" + variation.TenantId + "/" + lineAttachment.AttachmentFk.Attachment : "")
                //                            : "attachments/" + (variation.TenantId.HasValue ? variation.TenantId : -1) + "/" +
                //                            lineAttachmentDefault.AttachmentFk.Attachment);
                //            }
                //            returnList.Add(sizeColorDetailView);
                //        }
                //    }
                //}
                var orderedItemsFilter = tranDetail.OrderBy(input.Sorting ?? "LineNo asc");
                var orderedItems = orderedItemsFilter.PageBy(input);

                //var appItemsList = await appItems.ToListAs ync();
                var appItemsList = await orderedItems.ToListAsync();

                var totalCount = await orderedItemsFilter.CountAsync();

                return new PagedResultDto<TransactionDetailView>(
                    totalCount,
                    appItemsList
                );
            }
        }
        public async Task<string> CreateManualAccount(CreateOrEditAccountInfoDto manualAccountInfo)
        {
            var account = await _accountAppService.CreateOrEditAccount(manualAccountInfo);
            if (account != null && account.AccountInfo != null && account.AccountInfo.Id != 0)
            {
                return account.AccountInfo.SSIN;
            }
            return "";
        }
        public async Task<bool> IsOrderConfirmationNeedsReprint(long transactionId)
        {
            var trans = await _appTransactionsHeaderRepository.GetAll().Where(z => z.Id == transactionId).FirstOrDefaultAsync();
            if (trans != null)
            {
                if (trans.TimeStamp > trans.OrderConfirmationTimeStamp)
                    return true;
                else
                    return false;
            }
            return true;
        }
        public async Task<bool> SyncTransaction(long transactionId)
        {
            var marketplaceTrans = await ShareTransactionOnMarketplace(transactionId);
            if (marketplaceTrans > 0)
            {
                var transaction = await _appTransactionsHeaderRepository.GetAll().Where(z => z.Id == transactionId).FirstOrDefaultAsync();
                if (transaction != null)
                {
                    var sharedWithUsers = await _appEntitySharingsRepository.GetAll().AsNoTracking().Where(z => z.EntityId == transaction.Id).ToListAsync();
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                    {
                        var sharedWithTenantsTrans = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().Where(z => z.SSIN == transaction.SSIN && z.TenantOwner != z.TenantId).ToListAsync();
                        if (sharedWithTenantsTrans != null && sharedWithTenantsTrans.Count > 0)
                        {
                            foreach (var transac in sharedWithTenantsTrans)
                            {
                                var tranCode = await ShareTransactionWithTenant(marketplaceTrans, int.Parse(transac.TenantId.ToString()),
                                    (transac.EntityObjectTypeCode == "SALESORDER" ? TransactionType.SalesOrder : TransactionType.PurchaseOrder));
                                var user = sharedWithUsers.Where(z => z.SharedTenantId == int.Parse(transac.TenantId.ToString())).FirstOrDefault();
                                if (user != null)
                                {
                                    await _messageAppService.CreateMessage(new CreateMessageInput
                                    {
                                        To = user.SharedUserId.ToString(),
                                        Body = (transac.EntityObjectTypeCode == "SALESORDER" ? "Sales Order#" : "Purchase Order#") + tranCode + " has been updated",
                                        //MessageCategory = MessageCategory.UPDATEMESSAGE.ToString(),
                                        MesasgeObjectType = MesasgeObjectType.Message,
                                        RelatedEntityId = marketplaceTrans != null ? marketplaceTrans : null,
                                        BodyFormat = (transac.EntityObjectTypeCode == "SALESORDER" ? "Sales Order#" : "Purchase Order#") + tranCode + " has been updated",
                                        SendDate = DateTime.Now.Date,
                                        ReceiveDate = DateTime.Now.Date,
                                        Subject = (transac.EntityObjectTypeCode == "SALESORDER" ? "Sales Order#" : "Purchase Order#") + tranCode + " has been updated",
                                        SenderId = AbpSession.UserId,
                                        Code = null
                                    });
                                }

                            }
                        }
                    }
                }
                return true;
            }
            else
                return false;
        }
        public async Task<PagedResultDto<GetAppMarketItemForViewDto>> GetAllSellerVariations(SellerVariationInputDto input)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                // List<SellerVariationOutputDto> returnList = new List<SellerVariationOutputDto>();
                long? tenantId = null;
                if (input.SellerSSIN != null)
                {
                    input.SellerSSIN = input.SellerSSIN.StartsWith("\"") ? input.SellerSSIN.Substring(1) : input.SellerSSIN;
                    input.SellerSSIN = input.SellerSSIN.EndsWith("\"") ? input.SellerSSIN.Substring(0, input.SellerSSIN.Length - 1) : input.SellerSSIN;
                    var account = await _appContactRepository.GetAll().AsNoTracking().Where(a => a.SSIN == input.SellerSSIN.TrimEnd() && a.IsProfileData == true &&
                    a.TenantId != null && a.PartnerId == null && a.ParentId == null).FirstOrDefaultAsync();
                    if (account != null) { tenantId = account.TenantId; }
                }
                long? userId = null;
                if (input.ContactSSIN != null && tenantId != null)
                {
                    input.ContactSSIN = input.ContactSSIN.StartsWith("\"") ? input.ContactSSIN.Substring(1) : input.ContactSSIN;
                    input.ContactSSIN = input.ContactSSIN.EndsWith("\"") ? input.ContactSSIN.Substring(0, input.ContactSSIN.Length - 1) : input.ContactSSIN;
                    var accountContact = await _appContactRepository.GetAll().AsNoTracking().Include(x => x.EntityFk).ThenInclude(s => s.EntityExtraData).
                        Where(a => a.SSIN == input.ContactSSIN.TrimEnd() && a.IsProfileData == false &&
                   a.TenantId == tenantId).FirstOrDefaultAsync();
                    if (accountContact != null)
                    {
                        var userObj = accountContact.EntityFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 715);
                        if (userObj != null)
                            userId = long.Parse(userObj.AttributeValue.ToString());

                    }
                }
                decimal exchangeRate = 1;
                if (input.CurrencyCode != null)
                    exchangeRate = _helper.SystemTables.GetExchangeRate("USD", input.CurrencyCode);

                if (input.CurrencyCode == "USD")
                    exchangeRate = 1;

                //MMT12-20
                if (!string.IsNullOrWhiteSpace(input.Filter))
                    input.Filter = input.Filter.TrimEnd().TrimStart();
                input.Sorting = input.Sorting ?? "id";
                var filteredAppItems = _appMarketplaceItem.GetAll().AsNoTracking().Include(a => a.ItemPricesFkList.Where(a => a.Code == "MSRP" &&
                           (a.CurrencyCode == input.CurrencyCode || a.CurrencyCode == "USD" || a.IsDefault == true)))
                        .Select(x => new
                        {
                            x.TenantOwner,
                            x.TenantId,
                            x.Code,
                            x.Price,
                            x.Name,
                            x.Id,
                            x.Notes,
                            x.Description,
                            x.ParentId,
                            x.EntityExtraData,
                            x.EntityAttachments,
                            x.ItemPricesFkList,
                            x.ManufacturerCode,
                            x.SharingLevel,
                            x.ItemSharingFkList,
                            defaultMsrp = x.ItemPricesFkList.FirstOrDefault(a => a.Code == "MSRP" && a.IsDefault == true)
                        })
                    .WhereIf(!string.IsNullOrEmpty(tenantId.ToString()), x => x.TenantOwner == tenantId)
                    .WhereIf(!string.IsNullOrWhiteSpace(input.Filter),
                    e => e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter) || e.ManufacturerCode.Contains(input.Filter) || e.Description.Contains(input.Filter) ||
                    e.EntityExtraData.Where(a => a.AttributeValue.Contains(input.Filter)).Count() > 0)
                    .Where(x => x.ParentId != null &&
                    (x.SharingLevel == 1 || (x.SharingLevel == 2 && x.ItemSharingFkList.Count(c => c.SharedUserId == AbpSession.UserId) > 0)) ||
                    (userId != null && x.ItemSharingFkList.Count(c => c.SharedUserId == userId) > 0) || (input.SellerSSIN == null ? x.TenantOwner == AbpSession.TenantId : false));

                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                input.Sorting = "AppItem." + input.Sorting;
                var filteredOrderedAppItems = filteredAppItems;//.OrderBy(input.Sorting ?? "id asc")
                                                               //.PageBy(input);
                var appItems = from o in filteredOrderedAppItems
                               join s in _sycCurrencyExchangeRateRepository.GetAll()
                               on o.defaultMsrp.CurrencyCode equals s.CurrencyCode into j
                               join c in _appContactRepository.GetAll().Where(a => a.TenantId != null && a.ParentId == null
                               && a.PartnerId == null && a.IsProfileData == true && a.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId)
                               on o.TenantOwner equals c.TenantId
                               from u in j.DefaultIfEmpty()
                               select new GetAppMarketItemForViewDto()
                               {
                                   AppItem = new AppItemDto
                                   {
                                       ManufacturerCode = o.ManufacturerCode,
                                       SellerName = c.Name,
                                       SSIN = o.Code,
                                       Code = o.Code,
                                       Name = o.Name,
                                       Description = o.Notes,
                                       Price = (decimal)(input.CurrencyCode == null && o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() != null ? o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").Select(a => a.Price).FirstOrDefault() :
                                               (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == input.CurrencyCode).FirstOrDefault() != null ?
                                               o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == input.CurrencyCode).Select(a => a.Price).FirstOrDefault() :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() == null ? //0 :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.IsDefault == true && q.CurrencyCode != input.CurrencyCode).FirstOrDefault() != null ?
                                              ((o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.IsDefault && q.CurrencyCode != input.CurrencyCode).FirstOrDefault().Price) * (1 / u.ExchangeRate) * exchangeRate) : 0) :
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").FirstOrDefault() != null ?
                                              (o.ItemPricesFkList.Where(q => q.Code == "MSRP" && q.CurrencyCode == "USD").Select(a => a.Price).FirstOrDefault() * exchangeRate) : 0)))),
                                       Id = o.Id,
                                       ImageUrl = (o.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                        (o.EntityAttachments.FirstOrDefault() == null ? "attachments/" + o.TenantId + "/" + o.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                        : "attachments/" + (o.TenantId.HasValue ? o.TenantId : -1) + "/" + o.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment) // "attachments/3/6a567354-819d-ddf9-7ebb-76da114e7547.jpg"
                                   },
                                   Selected = false
                               };
                var orderedItemsFilter = appItems.Where(x => x.AppItem.Price != null).OrderBy(input.Sorting ?? "AppItem.id asc");
                var orderedItems = orderedItemsFilter.PageBy(input);

                //var appItemsList = await appItems.ToListAs ync();
                var appItemsList = await orderedItems.ToListAsync();

                var totalCount = await orderedItemsFilter.CountAsync();

                return new PagedResultDto<GetAppMarketItemForViewDto>(
                    totalCount,
                    appItemsList
                );
            }
        }
        public async Task<bool> AddVariationToTransaction(AddVariationToInputDto input)
        {
            long? tranTypeId = null;
            if (input.TransactionType == TransactionType.SalesOrder)
            {
                tranTypeId = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
            }
            else
            {
                tranTypeId = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
            }
            if (input.TransactionId != null && input.VariationSSIN != null)
            {
                var header = await _appTransactionsHeaderRepository.GetAll()
                    .FirstOrDefaultAsync(a => a.Id == input.TransactionId && a.TenantId == AbpSession.TenantId && a.EntityObjectTypeId == tranTypeId);
                if (header == null)
                    return false;

                var lastLine = 0;
                try
                {
                    lastLine = await _appTransactionDetails.GetAll().AsNoTracking().Where(s => s.TransactionId == header.Id).DefaultIfEmpty().Select(a => a.LineNo).DefaultIfEmpty().MaxAsync();
                }
                catch { lastLine = 0; }

                var marketplaceVariation = await _appMarketplaceItem.GetAll().AsNoTracking().Include(x => x.EntityCategories)
                                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk).Include(a => a.EntityClassifications)
                                        .Include(a => a.EntityExtraData).Where(z => z.SSIN == input.VariationSSIN).FirstOrDefaultAsync();
                if (marketplaceVariation != null)
                {
                    var marketplaceVariationParent = await _appMarketplaceItem.GetAll().AsNoTracking().Include(x => x.EntityCategories)
                                        .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk).Include(a => a.EntityClassifications)
                                        .Include(a => a.EntityExtraData).Where(z => z.Id == marketplaceVariation.ParentId).FirstOrDefaultAsync();
                    if (marketplaceVariationParent != null)
                    {
                        long parentItemId = 0;
                        var detParent = await _appTransactionDetails.GetAll().Include(z => z.ParentFkList).Where(z => z.TransactionId == input.TransactionId &&
                        z.TransactionIdFk.EntityObjectTypeId == header.EntityObjectTypeId &&
                        z.ItemSSIN == marketplaceVariationParent.SSIN).FirstOrDefaultAsync();
                        if (detParent == null)
                        {
                            detParent = new AppTransactionDetails();
                            detParent = ObjectMapper.Map<AppTransactionDetails>(marketplaceVariationParent);
                            detParent.Amount = decimal.Parse((input.Price * input.Qty).ToString());
                            detParent.Quantity = double.Parse(input.Qty.ToString());
                            detParent.NetPrice = decimal.Parse(input.Price.ToString());
                            detParent.GrossPrice = decimal.Parse(input.Price.ToString());
                            detParent.Discount = 0;
                            detParent.NoOfPrePacks = 0;
                            detParent.SSIN = marketplaceVariationParent.SSIN;
                            detParent.ItemSSIN = marketplaceVariationParent.SSIN;
                            detParent.ItemDescription = marketplaceVariationParent.Description;
                            detParent.Name = marketplaceVariationParent.Name;
                            detParent.Id = 0;
                            detParent.TransactionId = header.Id;
                            lastLine++;
                            detParent.LineNo = lastLine;
                            detParent.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                            detParent.TenantId = int.Parse(AbpSession.TenantId.ToString());
                            detParent.TransactionCode = header.Code;
                            detParent.EntityObjectTypeId = header.EntityObjectTypeId;
                            detParent.EntityObjectTypeCode = header.EntityObjectTypeCode;
                            detParent.Note = "";
                            detParent.ItemCode = marketplaceVariationParent.Code;
                            detParent.Code = header.TenantId.ToString().TrimEnd() + "-" + header.Code.TrimEnd() + "-" + detParent.LineNo.ToString() + "-" + marketplaceVariationParent.Code.TrimEnd();
                            detParent.Notes = string.IsNullOrEmpty(marketplaceVariationParent.Notes) ? "" : marketplaceVariationParent.Notes;
                            detParent.ParentId = null;
                            if (detParent.EntityExtraData != null)
                            {
                                detParent.EntityExtraData.ForEach(d => d.Id = 0);
                                detParent.EntityExtraData.ForEach(d => d.EntityFk = null);
                                detParent.EntityExtraData.ForEach(d => d.EntityCode = detParent.Code);
                                detParent.EntityExtraData.ForEach(d => d.EntityId = 0);
                            }
                            if (detParent.EntityAttachments != null)
                            {
                                detParent.EntityAttachments.ForEach(d => d.Id = 0);
                                detParent.EntityAttachments.ForEach(d => d.EntityId = 0);
                                detParent.EntityAttachments.ForEach(d => d.EntityCode = detParent.Code);
                                detParent.EntityAttachments.ForEach(d => d.EntityFk = null);
                            }
                            if (detParent.EntityCategories != null)
                            {
                                detParent.EntityCategories.ForEach(d => d.Id = 0);
                                detParent.EntityCategories.ForEach(d => d.EntityFk = null);
                                detParent.EntityCategories.ForEach(d => d.EntityCode = detParent.Code);
                                detParent.EntityCategories.ForEach(d => d.EntityId = 0);
                            }
                            if (detParent.EntityClassifications != null)
                            {
                                detParent.EntityClassifications.ForEach(d => d.EntityId = 0);
                                detParent.EntityClassifications.ForEach(d => d.EntityFk = null);
                                detParent.EntityClassifications.ForEach(d => d.EntityCode = detParent.Code);
                                detParent.EntityClassifications.ForEach(d => d.Id = 0);
                            }
                            if (detParent.EntityAttachments != null)
                            {
                                detParent.EntityAttachments.RemoveAll(z => z.IsDefault == false);
                                foreach (var parentAttach in detParent.EntityAttachments)
                                {
                                    parentAttach.Id = 0;

                                    parentAttach.EntityId = 0;
                                    parentAttach.EntityFk = null;
                                    parentAttach.AttachmentFk.TenantId = AbpSession.TenantId;
                                    //I40
                                    if (marketplaceVariationParent.TenantOwner == AbpSession.TenantId)
                                    {
                                        string fileName = System.Guid.NewGuid().ToString() + "." + parentAttach.AttachmentFk.Attachment.Split('.')[1];
                                        MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId, fileName);
                                        parentAttach.AttachmentFk.Attachment = fileName;
                                    }
                                    else
                                    {
                                        //I40
                                        MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId, null);
                                    }
                                    parentAttach.AttachmentId = 0;
                                    parentAttach.AttachmentFk.Id = 0;
                                }
                            }
                            detParent = await _appTransactionDetails.InsertAsync(detParent);
                            await CurrentUnitOfWork.SaveChangesAsync();
                            if (detParent == null)
                            {
                                return false;
                            }
                            else
                            {
                                parentItemId = detParent.Id;
                                detParent.ParentFkList = new List<AppTransactionDetails>();
                            }


                        }
                        else
                        {

                            detParent.Quantity += input.Qty;
                            detParent.Amount += decimal.Parse((input.Qty * input.Price).ToString());
                            detParent.NetPrice = (detParent.Amount / decimal.Parse(detParent.Quantity.ToString()));
                            detParent.GrossPrice = detParent.NetPrice;
                            parentItemId = detParent.Id;

                        }
                        AppTransactionDetails det = new AppTransactionDetails();
                        det = ObjectMapper.Map<AppTransactionDetails>(marketplaceVariation);
                        det.Quantity = input.Qty;
                        det.NetPrice = input.Price; //input.AppItem.MaxSpecialPrice != 0 ? input.AppItem.MaxSpecialPrice : input.AppItem.MaxMSRP;
                        det.GrossPrice = input.Price; //input.AppItem.MaxSpecialPrice != 0 ? input.AppItem.MaxSpecialPrice : input.AppItem.MaxMSRP;
                        det.Discount = 0;
                        det.Amount = decimal.Parse((decimal.Parse(det.Quantity.ToString()) * det.NetPrice).ToString());
                        det.Id = 0;
                        det.TransactionId = header.Id;
                        lastLine++;
                        det.LineNo = lastLine;
                        det.NoOfPrePacks = 0;
                        det.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                        det.TenantId = int.Parse(AbpSession.TenantId.ToString());
                        det.TransactionCode = header.Code;
                        det.ItemCode = marketplaceVariation.Code;
                        det.ItemDescription = marketplaceVariation.Description;
                        det.ItemSSIN = marketplaceVariation.SSIN;
                        det.EntityObjectTypeId = header.EntityObjectTypeId;
                        det.EntityObjectTypeCode = header.EntityObjectTypeCode;
                        det.Note = "";
                        det.Code = header.TenantId.ToString().TrimEnd() + "-" + header.Code.TrimEnd() + "-" + det.LineNo.ToString() + "-" + det.Code.TrimEnd();
                        det.Notes = string.IsNullOrEmpty(marketplaceVariation.Notes) ? "" : marketplaceVariation.Notes;
                        if (det.EntityExtraData != null)
                        {
                            det.EntityExtraData.ForEach(d => d.EntityCode = marketplaceVariation.Code);
                            det.EntityExtraData.ForEach(d => d.Id = 0);
                            det.EntityExtraData.ForEach(d => d.EntityFk = null);
                            det.EntityExtraData.ForEach(d => d.EntityCode = det.Code);
                            det.EntityExtraData.ForEach(d => d.EntityId = 0);
                        }
                        if (det.EntityAttachments != null)
                        {
                            det.EntityAttachments.ForEach(d => d.Id = 0);
                            det.EntityAttachments.ForEach(d => d.EntityId = 0);
                            det.EntityAttachments.ForEach(d => d.EntityCode = det.Code);
                            det.EntityAttachments.ForEach(d => d.EntityFk = null);
                        }
                        if (det.EntityCategories != null)
                        {
                            det.EntityCategories.ForEach(d => d.Id = 0);
                            det.EntityCategories.ForEach(d => d.EntityFk = null);
                            det.EntityCategories.ForEach(d => d.EntityCode = marketplaceVariation.Code);
                            det.EntityCategories.ForEach(d => d.EntityId = 0);
                        }
                        if (det.EntityClassifications != null)
                        {
                            det.EntityClassifications.ForEach(d => d.EntityId = 0);
                            det.EntityClassifications.ForEach(d => d.EntityFk = null);
                            det.EntityClassifications.ForEach(d => d.EntityCode = marketplaceVariation.Code);
                            det.EntityClassifications.ForEach(d => d.Id = 0);
                        }
                        if (det.EntityAttachments != null)
                        {
                            det.EntityAttachments.RemoveAll(z => z.IsDefault == false);
                            foreach (var parentAttach in det.EntityAttachments)
                            {
                                parentAttach.Id = 0;

                                parentAttach.EntityId = 0;
                                parentAttach.EntityFk = null;
                                parentAttach.AttachmentFk.TenantId = AbpSession.TenantId;
                                //I40
                                if (marketplaceVariationParent.TenantOwner == AbpSession.TenantId)
                                {
                                    string fileName = System.Guid.NewGuid().ToString() + "." + parentAttach.AttachmentFk.Attachment.Split('.')[1];
                                    MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId, fileName);
                                    parentAttach.AttachmentFk.Attachment = fileName;
                                }
                                else
                                {
                                    //I40
                                    MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId, null);
                                }
                                parentAttach.AttachmentId = 0;
                                parentAttach.AttachmentFk.Id = 0;
                            }
                        }
                        det.Id = 0;
                        det.ParentId = parentItemId;
                        detParent.ParentFkList.Add(det);
                        await _appTransactionDetails.UpdateAsync(detParent);
                        header.TimeStamp = DateTime.UtcNow;
                        header.TotalQuantity += long.Parse(input.Qty.ToString());
                        header.TotalAmount += double.Parse((input.Qty * input.Price).ToString());
                        await _appTransactionsHeaderRepository.UpdateAsync(header);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //Add Variation Line
                        //det = await _appTransactionDetailsRepository.InsertAsync(det);

                    }

                }
            }
            return true;
        }
        public async Task<List<AccountDefaultAddressDto>> GetCompanyDefaultAddresses(string companySSIN, string? branchSSIN)
        {
            List<AccountDefaultAddressDto> returnList = new List<AccountDefaultAddressDto>();
            if (string.IsNullOrEmpty(branchSSIN))
            {
                var account = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk)
                    .Where(z => z.SSIN == companySSIN)
                    .FirstOrDefaultAsync();

                if (account != null)
                {
                    if (account.AppContactAddresses != null && account.AppContactAddresses.Count > 0)
                    {
                        var shipAdd = account.AppContactAddresses.Where(z => z.AddressTypeFk != null && z.AddressTypeFk.Code == "DIRECT-SHIPPING" || z.AddressTypeFk.Code == "DISTRIBUTION-CENTER").FirstOrDefault();
                        if (shipAdd != null)
                        {
                            returnList.Add(new AccountDefaultAddressDto { AddressId = shipAdd.AddressId, AddressType = "Shipping" });
                        }
                        var billAdd = account.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk != null && x.AddressTypeFk.Code == "BILLING");
                        if (billAdd != null)
                        {
                            returnList.Add(new AccountDefaultAddressDto { AddressId = billAdd.AddressId, AddressType = "Billing" });
                        }
                    }
                }
            }
            else
            {
                var branch = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressTypeFk)
                .Where(z => z.SSIN == branchSSIN && z.ParentId != null)
                .FirstOrDefaultAsync();

                if (branch != null)
                {
                    if (branch.AppContactAddresses != null && branch.AppContactAddresses.Count > 0)
                    {
                        var shipAdd = branch.AppContactAddresses.Where(z => z.AddressTypeFk != null && z.AddressTypeFk.Code == "DIRECT-SHIPPING" || z.AddressTypeFk.Code == "DISTRIBUTION-CENTER").FirstOrDefault();
                        if (shipAdd != null)
                        {
                            returnList.Add(new AccountDefaultAddressDto { AddressId = shipAdd.AddressId, AddressType = "Shipping" });
                        }
                        var billAdd = branch.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk != null && x.AddressTypeFk.Code == "BILLING");
                        if (billAdd != null)
                        {
                            returnList.Add(new AccountDefaultAddressDto { AddressId = billAdd.AddressId, AddressType = "Billing" });
                        }
                    }
                }
            }

            return returnList;
        }
        private async Task<bool> ShareManualAccount(string accountSSIN, long tenantId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var accountShared = await _appContactRepository.GetAll().Where(z => z.SSIN == accountSSIN && z.TenantId == tenantId).FirstOrDefaultAsync();
                if (accountShared == null)
                {
                    var accountOrg = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                        //.Include(z=>z.ParentFkList).ThenInclude(z=>z.AppContactAddresses).ThenInclude(z=>z.AddressFk)
                        .Where(z => z.SSIN == accountSSIN && z.TenantId == AbpSession.TenantId).FirstOrDefaultAsync();

                    if (accountOrg != null && accountOrg.PartnerId == null)
                    {
                        CreateOrEditAccountInfoDto accountInput = ObjectMapper.Map<CreateOrEditAccountInfoDto>(accountOrg);
                        if (accountInput.ContactAddresses != null && accountInput.ContactAddresses.Count > 0)
                        {
                            foreach (var conAd in accountInput.ContactAddresses)
                            {
                                conAd.Id = 0;
                            }
                        }
                        accountInput.TenantId = int.Parse(tenantId.ToString());
                        accountInput.ReturnId = true;
                        accountInput.Id = 0;
                        accountInput.UseDTOTenant = true;
                        var tenantObj = await TenantManager.GetByIdAsync(int.Parse(tenantId.ToString()));
                        if (tenantObj != null)
                        {
                            string sequance = await _sycIdentifierDefinitionsAppService.GetNextEntityCode("BUSINESS", tenantId);
                            accountInput.Code = "M" + sequance;//tenantObj.TenancyName.Trim() 
                        }
                        if (accountOrg.PartnerId == null)
                        {
                            var partnerEntityObjectTypeId = accountInput.AccountTypeId;
                            var partnerEntityObjectTypeCode = accountInput.AccountType;
                            //if (partnerEntityObjectTypeId == null || accountInput.AccountTypeId < 1)
                            {
                                var partnerEntityObjectType = await _helper.SystemTables.GetEntityObjectTypeParetner();
                                partnerEntityObjectTypeId = partnerEntityObjectType.Id;
                                partnerEntityObjectTypeCode = partnerEntityObjectType.Code;
                            }
                            var contactObjectId = await _helper.SystemTables.GetObjectContactId();
                            AppEntityDto accountInfoEntity = new AppEntityDto();
                            accountInfoEntity.TenantId = int.Parse(tenantId.ToString());
                            accountInfoEntity.ObjectId = contactObjectId;
                            accountInfoEntity.EntityObjectTypeId = partnerEntityObjectTypeId;
                            accountInfoEntity.EntityObjectTypeCode = partnerEntityObjectTypeCode; ;
                            var profileSSIN = await _helper.SystemTables.GenerateSSIN(contactObjectId, accountInfoEntity);
                            accountInput.SSIN = profileSSIN + "-" + accountInput.Code;
                        }
                        accountInput.UseDTOTenant = true;
                        accountInput.EntityId = 0;
                        accountInput.AccountLevel = AccountLevelEnum.Manual;
                        var account = await _accountAppService.CreateOrEditAccount(accountInput);
                        if (account != null)
                        {

                            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();

                            var accountBranchChildren1 = await _appContactRepository.GetAll()
                                .Where(z => z.AccountId == accountOrg.Id && z.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId
                             && z.TenantId == AbpSession.TenantId).ToListAsync();
                            if (accountBranchChildren1 != null && accountBranchChildren1.Count > 0)
                            {
                                foreach (var accountObj in accountBranchChildren1)
                                {
                                    BranchDto contactDto = ObjectMapper.Map<BranchDto>(accountObj);
                                    contactDto.AccountId = long.Parse(account.AccountInfo.Id.ToString());
                                    contactDto.TenantId = int.Parse(tenantId.ToString());
                                    contactDto.Id = 0;
                                    contactDto.UseDTOTenant = true;
                                    if (tenantObj != null)
                                    {
                                        string sequance = await _sycIdentifierDefinitionsAppService.GetNextEntityCode("BRANCH", tenantId);
                                        contactDto.Code = "B" + sequance;//tenantObj.TenancyName.Trim()
                                    }
                                    if (accountOrg.PartnerId == null)
                                    {
                                        contactDto.SSIN = "";
                                    }

                                    BranchDto savedContactDto = await _accountAppService.CreateOrEditBranch(contactDto);
                                }
                            }

                            var accountChildren = await _appContactRepository.GetAll().Include(a => a.EntityFk)
                                .ThenInclude(z => z.EntityAttachments).ThenInclude(a => a.AttachmentFk)
                                .Where(z => z.AccountId == accountOrg.Id && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId
                            && z.TenantId == AbpSession.TenantId).ToListAsync();
                            if (accountChildren != null && accountChildren.Count > 0)
                            {
                                foreach (var accountObj in accountChildren)
                                {
                                    ContactDto contactDto = ObjectMapper.Map<ContactDto>(accountObj);
                                    contactDto.AccountId = long.Parse(account.AccountInfo.Id.ToString());
                                    contactDto.TenantId = int.Parse(tenantId.ToString());
                                    contactDto.ParentId = accountObj.Id;
                                    contactDto.Id = 0;
                                    contactDto.UseDTOTenant = true;
                                    if (contactDto.EntityAttachments != null)
                                    {
                                        foreach (var attach in contactDto.EntityAttachments)
                                        {
                                            attach.Id = 0;

                                        }
                                    }
                                    if (tenantObj != null)
                                    {
                                        string sequance = await _sycIdentifierDefinitionsAppService.GetNextEntityCode("PERSONAL", tenantId);
                                        contactDto.Code = "C" + sequance; //tenantObj.TenancyName.Trim()
                                    }
                                    if (accountOrg.PartnerId == null)
                                    {
                                        contactDto.SSIN = "";
                                    }
                                    contactDto.FirstName = accountObj.Name;
                                    ContactDto savedContactDto = await _accountAppService.CreateOrEditContact(contactDto);


                                }
                            }
                            //
                            var OrgAddress = await _appAddressRepository.GetAll().Where(z => z.AccountId == accountOrg.Id).ToListAsync();
                            if (OrgAddress != null && OrgAddress.Count > 0)
                            {
                                foreach (var conAdd in OrgAddress)
                                {
                                    AppAddressDto address = ObjectMapper.Map<AppAddressDto>(conAdd);
                                    address.AccountId = long.Parse(account.AccountInfo.Id.ToString());
                                    address.TenantId = int.Parse(tenantId.ToString());
                                    address.UseDTOTenant = true;
                                    address.Id = 0;
                                    AppAddressDto addReturn = await _accountAppService.CreateOrEditAddress(address);
                                }
                            }
                            var contactOrgRecords = await _appContactRepository.GetAll()
                                .Where(z => (z.AccountId == accountOrg.Id) && z.TenantId == AbpSession.TenantId).ToListAsync();
                            var contactRecords = await _appContactRepository.GetAll()
                                .Where(z => (z.AccountId == account.AccountInfo.Id) && z.TenantId == tenantId).ToListAsync();
                            if (contactOrgRecords != null && contactOrgRecords.Count > 0 && contactRecords != null && contactRecords.Count > 0)
                            {
                                foreach (var con in contactRecords)
                                {
                                    var orgCon = contactOrgRecords.Where(z => z.Id == con.ParentId).FirstOrDefault();
                                    if (orgCon != null)
                                    {
                                        var newCon = contactRecords.Where(z => z.SSIN == orgCon.SSIN).FirstOrDefault();
                                        if (newCon != null)
                                        {
                                            con.ParentId = newCon.Id;
                                            await _appContactRepository.UpdateAsync(con);
                                        }

                                        var conAddApp = await _appContactAddressRepository.GetAll()
                                            .Include(z => z.AddressFk).Where(z => z.ContactId == orgCon.Id).ToListAsync();
                                        if (conAddApp != null && conAddApp.Count > 0)
                                        {
                                            foreach (var conAdAp in conAddApp)
                                            {
                                                var newAdd = await _appAddressRepository.GetAll().Where(z => z.Code == conAdAp.AddressFk.Code &&
                                                z.TenantId == tenantId).FirstOrDefaultAsync();
                                                if (newAdd != null)
                                                {
                                                    AppContactAddress newAppCon = new AppContactAddress();
                                                    newAppCon.ContactId = con.Id;
                                                    newAppCon.AddressId = newAdd.Id;
                                                    newAppCon.AddressTypeId = conAdAp.AddressTypeId;
                                                    newAppCon.AddressCode = newAdd.Code;
                                                    newAppCon.AddressTypeCode = conAdAp.AddressTypeCode;
                                                    newAppCon.ContactCode = conAdAp.ContactCode;
                                                    newAppCon.Id = 0;
                                                    await _appContactAddressRepository.InsertAsync(newAppCon);
                                                }
                                            }
                                        }
                                    }
                                }
                                //Main account addresses
                                var mainAddApp = await _appContactAddressRepository.GetAll()
                                        .Include(z => z.AddressFk).Where(z => z.ContactId == accountOrg.Id).ToListAsync();
                                if (mainAddApp != null && mainAddApp.Count > 0)
                                {
                                    foreach (var conAdAp in mainAddApp)
                                    {
                                        var newAdd = await _appAddressRepository.GetAll().Where(z => z.Code == conAdAp.AddressFk.Code &&
                                        z.TenantId == tenantId).FirstOrDefaultAsync();
                                        if (newAdd != null)
                                        {
                                            AppContactAddress newAppCon = new AppContactAddress();
                                            newAppCon.ContactId = long.Parse(account.AccountInfo.Id.ToString());
                                            newAppCon.AddressId = newAdd.Id;
                                            newAppCon.AddressTypeId = conAdAp.AddressTypeId;
                                            newAppCon.AddressCode = newAdd.Code;
                                            newAppCon.AddressTypeCode = conAdAp.AddressTypeCode;
                                            newAppCon.ContactCode = conAdAp.ContactCode;
                                            newAppCon.Id = 0;
                                            await _appContactAddressRepository.InsertAsync(newAppCon);
                                        }
                                    }
                                }
                                //End
                                await CurrentUnitOfWork.SaveChangesAsync();
                            }


                            //
                        }

                    }
                    //share
                    var accountOrgin = await _appMarketplaceContactRepository.GetAll().Include(z => z.ContactAddresses).ThenInclude(z => z.AddressFk)
                        //.Include(z=>z.ParentFkList).ThenInclude(z=>z.AppContactAddresses).ThenInclude(z=>z.AddressFk)
                        .Where(z => z.SSIN == accountSSIN && z.TenantId == null && z.SharingLevel == 1).FirstOrDefaultAsync();
                    //share
                    if (accountOrg != null)// && accountOrg.PartnerId != null)
                    {
                        // long? otherTenantId = null;
                        //accountOrg.EntityFk.TenantOwner 
                        //var publishedAcc = await _appContactRepository.GetAll().Where(z => z.Id == accountOrg.PartnerId && z.TenantId == null)
                        //    .FirstOrDefaultAsync();
                        // if(publishedAcc!=null)
                        {
                            await _accountAppService.ConnectContactsProfiles(accountOrgin.Id, int.Parse(tenantId.ToString()));
                            /* var otherAccount = await _appContactRepository.GetAll().Where(z => z.Id == publishedAcc.PartnerId && z.TenantId != null)
                             .FirstOrDefaultAsync();
                             if (otherAccount!=null)
                             {
                                 otherTenantId = long.Parse(otherAccount.TenantId.ToString());
                             }*/
                        }
                        //string? otherTenantSSN = null;
                        //var tenantOrg = await _appContactRepository.GetAll().Where(z => z.TenantId == tenantId && z.IsProfileData == true
                        //&& z.ParentId == null).FirstOrDefaultAsync();
                        //if (tenantOrg!=null)
                        //{
                        //    otherTenantSSN = tenantOrg.SSIN;
                        //}
                        //if (!string.IsNullOrEmpty(otherTenantSSN) && otherTenantId!=null)
                        //await ShareManualAccount(otherTenantSSN, long.Parse(otherTenantId.ToString()));

                    }
                }



            }
            return true;
        }
        //Iteration45[End]

        //I46[Start]
        public async Task<bool> IsCodeAlreadyExists(string code)
        {
            var codeExist = await _appContactRepository.GetAll().FirstOrDefaultAsync(z => z.Code == code && z.TenantId == AbpSession.TenantId);
            if (codeExist != null)
                return true;
            else
                return false;
        }
        public async Task<PagedResultDto<ExtraDataAttrDto>> GetAppTransactionExtraDataWithPaging(long transactionId, long entityObjectTypeId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                GetAllEntityObjectTypeOutput entityObjectExtraAttribute = null;
                var entityObjectExtraAttributeReturn = await _SycEntityObjectTypesAppService.GetAllWithExtraAttributes(entityObjectTypeId);
                if (entityObjectExtraAttributeReturn != null)
                {
                    entityObjectExtraAttribute = entityObjectExtraAttributeReturn.FirstOrDefault();
                }



                if (transactionId != 0 && entityObjectExtraAttribute != null && entityObjectExtraAttribute.ExtraAttributes != null && entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes != null)
                {
                    var extraAttributedefintion = entityObjectExtraAttribute.ExtraAttributes.ExtraAttributes;
                    // *Abdo End
                    //get all extra data type, AttributeId
                    //var attributesIds = extraAttributedefintion.Where(r => r.Usage.ToUpper().Trim() == recommandedOrAdditional.ToString().ToUpper()).Select(r => r.AttributeId).ToList();
                    var attributesIds = extraAttributedefintion.OrderBy(r => r.Usage.ToUpper().Trim()).Select(r => r.AttributeId).ToList();
                    var usedExtraDataPagedPerAttribute = _appEntitiesAppService.GetAppEntityAttrDistinctWithPaging(new GetAppEntityAttributesWithAttributeIdsInput { MaxResultCount = 10000, SkipCount = 0, Sorting = null, AttributeIds = attributesIds, EntityId = transactionId }).Result.Items.ToList();

                    List<ExtraDataAttrDto> returnedList = new List<ExtraDataAttrDto>();

                    foreach (var EntityExtraData in extraAttributedefintion)
                    {
                        if (usedExtraDataPagedPerAttribute.Contains(EntityExtraData.AttributeId))
                        {
                            var extraDataAttrDtoPagedlocal = _appEntitiesAppService.GetAppEntityExtraWithPaging(new GetAppEntityAttributesWithAttributeIdsInput { MaxResultCount = 10000, SkipCount = 0, AttributeIds = new List<long>() { EntityExtraData.AttributeId }, EntityId = transactionId }).Result.Items.ToList();
                            var extraDataSelectedValues = extraDataAttrDtoPagedlocal.Select(r => new ExtraDataSelectedValues { value = (r.AttributeValueFkName != null ? r.AttributeValueFkName : r.AttributeValue) });

                            if (extraDataSelectedValues.ToList().Count > 0)
                            {
                                var extraDataAttrDto = new ExtraDataAttrDto();
                                extraDataAttrDto.extraAttrUsage = EntityExtraData.Usage;
                                extraDataAttrDto.extraAttrName = EntityExtraData.Name;
                                extraDataAttrDto.extraAttrDataType = EntityExtraData.DataType; // Abdo added this 
                                extraDataAttrDto.selectedValues = extraDataSelectedValues.ToList();
                                extraDataAttrDto.extraAttributeId = EntityExtraData.AttributeId;
                                //if (!string.IsNullOrEmpty(EntityExtraData.Usage)) //&& EntityExtraData.Usage.ToUpper().Trim() == recommandedOrAdditional.ToString().ToUpper())
                                { returnedList.Add(extraDataAttrDto); }
                            }
                        }

                    }
                    return new PagedResultDto<ExtraDataAttrDto>(usedExtraDataPagedPerAttribute.Count, returnedList);
                }
                return new PagedResultDto<ExtraDataAttrDto>(0, new List<ExtraDataAttrDto>());
            }
        }
        //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[Start]
        protected void UpdateAppEntityLog(long filteredAppTransactionsId)
        {
            var entityOpenObjectStatusId = _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
            var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(e => e.AppTransactionDetails)
                .Where(e => e.TenantId == AbpSession.TenantId
                && e.CreatorUserId == AbpSession.UserId
                && (e.EntityObjectStatusId == long.Parse(entityOpenObjectStatusId.Result.ToString()))
                && e.Id == filteredAppTransactionsId).FirstOrDefault();
            if (filteredAppTransactions != null)
            {

                if (filteredAppTransactions.EntityObjectStatusId != long.Parse(entityOpenObjectStatusId.Result.ToString()))
                {
                    return;
                }

                var statusCodeNotSent = _helper.SystemTables.GetEntityObjectStatusReadyToSendEntityLog();
                var logExist = _appEntityLogRepository.GetAll().Where(z => z.EntityId == filteredAppTransactions.Id &&
                z.TenantId == AbpSession.TenantId && z.EntityObjectTypeId == filteredAppTransactions.EntityObjectTypeId &&
                z.EntityObjectStatusId == long.Parse(statusCodeNotSent.Result.ToString())
                ).FirstOrDefault();
                if (logExist == null)
                {
                    logExist = new AppEntityLog();
                    logExist.EntityObjectStatusId = long.Parse(statusCodeNotSent.Result.ToString());
                    logExist.EntityObjectStatusCode = "Ready to be Sent";
                    logExist.EntityId = filteredAppTransactions.Id;
                    logExist.EntityCode = filteredAppTransactions.Code;
                    logExist.EntityObjectTypeId = filteredAppTransactions.EntityObjectTypeId;
                    logExist.EntityObjectTypeCode = filteredAppTransactions.EntityObjectTypeCode;
                    logExist.PartnerCode = "ARIAERP";
                    logExist.TenantId = int.Parse(AbpSession.TenantId.ToString());
                    logExist.ObjectId = filteredAppTransactions.ObjectId;
                    logExist.ObjectCode = "TRANSACTION";
                    _appEntityLogRepository.Insert(logExist);
                    CurrentUnitOfWork.SaveChanges();
                }
            }
        }
        public async Task AddTransactionCharges(long pTransactionID)
        {
            Int32 lineNo = 10000;
            // Delete all AppTransactionDetails where TransactionId = pTransactionID and Code = "CHARGES"
            //var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
            var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
            var entityObjectChargesId = await _helper.SystemTables.GetEntityObjectCharges();

            var entityObjectId = await _helper.SystemTables.GetObjectItemId();

            await _appTransactionDetails.DeleteAsync(x => x.TransactionId == pTransactionID && x.EntityObjectTypeId == entityObjectChargesId);

            // Get all entities from AppEntity repository
            var transactionChargeEntities = await _appEntity
                .GetAll()
                .Include(e => e.EntityExtraData)
                .Where(e => e.ObjectCode == "LOOKUP" && e.EntityObjectTypeCode == "TRANSACTIONCHARGES")
                .ToListAsync();

            var buyerContact = await _appTransactionContactsRepository.GetAll().Where(e => e.ContactRole == "Buyer" && e.TransactionId == pTransactionID).FirstOrDefaultAsync();
            var sellerContact = await _appTransactionContactsRepository.GetAll().Where(e => e.ContactRole == "Seller" && e.TransactionId == pTransactionID).FirstOrDefaultAsync();

            if (buyerContact == null || sellerContact == null) return;

            var activeRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();

            var relationList = await _appContactRelationshipInfoRepository.GetAll().Include(e => e.EntityExtraData)
                       .Where(e => e.RecipientContactSSIN == buyerContact.CompanySSIN
                       && e.RequesterContactSSIN == sellerContact.CompanySSIN
                       //&& e.TenantId == AbpSession.TenantId
                       && e.EntityObjectStatusId == activeRealtionshipStatusId
                       && e.ConsiderAsTeamMember == false)
                       .ToListAsync();

            var relation = relationList.FirstOrDefault();

            if (relation == null)
            {
                var fallbackRelationList = await _appContactRelationshipInfoRepository.GetAll().Include(e => e.EntityExtraData)
                       .Where(e => e.RecipientContactSSIN == sellerContact.CompanySSIN
                       && e.RequesterContactSSIN == buyerContact.CompanySSIN
                       //&& e.TenantId == AbpSession.TenantId
                       && e.EntityObjectStatusId == activeRealtionshipStatusId
                       && e.ConsiderAsTeamMember == false)
                       .ToListAsync();
                relation = fallbackRelationList.FirstOrDefault();
            }

            // Loop through each transactionChargeEntity
            foreach (var transactionChargeEntity in transactionChargeEntities)
            {
                // Initialize variables before processing extraData
                var itemSsin = string.Empty;
                var isEditable = string.Empty;
                //var ChargeType = 0;
                var calculationApi = string.Empty;
                var chargeName = transactionChargeEntity.Name;

                // Loop through the EntityExtraData list for each entity
                foreach (var extraData in transactionChargeEntity.EntityExtraData)
                {

                    // Switch case to handle AttributeId
                    switch (extraData.AttributeId)
                    {
                        case 901:
                            {
                                var chargeType1 = extraData.AttributeValueId;
                                if (chargeType1 > 0)
                                {
                                    // Declare and initialize ChargeTypeLookup properly
                                    var chargeTypeLookup = await _appEntity
                                        .GetAll()
                                        .Include(e => e.EntityExtraData)
                                        .FirstOrDefaultAsync(e => e.Id == chargeType1);

                                    // Ensure ChargeTypeLookup is not null before using it
                                    if (chargeTypeLookup != null)
                                    {
                                        chargeTypeLookup.EntityExtraData.ForEach(ed =>
                                        {
                                            if (ed.AttributeId == 900) // Assuming 900 is the AttributeId for CalculationAPI
                                            {
                                                calculationApi = ed.AttributeValue;
                                            }
                                        });
                                    }
                                }
                            }
                            break;
                        case 902:
                            itemSsin = extraData.AttributeValue;
                            break;
                        case 903:
                            isEditable = extraData.AttributeValue;
                            break;
                        default:
                            // Handle other AttributeIds if needed
                            break;
                    }

                    // Perform additional logic if necessary
                    Console.WriteLine($"Processed AttributeId: {extraData.AttributeId}, IsEditable: {isEditable}, ItemSSIN: {itemSsin}");
                }

                if (!string.IsNullOrEmpty(itemSsin) && !string.IsNullOrEmpty(calculationApi))
                {
                    decimal amount = 0;

                    switch (calculationApi)
                    {
                        case "Freight-Method":
                            // Call your CalculateShipping method here and assign the result to amount
                            amount = await CalculateShipping(pTransactionID, entityObjectChargesId, relation);
                            break;
                        case "Taxes-Method":
                            // Call your CalculateShipping method here and assign the result to amount
                            amount = await CalculateTaxes(pTransactionID, entityObjectChargesId, relation);
                            break;
                        default:
                            break;
                    }
                    lineNo = lineNo + 1;
                    var newTransactionDetail = new AppTransactionDetails
                    {
                        TransactionId = pTransactionID,
                        ItemSSIN = itemSsin,
                        LineNo = lineNo,
                        Code = pTransactionID.ToString() + '-' + lineNo.ToString() + '-' + itemSsin,
                        //Note = calculationApi, // Storing CalculationAPI in Note for reference
                        Quantity = 1, // Default quantity, can be modified as needed
                        NetPrice = 0, // Default price, can be modified as needed
                        GrossPrice = 0, // Default price, can be modified as needed
                        Discount = 0, // Default discount, can be modified as needed
                        Name = chargeName,
                        Note = isEditable,  // Assuming IsEditable is stored as "true" or "false"
                        TenantId = AbpSession.TenantId,
                        Amount = amount, // call calculation Method based on CalculationAPI
                        EntityObjectStatusId = entityObjectStatusId, // Assuming 12 is the status for calculated charges, modify as needed
                        EntityObjectTypeId = entityObjectChargesId,
                        ObjectId = entityObjectId, // need to be modified with product type charges
                    };
                    await _appTransactionDetails.InsertAsync(newTransactionDetail);
                }

            }

            await RecalculateTransactionTotalAmount(pTransactionID);
        }

        private async Task<decimal> CalculateTaxes(long pTransactionID, long entityObjectChargesId, AppContactRelationshipInfo relation)
        {
            decimal taxes = 0;
            try
            {
                if (relation != null && relation.EntityExtraData != null && relation.EntityExtraData.Count > 0)
                {
                    var isTaxable = relation.EntityExtraData.FirstOrDefault(e => e.AttributeId == 911);

                    if (isTaxable != null && isTaxable.AttributeValue.ToUpper() == "YES")
                    {
                        var transItems = await _appTransactionDetails.GetAll().Where(e => e.TransactionId == pTransactionID && e.EntityObjectTypeId != entityObjectChargesId && e.ParentId!=null)
                            .ToListAsync();

                        var transItemSsins = transItems.Select(i => i.ItemSSIN).ToList();
                        var products = await _appMarketplaceItem.GetAll().Where(e => transItemSsins.Contains(e.SSIN)).ToListAsync();

                        foreach (var item in transItems)
                        {
                            var product = products.FirstOrDefault(e => e.SSIN == item.ItemSSIN);
                            if (product != null && product.TaxRate > 0)
                            {
                                // Call tax calculation API based on item.TaxCode and calculate tax amount
                                // Add the calculated tax amount to the total tax amount for the transaction
                                taxes += item.Amount * ((decimal)product.TaxRate / 100M);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Error("Error calculating taxes for transaction " + pTransactionID, ex);
            }
            return taxes;
        }

        private async Task<decimal> CalculateShippingFromRelation(long pTransactionID, long entityObjectChargesId, AppContactRelationshipInfo relation)
        {
            decimal shipping = 0M;
            try
            {

                if (relation != null && relation.EntityExtraData != null && relation.EntityExtraData.Count > 0)
                {

                    foreach (var extra in relation.EntityExtraData)
                    {
                        if (extra.AttributeId == 909 && extra.AttributeValueId > 0)
                        {

                            var entity = await _appEntity.GetAll().Include(e => e.EntityExtraData).Where(e => e.Id == extra.AttributeValueId).FirstOrDefaultAsync();
                            if (entity != null)
                            {
                                decimal chargeAmount = 0M;
                                decimal minAmount = 0M;

                                var apiExtraData = entity.EntityExtraData.FirstOrDefault(e => e.AttributeId == 905); // Assuming 905 is the AttributeId for minAmount
                                if (apiExtraData != null && !string.IsNullOrEmpty(apiExtraData.AttributeValue))
                                {
                                    decimal.TryParse(apiExtraData.AttributeValue, out minAmount);
                                }
                                var apiExtraDataAmount = entity.EntityExtraData.FirstOrDefault(e => e.AttributeId == 904); // Assuming 904 is the AttributeId for chargeAmount
                                if (apiExtraDataAmount != null && !string.IsNullOrEmpty(apiExtraDataAmount.AttributeValue))
                                {
                                    decimal.TryParse(apiExtraDataAmount.AttributeValue, out chargeAmount);
                                }

                                if (chargeAmount > 0)
                                {
                                    decimal orderAmount = await _appTransactionDetails.GetAll().Where(e => e.TransactionId == pTransactionID && e.EntityObjectTypeId != entityObjectChargesId && (e.ParentId == null || e.ParentId == 0))
                                        .SumAsync(e => e.Amount);

                                    shipping = orderAmount < minAmount ? chargeAmount : 0M;
                                }

                            }
                        }

                    }


                }
            }
            catch (Exception ex)
            {
                Logger.Error("Error calculating shipping for transaction " + pTransactionID, ex);
            }
            return shipping;
        }
        private async Task<decimal> CalculateShipping(long pTransactionID, long entityObjectChargesId, AppContactRelationshipInfo relation)
        {
            decimal shipping = 0M;
            try
            {

                var trans = await _appTransactionsHeaderRepository.GetAll().Where(e => e.Id == pTransactionID).FirstOrDefaultAsync();
                if(trans!=null && trans.ShipViaId!=null  && trans.ShipViaId > 0)
                { 

                            var entity = await _appEntity.GetAll().Include(e => e.EntityExtraData).Where(e => e.Id == trans.ShipViaId).FirstOrDefaultAsync();
                            if (entity != null)
                            {
                                decimal chargeAmount = 0M;
                                decimal minAmount = 0M;

                                var apiExtraData = entity.EntityExtraData.FirstOrDefault(e => e.AttributeId == 905); // Assuming 905 is the AttributeId for minAmount
                                if (apiExtraData != null && !string.IsNullOrEmpty(apiExtraData.AttributeValue))
                                {
                                    decimal.TryParse(apiExtraData.AttributeValue, out minAmount);
                                }
                                var apiExtraDataAmount = entity.EntityExtraData.FirstOrDefault(e => e.AttributeId == 904); // Assuming 904 is the AttributeId for chargeAmount
                                if (apiExtraDataAmount != null && !string.IsNullOrEmpty(apiExtraDataAmount.AttributeValue))
                                {
                                    decimal.TryParse(apiExtraDataAmount.AttributeValue, out chargeAmount);
                                }

                                if (chargeAmount > 0)
                                {
                                    decimal orderAmount = await _appTransactionDetails.GetAll().Where(e => e.TransactionId == pTransactionID && e.EntityObjectTypeId != entityObjectChargesId && (e.ParentId == null || e.ParentId == 0))
                                        .SumAsync(e => e.Amount);

                                    shipping = orderAmount < minAmount ? chargeAmount : 0M;
                                }

                            }
                      
                }
            }
            catch (Exception ex)
            {
                Logger.Error("Error calculating shipping for transaction " + pTransactionID, ex);
            }
            return shipping;
        }



        public async Task<decimal> UpdateCharges(List<ChargesDto> charges, long transactionId)
        {
            decimal totalAmount = 0m;
            var entityObjectChargesId = await _helper.SystemTables.GetEntityObjectCharges();

            if (charges != null && charges.Any())
            {
                var transCharges = await _appTransactionDetails.GetAll()
                    .Where(a => a.TransactionId == transactionId && a.EntityObjectTypeId == entityObjectChargesId).ToListAsync();

                foreach (var chargeDto in charges)
                {
                    var chargeDetail = transCharges.FirstOrDefault(c => c.Id == chargeDto.TransactionDetailID);
                    if (chargeDetail != null)
                    {
                        //if (chargeDetail.Note == "true" || chargeDetail.Note == "True") 
                        {
                            chargeDetail.Amount = chargeDto.ChargeAmount;
                            chargeDetail.NetPrice = chargeDto.ChargeAmount;
                            chargeDetail.GrossPrice = chargeDto.ChargeAmount;
                            await _appTransactionDetails.UpdateAsync(chargeDetail);
                        }
                    }
                }
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            // Calculate total amount
            totalAmount = await RecalculateTransactionTotalAmount(transactionId);

            return totalAmount;
        }

        public async Task<decimal> RecalculateTransactionTotalAmount(long transactionId)
        {
            decimal totalAmount = await _appTransactionDetails.GetAll()
                .Where(a => a.TransactionId == transactionId && (a.ParentId == null || a.ParentId == 0) )
                .SumAsync(a => a.Amount);

            var header = await _appTransactionsHeaderRepository.GetAsync(transactionId);
            if (header != null)
            {
                header.TotalAmount = (double)totalAmount;
                await _appTransactionsHeaderRepository.UpdateAsync(header);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return totalAmount;
        }

        //T-SII-20250606.0001,1 MMT 07/03/2025 Update appEntity log when Transaction line is edited Qty or Price[End]
        //I46{End}
        //I49[Start]
        public async Task<List<string>> GetAccountMarketplaceRoles(string accountSSIN)
        {
            var activeRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
            List<string> returnRoles = new List<string>();
            var contact = await _appMarketplaceContactRepository.GetAll()
                .Include(z => z.EntityExtraData)
                .Where(z => z.SSIN== accountSSIN).FirstOrDefaultAsync();
            if (contact != null)
            {
                var extraRole = contact.EntityExtraData.Where(z => z.AttributeId == 610).FirstOrDefault();
                if (extraRole != null)
                {
                    string rolesString = extraRole.AttributeValue;
                    if (!string.IsNullOrEmpty(rolesString))
                    {
                        var roles = rolesString.Split('-');
                        if (roles.Count() > 0)
                        {
                            foreach (var role in roles)
                            {
                                returnRoles.Add(role);
                            }
                        }

                    }
                }
                //var relations = await _appContactRelationshipInfoRepository.GetAll().Where(z => (z.RecipientContactSSIN == contact.SSIN ||
                // z.RequesterContactSSIN == contact.SSIN) && z.EntityObjectStatusId==activeRealtionshipStatusId && z.SharingLevel==1).ToListAsync();
                // if (relations != null && relations.Count > 0)
                // {
                //     foreach (var relation in relations)
                //     {
                //         if (relation.RecipientContactSSIN == contact.SSIN)
                //         {
                //             if (!string.IsNullOrEmpty(relation.RecipientMarketplaceRole) &&
                //                 returnRoles.FirstOrDefault(z => z == relation.RecipientMarketplaceRole) == null)
                //                 returnRoles.Add(relation.RecipientMarketplaceRole);


                //         }
                //         else
                //         {
                //             if (relation.RequesterContactSSIN== contact.SSIN)
                //             {
                //                 if (!string.IsNullOrEmpty(relation.RequesterMarketplaceRole) &&
                //                 returnRoles.FirstOrDefault(z => z == relation.RequesterMarketplaceRole) == null)
                //                     returnRoles.Add(relation.RequesterMarketplaceRole);
                //             }
                //         }

                //    }
                //}
            }
            return returnRoles;


        }
        public async Task<List<string>> GetLoggedInTenantRoles()
        {
            var activeRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
            List<string> returnRoles = new List<string>();
            var contact = await _appContactRepository.GetAll().Include(z=>z.EntityFk)
                .ThenInclude(z=>z.EntityExtraData)
                .Where(z => z.IsProfileData == true &&
            z.TenantId == AbpSession.TenantId && z.ParentId == null).FirstOrDefaultAsync();
            if (contact != null)
            {
                var extraRole = contact.EntityFk.EntityExtraData.Where(z => z.AttributeId == 610).FirstOrDefault();
                if (extraRole != null)
                {
                    string rolesString = extraRole.AttributeValue;
                    if (!string.IsNullOrEmpty(rolesString))
                    {
                        var roles = rolesString.Split('-');
                        if (roles.Count() > 0)
                        {
                            foreach (var role in roles)
                            {
                                returnRoles.Add(role);
                            }
                        }

                    }
                }
               //var relations = await _appContactRelationshipInfoRepository.GetAll().Where(z => (z.RecipientContactSSIN == contact.SSIN ||
               // z.RequesterContactSSIN == contact.SSIN) && z.EntityObjectStatusId==activeRealtionshipStatusId && z.SharingLevel==1).ToListAsync();
               // if (relations != null && relations.Count > 0)
               // {
               //     foreach (var relation in relations)
               //     {
               //         if (relation.RecipientContactSSIN == contact.SSIN)
               //         {
               //             if (!string.IsNullOrEmpty(relation.RecipientMarketplaceRole) &&
               //                 returnRoles.FirstOrDefault(z => z == relation.RecipientMarketplaceRole) == null)
               //                 returnRoles.Add(relation.RecipientMarketplaceRole);


                //         }
                //         else
                //         {
                //             if (relation.RequesterContactSSIN== contact.SSIN)
                //             {
                //                 if (!string.IsNullOrEmpty(relation.RequesterMarketplaceRole) &&
                //                 returnRoles.FirstOrDefault(z => z == relation.RequesterMarketplaceRole) == null)
                //                     returnRoles.Add(relation.RequesterMarketplaceRole);
                //             }
                //         }

                //    }
                //}
            }
            return returnRoles;


        }
        public async Task<List<AppContactRelationshipInfoDto>> GetTenantAccountRelationships(long tenantId, string accountSSIN)
        {
            var activeRealtionshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
            List<AppContactRelationshipInfoDto> returList = new List<AppContactRelationshipInfoDto>();
            var contact = await _appContactRepository.GetAll()
                .Where(z => z.IsProfileData == true &&
            z.TenantId == tenantId && z.ParentId == null).FirstOrDefaultAsync();
            if (contact != null)
            {
                var relations = await _appContactRelationshipInfoRepository.GetAll()
                    .Where(z => ((z.RecipientContactSSIN == contact.SSIN
                    && z.RequesterContactSSIN == accountSSIN) ||
                    (z.RequesterContactSSIN == contact.SSIN
                    && z.RecipientContactSSIN == accountSSIN)) 
                    && z.EntityObjectStatusId == activeRealtionshipStatusId && z.SharingLevel == 1).ToListAsync();
                if (relations != null && relations.Count > 0)
                {
                    foreach (var relation in relations)
                    {
                        var relationDto = ObjectMapper.Map<AppContactRelationshipInfoDto>(relation);
                        returList.Add(relationDto);
                    }

                }
            }
            return returList;
        }
        private List<long> DefaultTransactionSharing(long transactionId)
        {
            List<long> returnUserList = new List<long>();
            //Dictionary<string, long> companiesTenantsList = new Dictionary<string, long>();
            var transContacts = _appTransactionContactsRepository.GetAll().Where(z => z.TransactionId == transactionId);
            if (transContacts!=null && transContacts.Count() >0)
            {
                //var companiesList = transContacts.Select(z =>z.CompanySSIN).Distinct().ToList();
                //if (companiesList != null)
                //{
                //    foreach (var con in companiesList)
                //    {
                //        var companyMarketplaceContact = _appMarketplaceContactRepository.GetAll().Where(z => z.SSIN == con).FirstOrDefault();
                //        if (companyMarketplaceContact != null)
                //        {
                //            companiesTenantsList.Add(con, companyMarketplaceContact.TenantOwner);
                //        }
                //    }
                //}
                var contactsList = transContacts.Select(z =>new {ContactSSIN = z.ContactSSIN, CompanySSIN = z.CompanySSIN }).Distinct().ToList();
                if (contactsList != null)
                {
                    foreach (var contact in contactsList)
                    {
                        using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                        {
                            var companyObj = _appMarketplaceContactRepository.GetAll().Where(z => z.SSIN == contact.CompanySSIN).FirstOrDefault();
                            var contactTenant = companyObj.TenantOwner;
                            var tenantContact = _appContactRepository.GetAll().Include(z => z.EntityFk)
                                .ThenInclude(z => z.EntityExtraData)
                                .Where(z => z.SSIN == contact.ContactSSIN && z.TenantId == contactTenant).FirstOrDefault();
                            if (tenantContact != null)
                            {
                                var userIdExtra = tenantContact.EntityFk.EntityExtraData.Where(z => z.AttributeId == 715).FirstOrDefault();
                                if (userIdExtra != null &&
                                    !string.IsNullOrEmpty(userIdExtra.AttributeValue) && long.Parse(userIdExtra.AttributeValue)!=0)
                                {
                                    var user = UserManager.GetUserById(long.Parse(userIdExtra.AttributeValue));
                                    if (user != null && user.TenantId== contactTenant)
                                    returnUserList.Add(long.Parse(userIdExtra.AttributeValue));
                                }
                            }
                        }
                    }
                }
            }
            return returnUserList;
        }
        public async Task<List<ContactInfoDto>> GetContactsList(string searchFilter, long transactionId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                List<AppEntitySharings> transactionUsers = null;
                List<string> transactionsUsersSSIN = null;
                if (transactionId != null && transactionId != 0)
                {
                    transactionUsers = await _appEntitySharingsRepository.GetAll().Where(z => z.EntityId == transactionId).ToListAsync();
                    if (transactionUsers != null && transactionUsers.Count > 0)
                    {
                        transactionsUsersSSIN = new List<string>();
                        foreach (var user in transactionUsers)
                        {
                            var extrData = await _appEntityExtraData.GetAll()
                                .Where(z => z.AttributeId == 715 && z.AttributeValue == user.SharedUserId.ToString()).FirstOrDefaultAsync();
                            if (extrData != null)
                            {
                                var contactSharing = await _appContactRepository.GetAll()
                                    .Where(z => z.EntityId == extrData.EntityId).FirstOrDefaultAsync();

                                if (contactSharing != null && !string.IsNullOrEmpty(contactSharing.SSIN))
                                {
                                    var company = await _appContactRepository.GetAll()
                                        .Where(z => z.TenantId == contactSharing.TenantId && z.IsProfileData == true && z.ParentId == null).FirstOrDefaultAsync();
                                    if (company != null && company.SSIN != null)
                                        transactionsUsersSSIN.Add(company.SSIN.Trim() + "-" + contactSharing.SSIN.Trim());
                                }
                            }
                        }
                    }
                }
                List<ContactInfoDto> returnList = new List<ContactInfoDto>();
                var businessType = await _helper.SystemTables.GetEntityObjectTypeParetner();
                var perosnalType = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var activeRelationshipStatusId = await _helper.SystemTables.GetEntityObjectStatusRelationshipActive();
                var currentTenantContact = await _appContactRepository.GetAll()
                    .Where(z => z.EntityFk.EntityObjectTypeId == businessType.Id && z.IsProfileData == true && z.TenantId == AbpSession.TenantId && z.ParentId == null).FirstOrDefaultAsync();
                if (currentTenantContact != null)
                {
                    var personalRelationships = await _appContactRelationshipInfoRepository.GetAll()
                    .Where(z => z.RequesterContactSSIN == currentTenantContact.SSIN
                    && z.RecipientContactTypeId == perosnalType
                    //|| (z.RecipientContactSSIN== currentTenantContact.SSIN && z.RequesterContactTypeId== perosnalType))
                    && z.EntityObjectStatusId == activeRelationshipStatusId)
                    .WhereIf(!string.IsNullOrEmpty(searchFilter), z => z.RecipientContactName
                    .ToUpper().Contains(searchFilter.ToUpper()) || z.RequesterContactName.ToUpper().Contains(searchFilter.ToUpper()))
                    .ToListAsync();
                    if (personalRelationships != null && personalRelationships.Count > 0)
                    {
                        var tenant = TenantManager.GetById(int.Parse(AbpSession.TenantId.ToString()));
                        foreach (var person in personalRelationships)
                        {
                            if (transactionsUsersSSIN != null && transactionsUsersSSIN.Count > 0)
                            {
                                var existingContact = transactionsUsersSSIN
                                    .Where(z => z == currentTenantContact.SSIN.Trim()
                                + "-" + person.RecipientContactSSIN.Trim()).FirstOrDefault();
                                if (existingContact != null)
                                    continue;
                            }
                            ContactInfoDto contact = new ContactInfoDto();
                            contact.ContactSSIN = person.RecipientContactSSIN;
                            contact.CompanySSIN = currentTenantContact.SSIN;
                            contact.TenantId = long.Parse(AbpSession.TenantId.ToString());

                            if (tenant != null)
                            {
                                contact.UserName = person.RecipientContactName.TrimEnd()
                                    .Replace(" ", "") + "@" + tenant.TenancyName.TrimEnd();
                            }
                            if (returnList.Where(z => z.CompanySSIN == contact.CompanySSIN && z.ContactSSIN == contact.ContactSSIN).FirstOrDefault() == null)
                                returnList.Add(contact);
                        }
                    }
                    var businessRelationships = await _appContactRelationshipInfoRepository.GetAll()
                    .Where(z => ((z.RequesterContactSSIN == currentTenantContact.SSIN
                    && z.RecipientContactTypeId == businessType.Id) ||
                    (z.RecipientContactSSIN == currentTenantContact.SSIN
                    && z.RequesterContactTypeId == businessType.Id)) && z.EntityObjectStatusId == activeRelationshipStatusId).
                    ToListAsync();

                    if (businessRelationships != null && businessRelationships.Count > 0)
                    {
                        foreach (var business in businessRelationships)
                        {
                            if (business.RequesterContactSSIN == currentTenantContact.SSIN)
                            {
                                var marketplaceCompany = await _appMarketplaceContactRepository.GetAll()
                                    .Where(z => z.SSIN == business.RecipientContactSSIN).FirstOrDefaultAsync();
                                if (marketplaceCompany != null)
                                {
                                    personalRelationships = await _appContactRelationshipInfoRepository.GetAll()
                                .Where(z => z.RequesterContactSSIN == business.RecipientContactSSIN
                                 && z.RecipientContactTypeId == perosnalType
                                 && z.EntityObjectStatusId == activeRelationshipStatusId && z.SharingLevel == 1)
                                .WhereIf(!string.IsNullOrEmpty(searchFilter), z => z.RecipientContactName
                                .ToUpper().Contains(searchFilter.ToUpper()) || z.RequesterContactName.ToUpper().Contains(searchFilter.ToUpper()))
                                .ToListAsync();
                                    foreach (var person in personalRelationships)
                                    {
                                        if (transactionsUsersSSIN != null && transactionsUsersSSIN.Count > 0)
                                        {
                                            var existingContact = transactionsUsersSSIN
                                                .Where(z => z == business.RecipientContactSSIN.Trim()
                                            + "-" + person.RecipientContactSSIN.Trim()).FirstOrDefault();
                                            if (existingContact != null)
                                                continue;
                                        }
                                        ContactInfoDto contact = new ContactInfoDto();
                                        contact.ContactSSIN = person.RecipientContactSSIN;
                                        contact.CompanySSIN = business.RecipientContactSSIN;
                                        contact.TenantId = marketplaceCompany.TenantOwner;
                                        var tenant = TenantManager.GetById(marketplaceCompany.TenantOwner);
                                        if (tenant != null)
                                        {
                                            contact.UserName = person.RecipientContactName.TrimEnd()
                                                .Replace(" ", "") + "@" + tenant.TenancyName.TrimEnd();
                                        }
                                        if (returnList.Where(z => z.CompanySSIN == contact.CompanySSIN && z.ContactSSIN == contact.ContactSSIN).FirstOrDefault() == null)
                                            returnList.Add(contact);
                                    }
                                }
                            }

                            if (business.RecipientContactSSIN == currentTenantContact.SSIN)
                            {
                                var marketplaceCompany = await _appMarketplaceContactRepository.GetAll()
                                    .Where(z => z.SSIN == business.RequesterContactSSIN).FirstOrDefaultAsync();
                                if (marketplaceCompany != null)
                                {
                                    personalRelationships = await _appContactRelationshipInfoRepository.GetAll()
                               .Where(z => z.RequesterContactSSIN == business.RequesterContactSSIN
                                && z.RecipientContactTypeId == perosnalType
                                && z.EntityObjectStatusId == activeRelationshipStatusId && z.SharingLevel == 1)
                               .WhereIf(!string.IsNullOrEmpty(searchFilter), z => z.RecipientContactName
                               .ToUpper().Contains(searchFilter.ToUpper()) || z.RequesterContactName.ToUpper().Contains(searchFilter.ToUpper()))
                               .ToListAsync();
                                    foreach (var person in personalRelationships)
                                    {

                                        ContactInfoDto contact = new ContactInfoDto();
                                        contact.ContactSSIN = person.RecipientContactSSIN;
                                        contact.CompanySSIN = business.RequesterContactSSIN;
                                        contact.TenantId = marketplaceCompany.TenantOwner;
                                        var tenant = TenantManager.GetById(marketplaceCompany.TenantOwner);
                                        if (tenant != null)
                                        {
                                            contact.UserName = person.RecipientContactName.TrimEnd()
                                                .Replace(" ", "") + "@" + tenant.TenancyName.TrimEnd();
                                        }
                                        if (returnList.Where(z => z.CompanySSIN == contact.CompanySSIN && z.ContactSSIN == contact.ContactSSIN).FirstOrDefault() == null)
                                            returnList.Add(contact);
                                    }
                                }
                            }

                        }
                    }



                }
                return returnList;
            }         
        }
        //I49[End]
    }

}
