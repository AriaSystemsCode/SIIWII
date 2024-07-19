using System.Collections.Generic;
using Abp.Runtime.Session;
using Abp.Timing.Timezone;
using onetouch.DataExporting.Excel.NPOI;
using onetouch.SycCurrencyExchangeRates.Dtos;
using onetouch.Dto;
using onetouch.Storage;

namespace onetouch.SycCurrencyExchangeRates.Exporting
{
    public class SycCurrencyExchangeRatesExcelExporter : NpoiExcelExporterBase, ISycCurrencyExchangeRatesExcelExporter
    {

        private readonly ITimeZoneConverter _timeZoneConverter;
        private readonly IAbpSession _abpSession;

        public SycCurrencyExchangeRatesExcelExporter(
            ITimeZoneConverter timeZoneConverter,
            IAbpSession abpSession,
            ITempFileCacheManager tempFileCacheManager) :
    base(tempFileCacheManager)
        {
            _timeZoneConverter = timeZoneConverter;
            _abpSession = abpSession;
        }

        public FileDto ExportToFile(List<GetSycCurrencyExchangeRatesForViewDto> sycCurrencyExchangeRates)
        {
            return CreateExcelPackage(
                "SycCurrencyExchangeRates.xlsx",
                excelPackage =>
                {

                    var sheet = excelPackage.CreateSheet(L("SycCurrencyExchangeRates"));

                    AddHeader(
                        sheet,
                        L("CurrencyCode"),
                        L("BaseCurrencyCode"),
                        L("ExchangeRate"),
                        L("CurrencyMethod"),
                        L("CurrencyUnit")
                        );

                    AddObjects(
                        sheet, 2, sycCurrencyExchangeRates,
                        _ => _.SycCurrencyExchangeRates.CurrencyCode,
                        _ => _.SycCurrencyExchangeRates.BaseCurrencyCode,
                        _ => _.SycCurrencyExchangeRates.ExchangeRate,
                        _ => _.SycCurrencyExchangeRates.CurrencyMethod,
                        _ => _.SycCurrencyExchangeRates.CurrencyUnit
                        );

                });
        }
    }
}