
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSycEntityObjectClassificationDto : EntityDto<int?>
    {

        [Required]
        [StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
        public string Code { get; set; }


        [Required]
        [StringLength(SycEntityObjectClassificationConsts.MaxNameLength, MinimumLength = SycEntityObjectClassificationConsts.MinNameLength)]
        public string Name { get; set; }

        public long? ObjectId { get; set; }

        public int? ParentId { get; set; }


    }
}