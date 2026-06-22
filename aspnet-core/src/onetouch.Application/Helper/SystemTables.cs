using Abp.Domain.Repositories;
using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Twilio.TwiML.Voice;
using Abp.Domain.Uow;
using System.Linq;
using onetouch.SycCounters;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.AppEntities.Dtos;
using onetouch.SycCurrencyExchangeRates;
using onetouch.SycIdentifierDefinitions;
using onetouch.AppEntities;
using Microsoft.EntityFrameworkCore;
using onetouch.SycSegmentIdentifierDefinitions.Dtos;
using Abp.Authorization;

namespace onetouch.Helpers
{
    public class SystemTables: onetouchAppServiceBase
    {
        private readonly IRepository<SydObject, long> _sydObjectRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectType;
        private readonly IRepository<SycAttachmentCategory, long> _sycAttachmentCategory;
        private readonly IRepository<SycEntityObjectClassification, long> _SycEntityObjectClassifications;
        private readonly IRepository<SycEntityObjectStatus, long> _sycEntityObjectStatus;
        //MMT30[Start]
        private readonly IRepository<SycIdentifierDefinition, long> _sycIdentifierDefinition;
        private readonly IRepository<SycSegmentIdentifierDefinition, long> _sycSegmentIdentifierDefinition;
        private readonly IRepository<SycCounter, long> _sycCounter;
        private readonly IRepository<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates, long> _sycCurrencyExchangeRate;
        //MMT30[End]
        //MMT40[Start]
        private readonly ISycIdentifierDefinitionsAppService _iAppSycIdentifierDefinitionsService;
        //MMT40[End]
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        public SystemTables(IRepository<SydObject, long> sydObjectRepository, IRepository<SycEntityObjectType, long> sycEntityObjectType,
            
            IRepository<SycAttachmentCategory, long> sycAttachmentCategory, IRepository<SycEntityObjectClassification, long> SycEntityObjectClassifications,
           
            IRepository<SycEntityObjectStatus, long> sycEntityObjectStatus, IRepository<SycCounter, long> sycCounter, IRepository<SycIdentifierDefinition, long> sycIdentifierDefinitions,
            IRepository<SycSegmentIdentifierDefinition, long> sycSegmentIdentifierDefinition,
            IRepository<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates, long> sycCurrencyExchangeRate, IRepository<AppEntity, long> appEntityRepository,
            ISycIdentifierDefinitionsAppService iAppSycIdentifierDefinitionsService)
        {
            _appEntityRepository = appEntityRepository;
            _sydObjectRepository = sydObjectRepository;
            _sycEntityObjectType = sycEntityObjectType;
            _sycAttachmentCategory = sycAttachmentCategory;
            _SycEntityObjectClassifications = SycEntityObjectClassifications;
            _sycEntityObjectStatus = sycEntityObjectStatus;
            //MMT30[Start]
            _sycIdentifierDefinition = sycIdentifierDefinitions;
            _sycCounter = sycCounter;
            _sycCurrencyExchangeRate = sycCurrencyExchangeRate;
            _sycSegmentIdentifierDefinition = sycSegmentIdentifierDefinition;
            //MMT30[End]
            _appEntityRepository = appEntityRepository;
            //MMT40[Start]
            _iAppSycIdentifierDefinitionsService = iAppSycIdentifierDefinitionsService;
            //MMT40[End]
        }
        [AbpAllowAnonymous]
        public async Task< long> GetObjectContactId()
        {
            var obj =  await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "CONTACT");
            return obj.Id;
        }
        public async Task<long> GetObjectAdvertisementId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "ADVERTISEMENT");
            return obj.Id;
        }
        //Mariam[Start]
        public async Task<long> GetObjectUserId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "USER");
            return obj.Id;
        }
        //Mariam[End]
        //public async Task<long> GetObjectPersonId()
        //{
        //    var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "PERSON");
        //    return obj.Id;
        //}
        [AbpAllowAnonymous]
        public async Task<long> GetObjectEventId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "EVENT");
            return obj.Id;
        }

        public async Task<long> GetObjectEventGuestId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "EVENTGUEST");
            return obj.Id;
        }
        [AbpAllowAnonymous]
        public async Task<long> GetObjectPostId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "O001");
            return obj.Id;
        }
        public async Task<long> GetObjectItemId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "ITEM");
            return obj.Id;
        }
        //MMT -I43
        public async Task<long> GetEntityObjectTypeFeatureId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "STANDARDFEATURE");
            return obj.Id;
        }

        //Iteration 49
        public async Task<long> GetEntityObjectTypeTenantId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "TENANT");
            return obj.Id;
        }
        public async Task<long> GetEntityObjectTypeHostId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "HOST");
            return obj.Id;
        }
        public async Task<long> GetObjectStandardFeatureId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "STANDARDFEATURE");
            return obj.Id;
        }
        //public async Task<long> GetObjectActivityLogId()
        //{
        //    var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "TENANTACTIVITYLOG");
        //    return obj.Id;
        //}
        public async Task<long> GetObjectStandardSubscriptionPlanId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "STANDARDSUBSCRIPTIONPLAN");
            return obj.Id;
        }
        public async Task<SycEntityObjectType> GetObjectStandardSubscriptionPlan()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "STANDARDSUBSCRIPTIONPLAN");
            return obj;
        }
        public async Task<SycEntityObjectType> GetEntityObjectTypeFeature()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "STANDARDFEATURE");
            return obj;
        }

        public async Task<SycEntityObjectType> GetEntityObjectTypeById(long id)
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Id == id);
            return obj;
        }

        public async Task<long> GetObjectTenantActivityLogId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "TENANTACTIVITYLOG");
            return obj.Id;
        }
        public async Task<SycEntityObjectType> GetEntityObjectTypeActLog()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "TENANTACTIVITYLOG");
            return obj;
        }
        //MMT -I43
        [AbpAllowAnonymous]
        public async Task<long> GetObjectListingId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "LISTING");
            return obj.Id;
        }


        public async Task<long> GetObjectItemDataId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "ITEM-DATA");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeParetnerId()
        {
            //var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PARTNER");
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "BUSINESS");
            return obj.Id;
        }

        public async Task<SycEntityObjectType> GetEntityObjectTypeParetner()
        {   
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "BUSINESS");
            return obj;
        }

        public async Task<SycEntityObjectType> GetEntityObjectTypeManual()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "MANUALACCOUNT");
            return obj;
        }
        
        public async Task<long> GetEntityObjectTypeAdvertisementId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "ADVERTISEMENT");
            return obj.Id;
        }
        public async Task<long> GetEntityObjectTypeName(string TypeName)
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code.ToUpper() == TypeName.ToUpper());
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypePersonId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PERSONAL");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypePostId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "POST");
            return obj.Id;
        }
        
        //Mariam[Start]
        public async Task<long> GetEntityObjectTypeUserId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "USER");
            return obj.Id;
        }
        //Mariam[End]
        public async Task<long> GetEntityObjectTypePostTypeId(string type)
        {
            long parentId = await GetEntityObjectTypePostId();
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == type && x.ParentId== parentId);
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeId(string type, bool parnet)
        {
            //var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == type);
            var obj = _sycEntityObjectType.GetAll().Where(x => x.Code == type).OrderBy(e => e.Id).FirstOrDefault();
            if (parnet && obj !=null && obj.Id > 0)
            { //var objChild = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == type && x.ParentId == obj.Id);
                var objChild = _sycEntityObjectType.GetAll().Where(x => x.Code == type && x.ParentId == obj.Id).OrderBy(e => e.Id).FirstOrDefault();
                if (objChild != null && objChild.Id > 0)
                {
                    return objChild.Id;

                }

            }
            return obj.Id;
        }

        public async Task<string> GetEntityObjectTypePersonCode()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PERSONAL");
            return obj.Code;
        }

        public async Task<string> GetEntityObjectTypePersonName()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PERSONAL");
            return obj.Name;
        }

        public async Task<long[]> GetEntityObjectTypeItemIds()
        {
            var getObjectItemId = await GetObjectItemId();
            var objIds = _sycEntityObjectType.GetAll()
                .Where(x => x.ParentId == null && x.ObjectId == getObjectItemId)
                .Select(x => x.Id).ToArray();
            return objIds;
        }
        public async Task<long> GetEntityObjectTypeProductId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PRODUCT");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypePhoneId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PHONE-TYPE");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeCurrencyId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "CURRENCY");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeTitleId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "TITLE");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeCountryId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "COUNTRY");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeAccountTypeId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "ACCOUNT-TYPE");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeLanguageId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "LANGUAGE");
            return obj.Id;
        }
        //MMT-43
        public async Task<long> GetEntityObjectTypeUOMId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "UOM");
            return obj.Id;
        }
        public async Task<long> GetEntityObjectTypeFeatureCategoryId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "FEATURECAT");
            return obj.Id;
        }
        //MMT-43
        public async Task<long> GetObjectLookupId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "LOOKUP");
            return obj.Id;
        }

        //public async Task<long> GetAttachmentCategoryAccountId()
        //{
        //    var obj = await _sycAttachmentCategory.FirstOrDefaultAsync(x => x.Code == "1");
        //    return obj.Id;
        //}
        [AbpAllowAnonymous]
        public async Task<long> GetAttachmentCategoryLogoId()
        {
            var obj = await _sycAttachmentCategory.FirstOrDefaultAsync(x => x.Code == "LOGO");
            return obj.Id;
        }
        [AbpAllowAnonymous]
        public async Task<long> GetAttachmentCategoryId(string code)
        {   if (!string.IsNullOrEmpty(code))
            {
                var obj = await _sycAttachmentCategory.FirstOrDefaultAsync(x => x.Code == code);
                return obj.Id;
            }
            return 0;
        }

        public async Task<long> GetAttachmentCategoryCoverId()
        {
            var obj = await _sycAttachmentCategory.FirstOrDefaultAsync(x => x.Code == "BANNER");
            return obj.Id;
        }

        //Esraa [Start]
        public async Task<long> GetEntityObjectClassificationsLableID()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _SycEntityObjectClassifications.FirstOrDefaultAsync(x => x.Code == "LABELS");
                return obj.Id;
            }
        }


        public async Task<long> GetsydObjectMessageID()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "MESSAGE-DATA");
            return obj.Id;
        }
        public async Task<long> GetEntityObjectTypeComment()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "COMMENT");
            return obj.Id;
        }
        //I40-X527[Start]
        public async Task<long> GetEntityObjectTypeReview()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "REVIEW");
            return obj.Id;
        }
        //I40-X527[End]
        public async Task<long> GetEntityObjectTypeMessageID()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "MESSAGE");
            return obj.Id;
        }

     
        //I48[Start]
        public async Task<long> GetEntityObjectTypeQuestion()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "QUESTION");
            return obj.Id;
        }
        //I48[End]


        public async Task<long> GetEntityObjectStatusUnreadMessageID()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "UNREAD" && x.ObjectCode == "MESSAGE");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectStatusReadMessageID()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "READ" && x.ObjectCode == "MESSAGE");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectStatusSentMessageID()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "SENT" && x.ObjectCode == "MESSAGE");
                return obj.Id;
            }
        }
        public async Task<long> GetEntityObjectClassificationStarredMessageID()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _SycEntityObjectClassifications.FirstOrDefaultAsync(x => x.Code == "STARRED" && x.ObjectCode == "MESSAGE");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectStatusArchivedMessageID()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "ARCHIEVED" && x.ObjectCode == "MESSAGE");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectStatusDeletedMessageID()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "DELETED" && x.ObjectCode == "MESSAGE");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectStatusDraftMessageID()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "DRAFT" && x.ObjectCode == "MESSAGE");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectStatusItemActive()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "ACTIVE" && x.ObjectCode == "ITEM");
                return obj.Id;
            }
        }
        //MMT10
        [AbpAllowAnonymous]
        public async Task<long> GetEntityObjectStatusContactCancelled()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "CANCELLED" && x.ObjectCode == "CONTACT");
                return obj.Id;
            }
        }
        //MMT10
        public async Task<long> GetEntityObjectStatusEventDefault()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.IsDefault==true && x.ObjectCode == "EVENT");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectStatusItemDraft()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "DRAFT" && x.ObjectCode== "ITEM");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectTypeAddressTypeId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "ADDRESS-TYPE");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeLandingPageTypeAttributeId()
        {
            return 1001;
        }
        public async Task<long> GetEntityObjectTypeLandingPageCodeAttributeId()
        {
            return 1002;
        }
        public async Task<long> GetEntityObjectTypeLandingPageTitleAttributeId()
        {
            return 1003;
        }
        public async Task<long> GetEntityObjectTypeLandingPageDescriptionAttributeId()
        {
            return 1004;
        }
        public async Task<long> GetEntityObjectTypeLandingPageOrderAttributeId()
        {
            return 1005;
        }
        public async Task<long> GetEntityObjectTypeLandingPageLinkUrlAttributeId()
        {
            return 1006;
        }


        public async Task<long> GetEntityObjectTypeLandingPageTypeId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "LANDINGPAGETYPES");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeLandingPageSettings()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "LANDINGPAGESETTINGS");
            return obj.Id;
        }
        //MMT

        public async Task<long> GetEntityObjectTypeSizeScale()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "SIZESCALE");
            return obj.Id;
        }
        public async Task<long> GetEntityObjectTypeARInvoice()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "ARINVOICE");
            return obj.Id;
        }
        public async Task<long> GetObjectScaleId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "SCALE");
            return obj.Id;
        }
        //MMT33-3[Start]
        public decimal GetExchangeRate(string fromCurrencyCode,string toCurrencyCode)
        { 
            decimal returnVal = 0;
            onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates sourceCurrency = null;
            if (fromCurrencyCode != "USD")
            {
                sourceCurrency = _sycCurrencyExchangeRate.GetAll().FirstOrDefault(x => x.CurrencyCode == fromCurrencyCode);
                if (sourceCurrency !=null && sourceCurrency.ExchangeRate != 0)
                returnVal = 1 / sourceCurrency.ExchangeRate;
            }
            var toCurrency = _sycCurrencyExchangeRate.GetAll().FirstOrDefault(x => x.CurrencyCode == toCurrencyCode);
            if (toCurrency != null)
            {
                if (fromCurrencyCode == "USD")
                    return toCurrency.ExchangeRate;
                else
                {
                    returnVal *= toCurrency.ExchangeRate;
                }
            }
            return returnVal;
        }
        //MMT33-3[End]
        //MMT30[Start]
        public async Task<string> GenerateSSIN(long objectTypeId, AppEntityDto appEntity = null)
        {
            //I45
            if (appEntity!=null)
            {
                if (appEntity.TenantId == null)
                    appEntity.TenantId = AbpSession.TenantId;
            }
            //I45
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                string returnString = "";
                var objectRec = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Id == objectTypeId);
                if (objectRec != null)
                {
                    var ssinId = objectRec.SSINIdentifierId;
                    //var ssinId = long.Parse(objectRec.ParentCode);
                    if (ssinId != null)
                    {
                        var identifierHeader = _sycIdentifierDefinition.GetAll().FirstOrDefault(z=>z.Id== ssinId);
                        
                        var sycSegmentIdentifierDefinitions = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == ssinId).OrderBy(x => x.SegmentNumber).ToList();
                        if (sycSegmentIdentifierDefinitions != null && sycSegmentIdentifierDefinitions.Count > 0)
                        {
                            foreach (var segment in sycSegmentIdentifierDefinitions)
                            {
                                if (segment.IsAutoGenerated && segment.SegmentType == "Sequence")
                                {
                                    SycCounter sycCounter = null;
                                    if (identifierHeader != null && identifierHeader.IsTenantLevel)
                                        sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == (appEntity != null? appEntity.TenantId : AbpSession.TenantId)).FirstOrDefault();
                                    else
                                        sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == null).FirstOrDefault();

                                    if (appEntity != null && appEntity.IsHostRecord == true)
                                    { sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == null).FirstOrDefault(); }

                                    if (sycCounter == null)
                                    {
                                        sycCounter = new SycCounter();
                                        sycCounter.SycSegmentIdentifierDefinitionId = segment.Id;
                                        sycCounter.Counter = segment.CodeStartingValue + 1;
                                        if (appEntity != null && appEntity.IsHostRecord == true)
                                        { //sycCounter.TenantId = -1;
                                          
                                        }
                                        else
                                        {
                                            if (identifierHeader != null && identifierHeader.IsTenantLevel && (appEntity != null ? appEntity.TenantId : AbpSession.TenantId) != null)
                                            {
                                                sycCounter.TenantId = (int?)(appEntity != null ? appEntity.TenantId : AbpSession.TenantId);
                                            }
                                            else
                                                sycCounter.TenantId = null;

                                        }
                                        await _sycCounter.InsertAsync(sycCounter);
                                        await CurrentUnitOfWork.SaveChangesAsync();
                                        returnString = string.IsNullOrEmpty(returnString)? returnString: returnString+"-";
                                        if (segment.SegmentLength > 0)
                                        { returnString += segment.CodeStartingValue.ToString().Trim().PadLeft(segment.SegmentLength, '0'); }
                                    }
                                    else
                                    {
                                        returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                        if (segment.SegmentLength > 0)
                                        { returnString += sycCounter.Counter.ToString().Trim().PadLeft(segment.SegmentLength, '0'); }

                                        sycCounter.Counter += 1;
                                        await _sycCounter.UpdateAsync(sycCounter);
                                        await CurrentUnitOfWork.SaveChangesAsync();

                                    }
                                }
                                else
                                {
                                    if (segment.SegmentType == "Field")
                                    {
                                        if (segment.LookOrFieldName.ToUpper() == "TENANTID")
                                        {
                                            returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";

                                            string _segmentValue = (appEntity != null ? appEntity.TenantId.ToString() : AbpSession.TenantId.ToString());
                                            if (segment.SegmentLength > 0)
                                            { _segmentValue = _segmentValue.PadLeft(segment.SegmentLength, '0'); }
                                            returnString += _segmentValue;

                                            //returnString += AbpSession.TenantId.ToString().PadLeft(segment.SegmentLength, '0');
                                        }
                                        else
                                        {
                                            if (appEntity != null)
                                            {
                                                var prop = appEntity.GetType().GetProperty(segment.LookOrFieldName);
                                                if (prop != null)
                                                {
                                                    returnString = string.IsNullOrEmpty(returnString) ? returnString : returnString + "-";
                                                    string _segmentFieldValue = prop.GetValue(appEntity).ToString();
                                                    if (segment.SegmentLength > 0)
                                                    { _segmentFieldValue = _segmentFieldValue.PadLeft(segment.SegmentLength, '0'); }
                                                    returnString += _segmentFieldValue;

                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                //MMT
                if (appEntity != null)
                {
                    var appEntityObj = await _appEntityRepository.GetAll().Where(x => x.SSIN.Contains(returnString) && x.TenantId == appEntity.TenantId && x.ObjectId == appEntity.ObjectId).FirstOrDefaultAsync();
                    if (appEntityObj != null)
                        returnString = await this.GenerateSSIN(objectTypeId, appEntity);
                }
                //MMT
                return returnString;
            }
    
        }
        // MMT30[End]
        //MMT33[Start]
        public async Task<long> GetEntityObjectStatusDraftTransaction()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "DRAFT" && x.ObjectCode == "TRANSACTION");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectCharges()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "CHARGES" && x.ObjectCode == "ITEM");
                return obj.Id;
            }
        }

        public async Task<long> GetEntityObjectStatusActiveTransaction()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "ACTIVE" && x.ObjectCode == "TRANSACTION");
                return obj.Id;
            }
        }
        public async Task<long> GetEntityObjectStatusOpenTransaction()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "OPEN" && x.ObjectCode == "TRANSACTION");
                return obj.Id;
            }
        }
        public async Task<long> GetEntityObjectStatusCancelledTransaction()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "CANCELLED" && x.ObjectCode == "TRANSACTION");
                return obj.Id;
            }
        }
        [AbpAllowAnonymous]
        public async Task<long> GetEntityObjectTypeSalesOrder()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "SALESORDER");
            return obj.Id;
        }
        [AbpAllowAnonymous]
        public async Task<long> GetEntityObjectTypePurchaseOrder()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PURCHASEORDER");
            return obj.Id;
        }
        public async Task<long> GetObjectTransactionId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "TRANSACTION");
            return obj.Id;
        }
        //MMT33[End]
        //MMT-Entity log[Start]
        public async Task<long> GetEntityObjectStatusSentEntityLog()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "SENT" && x.ObjectCode == "TRANSACTION");
                return obj.Id;
            }
        }
        public async Task<long> GetEntityObjectStatusReadyToSendEntityLog()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "READYTOBESENT" && x.ObjectCode == "TRANSACTION");
                return obj.Id;
            }
        }
        //MMT-Entity log [End]
        //MMT40[Start]
        
        public async Task<long> GetEntityObjectTypeMarketplaceRelationship()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectType.GetAll().FirstOrDefaultAsync(z=>z.Code== "MARKETPLACECONTACTRELATIONSHIP");
                return obj.Id;
            }
        }
        public async Task<long> GetEntityObjectStatusRelationshipPending()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "PENDING" && x.ObjectCode == "MARKETPLACECONTACTRELATIONSHIP");
                return obj.Id;
            }
        }
        [AbpAllowAnonymous]
        public async Task<long> GetEntityObjectStatusRelationshipActive()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "ACTIVE" && x.ObjectCode == "MARKETPLACECONTACTRELATIONSHIP");
                return obj.Id;
            }
        }
        public async Task<long> GetEntityObjectStatusRelationshipInActive()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "INACTIVE" && x.ObjectCode == "MARKETPLACECONTACTRELATIONSHIP");
                return obj.Id;
            }
        }
        public async Task<long> GetObjectMarketplaceContactRelationshipId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "MARKETPLACECONTACTRELATIONSHIP");
            return obj.Id;
        }
        public async Task<string> GetNextSequence(string sydbjectCode)
        {
            string returnCode = "";
            var sydobject = _sydObjectRepository.FirstOrDefault(x => x.Code == sydbjectCode);
            if (sydobject != null)
            {
                var identifierId = sydobject.SycDefaultIdentifierId;
                if (identifierId != null)
                {
                    var identifierDef = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionForView(long.Parse(identifierId.ToString()));
                    if (identifierDef != null)
                    {
                        var sycSegmentIdentifierDefinitions = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == identifierId).ToList();
                        var sycSegmentIdentifierDefinitionList = ObjectMapper.Map<List<SycSegmentIdentifierDefinitionDto>>(sycSegmentIdentifierDefinitions);
                        var productCodeSegment = sycSegmentIdentifierDefinitionList.FirstOrDefault(z => z.SegmentNumber == 1);
                        returnCode = await GetNextSegment(productCodeSegment, identifierDef.SycIdentifierDefinition.IsTenantLevel);
                    }
                }
                else
                {
                    using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                    {
                        var entityObjectType = _sycEntityObjectType.FirstOrDefault(x => x.Code == sydbjectCode);
                        if (entityObjectType != null)
                        {
                            identifierId = entityObjectType.SycIdentifierDefinitionId;
                            if (identifierId != null)
                            {
                                var identifierDef = await _iAppSycIdentifierDefinitionsService.GetSycIdentifierDefinitionForView(long.Parse(identifierId.ToString()));
                                if (identifierDef != null)
                                {
                                    var sycSegmentIdentifierDefinitions = _sycSegmentIdentifierDefinition.GetAll().Where(e => e.SycIdentifierDefinitionId == identifierId).ToList();
                                    var sycSegmentIdentifierDefinitionList = ObjectMapper.Map<List<SycSegmentIdentifierDefinitionDto>>(sycSegmentIdentifierDefinitions);
                                    var productCodeSegment = sycSegmentIdentifierDefinitionList.FirstOrDefault(z => z.SegmentNumber == 1);
                                    returnCode = await GetNextSegment(productCodeSegment, identifierDef.SycIdentifierDefinition.IsTenantLevel);
                                }
                            }
                        }
                    }
                }
            }
            return returnCode;
        }
        public async Task<string> GetNextSegment(SycSegmentIdentifierDefinitionDto segment,bool istenantLevel) 
        {
            long? tenantId = istenantLevel ? AbpSession.TenantId : null;
            string returnString = "";
            if (segment.IsAutoGenerated & (segment.SegmentType == "Sequence" || segment.SegmentType == "String"))
            {
                var sycCounter = _sycCounter.GetAll().Where(e => e.SycSegmentIdentifierDefinitionId == segment.Id && e.TenantId == tenantId).FirstOrDefault();
                if (sycCounter == null)
                {
                    if (true)
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
                    }
                    returnString = segment.CodeStartingValue.ToString().Trim().PadLeft(segment.SegmentLength, '0');
                }
                else
                {
                    returnString = sycCounter.Counter.ToString().Trim().PadLeft(segment.SegmentLength, '0');
                    if (true)
                    {
                        sycCounter.Counter += 1;
                        await _sycCounter.UpdateAsync(sycCounter);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }
            }
            return returnString;
        }
        public async Task<long> GetEntityObjectTypeGroupId()
        {
            //var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PARTNER");
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "GROUP");
            return obj.Id;
        }
        public async Task<long> GetEntityObjectTypeBranchId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "BRANCH");
            return obj.Id;
        }
        public async Task<string> GetEntityObjectTypeBranchCode()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "BRANCH");
            return obj.Code;
        }
        public async Task<SycEntityObjectType> GetEntityObjectTypeBranch()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "BRANCH");
            return obj;
        }
        //MMT40[End]
        //I49[Start]
        public async Task<long> GetObjectSectionId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "MARKETPLACESECTION");
            return obj.Id;
        }
        public async Task<long> GetObjectBlockId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "MARKETPLACESECTIONBLOCK");
            return obj.Id;
        }
        public async Task<long> GetEntityObjectStatusActiveLookup()
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                var obj = await _sycEntityObjectStatus.FirstOrDefaultAsync(x => x.Code == "ACTIVE" && x.ObjectCode == "LOOKUP");
                return obj.Id;
            }
        }
        //I49[End]
        //I50[Start]
        public async Task<long> GetObjectBrandId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "BRAND" && x.ObjectCode == "LOOKUP");
            return obj.Id;
        }
        //I50[End]
    }
}
