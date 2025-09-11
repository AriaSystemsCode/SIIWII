using System.Collections.Generic;
using onetouch.AccountInfos.Dtos;
using onetouch.Dto;

namespace onetouch.AccountInfos.Exporting
{
    public interface IAccountInfoTempsExcelExporter
    {
        FileDto ExportToFile(List<GetAccountInfoForViewDto> accountInfoTemps);
    }
}