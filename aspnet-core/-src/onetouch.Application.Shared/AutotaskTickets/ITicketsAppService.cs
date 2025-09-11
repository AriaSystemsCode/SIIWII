using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AutoTaskTickets.Dtos;
using onetouch.Dto;

namespace onetouch.AutoTaskTickets
{
    public interface ITicketsAppService : IApplicationService
    {
        Task<PagedResultDto<GetTicketForViewDto>> GetAll(GetAllTicketsInput input);

        Task<GetTicketForViewDto> GetTicketForView(int id);

        Task<GetTicketForEditOutput> GetTicketForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditTicketDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetTicketsToExcel(GetAllTicketsForExcelInput input);

    }
}