using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.SystemObjects.Dtos
{
    public class GetSycEntityObjectTypeForEditOutput
    {
		public CreateOrEditSycEntityObjectTypeDto SycEntityObjectType { get; set; }

		public string SydObjectName { get; set;}

		public string SycEntityObjectTypeName { get; set;}
        public string IdentifierCode { get; set; }


    }
}