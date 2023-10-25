using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppContacts.Dtos
{
    public class AppContactAddressDto : EntityDto<long>
	{
		public virtual long AccountId { get; set; }
		public virtual long ContactId { get; set; }

		public virtual long AddressTypeId { get; set; }

		public virtual string AddressTypeIdName { get; set; }

		public virtual long AddressId { get; set; }

		public virtual string Code { get; set; }

		public virtual string Name { get; set; }

		public virtual string AddressLine1 { get; set; }

		public virtual string AddressLine2 { get; set; }

		public virtual string City { get; set; }

		public virtual string State { get; set; }

		public virtual string PostalCode { get; set; }

		public virtual long CountryId { get; set; }

		public virtual string CountryIdName { get; set; }

	}
}
