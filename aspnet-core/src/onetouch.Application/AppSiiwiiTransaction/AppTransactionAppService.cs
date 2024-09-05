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
        //MMT37[End]
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
             IRepository<AppEntityExtraData, long> appEntityExtraData, IEmailSender emailSender, IAppItemsAppService appItemsAppService, ISycEntityObjectTypesAppService sycEntityObjectTypesAppService)
        {
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
        public async Task<long> CreateOrEdit(CreateOrEditAppTransactionsDto input)
        {
            long? buyerTenantId = null;
            if (!string.IsNullOrEmpty(input.BuyerCompanySSIN))
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    var buyerAccountProfile = await _appContactRepository.GetAll().Where(z => z.TenantId != null && z.IsProfileData == true && z.SSIN == input.BuyerCompanySSIN && z.PartnerId == null).FirstOrDefaultAsync();
                    if (buyerAccountProfile != null)
                        buyerTenantId = buyerAccountProfile.TenantId;
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
                    input.CurrencyId = null;
                    input.CurrencyCode = null;
                }
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

                var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.SSIN == input.SellerCompanySSIN);
                if (account != null)
                {
                    sellerCurrency = account.CurrencyCode;
                    input.LanguageId = account.LanguageId;
                    input.LanguageCode = account.LanguageCode;
                    if (string.IsNullOrEmpty(input.CurrencyCode))
                    {
                        input.CurrencyCode = sellerCurrency;
                        //T-SII-20231221.0002,1 MMT 01/01/2024 Transactions-Temp Account issues[Start]
                        input.CurrencyId = account.CurrencyId;
                        //T-SII-20231221.0002,1 MMT 01/01/2024 Transactions-Temp Account issues[End]
                    }
                }

                if (string.IsNullOrEmpty(input.CurrencyCode))
                {
                    var currencyObject = await TenantManager.GetTenantCurrency();
                    if (currencyObject != null)
                    {
                        input.CurrencyId = currencyObject.Value;
                        input.CurrencyCode = currencyObject.Code;
                    }
                }
                if (string.IsNullOrEmpty(input.CurrencyCode))
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
                //Iteration#37 -MMT [Start]
                if (appTrans.ShipViaFk != null)
                    appTrans.ShipViaName = appTrans.ShipViaFk.Name;
                if (appTrans.PaymentTermsFk != null)
                    appTrans.PaymentTermsName = appTrans.PaymentTermsFk.Name;
                //Iteration#37 -MMT [End]
                if (input.lFromPlaceOrder)
                    appTrans.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusOpenTransaction();
                else
                    appTrans.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();

                appTrans.EnteredUserByRole = input.EnteredByUserRole;
                //XX
                appTrans.AppTransactionContacts = new List<AppTransactionContacts>();
                if (string.IsNullOrEmpty(appTrans.SSIN))
                {
                    var transactionObjectId = await _helper.SystemTables.GetObjectTransactionId();
                    appTrans.SSIN = (input.TransactionType == TransactionType.SalesOrder ? "SO-" : "PO-") + await _helper.SystemTables.GenerateSSIN(transactionObjectId,ObjectMapper.Map<AppEntityDto>(appTrans));
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
                    var accountSSIN = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z=>z.AddressTypeFk)
                        .Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk).Where(a => a.SSIN == input.SellerBranchSSIN).FirstOrDefaultAsync();
                    if (accountSSIN != null)
                    {

                        phoneTypeSeller = !string.IsNullOrEmpty(accountSSIN.Phone1Number) ? accountSSIN.Phone1TypeId :
                           (!string.IsNullOrEmpty(accountSSIN.Phone2Number) ? accountSSIN.Phone2TypeId :
                           (!string.IsNullOrEmpty(accountSSIN.Phone3Number) ? accountSSIN.Phone3TypeId : null));
                        phoneTypeNameSeller = !string.IsNullOrEmpty(accountSSIN.Phone1Number) ? accountSSIN.Phone1TypeName :
                            (!string.IsNullOrEmpty(accountSSIN.Phone2Number) ? accountSSIN.Phone2TypeName :
                            (!string.IsNullOrEmpty(accountSSIN.Phone3Number) ? accountSSIN.Phone3TypeName : null));
                        var sellerAddressObj = accountSSIN.AppContactAddresses.Where(z=>z.AddressTypeFk.Code == "DIRECT-SHIPPING" || z.AddressTypeFk.Code == "DISTRIBUTION-CENTER").FirstOrDefault();
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
                    var accountSSIN = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z=>z.AddressTypeFk)
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
                    BranchSSIN = input.SellerBranchSSIN
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
                    BranchSSIN = input.BuyerBranchSSIN
                });
                //
                var accountSSINBranchBuyer = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses)
                    .ThenInclude(z=>z.AddressTypeFk)
                    .Include(z=>z.AppContactAddresses).ThenInclude(z=>z.AddressFk)
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
                    ContactAddressCode = buyerAddressCode,
                    ContactRole = ContactRoleEnum.ShipToContact.ToString(),
                    CompanySSIN = input.BuyerCompanySSIN,
                    CompanyName = input.BuyerCompanyName,
                    BranchName = input.BuyerBranchName,
                    BranchSSIN = input.BuyerBranchSSIN,
                    //ContactAddressCode = contactBuyerAddressCode,
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
                var accountSSINBranchBuy = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z=>z.AddressTypeFk)
                    .Include(z => z.AppContactAddresses).ThenInclude(z => z.AddressFk)
                    .Where(a => a.SSIN == input.BuyerBranchSSIN).FirstOrDefaultAsync();
                if (accountSSINBranchBuy != null)
                {
                    var addressObj = accountSSINBranchBuy.AppContactAddresses.FirstOrDefault(x => x.AddressTypeFk.Code== "BILLING");
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
                var accountSSINBranch = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z=>z.AddressTypeFk)
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
                var accountSSINBranchSeller = await _appContactRepository.GetAll().Include(z => z.AppContactAddresses).ThenInclude(z=>z.AddressTypeFk)
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

                    var contact = await _appContactRepository.GetAll()
                        .Where(s => s.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && s.EntityFk.EntityExtraData.Count(z => z.AttributeId == 715 && z.AttributeValue == AbpSession.UserId.ToString()) > 0).FirstOrDefaultAsync();

                    if (contact != null)
                    {
                        var contactCompany = await _appContactRepository.GetAll()
                        .Where(s => s.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId && s.Id == contact.ParentId).FirstOrDefaultAsync();

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
                            BranchName = (input.TransactionType == TransactionType.SalesOrder && input.EnteredByUserRole == "I'm a Seller") ? input.SellerBranchName :
                            ((input.TransactionType == TransactionType.PurchaseOrder && input.EnteredByUserRole == "I'm a Buyer") ? input.BuyerBranchName: null),
                            BranchSSIN = (input.TransactionType == TransactionType.SalesOrder && input.EnteredByUserRole == "I'm a Seller") ? input.SellerBranchSSIN:
                            ((input.TransactionType == TransactionType.PurchaseOrder && input.EnteredByUserRole == "I'm a Buyer") ? input.BuyerBranchSSIN: null)
                        }) ;
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
                                BranchName = null,
                                BranchSSIN = null
                            });

                    }


                }
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
                                await GetProductFromMarketplace(det.SSIN, int.Parse(buyerTenantId.ToString()));
                        }
                    }
                    
                    appTrans.Id = header.Id;
                    appTrans.EnteredDate = input.EnteredDate;
                    if (header.EntityObjectStatusId == null)
                        appTrans.CreatorUserId = AbpSession.UserId;

                    obj = await _appTransactionsHeaderRepository.UpdateAsync(appTrans);
                }
                else
                {
                    //XX
                    //var  AppTrans = Objmapper. ObjectMapper.Map<CreateOrEditAppTransactionDto,AppTransactionsHeader>(input);
                    //ObjectMapper..Map<CreateOrEditAppTransactionDto,AppTransactionsHeader>(input) ;
                    appTrans.EnteredDate = input.EnteredDate;
                    obj = await _appTransactionsHeaderRepository.InsertAsync(appTrans);
                    
                    obj = await _appTransactionsHeaderRepository.UpdateAsync(obj);
                }

                await CurrentUnitOfWork.SaveChangesAsync();
                return obj.Id;

            }
            else
            {
                var appTrans = ObjectMapper.Map<AppTransactionHeaders>(input);
                appTrans.EnteredUserByRole = input.EnteredByUserRole;
                appTrans.EnteredDate = input.EnteredDate;
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
                                        appCont.ContactAddressCountryId = null;
                                    }
                                }
                                else
                                {
                                    if (appCont.ContactAddressCode == null)
                                        appCont.ContactAddressCountryId = null;
                                }
                                //Iteration37 - MMT [Start]
                                await _appTransactionContactsRepository.UpdateAsync(appCont);
                            }
                        }
                    }
                    var appContSeller = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.Seller.ToString() && a.BranchName != null);
                    if (appContSeller != null)
                    {
                        var shipFromContact = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.ShipFromContact.ToString());
                        if (shipFromContact != null && (string.IsNullOrEmpty(shipFromContact.BranchName) || shipFromContact.ContactAddressId == null))
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
                                    shipFromContact.ContactAddressCountryId = null;
                                }
                            }
                            else
                            {
                                if (shipFromContact.ContactAddressCode == null)
                                    shipFromContact.ContactAddressCountryId = null;
                            }
                            await _appTransactionContactsRepository.UpdateAsync(shipFromContact);
                        }
                        //AR Contact [Start]
                        var arContact = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.ARContact.ToString());
                        if (arContact != null && (string.IsNullOrEmpty(arContact.BranchName) || arContact.ContactAddressId == null))
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
                                        sellerAddressCode = sellerAddressObj.AddressCode;
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
                                    arContact.ContactAddressCountryId = null;
                                }
                            }
                            else
                            {
                                if (arContact.ContactAddressCode == null)
                                    arContact.ContactAddressCountryId = null;
                            }
                            //Iteration37 - MMT [Start]

                            await _appTransactionContactsRepository.UpdateAsync(arContact);
                            //AR Contact [End]
                        }
                    }
                    //
                    var appContBuyer = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.Buyer.ToString() && a.BranchName != null);
                    if (appContBuyer != null)
                    {

                        var shiToContact = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.ShipToContact.ToString());
                        if (shiToContact != null && (string.IsNullOrEmpty(shiToContact.BranchSSIN) || shiToContact.ContactAddressId == null))
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
                            shiToContact.ContactAddressCode = buyerAddressCode;

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
                                    shiToContact.ContactAddressCountryId = null;
                                }
                            }
                            else
                            {
                                if (shiToContact.ContactAddressCode == null)
                                    shiToContact.ContactAddressCountryId = null;
                            }
                            await _appTransactionContactsRepository.UpdateAsync(shiToContact);

                        }
                        //AP Contact[Start]
                        var apContact = appTrans.AppTransactionContacts.FirstOrDefault(a => a.ContactRole == ContactRoleEnum.APContact.ToString());
                        if (apContact != null && (string.IsNullOrEmpty(apContact.BranchSSIN) || apContact.ContactAddressId == null))
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
                            apContact.ContactAddressCode = buyerAddressCode;

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
                                    apContact.ContactAddressCountryId = null;
                                }
                            }
                            else
                            {
                                if (apContact.ContactAddressCode == null)
                                    apContact.ContactAddressCountryId = null;
                            }
                            await _appTransactionContactsRepository.UpdateAsync(apContact);

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
                    if (buyerTenantId != null)
                    {
                        appTrans.AppTransactionDetails = _appTransactionDetails.GetAll().AsNoTracking().Where(z => z.TransactionId == appTrans.Id && z.ParentId == null).ToList();
                        foreach (var det in appTrans.AppTransactionDetails.Where(z => z.ParentId == null))
                            await GetProductFromMarketplace(det.SSIN, int.Parse(buyerTenantId.ToString()));
                    }
                }
                foreach (var con in appTrans.AppTransactionContacts)
                {
                    if (con.ContactAddressId == null) con.ContactAddressCountryId = null;
                }
                if (string.IsNullOrEmpty(appTrans.SSIN))
                {
                    var transactionObjectId = await _helper.SystemTables.GetObjectTransactionId();
                    appTrans.SSIN = (input.TransactionType == TransactionType.SalesOrder ? "SO-" : "PO-") + await _helper.SystemTables.GenerateSSIN(transactionObjectId, ObjectMapper.Map<AppEntityDto>(appTrans));
                }
                appTrans.EnteredDate = input.EnteredDate;
                var obj = await _appTransactionsHeaderRepository.UpdateAsync(appTrans);
                await CurrentUnitOfWork.SaveChangesAsync();
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
                    var header = await _appTransactionsHeaderRepository.GetAll().Where(x => x.EntityObjectTypeId == objectRec.Id && x.EntityObjectStatusId == null && x.TenantId == AbpSession.TenantId).FirstOrDefaultAsync();
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
                trans.SSIN = tranType+"-"+ await _helper.SystemTables.GenerateSSIN(transactionObjectId, null);
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
                    Code = account.CurrencyCode,
                    Value = (long)account.CurrencyId,
                    Label = account.CurrencyFk.Name,
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
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            List<GetContactInformationDto> returnObjectList = new List<GetContactInformationDto>();
            var accountsList = _appContactRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(filter), a => a.Name.ToLower().Contains(filter.ToLower()))
                .Where(a => a.TenantId == AbpSession.TenantId //& a.ParentId != null
                & a.AccountId == accountId & a.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId);


            var pagedAndFilteredAccounts = accountsList.OrderBy("name asc");


            var _accounts = from o in pagedAndFilteredAccounts
                            select new GetContactInformationDto()
                            {
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
        public async Task<PagedResultDto<GetAccountInformationOutputDto>> GetRelatedAccounts(GetAllAccountsInput accountFilter, bool? lExclueMyAcc = false, string? transactionType=null)
        {

            var partnerEntityObjectType = await _helper.SystemTables.GetEntityObjectTypeParetner();
            //T-SII-20240610.0002
            var manualAccountEntityObjectType = await _helper.SystemTables.GetEntityObjectTypeManual();

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
                ((string.IsNullOrEmpty(transactionType) || transactionType == "SO") ? (a.EntityFk.EntityObjectTypeId == partnerEntityObjectType.Id || a.EntityFk.EntityObjectTypeId == manualAccountEntityObjectType.Id) : a.PartnerId!=null )); //a.EntityFk.EntityObjectTypeId == partnerEntityObjectType.Id
                                                                                                                                                                                                                               //&& (a.EntityFk.EntityObjectTypeId == partnerEntityObjectType.Id || ((string.IsNullOrEmpty(transactionType) || transactionType =="PO") ? false :a.EntityFk.EntityObjectTypeId == manualAccountEntityObjectType.Id)));


            var pagedAndFilteredAccounts = accountsList.OrderBy(accountFilter.Sorting ?? "name asc");
            // .PageBy(accountFilter);


            var _accounts = from o in pagedAndFilteredAccounts
                            select new GetAccountInformationOutputDto()
                            {
                                Id = o.Id,
                                Name = o.Name.TrimEnd(),
                                CurrencyCode = new CurrencyInfoDto
                                {
                                    Code = o.CurrencyCode == null ? "" : o.CurrencyCode,
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
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(x => x.AppTransactionContacts).ThenInclude(s => s.ContactAddressFk)
                    .Include(z => z.AppTransactionDetails)
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
                            .WhereIf(input.EntityTypeIdFilter > 0, e => e.EntityObjectTypeId == input.EntityTypeIdFilter)
                            .WhereIf(!string.IsNullOrEmpty(input.BuyerSSIN), e => e.BuyerContactSSIN == input.BuyerSSIN)
                            .WhereIf(!string.IsNullOrEmpty(input.SellerSSIN), e => e.SellerContactSSIN == input.SellerSSIN)
                            .WhereIf(!string.IsNullOrEmpty(input.SellerName), e => e.SellerCompanyName.Contains(input.SellerName))
                            .WhereIf(!string.IsNullOrEmpty(input.BuyerName), e => e.BuyerCompanyName.Contains(input.BuyerName))
                            .Where(e => !(e.CreatorUserId != AbpSession.UserId && e.EntityObjectStatusId == entityObjectStatusId) && e.EntityObjectStatusId != null && e.TenantId == AbpSession.TenantId)
                            ;


                var pagedAndFilteredAppTransactions = filteredAppTransactions
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


                var pagedAndFilteredAppTransactionsRes = from e in pagedAndFilteredAppTransactions.Include(z => z.AppTransactionContacts)
                                                         .ThenInclude(z => z.ContactAddressFk).Include(z => z.AppTransactionDetails)
                                                         join
                                                         x in _appContactRepository.GetAll().Where(s => s.TenantId == AbpSession.TenantId) on
                                                         e.SellerCompanySSIN.Trim() equals x.SSIN.Trim()
                                                         join
                                                         s in _appContactRepository.GetAll().Where(s => s.TenantId == AbpSession.TenantId) on
                                                         e.BuyerCompanySSIN.Trim() equals s.SSIN.Trim() into j
                                                         from a in j.DefaultIfEmpty()
                                                         select new { Trans = e, TranSellerCode = x.Code, TranBuyerCode = a.Code };



                //     var pagedAndFilteredAppTransactionsRes2 = pagedAndFilteredAppTransactionsRes.Join(_appContactRepository.GetAll().Where(s => s.TenantId == AbpSession.TenantId),
                //   x => x.trans.BuyerCompanySSIN.Trim(), sa => sa.SSIN.Trim(), (s, sa) => new { trans = s, buyerCode = sa.Code });
                var items = await pagedAndFilteredAppTransactionsRes.ToListAsync();
                var totalCount = items.DistinctBy(e => e.Trans).Count();
                var objList = items.DistinctBy(e => e.Trans).ToList();
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
                                         .WhereIf(!string.IsNullOrEmpty(input.BuyerSSIN), e => e.BuyerContactSSIN == input.BuyerSSIN)
                                         .WhereIf(!string.IsNullOrEmpty(input.SellerSSIN), e => e.SellerContactSSIN == input.SellerSSIN)
                                         .WhereIf(!string.IsNullOrEmpty(input.SellerName), e => e.SellerCompanyName.Contains(input.SellerName))
                                         .WhereIf(!string.IsNullOrEmpty(input.BuyerName), e => e.BuyerCompanyName.Contains(input.BuyerName))
                                         .Where(e => !(e.CreatorUserId != AbpSession.UserId && e.EntityObjectStatusId == entityObjectStatusId) && e.EntityObjectStatusId != null && e.TenantId == AbpSession.TenantId)
                                         ;


                var pagedAndFilteredAppTransactions = filteredAppTransactions
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

                    var totalCount = await filteredAppTransactions.CountAsync();
                    var objList = await pagedAndFilteredAppTransactions.ToListAsync();
                    var appTrans = ObjectMapper.Map<List<GetAllAppTransactionsForViewDto>>(objList);
                foreach (var tran in appTrans)
                {
                    if (tran.TenantOwner != null)
                    {  
                        var creatorTenant =await  TenantManager.GetByIdAsync(int.Parse(tran.TenantOwner.ToString()));
                        tran.CreatorTenantName = creatorTenant.Name;
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
                        objReturn.SellerId = appContactSeller.Id;
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
                && e.SellerCompanySSIN == sellerSSIN && e.BuyerCompanySSIN == buyerSSIN).FirstOrDefault();

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
                    await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                    await CurrentUnitOfWork.SaveChangesAsync();
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
                    await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                    await CurrentUnitOfWork.SaveChangesAsync();
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
                    await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                    await CurrentUnitOfWork.SaveChangesAsync();
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
                                                var lineAttachmentDefault = size.EntityAttachments.FirstOrDefault(x => x.IsDefault == true);
                                                var lineAttachment = size.EntityAttachments.FirstOrDefault(x => x.IsDefault == true);
                                                sizeColorDetailView.Data.Image = (lineAttachmentDefault == null ?
                                                           (lineAttachment != null ? "attachments/" + line.TenantId + "/" + lineAttachment.AttachmentFk.Attachment : "")
                                                            : "attachments/" + (line.TenantId.HasValue ? line.TenantId : -1) + "/" +
                                                            lineAttachmentDefault.AttachmentFk.Attachment);
                                            }
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
                                        colorDetailView.Data.NoOfPrePacks =  (size.NoOfPrePacks == null ? 0 : (long)size.NoOfPrePacks);//colorDetailView.Data.NoOfPrePacks +
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
                        await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                        //T-SII-20240801.0002,1 MMT 08/22/2024 Adjust transaction total qty and amount after editing lines[End]
                        await CurrentUnitOfWork.SaveChangesAsync();
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
                        foreach (var e in itemsList)
                        {
                            if ((long)e.NoOfPrePacks > 0)
                            {
                               // e.Quantity = qty / (e.Quantity / (long)e.NoOfPrePacks);
                               // e.NoOfPrePacks = qty;
                                oldQty += e.Quantity;
                            }
                        };
                        long? NewNoOfPrePack = qty/(((long?)oldQty) / itemMajor.NoOfPrePacks);
                        foreach (var e in itemsList)
                        {
                            if ((long)e.NoOfPrePacks > 0)
                            {
                                e.Quantity = (double)(NewNoOfPrePack * (e.Quantity / (long)e.NoOfPrePacks));
                                e.NoOfPrePacks = NewNoOfPrePack;
                            }
                        };
                        itemMajor.NoOfPrePacks = NewNoOfPrePack;
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
                //T-SII-20240801.0002,1 MMT 08/22/2024 Adjust transaction total qty and amount after editing lines[Start]
                filteredAppTransactions.TotalQuantity = long.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Quantity).ToString());
                filteredAppTransactions.TotalAmount = double.Parse(filteredAppTransactions.AppTransactionDetails.Where(s => !s.IsDeleted && s.ParentId != null).Sum(s => s.Amount).ToString());
                await _appTransactionsHeaderRepository.UpdateAsync(filteredAppTransactions);
                //T-SII-20240801.0002,1 MMT 08/22/2024 Adjust transaction total qty and amount after editing lines[End]
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
                                foreach (var parentAttach in detParent.EntityAttachments)
                                {
                                    parentAttach.Id = 0;

                                    parentAttach.EntityId = 0;
                                    parentAttach.EntityFk = null;
                                    parentAttach.AttachmentFk.TenantId = AbpSession.TenantId;
                                    MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId);
                                    parentAttach.AttachmentId = 0;
                                    parentAttach.AttachmentFk.Id = 0;
                                }
                            }
                            detParent = await _appTransactionDetails.InsertAsync(detParent);
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
                                            foreach (var parentAttach in det.EntityAttachments)
                                            {
                                                parentAttach.Id = 0;

                                                parentAttach.EntityId = 0;
                                                parentAttach.EntityFk = null;
                                                parentAttach.AttachmentFk.TenantId = AbpSession.TenantId;
                                                MoveFile(parentAttach.AttachmentFk.Attachment, -1, AbpSession.TenantId);
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
                    header.TotalQuantity += long.Parse(colorQty.ToString());
                    header.TotalAmount += double.Parse(colorAmt.ToString());
                    await _appTransactionsHeaderRepository.UpdateAsync(header);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }
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
        [HttpGet]
        public async Task<List<AccountBranchDto>> GetAccountBranches(string accountSSIN)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                var filteredParentId = _appContactRepository.GetAll().Where(z => z.SSIN == accountSSIN && z.TenantId == AbpSession.TenantId).FirstOrDefault();
                var filteredBranches = _appContactRepository.GetAll()
                            .Include(e => e.ParentFk)
                            // .Include(e => e.ParentFkList)
                            .Where(e => e.ParentId != null && e.ParentId == filteredParentId.Id && e.EntityFk.EntityObjectTypeId != presonEntityObjectTypeId);

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
                x.Add(new AccountBranchDto { Code = "Main", Name = @"*Main*", Id = filteredParentId.Id, SSIN = accountSSIN });
                var orderedList = x.OrderBy(z => z.Name).ToList();
                return orderedList;
            }
        }
        public async Task<List<GetContactInformationDto>> GetAccountRelatedContactsList(string accountSSIN, string filter)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var accountId = _appContactRepository.GetAll().Where(z => z.SSIN == accountSSIN && z.TenantId == AbpSession.TenantId).FirstOrDefault();
                var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
                List<GetContactInformationDto> returnObjectList = new List<GetContactInformationDto>();
                var accountsList = _appContactRepository.GetAll()
                    .WhereIf(!string.IsNullOrEmpty(filter), a => a.Name.ToLower().Contains(filter.ToLower()))
                    .Where(a => a.TenantId == AbpSession.TenantId //& a.ParentId != null
                    & a.AccountId == accountId.Id & a.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId);


                var pagedAndFilteredAccounts = accountsList.OrderBy("name asc");


                var _accounts = from o in pagedAndFilteredAccounts
                                select new GetContactInformationDto()
                                {
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
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }

        }
        //xx
        public async Task GetProductFromMarketplace(string productSSIN, int? tenantId)
        {
            if (tenantId == null)
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
                        .Include(z => z.EntityClassifications)
                        .Include(z => z.EntityCategories)
                        .Include(z => z.ParentFkList).ThenInclude(z => z.ItemPricesFkList)
                        .Include(z => z.ParentFkList).ThenInclude(z => z.EntityExtraData)
                        .Include(z => z.ParentFkList).ThenInclude(z => z.EntityAttachments).ThenInclude(s => s.AttachmentFk)
                        .FirstOrDefaultAsync(s => s.SSIN == productSSIN);

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
                    var identifier =await GetProductTypeIdentifier(int.Parse(marketplaceItem.EntityObjectTypeId.ToString()), tenantId);
                    if (identifier == null)
                    {
                        var orgItem = await _appItems.GetAll().Where(z => z.SSIN == marketplaceItem.SSIN && z.TenantId == z.TenantOwner).FirstOrDefaultAsync();
                        identifier = orgItem.SycIdentifierId;
                    }
                    var variationList = await _appItemsAppService.GetVariationsCodes(long.Parse(identifier.ToString()), nextCode, variationListOrg, marketplaceItem.EntityObjectTypeId, tenantId);
                    item.SycIdentifierId = identifier;
                    //}

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
                        varItem.EntityFk = entityVar;
                        varItem.ParentEntityFk = item.EntityFk;
                        varItem.ItemPricesFkList = new List<AppItemPrices>();
                        foreach (var itemPrice in variation.ItemPricesFkList)
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
                            varItem.ItemPricesFkList.Add(price);
                        }


                        if (item.ParentFkList == null)
                            item.ParentFkList = new List<AppItem>();
                        item.ParentFkList.Add(varItem);

                    }


                    // return;
                    item.ItemPricesFkList = new List<AppItemPrices>(); //ObjectMapper.Map<List<AppItemPrices>>(marketplaceItem.ItemPricesFkList);
                    foreach (var itemPrice in marketplaceItem.ItemPricesFkList)
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
                        item.ItemPricesFkList.Add(price);
                    }



                    await _appItems.InsertAsync(item);
                    await CurrentUnitOfWork.SaveChangesAsync();
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

                            MoveFile(attch.AttachmentFk.Attachment, -1, tenantId);
                            appAtt.AttachmentId = 0;
                            appAtt.IsDefault = attch.IsDefault;
                            entityMain.EntityAttachments.Add(appAtt);
                        }
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
                                entCategory.EntityObjectCategoryFk = null;
                                item.EntityFk.EntityCategories.Add(entCategory);
                            }
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
                                entClass.EntityObjectClassificationFk = null;
                                item.EntityFk.EntityClassifications.Add(entClass);
                            }
                        }
                        _appEntity.UpdateAsync(item.EntityFk);

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
                                            MoveFile(ext.AttributeValue, -1, tenantId);

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
                                        entCategory.EntityObjectCategoryFk = null;
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
                                        entClass.EntityObjectClassificationFk = null;
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
                                        MoveFile(attch.AttachmentFk.Attachment, -1, tenantId);
                                        appAtt.AttachmentId = 0;
                                        appAtt.IsDefault = attch.IsDefault;
                                        tenantVariation.EntityFk.EntityAttachments.Add(appAtt);
                                    }
                                }
                                _appEntity.UpdateAsync(tenantVariation.EntityFk);
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
                            await _appItemSizeScaleHeadersRepository.InsertAsync(itemSizeScaleHeader);
                            await CurrentUnitOfWork.SaveChangesAsync();
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
                                await _appItemSizeScaleHeadersRepository.InsertAsync(sizeRatio);
                                await CurrentUnitOfWork.SaveChangesAsync();
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
        public async Task<GetAppTransactionsForViewDto> GetAppTransactionsForView(long transactionId, GetAllAppTransactionsInputDto? input, TransactionPosition? position)
        {

            //XX

            if (input != null && position != null)
            {
                var transOrg = await _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionContacts).Include(z => z.EntityCategories).ThenInclude(z => z.EntityObjectCategoryFk)
                    .Include(a => a.EntityClassifications).ThenInclude(z => z.EntityObjectClassificationFk)
                    .Include(a => a.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                .Where(a => a.Id == transactionId).FirstOrDefaultAsync();
                var entityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
                var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionContacts)
                    .ThenInclude(s => s.ContactAddressFk).Include(z => z.EntityCategories)
                    .Include(a => a.EntityClassifications)
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
                        {
                            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                            {
                                var sharedUsersList = await _appEntitySharingsRepository.GetAll().Where(z => z.EntityId == viewTrans.Id).ToListAsync();
                                if (sharedUsersList != null && sharedUsersList.Count > 0)
                                {
                                    viewTrans.SharedWithUsers = new List<ContactInformationOutputDto>();
                                    foreach (var usr in sharedUsersList)
                                    {
                                        //ContactInformationOutputDto contactDto = new ContactInformationOutputDto();
                                        //contactDto.UserId = usr.SharedUserId;
                                        //contactDto.Email = usr.SharedUserEMail;
                                        //contactDto.TenantId = usr.SharedTenantId;
                                        //contactDto.Id = usr.Id;
                                        var user = UserManager.GetUserById(long.Parse(usr.SharedUserId.ToString()));
                                        if (user != null)
                                            viewTrans.SharedWithUsers.Add(new ContactInformationOutputDto
                                            {
                                                Id = usr.Id,
                                                Email = usr.SharedUserEMail,
                                                Name = user.Name,
                                                UserId = long.Parse(usr.SharedUserId.ToString()),
                                                UserImage = user != null && user.ProfilePictureId != null ? Guid.Parse(user.ProfilePictureId.ToString()) : null,
                                                UserName = user.UserName,
                                                TenantId = int.Parse(user.TenantId.ToString())
                                            });
                                    }
                                }
                            }
                        }
                        //MMT

                        viewTrans.IsOwnedByMe = (AbpSession.TenantId == viewTrans.TenantOwner);
                        viewTrans.TotalQuantity = transOrg.TotalQuantity;
                        viewTrans.TotalAmount = transOrg.TotalAmount;
                        viewTrans.TransactionType = transOrg.EntityObjectTypeCode == "SALESORDER" ? TransactionType.SalesOrder : TransactionType.PurchaseOrder;
                        viewTrans.EntityStatusCode = transOrg.EntityObjectStatusCode;
                        if (viewTrans.AppTransactionContacts!=null && viewTrans.AppTransactionContacts.Count>0)
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
                        if (creator!=null)
                            viewTrans.IsOrderInformationValid = (!string.IsNullOrEmpty(creator.CompanyName) && !string.IsNullOrEmpty(creator.BranchName)) &&
                                        !string.IsNullOrEmpty(viewTrans.CurrencyCode) && (viewTrans.CurrencyExchangeRate!=0) &&  viewTrans.AvailableDate != new DateTime(1, 1, 1) &&
                                        viewTrans.CompleteDate != new DateTime(1, 1, 1) && viewTrans.StartDate != new DateTime(1, 1, 1) &&
                                        viewTrans.EnteredDate != new DateTime(1, 1, 1) ;

                        viewTrans.IsSellerContactInformationValid = false;
                        var sellor = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.Seller).FirstOrDefault();
                        if (sellor!=null)
                            viewTrans.IsSellerContactInformationValid = (!string.IsNullOrEmpty(sellor.CompanyName) && !string.IsNullOrEmpty(sellor.BranchName))  ;
                        
                        
                        viewTrans.IsBuyerContactInformationValid = false;
                        var buyer = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.Buyer).FirstOrDefault();
                        if (buyer!=null)
                            viewTrans.IsBuyerContactInformationValid= (!string.IsNullOrEmpty(buyer.CompanyName) && !string.IsNullOrEmpty(buyer.BranchName));

                        viewTrans.IsSalesRepInformationValid = true;
                        var salesRep = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.SalesRep1).FirstOrDefault();
                        if (salesRep!=null)
                            viewTrans.IsSalesRepInformationValid = viewTrans.IsSalesRepInformationValid && (!string.IsNullOrEmpty(salesRep.CompanyName) && !string.IsNullOrEmpty(salesRep.BranchName));

                        var salesRep2 = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.SalesRep2).FirstOrDefault();
                        if (salesRep2 != null)
                            viewTrans.IsSalesRepInformationValid = viewTrans.IsSalesRepInformationValid && (!string.IsNullOrEmpty(salesRep2.CompanyName) && !string.IsNullOrEmpty(salesRep2.BranchName));

                        
                        viewTrans.IsShippingInformationValid = false;
                        var shipTo= viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.ShipToContact).FirstOrDefault();
                        var shipFrom = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.ShipFromContact).FirstOrDefault();
                        if (shipTo!=null && shipFrom!=null)
                           viewTrans.IsShippingInformationValid = (!string.IsNullOrEmpty(shipTo.CompanyName) && !string.IsNullOrEmpty(shipTo.BranchName)) &&
                                (!string.IsNullOrEmpty(shipFrom.CompanyName) && !string.IsNullOrEmpty(shipFrom.BranchName)) &&
                                !string.IsNullOrEmpty(shipTo.ContactAddressCode) && !string.IsNullOrEmpty(shipTo.ContactAddressLine1) &&
                                !string.IsNullOrEmpty(shipFrom.ContactAddressCode) && !string.IsNullOrEmpty(shipFrom.ContactAddressLine1) && !string.IsNullOrEmpty(viewTrans.ShipViaCode);


                        viewTrans.IsBillingInformationValid = false;
                        var apContact = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.APContact).FirstOrDefault();
                        var arContact = viewTrans.AppTransactionContacts.Where(z => z.ContactRole == ContactRoleEnum.ARContact).FirstOrDefault();
                        if (shipTo != null && shipFrom != null)
                            viewTrans.IsBillingInformationValid = (!string.IsNullOrEmpty(apContact.CompanyName) && !string.IsNullOrEmpty(apContact.BranchName)) &&
                                 (!string.IsNullOrEmpty(arContact.CompanyName) && !string.IsNullOrEmpty(arContact.BranchName)) &&
                                 !string.IsNullOrEmpty(arContact.ContactAddressCode) && !string.IsNullOrEmpty(arContact.ContactAddressLine1) &&
                                 !string.IsNullOrEmpty(apContact.ContactAddressCode) && !string.IsNullOrEmpty(apContact.ContactAddressLine1) && !string.IsNullOrEmpty(viewTrans.PaymentTermsCode);
                        //MMT-Performance[End]
                        return viewTrans;
                    }

                }

            }


            var trans = await _appTransactionsHeaderRepository.GetAll().Include(a => a.AppTransactionContacts)
                .Include(a => a.AppTransactionDetails).Where(a => a.Id == transactionId).FirstOrDefaultAsync();
            if (trans != null)
            {
                var retTrans = ObjectMapper.Map<GetAppTransactionsForViewDto>(trans);
                retTrans.EnteredDate = trans.EnteredDate;
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
        //MMT37[Start]
        public async Task<List<ContactInformationOutputDto>> GetAccountConnectedContacts(string filter)
        {
            List<ContactInformationOutputDto> output = new List<ContactInformationOutputDto>();
            //var transactionContacts = _appTransactionContactsRepository.GetAll()

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
                            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
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
            return output;
        }
        //public async Task ShareTransaction(long TransactionId, List<> ShareWithUsers)
        //{ }
        //MMT37[End]
        //MMT37[Start]
        public async Task<List<ContactInformationOutputDto>> GetTransactionContacts(long tansactionId, string filter)
        {
            List<ContactInformationOutputDto> output = new List<ContactInformationOutputDto>();
            var transactionContacts = _appTransactionContactsRepository.GetAll()

                .Where(z => z.TransactionId == tansactionId);
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            var contact = from t in transactionContacts
                          join
                          c in _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityExtraData.Where(s => s.AttributeId == 715))
                          .Where(z => z.TenantId == AbpSession.TenantId && z.ParentId != null && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId)
                          on t.ContactSSIN equals c.SSIN into j
                          from e in j.DefaultIfEmpty()
                          select new { contact = e, role = t.ContactRole };


            var contacts = await contact.WhereIf(!string.IsNullOrEmpty(filter), z => z.contact.Name.Contains(filter)).OrderBy(z => z.contact.Id).ToListAsync();
            //var contacts = await _appContactRepository.GetAll().Include(z => z.EntityFk).ThenInclude(z => z.EntityExtraData.Where(s => s.AttributeId == 715))
            //.WhereIf(!string.IsNullOrEmpty(filter), z => z.Name.Contains(filter))
            //.Where(z => z.TenantId == AbpSession.TenantId &&
            //contactLists.Contains(long.Parse(z.Id.ToString())) && z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId).ToListAsync();

            if (contacts != null && contacts.Count() > 0)
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    foreach (var con in contacts)
                    {
                        if (con.contact == null || con.contact.EntityFk.EntityExtraData == null || con.contact.EntityFk.EntityExtraData.Count == 0 || con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue == null)
                            continue;

                        try
                        {
                            var user = UserManager.GetUserById(long.Parse(con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue));
                            if (user != null)
                            {
                                //T-SII-20240329.0013,1 MMT 05/07/2024 - Transactions - Transaction share with(users default list) shouldn't contain the transaction creator in this list and it cannot be added[Start]
                                var userId = long.Parse(con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue);
                                if (userId == AbpSession.UserId)
                                {
                                    continue;
                                }
                                //T-SII-20240329.0013,1 MMT 05/07/2024 - Transactions - Transaction share with(users default list) shouldn't contain the transaction creator in this list and it cannot be added[End]
                                ContactRoleEnum role = (ContactRoleEnum)Enum.Parse(typeof(ContactRoleEnum), con.role);
                                var tenantObj = TenantManager.GetById(int.Parse(user.TenantId.ToString()));
                                if (output.FirstOrDefault(z => z.UserId == long.Parse(con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue)) == null)
                                    output.Add(new ContactInformationOutputDto
                                    {
                                        Id = con.contact.Id,
                                        Email = con.contact.EMailAddress,
                                        Name = con.contact.Name,
                                        UserId = long.Parse(con.contact.EntityFk.EntityExtraData.FirstOrDefault().AttributeValue),
                                        UserImage = user != null && user.ProfilePictureId != null ? Guid.Parse(user.ProfilePictureId.ToString()) : null,
                                        UserName = user.UserName,
                                        TenantId = int.Parse(user.TenantId.ToString()),
                                        TenantName = tenantObj != null ? tenantObj.TenancyName : "SIIWII",
                                        CanBeRemoved = (role == ContactRoleEnum.Creator || role == ContactRoleEnum.Seller || role == ContactRoleEnum.Buyer) ? false : true
                                    });

                            }
                        }
                        catch { }
                    }
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
                var transTenants = transContacts.Join(
                    _appContactRepository.GetAll().Where(z => z.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId && z.TenantId != null && z.PartnerId == null && z.IsProfileData),
                                                      x => x.ContactSSIN, z => z.SSIN,
                                                      (s, sa) => new { TenantId = sa.TenantId, Role = s.ContactRole });

                var transTenantsList = transTenants.ToList();



                var sharedtransactionId = await ShareTransactionOnMarketplace(input.TransactionId);
                if (sharedtransactionId != 0)
                {
                    if (input.TransactionSharing != null && input.TransactionSharing.Count > 0)
                    {
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
                        foreach (var shar in input.TransactionSharing)
                        {

                            TransactionType? tranType = null;
                            try
                            {
                                var user = UserManager.GetUserById(long.Parse(shar.SharedUserId.ToString()));
                                if (user != null)
                                {
                                    var userTenant = transTenantsList.FirstOrDefault(z => z.TenantId == user.TenantId);
                                    if (userTenant != null && userTenant.Role != null)
                                    {
                                        ContactRoleEnum role = (ContactRoleEnum)Enum.Parse(typeof(ContactRoleEnum), userTenant.Role);
                                        if (role != ContactRoleEnum.Creator && role != ContactRoleEnum.SalesRep1 && role != ContactRoleEnum.SalesRep2)
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
                var marketplaceTransaction = await _appMarketplaceTransactionHeadersRepository.GetAll().AsNoTracking().AsNoTracking().Include(z => z.EntityClassifications).Include(z => z.EntityCategories)
                .Include(z => z.AppMarketplaceTransactionDetails).ThenInclude(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(z => z.AppMarketplaceTransactionDetails).ThenInclude(z => z.EntityCategories)
                .Include(z => z.AppMarketplaceTransactionDetails).ThenInclude(z => z.EntityClassifications)
                .Include(z => z.AppMarketplaceTransactionDetails).ThenInclude(z => z.EntityExtraData)
                .Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                .Include(z => z.AppMarketplaceTransactionContacts).AsNoTracking()
                .Include(z => z.EntityExtraData).Where(z => z.Id == marketplaceTransactionId && z.TenantId == null).FirstOrDefaultAsync();
                if (marketplaceTransaction != null)
                {
                    var tenantTransactionObj = await _appTransactionsHeaderRepository.GetAll().AsNoTracking()
                        .Where(z => z.TenantId == tenantId && z.SSIN == marketplaceTransaction.SSIN && z.ObjectId == objectId &&
                        z.EntityObjectTypeCode == (transactionType != null ? (transactionType == TransactionType.SalesOrder ? "SALESORDER" : "PURCHASEORDER") : marketplaceTransaction.EntityObjectTypeCode)).FirstOrDefaultAsync();
                    if (tenantTransactionObj == null)
                    {
                        AppTransactionHeaders tenantTransaction = new AppTransactionHeaders();
                        tenantTransaction = ObjectMapper.Map<AppTransactionHeaders>(marketplaceTransaction);
                        tenantTransaction.TenantOwner = int.Parse(marketplaceTransaction.TenantOwner.ToString());
                        tenantTransaction.TenantId = tenantId;
                        tenantTransaction.Id = 0;
                        tenantTransaction.EnteredDate = marketplaceTransaction.EnteredDate;
                        tenantTransaction.AppTransactionDetails = null;
                        tenantTransaction.AppTransactionContacts = null;
                        tenantTransaction.EntityCategories = null;
                        tenantTransaction.EntityClassifications = null;
                        tenantTransaction.EntityAttachments = null;
                        long soType = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
                        long poType = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
                        if (transactionType == null)
                        {
                            transactionType = marketplaceTransaction.EntityObjectTypeId == soType ? TransactionType.SalesOrder : TransactionType.PurchaseOrder;
                        }
                        //

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

                        returnTran = tenantTransaction.Code;

                        var existingTrand = await _appTransactionsHeaderRepository.GetAll().Where(z => z.TenantId == tenantId && z.Code == tenantTransaction.Code && z.EntityObjectStatusId == null && z.EntityObjectTypeId == tenantTransaction.EntityObjectTypeId).FirstOrDefaultAsync();
                        if (existingTrand != null)
                        {
                            tenantTransaction.Id = existingTrand.Id;
                            CurrentUnitOfWork.GetDbContext<onetouchDbContext>().ChangeTracker.Clear();
                            await _appTransactionsHeaderRepository.UpdateAsync(tenantTransaction);
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }

                        if (marketplaceTransaction.EntityAttachments != null && marketplaceTransaction.EntityAttachments.Count > 0)
                        {
                            tenantTransaction.EntityAttachments = new List<AppEntityAttachment>();
                            foreach (var ext in marketplaceTransaction.EntityAttachments)
                            {
                                var newExt = new AppEntityAttachment();
                                newExt = ObjectMapper.Map<AppEntityAttachment>(ext);
                                newExt.EntityId = tenantTransaction.Id;
                                newExt.Id = 0;
                                newExt.EntityFk = tenantTransaction;
                                newExt.AttachmentFk.TenantId = tenantId;
                                MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId);
                                newExt.AttachmentId = 0;
                                newExt.AttachmentFk.Id = 0;
                                //tenantTransaction.EntityAttachments.Add(newExt);

                            }
                        }

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
                                //tenantTransaction.EntityCategories.Add(catg);
                                _appEntityCategoryRepository.InsertAsync(catg);
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
                                _appEntityClassificationRepository.InsertAsync(catg);
                            }

                        }
                        // var existingTrand = _appTransactionsHeaderRepository.GetAll().Where(z => z.TenantId == tenantId && z.Code == tenantTransaction.Code && z.EntityObjectStatusId == null).FirstOrDefaultAsync();
                        //CurrentUnitOfWork.GetDbContext<onetouchDbContext>().ChangeTracker.Clear();
                        //if (tenantTransaction.Id == 0)
                        //     await _appTransactionsHeaderRepository.InsertAsync(tenantTransaction);
                        // else
                        await _appTransactionsHeaderRepository.UpdateAsync(tenantTransaction);

                        await CurrentUnitOfWork.SaveChangesAsync();
                        //returnId = marketplaceTransaction.Id;
                        //marketplaceTransaction.Code = transaction.SSIN;
                        if (marketplaceTransaction.AppMarketplaceTransactionDetails != null && marketplaceTransaction.AppMarketplaceTransactionDetails.Count > 0)
                        {
                            //marketplaceTransaction.AppMarketplaceTransactionDetails = new List<AppMarketplaceTransactionDetails>();
                            foreach (var det in marketplaceTransaction.AppMarketplaceTransactionDetails)
                            {
                                if (det.ParentId != null)
                                    continue;
                                AppTransactionDetails detail = new AppTransactionDetails();
                                detail = ObjectMapper.Map<AppTransactionDetails>(det);
                                detail.Id = 0;
                                detail.TenantOwner = int.Parse(det.TenantOwner.ToString());
                                detail.TenantId = tenantId;
                                detail.TransactionId = tenantTransaction.Id;
                                detail.TransactionIdFk = tenantTransaction;
                                detail.EntityObjectTypeId = tenantTransaction.EntityObjectTypeId;
                                detail.EntityObjectTypeCode = tenantTransaction.EntityObjectTypeCode;
                                detail.Code = tenantTransaction.TenantId.ToString().TrimEnd() + "-" + tenantTransaction.Code.TrimEnd() + "-" + detail.LineNo.ToString() + "-" + detail.SSIN.TrimEnd();
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
                                        MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId);
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
                                                MoveFile(ext.AttachmentFk.Attachment, detailch.TenantOwner, -1);
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
                        if (marketplaceTransaction.AppMarketplaceTransactionContacts != null && marketplaceTransaction.AppMarketplaceTransactionContacts.Count > 0)
                        {
                            //marketplaceTransaction.AppMarketplaceTransactionContacts = new List<AppMarketplaceTransactionContacts>();
                            foreach (var cont in marketplaceTransaction.AppMarketplaceTransactionContacts)
                            {
                                AppTransactionContacts contact = new AppTransactionContacts();
                                contact = ObjectMapper.Map<AppTransactionContacts>(cont);
                                contact.Id = 0;
                                contact.TransactionId = tenantTransaction.Id;
                                contact.TransactionIdFK = tenantTransaction;
                                await _appTransactionContactsRepository.InsertAsync(contact);
                            }
                        }
                        await CurrentUnitOfWork.SaveChangesAsync();
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

                        await CurrentUnitOfWork.SaveChangesAsync();

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
                                MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId);
                                newExt.AttachmentId = 0;
                                newExt.AttachmentFk.Id = 0;
                                tenantTransactionObj.EntityAttachments.Add(newExt);
                            }
                        }
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
                        await _appTransactionsHeaderRepository.UpdateAsync(tenantTransactionObj);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        //returnId = tenantTransactionObj.Id;
                        await _appTransactionDetails.DeleteAsync(z => z.TransactionId == id && z.ParentId != null);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        await _appTransactionDetails.DeleteAsync(z => z.TransactionId == id && z.ParentId == null);
                        await _appTransactionContactsRepository.DeleteAsync(z => z.TransactionId == id);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        if (marketplaceTransaction.AppMarketplaceTransactionDetails != null && marketplaceTransaction.AppMarketplaceTransactionDetails.Count > 0)
                        {
                            //marketplaceTransaction.AppMarketplaceTransactionDetails = new List<AppMarketplaceTransactionDetails>();
                            foreach (var det in marketplaceTransaction.AppMarketplaceTransactionDetails)
                            {
                                if (det.ParentId != null)
                                    continue;
                                AppTransactionDetails detail = new AppTransactionDetails();
                                detail = ObjectMapper.Map<AppTransactionDetails>(det);
                                detail.Id = 0;
                                detail.TenantOwner = int.Parse(det.TenantOwner.ToString());
                                detail.TenantId = tenantId;
                                detail.TransactionId = tenantTransactionObj.Id;
                                detail.TransactionIdFk = tenantTransactionObj;
                                detail.EntityObjectTypeId = tranType;
                                detail.EntityObjectTypeCode = tranTypeCode;
                                detail.Code = tenantTransactionObj.TenantId.ToString().TrimEnd() + "-" + tenantTransactionObj.Code.TrimEnd() + "-" + detail.LineNo.ToString() + "-" + detail.SSIN.TrimEnd();
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
                                        MoveFile(newExt.AttachmentFk.Attachment, -1, tenantId);
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
                                                MoveFile(ext.AttachmentFk.Attachment, -1, tenantId);
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
                        if (marketplaceTransaction.AppMarketplaceTransactionContacts != null && marketplaceTransaction.AppMarketplaceTransactionContacts.Count > 0)
                        {
                            //marketplaceTransaction.AppMarketplaceTransactionContacts = new List<AppMarketplaceTransactionContacts>();
                            foreach (var cont in marketplaceTransaction.AppMarketplaceTransactionContacts)
                            {
                                AppTransactionContacts contact = new AppTransactionContacts();
                                contact = ObjectMapper.Map<AppTransactionContacts>(cont);
                                contact.Id = 0;
                                contact.TransactionId = tenantTransactionObj.Id;
                                contact.TransactionIdFK = tenantTransactionObj;
                                await _appTransactionContactsRepository.InsertAsync(contact);
                            }
                        }
                        await CurrentUnitOfWork.SaveChangesAsync();
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
                            MoveFile(newExt.AttachmentFk.Attachment, marketplaceTransaction.TenantOwner, -1);
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
                                    MoveFile(newExt.AttachmentFk.Attachment, detail.TenantOwner, -1);
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
                                            MoveFile(ext.AttachmentFk.Attachment, detailch.TenantOwner, -1);
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
                            MoveFile(newExt.AttachmentFk.Attachment, marketplaceTransaction.TenantOwner, -1);
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
                                    MoveFile(newExt.AttachmentFk.Attachment, detail.TenantOwner, -1);
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
                                            MoveFile(ext.AttachmentFk.Attachment, detailch.TenantOwner, -1);
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
    }

}
