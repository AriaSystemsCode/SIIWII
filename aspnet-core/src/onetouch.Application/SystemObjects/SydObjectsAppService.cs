using onetouch.SystemObjects;
using System.Collections.Generic;
using Abp.Domain.Uow;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SystemObjects.Exporting;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using onetouch.Common;
using Abp.UI;
using onetouch.Helpers;
using onetouch.AppEntities;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;
using onetouch.AppAdvertisements;
using onetouch.AppMarketplaceItems;
using onetouch.AppItems.Dtos;
using onetouch.Message;
using Z.EntityFramework.Plus;
using onetouch.AppEntities.Dtos;
using DocumentFormat.OpenXml.Office2010.Excel;
using System.Runtime.CompilerServices;
using onetouch.Accounts.Dtos;
using onetouch.Accounts;
using onetouch.AppContacts;
using Org.BouncyCastle.Crypto;
using onetouch.Migrations;
using Abp.Net.Mail;
using System.Net.Mail;
using onetouch.AppEvents.Dtos;
using onetouch.AppEvents;
using onetouch.AppMarketplaceAccounts;
using onetouch.AppMarketplaceContacts;
using onetouch.AppMarketplaceItems.Dtos;
using Abp.EntityFrameworkCore.Uow;
using onetouch.EntityFrameworkCore;
using DocumentFormat.OpenXml.Spreadsheet;

namespace onetouch.SystemObjects
{
	//[AbpAuthorize(AppPermissions.Pages_SydObjects)]
    public class SydObjectsAppService : onetouchAppServiceBase, ISydObjectsAppService
    {
		 private readonly IRepository<SydObject, long> _sydObjectRepository;
		 private readonly ISydObjectsExcelExporter _sydObjectsExcelExporter;
		 private readonly IRepository<SysObjectType,long> _lookup_sysObjectTypeRepository;
		 private readonly IRepository<SydObject, long> _lookup_sydObjectRepository;
        private readonly IRepository<SycEntityObjectType, long> _sycEntityObjectType;
        private readonly IRepository<AppEntity, long> _appEntityRepository;
        private readonly IRepository<AppEntityExtraData, long> _appEntityExtraDataRepository;
        private readonly Helper _helper;
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IAppAdvertisementsAppService _appAdvertisementsAppService;
        //I49[Start]
        //private readonly IRepository<AppMarketplaceItem, long> _appMarketplaceItemRepository;
        private readonly IAppMarketplaceItemsAppService _appMarketplaceItemsAppService;
        private readonly IRepository<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates, long> _sycCurrencyExchangeRateRepository;
        private readonly IMessageAppService _messageAppService;
        private readonly IAppEntitiesAppService _appEntitiesAppService;
        private readonly ISycEntityObjectCategoriesAppService _sycEntityObjectCategoriesAppService;
        private readonly IAccountsAppService _accountsAppService;
        private readonly IRepository<AppContact, long> _appContactRepository;
        private readonly IRepository<SycEntityObjectCategory, long> _sycEntityObjectCategoryRepository;
        private readonly IEmailSender _emailSender;
        //I49[End]
        //I50[Start]
        private readonly IAppEventsAppService _appEventsAppService;
        private readonly IRepository<AppEvent, long> _appEventRepository;
        private readonly IMarketplaceAccountsAppService _MarketplaceAccountsAppService;
        private readonly IRepository<AppMarketplaceContact, long> _appMarketplaceContactRepository;
        //I50[End]
        public SydObjectsAppService(
            IRepository<SydObject, long> sydObjectRepository,
            ISydObjectsExcelExporter sydObjectsExcelExporter,
            IRepository<SysObjectType, long> lookup_sysObjectTypeRepository,
            IRepository<SydObject, long> lookup_sydObjectRepository,
            IRepository<SycEntityObjectType, long> sycEntityObjectType,
            Helper helper,
            IRepository<AppEntity, long> appEntityRepository,
            IRepository<AppEntityExtraData, long> appEntityExtraDataRepository,
            IAppConfigurationAccessor appConfigurationAccessor,
            IAppAdvertisementsAppService appAdvertisementsAppService,
            IAppMarketplaceItemsAppService appMarketplaceItemsAppService,
            IAppEntitiesAppService appEntitiesAppService,
            IRepository<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates, long> sycCurrencyExchangeRateRepository,
            IMessageAppService messageAppService, ISycEntityObjectCategoriesAppService sycEntityObjectCategoriesAppService,
            IAccountsAppService accountsAppService, IRepository<AppContact, long> appContactRepository,
            IRepository<SycEntityObjectCategory, long> sycEntityObjectCategoryRepository, IEmailSender emailSender, IAppEventsAppService appEventsAppService,
            IRepository<AppEvent, long> appEventRepository, IMarketplaceAccountsAppService marketplaceAccountsAppService,
            IRepository<AppMarketplaceContact, long> appMarketplaceContactRepository) 
		  {
			_sydObjectRepository = sydObjectRepository;
			_sydObjectsExcelExporter = sydObjectsExcelExporter;
			_lookup_sysObjectTypeRepository = lookup_sysObjectTypeRepository;
		    _lookup_sydObjectRepository = lookup_sydObjectRepository;
            _sycEntityObjectType = sycEntityObjectType;
            _sycEntityObjectType = sycEntityObjectType;
            _helper = helper;
            _appEntityRepository = appEntityRepository;
            _appEntityExtraDataRepository = appEntityExtraDataRepository;
            _appConfiguration = appConfigurationAccessor.Configuration;
            _appAdvertisementsAppService = appAdvertisementsAppService;
            //I49[Start]
            _appMarketplaceItemsAppService = appMarketplaceItemsAppService;
            _sycEntityObjectCategoryRepository = sycEntityObjectCategoryRepository;
            _sycCurrencyExchangeRateRepository = sycCurrencyExchangeRateRepository;
            _messageAppService= messageAppService;
            _appEntitiesAppService= appEntitiesAppService;
            _sycEntityObjectCategoriesAppService = sycEntityObjectCategoriesAppService;
            _accountsAppService = accountsAppService;
            _appContactRepository = appContactRepository;
            _emailSender = emailSender;
            //I49[End]
            //I50[start]
            _appEventsAppService= appEventsAppService;
            _appEventRepository = appEventRepository;
            _MarketplaceAccountsAppService = marketplaceAccountsAppService;
            _appMarketplaceContactRepository = appMarketplaceContactRepository;
            //I50[End]
        }

