using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppSiiwiiTransaction.Dtos
{
    public class GetAppTransactionsForViewDto:CreateOrEditAppTransactionsDto
    {

    }
    public class GetAllAppTransactionsForViewDto : GetAppTransactionsForViewDto
    {
        public DateTime CreationTime { get; set; }
        public string EntityObjectStatusCode { get; set;}
    }

    public class ShoppingCartSummary
    {
        public long ShoppingCartId { get; set; }
        public string SellerLogo { get; set; }
        public string BuyerLogo { get; set;}

        public string SellerSSIN { get; set; }
        public string BuyerSSIN { get; set; }


        public double Qty  { get; set; }
        public decimal Amount { get; set; }

        public ValidateTransaction ValidateOrder { get; set; }

    }

    public enum ValidateTransaction
    {
        FoundShoppingCart,
        FoundInAnotherTransaction,
        NotFound
    }
    
}
