
using System;
using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SycEntityObjectTypeDto : EntityDto<long>
    {
        public string Code { get; set; }

        public string Name { get; set; }

        public string ExtraAttributes { get; set; }


        public long ObjectId { get; set; }

        public int? ParentId { get; set; }

        public long? SycIdentifierDefinitionId { get; set; }


    }
}