using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.Onetouch.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;
using onetouch.TenantInvitations;
namespace onetouch.Onetouch
{
    [AbpAuthorize(AppPermissions.Pages_SycTenantInvitatios)]
    public class SycTenantInvitatiosAppService : onetouchAppServiceBase, ISycTenantInvitatiosAppService
    {
        private readonly IRepository<SycTenantInvitatios, long> _sycTenantInvitatiosRepository;

        public SycTenantInvitatiosAppService(IRepository<SycTenantInvitatios, long> sycTenantInvitatiosRepository)
        {
            _sycTenantInvitatiosRepository = sycTenantInvitatiosRepository;

        }

        public async Task<PagedResultDto<GetSycTenantInvitatiosForViewDto>> GetAll(GetAllSycTenantInvitatiosInput input)
        {

            var filteredSycTenantInvitatios = _sycTenantInvitatiosRepository.GetAll()
                        .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false);

            var pagedAndFilteredSycTenantInvitatios = filteredSycTenantInvitatios
                .OrderBy(input.Sorting ?? "id asc")
                .PageBy(input);

            var sycTenantInvitatios = from o in pagedAndFilteredSycTenantInvitatios
                                      select new
                                      {

                                          Id = o.Id
                                      };

            var totalCount = await filteredSycTenantInvitatios.CountAsync();

            var dbList = await sycTenantInvitatios.ToListAsync();
            var results = new List<GetSycTenantInvitatiosForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetSycTenantInvitatiosForViewDto()
                {
                    SycTenantInvitatios = new SycTenantInvitatiosDto
                    {

                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return new PagedResultDto<GetSycTenantInvitatiosForViewDto>(
                totalCount,
                results
            );

        }

        public async Task<GetSycTenantInvitatiosForViewDto> GetSycTenantInvitatiosForView(long id)
        {
            var sycTenantInvitatios = await _sycTenantInvitatiosRepository.GetAsync(id);

            var output = new GetSycTenantInvitatiosForViewDto { SycTenantInvitatios = ObjectMapper.Map<SycTenantInvitatiosDto>(sycTenantInvitatios) };

            return output;
        }

        [AbpAuthorize(AppPermissions.Pages_SycTenantInvitatios_Edit)]
        public async Task<GetSycTenantInvitatiosForEditOutput> GetSycTenantInvitatiosForEdit(EntityDto<long> input)
        {
            var sycTenantInvitatios = await _sycTenantInvitatiosRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetSycTenantInvitatiosForEditOutput { SycTenantInvitatios = ObjectMapper.Map<CreateOrEditSycTenantInvitatiosDto>(sycTenantInvitatios) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditSycTenantInvitatiosDto input)
        {
            if (input.Id == null)
            {
                await Create(input);
            }
            else
            {
                await Update(input);
            }
        }

        [AbpAuthorize(AppPermissions.Pages_SycTenantInvitatios_Create)]
        protected virtual async Task Create(CreateOrEditSycTenantInvitatiosDto input)
        {
            var sycTenantInvitatios = ObjectMapper.Map<SycTenantInvitatios>(input);

            if (AbpSession.TenantId != null)
            {
                sycTenantInvitatios.TenantId = (int)AbpSession.TenantId;
            }

            await _sycTenantInvitatiosRepository.InsertAsync(sycTenantInvitatios);

        }

        [AbpAuthorize(AppPermissions.Pages_SycTenantInvitatios_Edit)]
        protected virtual async Task Update(CreateOrEditSycTenantInvitatiosDto input)
        {
            var sycTenantInvitatios = await _sycTenantInvitatiosRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, sycTenantInvitatios);

        }

        [AbpAuthorize(AppPermissions.Pages_SycTenantInvitatios_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _sycTenantInvitatiosRepository.DeleteAsync(input.Id);
        }

    }
}