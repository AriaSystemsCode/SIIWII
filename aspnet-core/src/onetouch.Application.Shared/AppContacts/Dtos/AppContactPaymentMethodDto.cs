using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppContacts.Dtos
{
    public class AppContactPaymentMethodDto : EntityDto<long>
	{

		public virtual string Description { get; set; }

		public virtual byte PaymentType { get; set; }

		public virtual bool IsDefault { get; set; }

		public virtual string CardNumber { get; set; }

		public virtual byte? CardType { get; set; }

		public virtual string CardHolderName { get; set; }

		public virtual string CardExpirationMonth { get; set; }

		public virtual string CardExpirationYear { get; set; }

		public virtual string SecurityCode { get; set; }

	}
}
