
using System;
using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SysObjectTypeDto : EntityDto<long>
    {
		public string Name { get; set; }

        public string Code { get; set; }
        public long? ParentId { get; set; }

		 
    }
}