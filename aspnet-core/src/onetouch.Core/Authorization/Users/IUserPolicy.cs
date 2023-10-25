using System.Threading.Tasks;
using Abp.Domain.Policies;

namespace onetouch.Authorization.Users
{
    public interface IUserPolicy : IPolicy
    {
        Task CheckMaxUserCountAsync(int tenantId);
    }
}
