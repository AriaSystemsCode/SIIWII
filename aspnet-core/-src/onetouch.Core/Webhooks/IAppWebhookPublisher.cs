using System.Threading.Tasks;
using onetouch.Authorization.Users;

namespace onetouch.WebHooks
{
    public interface IAppWebhookPublisher
    {
        Task PublishTestWebhook();
    }
}
