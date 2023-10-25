using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AutotaskQueues.Dtos;
using onetouch.Dto;

namespace onetouch.AutotaskQueues
{
    public interface IAutotaskQueuesAppService : IApplicationService
    {
        Task<List<GetAutotaskQueueForViewDto>> GetAll();

        Task<GetAutotaskQueueForEditOutput> GetAutotaskQueueForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAutotaskQueueDto input);

        Task Delete(EntityDto<long> input);

    }
}