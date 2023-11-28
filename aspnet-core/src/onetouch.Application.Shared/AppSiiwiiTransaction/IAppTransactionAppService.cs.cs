using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppItems.Dtos;
using onetouch.AppSiiwiiTransaction.Dtos;
using onetouch.AppTransactions.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppSiiwiiTransaction
{
    public interface IAppTransactionAppService : IApplicationService
    {
        Task<long> CreateOrEdit(CreateOrEditAppTransactionsDto input);
        Task<GetAppTransactionsForViewDto> GetAppTransactionsForView(long transactionId);
        Task<PagedResultDto<GetAllAppTransactionsForViewDto>> GetAll(GetAllAppTransactionsInputDto input);
        

    }
}
