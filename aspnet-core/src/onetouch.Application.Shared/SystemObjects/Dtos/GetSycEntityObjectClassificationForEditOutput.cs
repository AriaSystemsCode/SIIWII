using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class GetSycEntityObjectClassificationForEditOutput
    {
		public CreateOrEditSycEntityObjectClassificationDto SycEntityObjectClassification { get; set; }

		public string SydObjectName { get; set;}

		public string SycEntityObjectClassificationName { get; set;}


    }
}