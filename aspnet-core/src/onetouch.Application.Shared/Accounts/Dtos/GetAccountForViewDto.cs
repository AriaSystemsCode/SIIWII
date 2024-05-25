namespace onetouch.Accounts.Dtos
{
    public class GetAccountForViewDto
    {
		public AccountDto Account { get; set; }

		public string AppEntityName { get; set;}

        //MMT10
        public bool IsPublished { get; set; }
        //MMT10
    }

    public class GetMarketplaceAccountForViewDto
    {
        public AccountDto Account { get; set; }

        public string AppEntityName { get; set; }

        //MMT10
        public bool IsPublished { get; set; }
        public string AllowedAction { get; set; }
        //MMT10
    }


}