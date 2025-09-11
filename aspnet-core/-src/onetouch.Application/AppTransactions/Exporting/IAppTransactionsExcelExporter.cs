using System.Collections.Generic;
using onetouch.AppTransactions.Dtos;
using onetouch.Dto;

namespace onetouch.AppTransactions.Exporting
{
    public interface IAppTransactionsExcelExporter
    {
        FileDto ExportToFile(List<GetAppTransactionForViewDto> appTransactions);
    }
}