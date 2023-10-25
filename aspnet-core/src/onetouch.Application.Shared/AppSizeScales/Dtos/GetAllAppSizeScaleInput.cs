using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppSizeScales.Dtos
{
    public class GetAllAppSizeScaleInput :  PagedAndSortedResultRequestDto
    {
        
        public string Filter { get; set; }
        public long? ParentId { get; set; } = null;

    }
}
