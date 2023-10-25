using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;
using System.Collections.Generic;

namespace onetouch.AppContacts
{
	//Code,Name,TradeName,LanguageId,LanguageCode,CurrencyId,CurrencyCode,EMailAddress,Website,EntityId,EntityCode,ParentId,ParentCode,PartnerId,PartnerCode,TenantId,AccountType,IsProfileData,Phone1TypeId,Phone1TypeName,Phone1Number,Phone1Ext,Phone2TypeId,Phone2TypeName,Phone2Number,Phone2Ext,Phone3TypeId,Phone3TypeName,Phone3Number,Phone3Ext
	[Table("AppContacts")]
    [Audited]
    public class AppContact : FullAuditedEntity<long> , IMayHaveTenant
    {
			public int? TenantId { get; set; }
			

		[Required]
		[StringLength(AppContactConsts.MaxNameLength, MinimumLength = AppContactConsts.MinNameLength)]
		public virtual string Name { get; set; }

		[Required]
		[StringLength(AppContactConsts.MaxNameLength, MinimumLength = AppContactConsts.MinNameLength)]
		public virtual string TradeName { get; set; }

		[StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
		public virtual string Code { get; set; }
		
		public virtual long? LanguageId { get; set; }

		[StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
		public virtual string LanguageCode { get; set; }
		
		public virtual long? CurrencyId { get; set; }

		[StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
		public virtual string CurrencyCode { get; set; }

		[StringLength(AppContactConsts.MaxEMailLength, MinimumLength = AppContactConsts.MinEMailLength)]
		public virtual string EMailAddress { get; set; }

		[StringLength(AppContactConsts.MaxEMailLength, MinimumLength = AppContactConsts.MinEMailLength)]
		public virtual string Website { get; set; }

		public virtual long EntityId { get; set; }

		[StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
		public virtual string EntityCode { get; set; }

		//public virtual long? AccountId { get; set; }

		public virtual long? ParentId { get; set; }

		[StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
		public virtual string ParentCode { get; set; }

		public virtual long? PartnerId { get; set; }

		[StringLength(AppContactConsts.MaxCodeLength, MinimumLength = AppContactConsts.MinCodeLength)]
		public virtual string PartnerCode { get; set; }

		public virtual string AccountType { get; set; }
        public virtual long AccountTypeId { get; set; }
        public virtual string SSIN { get; set; }
        public virtual string PriceLevel { get; set; }

        public virtual bool IsProfileData { get; set; }

		public virtual long? Phone1TypeId { get; set; }

		[StringLength(AppContactConsts.MaxNameLength, MinimumLength = AppContactConsts.MinNameLength)]
		public virtual string Phone1TypeName { get; set; }

		[StringLength(AppContactConsts.MaxPhoneCKLength, MinimumLength = AppContactConsts.MinPhoneCKLength)]
		public virtual string Phone1CountryKey { get; set; }

		[StringLength(AppContactConsts.MaxPhoneNumberLength, MinimumLength = AppContactConsts.MinPhoneNumberLength)]
		public virtual string Phone1Number { get; set; }

		[StringLength(AppContactConsts.MaxPhoneEXLength, MinimumLength = AppContactConsts.MinPhoneEXLength)]
		public virtual string Phone1Ext { get; set; }

		public virtual long? Phone2TypeId { get; set; }

		[StringLength(AppContactConsts.MaxNameLength, MinimumLength = AppContactConsts.MinNameLength)]
		public virtual string Phone2TypeName { get; set; }

		[StringLength(AppContactConsts.MaxPhoneCKLength, MinimumLength = AppContactConsts.MinPhoneCKLength)]
		public virtual string Phone2CountryKey { get; set; }

		[StringLength(AppContactConsts.MaxPhoneNumberLength, MinimumLength = AppContactConsts.MinPhoneNumberLength)]
		public virtual string Phone2Number { get; set; }

		[StringLength(AppContactConsts.MaxPhoneEXLength, MinimumLength = AppContactConsts.MinPhoneEXLength)]
		public virtual string Phone2Ext { get; set; }

		public virtual long? Phone3TypeId { get; set; }

		[StringLength(AppContactConsts.MaxNameLength, MinimumLength = AppContactConsts.MinNameLength)]
		public virtual string Phone3TypeName { get; set; }

		[StringLength(AppContactConsts.MaxPhoneCKLength, MinimumLength = AppContactConsts.MinPhoneCKLength)]
		public virtual string Phone3CountryKey { get; set; }

		[StringLength(AppContactConsts.MaxPhoneNumberLength, MinimumLength = AppContactConsts.MinPhoneNumberLength)]
		public virtual string Phone3Number { get; set; }

		[StringLength(AppContactConsts.MaxPhoneEXLength, MinimumLength = AppContactConsts.MinPhoneEXLength)]
		public virtual string Phone3Ext { get; set; }


		[ForeignKey("LanguageId")]
		public virtual AppEntity LanguageFk { get; set; }

		[ForeignKey("CurrencyId")]
		public virtual AppEntity CurrencyFk { get; set; }

		[ForeignKey("EntityId")]
		public virtual AppEntity EntityFk { get; set; }

		//[ForeignKey("ParentId")]
		public virtual AppContact ParentFk { get; set; }

		//[ForeignKey("PartnerId")]
		public virtual AppContact PartnerFk { get; set; }

		[ForeignKey("Phone1TypeId")]
		public virtual AppEntity Phone1TypeFk { get; set; }

		[ForeignKey("Phone2TypeId")]
		public virtual AppEntity Phone2TypeFk { get; set; }

		[ForeignKey("Phone3TypeId")]
		public virtual AppEntity Phone3TypeFk { get; set; }

		//MARIAM
		public virtual long? AccountId { get; set; }
		[ForeignKey("AccountId")]
		public virtual AppContact AccountFk { get; set; }
		//Mariam

		public ICollection<AppContact> ParentFkList { get; set; }

		public ICollection<AppContact> PartnerFkList { get; set; }

		public ICollection<AppContactAddress> AppContactAddresses { get; set; }

		public ICollection<AppContactPaymentMethod> AppContactPaymentMethods { get; set; }


	}
}