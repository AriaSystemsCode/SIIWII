using System.Collections.Generic;
using onetouch.Authorization.Users.Importing.Dto;
using Abp.Dependency;

namespace onetouch.Authorization.Users.Importing
{
    public interface IUserListExcelDataReader: ITransientDependency
    {
        List<ImportUserDto> GetUsersFromExcel(byte[] fileBytes);
    }
}
