
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSycEntityObjectTypeDto : EntityDto<int?>
    {

        [Required]
        [StringLength(SycEntityObjectTypeConsts.MaxCodeLength, MinimumLength = SycEntityObjectTypeConsts.MinCodeLength)]
        public string Code { get; set; }


        [Required]
        [StringLength(SycEntityObjectTypeConsts.MaxNameLength, MinimumLength = SycEntityObjectTypeConsts.MinNameLength)]
        public string Name { get; set; }


        public string ExtraAttributes { get; set; }


        public long ObjectId { get; set; }

        public int? ParentId { get; set; }
        public long? SycIdentifierDefinitionId { get; set; }

    }
}