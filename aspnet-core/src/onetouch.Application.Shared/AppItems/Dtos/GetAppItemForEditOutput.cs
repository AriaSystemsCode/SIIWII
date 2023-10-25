using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppItems.Dtos
{
    public class GetAppItemForEditOutput
    {
        public AppItemForEditDto AppItem { get; set; }

    }
}