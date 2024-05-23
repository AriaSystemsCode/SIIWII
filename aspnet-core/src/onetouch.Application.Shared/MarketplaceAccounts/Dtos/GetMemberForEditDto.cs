using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.MarketplaceAccounts.Dtos
{
    public class GetMemberForEditDto : EntityDto<long?>
    {
		public string Code { get; set; }

		public string Name { get; set; }

		public string FirstName { get; set; }

		public string SurName { get; set; }

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

//		public virtual IList<AppContactAddressDto> ContactAddresses { get; set; }
		public long AccountId { set; get; }

		public string JobTitle { set; get; }
		public DateTime JoinDate { set; get; }
		public bool LanguageIsPublic { set; get; }
		public bool EmailAddressIsPublic { set; get; }
		public bool Phone1IsPublic { set; get; }
		public bool Phone2IsPublic { set; get; }
		public bool Phone3IsPublic { set; get; }

		public bool JoinDateIsPublic { set; get; }
		public string UserName { set; get; }
		public bool UserNameIsPublic { set; get; }
		public string Notes { get; set; }
		public string PhotoImageUrl { get; set; }
		public string CoverImageUrl { get; set; }
		
	}
}
