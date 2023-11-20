using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppItems.Dtos
{
    public class AppItemDto : EntityDto<long>
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public decimal Price { get; set; }
        
        public bool Published { get; set; }

        public bool Listed { get; set; }

        public virtual string ImageUrl { get; set; }
        //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[Start]
        public virtual string SSIN { get; set; }
        public virtual string SharingLevel { get; set; }
        //T-SII-20230618.0001,1 MMT 06/20/2023 Enhance Product browse page[End]
        public bool ShowItem { set; get; }
        public virtual string SellerName { get; set; }
        public virtual string ManufacturerCode { get; set; }
    }
}