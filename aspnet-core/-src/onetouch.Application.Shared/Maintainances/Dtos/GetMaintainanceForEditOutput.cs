using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.Maintainances.Dtos
{
    public class GetMaintainanceForEditOutput
    {
        public CreateOrEditMaintainanceDto Maintainance { get; set; }

    }
}