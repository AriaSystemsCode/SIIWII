using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace onetouch.AppItemsLists.Dtos
{
    public class CreateOrEditAppItemsListDto : EntityDto<long?>
    {

        [Required]
        [StringLength(AppItemsListConsts.MaxCodeLength, MinimumLength = AppItemsListConsts.MinCodeLength)]
        public string Code { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public byte SharingLevel { get; set; }

        public bool Published { get; set; }

        public DateTime CreationTime { get; set; }

        public PagedResultDto<CreateOrEditAppItemsListItemDto> AppItemsListItems { get; set; }

        public List<UserInfoDto> Users { get; set; }

        public int UsersCount { get; set; }
        public string StatusCode { get; set; }
        public long? StatusId { get; set; }

    }

    public class UserInfoDto
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string ImageURL { get; set; }

    }
}