using System.Threading.Tasks;

namespace onetouch.Net.Sms
{
    public interface ISmsSender
    {
        Task SendAsync(string number, string message);
    }
}