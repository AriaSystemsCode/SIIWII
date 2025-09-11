using System.Collections.Generic;
using onetouch.Authorization.Users.Dto;
using onetouch.Dto;

namespace onetouch.Authorization.Users.Exporting
{
    public interface IUserListExcelExporter
    {
        FileDto ExportToFile(List<UserListDto> userListDtos);
    }
}