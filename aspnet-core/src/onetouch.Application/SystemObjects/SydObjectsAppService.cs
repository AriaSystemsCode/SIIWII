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

        public SydObjectsAppService(
            IRepository<SydObject, long> sydObjectRepository,
            ISydObjectsExcelExporter sydObjectsExcelExporter ,
            IRepository<SysObjectType, long> lookup_sysObjectTypeRepository, 
            IRepository<SydObject, long> lookup_sydObjectRepository, 
            IRepository<SycEntityObjectType, long> sycEntityObjectType, 
            Helper helper, 
            IRepository<AppEntity, long> appEntityRepository, 
            IRepository<AppEntityExtraData, long> appEntityExtraDataRepository,
            IAppConfigurationAccessor appConfigurationAccessor,
            IAppAdvertisementsAppService appAdvertisementsAppService
            ) 
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

        public async Task<List<PageSettingDto>> GetAllSliderSettings(SliderEnum sliderType, string sliderCode)
        {
            using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.MustHaveTenant, AbpDataFilters.MayHaveTenant))
            {
                string imagesUrl = _appConfiguration[$"Attachment:Path"].Replace(_appConfiguration[$"Attachment:Omitt"], "") + @"/";
                List<PageSettingDto> result = new List<PageSettingDto>();
                var landPageCodeAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageCodeAttributeId();
                var landPageOrderAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageOrderAttributeId();
                var landPageTypeAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageTypeAttributeId();
                var landPageTitleAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageTitleAttributeId();
                var landPageDescAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageDescriptionAttributeId();
                var landPageLinkUrlAttrId = await _helper.SystemTables.GetEntityObjectTypeLandingPageLinkUrlAttributeId();
                string selectedLandPageTypeCode="";
                var landPageTypeObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeLandingPageTypeId();
                
                if ( sliderType == SliderEnum.AdvSlider ) {
                    selectedLandPageTypeCode = "ADVSLIDER";
                } else if (sliderType == SliderEnum.AutoSlider) {
                    selectedLandPageTypeCode = "AUTOSLIDER";
                } else if (sliderType == SliderEnum.CallToAction) {
                    selectedLandPageTypeCode = "CALLTOACTION";
                }
                if( selectedLandPageTypeCode == "ADVSLIDER")
                {
                    var ads = await _appAdvertisementsAppService.GetCurrentPeriodAdvertisement(5, false, true);
                    foreach (var q in ads)
                    {
                        var item = new PageSettingDto();
                        item.Type = sliderType;
                        item.Image = q.AppAdvertisement.MarketPlaceImage;
                        item.id = q.AppAdvertisement.AppEntityId;
                        item.ExternalUrl = q.AppAdvertisement.Url;
                        result.Add(item);
                    }
                }
                else
                {
                    var selectedLandPageTypeCodeId = _appEntityRepository.GetAll()
                        .Where(x => x.EntityObjectTypeId == landPageTypeObjectTypeId && x.Code == selectedLandPageTypeCode)
                        .Select(x=>x.Id)
                        .FirstOrDefault();

                     var query1 = await _appEntityExtraDataRepository.GetAll()
                        .Where(x => x.AttributeId == landPageTypeAttrId && x.AttributeValueId == selectedLandPageTypeCodeId)
                        .Select(x => x.EntityId)
                        .ToListAsync();

                    var query2 = await _appEntityExtraDataRepository.GetAll()
                        .Where(x => x.AttributeId == landPageCodeAttrId && x.AttributeValue == sliderCode && query1.Contains(x.EntityId))
                        .Select(x => x.EntityId)
                        .ToListAsync();

                    var query3 = await _appEntityRepository.GetAll()
                        .Where(x => query2.Contains(x.Id))
                        .Include(x => x.EntityExtraData)
                        .Include(x => x.EntityAttachments).ThenInclude(y => y.AttachmentFk)
                        .ToListAsync();
                    foreach (var q in query3)
                    {
                        var item = new PageSettingDto();
                        item.id = q.Id;
                        item.Name = q.Name;
                        item.Type = sliderType;
                        item.Image = q.EntityAttachments.Count() == 0 ? "" : $"{imagesUrl}{(q.TenantId == null ? -1 : q.TenantId)}/{q?.EntityAttachments.FirstOrDefault()?.AttachmentFk?.Attachment}";
                        foreach (var j in q.EntityExtraData)
                        {
                            if (j.AttributeId == landPageOrderAttrId) item.Order = int.Parse(j.AttributeValue);
                            else if (j.AttributeId == landPageCodeAttrId) item.Code = j.AttributeValue;
                            else if (j.AttributeId == landPageLinkUrlAttrId) item.LinkPageUrl = j.AttributeValue;
                            else if (j.AttributeId == landPageTitleAttrId) item.Title = j.AttributeValue;
                            else if (j.AttributeId == landPageDescAttrId) item.Description = j.AttributeValue;
                        }
                        result.Add(item);
                    }
                    return result = result.OrderBy(x => x.Order).ToList();
                }
                return result;
            }
        }
    }
}