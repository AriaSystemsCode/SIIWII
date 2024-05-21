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
	[Table("AppMarketplaceAddresses")]
    [Audited]
    public class AppMarketplaceAddress : FullAuditedEntity<long>,IMayHaveTenant
	{
		public long AccountId { get; set; }
		public int? TenantId { get; set; }

		[StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
		public virtual string Code { get; set; }

		[StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
		public virtual string Name { get; set; }

		[StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
		public virtual string AddressLine1 { get; set; }

		[StringLength(AppAddressConsts.MaxNameLength, MinimumLength = AppAddressConsts.MinNameLength)]
		public virtual string AddressLine2 { get; set; }

		[StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
		public virtual string City { get; set; }

		[StringLength(AppAddressConsts.MaxStateLength, MinimumLength = AppAddressConsts.MinStateLength)]
		public virtual string State { get; set; }

		[StringLength(AppAddressConsts.MaxStateLength, MinimumLength = AppAddressConsts.MinStateLength)]
		public virtual string PostalCode { get; set; }

		public virtual long CountryId { get; set; }

		[StringLength(AppAddressConsts.MaxCodeLength, MinimumLength = AppAddressConsts.MinCodeLength)]
		public virtual string CountryCode { get; set; }

		[ForeignKey("CountryId")]
		public virtual AppEntity CountryFk { get; set; }
		

	}
}