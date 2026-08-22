using Bytescout.Spreadsheet.COM;
using ClosedXML.Excel;
using ExcelDataReader;
using Newtonsoft.Json.Linq;
using onetouch.AppEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;


namespace onetouch.Helpers
{
    public class ExcelHelper
    {
        public DataSet GetExcelDataSet(string filePath)
        {
            using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
            {
                
                using (var reader = ExcelReaderFactory.CreateReader(stream))
                {
                    return reader.AsDataSet();
                }
            }
        }

        public bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        public bool IsValidWebsite(string uriName)
        {
            try
            {
                if (uriName.ToLower().StartsWith("www."))
                {
                    uriName = "http://" + uriName;
                }
                Uri uriResult;
                bool result = Uri.TryCreate(uriName, UriKind.Absolute, out uriResult)
                    && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
                return result;
            }
            catch
            {
                return false;
            }
        }

        public bool IsPhoneNumber(string number)
        {
            //return Regex.Match(number, @"^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$").Success;
            var xx = Regex.IsMatch(number, @"^1(?:\d{10}|0\d{9,10})$");
            return xx;
        }
        //I46 [Start]
        public  void ExportJsonToExcel(string filePath, string jsonData)
        {
            JArray dataArray = JArray.Parse(jsonData);
            
            using (XLWorkbook workbook = new XLWorkbook())
            {
                IXLWorksheet worksheet = workbook.Worksheets.Add();

                // handle weird JSON formatted data
                var headers = dataArray.First?.ToObject<JObject>().Properties().Select(z=>z.Name).ToList();
                if (headers == null || !headers.Any())
                {
                    throw new ArgumentException();
                }

                headers.Select((header, i) => worksheet.Cell(1, i + 1).Value = header).ToList();

                for (int rowIndex = 0; rowIndex < dataArray.Count; rowIndex++)
                {
                    JObject rowObj = (JObject)dataArray[rowIndex];
                    for (int colIndex = 0; colIndex < headers.Count; colIndex++)
                    {
                        string header = headers[colIndex];
                        worksheet.Cell(rowIndex + 2, colIndex + 1).Value = rowObj[header]?.ToString() ?? string.Empty;
                    }
                }

                // save as neat table
                worksheet.Range(1, 1, dataArray.Count + 1, headers.Count).CreateTable();

                workbook.SaveAs(filePath);
            }
        }
        //I46 {End}

        //public static void getExcelFile()
        //{

        //    //Create COM Objects. Create a COM object for everything that is referenced
        //    Excel.Application xlApp = new Excel.Application();
        //    Excel.Workbook xlWorkbook = xlApp.Workbooks.Open(@"C:\Users\E56626\Desktop\Teddy\VS2012\Sandbox\sandbox_test - Copy - Copy.xlsx");
        //    Excel._Worksheet xlWorksheet = xlWorkbook.Sheets[1];
        //    Excel.Range xlRange = xlWorksheet.UsedRange;

        //    int rowCount = xlRange.Rows.Count;
        //    int colCount = xlRange.Columns.Count;

        //    //iterate over the rows and columns and print to the console as it appears in the file
        //    //excel is not zero based!!
        //    for (int i = 1; i <= rowCount; i++)
        //    {
        //        for (int j = 1; j <= colCount; j++)
        //        {
        //            //new line
        //            if (j == 1)
        //                Console.Write("\r\n");

        //            //write the value to the console
        //            if (xlRange.Cells[i, j] != null && xlRange.Cells[i, j].Value2 != null)
        //                Console.Write(xlRange.Cells[i, j].Value2.ToString() + "\t");
        //        }
        //    }

        //    //cleanup
        //    GC.Collect();
        //    GC.WaitForPendingFinalizers();

        //    //rule of thumb for releasing com objects:
        //    //  never use two dots, all COM objects must be referenced and released individually
        //    //  ex: [somthing].[something].[something] is bad

        //    //release com objects to fully kill excel process from running in the background
        //    Marshal.ReleaseComObject(xlRange);
        //    Marshal.ReleaseComObject(xlWorksheet);

        //    //close and release
        //    xlWorkbook.Close();
        //    Marshal.ReleaseComObject(xlWorkbook);

        //    //quit and release
        //    xlApp.Quit();
        //    Marshal.ReleaseComObject(xlApp);
        //}
    }
}
