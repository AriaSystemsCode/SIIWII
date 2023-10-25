using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;


namespace onetouch.SystemObjects
{
    public interface ISycReportsAppService : IApplicationService 
    {
        Task<PagedResultDto<GetSycReportForViewDto>> GetAll(GetAllSycReportInput input);
	
    }
}