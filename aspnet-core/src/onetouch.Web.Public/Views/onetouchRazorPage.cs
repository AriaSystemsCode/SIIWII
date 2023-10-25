using Abp.AspNetCore.Mvc.Views;
using Abp.Runtime.Session;
using Microsoft.AspNetCore.Mvc.Razor.Internal;

namespace onetouch.Web.Public.Views
{
    public abstract class onetouchRazorPage<TModel> : AbpRazorPage<TModel>
    {
        [RazorInject]
        public IAbpSession AbpSession { get; set; }

        protected onetouchRazorPage()
        {
            LocalizationSourceName = onetouchConsts.LocalizationSourceName;
        }
    }
}
