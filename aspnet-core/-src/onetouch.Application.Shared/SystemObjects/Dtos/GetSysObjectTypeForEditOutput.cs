using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class GetSysObjectTypeForEditOutput
    {
		public CreateOrEditSysObjectTypeDto SysObjectType { get; set; }

		public string SysObjectTypeName { get; set;}


    }
}