

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
	[AbpAuthorize(AppPermissions.Pages_SuiIcons)]
    public class SuiIconsAppService : onetouchAppServiceBase, ISuiIconsAppService
    {
		 private readonly IRepository<SuiIcon> _suiIconRepository;
		 

		  public SuiIconsAppService(IRepository<SuiIcon> suiIconRepository ) 
		  {
			_suiIconRepository = suiIconRepository;
			
		  }

		 public async Task<PagedResultDto<GetSuiIconForViewDto>> GetAll(GetAllSuiIconsInput input)
         {
			
			var filteredSuiIcons = _suiIconRepository.GetAll()
						.WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false  || e.Name.Contains(input.Filter))
						.WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter),  e => e.Name == input.NameFilter);

			var pagedAndFilteredSuiIcons = filteredSuiIcons
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

			var suiIcons = from o in pagedAndFilteredSuiIcons
                         select new GetSuiIconForViewDto() {
							SuiIcon = new SuiIconDto
							{
                                Name = o.Name,
                                Id = o.Id
							}
						};

            var totalCount = await filteredSuiIcons.CountAsync();

            return new PagedResultDto<GetSuiIconForViewDto>(
                totalCount,
                await suiIcons.ToListAsync()
            );
         }
		 
		 [AbpAuthorize(AppPermissions.Pages_SuiIcons_Edit)]
		 public async Task<GetSuiIconForEditOutput> GetSuiIconForEdit(EntityDto input)
         {
            var suiIcon = await _suiIconRepository.FirstOrDefaultAsync(input.Id);
           
		    var output = new GetSuiIconForEditOutput {SuiIcon = ObjectMapper.Map<CreateOrEditSuiIconDto>(suiIcon)};
			
            return output;
         }

		 public async Task CreateOrEdit(CreateOrEditSuiIconDto input)
         {
            if(input.Id == null){
				await Create(input);
			}
			else{
				await Update(input);
			}
         }

		 [AbpAuthorize(AppPermissions.Pages_SuiIcons_Create)]
		 protected virtual async Task Create(CreateOrEditSuiIconDto input)
         {
            var suiIcon = ObjectMapper.Map<SuiIcon>(input);

			

            await _suiIconRepository.InsertAsync(suiIcon);
         }

		 [AbpAuthorize(AppPermissions.Pages_SuiIcons_Edit)]
		 protected virtual async Task Update(CreateOrEditSuiIconDto input)
         {
            var suiIcon = await _suiIconRepository.FirstOrDefaultAsync((int)input.Id);
             ObjectMapper.Map(input, suiIcon);
         }

		 [AbpAuthorize(AppPermissions.Pages_SuiIcons_Delete)]
         public async Task Delete(EntityDto input)
         {
            await _suiIconRepository.DeleteAsync(input.Id);
         } 
    }
}