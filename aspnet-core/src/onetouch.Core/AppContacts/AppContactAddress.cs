﻿using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppEntities;

namespace onetouch.AppContacts
{
	[Table("AppContactAddresses")]
    [Audited]
    public class AppContactAddress:Entity<long>
	{
		public virtual long ContactId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string ContactCode { get; set; }

		public virtual long AddressTypeId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string AddressTypeCode { get; set; }

		public virtual long AddressId { get; set; }

		[StringLength(SycEntityObjectClassificationConsts.MaxCodeLength, MinimumLength = SycEntityObjectClassificationConsts.MinCodeLength)]
		public virtual string AddressCode { get; set; }


		[ForeignKey("AddressTypeId")]
		public virtual AppEntity AddressTypeFk { get; set; }

		[ForeignKey("AddressId")]
		public virtual AppAddress AddressFk { get; set; }


		[ForeignKey("ContactId")]
		public virtual AppContact ContactFk { get; set; }

	}
}