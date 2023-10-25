using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class GetSydObjectForEditOutput
    {
		public CreateOrEditSydObjectDto SydObject { get; set; }

		public string SysObjectTypeName { get; set;}

		public string SydObjectName { get; set;}


    }
}