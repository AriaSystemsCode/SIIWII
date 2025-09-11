using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.Accounts.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AppMarketplaceAccounts.Exporting
{
    public class AppMarketplaceAccountsExcelExporter : NpoiExcelExporterBase, IAppMarketplaceAccountsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AppMarketplaceAccountsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAccountForViewDto> accounts)
        {
            return CreateExcelPackage(
                "Accounts.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("Accounts"));

                    AddHeader(
                        sheet,
                        L("Name"),
                        L("City"),
                        L("State"),
                        L("ZipCode"),
                        L("Status"),
                        (L("AppEntity")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, accounts,
                        _ => _.Account.Name,
                        _ => _.Account.City,
                        _ => _.Account.State,
                        _ => _.Account.ZipCode,
                        _ => _.Account.Status,
                        _ => _.AppEntityName
                        );

					
					
                });
        }
    }
}
