using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Accounts.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using onetouch.AccountInfos.Dtos;

namespace onetouch.Accounts
{
    public interface IAccountsAppService : IApplicationService 
    {
        Task<PagedResultDto<GetAccountForViewDto>> GetAll(GetAllAccountsInput input);

        Task<GetAccountForViewDto> GetAccountForView(long id, int resultCount);

		Task<GetAccountInfoForEditOutput> GetAccountForEdit(EntityDto<long> input);

		Task<GetAccountInfoForEditOutput> CreateOrEditMyAccount(CreateOrEditAccountInfoDto input);

		Task<GetAccountInfoForEditOutput> CreateOrEditAccount(CreateOrEditAccountInfoDto input);

		Task Delete(EntityDto<long> input);

		//Task<FileDto> GetAccountsToExcel(GetAllAccountsForExcelInput input);

		
		Task<List<AccountAppEntityLookupTableDto>> GetAllAppEntityForTableDropdown();
		//Mariam[Start]
		Task DeleteContact(EntityDto input);
		Task<ContactDto> CreateOrEditContact(ContactDto input);
		Task<ContactForEditDto> GetContactForView(long input);
		//Mariam[End]
		Task<PagedResultDto<LookupAccountOrTenantDto>> GetTenantsWithManualAccounts(GetTenantsWithManualAccounts input);
		Task<PagedResultDto<LookupAccountOrTenantDto>> GetAccountByType(GetAccountsForDropdownInputDto input);
		Task<long> CreateOrUpdateAccountFromSourceAccount(CreateAccountsInputDto input);
	}
}