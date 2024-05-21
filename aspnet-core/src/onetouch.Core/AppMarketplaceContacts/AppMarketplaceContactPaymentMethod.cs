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

namespace onetouch.AppMarketplaceContacts
{
	[Table("AppMarketplaceContactPaymentMethods")]
    [Audited]
    public class AppMarketplaceContactPaymentMethod : FullAuditedEntity<long>,IMustHaveTenant
	{
		public int TenantId { get; set; }

		public long ContactId { get; set; }

		[StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
		public virtual string ContactCode { get; set; }

		public virtual string Description { get; set; }

		public virtual byte PaymentType { get; set; }

		public virtual bool IsDefault { get; set; }

		[StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
		public virtual string CardNumber { get; set; }

		public virtual byte CardType { get; set; }

		[StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
		public virtual string CardHolderName { get; set; }

		[StringLength(2, MinimumLength = 2)]
		public virtual string CardExpirationMonth { get; set; }

		[StringLength(4, MinimumLength = 4)]
		public virtual string CardExpirationYear { get; set; }


		public virtual string CardProfileToken { get; set; }

		public virtual string CardPaymentToken { get; set; }

		[ForeignKey("ContactId")]
		public virtual AppContact ContactFk { get; set; }

	}
}