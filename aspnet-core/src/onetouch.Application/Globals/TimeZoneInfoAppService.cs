using onetouch.Globals.Dtos;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.Globals
{
    public class TimeZoneInfoAppService : onetouchAppServiceBase, ITimeZoneInfoAppService
    {
        public DateTime GetUTCDatetimeValue(DateTime dateTime, string timeZone)
        {
            TimeZoneInfo timeZoneValue = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
            var uTCFromDateTime = TimeZoneInfo.ConvertTimeToUtc(dateTime, timeZoneValue);
            return uTCFromDateTime;
        }

        public DateTime GetDatetimeValueFromUTC(DateTime dateTime, string timeZone)
        {
            TimeZoneInfo timeZoneValue = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
            var uTCFromDateTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime, timeZoneValue);
            return uTCFromDateTime;
        }

        public async  Task<List<DisplayNameValueDto>> GetTimeZonesList()
        {
            IReadOnlyCollection<TimeZoneInfo> zones = TimeZoneInfo.GetSystemTimeZones();

            List<DisplayNameValueDto> result = new List<DisplayNameValueDto>();
            foreach (var zone in zones)
            {
                result.Add(new DisplayNameValueDto { label = zone.DisplayName.ToString(), Value = zone.Id });
            }
            return result;
        }

        
    }
}
