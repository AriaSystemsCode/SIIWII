using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;


namespace onetouch.SystemObjects
{
    public interface ISuiIconsAppService : IApplicationService 
    {
        Task<PagedResultDto<GetSuiIconForViewDto>> GetAll(GetAllSuiIconsInput input);

		Task<GetSuiIconForEditOutput> GetSuiIconForEdit(EntityDto input);

		Task CreateOrEdit(CreateOrEditSuiIconDto input);

		Task Delete(EntityDto input);

		
    }
}