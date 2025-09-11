
using System;
using Abp.Application.Services.Dto;

namespace onetouch.AccountInfos.Dtos
{
    public class AccountSummaryDto
    {
		public string Name { get; set; }

		public string TradeName { get; set; }

		public string AccountType { get; set; }

		public string Notes { get; set; }

		public string Website { get; set; }

		public string PhoneNumber { get; set; }

		public string EMailAddress { get; set; }

		public string LogoUrl { get; set; }


	}
}