using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;

namespace onetouch.SystemObjects
{
    public interface ISycAttachmentTypesAppService : IApplicationService 
    {
        Task<PagedResultDto<GetSycAttachmentTypeForViewDto>> GetAll(GetAllSycAttachmentTypesInput input);

        Task<GetSycAttachmentTypeForViewDto> GetSycAttachmentTypeForView(long id);

		Task<GetSycAttachmentTypeForEditOutput> GetSycAttachmentTypeForEdit(EntityDto<long> input);

		Task CreateOrEdit(CreateOrEditSycAttachmentTypeDto input);

		Task Delete(EntityDto<long> input);

		
    }
}