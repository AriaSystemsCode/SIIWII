using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppMarketplaceContacts.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using onetouch.AccountInfos.Dtos;
using onetouch.Accounts.Dtos;

namespace onetouch.AppMarketplaceAccounts
{
    public interface IMarketplaceAccountsAppService : IApplicationService 
    {   Task<PagedResultDto<GetMarketplaceAccountForViewDto>> GetAll(GetAllAccountsInput input);



    }
}