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
using NUglify.Helpers;
using onetouch.Configuration;
using Microsoft.Extensions.Configuration;
using onetouch.AppMarketplaceItems.Dtos;
using System;
//using Abp.Collections.Extensions;

namespace onetouch.AppSiiwiiTransaction
{
    public class AppTransactionAppService : onetouchAppServiceBase, IAppTransactionAppService
    {
        private readonly Helper _helper;
        private readonly IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> _appMarketplaceAccountsPriceLevelsRepository;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<SycSegmentIdentifierDefinition, long> _sycSegmentIdentifierDefinition;
        private readonly IRepository<SycCounter, long> _sycCounter;
        private readonly IRepository<SydObject, long> _sydObjectRepository;
        private readonly IRepository<AppTransactionHeaders, long> _appTransactionsHeaderRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectType;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IRepository<AppTransactionDetails, long> _appTransactionDetails;
        private readonly IRepository<AppMarketplaceItems.AppMarketplaceItems, long> _appMarketplaceItem;
        public AppTransactionAppService(IRepository<AppTransactionHeaders, long> appTransactionsHeaderRepository,
            IRepository<SydObject, long> sydObjectRepository, IRepository<SycEntityObjectType, long> sycEntityObjectType,
            IRepository<SycCounter, long> sycCounter, IRepository<AppContact, long> appContactRepository, IRepository<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels, long> appMarketplaceAccountsPriceLevelsRepository,
            IRepository<SycSegmentIdentifierDefinition, long> sycSegmentIdentifierDefinition, Helper helper, IAppConfigurationAccessor appConfigurationAccessor,
             IRepository<AppMarketplaceItems.AppMarketplaceItems, long> appMarketplaceItem,
            IRepository<AppTransactionDetails, long> appTransactionDetails)
        {
            _appMarketplaceItem = appMarketplaceItem;
            _appContactRepository = appContactRepository;
            _appTransactionsHeaderRepository = appTransactionsHeaderRepository;
            _sydObjectRepository = sydObjectRepository;
            _sycEntityObjectType = sycEntityObjectType;
            _sycSegmentIdentifierDefinition = sycSegmentIdentifierDefinition;
            _sycCounter = sycCounter;
            _helper = helper;
            _appMarketplaceAccountsPriceLevelsRepository = appMarketplaceAccountsPriceLevelsRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appTransactionDetails = appTransactionDetails;
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
        public async Task<long> CreateOrEdit(CreateOrEditAppTransactionsDto input)
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
            input.TenantOwner =long.Parse(AbpSession.TenantId.ToString ());
            input.ObjectId = await _helper.SystemTables.GetObjectTransactionId();
            input.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
            var currencyObject = await TenantManager.GetTenantCurrency();
            if (currencyObject != null)
            {
                input.CurrencyId = currencyObject.Value;
                input.CurrencyCode = currencyObject.Code;
            }
            var priceLevel =await _appMarketplaceAccountsPriceLevelsRepository.GetAll().FirstOrDefaultAsync(a => a.AccountSSIN == input.SellerCompanySSIN && a.ConnectedAccountSSIN == input.BuyerCompanySSIN);
            if (priceLevel != null)
            {
                input.PriceLevel = priceLevel.PriceLevel;
            }
            else { input.PriceLevel = "MSRP"; }

            var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.SSIN== input.SellerCompanySSIN);
            if (account != null)
            {
                input.LanguageId = account.LanguageId;
                input.LanguageCode = account.LanguageCode;
            }

            if (input.Id == 0)
            {
                var appTrans = ObjectMapper.Map<AppTransactionHeaders>(input);
                appTrans.EnteredUserByRole = input.EnteredByUserRole;
                //var  AppTrans = Objmapper. ObjectMapper.Map<CreateOrEditAppTransactionDto,AppTransactionsHeader>(input);
                //ObjectMapper..Map<CreateOrEditAppTransactionDto,AppTransactionsHeader>(input) ;
                var obj = await _appTransactionsHeaderRepository.InsertAsync(appTrans);
                await CurrentUnitOfWork.SaveChangesAsync();
                return obj.Id;

            }
            else {
                var appTrans = ObjectMapper.Map<AppTransactionHeaders>(input);
                appTrans.EnteredUserByRole = input.EnteredByUserRole;
                var obj =  await _appTransactionsHeaderRepository.UpdateAsync (appTrans);
                await CurrentUnitOfWork.SaveChangesAsync();
                return obj.Id;
            }
            
        }

