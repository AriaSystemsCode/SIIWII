using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppMarketplaceContacts.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using onetouch.AccountInfos.Dtos;
using onetouch.Accounts.Dtos;
using onetouch.AppMarketplaceContacts;
using onetouch.AppMarketplaceContacts.Dtos;

namespace onetouch.AppMarketplaceAccounts
{
    public interface IMarketplaceAccountsAppService //: IApplicationService 
    {   Task<PagedResultDto<GetMarketplaceAccountForViewDto>> GetAll(GetAllAccountsInput input);



    }
    public interface ICreateMarketplaceAccount //: IApplicationService
    {
        Task<long> CreateOrEditMarketplaceAccount(CreateOrEditMarketplaceAccountInfoDto input, bool sync);
         
        Task<bool> HideAccount(string SSIN);


    }

}