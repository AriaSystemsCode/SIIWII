using Abp.Authorization;
using onetouch.Authorization.Roles;
using onetouch.Authorization.Users;

namespace onetouch.Authorization
{
    public class PermissionChecker : PermissionChecker<Role, User>
    {
        public PermissionChecker(UserManager userManager)
            : base(userManager)
        {

        }
    }
}
