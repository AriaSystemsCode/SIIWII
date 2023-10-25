using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AppEntities.Dtos;

namespace onetouch.AccountInfos.Dtos
{
    public class GetAccountInfoForEditOutput
    {
		public CreateOrEditAccountInfoDto AccountInfo { get; set; }

		public string Phone1TypeName { get; set;}

		public string Phone2TypeName { get; set;}

		public string Phone3TypeName { get; set;}

		public string CurrencyName { get; set;}

		public string LanguageName { get; set;}
		public bool LastChangesIsPublished { get; set; }
	}
}