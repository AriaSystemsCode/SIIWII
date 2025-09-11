using System.Threading.Tasks;
using Abp.Webhooks;

namespace onetouch.WebHooks
{
    public interface IWebhookEventAppService
    {
        Task<WebhookEvent> Get(string id);
    }
}
