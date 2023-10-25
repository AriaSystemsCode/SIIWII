using Abp.Domain.Services;

namespace onetouch
{
    public abstract class onetouchDomainServiceBase : DomainService
    {
        /* Add your common members for all your domain services. */

        protected onetouchDomainServiceBase()
        {
            LocalizationSourceName = onetouchConsts.LocalizationSourceName;
        }
    }
}
