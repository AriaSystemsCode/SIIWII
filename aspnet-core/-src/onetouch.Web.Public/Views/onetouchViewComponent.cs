using Abp.AspNetCore.Mvc.ViewComponents;

namespace onetouch.Web.Public.Views
{
    public abstract class onetouchViewComponent : AbpViewComponent
    {
        protected onetouchViewComponent()
        {
            LocalizationSourceName = onetouchConsts.LocalizationSourceName;
        }
    }
}