
using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using onetouch.AppContacts.Dtos;

namespace onetouch.AccountInfos.Dtos
{
    public class BranchDto : EntityDto<long>
    {

        public string Code { get; set; }

        public string Name { get; set; }

		public string TradeName { get; set; }

		public long? ParentId { get; set; }

		public string Website { get; set; }

		public virtual string Phone1CountryKey { get; set; }

		public string Phone1Number { get; set; }

		public string Phone1Ext { get; set; }

		public virtual string Phone2CountryKey { get; set; }

		public string Phone2Number { get; set; }

		public string Phone2Ext { get; set; }

		public virtual string Phone3CountryKey { get; set; }

		public string Phone3Number { get; set; }

		public string Phone3Ext { get; set; }

		public string EMailAddress { get; set; }

		public long? Phone1TypeId { get; set; }

		public string Phone1TypeName { get; set; }

		public long? Phone2TypeId { get; set; }

		public string Phone2TypeName { get; set; }

		public long? Phone3TypeId { get; set; }

		public string Phone3TypeName { get; set; }
	 
		public long? CurrencyId { get; set; }

		public string CurrencyName { get; set; }

		public long? LanguageId { get; set; }

		public string LanguageName { get; set; }
		public int? AttachmentSourceTenantId { get; set; }
		public virtual IList<AppContactAddressDto> ContactAddresses { get; set; }

		//Mariam
		public long? AccountId { set; get; }
		//Mariam

		public int? TenantId { get; set; }
		public bool UseDTOTenant { get; set; }
	}
}