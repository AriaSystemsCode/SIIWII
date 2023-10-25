using System;
using System.Collections.Generic;
using System.Text;
using Abp.Application.Services;
using onetouch.Globals.Dtos;
using System.Threading.Tasks;

namespace onetouch.Globals
{
    public interface ITimeZoneInfoAppService : IApplicationService
    {
         Task<List<DisplayNameValueDto>> GetTimeZonesList();
        DateTime GetUTCDatetimeValue(DateTime dateTime, string timeZone);
        DateTime GetDatetimeValueFromUTC(DateTime dateTime, string timeZone);
        
    }
}
