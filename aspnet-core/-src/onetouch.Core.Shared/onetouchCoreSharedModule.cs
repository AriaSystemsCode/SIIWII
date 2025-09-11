using Abp.Modules;
using Abp.Reflection.Extensions;

namespace onetouch
{
    public class onetouchCoreSharedModule : AbpModule
    {
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchCoreSharedModule).GetAssembly());
        }
    }
}