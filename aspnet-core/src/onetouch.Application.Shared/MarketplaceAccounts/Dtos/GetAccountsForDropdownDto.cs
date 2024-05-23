using Abp.Application.Services.Dto;
using onetouch.AccountInfos.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.MarketplaceAccounts.Dtos
{
    public class GetAccountForDropdownDto : EntityDto<long>
    {
        public string Name { get; set; }

        public string ImgURL { get; set; }
    }

    public class GetAccountsForDropdownInputDto : PagedAndSortedResultRequestDto
    {
        public SourceAccountEnum AccountType { get; set; }

        public long TenantId { get; set; }
        public string AccountSearchable { get; set; }

    }

    public class GetTenantsWithManualAccounts : PagedAndSortedResultRequestDto
    {
        public string TenantSearchable { get; set; }
    }


    public class CreateAccountsInputDto : PagedAndSortedResultRequestDto
    {
        public SourceAccountEnum SourceAccountType { get; set; }
        public TargetAccountEnum TargetAccountType { get; set; }
        public long SourceAccountId { get; set; }
        public long TargetAccountId { get; set; }

        public long? SourceTenantId { get; set; }
        public long? TargetTenantId { get; set; }

        public bool DeleteSourceAccount { get; set; }
        public bool DeleteTargetAccount { get; set; }
    }

    public class LookupAccountOrTenantDto
    {
        public long Id { get; set; }

        public string DisplayName { get; set; }
    }
}
