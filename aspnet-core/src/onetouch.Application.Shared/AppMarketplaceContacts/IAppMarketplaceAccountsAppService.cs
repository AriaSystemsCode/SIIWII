using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.Accounts.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using onetouch.AccountInfos.Dtos;

namespace onetouch.AppMarketplaceAccounts
{
    public interface IMarketplaceAccountsAppService : IApplicationService 
    {
        Task<PagedResultDto<GetAccountForViewDto>> GetAll(GetAllAccountsInput input);

       
	}
}