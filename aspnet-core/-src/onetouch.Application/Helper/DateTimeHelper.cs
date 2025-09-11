using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Helpers
{
    public class DateTimeHelper
    {
        public DateTime GetUTCDatetimeValue(DateTime dateTime, string timeZone)
        {
            TimeZoneInfo timeZoneValue = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
            var uTCFromDateTime = TimeZoneInfo.ConvertTimeToUtc(dateTime, timeZoneValue);
            return uTCFromDateTime;
        }
    }
}
