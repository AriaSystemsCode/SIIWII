
using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using onetouch.AccountInfos.Dtos;
using onetouch.AppContacts.Dtos;
using onetouch.AppEntities.Dtos;
using onetouch.Common;

namespace onetouch.Accounts.Dtos
{
    public class ContactDto : EntityDto<long>
	{
		public string Code { get; set; }

		public string Name { get; set; }
		
		public string FirstName { get; set; }
		
		public string LastName { get; set; }
		
		public long? TitleId { get; set; }

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

		public virtual IList<AppContactAddressDto> ContactAddresses { get; set; }
		//Mariam
		public long? UserId { get; set; }
		public long AccountId { set; get; }

		public string JobTitle  { set; get; }
		public DateTime JoinDate { set; get; }
		public bool LanguageIsPublic { set; get; }
		public bool EmailAddressIsPublic { set; get; } = true;
		public bool Phone1IsPublic { set; get; } = true;
        public bool Phone2IsPublic { set; get; } = true;
        public bool Phone3IsPublic { set; get; } = true;

        public bool JoinDateIsPublic { set; get; }
		public string UserName { set; get; }
		public bool UserNameIsPublic { set; get; }
		public string Notes { get; set; }
		public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }
		//Mariam
		public int? TenantId { get; set; }
		public int? AttachmentSourceTenantId { get; set; }
		public bool UseDTOTenant { get; set; }
		public string? SSIN { get; set; }
	}
}