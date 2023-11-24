using Abp.Domain.Repositories;
using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Twilio.TwiML.Voice;
using Abp.Domain.Uow;
using System.Linq;

namespace onetouch.Helpers
{
    public class SystemTables: onetouchAppServiceBase
    {
        private readonly IRepository<SydObject, long> _sydObjectRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectType;
        private readonly IRepository<SycAttachmentCategory, long> _sycAttachmentCategory;
        private readonly IRepository<SycEntityObjectClassification, long> _SycEntityObjectClassifications;
        private readonly IRepository<SycEntityObjectStatus, long> _sycEntityObjectStatus;
        
        public SystemTables(IRepository<SydObject, long> sydObjectRepository, IRepository<SycEntityObjectType, long> sycEntityObjectType, IRepository<SycAttachmentCategory, long> sycAttachmentCategory,IRepository<SycEntityObjectClassification, long> SycEntityObjectClassifications, IRepository<SycEntityObjectStatus, long> sycEntityObjectStatus)
        {
            _sydObjectRepository = sydObjectRepository;
            _sycEntityObjectType = sycEntityObjectType;
            _sycAttachmentCategory = sycAttachmentCategory;
            _SycEntityObjectClassifications = SycEntityObjectClassifications;
            _sycEntityObjectStatus = sycEntityObjectStatus;
        }

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
        public async Task<long> GetObjectPersonId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "PERSON");
            return obj.Id;
        }

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
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PARTNER");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypeAdvertisementId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "ADVERTISEMENT");
            return obj.Id;
        }

        public async Task<long> GetEntityObjectTypePersonId()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PERSON");
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
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == type);
            if (parnet)
            obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == type && x.ParentId == obj.Id);
            return obj.Id;
        }

        public async Task<string> GetEntityObjectTypePersonCode()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PERSON");
            return obj.Code;
        }

        public async Task<string> GetEntityObjectTypePersonName()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "PERSON");
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

        public async Task<long> GetAttachmentCategoryLogoId()
        {
            var obj = await _sycAttachmentCategory.FirstOrDefaultAsync(x => x.Code == "LOGO");
            return obj.Id;
        }

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

        public async Task<long> GetEntityObjectTypeMessageID()
        {
            var obj = await _sycEntityObjectType.FirstOrDefaultAsync(x => x.Code == "MESSAGE");
            return obj.Id;
        }




       

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
        public async Task<long> GetObjectScaleId()
        {
            var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Code == "SCALE");
            return obj.Id;
        }
        //MMT
    }
}
