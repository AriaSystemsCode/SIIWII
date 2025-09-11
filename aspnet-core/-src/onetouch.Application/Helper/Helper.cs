using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using onetouch.Globals;

namespace onetouch.Helpers
{
    public class Helper
    {
        private SystemTables _systemTables;
        private ExcelHelper _excelHelper;
        public Helper(SystemTables systemTables, ExcelHelper excelHelper)
        {
            _systemTables = systemTables;
            _excelHelper = excelHelper;
        }

        public DateTime GetUTCDatetimeValueFromDateAndTime(DateTime dateOnly, DateTime timeOnly,string timeZone)
        {
            DateTime fromDateTime = new DateTime(dateOnly.Year, dateOnly.Month, dateOnly.Day,
                            timeOnly.Hour, timeOnly.Minute, timeOnly.Second);

            TimeZoneInfoAppService timeZoneInfoAppService = new TimeZoneInfoAppService();
            return timeZoneInfoAppService.GetUTCDatetimeValue(fromDateTime,  timeZone);

        }

        public DateTime GetDatetimeValueFromUTC(DateTime fromDateTime, string fromTimeZone)
        {
            TimeZoneInfoAppService timeZoneInfoAppService = new TimeZoneInfoAppService();
            return timeZoneInfoAppService.GetDatetimeValueFromUTC(fromDateTime, fromTimeZone);

        }

        public SystemTables SystemTables   
        {
            get { return _systemTables; }
        }
        //MMT30
        public string StringMask(string mask, string value)
        {
            var builder = new System.Text.StringBuilder();
            var maskIndex = 0;
            var valueIndex = 0;
            while (maskIndex < mask.Length)
            {
                if (mask[maskIndex] == '-')
                {
                    builder.Append('-');
                    maskIndex++;
                }
                else
                {
                    if(valueIndex < value.Length)
                      builder.Append(value[valueIndex]);
                    else
                      builder.Append(" ");

                    maskIndex++;
                    valueIndex++;
                }
            }
            // Add in the remainder of the value
            if (valueIndex + 1 < value.Length)
            {
                builder.Append(value.Substring(valueIndex));
            }
            return builder.ToString();
        }
        //MMT30
        public string HtmlToPlainText(string html)
        {
            const string tagWhiteSpace = @"(>|$)(\W|\n|\r)+<";//matches one or more (white space or line breaks) between '>' and '<'
            const string stripFormatting = @"<[^>]*(>|$)";//match any character between '<' and '>', even when end tag is missing
            const string lineBreak = @"<(br|BR)\s{0,1}\/{0,1}>";//matches: <br>,<br/>,<br />,<BR>,<BR/>,<BR />
            var lineBreakRegex = new Regex(lineBreak, RegexOptions.Multiline);
            var stripFormattingRegex = new Regex(stripFormatting, RegexOptions.Multiline);
            var tagWhiteSpaceRegex = new Regex(tagWhiteSpace, RegexOptions.Multiline);

            var text = html;
            //Decode html specific characters
            text = System.Net.WebUtility.HtmlDecode(text);
            //Remove tag whitespace/line breaks
            text = tagWhiteSpaceRegex.Replace(text, "><");
            //Replace <br /> with line breaks
            text = lineBreakRegex.Replace(text, Environment.NewLine);
            //Strip formatting
            text = stripFormattingRegex.Replace(text, string.Empty);

            return text;
        }

        public ExcelHelper ExcelHelper
        {
            get { return _excelHelper; }
        }
    }
}
