using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppPosts.Dtos;
using onetouch.Authorization.Users.Profile.Dto;
using onetouch.Dto;

namespace onetouch.AppPosts
{
    public interface IAppPostsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppPostForViewDto>> GetAll(GetAllAppPostsInput input);
        Task<GetProfilePictureOutput> GetProfilePictureAllByID(Guid profilePictureId);
        Task<GetAppPostForEditOutput> GetAppPostForEdit(EntityDto<long> input);

        Task<GetAppPostForViewDto> CreateOrEdit(CreateOrEditAppPostDto input);

        Task Delete(EntityDto<long> input);

        Task<FileDto> GetAppPostsToExcel(GetAllAppPostsForExcelInput input);

        Task<PagedResultDto<AppPostAppContactLookupTableDto>> GetAllAppContactForLookupTable(GetAllForLookupTableInput input);

        Task<PagedResultDto<AppPostAppEntityLookupTableDto>> GetAllAppEntityForLookupTable(GetAllForLookupTableInput input);
        Task<LinkPreviewResult> Preview(string url);

    }
}