using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class GetSycEntityObjectStatusForEditOutput
    {
		public CreateOrEditSycEntityObjectStatusDto SycEntityObjectStatus { get; set; }

		public string SydObjectName { get; set;}


    }
}