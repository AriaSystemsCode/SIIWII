using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AccountInfos.Dtos;
using onetouch.Dto;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Collections.Generic;


namespace onetouch.AccountInfos
{
    public interface IAccountInfoAppService : IApplicationService 
    {
		Task<GetAccountInfoForEditOutput> GetAccountInfoForEdit();

		Task<GetAccountInfoForEditOutput> CreateOrEdit(CreateOrEditAccountInfoDto input);

		Task<List<AccountInfoAppEntityLookupTableDto>> GetAllAppEntityForTableDropdown();
		
    }
}