using System.Threading.Tasks;
using Abp.Application.Services;
using onetouch.MultiTenancy.Payments.PayPal.Dto;

namespace onetouch.MultiTenancy.Payments.PayPal
{
    public interface IPayPalPaymentAppService : IApplicationService
    {
        Task ConfirmPayment(long paymentId, string paypalOrderId);

        PayPalConfigurationDto GetConfiguration();
    }
}
