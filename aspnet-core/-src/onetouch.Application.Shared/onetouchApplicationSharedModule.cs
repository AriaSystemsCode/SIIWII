using Abp.Modules;
using Abp.Reflection.Extensions;

namespace onetouch
{
    [DependsOn(typeof(onetouchCoreSharedModule))]
    public class onetouchApplicationSharedModule : AbpModule
    {
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchApplicationSharedModule).GetAssembly());
        }
    }
}