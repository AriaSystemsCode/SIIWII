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
using onetouch.Common;
using onetouch.ActionFilters;
using Abp.UI;
using Org.BouncyCastle.Math.EC.Rfc7748;

namespace onetouch.SystemObjects
{
	[AbpAuthorize(AppPermissions.Pages_SysObjectTypes)]
    public class SysObjectTypesAppService : onetouchAppServiceBase, ISysObjectTypesAppService
    {
		 private readonly IRepository<SysObjectType, long> _sysObjectTypeRepository;
		 private readonly ISysObjectTypesExcelExporter _sysObjectTypesExcelExporter;
		 private readonly IRepository<SysObjectType, long> _lookup_sysObjectTypeRepository;
		 

		  public SysObjectTypesAppService(IRepository<SysObjectType, long> sysObjectTypeRepository, ISysObjectTypesExcelExporter sysObjectTypesExcelExporter , IRepository<SysObjectType, long> lookup_sysObjectTypeRepository) 
		  {
			_sysObjectTypeRepository = sysObjectTypeRepository;
			_sysObjectTypesExcelExporter = sysObjectTypesExcelExporter;
			_lookup_sysObjectTypeRepository = lookup_sysObjectTypeRepository;
		
		  }

		 public async Task<PagedResultDto<TreeNode<GetSysObjectTypeForViewDto>>> GetAll(GetAllSysObjectTypesInput input)
         {
			
			var filteredSysObjectTypes = _sysObjectTypeRepository.GetAll()
						.Include( e => e.ParentFk)
						.Include(e => e.SysObjectTypes)
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false  || e.Name.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.SysObjectTypeNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SysObjectTypeNameFilter)
						.Where(e => e.ParentId == null);

			var pagedAndFilteredSysObjectTypes = filteredSysObjectTypes
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

			var sysObjectTypes = from o in pagedAndFilteredSysObjectTypes
                         join o1 in _lookup_sysObjectTypeRepository.GetAll() on o.ParentId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()

							select new TreeNode<GetSysObjectTypeForViewDto>()
							{
								Data = new GetSysObjectTypeForViewDto
								{
									SysObjectType = new SysObjectTypeDto
									{
										Name = o.Name,
										Id = o.Id,
										Code = o.Code
									},
									SysObjectTypeName = s1 == null ? "" : s1.Name.ToString()
								},
								Leaf = o.SysObjectTypes.Count() == 0
							};

            var totalCount = await filteredSysObjectTypes.CountAsync();

            return new PagedResultDto<TreeNode<GetSysObjectTypeForViewDto>>(
                totalCount,
				await sysObjectTypes.ToListAsync()
			);
         }

		public async Task<IReadOnlyList<TreeNode<GetSysObjectTypeForViewDto>>> GetAllChilds(int parentId)
		{

			var filteredSysObjectTypes = _sysObjectTypeRepository.GetAll()
						.Include(e => e.ParentFk)
						.Include(e => e.SysObjectTypes)
						.Where(e => e.ParentId != null && e.ParentId == parentId);


			var sysObjectTypes = from o in filteredSysObjectTypes
								 join o1 in _lookup_sysObjectTypeRepository.GetAll() on o.ParentId equals o1.Id into j1
								 from s1 in j1.DefaultIfEmpty()

								 select new TreeNode<GetSysObjectTypeForViewDto>()
								 {
									 Data = new GetSysObjectTypeForViewDto
									 {
										 SysObjectType = new SysObjectTypeDto
										 {
											 Name = o.Name,
											 Id = o.Id,
											 Code = o.Code
										 },
										 SysObjectTypeName = s1 == null ? "" : s1.Name.ToString()
									 },
									 Leaf = o.SysObjectTypes.Count() == 0 
								 };

			var totalCount = await filteredSysObjectTypes.CountAsync();

			var x = await sysObjectTypes.ToListAsync();

			return x;
		}

		public async Task<GetSysObjectTypeForViewDto> GetSysObjectTypeForView(int id)
         {
            var sysObjectType = await _sysObjectTypeRepository.GetAsync(id);

            var output = new GetSysObjectTypeForViewDto { SysObjectType = ObjectMapper.Map<SysObjectTypeDto>(sysObjectType) };

		    if (output.SysObjectType.ParentId != null)
            {
                var _lookupSysObjectType = await _lookup_sysObjectTypeRepository.FirstOrDefaultAsync((int)output.SysObjectType.ParentId);
                output.SysObjectTypeName = _lookupSysObjectType.Name.ToString();
            }
			
            return output;
         }
		 
