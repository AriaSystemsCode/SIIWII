using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppItemsLists.Dtos
{
    public class GetAppItemsListForEditOutput
    {
        public CreateOrEditAppItemsListDto AppItemsList { get; set; }
        public long? TenantId { get; set; }
    }
}