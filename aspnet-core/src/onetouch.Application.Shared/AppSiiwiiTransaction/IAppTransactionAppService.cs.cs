using Abp.Application.Services;
using Abp.Application.Services.Dto;
using onetouch.AppItems.Dtos;
using onetouch.AppMarketplaceItems.Dtos;
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
        Task<GetAppTransactionsForViewDto> GetAppTransactionsForView(long transactionId, GetAllAppTransactionsInputDto? input, TransactionPosition? position);
        Task<PagedResultDto<GetAllAppTransactionsForViewDto>> GetAll(GetAllAppTransactionsInputDto input);
        Task<ShoppingCartSummary> GetCurrentUserActiveTransaction();
        Task<ShoppingCartSummary> GetBuyerSellerTransactions(string sellerSSIN, string buyerSSIN);
        Task<ShoppingCartSummary> ValidateBuyerSellerTransaction(string sellerSSIN, string buyerSSIN,
            TransactionType orderType);
        //Task<ShoppingCartSummary> ValidateActiveTransaction(TransactionType orderType);

        Task<bool> SetCurrentUserActiveTransaction(long OrderId);
        Task<bool> DeleteByProductSSIN(long orderId, long lineId);
        Task<bool> DeleteByProductSSINColor(long orderId, long lineId, string colorCode, long colorId);

        Task<bool> DeleteByProductLineId(long orderId,long lineId);

        Task<GetOrderDetailsForViewDto> GetOrderDetailsForView(long transactionId, bool ShowVariation, string colorCodeFilter, string sizeCodeFilter, string productCodeFilter);
        Task<bool> UpdateByProductLineId(long orderId, long lineId, Int32 qty);

        Task<bool> UpdateByProductSSINColor(long orderId, long parentId, string colorCode, long colorId, Int32 qty);
        Task AddTransactionDetails(GetAppMarketplaceItemDetailForViewDto input, string transactionId, string transactionType);

    }
}
