using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AppEntities.Dtos;

namespace onetouch.AccountInfos.Dtos
{
	public class GetAccountInfoForEditOutput
	{
		public CreateOrEditAccountInfoDto AccountInfo { get; set; }

		public string Phone1TypeName { get; set; }

		public string Phone2TypeName { get; set; }

		public string Phone3TypeName { get; set; }

		public string CurrencyName { get; set; }

		public string LanguageName { get; set; }
		public bool LastChangesIsPublished { get; set; }
	}
	//I46[Start]
	public class GetContactDefaultsOutput
	{
		public long? PaymentTermsId { set; get; }
        public long? ShipViaId { set; get; }
		public string ShipViaCode { set; get; }
        public string ShipViaName{ set; get; }
        public string PaymentTermsCode { set; get; }
        public string PaymentTermsName { set; get; }
    }
    //Iteration#46[Start]
    public class AppContactValidationInputDTO : CreateOrEditAccountInfoDto
    {

        public List<string> ErrorMessages { get; set; }

    }
    //Iteration#46[End]
    //I46[End]
}