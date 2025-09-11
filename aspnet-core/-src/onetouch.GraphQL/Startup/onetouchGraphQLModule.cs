using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;

namespace onetouch.Startup
{
    [DependsOn(typeof(onetouchCoreModule))]
    public class onetouchGraphQLModule : AbpModule
    {
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchGraphQLModule).GetAssembly());
        }

        public override void PreInitialize()
        {
            base.PreInitialize();

            //Adding custom AutoMapper configuration
            Configuration.Modules.AbpAutoMapper().Configurators.Add(CustomDtoMapper.CreateMappings);
        }
    }
}