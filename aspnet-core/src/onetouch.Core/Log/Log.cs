using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace onetouch.Log
{
    static public class Log
    {
        static public void WriteLog(string message)
        {
            try
            {
                var sitePhysicalPath = Environment.GetEnvironmentVariable("ASPNETCORE_IIS_PHYSICAL_PATH");
                if (string.IsNullOrEmpty(sitePhysicalPath)==false)
                {
                    File.AppendAllText(sitePhysicalPath+ "App_Data\\OneTouchLog.txt", message + System.Environment.NewLine);
                }
            }catch(Exception ex)
            { }
            
        }
    }
}
