
using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using onetouch.AppItems.Dtos;

namespace onetouch.SystemObjects.Dtos
{
    public class GetAllEntityObjectTypeOutput : EntityDto<long>
    {
		public string Code { get; set; }

		public string Name { get; set; }

        public string ExtraAttributesString { get; set; }

        public ItemExtraAttributes ExtraAttributes { get; set; }
    }

}