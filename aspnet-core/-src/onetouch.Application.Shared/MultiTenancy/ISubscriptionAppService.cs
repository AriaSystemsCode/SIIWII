using System.Threading.Tasks;
using Abp.Application.Services;

namespace onetouch.MultiTenancy
{
    public interface ISubscriptionAppService : IApplicationService
    {
        Task DisableRecurringPayments();

        Task EnableRecurringPayments();
    }
}
