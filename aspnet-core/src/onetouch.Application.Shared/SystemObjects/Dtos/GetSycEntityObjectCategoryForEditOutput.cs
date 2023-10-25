using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class GetSycEntityObjectCategoryForEditOutput
    {
		public CreateOrEditSycEntityObjectCategoryDto SycEntityObjectCategory { get; set; }

		public string SydObjectName { get; set;}

		public string SycEntityObjectCategoryName { get; set;}


    }
}