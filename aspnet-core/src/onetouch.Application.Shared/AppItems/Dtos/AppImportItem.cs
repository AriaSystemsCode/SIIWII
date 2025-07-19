using System;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;

namespace onetouch.AppItems.Dtos
{
    public class ImportItemInputDto
    {
        [Required(ErrorMessage = "Product Type must have a value.")]
        public string ProductType { get; set; }
        [Required(ErrorMessage = "Record Type must have a value.")]
        [Range(typeof(string), "Item", "Item Variant", ErrorMessage = "Record Type must be Item or Item Variant")]
        public string RecordType { set; get; }
        [Required(ErrorMessage = "Code must have a value.")]
        public string Code { set; get; }
        [Required(ErrorMessage = "Name must have a value.")]
        public string Name { set; get; }
        [Required(ErrorMessage = "Product Description must have a value.")]
        public string ProductDescription { set; get; }
        public string ProductClassificationCode { set; get; }
        public string ProductCategoryCode { set; get; }
        public string Price { set; get; }
        public string PriceCurrencyCode { set; get; }
        public string ImageType { set; get; }
        public string ColorCode { set; get; }
        public string ColorName { set; get; }
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
        public string ParentCode { set; get; }
        public string ProductClassificationDescription { set; get; }
        public string ProductCategoryDescription { set; get; }
        public string SizeCode { set; get; }
        public string SizeName { set; get; }
        public string Dimension1Position { set; get; }
        public string Dimension2Position { set; get; }
        public string Dimension3Position { set; get; }
    }

}