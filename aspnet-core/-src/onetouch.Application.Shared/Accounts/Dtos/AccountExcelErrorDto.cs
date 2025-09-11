using onetouch.Globals.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace onetouch.Accounts.Dtos
{
    public class AccountExcelResultsDTO
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

        public List<AccountExcelRecordDTO> ExcelRecords { get; set; }

        public string FilePath { get; set; }

        public string ErrorMessage { get; set; }
        public bool HasDuplication { get; set; } = true;
    }

    public class AccountExcelRecordDTO
    {
        public string RecordType { get; set; }

        public string ParentCode { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        public List<string> FieldsErrors { get; set; }

        public AccountExcelDto ExcelDto { get; set; }

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

        public string image1Type { get; set; }
        public string image1 { get; set; }
        public string image2Type { get; set; }
        public string image2 { get; set; }
        public string image3Type { get; set; }
        public string image3 { get; set; }
        public string image4Type { get; set; }
        public string image4 { get; set; }
        public string image5Type { get; set; }
        public string image5 { get; set; }

    }

    //public class AccountExcelTemplateDto
    //{
    //    public string AccountExcelTemplatePath { get; set; }
    //    public string AccountExcelTemplateFile { get; set; }
    //    public string AccountExcelTemplateFullPath { get; set; }
    //    public string AccountExcelTemplateDate { get; set; }
    //    public string AccountExcelTemplateVersion { get; set; }

    //}

    public class AccountExcelLogDto
    {
        public string AccountExcelLogPath { get; set; }
        public string AccountExcelLogFileName { get; set; }
    }
    //public enum AccountExcelRecordStatus
    //{
    //    Passed,
    //    Failed,
    //    Warning,
    //}
    public enum AccountExcelRecordType
    {
        Account,
        Branch,
        Contact,
    }
    public enum AccountExcelAccountType
    {
        Seller,
        Buyer,
        Both,
    }
    //public enum AccountExcelRecordRepeateHandler
    //{
    //    [Display(Name = "Ignore duplicated records")]
    //    IgnoreDuplicatedRecords = 0,
    //    [Display(Name = "Replace duplicated records")]
    //    ReplaceDuplicatedRecords = 1,
    //    [Display(Name = " Create a copy")]
    //    CreateACopy = 2,
    //}

}
