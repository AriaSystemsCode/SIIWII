namespace onetouch.MarketplaceAccounts.Dtos
{
    public class GetAccountForViewDto
    {
		public AccountDto Account { get; set; }

		public string AppEntityName { get; set;}

        //MMT10
        public bool IsPublished { get; set; }
        //MMT10
    }
}