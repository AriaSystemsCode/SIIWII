using Abp.AspNetCore.Mvc.Authorization;
using onetouch.Authorization;
using onetouch.Storage;
using Abp.BackgroundJobs;

namespace onetouch.Web.Controllers
{
    [AbpMvcAuthorize(AppPermissions.Pages_Administration_Users)]
    public class UsersController : UsersControllerBase
    {
        public UsersController(IBinaryObjectManager binaryObjectManager, IBackgroundJobManager backgroundJobManager)
            : base(binaryObjectManager, backgroundJobManager)
        {
        }
    }
}