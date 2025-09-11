using System;
using Abp.Application.Services.Dto;

namespace onetouch.AppItemSelectors.Dtos
{
    public class AppItemSelectorDto : EntityDto<long>
    {
        public Guid Key { get; set; }

        public long SelectedId { get; set; }

    }
}