using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AutoTaskTicketNotes.Dtos;
using onetouch.Dto;

namespace onetouch.AutoTaskTicketNotes
{
    public interface ITicketNotesAppService : IApplicationService
    {
        Task<PagedResultDto<GetTicketNoteForViewDto>> GetAll(GetAllTicketNotesInput input);

        Task<GetTicketNoteForViewDto> GetTicketNoteForView(int id);

        Task<GetTicketNoteForEditOutput> GetTicketNoteForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditTicketNoteDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetTicketNotesToExcel(GetAllTicketNotesForExcelInput input);

        Task<PagedResultDto<TicketNoteTicketLookupTableDto>> GetAllTicketForLookupTable(GetAllForLookupTableInput input);

    }
}