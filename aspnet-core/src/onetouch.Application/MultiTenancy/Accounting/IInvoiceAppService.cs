using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using onetouch.MultiTenancy.Accounting.Dto;

namespace onetouch.MultiTenancy.Accounting
{
    public interface IInvoiceAppService
    {
        Task<InvoiceDto> GetInvoiceInfo(EntityDto<long> input);

        Task CreateInvoice(CreateInvoiceDto input);
    }
}
