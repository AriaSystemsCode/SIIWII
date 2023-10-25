using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Message.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using onetouch.Authorization.Users;
using onetouch.Authorization.Users.Dto;
using System.Linq;
using Abp;

namespace onetouch.Message
{

    public interface IMessageAppService : IApplicationService
    {
        Task<MessagePagedResultDto> GetAll(GetAllMessagesInput input);

        Task<MessagePagedResultDto> GetAllComments(GetAllMessagesInput input);

        List<GetMessagesForViewDto> GetMessagesForView(long id);
        List<GetUsersForMessageDto> GetAllUsers(string searchTerm);
        Task<List<GetMessagesForViewDto>> CreateMessage(CreateMessageInput input);
        string GetUsersNamesByID(string users);
        List<NameValue<string>> GetMessageRecieversName(String UsersIds);
    }
}
