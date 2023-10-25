
using System;
using Abp.Application.Services.Dto;

namespace onetouch.AccountInfos.Dtos
{
    public class AccountInfoDto : EntityDto<long>
    {
		public string Code { get; set; }

		public string TradeName { get; set; }

		public byte AccountType { get; set; }

		public string Notes { get; set; }

		public string Website { get; set; }

		public string Name { get; set; }

		public string Phone1Number { get; set; }

		public string Phone1Ext { get; set; }

		public string Phone2Number { get; set; }

		public string Phone2Ext { get; set; }

		public string Phone3Number { get; set; }

		public string Phone3Ext { get; set; }

		public string EMailAddress { get; set; }


		 public long? Phone1TypeId { get; set; }

		 		 public long? Phone2TypeId { get; set; }

		 		 public long? Phone3TypeId { get; set; }

		 		 public long CurrencyId { get; set; }

		 		 public long LanguageId { get; set; }

		 
    }
}