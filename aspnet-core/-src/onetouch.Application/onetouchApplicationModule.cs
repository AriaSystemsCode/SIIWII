using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using onetouch.Authorization;
using System;

namespace onetouch
{
    /// <summary>
    /// Application layer module of the application.
    /// </summary>
    [DependsOn(
        typeof(onetouchApplicationSharedModule),
        typeof(onetouchCoreModule)
        )]
    public class onetouchApplicationModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.UnitOfWork.Timeout = TimeSpan.FromMinutes(3);

            //Adding authorization providers
            Configuration.Authorization.Providers.Add<AppAuthorizationProvider>();

            //Adding custom AutoMapper configuration
            Configuration.Modules.AbpAutoMapper().Configurators.Add(CustomDtoMapper.CreateMappings);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchApplicationModule).GetAssembly());
        }
    }
}