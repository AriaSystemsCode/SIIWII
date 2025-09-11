using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Dynamic;
using System.Text;

namespace onetouch.Globals.Dtos
{
    
    public class ExcelTemplateDto
    {
        public string ExcelTemplatePath { get; set; }
        public string ExcelTemplateFile { get; set; }
        public string ExcelTemplateFullPath { get; set; }
        public string ExcelTemplateDate { get; set; }
        public string ExcelTemplateVersion { get; set; }
    }
    public class ExcelResultsDTO
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

        public ExcelRecordRepeateHandler RepreateHandler { get; set; }

        public List<ExpandoObject> ExcelRecords { get; set; }

        public string FilePath { get; set; }

        public string ErrorMessage { get; set; }
    }
    public class ExcelLogDto
    {
        public string ExcelLogPath { get; set; }
        public string ExcelLogFileName { get; set; }
    }
    public enum ExcelRecordRepeateHandler 
    {
        [Display(Name = "Ignore duplicated records")]
        IgnoreDuplicatedRecords = 0,
        [Display(Name = "Replace duplicated records")]
        ReplaceDuplicatedRecords = 1,
        [Display(Name = " Create a copy")]
        CreateACopy = 2,
    }
    
   
    
    public class ExcelRecordDTO 
    {
        public string RecordType { get; set; }

        public string ParentCode { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        public List<string> FieldsErrors { get; set; }

        public dynamic ExcelDto { get; set; }

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

        public string imageType { get; set; }
        public string image { get; set; }
    }
    public enum ExcelRecordStatus
    {
        Passed,
        Failed,
        Warning,
    }
    public class ExcelDto 
    {
        public Int32 rowNumber { get; set; }
        public string RecordType { get; set; }
        public string ParentCode { get; set; }
        public long? ParentId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
               
        public string ErrorMessage { get; set; }

        public string imageType { get; set; }
        public string image { get; set; }

    }
}
