using Abp.Modules;
using Abp.Reflection.Extensions;

namespace onetouch
{
    [DependsOn(typeof(onetouchXamarinSharedModule))]
    public class onetouchXamarinIosModule : AbpModule
    {
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchXamarinIosModule).GetAssembly());
        }
    }
}