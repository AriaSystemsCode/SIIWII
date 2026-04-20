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


namespace onetouch.AppMarketplaceAccounts
{
    public interface IMarketplaceAccountsAppService //: IApplicationService 
    {   
        Task<PagedResultDto<GetMarketplaceAccountForViewDto>> GetAll(GetAllAccountsInput input);
        Task<GetAccountForViewDto> GetAccountForView(long id, string ssin, int resultCount = 10);


    }
    public interface ICreateMarketplaceAccount //: IApplicationService
    {
        Task<long> CreateOrEditMarketplaceAccount(CreateOrEditMarketplaceAccountInfoDto input, bool sync);
         
        Task<bool> HideAccount(string SSIN);
        Task<string> CreateOrEditMarketplaceContactRelationship(string requesterSSIN, string recipientSSIN, bool? disconnect,bool? isPublic, long? connectionTypeId,long? disconnectRelationId);
        Task<bool> PublishMember(long contactId, long parentId, long personEntityObjectTypeId, long? mainAccountID, long newAccountID);

    }

}