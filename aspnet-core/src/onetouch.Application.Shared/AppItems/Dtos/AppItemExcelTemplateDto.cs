using onetouch.Globals.Dtos;
using onetouch.SystemObjects.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Abp.Extensions;
namespace onetouch.AppItems.Dtos
{
    public class AppItemExcelDto
    {
        public long Id { get; set; }
        public Int32 rowNumber { get; set; }
        [Required(ErrorMessage = "Record Type must have a value.")]
        [Range(typeof(string), "Item", "Item Variant", ErrorMessage = "Record Type must be Item or Item Variant")]
        public string RecordType { get; set; }
        [Required(ErrorMessage = "Product Type must have a value.")]
        public string ProductType { get; set; }
        public string ProductClassificationCode { get; set; }
        public string ProductClassificationDescription { get; set; }
        public string ProductCategoryCode { get; set; }
        public string ProductCategoryDescription { get; set; }
        public string Price { get; set; }
        public string Currency { get; set; }
        public string ParentCode { get; set; }
        public string ImageType { get; set; }
        public string ImageFolderName { get; set; }
        public long ParentId { get; set; }
        public List<AppItemImpExtrAttributes> ExtraAttributesValues { get; set; }
        public List<ExtraAttribute> ExtraAttributes { get; set; }
        public List<AppItemImage> Images { set; get; }
        [Required(ErrorMessage = "Code must have a value.")]
        public string Code { get; set; }
        [Required(ErrorMessage = "Name must have a value.")]
        public string Name { get; set; }
        [Required(ErrorMessage = "Product Description must have a value.")]
        public string ProductDescription { get; set; }
        public long? EntityObjectClassificaionID { set; get; }
        public long? EntityObjectCategoryID { set; get; }
        //MMT
        public string SizeScaleName { set; get; }
        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
        //public string ScaleSizesOrder { set; get; }
        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
        public string SizeRatioName { set; get; }
        public string SizeRatioValue { set; get; }
        //mmt
        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[Start]
        public string NoOfDim { set; get; }
        public String D1Name { set; get; }
        public String D2Name { set; get; }
        public String D3Name { set; get; }
        public String D1Sizes { set; get; }
        public String D2Sizes { set; get; }
        public String D3Sizes { set; get; }
        public string D1Pos { set; get; }
        public string D2Pos { set; get; }
        public string D3Pos { set; get; }
        public string SizeCode { get; set; }
        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
    }
    public class AppItemImage
    {
        public string ImageFileName { get; set; }
        public string ImageGuid { get; set; }

    }
    public class AppItemExtraDto
    {
        public string ParentCode { get; set; }
        public long Id { get; set; }
        public string Value { get; set; }
    }
    public class AppItemImpExtrAttributes
    {
        public string Name { set; get; }
        public string Code { set; get; }
        public string Value { set; get; }
    }
    public class AppItemExcelResultsDTO
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

        public List<AppItemtExcelRecordDTO> ExcelRecords { get; set; }

        public string FilePath { get; set; }

        public string ErrorMessage { get; set; }
        public bool HasDuplication { get; set; }
    }
   
    
    public class AppItemtExcelRecordDTO
    {
        public string RecordType { get; set; }

        public string ParentCode { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }

        public List<string> FieldsErrors { get; set; }

        public AppItemExcelDto ExcelDto { get; set; }

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
    public enum ItemType
    { 
        Item, ItemVariant,
    }
    //MMT
    public class AppItemAttributePriceDto
    {
        public string AppItemCode { set; get; }
        public long AppItemId { set; get; }
        public string AttibuteCode { set; get; }
        public string AttributeValue { set; get; }
        public decimal Price { set; get; }
    }
    //MMT
}
