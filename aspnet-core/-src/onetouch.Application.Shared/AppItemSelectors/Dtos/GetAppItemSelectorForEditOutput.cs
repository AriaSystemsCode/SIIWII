using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppItemSelectors.Dtos
{
    public class GetAppItemSelectorForEditOutput
    {
        public CreateOrEditAppItemSelectorDto AppItemSelector { get; set; }

    }
}