using System.Collections.Generic;
using onetouch.Accounts.Dtos;
using onetouch.Dto;

namespace onetouch.AppMarketplaceAccounts.Exporting
{
    public interface IAppMarketplaceAccountsExcelExporter
    {
        FileDto ExportToFile(List<GetAccountForViewDto> accounts);
    }
}