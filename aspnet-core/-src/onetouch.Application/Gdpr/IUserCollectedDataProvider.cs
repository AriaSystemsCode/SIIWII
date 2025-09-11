using System.Collections.Generic;
using System.Threading.Tasks;
using Abp;
using onetouch.Dto;

namespace onetouch.Gdpr
{
    public interface IUserCollectedDataProvider
    {
        Task<List<FileDto>> GetFiles(UserIdentifier user);
    }
}