		 [AbpAuthorize(AppPermissions.Pages_SysObjectTypes_Edit)]
		 public async Task<GetSysObjectTypeForEditOutput> GetSysObjectTypeForEdit(EntityDto input)
         {
            var sysObjectType = await _sysObjectTypeRepository.FirstOrDefaultAsync(input.Id);
           
		    var output = new GetSysObjectTypeForEditOutput {SysObjectType = ObjectMapper.Map<CreateOrEditSysObjectTypeDto>(sysObjectType)};

		    if (output.SysObjectType.ParentId != null)
            {
                var _lookupSysObjectType = await _lookup_sysObjectTypeRepository.FirstOrDefaultAsync((int)output.SysObjectType.ParentId);
                output.SysObjectTypeName = _lookupSysObjectType.Name.ToString();
            }
			
            return output;
         }

		 public async Task CreateOrEdit(CreateOrEditSysObjectTypeDto input)
         {
			//await CheckParentAllowed((int)input.Id, input.ParentId);

			if (input.Id == null){
				await Create(input);
			}
			else{
				await Update(input);
			}
         }

		 [AbpAuthorize(AppPermissions.Pages_SysObjectTypes_Create)]
		 protected virtual async Task Create(CreateOrEditSysObjectTypeDto input)
         {
            var sysObjectType = ObjectMapper.Map<SysObjectType>(input);

			

            await _sysObjectTypeRepository.InsertAsync(sysObjectType);
         }

		 [AbpAuthorize(AppPermissions.Pages_SysObjectTypes_Edit)]
		 protected virtual async Task Update(CreateOrEditSysObjectTypeDto input)
         {
			await CheckParentAllowed((int)input.Id, input.ParentId);

			var sysObjectType = await _sysObjectTypeRepository.FirstOrDefaultAsync((int)input.Id);
			ObjectMapper.Map(input, sysObjectType);
         }

		 [AbpAuthorize(AppPermissions.Pages_SysObjectTypes_Delete)]
         public async Task Delete(EntityDto input)
         {
            await _sysObjectTypeRepository.DeleteAsync(input.Id);
         } 

		public async Task<FileDto> GetSysObjectTypesToExcel(GetAllSysObjectTypesForExcelInput input)
         {
			
			var filteredSysObjectTypes = _sysObjectTypeRepository.GetAll()
						.Include( e => e.ParentFk)
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false  || e.Name.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.SysObjectTypeNameFilter), e => e.ParentFk != null && e.ParentFk.Name == input.SysObjectTypeNameFilter);

			var query = (from o in filteredSysObjectTypes
                         join o1 in _lookup_sysObjectTypeRepository.GetAll() on o.ParentId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()
                         
                         select new GetSysObjectTypeForViewDto() { 
							SysObjectType = new SysObjectTypeDto
							{
                                Name = o.Name,
                                Id = o.Id,
								Code = o.Code
							},
                         	SysObjectTypeName = s1 == null ? "" : s1.Name.ToString()
						 });


            var sysObjectTypeListDtos = await query.ToListAsync();

            return _sysObjectTypesExcelExporter.ExportToFile(sysObjectTypeListDtos);
         }


			[AbpAuthorize(AppPermissions.Pages_SysObjectTypes)]
			public async Task<List<SysObjectTypeSysObjectTypeLookupTableDto>> GetAllSysObjectTypeForTableDropdown()
			{
				return await _lookup_sysObjectTypeRepository.GetAll()
					.Select(sysObjectType => new SysObjectTypeSysObjectTypeLookupTableDto
					{
						Id = sysObjectType.Id,
						DisplayName = sysObjectType.Name.ToString()
					}).ToListAsync();
			}
				
		private async Task<bool> CheckParentAllowed(int recordId, int? parentId)
		{
			parentId = parentId == null ? 0 : parentId;

			if (parentId != 0)
			{
				var obj = await _sysObjectTypeRepository.FirstOrDefaultAsync(x => x.Id == parentId);
				
				if (obj.ParentId == recordId)
					throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");

				while (obj.ParentId != null && obj.ParentId != 0)
				{
					obj = await _sysObjectTypeRepository.FirstOrDefaultAsync(x => x.Id == (int)obj.ParentId);
					if(obj.ParentId == recordId)
						throw new UserFriendlyException("Ooppps! cannot make the record child to itself...");
				}
				
			}

			return true;
		}
    }
}