using System.Threading.Tasks;
using Abp.Application.Services;
using onetouch.MultiTenancy.Payments.Dto;
using onetouch.MultiTenancy.Payments.Stripe.Dto;

namespace onetouch.MultiTenancy.Payments.Stripe
{
    public interface IStripePaymentAppService : IApplicationService
    {
        Task ConfirmPayment(StripeConfirmPaymentInput input);

        StripeConfigurationDto GetConfiguration();

        Task<SubscriptionPaymentDto> GetPaymentAsync(StripeGetPaymentInput input);

        Task<string> CreatePaymentSession(StripeCreatePaymentSessionInput input);
    }
}