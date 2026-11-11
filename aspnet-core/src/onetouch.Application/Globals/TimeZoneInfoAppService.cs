using Abp.Authorization;
using onetouch.Globals.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TimeZoneConverter;

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
             
            try
            {
                var timeZoneValue = TimeZoneInfo.FindSystemTimeZoneById(timeZone);
                var uTCFromDateTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime, timeZoneValue);
                return uTCFromDateTime;

            }
            catch(Exception ex)
            {

                TimeZoneInfo timeZoneValue = TZConvert.GetTimeZoneInfo(timeZone);
                var uTCFromDateTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime, timeZoneValue);
                return uTCFromDateTime;
            }
            return dateTime;


        }
        //[AbpAllowAnonymous]
        //public async  Task<List<DisplayNameValueDto>> GetTimeZonesList()
        //{
        //    IReadOnlyCollection<TimeZoneInfo> zones = TimeZoneInfo.GetSystemTimeZones();

        //    List<DisplayNameValueDto> result = new List<DisplayNameValueDto>();
        //    foreach (var zone in zones)
        //    {
        //        result.Add(new DisplayNameValueDto { label = zone.DisplayName.ToString(), Value = zone.Id });
        //    }
        //    return result;
        //}
        [AbpAllowAnonymous]
        public async Task<List<DisplayNameValueDto>> GetTimeZonesList()
        {
            var result = TimeZoneInfo.GetSystemTimeZones()
                .Select(zone =>
                {
                    var offset = zone.GetUtcOffset(DateTime.UtcNow);

                    string sign = offset >= TimeSpan.Zero ? "+" : "-";

                    string currentOffset =
                        $"UTC{sign}{Math.Abs(offset.Hours):00}:{Math.Abs(offset.Minutes):00}";

                    return new DisplayNameValueDto
                    {
                        label = $"({currentOffset}) {zone.StandardName}",
                        Value = zone.Id
                    };
                })
                .OrderBy(x => x.label)
                .ToList();

            return result;
        }

    }
}
