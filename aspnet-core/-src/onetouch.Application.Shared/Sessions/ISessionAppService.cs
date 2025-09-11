using System.Threading.Tasks;
using Abp.Application.Services;
using onetouch.Sessions.Dto;

namespace onetouch.Sessions
{
    public interface ISessionAppService : IApplicationService
    {
        Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();

        Task<UpdateUserSignInTokenOutput> UpdateUserSignInToken();
    }
}
