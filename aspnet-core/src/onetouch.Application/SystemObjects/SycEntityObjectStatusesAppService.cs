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

namespace onetouch.SystemObjects
{
	[AbpAuthorize(AppPermissions.Pages_SycEntityObjectStatuses)]
    public class SycEntityObjectStatusesAppService : onetouchAppServiceBase, ISycEntityObjectStatusesAppService
    {
		 private readonly IRepository<SycEntityObjectStatus,long> _sycEntityObjectStatusRepository;
		 private readonly ISycEntityObjectStatusesExcelExporter _sycEntityObjectStatusesExcelExporter;
		 private readonly IRepository<SydObject, long> _lookup_sydObjectRepository;
		 

		  public SycEntityObjectStatusesAppService(IRepository<SycEntityObjectStatus, long> sycEntityObjectStatusRepository, ISycEntityObjectStatusesExcelExporter sycEntityObjectStatusesExcelExporter , IRepository<SydObject, long> lookup_sydObjectRepository) 
		  {
			_sycEntityObjectStatusRepository = sycEntityObjectStatusRepository;
			_sycEntityObjectStatusesExcelExporter = sycEntityObjectStatusesExcelExporter;
			_lookup_sydObjectRepository = lookup_sydObjectRepository;
		
		  }
		
		[AbpAllowAnonymous]
		public async Task<PagedResultDto<GetSycEntityObjectStatusForViewDto>> GetAll(GetAllSycEntityObjectStatusesInput input)
         {

			var filteredSycEntityObjectStatuses = _sycEntityObjectStatusRepository.GetAll()
						.Include(e => e.ObjectFk)
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectCodeFilter), e => e.ObjectFk != null && e.ObjectFk.Code == input.SydObjectCodeFilter)
						.Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null);

			var pagedAndFilteredSycEntityObjectStatuses = filteredSycEntityObjectStatuses
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

			var sycEntityObjectStatuses = from o in pagedAndFilteredSycEntityObjectStatuses
                         join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()
                         
                         select new GetSycEntityObjectStatusForViewDto() {
							SycEntityObjectStatus = new SycEntityObjectStatusDto
							{
                                Code = o.Code,
                                Name = o.Name,
                                Id = o.Id
							},
                         	SydObjectName = s1 == null ? "" : s1.Name.ToString()
						};

            var totalCount = await filteredSycEntityObjectStatuses.CountAsync();

            return new PagedResultDto<GetSycEntityObjectStatusForViewDto>(
                totalCount,
                await sycEntityObjectStatuses.ToListAsync()
            );
         }

        // [AbpAuthorize(AppPermissions.Pages_SycEntityObjectStatuses)]
        [AbpAllowAnonymous]
        public async Task<List<SycEntityObjectStatusLookupTableDto>> GetAllSycEntityStatusForTableDropdown(string objectCode)
        {
            try
            {
                var objectId = _lookup_sydObjectRepository.GetAll().Where(e => e.Code == objectCode).FirstOrDefault();
                return await _sycEntityObjectStatusRepository.GetAll().Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null && x.ObjectId == objectId.Id)
                    .Select(sycEntityObjectType => new SycEntityObjectStatusLookupTableDto
                    {
                        Id = sycEntityObjectType.Id,
                        DisplayName = sycEntityObjectType.Name.ToString()
                    }).ToListAsync();
            }
            catch (Exception ex)
            {
                return new List<SycEntityObjectStatusLookupTableDto>();
            }
        }


        public async Task<GetSycEntityObjectStatusForViewDto> GetSycEntityObjectStatusForView(int id)
         {
            var sycEntityObjectStatus = await _sycEntityObjectStatusRepository.FirstOrDefaultAsync(x=>x.Id==id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

            var output = new GetSycEntityObjectStatusForViewDto { SycEntityObjectStatus = ObjectMapper.Map<SycEntityObjectStatusDto>(sycEntityObjectStatus) };

		    if (output.SycEntityObjectStatus.ObjectId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SycEntityObjectStatus.ObjectId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }
			
            return output;
         }
		 
		 [AbpAuthorize(AppPermissions.Pages_SycEntityObjectStatuses_Edit)]
		 public async Task<GetSycEntityObjectStatusForEditOutput> GetSycEntityObjectStatusForEdit(EntityDto input)
         {
            var sycEntityObjectStatus = await _sycEntityObjectStatusRepository.FirstOrDefaultAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));

			var output = new GetSycEntityObjectStatusForEditOutput {SycEntityObjectStatus = ObjectMapper.Map<CreateOrEditSycEntityObjectStatusDto>(sycEntityObjectStatus)};

		    if (output.SycEntityObjectStatus.ObjectId != null)
            {
                var _lookupSydObject = await _lookup_sydObjectRepository.FirstOrDefaultAsync((int)output.SycEntityObjectStatus.ObjectId);
                output.SydObjectName = _lookupSydObject.Name.ToString();
            }
			
            return output;
         }

		 public async Task CreateOrEdit(CreateOrEditSycEntityObjectStatusDto input)
         {
            if(input.Id == null){
				await Create(input);
			}
			else{
				await Update(input);
			}
         }

		 [AbpAuthorize(AppPermissions.Pages_SycEntityObjectStatuses_Create)]
		 protected virtual async Task Create(CreateOrEditSycEntityObjectStatusDto input)
         {
            var sycEntityObjectStatus = ObjectMapper.Map<SycEntityObjectStatus>(input);

			sycEntityObjectStatus.TenantId = AbpSession.TenantId;

			await _sycEntityObjectStatusRepository.InsertAsync(sycEntityObjectStatus);
         }

		 [AbpAuthorize(AppPermissions.Pages_SycEntityObjectStatuses_Edit)]
		 protected virtual async Task Update(CreateOrEditSycEntityObjectStatusDto input)
         {
            var sycEntityObjectStatus = await _sycEntityObjectStatusRepository.FirstOrDefaultAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));
             ObjectMapper.Map(input, sycEntityObjectStatus);
         }

		 [AbpAuthorize(AppPermissions.Pages_SycEntityObjectStatuses_Delete)]
         public async Task Delete(EntityDto input)
         {
            await _sycEntityObjectStatusRepository.DeleteAsync(x => x.Id == input.Id && (x.TenantId == AbpSession.TenantId || x.TenantId == null));
         } 

		public async Task<FileDto> GetSycEntityObjectStatusesToExcel(GetAllSycEntityObjectStatusesForExcelInput input)
         {

			var filteredSycEntityObjectStatuses = _sycEntityObjectStatusRepository.GetAll()
						.Include(e => e.ObjectFk)
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Code.Contains(input.Filter) || e.Name.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.CodeFilter), e => e.Code == input.CodeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.SydObjectNameFilter), e => e.ObjectFk != null && e.ObjectFk.Name == input.SydObjectNameFilter)
						 .Where(x => x.TenantId == AbpSession.TenantId || x.TenantId == null);

			var query = (from o in filteredSycEntityObjectStatuses
                         join o1 in _lookup_sydObjectRepository.GetAll() on o.ObjectId equals o1.Id into j1
                         from s1 in j1.DefaultIfEmpty()
                         
                         select new GetSycEntityObjectStatusForViewDto() { 
							SycEntityObjectStatus = new SycEntityObjectStatusDto
							{
                                Code = o.Code,
                                Name = o.Name,
                                Id = o.Id
							},
                         	SydObjectName = s1 == null ? "" : s1.Name.ToString()
						 });


            var sycEntityObjectStatusListDtos = await query.ToListAsync();

            return _sycEntityObjectStatusesExcelExporter.ExportToFile(sycEntityObjectStatusListDtos);
         }


			[AbpAuthorize(AppPermissions.Pages_SycEntityObjectStatuses)]
			public async Task<List<SycEntityObjectStatusSydObjectLookupTableDto>> GetAllSydObjectForTableDropdown()
			{
				return await _lookup_sydObjectRepository.GetAll()
					.Select(sydObject => new SycEntityObjectStatusSydObjectLookupTableDto
					{
						Id = sydObject.Id,
						DisplayName = sydObject.Name.ToString()
					}).ToListAsync();
			}
							
    }
}