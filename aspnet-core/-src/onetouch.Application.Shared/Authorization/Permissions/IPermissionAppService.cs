using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Authorization.Permissions.Dto;

namespace onetouch.Authorization.Permissions
{
    public interface IPermissionAppService : IApplicationService
    {
        ListResultDto<FlatPermissionWithLevelDto> GetAllPermissions();
    }
}
