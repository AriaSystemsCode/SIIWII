using Microsoft.Extensions.Configuration;

namespace onetouch.Configuration
{
    public interface IAppConfigurationAccessor
    {
        IConfigurationRoot Configuration { get; }
    }
}
