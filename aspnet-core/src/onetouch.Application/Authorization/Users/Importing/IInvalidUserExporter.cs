using System.Collections.Generic;
using onetouch.Authorization.Users.Importing.Dto;
using onetouch.Dto;

namespace onetouch.Authorization.Users.Importing
{
    public interface IInvalidUserExporter
    {
        FileDto ExportToFile(List<ImportUserDto> userListDtos);
    }
}
