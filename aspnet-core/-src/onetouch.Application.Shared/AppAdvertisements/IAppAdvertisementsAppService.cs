using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppAdvertisements.Dtos;
using System.Collections.Generic;

namespace onetouch.AppAdvertisements
{
    public interface IAppAdvertisementsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppAdvertisementForViewDto>> GetAll(GetAllAppAdvertisementsInput input);

        Task<GetAppAdvertisementForViewDto> GetAppAdvertisementForView(long id);

        Task<GetAppAdvertisementForEditOutput> GetAppAdvertisementForEdit(EntityDto<long> input);

        Task CreateOrEdit(CreateOrEditAppAdvertisementDto input);

        Task Delete(EntityDto<long> input);

        Task<PagedResultDto<AppAdvertisementAppEntityLookupTableDto>> GetAllAppEntityForLookupTable(GetAllForLookupTableInput input);

        Task<PagedResultDto<AppAdvertisementUserLookupTableDto>> GetAllUserForLookupTable(GetAllForLookupTableInput input);
        Task<List<GetAppAdvertisementForViewDto>> GetCurrentPeriodAdvertisement(int topAdsInCurrentPeriod, bool? PublishOnHomePage, bool? PublishOnMarketLandingPage);

    }
}