using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppItemSelectors.Dtos
{
    public class CreateOrEditAppItemSelectorDto : EntityDto<long?>
    {

        public Guid Key { get; set; }

        public long SelectedId { get; set; }

    }
}