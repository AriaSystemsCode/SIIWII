using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AppEntities.Dtos
{
    public class GetAppEntityForEditOutput
    {
		public CreateOrEditAppEntityDto AppEntity { get; set; }

		public string SycEntityObjectTypeName { get; set;}

		public string SycEntityObjectStatusName { get; set;}

		public string SydObjectName { get; set;}


    }
}