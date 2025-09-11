using System.Threading.Tasks;
using Abp.Dependency;

namespace onetouch.MultiTenancy.Accounting
{
    public interface IInvoiceNumberGenerator : ITransientDependency
    {
        Task<string> GetNewInvoiceNumber();
    }
}