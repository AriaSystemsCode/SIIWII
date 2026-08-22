using onetouch.Globals.Dtos;
using onetouch.SystemObjects.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Abp.Extensions;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Runtime.CompilerServices;
using System.Data;
namespace onetouch.AppItems.Dtos
{
    public partial class AppItemExcelDto
    {
        public long Id { get; set; }
        public Int32 rowNumber { get; set; }
        [Required(ErrorMessage = "Record Type must have a value.")]
        [RecordTypeValidation]
        public string RecordType { get; set; }
        [Required(ErrorMessage = "Product Type must have a value.")]
        public string ProductType { get; set; }
        public string ProductClassificationCode { get; set; }
        public string ProductClassificationDescription { get; set; }
        public string ProductCategoryCode { get; set; }
        public string ProductCategoryDescription { get; set; }
        public string Price { get; set; }
        public string PriceA { get; set; }
        public string PriceB { get; set; }
        public string PriceC { get; set; }
        public string PriceD { get; set; }
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
        public string D1Name { set; get; }
        public string D2Name { set; get; }
        public string D3Name { set; get; }
        public string D1Sizes { set; get; }
        public string D2Sizes { set; get; }
        public string D3Sizes { set; get; }
        public string D1Pos { set; get; }
        public string D2Pos { set; get; }
        public string D3Pos { set; get; }
        public string SizeCode { get; set; }
        //T-SII-20230328.0002,1 MMT 06/01/2023 Import multi-dimension size scale[End]
    }
    //I46[Start]
    public class ImportItemReturnDto
    { 
       public string RecordKey { set; get; }
       public string ErrorMessage{ set; get; }

       public string ErrorType { set; get; }
        public long? Id { set; get; }
    }
    public class ImportItemInputDto
    {
        [Required(ErrorMessage = "Product Type must have a value.")]
        public string ProductType { get; set; }

        [Required(ErrorMessage = "Record Type must have a value.")]
        //[Range(typeof(string), "Item", "Item Variant", ErrorMessage = "Record Type must be Item or Item Variant")]
        [RecordTypeValidation]
        public string RecordType{ set; get; }

        [Required(ErrorMessage = "Code must have a value.")]
        public string Code { set; get; }

        [Required(ErrorMessage = "Name must have a value.")]
        public string Name { set; get; }
        [Required(ErrorMessage = "Product Description must have a value.")]
        public string ProductDescription { set; get; }
        public string ProductClassificationCode { set; get; }
        public string ProductCategoryCode { set; get; }

        //[Range(1, long.MaxValue, ErrorMessage = "Price must be greater than 0")]
        [Required(ErrorMessage = "Price must have a value.")]
        public string Price { set; get; }

        [Required(ErrorMessage = "Currency must have a value.")]
        public string PriceCurrencyCode { set; get; }
        public string ImageType { set; get; }
        [Required(ErrorMessage = "Color Code must have a value.")]
        public string ColorCode { set; get; }
        [Required(ErrorMessage = "Color Name must have a value.")]
        public string ColorName{ set; get; }
        public string SizeScaleName { set; get; }
        public string ScaleSizesOrder { set; get; }
        public string SizeRatioName { set; get; }
        public string SizeRatioValue { set; get; }
        public string MaterialContent { set; get; }
        public string SoldOutDate { set; get; }
        public string BrandCode { set; get; }
        public string BrandName { set; get; }
        public string StartShipDate { set; get; }
        public string Dimension1Sizes { set; get; }
        public string Dimension2Sizes { set; get; }
        public string Dimension3Sizes { set; get; }
        public string Dimension1Name { set; get; }
        public string Dimension2Name { set; get; }
        public string Dimension3Name { set; get; }
        public string NoOfDimensions { set; get; }
        public string PriceA { set; get; }
        public string PriceB { set; get; }
        public string PriceC { set; get; }
        public string PriceD { set; get; }

        public string ParentCode  { set; get; }
        public string ProductClassificationDescription { set; get; }
        public string ProductCategoryDescription { set; get; }
        public string SizeCode{ set; get; }
        public string SizeName { set; get; }
        public string Dimension1Position { set; get; }
        public string Dimension2Position{ set; get; }
        public string Dimension3Position { set; get; }
  }
    //I46[End]
    public class AppItemImage
    {
        public string ImageFileName { get; set; }
        public string ImageGuid { get; set; }
        public bool IsDefault {  get; set; }
        public string Attributes { get; set; }
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
    public partial class AppItemExcelResultsDTO
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
        public string ResultKey { get; set; }
        public bool IsPagedResult { get; set; }
        public Int32 PageSkipCount { get; set; }
        public Int32 PageMaxResultCount { get; set; }
        public Int32 TotalDisplayRecords { get; set; }
    }
   
    
    public class AppItemtExcelRecordDTO
    {
        public int RecordIndex { get; set; }

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
        Item, ItemVariant,Color
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
    //Iteration#46[Start]
    public class AppItemValidationInputDTO: CreateOrEditAppItemDto
    {
        
        public List<string> ErrorMessages{ get; set; }

    }
    //Iteration#46[End]
}
