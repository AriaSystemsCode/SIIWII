using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppTransactions.Dtos;
using onetouch.Dto;

namespace onetouch.AppTransactions
{
    public interface IAppTransactionsAppService : IApplicationService
    {
        Task<PagedResultDto<GetAppTransactionForViewDto>> GetAll(GetAllAppTransactionsInput input);

        Task<GetAppTransactionForViewDto> GetAppTransactionForView(int id);

        Task<GetAppTransactionForEditOutput> GetAppTransactionForEdit(EntityDto input);

        Task CreateOrEdit(CreateOrEditAppTransactionDto input);

        Task Delete(EntityDto input);

        Task<FileDto> GetAppTransactionsToExcel(GetAllAppTransactionsForExcelInput input);

    }
}