using System.Threading.Tasks;
using onetouch.Sessions.Dto;

namespace onetouch.Web.Session
{
    public interface IPerRequestSessionCache
    {
        Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformationsAsync();
    }
}
