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
        public string AppEntityName { get; set; }
        public bool IsSync { get; set; }
        public bool IsPublished { get; set; }
        public string DisConnectLabel { get; set; }
        public List<ConnectionType> AvailableConnections { get; set; }
        public string Visibility { get; set; }
        public int AvailableGroupConnections { get; set; }
        public int AvailableBusinessConnections { get; set; }
        public int AvailablePeopleConnections { get; set; }
        public long RelationId { get; set; }
    }
}