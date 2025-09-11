using System.Collections.Generic;
using onetouch.Accounts.Dtos;
using onetouch.Dto;

namespace onetouch.Accounts.Exporting
{
    public interface IAccountsExcelExporter
    {
        FileDto ExportToFile(List<GetAccountForViewDto> accounts);
    }
}