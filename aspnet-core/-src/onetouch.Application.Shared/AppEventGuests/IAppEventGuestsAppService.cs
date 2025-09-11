using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppEventGuests.Dtos;
using onetouch.Dto;

namespace onetouch.AppEventGuests
{
    public interface IAppEventGuestsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppEventGuestForViewDto>> GetAll(GetAllAppEventGuestsInput input);

        Task<GetAppEventGuestForEditOutput> GetAppEventGuestForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAppEventGuestDto input);

        Task Delete(EntityDto<long> input);

    }
}