        public async Task<PagedResultDto<TreeNode<GetSydObjectForViewDto>>> GetAll(GetAllSydObjectsInput input)
         {
			
			var filteredSydObjects = _sydObjectRepository.GetAll()
						.Include( e => e.ObjectTypeFk)
						.Include( e => e.ParentFk)
                        .Include(e => e.SydObjects)
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false  || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.SysObjectTypeNameFilter), e => e.ObjectTypeFk != null && e.ObjectTypeFk.Name == input.SysObjectTypeNameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SydObjectNameFilter)
                        .Where(e => e.ParentId == null);

            var pagedAndFilteredSydObjects = filteredSydObjects
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

			var sydObjects = from o in pagedAndFilteredSydObjects
                         join o1 in _lookup_sysObjectTypeRepository.GetAll() on o.ObjectTypeId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()
                         
                         join o2 in _lookup_sydObjectRepository.GetAll() on o.ParentId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()

                             select new TreeNode<GetSydObjectForViewDto>()
                             {
                                 Data = new GetSydObjectForViewDto
                                 {
                                     SydObject = new SydObjectDto
                                     {
                                         Name = o.Name,
                                         Code = o.Code,
                                         Id = o.Id
                                     },


                                     SysObjectTypeName = s1 == null ? "" : s1.Name.ToString(),
                                     SydObjectName = s2 == null ? "" : s2.Name.ToString()
                                 },
                                 Leaf = o.SydObjects.Count() == 0
                             };

            var totalCount = await filteredSydObjects.CountAsync();

