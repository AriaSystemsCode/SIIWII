using Abp.Application.Services.Dto;
using onetouch.AccountInfos.Dtos;
using onetouch.AppItems.Dtos;
using onetouch.Common;
using onetouch.SystemObjects.Dtos;
using System;
using System.Collections.Generic;

namespace onetouch.Accounts.Dtos
{
    public class AccountDto : EntityDto<long>
    {
		public string Name { get; set; }
        public bool ShowSync { get; set; }
        public int TenantId { get; set; }
        public string Description { get; set; }

		public int Connections { get; set; }

		public string Website { get; set; }

		public string EMailAddress { get; set; }

		public string City { get; set; }

		public string State { get; set; }

		public string ZipCode { get; set; }

		public string AddressLine1 { get; set; }

		public string AddressLine2 { get; set; }

		public long CountryId { get; set; }

		public string CountryName { get; set; }

        public string PriceLevel { get; set; }
        public string SSIN { get; set; }

        public long AccountTypeId { get; set; }

        public string AccountType { get; set; }

		public string AccountTypeString { get; set; }
		public bool Status { get; set; }

		public string[] Classfications { get; set; }

		public string[] Categories { get; set; }

		public string LogoUrl { get; set; }

		public string CoverUrl { get; set; }

		public string[] ImagesUrls { get; set; }

		public virtual string Phone1Number { get; set; }

		public bool IsManual { get; set; }

        public bool IsConnected { get; set; }

        public virtual IList<TreeNode<BranchForViewDto>> Branches { get; set; }

		public long? PartnerId { get; set; }
		
		public long? EntityId { get; set; }

		public long? ClassificationsTotalCount { get; set; }
		public long? CategoriesTotalCount { get; set; }
        //I46[Start]
        public virtual string ShipViaName { set; get; }
        public virtual string PaymentTermsName { set; get; }
        public virtual long? ShipViaId { set; get; }
        public virtual long? PaymentTermsId { set; get; }
        public virtual string Code { set; get; }
        public virtual long? CurrencyId { set; get; }
        public virtual string CurrencyCode { set; get; }
        public virtual string CurrencyName { set; get; }
        //I49[Start]
        public virtual string MarketplaceAccountRole{ get; set; }
        //I46[End]
    }
}