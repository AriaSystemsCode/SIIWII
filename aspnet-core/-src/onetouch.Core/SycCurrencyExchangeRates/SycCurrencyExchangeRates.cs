using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.SycCurrencyExchangeRates
{
    [Table("SycCurrencyExchangeRates")]
    [Audited]
    public class SycCurrencyExchangeRates : FullAuditedEntity<long>
    {
        public string CurrencyCode { get; set; }
        public string BaseCurrencyCode { get; set; }
        public decimal ExchangeRate { get; set; }
        public string CurrencyMethod { get; set; }
        public int CurrencyUnit { get; set; }
    }
}
