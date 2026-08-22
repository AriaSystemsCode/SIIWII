using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Accounts.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using onetouch.AccountInfos.Dtos;
using onetouch.AppContacts;
using onetouch.Globals.Dtos;

namespace onetouch.Accounts
{
    public interface IAccountsAppService : IApplicationService 
    {
        Task<PagedResultDto<GetAccountForViewDto>> GetAll(GetAllAccountsInput input);
        Task<bool> GetSettingValue(string settingName, string ssin);

        Task<PagedResultDto<GetAccountForViewDto>> GetAllMyConnections(GetAllAccountsInput input);

        Task<GetAccountForViewDto> GetAccountForView(long id, int resultCount);

		Task<GetAccountInfoForEditOutput> GetAccountForEdit(EntityDto<long> input);

		Task<GetAccountInfoForEditOutput> CreateOrEditMyAccount(CreateOrEditAccountInfoDto input);

		Task<GetAccountInfoForEditOutput> CreateOrEditAccount(CreateOrEditAccountInfoDto input);

        Task<bool> UpdateConnectedAccountPriceLevel(long id, string priceLevel);

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
		//I40[Start]
		Task<CreateOrEditAccountInfoDto> GetAppContactForView(long input);
        Task<ContactDto> CreateOrUpdateContact(CreateOrEditAccountInfoDto accountDto);
        //I40[End]
    
		Task<AppAddressDto> CreateOrEditAddress(AppAddressDto input);
		//I45
		Task ConnectContactsProfiles(long id, int? tenantId = null,bool? sync = false);
        Task<BranchDto> CreateOrEditBranch(BranchDto input);
		//I45
		//I46[Start]
		Task<GetContactDefaultsOutput> GetContactDefaults();
		Task<List<ImportContactReturnDto>> ImportContact(List<AccountExcelDto> contactExcelDtoList, string repeatHandler);
		//I46[End]

    }
}