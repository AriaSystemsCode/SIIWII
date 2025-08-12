using onetouch.AppMarketplaceContacts.Dtos;
using System.Collections.Generic;

namespace onetouch.Accounts.Dtos
{
    public class GetAccountForViewDto
    {
		public AccountDto Account { get; set; }
        public ContactDto Contact { get; set; }
        public string ConnectionName { get; set; }
        public int ConnectionCount { get; set; }
        
        public string AvaliableConnectionName { get; set; }

		public string AppEntityName { get; set;}
        public bool IsSync { get; set; }

        //MMT10
        public bool IsPublished { get; set; }
        //MMT10
        //I40[Start]
        public string DisConnectLabel { get; set; }
        public List<ConnectionType> AvailableConnections { get; set; }
        //I40[End]

    }
}