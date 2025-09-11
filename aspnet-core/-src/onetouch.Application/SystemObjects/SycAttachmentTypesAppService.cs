
using onetouch.SystemObjects.Dtos;

using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;

namespace onetouch.SystemObjects
{
	[AbpAuthorize(AppPermissions.Pages_SycAttachmentTypes)]
    public class SycAttachmentTypesAppService : onetouchAppServiceBase, ISycAttachmentTypesAppService
    {
		 private readonly IRepository<SycAttachmentType, long> _sycAttachmentTypeRepository;
		 

		  public SycAttachmentTypesAppService(IRepository<SycAttachmentType, long> sycAttachmentTypeRepository ) 
		  {
			_sycAttachmentTypeRepository = sycAttachmentTypeRepository;
			
		  }

        [AbpAllowAnonymous]
        public async Task<PagedResultDto<GetSycAttachmentTypeForViewDto>> GetAll(GetAllSycAttachmentTypesInput input)
         {
			var typeFilter = (AttachmentType) input.TypeFilter;
			
			var filteredSycAttachmentTypes = _sycAttachmentTypeRepository.GetAll()
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false  || e.Name.Contains(input.Filter) || e.Extension.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter),  e => e.Name.ToLower().Contains(input.NameFilter.ToLower().Trim()) )
						.WhereIf(input.TypeFilter > -1, e => e.Type == typeFilter)
						.WhereIf(!string.IsNullOrWhiteSpace(input.ExtensionFilter),  e => e.Extension.ToLower().Contains(input.ExtensionFilter.ToLower().Trim()) );

			var pagedAndFilteredSycAttachmentTypes = filteredSycAttachmentTypes
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

			var sycAttachmentTypes = from o in pagedAndFilteredSycAttachmentTypes
                         select new GetSycAttachmentTypeForViewDto() {
							SycAttachmentType = new SycAttachmentTypeDto
							{
                                Name = o.Name,
                                Type = o.Type,
                                Extension = o.Extension,
                                Id = o.Id
							}
						};

            var totalCount = await filteredSycAttachmentTypes.CountAsync();

            return new PagedResultDto<GetSycAttachmentTypeForViewDto>(
                totalCount,
                await sycAttachmentTypes.ToListAsync()
            );
         }
		 
		 public async Task<GetSycAttachmentTypeForViewDto> GetSycAttachmentTypeForView(long id)
         {
            var sycAttachmentType = await _sycAttachmentTypeRepository.GetAsync(id);

            var output = new GetSycAttachmentTypeForViewDto { SycAttachmentType = ObjectMapper.Map<SycAttachmentTypeDto>(sycAttachmentType) };
			
            return output;
         }
		 
		 [AbpAuthorize(AppPermissions.Pages_SycAttachmentTypes_Edit)]
		 public async Task<GetSycAttachmentTypeForEditOutput> GetSycAttachmentTypeForEdit(EntityDto<long> input)
         {
            var sycAttachmentType = await _sycAttachmentTypeRepository.FirstOrDefaultAsync(input.Id);
           
		    var output = new GetSycAttachmentTypeForEditOutput {SycAttachmentType = ObjectMapper.Map<CreateOrEditSycAttachmentTypeDto>(sycAttachmentType)};
			
            return output;
         }

		 public async Task CreateOrEdit(CreateOrEditSycAttachmentTypeDto input)
         {
            if(input.Id == null){
				await Create(input);
			}
			else{
				await Update(input);
			}
         }

		 [AbpAuthorize(AppPermissions.Pages_SycAttachmentTypes_Create)]
		 private async Task Create(CreateOrEditSycAttachmentTypeDto input)
         {
            var sycAttachmentType = ObjectMapper.Map<SycAttachmentType>(input);
            await _sycAttachmentTypeRepository.InsertAsync(sycAttachmentType);
         }

		 [AbpAuthorize(AppPermissions.Pages_SycAttachmentTypes_Edit)]
		 private async Task Update(CreateOrEditSycAttachmentTypeDto input)
         {
            var sycAttachmentType = await _sycAttachmentTypeRepository.FirstOrDefaultAsync((long)input.Id);
             ObjectMapper.Map(input, sycAttachmentType);
         }

		 [AbpAuthorize(AppPermissions.Pages_SycAttachmentTypes_Delete)]
         public async Task Delete(EntityDto<long> input)
         {
            await _sycAttachmentTypeRepository.DeleteAsync(input.Id);
         } 
    }
}