using System.Security.Policy;

namespace onetouch.Accounts.Dtos
{
    public class GetAccountForViewDto
    {
		public AccountDto Account { get; set; }

        public string ConnectionName { get; set; }
        public int ConnectionCount { get; set; }
        
        public string AvaliableConnectionName { get; set; }

		public string AppEntityName { get; set;}

        //MMT10
        public bool IsPublished { get; set; }
        public bool IsSync { get; set; }
        //MMT10
    }
}
