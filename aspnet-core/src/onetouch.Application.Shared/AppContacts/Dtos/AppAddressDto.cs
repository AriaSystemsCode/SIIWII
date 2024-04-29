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
using Abp.Application.Services.Dto;

namespace onetouch.AppContacts
{
    public class AppAddressDto : EntityDto<long>
	{
		public virtual string Code { get; set; }
		public int? TenantId { get; set; }
		//Mariam
		public long AccountId { get; set; }
		//Mariam
		public virtual string Name { get; set; }

		public virtual string AddressLine1 { get; set; }

		public virtual string AddressLine2 { get; set; }

		public virtual string City { get; set; }

		public virtual string State { get; set; }

		public virtual string PostalCode { get; set; }

		public virtual long? CountryId { get; set; }

		public virtual string CountryCode { get; set; }

		public virtual string CountryIdName { get; set; }
		 
		public bool UseDTOTenant { get; set; }

	}
}