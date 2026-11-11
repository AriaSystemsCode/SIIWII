using Abp.Application.Services.Dto;
using onetouch.SystemObjects;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace onetouch.AppContacts.Dtos
{
    public class AppContactDto:EntityDto<long>
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
		public virtual IList<AppContactAddressDto> ContactAddresses { get; set; }
        //I46[Start]
        public virtual long? ShipViaId { get; set; }
        public virtual string ShipViaName { set; get; }
        public virtual string PaymentTermsName { get; set; }
        public virtual string ShipViaCode { get; set; }
        public virtual long? PaymentTermsId { get; set; }
        public virtual string PaymentTermsCode { get; set; }
        public virtual decimal PaymentTermsDiscount { get; set; }
        public virtual int PaymentTermsDiscountDays { get; set; }
        public virtual decimal PaymentTermsDiscount2 { get; set; }
        public virtual int PaymentTermsDiscount2Days { get; set; }
        public virtual bool PaymentTermsCashOnDelivery { get; set; }
        public virtual bool PaymentTermsUseInstallments { get; set; }
        public virtual int PaymentTermsNextMonthDay { get; set; }
        public virtual string PaymentTermsPaymentType { get; set; }
        public virtual bool PaymentTermsEndOfMonth { get; set; }
        public virtual int PaymentTermsEndOfMonthDays { get; set; }
        public virtual int PaymentTermsNetDueDays { get; set; }
        //I46[End]
        //I40[start]
        public virtual string Phone1CountryKey { get; set; }
        public virtual string Phone2CountryKey { get; set; }
        public virtual string Phone3CountryKey { get; set; }
        //I40[End]
    }

    public enum PriceLevel
	{
		A,
		B,
		C,
		D,
		MSRP,
    }
}
