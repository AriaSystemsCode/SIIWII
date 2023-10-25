using Abp.Dependency;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.ActionFilters
{
    public class DataActionFilter : IAsyncActionFilter, ITransientDependency
    {
        private readonly IIocResolver _iocResolver;
        //private readonly IAbpAspNetCoreConfiguration _configuration;

        //public AbpValidationActionFilter(IIocResolver iocResolver, IAbpAspNetCoreConfiguration configuration)
        //{
        //    _iocResolver = iocResolver;
        //    _configuration = configuration;
        //}

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            //if (!_configuration.IsValidationEnabledForControllers || !context.ActionDescriptor.IsControllerAction())
            //{
            //    await next();
            //    return;
            //}

            //using (AbpCrossCuttingConcerns.Applying(context.Controller, AbpCrossCuttingConcerns.Validation))
            //{
            //    using (var validator = _iocResolver.ResolveAsDisposable<MvcActionInvocationValidator>())
            //    {
            //        validator.Object.Initialize(context);
            //        validator.Object.Validate();
            //    }

            //    await next();
            //}



            // Do something before the action executes.

            // next() calls the action method.
            var resultContext = await next();
            // resultContext.Result is set.
            // Do something after the action executes.
            var descriptor = context.ActionDescriptor;
            //var actionName = descriptor["ActionName"];
        }
    }
}
