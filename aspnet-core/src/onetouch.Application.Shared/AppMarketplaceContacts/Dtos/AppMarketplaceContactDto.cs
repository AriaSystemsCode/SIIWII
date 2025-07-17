using Abp.Application.Services.Dto;
using onetouch.Accounts.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppMarketplaceContacts.Dtos
{
    public class AppMarketplaceContactDto : EntityDto<long>
	{
		public int? TenantId { get; set; }

		public virtual string Name { get; set; }

		public virtual string TradeName { get; set; }

		public virtual string Code { get; set; }

		public virtual long? LanguageId { get; set; }

		public virtual string LanguageCode { get; set; }

		public virtual long? CurrencyId { get; set; }

		public virtual string CurrencyCode { get; set; }

		public virtual string EMailAddress { get; set; }

		public virtual string Website { get; set; }

		public virtual long EntityId { get; set; }

		public virtual string EntityCode { get; set; }

		public virtual long? ParentId { get; set; }

		public virtual string ParentCode { get; set; }

		public virtual long? PartnerId { get; set; }

		public virtual string PartnerCode { get; set; }

		public virtual string AccountType { get; set; }
        public virtual long AccountTypeId { get; set; }
        public virtual string SSIN { get; set; }
        public virtual string PriceLevel { get; set; }

        public virtual bool IsProfileData { get; set; }

		public virtual long? Phone1TypeId { get; set; }

		public virtual string Phone1TypeName { get; set; }

		public virtual string Phone1Number { get; set; }

		public virtual string Phone1Ext { get; set; }

		public virtual long? Phone2TypeId { get; set; }

		public virtual string Phone2TypeName { get; set; }

		public virtual string Phone2Number { get; set; }

		public virtual string Phone2Ext { get; set; }

		public virtual long? Phone3TypeId { get; set; }

		public virtual string Phone3TypeName { get; set; }

		public virtual string Phone3Number { get; set; }

		public virtual string Phone3Ext { get; set; }
		//Mariam
		public virtual long? AccountId { get; set; }
		//Mariam
		public virtual IList<AppMarketplaceContactAddressDto> ContactAddresses { get; set; }

	}

	public enum PriceLevel
	{
		A,
		B,
		C,
		D,
		MSRP,
    }
    public class GetMarketplaceAccountForViewDto
    {
        public AccountDto Account { get; set; }

        public string AppEntityName { get; set; }

        //MMT10
        public bool IsPublished { get; set; }
        public string AllowedAction { get; set; }

        public string AvaliableConnectionName { get; set; }
        public string ConnectionName { get; set; }

        //MMT10
    }



}
