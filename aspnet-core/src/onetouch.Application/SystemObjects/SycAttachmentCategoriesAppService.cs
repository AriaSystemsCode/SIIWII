using onetouch.SystemObjects;
using System.Collections.Generic;
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
using onetouch.Helpers;
using onetouch.AppEntities;
using onetouch.AccountInfos;
using onetouch.AppEntities.Dtos;


namespace onetouch.SystemObjects
{
	//[AbpAuthorize(AppPermissions.Pages_SycAttachmentCategories)]
    public class SycAttachmentCategoriesAppService : onetouchAppServiceBase, ISycAttachmentCategoriesAppService
    {
		private readonly IRepository<SycAttachmentCategory, long> _sycAttachmentCategoryRepository;
		private readonly ISycAttachmentCategoriesExcelExporter _sycAttachmentCategoriesExcelExporter;
		private readonly IRepository<SycAttachmentCategory,long> _lookup_sycAttachmentCategoryRepository;
		private readonly IRepository<AppEntityAttachment, long> _lookup_appEntityAttachmentRepository;
		private readonly Helper _helper;
		private readonly IRepository<SycAttachmentType, long> _sycAttachmentTypeRepository;
		private readonly ISycAttachmentTypesAppService _sycAttachmentTypesAppService;

		public SycAttachmentCategoriesAppService(
			IRepository<SycAttachmentCategory, long> sycAttachmentCategoryRepository, 
			ISycAttachmentCategoriesExcelExporter sycAttachmentCategoriesExcelExporter , 
			IRepository<SycAttachmentCategory, long> lookup_sycAttachmentCategoryRepository, 
			Helper helper, 
			IRepository<AppEntityAttachment, long> lookup_appEntityAttachmentRepository,
			ISycAttachmentTypesAppService sycAttachmentTypesAppService
			) 
		  {
			_sycAttachmentCategoryRepository = sycAttachmentCategoryRepository;
			_sycAttachmentCategoriesExcelExporter = sycAttachmentCategoriesExcelExporter;
			_lookup_sycAttachmentCategoryRepository = lookup_sycAttachmentCategoryRepository;
			_helper = helper;
			_lookup_appEntityAttachmentRepository = lookup_appEntityAttachmentRepository;
			_sycAttachmentTypesAppService = sycAttachmentTypesAppService;
		}

