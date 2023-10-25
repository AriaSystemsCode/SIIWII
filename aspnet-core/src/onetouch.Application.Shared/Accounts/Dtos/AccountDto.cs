using Abp.Application.Services.Dto;
using onetouch.AccountInfos.Dtos;
using onetouch.Common;
using System.Collections.Generic;

namespace onetouch.Accounts.Dtos
{
    public class AccountDto : EntityDto<long>
    {
		public string Name { get; set; }

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

	}
}