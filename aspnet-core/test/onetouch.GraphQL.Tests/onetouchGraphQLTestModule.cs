using Abp.Modules;
using Abp.Reflection.Extensions;
using Castle.Windsor.MsDependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using onetouch.Configure;
using onetouch.Startup;
using onetouch.Test.Base;

namespace onetouch.GraphQL.Tests
{
    [DependsOn(
        typeof(onetouchGraphQLModule),
        typeof(onetouchTestBaseModule))]
    public class onetouchGraphQLTestModule : AbpModule
    {
        public override void PreInitialize()
        {
            IServiceCollection services = new ServiceCollection();
            
            services.AddAndConfigureGraphQL();

            WindsorRegistrationHelper.CreateServiceProvider(IocManager.IocContainer, services);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchGraphQLTestModule).GetAssembly());
        }
    }
}