            return new PagedResultDto<TreeNode<GetSydObjectForViewDto>>(
                totalCount,
                await sydObjects.ToListAsync()
            );
         }


        public async Task<IReadOnlyList<TreeNode<GetSydObjectForViewDto>>> GetAllChilds(int parentId)
        {

            var filteredSydObjects = _sydObjectRepository.GetAll()
                        .Include(e => e.ObjectTypeFk)
                        .Include(e => e.ParentFk)
                        .Include(e => e.SydObjects)
                        .Where(e => e.ParentId != null && e.ParentId == parentId);

            var sydObjects = from o in filteredSydObjects
                             join o1 in _lookup_sysObjectTypeRepository.GetAll() on o.ObjectTypeId equals o1.Id into j1
                             from s1 in j1.DefaultIfEmpty()

                             join o2 in _lookup_sydObjectRepository.GetAll() on o.ParentId equals o2.Id into j2
                             from s2 in j2.DefaultIfEmpty()

                             select new TreeNode<GetSydObjectForViewDto>()
                             {
                                 Data = new GetSydObjectForViewDto
                                 {
                                     SydObject = new SydObjectDto
                                     {
                                         Name = o.Name,
                                         Code = o.Code,
                                         Id = o.Id
                                     },
                                
                                 
                                 SysObjectTypeName = s1 == null ? "" : s1.Name.ToString(),
                                 SydObjectName = s2 == null ? "" : s2.Name.ToString()
                                 },
                                 Leaf = o.SydObjects.Count() == 0
                             };

            var totalCount = await filteredSydObjects.CountAsync();

            var x = await sydObjects.ToListAsync();

            return x;
        }

        [AbpAllowAnonymous]
        public async Task<IReadOnlyList<object>> GetAllLookups()
        {
            var objectLookupId = await _helper.SystemTables.GetObjectLookupId();
            //T-SII-20231207.0003,1 MMT 01/10/2024 remove size-scale from lookups list[Start]
            //var filteredSydObjects = _sycEntityObjectType.GetAll()
            //            .Where(e => e.ObjectId == objectLookupId);
            var filteredSydObjects = _sycEntityObjectType.GetAll()
                        .Where(e => e.ObjectId == objectLookupId && e.Code!= "SIZE-SCALE");
            //T-SII-20231207.0003,1 MMT 01/10/2024 remove size-scale from lookups list[End]
            // I3-13 [Begin]
            //var sydObjects = filteredSydObjects.Select(x => new { x.Id , Label = x.Name, Icon = "pi pi-fw pi-home" });
            var sydObjects = filteredSydObjects.Select(x => new { x.Id, Label = x.Name, Icon = "pi pi-fw pi-home", x.Code });
            // I3-13 [End]

            return await sydObjects.ToListAsync();
        }

        public async Task<GetSydObjectForViewDto> GetSydObjectForView(int id)
         {
            var sydObject = await _sydObjectRepository.GetAsync(id);

            var output = new GetSydObjectForViewDto { SydObject = ObjectMapper.Map<SydObjectDto>(sydObject) };

		    if (output.SydObject.ObjectTypeId != null)
            {
                var _lookupSysObjectType = await _lookup_sysObjectTypeRepository.FirstOrDefaultAsync((int)output.SydObject.ObjectTypeId);
                output.SysObjectTypeName = _lookupSysObjectType.Name.ToString();
            }

		    if (output.SydObject.ParentId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SydObject.ParentId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }
			
            return output;
         }
		 
		 [AbpAuthorize(AppPermissions.Pages_SydObjects_Edit)]
		 public async Task<GetSydObjectForEditOutput> GetSydObjectForEdit(EntityDto input)
         {
            var sydObject = await _sydObjectRepository.FirstOrDefaultAsync(input.Id);
           
		    var output = new GetSydObjectForEditOutput {SydObject = ObjectMapper.Map<CreateOrEditSydObjectDto>(sydObject)};

		    if (output.SydObject.ObjectTypeId != null)
            {
                var _lookupSysObjectType = await _lookup_sysObjectTypeRepository.FirstOrDefaultAsync((int)output.SydObject.ObjectTypeId);
                output.SysObjectTypeName = _lookupSysObjectType.Name.ToString();
            }

		    if (output.SydObject.ParentId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SydObject.ParentId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }
			
            return output;
         }

		 public async Task CreateOrEdit(CreateOrEditSydObjectDto input)
         {
            if(input.Id == null){
				await Create(input);
			}
			else{
				await Update(input);
			}
         }

		 [AbpAuthorize(AppPermissions.Pages_SydObjects_Create)]
		 protected virtual async Task Create(CreateOrEditSydObjectDto input)
         {
            var sydObject = ObjectMapper.Map<SydObject>(input);

			

            await _sydObjectRepository.InsertAsync(sydObject);
         }

		 [AbpAuthorize(AppPermissions.Pages_SydObjects_Edit)]
		 protected virtual async Task Update(CreateOrEditSydObjectDto input)
         {
            await CheckParentAllowed((int)input.Id, input.ParentId);

            var sydObject = await _sydObjectRepository.FirstOrDefaultAsync((int)input.Id);
             ObjectMapper.Map(input, sydObject);
         }

		 [AbpAuthorize(AppPermissions.Pages_SydObjects_Delete)]
         public async Task Delete(EntityDto input)
         {
            await _sydObjectRepository.DeleteAsync(input.Id);
         } 

		public async Task<FileDto> GetSydObjectsToExcel(GetAllSydObjectsForExcelInput input)
         {
			
			var filteredSydObjects = _sydObjectRepository.GetAll()
						.Include( e => e.ObjectTypeFk)
						.Include( e => e.ParentFk)
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false  || e.Name.Contains(input.Filter) || e.Code.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.SysObjectTypeNameFilter), e => e.ObjectTypeFk != null && e.ObjectTypeFk.Name == input.SysObjectTypeNameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SydObjectNameFilter);

			var query = (from o in filteredSydObjects
                         join o1 in _lookup_sysObjectTypeRepository.GetAll() on o.ObjectTypeId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()
                         
                         join o2 in _lookup_sydObjectRepository.GetAll() on o.ParentId equals o2.Id into j2
                         from s2 in j2.DefaultIfEmpty()
                         
                         select new GetSydObjectForViewDto() { 
							SydObject = new SydObjectDto
							{
                                Name = o.Name,
                                Code = o.Code,
                                Id = o.Id
							},
                         	SysObjectTypeName = s1 == null ? "" : s1.Name.ToString(),
                         	SydObjectName = s2 == null ? "" : s2.Name.ToString()
						 });


            var sydObjectListDtos = await query.ToListAsync();

            return _sydObjectsExcelExporter.ExportToFile(sydObjectListDtos);
         }


			[AbpAuthorize(AppPermissions.Pages_SydObjects)]
			public async Task<List<SydObjectSysObjectTypeLookupTableDto>> GetAllSysObjectTypeForTableDropdown()
			{
				return await _lookup_sysObjectTypeRepository.GetAll()
					.Select(sysObjectType => new SydObjectSysObjectTypeLookupTableDto
					{
						Id = sysObjectType.Id,
						DisplayName = sysObjectType.Name.ToString()
					}).ToListAsync();
			}
							
			[AbpAuthorize(AppPermissions.Pages_SydObjects)]
			public async Task<List<SydObjectSydObjectLookupTableDto>> GetAllSydObjectForTableDropdown()
			{
				return await _lookup_sydObjectRepository.GetAll()
					.Select(sydObject => new SydObjectSydObjectLookupTableDto
					{
						Id = sydObject.Id,
						DisplayName = sydObject.Name.ToString(),
                        ObjectTypeId = sydObject.ObjectTypeId
                    }).ToListAsync();
			}

            private async Task<bool> CheckParentAllowed(int recordId, int? parentId)
            {
                parentId = parentId == null ? 0 : parentId;

                if (parentId != 0)
                {
                    var obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Id == parentId);

                    if (obj.ParentId == recordId)
                        throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");

                    while (obj.ParentId != null && obj.ParentId != 0)
                    {
                        obj = await _sydObjectRepository.FirstOrDefaultAsync(x => x.Id == (int)obj.ParentId);
                        if (obj.ParentId == recordId)
                            throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");
                    }

                }

                return true;
            }
        [AbpAllowAnonymous]
        public async Task<List<PageSettingDto>> GetAllSliderSettings(SliderEnum sliderType, string sliderCode)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                List<PageSettingDto> result = new List<PageSettingDto>();
                //I49[Start]
                //var landPageCodeAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageCodeAttributeId();
                //var landPageOrderAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageOrderAttributeId();
                //var landPageTypeAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageTypeAttributeId();
                //var landPageTitleAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageTitleAttributeId();
                //var landPageDescAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageDescriptionAttributeId();
                //var landPageLinkUrlAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageLinkUrlAttributeId();
                //string selectedLandPageTypeCode="";
                //var landPageTypeObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeLandingPageTypeId();

                //if ( sliderType == SliderEnum.AdvSlider ) {
                //    selectedLandPageTypeCode = "ADVSLIDER";
                //} else if (sliderType == SliderEnum.AutoSlider) {
                //    selectedLandPageTypeCode = "AUTOSLIDER";
                //} else if (sliderType == SliderEnum.CallToAction) {
                //    selectedLandPageTypeCode = "CALLTOACTION";
                //}
                //if( selectedLandPageTypeCode == "ADVSLIDER")
                //{
                //    var ads = await _appAdvertisementsAppService.GetCurrentPeriodAdvertisement(5, false, true);
                //    foreach (var q in ads)
                //    {
                //        var item = new PageSettingDto();
                //        item.Type = sliderType;
                //        item.Image = q.AppAdvertisement.MarketPlaceImage;
                //        item.id = q.AppAdvertisement.AppEntityId;
                //        item.ExternalUrl = q.AppAdvertisement.Url;
                //        result.Add(item);
                //    }
                //}
                //else
                //{
                //    var selectedLandPageTypeCodeId = _appEntityRepository.GetAll()
                //        .Where(x => x.EntityObjectTypeId == landPageTypeObjectTypeId && x.Code == selectedLandPageTypeCode)
                //        .Select(x=>x.Id)
                //        .FirstOrDefault();

                //     var query1 = await _appEntityExtraDataRepository.GetAll()
                //        .Where(x => x.AttributeId == landPageTypeAttrId && x.AttributeValueId == selectedLandPageTypeCodeId)
                //        .Select(x => x.EntityId)
                //        .ToListAsync();

                //    var query2 = await _appEntityExtraDataRepository.GetAll()
                //        .Where(x => x.AttributeId == landPageCodeAttrId && x.AttributeValue == sliderCode && query1.Contains(x.EntityId))
                //        .Select(x => x.EntityId)
                //        .ToListAsync();

                //    var query3 = await _appEntityRepository.GetAll()
                //        .Where(x => query2.Contains(x.Id))
                //        .Include(x => x.EntityExtraData)
                //        .Include(x => x.EntityAttachments).ThenInclude(y => y.AttachmentFk)
                //        .ToListAsync();
                //    foreach (var q in query3)
                //    {
                //        var item = new PageSettingDto();
                //        item.id = q.Id;
                //        item.Name = q.Name;
                //        item.Type = sliderType;
                //        item.Image = q.EntityAttachments.Count() == 0 ? "" : $"{imagesUrl}{(q.TenantId == null ? -1 : q.TenantId)}/{q?.EntityAttachments.FirstOrDefault()?.AttachmentFk?.Attachment}";
                //        foreach (var j in q.EntityExtraData)
                //        {
                //            if (j.AttributeId == landPageOrderAttrId) item.Order = int.Parse(j.AttributeValue);
                //            else if (j.AttributeId == landPageCodeAttrId) item.Code = j.AttributeValue;
                //            else if (j.AttributeId == landPageLinkUrlAttrId) item.LinkPageUrl = j.AttributeValue;
                //            else if (j.AttributeId == landPageTitleAttrId) item.Title = j.AttributeValue;
                //            else if (j.AttributeId == landPageDescAttrId) item.Description = j.AttributeValue;
                //        }
                //        result.Add(item);
                //    }
                //    return result = result.OrderBy(x => x.Order).ToList();
                //}
                var sectionActiveStatusId = await _helper.SystemTables.GetEntityObjectStatusActiveLookup();
                var sectionObjectId = await _helper.SystemTables.GetObjectSectionId();
                var allSections = await _appEntityRepository.GetAll().Include(z=>z.EntityAttachments).ThenInclude(z=>z.AttachmentFk)
                    .Include(z=>z.EntityExtraData).Where(z => z.EntityObjectTypeId == sectionObjectId && z.EntityObjectStatusId== sectionActiveStatusId).ToListAsync();
                if (allSections!=null && allSections.Count>0)
                {
                    foreach (var section in allSections)
                    {
                        var item = new PageSettingDto();
                        var sectionOrderExtraDate = section.EntityExtraData.FirstOrDefault(z => z.AttributeId == 1002);
                        if (sectionOrderExtraDate != null)
                            item.Order = int.Parse( sectionOrderExtraDate.AttributeValue);

                        var sectionTypeExtraDate = section.EntityExtraData.FirstOrDefault(z => z.AttributeId == 1001);
                        if (sectionTypeExtraDate != null)
                        {
                            var sectionEntity = await _appEntityRepository.GetAll().Where(z => z.Id == long.Parse(sectionTypeExtraDate.AttributeValueId.ToString())).FirstOrDefaultAsync();
                            if (sectionEntity != null)
                            {
                                item.Type = (SliderEnum)Enum.Parse(typeof(SliderEnum), sectionEntity.Code);
                                
                            }
                        }
                        item.BlockTypeIsSingleOrMixed = null;
                        var sectionBlockTypeExtraDate = section.EntityExtraData.FirstOrDefault(z => z.AttributeId == 1009);
                        if (sectionBlockTypeExtraDate != null && !string.IsNullOrEmpty(sectionBlockTypeExtraDate.AttributeValue))   
                        {
                            item.BlockTypeIsSingleOrMixed = sectionBlockTypeExtraDate.AttributeValue;
                        }
                        item.Name = section.Name;
                        item.Description = section.Name;
                        item.Code = section.Code;
                        var sectionTitleAlignExtraData = section.EntityExtraData.FirstOrDefault(z => z.AttributeId == 1004);
                        if (sectionTitleAlignExtraData != null)
                            item.TitleAlignment = sectionTitleAlignExtraData.AttributeValue;

                        var sectionTitleExtraDate = section.EntityExtraData.FirstOrDefault(z => z.AttributeId == 1003);
                        if (sectionTitleExtraDate != null)
                            item.Title  = sectionTitleExtraDate.AttributeValue;
                        if (section.EntityAttachments.Count >0)
                        item.Image = (section.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                   (section.EntityAttachments.FirstOrDefault() != null ? "attachments/" + (section.TenantId.HasValue ? section.TenantId : -1) + "/" +
                                   section.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                   : "attachments/" + (section.TenantId.HasValue ? section.TenantId : -1) + "/" +
                                   section.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment);
                                 
                        item.id = section.Id;
                        result.Add(item);
                    }
                }
                //I49[End]
                return result;
            }
        }
        //I49[Start]
        [AbpAllowAnonymous]
        public async Task<List<PageSettingDto>> GetAllSectionBlocks(long sectionId, string? timeZone)
        {
            try
            {
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                List<PageSettingDto> result = new List<PageSettingDto>();
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
                {
                    //I50[Start]
                    var sectionActiveStatusId = await _helper.SystemTables.GetEntityObjectStatusActiveLookup();
                    var sectionObjectId = await _helper.SystemTables.GetObjectSectionId();
                    var sectionObject = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData).Where(z => z.Id == sectionId &&
                    z.EntityObjectTypeId == sectionObjectId && z.EntityObjectStatusId == sectionActiveStatusId).FirstOrDefaultAsync();
                    string entityType = "";
                    string entityFilterCondition = "";
                    string entitySortBy = null;
                    if (sectionObject != null)
                    {
                        var extradataEntity = sectionObject.EntityExtraData.Where(z => z.AttributeId == 1006).FirstOrDefault();
                        if (extradataEntity != null && !string.IsNullOrEmpty(extradataEntity.AttributeValue))
                        {
                            entityType = extradataEntity.AttributeValue;
                            var extradataEntityCondition = sectionObject.EntityExtraData.Where(z => z.AttributeId == 1007).FirstOrDefault();
                            if (extradataEntityCondition != null && !string.IsNullOrEmpty(extradataEntityCondition.AttributeValue))
                            {
                                entityFilterCondition = extradataEntityCondition.AttributeValue;
                            }
                            var extradataEntitySort = sectionObject.EntityExtraData.Where(z => z.AttributeId == 1008).FirstOrDefault();
                            if (extradataEntitySort != null && !string.IsNullOrEmpty(extradataEntitySort.AttributeValue))
                            {
                                entitySortBy = extradataEntitySort.AttributeValue;
                            }
                        }
                    }
                    if (!string.IsNullOrEmpty(entityType))
                    {
                        switch (entityType)
                        {
                            case "PRODUCT":
                                GetAllAppMarketItemsInput inputDto = new GetAllAppMarketItemsInput();
                                inputDto.MaxResultCount = 10;
                                inputDto.FilterCondition = entityFilterCondition;
                                inputDto.Sorting = entitySortBy;
                                if (AbpSession.TenantId == null)
                                    inputDto.SharingLevel = SharingLevels.Public;
                                else
                                    inputDto.SharingLevel = SharingLevels.PublicAndSharedWithMe;

                                inputDto.Brands = null;
                                inputDto.departmentFilters = null;
                                inputDto.CategoryFilters = null;
                                //inputDto.CurrencyCode = "USD";
                                inputDto.SelectorOnly = false;
                                var products = await _appMarketplaceItemsAppService.GetAll(inputDto);
                                if (products != null && products.Items != null && products.Items.Count > 0)
                                {

                                    foreach (var pr in products.Items)
                                    {
                                        var item = new PageSettingDto();
                                        item.BlockType = "PRODUCT";
                                        item.GetAppMarketItemForViewDto = pr;// await _appMarketplaceItemsAppService.GetAppMarketplaceViewData(pr.AppItem.SSIN, null);
                                        result.Add(item);
                                    }
                                }

                                break;
                            case "CONTACT":
                                GetAllAccountsInput inputContactDto = new GetAllAccountsInput();
                                inputContactDto.MaxResultCount = 10;
                                inputContactDto.FilterCondition = entityFilterCondition;
                                inputContactDto.Sorting = entitySortBy;
                                var contacts = await _MarketplaceAccountsAppService.GetAll(inputContactDto);
                                if (contacts != null && contacts.Items != null & contacts.Items.Count > 0)
                                {

                                    foreach (var pr in contacts.Items)
                                    {
                                        var item = new PageSettingDto();
                                        item.BlockType = "CONTACT";
                                        item.GetAccountForViewDto = await _MarketplaceAccountsAppService.GetAccountForView(int.Parse(pr.Account.Id.ToString()), pr.Account.SSIN, 1);
                                        //ObjectMapper.Map<GetAccountForViewDto>( pr);// await _appMarketplaceItemsAppService.GetAppMarketplaceViewData(pr.AppItem.SSIN, null);
                                        result.Add(item);
                                    }
                                }
                                break;
                            case "EVENT":
                                GetAllAppEventsInput inputEventDto = new GetAllAppEventsInput();
                                inputEventDto.MaxResultCount = 10;
                                inputEventDto.FilterCondition = entityFilterCondition;
                                inputEventDto.Sorting = entitySortBy;
                                var Events = await _appEventsAppService.GetAll(inputEventDto);
                                if (Events != null && Events.Items != null && Events.Items.Count > 0)
                                {

                                    foreach (var pr in Events.Items)
                                    {
                                        var item = new PageSettingDto();
                                        item.BlockType = "EVENT";
                                        item.GetAppEventForViewDto = pr;// await _appMarketplaceItemsAppService.GetAppMarketplaceViewData(pr.AppItem.SSIN, null);
                                        result.Add(item);
                                    }
                                }
                                break;
                            case "CATEGORY":
                                GetAllSycEntityObjectCategoriesInput inputCategoryDto = new GetAllSycEntityObjectCategoriesInput();
                                inputCategoryDto.MaxResultCount = 10;
                                inputCategoryDto.FilterCondition = entityFilterCondition;
                                inputCategoryDto.Sorting = entitySortBy;
                                inputCategoryDto.DepartmentFlag = false;
                                var itemId = await _helper.SystemTables.GetObjectItemId();
                                inputCategoryDto.ObjectId = itemId;
                                var categories = await _sycEntityObjectCategoriesAppService.GetAll(inputCategoryDto);
                                //var category = await _sycEntityObjectCategoryRepository.GetAll().Where(z => z.Code == blockValueExtraDate.AttributeValue).FirstOrDefaultAsync();

                                if (categories != null)
                                {
                                    foreach (var cat in categories.Items)
                                    {
                                        var item = new PageSettingDto();
                                        item.BlockType = "CATEGORY";

                                        item.GetSycEntityObjectCategoryForViewDto = cat.Data;// await _appMarketplaceItemsAppService.GetAppMarketplaceViewData(pr.AppItem.SSIN, null);
                                        result.Add(item);
                                        //item.GetSycEntityObjectCategoryForViewDto = await _sycEntityObjectCategoriesAppService.GetSycEntityObjectCategoryForView(int.Parse(category.Id.ToString()));
                                    }
                                }

                                break;
                            //I50,Brand[start]
                            case "BRAND":
                                var brandObjectId = await _helper.SystemTables.GetObjectBrandId();
                                var contxt = UnitOfWorkManager.Current.GetDbContext<onetouchDbContext>(null, null);
                                List<AppEntity> filteredBrands = null;
                                if (!string.IsNullOrEmpty(entityFilterCondition))
                                {
                                    var filterCondition = Helper.ApplyJsonFilter<AppEntity>(entityFilterCondition);
                                    if (filterCondition != null)
                                        filteredBrands = await contxt.AppEntities.Where(filterCondition)
                                            .Where(z => z.EntityObjectTypeId == brandObjectId).OrderBy(entitySortBy ?? "id asc")
                                            .Take(10).ToListAsync();

                                }
                                else
                                {
                                    filteredBrands = await contxt.AppEntities
                                    .Where(z => z.EntityObjectTypeId == brandObjectId).OrderBy(entitySortBy ?? "id asc")
                                    .Take(10).ToListAsync();
                                }
                                if (filteredBrands != null && filteredBrands.Count() > 0)
                                {
                                    foreach (var br in filteredBrands)
                                    {
                                        var brandObject = await _appEntityRepository.GetAll().Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                            .Where(z => z.Id == br.Id).FirstOrDefaultAsync();
                                        if (brandObject != null)
                                        {
                                            var item = new PageSettingDto();
                                            item.BlockType = "BRAND";
                                            item.GetAppEntityForViewDto = await _appEntitiesAppService.GetAppEntityForView(brandObject.Id);
                                            {
                                                if (brandObject.EntityAttachments != null && brandObject.EntityAttachments.Count > 0)
                                                {

                                                    item.GetAppEntityForViewDto.AppEntity.EntityAttachments = ObjectMapper.Map<List<AppEntityAttachmentDto>>(brandObject.EntityAttachments);
                                                    foreach (var attDto in item.GetAppEntityForViewDto.AppEntity.EntityAttachments)
                                                    {
                                                        attDto.FileName = imagesUrl + (brandObject.TenantId == null ? "-1" : brandObject.TenantId.ToString()) + @"/" + attDto.FileName;
                                                        attDto.Url = attDto.FileName;
                                                    }
                                                }
                                            }
                                            result.Add(item);
                                        }
                                    }
                                }
                                break;
                                //I50,Brand[End]
                        }

                    }
                    else
                    {
                        //I50[End]
                        //var sectionActiveStatusId = await _helper.SystemTables.GetEntityObjectStatusActiveLookup();
                        var sectionBlockId = await _helper.SystemTables.GetObjectBlockId();
                        var extraDataBlocks = await _appEntityExtraDataRepository.GetAll()
                            //Include(x => x.EntityFk).ThenInclude(z=>z.EntityExtraData)
                            //.Include(x => x.EntityFk).ThenInclude(z => z.EntityAttachments).ThenInclude(z=>z.AttachmentFk)
                            .Where(z => z.AttributeId == 2005 && z.AttributeValueId == sectionId)
                            //&& z.EntityFk.EntityObjectStatusId== sectionActiveStatusId && z.EntityFk.EntityObjectTypeId== sectionBlockId)
                            .ToListAsync();
                        if (extraDataBlocks != null && extraDataBlocks.Count > 0)
                        {

                            //if (allSections != null && allSections.Count > 0)
                            {
                                foreach (var block in extraDataBlocks)
                                {
                                    var blockDetail = await _appEntityRepository.GetAll().Include(z => z.EntityExtraData)
                                        .Include(z => z.EntityAttachments).ThenInclude(z => z.AttachmentFk)
                                        .Where(z => z.Id == block.EntityId).FirstOrDefaultAsync();
                                    if (blockDetail == null)
                                        continue;
                                    if (blockDetail.EntityObjectStatusId != sectionActiveStatusId)
                                        continue;
                                    var item = new PageSettingDto();
                                    var sectionOrderExtraDate = blockDetail.EntityExtraData.FirstOrDefault(z => z.AttributeId == 2002);
                                    if (sectionOrderExtraDate != null)
                                        item.Order = int.Parse(sectionOrderExtraDate.AttributeValue);

                                    var linkExtraData = block.EntityFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 2004);
                                    if (linkExtraData != null)
                                        item.LinkPageUrl = linkExtraData.AttributeValue;

                                    item.Type = SliderEnum.SM;
                                    item.Name = blockDetail.Name;
                                    //item.Description = block.EntityFk.Name;
                                    item.Code = blockDetail.Code;
                                    item.Description = blockDetail.Notes;

                                    if (blockDetail.EntityAttachments != null && blockDetail.EntityAttachments.Count > 0)
                                    {
                                        item.Image = (blockDetail.EntityAttachments.FirstOrDefault(x => x.IsDefault == true) == null ?
                                                   (blockDetail.EntityAttachments.FirstOrDefault() != null ? "attachments/" + (blockDetail.TenantId.HasValue ? block.EntityFk.TenantId : -1) + "/" +
                                                   blockDetail.EntityAttachments.FirstOrDefault().AttachmentFk.Attachment : "")
                                                   : "attachments/" + (blockDetail.TenantId.HasValue ? blockDetail.TenantId : -1) + "/" +
                                                   blockDetail.EntityAttachments.FirstOrDefault(x => x.IsDefault == true).AttachmentFk.Attachment);
                                        item.EntityAttachments = ObjectMapper.Map<List<AppEntityAttachmentDto>>(blockDetail.EntityAttachments);
                                        foreach (var attDto in item.EntityAttachments)
                                        {
                                            attDto.FileName = imagesUrl + (blockDetail.TenantId == null ? "-1" : blockDetail.TenantId.ToString()) + @"/" + attDto.FileName;
                                            attDto.Url = attDto.FileName;
                                        }
                                    }
                                    item.id = blockDetail.Id;

                                    var blockTypeExtraDate = blockDetail.EntityExtraData.FirstOrDefault(z => z.AttributeId == 2001);
                                    if (blockTypeExtraDate != null)
                                    {
                                        var blockType = await _appEntityRepository.GetAll().Where(z => z.Id == blockTypeExtraDate.AttributeValueId).FirstOrDefaultAsync();
                                        if (blockType != null)
                                        {
                                            item.BlockType = blockType.Name;
                                        }
                                    }
                                    var linkExtraDate = blockDetail.EntityExtraData.FirstOrDefault(z => z.AttributeId == 2004);
                                    if (linkExtraDate != null)
                                    {
                                        item.Link = linkExtraDate.AttributeValue;
                                    }
                                    var buttonTxtExtraDate = blockDetail.EntityExtraData.FirstOrDefault(z => z.AttributeId == 2006);
                                    if (buttonTxtExtraDate != null)
                                    {
                                        item.ButtonText = buttonTxtExtraDate.AttributeValue;
                                    }

                                    var blockValueExtraDate = blockDetail.EntityExtraData.FirstOrDefault(z => z.AttributeId == 2003);
                                    if (blockValueExtraDate != null)
                                    {
                                        if (!string.IsNullOrEmpty(blockValueExtraDate.AttributeValue)) // Block value 
                                        {

                                            switch (item.BlockType.ToUpper())
                                            {
                                                //I50[Start]
                                                case "EVENT":
                                                    var eventObj = await _appEventRepository.GetAll().Where(z => z.Code == blockValueExtraDate.AttributeValue).FirstOrDefaultAsync();
                                                    if (eventObj != null)
                                                        try
                                                        {
                                                            item.GetAppEventForViewDto = await _appEventsAppService.GetAppEventForView(eventObj.Id, long.Parse(eventObj.EntityId.ToString()), timeZone);
                                                        }
                                                        catch { }
                                                    break;
                                                //I50[End]
                                                case "PRODUCT":
                                                    try
                                                    {
                                                        item.GetAppMarketItemForViewDto = await _appMarketplaceItemsAppService.GetAppMarketplaceViewData(blockValueExtraDate.AttributeValue, null);
                                                    }
                                                    catch { }
                                                    break;
                                                case "BRAND":
                                                    var contactSSINExtraData = blockDetail.EntityExtraData.FirstOrDefault(z => z.AttributeId == 2007);
                                                    if (contactSSINExtraData != null)
                                                    {
                                                        var contactSSIN = contactSSINExtraData.AttributeValue;
                                                        var account = await _appContactRepository.GetAll().AsNoTracking()
                                                            .Where(a => a.SSIN == contactSSIN.TrimEnd() && a.IsProfileData == true &&
                                                            a.TenantId != null && a.PartnerId == null && a.ParentId == null).FirstOrDefaultAsync();
                                                        if (account != null)
                                                        {
                                                            var brandObject = await _appEntityRepository.GetAll().Include(x => x.EntityAttachments).ThenInclude(x => x.AttachmentFk)
                                                                .Where(z => z.Code == blockValueExtraDate.AttributeValue.TrimEnd() && z.TenantId == account.TenantId).FirstOrDefaultAsync();
                                                            if (brandObject != null)
                                                            {
                                                                try
                                                                {
                                                                    item.GetAppEntityForViewDto = await _appEntitiesAppService.GetAppEntityForView(brandObject.Id);
                                                                }
                                                                catch { }

                                                                //if (brandObject.EntityAttachments.Count > 0)
                                                                {
                                                                    if (brandObject.EntityAttachments != null && brandObject.EntityAttachments.Count > 0)
                                                                    {

                                                                        item.GetAppEntityForViewDto.AppEntity.EntityAttachments = ObjectMapper.Map<List<AppEntityAttachmentDto>>(brandObject.EntityAttachments);
                                                                        foreach (var attDto in item.GetAppEntityForViewDto.AppEntity.EntityAttachments)
                                                                        {
                                                                            attDto.FileName = imagesUrl + (brandObject.TenantId == null ? "-1" : brandObject.TenantId.ToString()) + @"/" + attDto.FileName;
                                                                            attDto.Url = attDto.FileName;
                                                                        }
                                                                    }
                                                                    /*var imageAttch = brandObject.EntityAttachments.Where(z=>z.AttachmentCategoryCode.ToUpper()=="IMAGE" ||
                                                                    z.AttachmentCategoryCode.ToUpper() == "BANNER" ||
                                                                    z.AttachmentCategoryCode.ToUpper() == "LOGO").FirstOrDefault();
                                                                    if (imageAttch!= null)
                                                                    item.Image = "attachments/" + (blockDetail.TenantId.HasValue ? blockDetail.TenantId : -1) 
                                                                            + "/" + imageAttch .AttachmentFk.Attachment;*/
                                                                }
                                                            }
                                                        }
                                                    }
                                                    break;
                                                case "CATEGORY":
                                                    var category = await _sycEntityObjectCategoryRepository.GetAll().Where(z => z.Code == blockValueExtraDate.AttributeValue).FirstOrDefaultAsync();
                                                    if (category != null)
                                                    {
                                                        try
                                                        {
                                                            item.GetSycEntityObjectCategoryForViewDto = await _sycEntityObjectCategoriesAppService.GetSycEntityObjectCategoryForView(int.Parse(category.Id.ToString()));
                                                        }
                                                        catch {}
                                                    }
                                                    break;
                                                case "CONTACT":
                                                    var contact = await _appMarketplaceContactRepository.GetAll().Where(z => z.SSIN == blockValueExtraDate.AttributeValue.TrimEnd()).FirstOrDefaultAsync();
                                                    if (contact != null)
                                                    {
                                                        try
                                                        {
                                                            item.GetAccountForViewDto = await _MarketplaceAccountsAppService.GetAccountForView(int.Parse(contact.Id.ToString()), blockValueExtraDate.AttributeValue.TrimEnd(), 1);
                                                        }
                                                        catch {}
                                                    }
                                                    break;
                                            }
                                        }

                                    }
                                    //var blockValueExtraDate = block.EntityFk.EntityExtraData.FirstOrDefault(z => z.AttributeId == 2003);
                                    //if (sectionTitleExtraDate != null)
                                    //    item.Description= 
                                    //item.GetAppMarketItemForViewDto = 
                                    result.Add(item);
                                }
                            }
                        }
                    }
                }
                return result;
            }
            catch (Exception ex)
            { throw new Exception(ex.Message); }
        }

        [AbpAllowAnonymous]
        public async Task SendContactUsInfo(string firstName, string lastName, string email,string phone,string message)
        {
            string salesEmail = await _appEntitiesAppService.GetHostSettingValue(1219);
            string contactUsEmailTemplate = await _appEntitiesAppService.GetHostSettingValue(1220);
            
            //string salesEmail = "customercare@ariasystems.biz";
            string contactUsData = "First Name:" + firstName + "\r\n" +
                        "Last Name:" + lastName + "\r\n" +
                        "Email:" + email + "\r\n" +
                        "Phone :" + phone + "\r\n" +
                        "Message:" + message + "\r\n" ;
            string body = contactUsEmailTemplate.Replace("CONTACTUSINFO", contactUsData);
            body = body.Replace("\r\n", "<br><br>");
            body = body.Replace("\n", "<br><br>");
            await _emailSender.SendAsync(new MailMessage
            {
                To = { salesEmail },
                Subject = "Registration Request",
                Body = "<!DOCTYPE html><html><head/><body><p>"+body+ "<br><br></body></html>",
                /*Body = "<!DOCTYPE html><html><head/><body><p>Dear Support, " + "<br><br>" +
                        "A new enquiry has been made on the Orbit website,\r\nDetails are as follows:" + "<br><br>" +
                        "First Name:"+ firstName + "<br><br>"+
                        "Last Name:" + lastName + "<br><br>" +
                        "Email:" + email + "<br><br>" +
                        "Phone :" + phone + "<br><br>" +
                        "Message:" + message + "<br><br></body></html>",*/
                IsBodyHtml = true
            });

        }
        //I49[End]
    }
}