        public async Task<GetAppTransactionsForViewDto> GetAppTransactionsForView(long transactionId)
        {
            var trans = await _appTransactionsHeaderRepository.GetAll().Include (a=> a.AppTransactionDetails).Where(a => a.Id == transactionId).FirstOrDefaultAsync ();
            if (trans != null)
            {
               return  ObjectMapper.Map<GetAppTransactionsForViewDto>(trans);
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
                var objectRec = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code ==(tranType =="SO" ? "SALESORDER": "PURCHASEORDER"));
                if (objectRec != null)
                {
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

                return returnString;
            }
        }
        
        public async Task<GetAccountInformationOutputDto> GetCurrentTenantAccountProfileInformation()
            {
                GetAccountInformationOutputDto returnObject = new GetAccountInformationOutputDto();
                var account =await _appContactRepository.GetAll().Include(a => a.CurrencyFk).ThenInclude(z => z.EntityExtraData).FirstOrDefaultAsync(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == true &
                a.ParentId ==null );
                if (account != null)
                {
                    returnObject.Id = account.Id;
                    returnObject.Name = account.Name;
                    returnObject.AccountSSIN = account.SSIN;
                    returnObject.CurrencyCode =  new CurrencyInfoDto
                {
                    Code = account.CurrencyCode,
                    Value = (long)account.CurrencyId,
                    Label = account.CurrencyFk.Name,
                    Symbol = (account.CurrencyFk != null && account.CurrencyFk.EntityExtraData != null) &&
                            account.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41) != null ?
                            account.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : ""
                };
                }
                return returnObject;

            }
        public async Task<List<GetContactInformationDto>> GetAccountRelatedContacts(long accountId,string filter)
        {
            var presonEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePersonId();
            List<GetContactInformationDto> returnObjectList = new List<GetContactInformationDto>();
            var accountsList = _appContactRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(filter), a => a.Name.ToLower().Contains(filter.ToLower()))
                .Where(a => a.TenantId == AbpSession.TenantId & a.ParentId != null 
                & a.AccountId == accountId & a.EntityFk.EntityObjectTypeId == presonEntityObjectTypeId);


            var pagedAndFilteredAccounts = accountsList.OrderBy("name asc");


            var _accounts = from o in pagedAndFilteredAccounts
                            select new GetContactInformationDto()
                            {
                                Id = o.Id,
                                Name = o.Name,
                                Email = o.EMailAddress,
                                Phone = o.Phone1Number,
                                SSIN =o.SSIN
                            };
            var accounts = await _accounts.ToListAsync();
            return accounts;

        }
        public async Task<PagedResultDto<GetAccountInformationOutputDto>> GetRelatedAccounts(GetAllAccountsInput accountFilter)
        {
            List<GetAccountInformationOutputDto> returnObjectList = new List<GetAccountInformationOutputDto>();
            var accountsList = _appContactRepository.GetAll().Include(a=>a.CurrencyFk).ThenInclude(z=>z.EntityExtraData)
                .WhereIf(!string.IsNullOrEmpty(accountFilter.Filter), a => a.Name.ToLower().Contains(accountFilter.Filter.ToLower()))
                .Where(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == false & a.ParentId == null & a.PartnerId != null);
                

            var pagedAndFilteredAccounts = accountsList.OrderBy(accountFilter.Sorting ?? "name asc")
                   .PageBy(accountFilter);


            var _accounts = from o in pagedAndFilteredAccounts
                            select new GetAccountInformationOutputDto()
                            {
                                Id = o.Id,
                                Name = o.Name, 
                                CurrencyCode = new CurrencyInfoDto {Code = o.CurrencyCode, Value = (long)o.CurrencyId ,Label=o.CurrencyFk.Name,
                                Symbol = (o.CurrencyFk !=null && o.CurrencyFk.EntityExtraData!=null) &&
                                o.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41) != null ?
                                o.CurrencyFk.EntityExtraData.FirstOrDefault(x => x.AttributeId == 41).AttributeValue : "" } ,
                                AccountSSIN = o.SSIN
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

            var filteredAppTransactions = _appTransactionsHeaderRepository.GetAll()
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
            
            return new PagedResultDto<GetAllAppTransactionsForViewDto>(
                totalCount,
                appTrans
            );
        }
        public async Task AddTransactionDetails(GetAppMarketplaceItemDetailForViewDto input, long transactionId)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var header = await _appTransactionsHeaderRepository.GetAll().AsNoTracking().FirstOrDefaultAsync(a => a.Id == transactionId);
                double colorQty = 0;
                decimal colorAmt = 0;
                AppTransactionDetails detParent = null;
                var lastLine = await _appTransactionDetails.GetAll().AsNoTracking().Where(s => s.TransactionId == transactionId).Select(a => a.LineNo).DefaultIfEmpty().MaxAsync();
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
                        var marketplaceItemMain = await _appMarketplaceItem.GetAll().AsNoTracking().Include(x => x.EntityCategories).Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                            .Include(a => a.EntityClassifications)
                                        .Include(a => a.EntityExtraData).FirstOrDefaultAsync(a => a.SSIN == input.AppItem.Code);
                        if (marketplaceItemMain != null)
                        {

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
                            detParent.TransactionId = transactionId;
                            lastLine++;
                            detParent.LineNo = lastLine;
                            detParent.TenantOwner = int.Parse(AbpSession.TenantId.ToString());
                            detParent.TenantId = int.Parse(AbpSession.TenantId.ToString());
                            detParent.TransactionCode = header.Code;
                            detParent.EntityObjectTypeId = header.EntityObjectTypeId;
                            detParent.EntityObjectTypeCode = header.EntityObjectTypeCode;
                            detParent.Note = "";
                            detParent.ItemCode = marketplaceItemMain.Code;
                            detParent.Code = header.Code.TrimEnd() + "-" + detParent.LineNo.ToString() + "-" + detParent.Code.TrimEnd();
                            detParent.Notes = string.IsNullOrEmpty(marketplaceItemMain.Notes) ? "" : marketplaceItemMain.Notes;
                            detParent.ParentId = null;
                            detParent.EntityExtraData.ForEach(d => d.Id = 0);
                            detParent.EntityExtraData.ForEach(d => d.EntityFk = null);
                            detParent.EntityExtraData.ForEach(d => d.EntityCode = detParent.Code);
                            detParent.EntityExtraData.ForEach(d => d.EntityId = 0);
                            detParent.EntityAttachments.ForEach(d => d.Id = 0);
                            detParent.EntityAttachments.ForEach(d => d.EntityId = 0);
                            detParent.EntityAttachments.ForEach(d => d.EntityCode = detParent.Code);
                            detParent.EntityAttachments.ForEach(d => d.EntityFk = null);
                            detParent.EntityCategories.ForEach(d => d.Id = 0);
                            detParent.EntityCategories.ForEach(d => d.EntityFk = null);
                            detParent.EntityCategories.ForEach(d => d.EntityCode = detParent.Code);
                            detParent.EntityCategories.ForEach(d => d.EntityId = 0);
                            detParent.EntityClassifications.ForEach(d => d.EntityId = 0);
                            detParent.EntityClassifications.ForEach(d => d.EntityFk = null);
                            detParent.EntityClassifications.ForEach(d => d.EntityCode = detParent.Code);
                            detParent.EntityClassifications.ForEach(d => d.Id = 0);
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
                            detParent = await _appTransactionDetails .InsertAsync(detParent);
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
                                        det.TransactionId = transactionId;
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
                                        det.Code = header.Code.TrimEnd() + "-" + det.LineNo.ToString() + "-" + det.Code.TrimEnd();
                                        det.Notes = string.IsNullOrEmpty(marketplaceItem.Notes) ? "" : marketplaceItem.Notes;
                                        // det.EntityExtraData.ForEach(d => d.Id = 0);
                                        // det.EntityExtraData.ForEach(d=> d.EntityId = 0);
                                        //det.EntityExtraData.ForEach(d => d.EntityFk  = null);
                                        det.EntityExtraData.ForEach(d => d.EntityCode = marketplaceItem.Code);
                                        det.EntityExtraData.ForEach(d => d.Id = 0);
                                        det.EntityExtraData.ForEach(d => d.EntityFk = null);
                                        det.EntityExtraData.ForEach(d => d.EntityCode = det.Code);
                                        det.EntityExtraData.ForEach(d => d.EntityId = 0);
                                        det.EntityAttachments.ForEach(d => d.Id = 0);
                                        det.EntityAttachments.ForEach(d => d.EntityId = 0);
                                        det.EntityAttachments.ForEach(d => d.EntityCode = det.Code);
                                        det.EntityAttachments.ForEach(d => d.EntityFk = null);
                                        det.EntityCategories.ForEach(d => d.Id = 0);
                                        det.EntityCategories.ForEach(d => d.EntityFk = null);
                                        det.EntityCategories.ForEach(d => d.EntityCode = detParent.Code);
                                        det.EntityCategories.ForEach(d => d.EntityId = 0);
                                        det.EntityClassifications.ForEach(d => d.EntityId = 0);
                                        det.EntityClassifications.ForEach(d => d.EntityFk = null);
                                        det.EntityClassifications.ForEach(d => d.EntityCode = detParent.Code);
                                        det.EntityClassifications.ForEach(d => d.Id = 0);
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
                                        //colorQty += det.Quantity;
                                        //colorAmt += det.Amount;
                                        det.ParentId = detParent.Id;
                                        detParent.ParentFkList.Add(det);
                                        //det = await _appTransactionDetailsRepository.InsertAsync(det);

                                    }

                                }
                            }
                        }
                    }

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


    }

}
