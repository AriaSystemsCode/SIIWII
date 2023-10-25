using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.AccountInfos.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.AccountInfos.Exporting
{
    public class AccountInfoTempsExcelExporter : NpoiExcelExporterBase, IAccountInfoTempsExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public AccountInfoTempsExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
			ITempFileCacheManager tempFileCacheManager) :  
	base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetAccountInfoForViewDto> accountInfoTemps)
        {
            return CreateExcelPackage(
                "AccountInfoTemps.xlsx",
                excelPackage =>
                {
                    
                    var sheet = excelPackage.CreateSheet(L("AccountInfoTemps"));

                    AddHeader(
                        sheet,
                        L("Code"),
                        L("TradeName"),
                        L("AccountType"),
                        L("Notes"),
                        L("Website"),
                        L("Name"),
                        L("Phone1Number"),
                        L("Phone1Ext"),
                        L("Phone2Number"),
                        L("Phone2Ext"),
                        L("Phone3Number"),
                        L("Phone3Ext"),
                        L("EMailAddress"),
                        (L("AppEntity")) + L("Name"),
                        (L("AppEntity")) + L("Name"),
                        (L("AppEntity")) + L("Name"),
                        (L("AppEntity")) + L("Name"),
                        (L("AppEntity")) + L("Name")
                        );

                    AddObjects(
                        sheet, 2, accountInfoTemps,
                        _ => _.AccountInfo.Code,
                        _ => _.AccountInfo.TradeName,
                        _ => _.AccountInfo.AccountType,
                        _ => _.AccountInfo.Notes,
                        _ => _.AccountInfo.Website,
                        _ => _.AccountInfo.Name,
                        _ => _.AccountInfo.Phone1Number,
                        _ => _.AccountInfo.Phone1Ext,
                        _ => _.AccountInfo.Phone2Number,
                        _ => _.AccountInfo.Phone2Ext,
                        _ => _.AccountInfo.Phone3Number,
                        _ => _.AccountInfo.Phone3Ext,
                        _ => _.AccountInfo.EMailAddress,
                        _ => _.AppEntityName,
                        _ => _.AppEntityName2,
                        _ => _.AppEntityName3,
                        _ => _.AppEntityName4,
                        _ => _.AppEntityName5
                        );

					
					
                });
        }
    }
}
