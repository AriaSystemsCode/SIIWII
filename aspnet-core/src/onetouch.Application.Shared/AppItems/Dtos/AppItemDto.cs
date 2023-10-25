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
    }
}