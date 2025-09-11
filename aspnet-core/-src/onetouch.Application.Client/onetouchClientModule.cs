using Abp.Modules;
using Abp.Reflection.Extensions;

namespace onetouch
{
    public class onetouchClientModule : AbpModule
    {
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(onetouchClientModule).GetAssembly());
        }
    }
}
