using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using Abp.Linq.Extensions;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using onetouch.AutotaskQueues.Dtos;
using onetouch.Dto;
using Abp.Application.Services.Dto;
using onetouch.Authorization;
using Abp.Extensions;
using Abp.Authorization;
using Microsoft.EntityFrameworkCore;
using Abp.UI;
using onetouch.Storage;

namespace onetouch.AutotaskQueues
{
    [AbpAuthorize(AppPermissions.Pages_AutotaskQueues)]
    public class AutotaskQueuesAppService : onetouchAppServiceBase, IAutotaskQueuesAppService
    {
        private readonly IRepository<AutotaskQueue, long> _autotaskQueueRepository;

        public AutotaskQueuesAppService(IRepository<AutotaskQueue, long> autotaskQueueRepository)
        {
            _autotaskQueueRepository = autotaskQueueRepository;

        }

        public async Task<List<GetAutotaskQueueForViewDto>> GetAll()
        {
            //public async Task<List<GetAutotaskQueueForViewDto>> GetAll(GetAllAutotaskQueuesInput input)
            //var filteredAutotaskQueues = _autotaskQueueRepository.GetAll()
            //            .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter))
            //            .WhereIf(input.MinRefQueueIDFilter != null, e => e.RefQueueID >= input.MinRefQueueIDFilter)
            //            .WhereIf(input.MaxRefQueueIDFilter != null, e => e.RefQueueID <= input.MaxRefQueueIDFilter)
            //            .WhereIf(!string.IsNullOrWhiteSpace(input.NameFilter), e => e.Name == input.NameFilter);

            //var pagedAndFilteredAutotaskQueues = filteredAutotaskQueues
            //    .OrderBy(input.Sorting ?? "id asc")
            //    .PageBy(input);
            var pagedAndFilteredAutotaskQueues = _autotaskQueueRepository.GetAll();
            var autotaskQueues = from o in pagedAndFilteredAutotaskQueues
                                 select new
                                 {

                                     o.RefQueueID,
                                     o.Name,
                                     Id = o.Id
                                 };

            //var totalCount = await filteredAutotaskQueues.CountAsync();

            var dbList = await autotaskQueues.ToListAsync();
            var results = new List<GetAutotaskQueueForViewDto>();

            foreach (var o in dbList)
            {
                var res = new GetAutotaskQueueForViewDto()
                {
                    AutotaskQueue = new AutotaskQueueDto
                    {

                        RefQueueID = o.RefQueueID,
                        Name = o.Name,
                        Id = o.Id,
                    }
                };

                results.Add(res);
            }

            return results.ToList();

        }

        [AbpAuthorize(AppPermissions.Pages_AutotaskQueues_Edit)]
        public async Task<GetAutotaskQueueForEditOutput> GetAutotaskQueueForEdit(EntityDto<long> input)
        {
            var autotaskQueue = await _autotaskQueueRepository.FirstOrDefaultAsync(input.Id);

            var output = new GetAutotaskQueueForEditOutput { AutotaskQueue = ObjectMapper.Map<CreateOrEditAutotaskQueueDto>(autotaskQueue) };

            return output;
        }

        public async Task CreateOrEdit(CreateOrEditAutotaskQueueDto input)
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

        [AbpAuthorize(AppPermissions.Pages_AutotaskQueues_Create)]
        protected virtual async Task Create(CreateOrEditAutotaskQueueDto input)
        {
            var autotaskQueue = ObjectMapper.Map<AutotaskQueue>(input);

            if (AbpSession.TenantId != null)
            {
                autotaskQueue.TenantId = (int?)AbpSession.TenantId;
            }

            await _autotaskQueueRepository.InsertAsync(autotaskQueue);

        }

        [AbpAuthorize(AppPermissions.Pages_AutotaskQueues_Edit)]
        protected virtual async Task Update(CreateOrEditAutotaskQueueDto input)
        {
            var autotaskQueue = await _autotaskQueueRepository.FirstOrDefaultAsync((long)input.Id);
            ObjectMapper.Map(input, autotaskQueue);

        }

        [AbpAuthorize(AppPermissions.Pages_AutotaskQueues_Delete)]
        public async Task Delete(EntityDto<long> input)
        {
            await _autotaskQueueRepository.DeleteAsync(input.Id);
        }

    }
}