using onetouch.Globals.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppItems.Dtos
{
    public class AppItemStockAvailabilityExcelResultsDTO
    {
        public ExcelLogDto ExcelLogDTO { get; set; }
        public Int32 TotalRecords { get; set; }
        public List<string> CodesFromList { get; set; }
        public List<Int32> FromList { get; set; }
        public Int32 From { get; set; }
        public List<Int32> ToList { get; set; }
        public Int32 To { get; set; }
        public Int32 TotalPassedRecords { get; set; }

        public Int32 TotalFailedRecords { get; set; }

       // public ExcelRecordRepeateHandler RepreateHandler { get; set; }

        public List<AppItemStockAvailabilityExcelRecordDTO> ExcelRecords { get; set; }

        public string FilePath { get; set; }

        public string ErrorMessage { get; set; }
        public bool HasDuplication { get; set; } = false;
    }
    public class AppItemStockAvailabilityExcelRecordDTO
    {
        public string ParentCode { get; set; }

        public string Code { get; set; }
        public long StockAvailable { get; set; }

        public List<string> FieldsErrors { get; set; }

        public AppItemStockAvailabilityExcelDto  ExcelDto { get; set; }

        /// <summary>
        /// Passed, Failed, Warning
        /// </summary>
        public string Status { get; set; }
        /// <summary>
        /// Duplicated Account/Branch/Person [and status Warning when record duplicated]
        /// Wrong data in this Account/Branch/Person. check this record in the sheet and update [and status failed when failed]
        /// Empty when status passed
        /// </summary>
        public string ErrorMessage { get; set; }

    }
    public class AppItemStockAvailabilityExcelDto
    {
        public long Id { get; set; }
        public Int32 rowNumber { get; set; }
        public string StockAvailable{ get; set; }
        public string Code { get; set; }
        public string ParentCode { get; set; }
    }
}
