using Abp.Modules;
using Abp.Reflection.Extensions;

namespace onetouch
{
    [DependsOn(typeof(onetouchXamarinSharedModule))]
    public class onetouchXamarinAndroidModule : AbpModule
    {
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchXamarinAndroidModule).GetAssembly());
        }
    }
}