using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SycServices.Dtos
{
    public class GetSycServiceForEditOutput
    {
        public CreateOrEditSycServiceDto SycService { get; set; }

    }
}