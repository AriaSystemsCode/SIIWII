
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AppContacts.Dtos;

namespace onetouch.Accounts.Dtos
{
    public class CreateOrEditAccountDto : EntityDto<long?>
    {

		[Required]
		[StringLength(AccountConsts.MaxNameLength, MinimumLength = AccountConsts.MinNameLength)]
		public string Name { get; set; }


		[Required]
		[StringLength(AccountConsts.MaxNameLength, MinimumLength = AccountConsts.MinNameLength)]
		public string TradeName { get; set; }

		[Required]
		//[StringLength(AccountConsts.MaxCityLength, MinimumLength = AccountConsts.MinCityLength)]
		public int AccountType { get; set; }
		
		
		//[Required]
		public long? CurrencyId { get; set; }


		//[Required]
		public long? LanguageId { get; set; }

		public string About { get; set; }

		public virtual string Phone1CountryKey { get; set; }

		public string Phone1Number { get; set; }

		public string Phone1Ext { get; set; }

		public virtual string Phone2CountryKey { get; set; }

		public string Phone2Number { get; set; }

		public string Phone2Ext { get; set; }

		public virtual string Phone3CountryKey { get; set; }

		public string Phone3Number { get; set; }

		public string Phone3Ext { get; set; }

		public long? Phone1TypeId { get; set; }

		public long? Phone2TypeId { get; set; }

		public long? Phone3TypeId { get; set; }

		public virtual IList<AppContactAddressDto> ContactAddresses { get; set; }
		public virtual IList<AppContactPaymentMethodDto> ContactPaymentMethods { get; set; }

	}
}