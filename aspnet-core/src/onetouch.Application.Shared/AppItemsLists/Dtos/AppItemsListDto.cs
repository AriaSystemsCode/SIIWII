using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;

namespace onetouch.AppItemsLists.Dtos
{
    public class AppItemsListDto : EntityDto<long>
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public byte SharingLevel { get; set; }

        public bool Published { get; set; }

        public DateTime CreationTime { get; set; }
        
        public string CreatorUserName { get; set; }

        public string ImgURL { get; set; }

        public int ItemsCount { get; set; }
        
        public long? TenantId { get; set; }

        public string StatusCode { get; set; }
        public long? StatusId { get; set; }
    }


}