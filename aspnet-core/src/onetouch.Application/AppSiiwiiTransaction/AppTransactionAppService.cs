using onetouch.AppSiiwiiTransaction.Dtos;
using onetouch.AppTransactions.Dtos;
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
//using Abp.Collections.Extensions;

namespace onetouch.AppSiiwiiTransaction
{
    public class AppTransactionAppService : onetouchAppServiceBase, IAppTransactionAppService
    {
        private readonly Helper _helper;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<SycSegmentIdentifierDefinition, long> _sycSegmentIdentifierDefinition;
        private readonly IRepository<SycCounter, long> _sycCounter;
        private readonly IRepository<SydObject, long> _sydObjectRepository;
        private readonly IRepository<AppTransactionsHeader, long> _appTransactionsHeaderRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectType;
        public AppTransactionAppService(IRepository<AppTransactionsHeader, long> appTransactionsHeaderRepository,
            IRepository<SydObject, long> sydObjectRepository, IRepository<SycEntityObjectType, long> sycEntityObjectType,
            IRepository<SycCounter, long> sycCounter, IRepository<AppContact, long> appContactRepository,
            IRepository<SycSegmentIdentifierDefinition, long> sycSegmentIdentifierDefinition, Helper helper)
        {
            _appContactRepository= appContactRepository;
            _appTransactionsHeaderRepository = appTransactionsHeaderRepository;
            _sydObjectRepository = sydObjectRepository;
            _sycEntityObjectType = sycEntityObjectType;
            _sycSegmentIdentifierDefinition = sycSegmentIdentifierDefinition;
            _sycCounter = sycCounter;
            _helper = helper;
        }
        public async Task<long> CreateOrEditSalesOrder(CreateOrEditAppTransactionsDto input)
        {
            input.Name = "Sales Order#" + input.Code.TrimEnd();
            input.TenantId = AbpSession.TenantId;
            input.ObjectId = await _helper.SystemTables.GetObjectTransactionId();
            input.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
            input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeSalesOrder();
            var currencyObject =await TenantManager.GetTenantCurrency();
            if (currencyObject != null)
            {
                input.CurrencyId = currencyObject.Value;
                input.CurrencyCode = currencyObject.Code;
            }
            var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == true &
                a.ParentId == null);
            if (account != null)
            {
                input.LanguageId = account.LanguageId;
                input.LanguageCode = account.LanguageCode;
                input.PriceLevel = account.PriceLevel;
            }
            
            return await CreateOrEdit(input);

        }

        public async Task<long> CreateOrEditPurchaseOrder(CreateOrEditAppTransactionsDto input)
        {
            input.TenantId = AbpSession.TenantId;
            input.Name = "Purchase Order#"+input.Code.TrimEnd();
            input.ObjectId = await _helper.SystemTables.GetObjectTransactionId();
            input.EntityObjectStatusId = await _helper.SystemTables.GetEntityObjectStatusDraftTransaction();
            input.EntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypePurchaseOrder();
            var currencyObject = await TenantManager.GetTenantCurrency();
            if (currencyObject != null)
            {
                input.CurrencyId = currencyObject.Value;
                input.CurrencyCode = currencyObject.Code;
            }
            var account = await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == true &
                a.ParentId == null);
            if (account != null)
            {
                input.LanguageId = account.LanguageId;
                input.LanguageCode = account.LanguageCode;
                input.PriceLevel = account.PriceLevel;
            }

            return await CreateOrEdit(input);

        }
        public async Task<long> CreateOrEdit(CreateOrEditAppTransactionsDto input)
        {
            if (input.Id == 0)
            {
                var appTrans = ObjectMapper.Map<AppTransactionsHeader>(input);
                //var  AppTrans = Objmapper. ObjectMapper.Map<CreateOrEditAppTransactionDto,AppTransactionsHeader>(input);
                //ObjectMapper..Map<CreateOrEditAppTransactionDto,AppTransactionsHeader>(input) ;
                var obj = await _appTransactionsHeaderRepository.InsertAsync(appTrans);
                await CurrentUnitOfWork.SaveChangesAsync();
                return obj.Id;

            }
            else {
                var appTrans = ObjectMapper.Map<AppTransactionsHeader>(input);
               var obj =  await _appTransactionsHeaderRepository.UpdateAsync (appTrans);
                await CurrentUnitOfWork.SaveChangesAsync();
                return obj.Id;
            }
            
        }

        public async Task<GetAppTransactionsForViewDto> GetAppTransactionsForView(long transactionId)
        {
            var trans = await _appTransactionsHeaderRepository.GetAll().Include (a=> a.AppTransactionsDetails).Where(a => a.Id == transactionId).FirstOrDefaultAsync ();
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
                var account =await _appContactRepository.GetAll().FirstOrDefaultAsync(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == true &
                a.ParentId ==null );
                if (account != null)
                {
                    returnObject.Id = account.Id;
                    returnObject.Name = account.Name;
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
                                Phone = o.Phone1Number
                            };
            var accounts = await _accounts.ToListAsync();
            return accounts;

        }
    
    public async Task<PagedResultDto<GetAccountInformationOutputDto>> GetRelatedAccounts(GetAllAccountsInput accountFilter)
        {
            List<GetAccountInformationOutputDto> returnObjectList = new List<GetAccountInformationOutputDto>();
            var accountsList = _appContactRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(accountFilter.Filter), a => a.Name.ToLower().Contains(accountFilter.Filter.ToLower()))
                .Where(a => a.TenantId == AbpSession.TenantId & a.IsProfileData == false & a.ParentId == null & a.PartnerId != null);
                

            var pagedAndFilteredAccounts = accountsList.OrderBy(accountFilter.Sorting ?? "name asc")
                   .PageBy(accountFilter);


            var _accounts = from o in pagedAndFilteredAccounts
                            select new GetAccountInformationOutputDto()
                            {
                                Id = o.Id,
                                Name = o.Name
                            };
            var accounts = await _accounts.ToListAsync();
            var totalCount = await accountsList.CountAsync();
            var x = new PagedResultDto<GetAccountInformationOutputDto>(
                totalCount,
                accounts
            );

            return x;

        }
    }
}