		 public async Task<PagedResultDto<GetSycAttachmentCategoryForViewDto>> GetAll(GetAllSycAttachmentCategoriesInput input)
         {
			
			var filteredSycAttachmentCategories = _sycAttachmentCategoryRepository.GetAll()
						.Include( e => e.ParentFk)
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false  || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Attributes.Contains(input.Filter) || e.ParentCode.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter),  e => e.Code == input.CodeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter),  e => e.Name == input.NameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.AttributesFilter),  e => e.Attributes == input.AttributesFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.ParentCodeFilter),  e => e.ParentCode == input.ParentCodeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.SycAttachmentCategoryNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SycAttachmentCategoryNameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.AspectRatioFilter), e => e.AspectRatio.Contains(input.AspectRatioFilter))
						.WhereIf(input.MaxFileSizeFilter.HasValue && input.MaxFileSizeFilter > 0, e => e.MaxFileSize <= input.MaxFileSizeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.MessageFilter), e => e.Message.Contains(input.MessageFilter))
						.WhereIf(input.TypeFilter != null, e => e.Type == input.TypeFilter);

			var pagedAndFilteredSycAttachmentCategories = filteredSycAttachmentCategories
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

			var sycAttachmentCategories = from o in pagedAndFilteredSycAttachmentCategories
										  join o1 in _lookup_sycAttachmentCategoryRepository.GetAll() on o.ParentId equals o1.Id into j1
										  from s1 in j1.DefaultIfEmpty()

										  select new GetSycAttachmentCategoryForViewDto() {
											SycAttachmentCategory = new SycAttachmentCategoryDto
											{
												Id = o.Id,
												Code = o.Code,
												Name = o.Name,
												Attributes = o.Attributes,
												ParentCode = o.ParentCode,
												AspectRatio = o.AspectRatio,
												MaxFileSize = o.MaxFileSize,
												Message = o.Message,
												Type = o.Type,
											},
                         					SycAttachmentCategoryName = s1 == null ? "" : s1.Name.ToString()
										  };

            var totalCount = await filteredSycAttachmentCategories.CountAsync();

            return new PagedResultDto<GetSycAttachmentCategoryForViewDto>(
                totalCount,
                await sycAttachmentCategories.ToListAsync()
            );
         }

		[AbpAllowAnonymous]
		public async Task<IList<GetSycAttachmentCategoryForViewDto>> GetAllForAccountInfo()
		{
			//var entityId = await _accountInfoAppService.GetCurrTenantEntityId();
			//if(entityId==0)

			var partnerEntityObjectTypeId = await _helper.SystemTables.GetEntityObjectTypeParetnerId();
			//var parentid = await _helper.SystemTables.GetAttachmentCategoryAccountId();
			var filteredSycAttachmentCategories = _sycAttachmentCategoryRepository.GetAll()
				.Where(x=>x.EntityObjectTypeId == partnerEntityObjectTypeId)
				;


			var sycAttachmentCategories = from o in filteredSycAttachmentCategories
										  join o1 in _lookup_sycAttachmentCategoryRepository.GetAll() on o.ParentId equals o1.Id into j1
										  //join o2 in _lookup_appEntityAttachmentRepository.GetAll().Include(x=>x.AttachmentFk).Where(x=>x.EntityId== entityId) on o.Id equals o2.AttachmentCategoryId into j2
										  from s1 in j1.DefaultIfEmpty()
										  //from s2 in j2.DefaultIfEmpty()

										  select new GetSycAttachmentCategoryForViewDto()
										  {
											  SycAttachmentCategory = new SycAttachmentCategoryDto
											  {
												  Code = o.Code,
												  Name = o.Name,
												  Attributes = o.Attributes,
												  ParentCode = o.ParentCode,
												  Id = o.Id,
												  AspectRatio = o.AspectRatio,
												  MaxFileSize = o.MaxFileSize,
												  Message = o.Message,
												  Type = o.Type
											  },
											  SycAttachmentCategoryName = s1 == null ? "" : s1.Name.ToString()
											  //,ImgURL = s2.AttachmentFk.Attachment
										  };

			var totalCount = await filteredSycAttachmentCategories.CountAsync();

			var result =  await sycAttachmentCategories.ToListAsync();

			return result;
		}

		public async Task<GetSycAttachmentCategoryForViewDto> GetSycAttachmentCategoryForView(long id)
         {
            var sycAttachmentCategory = await _sycAttachmentCategoryRepository.GetAsync(id);

            var output = new GetSycAttachmentCategoryForViewDto { SycAttachmentCategory = ObjectMapper.Map<SycAttachmentCategoryDto>(sycAttachmentCategory) };

		    if (output.SycAttachmentCategory.ParentId != null)
            {
                var _lookupSycAttachmentCategory = await _lookup_sycAttachmentCategoryRepository.FirstOrDefaultAsync((long)output.SycAttachmentCategory.ParentId);
                output.SycAttachmentCategoryName = _lookupSycAttachmentCategory.Name.ToString();
            }
			
            return output;
         }

		public async Task<long> GetSycAttachmentCategoryForViewByCode(string code)
		{
			var sycAttachmentCategory = await _sycAttachmentCategoryRepository.FirstOrDefaultAsync(f => f.Code == code);
            if (sycAttachmentCategory != null) { return sycAttachmentCategory.Id; }
			return 0;
			
		}

		[AbpAuthorize(AppPermissions.Pages_SycAttachmentCategories_Edit)]
		 public async Task<GetSycAttachmentCategoryForEditOutput> GetSycAttachmentCategoryForEdit(EntityDto<long> input)
         {
            var sycAttachmentCategory = await _sycAttachmentCategoryRepository.FirstOrDefaultAsync(input.Id);
           
		    var output = new GetSycAttachmentCategoryForEditOutput {SycAttachmentCategory = ObjectMapper.Map<CreateOrEditSycAttachmentCategoryDto>(sycAttachmentCategory)};

		    if (output.SycAttachmentCategory.ParentId != null)
            {
                var _lookupSycAttachmentCategory = await _lookup_sycAttachmentCategoryRepository.FirstOrDefaultAsync((long)output.SycAttachmentCategory.ParentId);
                output.SycAttachmentCategoryName = _lookupSycAttachmentCategory.Name.ToString();
            }
			
            return output;
         }

		 public async Task CreateOrEdit(CreateOrEditSycAttachmentCategoryDto input)
         {
            if(input.Id == null){
				await Create(input);
			}
			else{
				await Update(input);
			}
         }

		 [AbpAuthorize(AppPermissions.Pages_SycAttachmentCategories_Create)]
		 protected virtual async Task Create(CreateOrEditSycAttachmentCategoryDto input)
         {
            var sycAttachmentCategory = ObjectMapper.Map<SycAttachmentCategory>(input);

			

            await _sycAttachmentCategoryRepository.InsertAsync(sycAttachmentCategory);
         }

		 [AbpAuthorize(AppPermissions.Pages_SycAttachmentCategories_Edit)]
		 protected virtual async Task Update(CreateOrEditSycAttachmentCategoryDto input)
         {
            var sycAttachmentCategory = await _sycAttachmentCategoryRepository.FirstOrDefaultAsync((long)input.Id);
             ObjectMapper.Map(input, sycAttachmentCategory);
         }

		 [AbpAuthorize(AppPermissions.Pages_SycAttachmentCategories_Delete)]
         public async Task Delete(EntityDto<long> input)
         {
            await _sycAttachmentCategoryRepository.DeleteAsync(input.Id);
         } 

		public async Task<FileDto> GetSycAttachmentCategoriesToExcel(GetAllSycAttachmentCategoriesForExcelInput input)
         {

			var filteredSycAttachmentCategories = _sycAttachmentCategoryRepository.GetAll()
						.Include(e => e.ParentFk)
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter) || e.Attributes.Contains(input.Filter) || e.ParentCode.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.AttributesFilter), e => e.Attributes == input.AttributesFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.ParentCodeFilter), e => e.ParentCode == input.ParentCodeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.SycAttachmentCategoryNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SycAttachmentCategoryNameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.AspectRatioFilter), e => e.AspectRatio.Contains(input.AspectRatioFilter) )
						.WhereIf(input.MaxFileSizeFilter.HasValue && input.MaxFileSizeFilter > 0, e => e.MaxFileSize >= input.MaxFileSizeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.MessageFilter), e => e.Message.Contains(input.MessageFilter) )
						.WhereIf(input.TypeFilter != null, e => e.Type == input.TypeFilter);

			var query = (from o in filteredSycAttachmentCategories
                         join o1 in _lookup_sycAttachmentCategoryRepository.GetAll() on o.ParentId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()
                         
                         select new GetSycAttachmentCategoryForViewDto() { 
							SycAttachmentCategory = new SycAttachmentCategoryDto
							{
                                Code = o.Code,
                                Name = o.Name,
                                Attributes = o.Attributes,
                                ParentCode = o.ParentCode,
                                Id = o.Id,
								AspectRatio = o.AspectRatio,
								MaxFileSize = o.MaxFileSize,
								Message = o.Message,
								Type = o.Type
							},
                         	SycAttachmentCategoryName = s1 == null ? "" : s1.Name.ToString()
						 });


            var sycAttachmentCategoryListDtos = await query.ToListAsync();

            return _sycAttachmentCategoriesExcelExporter.ExportToFile(sycAttachmentCategoryListDtos);
         }


		//[AbpAuthorize(AppPermissions.Pages_SycAttachmentCategories)]
		public async Task<List<SycAttachmentCategorySycAttachmentCategoryLookupTableDto>> GetAllSycAttachmentCategoryForTableDropdown()
		{
			return await _lookup_sycAttachmentCategoryRepository.GetAll()
				.Select(sycAttachmentCategory => new SycAttachmentCategorySycAttachmentCategoryLookupTableDto
				{
					Id = sycAttachmentCategory.Id,
					DisplayName = sycAttachmentCategory.Name.ToString(),
					Code = sycAttachmentCategory.Code,

				}).ToListAsync();
		}

		public List<SelectItemDto> GetAllSycAttachmentCategoryTypesForTableDropdown()
		{
			var AttachmentTypeEnumValues = Enum.GetValues(typeof(AttachmentType));
			List<SelectItemDto> result = new List<SelectItemDto>();
			foreach (var item in AttachmentTypeEnumValues)
			{
				var x = new SelectItemDto
				{
					Label = item.ToString(),
					Value = ((int)item).ToString()
				};
				result.Add(x);
			}
			return result.ToList();
		}
		[AbpAllowAnonymous]
		public async Task<List<SycAttachmentCategoryDto>> GetSycAttachmentCategoriesByCodes(string[] codes)
		{
			List<SycAttachmentCategoryDto> result = new List<SycAttachmentCategoryDto>();
			var sycAttachmentCategories = await _sycAttachmentCategoryRepository.GetAll().Where(f => codes.Contains(f.Code)).ToListAsync();

            foreach (var item in sycAttachmentCategories)
            {
				var types = await _sycAttachmentTypesAppService.GetAll(new GetAllSycAttachmentTypesInput() { TypeFilter = (int)item.Type });
				SycAttachmentCategoryDto _item = new SycAttachmentCategoryDto();
				ObjectMapper.Map(item, _item);
				_item.SycAttachmentTypeDto = types.Items.Select(x => x.SycAttachmentType).ToList();
				
				result.Add(_item);
			}
			return result;
		}

	}
}