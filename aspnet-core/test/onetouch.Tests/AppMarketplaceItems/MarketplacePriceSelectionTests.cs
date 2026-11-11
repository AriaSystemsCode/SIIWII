using onetouch.AppMarketplaceItems;
using Xunit;

namespace onetouch.Tests.AppMarketplaceItems
{
    public class MarketplacePriceSelectionTests
    {
        [Fact]
        public void Buyer_price_uses_exact_GBP_row_even_when_USD_is_default()
        {
            var prices = new[]
            {
                new AppMarketplaceItemPrices { Id = 2, Code = "BUYER-1", BuyerSSIN = "BUYER-1", CurrencyCode = "USD", Price = 12, IsDefault = true },
                new AppMarketplaceItemPrices { Id = 1, Code = "BUYER-1", BuyerSSIN = "BUYER-1", CurrencyCode = "GBP", Price = 9 },
                new AppMarketplaceItemPrices { Id = 3, Code = "BUYER-2", BuyerSSIN = "BUYER-2", CurrencyCode = "GBP", Price = 5 }
            };

            var selected = AppMarketplaceItemsAppService.SelectMarketplacePrice(prices, "", "GBP", "BUYER-1");

            Assert.Equal(9, selected.Price);
            Assert.Equal("BUYER-1", selected.BuyerSSIN);
        }

        [Fact]
        public void Buyer_price_accepts_imported_account_code_without_using_another_account()
        {
            var prices = new[]
            {
                new AppMarketplaceItemPrices { Code = "BUYER-1", BuyerSSIN = "BUYER-1", CurrencyCode = "GBP", Price = 17 },
                new AppMarketplaceItemPrices { Code = "BUYER-2", BuyerSSIN = "BUYER-2", CurrencyCode = "GBP", Price = 7 }
            };

            Assert.Equal(17, AppMarketplaceItemsAppService.SelectMarketplacePrice(prices, "", "GBP", "BUYER-1").Price);
            Assert.Null(AppMarketplaceItemsAppService.SelectMarketplacePrice(prices, "", "GBP", "BUYER-3"));
        }
    }
}
