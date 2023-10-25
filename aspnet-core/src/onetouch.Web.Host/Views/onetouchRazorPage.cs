using Abp.AspNetCore.Mvc.Views;

namespace onetouch.Web.Views
{
    public abstract class onetouchRazorPage<TModel> : AbpRazorPage<TModel>
    {
        protected onetouchRazorPage()
        {
            LocalizationSourceName = onetouchConsts.LocalizationSourceName;
        }
    }
}
